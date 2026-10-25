import { useCallback, useEffect, useRef, useState } from 'react';

// Dictado por voz con la Web Speech API del navegador (sin instalar nada).
// Funciona mejor en Chrome. En Edge puede fallar según la versión. Brave lo bloquea.
// Necesita HTTPS (o localhost), permiso de micrófono e internet (el audio se procesa en un servicio en línea).
// En los navegadores internos de Facebook, WhatsApp o Instagram suele fallar: hay que abrir el enlace en Chrome.

const SpeechRecognitionCtor: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

// Idioma por defecto (el que funcionaba antes). Si falla, se prueba es-MX.
const DEFAULT_LANG = 'es-SV';
const BACKUP_LANG = 'es-MX';

// Tiempos (en milisegundos)
const START_CHECK_MS = 6000; // si el micrófono no abre en este tiempo, se avisa
const NO_SPEECH_MS = 8000; // tiempo para empezar a hablar después de que el micrófono abre
const SILENCE_MS = 2200; // silencio después de hablar para dar por terminada la frase
const MAX_LISTEN_MS = 25000; // límite de seguridad por si el micrófono queda abierto
const FORCE_CLOSE_MS = 3000; // si pedimos detener y el navegador no responde, se fuerza el cierre

// Ponlo en true para ver en la consola qué eventos llegan del micrófono
const DEBUG = false;
const log = (...args: unknown[]) => {
  if (DEBUG) console.log('[voz]', ...args);
};

// Brave bloquea el dictado: se detecta una vez al cargar para avisar con claridad
let braveDetected = false;
if (typeof navigator !== 'undefined' && (navigator as any).brave?.isBrave) {
  Promise.resolve((navigator as any).brave.isBrave())
    .then((r: boolean) => {
      braveDetected = !!r;
    })
    .catch(() => {
      /* nada */
    });
}

// Configuración que funcionó la última vez en esta sesión (para no repetir intentos fallidos)
let preferredAttempt = 0;

export type VoiceStatus = 'idle' | 'starting' | 'waiting' | 'hearing';

/** Textos listos para mostrar según el estado del micrófono. */
export const VOICE_STATUS_TEXT: Record<VoiceStatus, string> = {
  idle: '',
  starting: 'Preparando el micrófono…',
  waiting: 'Habla ahora…',
  hearing: 'Te estoy escuchando…',
};

const NO_SPEECH_MSG = 'No te escuché. Habla más cerca del micrófono o sube el volumen, y vuelve a intentar.';
const NO_MIC_OPEN_MSG =
  'El micrófono no se abrió. Revisa el permiso del sitio y que otra app no lo esté usando.';
const BRAVE_MSG = 'Brave bloquea el dictado por voz. Abre NEXUS en Chrome o Edge, o escribe tu pregunta.';
const OFFLINE_MSG = 'No hay conexión a internet. El dictado por voz la necesita.';

function friendlyError(code: string): string | null {
  switch (code) {
    case 'not-allowed':
      return 'Permiso de micrófono denegado. Actívalo en el candado de la barra de direcciones.';
    case 'service-not-allowed':
      return 'El dictado no está disponible en este navegador o dispositivo. En iPhone, activa Siri y el dictado en Ajustes, o escribe tu pregunta.';
    case 'no-speech':
      return NO_SPEECH_MSG;
    case 'audio-capture':
      return 'No se encontró un micrófono, o otra app lo está usando.';
    case 'network':
      return typeof navigator !== 'undefined' && navigator.onLine === false
        ? OFFLINE_MSG
        : 'El servicio de voz de tu navegador no respondió. Prueba en Chrome o escribe tu pregunta.';
    case 'language-not-supported':
      return 'Tu navegador no reconoce el dictado en español. Escribe tu pregunta.';
    case 'aborted':
      return null;
    default:
      return 'No se pudo usar el micrófono.';
  }
}

/**
 * Une los fragmentos que devuelve el reconocimiento de voz sin repetir texto.
 * Algunas versiones de Chrome para Android devuelven resultados acumulativos
 * ("hola", "hola cómo", "hola cómo estás") y, al sumarlos, el texto salía repetido.
 */
function joinTranscripts(parts: string[]): string {
  let out = '';
  for (const raw of parts) {
    const t = raw.trim();
    if (!t) continue;
    if (!out) {
      out = t;
      continue;
    }
    const a = out.toLowerCase();
    const b = t.toLowerCase();
    if (b.startsWith(a)) out = t; // resultado acumulativo: reemplaza
    else if (a.endsWith(b)) continue; // fragmento repetido: se ignora
    else out += ' ' + t;
  }
  return out;
}

function detach(rec: any) {
  rec.onstart = null;
  rec.onaudiostart = null;
  rec.onspeechstart = null;
  rec.onresult = null;
  rec.onerror = null;
  rec.onend = null;
}

type Attempt = { lang: string; continuous: boolean };

/**
 * onFinalText se llama una sola vez, cuando la persona termina de hablar,
 * con el texto reconocido (por ejemplo: "a qué hora es el recreo").
 *
 * status: 'starting' (abriendo micrófono), 'waiting' (listo, habla ahora),
 *         'hearing' (detectó voz) o 'idle' (apagado).
 *
 * Si el navegador da error de red o de idioma, prueba solo otras configuraciones
 * (escucha continua, escucha de una frase, otro idioma) antes de rendirse.
 */
export function useSpeechInput(onFinalText: (text: string) => void, lang = DEFAULT_LANG) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const stopRef = useRef<(() => void) | undefined>(undefined);
  const statusRef = useRef<VoiceStatus>('idle');
  const stoppingRef = useRef(false);
  const timersRef = useRef<Record<string, number>>({});
  const callbackRef = useRef(onFinalText);

  // siempre la versión más reciente de la función
  useEffect(() => {
    callbackRef.current = onFinalText;
  });

  const updateStatus = useCallback((s: VoiceStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const clearTimer = useCallback((name: string) => {
    const t = timersRef.current[name];
    if (t !== undefined) {
      window.clearTimeout(t);
      delete timersRef.current[name];
    }
  }, []);

  const clearTimers = useCallback(() => {
    Object.values(timersRef.current).forEach((t) => window.clearTimeout(t));
    timersRef.current = {};
  }, []);

  const setTimer = useCallback(
    (name: string, fn: () => void, ms: number) => {
      clearTimer(name);
      timersRef.current[name] = window.setTimeout(fn, ms);
    },
    [clearTimer]
  );

  // Al salir de la pantalla: se cierra el micrófono SIN enviar nada ni tocar el estado
  useEffect(() => {
    return () => {
      clearTimers();
      const rec = recRef.current;
      recRef.current = null;
      stopRef.current = undefined;
      if (rec) {
        detach(rec);
        try {
          rec.abort();
        } catch {
          /* nada */
        }
      }
    };
  }, [clearTimers]);

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setError('Tu navegador no permite dictado por voz. Usa Chrome o Edge.');
      return;
    }
    if (braveDetected) {
      setError(BRAVE_MSG);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError(OFFLINE_MSG);
      return;
    }
    if (recRef.current) return; // ya está escuchando

    setError(null);
    setInterim('');

    // Configuraciones que se prueban en orden si el navegador da error de red o de idioma
    const attempts: Attempt[] = [
      { lang, continuous: true }, // no se corta en la primera pausa
      { lang, continuous: false }, // una sola frase (más compatible)
      { lang: BACKUP_LANG, continuous: false }, // otro idioma
    ];

    // Siguiente configuración a probar después de un error; -1 si ya no quedan
    const nextIndex = (i: number, code: string): number => {
      if (code === 'language-not-supported') {
        for (let j = i + 1; j < attempts.length; j++) {
          if (attempts[j].lang !== attempts[i].lang) return j;
        }
        return -1;
      }
      return i + 1 < attempts.length ? i + 1 : -1;
    };

    const begin = (index: number, restartsLeft: number) => {
      const cfg = attempts[index];
      const rec = new SpeechRecognitionCtor();
      rec.lang = cfg.lang;
      rec.interimResults = true; // muestra el texto mientras hablas
      rec.continuous = cfg.continuous;
      rec.maxAlternatives = 1;
      log('intento', index, cfg);

      let finalText = '';
      let latestText = '';
      let useLatest = false;
      let nextAttempt = -1;
      let hadError = false;
      let heardSomething = false;
      let delivered = false;

      const deliver = () => {
        const text = (finalText.trim() || (useLatest ? latestText.trim() : '')).trim();
        if (text && !delivered) {
          delivered = true;
          if (index > 0) preferredAttempt = index; // recuerda la configuración que sí funcionó
          callbackRef.current(text);
        }
      };

      // Pide detener el micrófono; si el navegador no responde, fuerza el cierre
      const requestStop = () => {
        if (recRef.current !== rec) return;
        stoppingRef.current = true;
        clearTimer('silence');
        clearTimer('noSpeech');
        clearTimer('startCheck');
        clearTimer('max');
        try {
          rec.stop();
        } catch {
          /* nada */
        }
        setTimer(
          'force',
          () => {
            if (recRef.current !== rec) return;
            detach(rec);
            try {
              rec.abort();
            } catch {
              /* nada */
            }
            recRef.current = null;
            stopRef.current = undefined;
            clearTimers();
            setInterim('');
            updateStatus('idle');
            deliver();
          },
          FORCE_CLOSE_MS
        );
      };

      rec.onstart = () => log('start');

      // El micrófono ya está abierto: la persona puede hablar
      rec.onaudiostart = () => {
        log('audiostart');
        clearTimer('startCheck');
        if (statusRef.current === 'starting') updateStatus('waiting');
        setTimer(
          'noSpeech',
          () => {
            setError(NO_SPEECH_MSG);
            requestStop();
          },
          NO_SPEECH_MS
        );
      };

      // El navegador detectó voz
      rec.onspeechstart = () => {
        log('speechstart');
        heardSomething = true;
        clearTimer('noSpeech');
        updateStatus('hearing');
      };

      rec.onresult = (e: any) => {
        heardSomething = true;
        clearTimer('noSpeech');
        updateStatus('hearing');

        // Se recalcula desde cero en cada evento (en vez de ir sumando),
        // para que un mismo resultado que llega dos veces no se repita.
        const finals: string[] = [];
        const all: string[] = [];
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          const t = r[0]?.transcript ?? '';
          all.push(t);
          if (r.isFinal) finals.push(t);
        }
        finalText = joinTranscripts(finals);
        latestText = joinTranscripts(all);
        setInterim(latestText);
        log('result', latestText);

        // Cada vez que llega texto se reinicia la espera de silencio; al terminar de hablar, se cierra solo
        setTimer('silence', requestStop, SILENCE_MS);
      };

      rec.onerror = (e: any) => {
        const code: string = e.error;
        log('error', code);

        // Error de red o de idioma antes de oír nada: se prueba otra configuración
        if ((code === 'network' || code === 'language-not-supported') && !heardSomething) {
          const next = nextIndex(index, code);
          if (next !== -1) {
            nextAttempt = next;
            return;
          }
          preferredAttempt = 0; // ya no quedan opciones: la próxima vez se empieza desde cero
        }

        // Algunos navegadores dan error de red justo al final, con la frase ya reconocida: se usa lo que se oyó
        if (code === 'network' && heardSomething && latestText.trim()) {
          useLatest = true;
          return;
        }

        hadError = true;
        setError(friendlyError(code));
      };

      rec.onend = () => {
        log('end');
        clearTimers();
        detach(rec);
        recRef.current = null;
        stopRef.current = undefined;
        setInterim('');

        if (nextAttempt !== -1) {
          begin(nextAttempt, restartsLeft);
          return;
        }

        // Algunos celulares cierran el micrófono apenas lo abren, sin error ni texto: se reintenta una vez
        if (!stoppingRef.current && !hadError && !heardSomething && !finalText.trim() && restartsLeft > 0) {
          log('reinicio automático');
          begin(index, restartsLeft - 1);
          return;
        }

        updateStatus('idle');
        deliver();
      };

      stoppingRef.current = false;
      updateStatus('starting');
      recRef.current = rec;
      stopRef.current = requestStop;

      try {
        rec.start();
      } catch {
        recRef.current = null;
        stopRef.current = undefined;
        detach(rec);
        updateStatus('idle');
        setError('No se pudo iniciar el micrófono.');
        return;
      }

      // Si el micrófono nunca abre, se avisa en vez de quedarse en silencio
      setTimer(
        'startCheck',
        () => {
          if (statusRef.current === 'starting') {
            setError(NO_MIC_OPEN_MSG);
            requestStop();
          }
        },
        START_CHECK_MS
      );
      // Límite de seguridad general
      setTimer('max', requestStop, MAX_LISTEN_MS);
    };

    begin(Math.min(preferredAttempt, attempts.length - 1), 1);
  }, [lang, clearTimer, clearTimers, setTimer, updateStatus]);

  const stop = useCallback(() => {
    stopRef.current?.();
  }, []);

  const toggle = useCallback(() => {
    if (recRef.current) stop();
    else start();
  }, [start, stop]);

  return {
    supported: !!SpeechRecognitionCtor,
    listening: status !== 'idle',
    status,
    interim,
    error,
    start,
    stop,
    toggle,
  };
}

/** Botón de micrófono. No se muestra si el navegador no soporta voz. */
export function MicButton({
  listening,
  supported,
  onClick,
  disabled,
}: {
  listening: boolean;
  supported: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  if (!supported) return null;
  // Si ya está escuchando, siempre se puede tocar para detenerlo
  const blocked = !!disabled && !listening;
  return (
    <>
      <style>{`
        @keyframes nexus-mic-pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.55); }
          70% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .nexus-mic-listening { animation: nexus-mic-pulse 1.2s infinite; }
        .nexus-mic:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .nexus-mic-listening { animation: none; }
        }
      `}</style>
      <button
        type="button"
        onClick={onClick}
        disabled={blocked}
        aria-pressed={listening}
        aria-label={listening ? 'Detener dictado' : 'Hablar con Nexus'}
        title={listening ? 'Toca para detener' : 'Toca y habla'}
        className={listening ? 'nexus-mic nexus-mic-listening' : 'nexus-mic'}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          cursor: blocked ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: listening ? '#dc2626' : '#2563eb',
          opacity: blocked ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
        </svg>
      </button>
    </>
  );
}
