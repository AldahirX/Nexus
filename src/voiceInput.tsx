import { useCallback, useEffect, useRef, useState } from 'react';

// Dictado por voz con la Web Speech API del navegador (sin instalar nada).
// Funciona en Chrome, Edge y Chrome para Android. Necesita HTTPS (o localhost) y permiso de micrófono.
// OJO: Chrome manda el audio a un servicio en línea, así que el dictado NO funciona sin internet.

const SpeechRecognitionCtor: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

function friendlyError(code: string): string | null {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Permiso de micrófono denegado. Actívalo en el candado de la barra de direcciones.';
    case 'no-speech':
      return 'No te escuché. Intenta de nuevo.';
    case 'audio-capture':
      return 'No se encontró ningún micrófono.';
    case 'network':
      return 'El dictado por voz necesita internet.';
    case 'aborted':
      return null;
    default:
      return 'No se pudo usar el micrófono.';
  }
}

/**
 * onFinalText se llama una sola vez, cuando la persona termina de hablar,
 * con el texto reconocido (por ejemplo: "a qué hora es el recreo").
 */
export function useSpeechInput(onFinalText: (text: string) => void, lang = 'es-SV') {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);
  const callbackRef = useRef(onFinalText);
  callbackRef.current = onFinalText; // siempre la versión más reciente

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* nada */
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setError('Tu navegador no permite dictado por voz. Usa Chrome o Edge.');
      return;
    }
    if (recRef.current) return; // ya está escuchando

    setError(null);
    setInterim('');

    const rec = new SpeechRecognitionCtor();
    rec.lang = lang;
    rec.interimResults = true; // muestra el texto mientras hablas
    rec.continuous = false; // se detiene solo al terminar la frase
    rec.maxAlternatives = 1;

    let finalText = '';

    rec.onstart = () => setListening(true);
    rec.onresult = (e: any) => {
      let partial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else partial += r[0].transcript;
      }
      setInterim((finalText + partial).trim());
    };
    rec.onerror = (e: any) => setError(friendlyError(e.error));
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      setInterim('');
      const text = finalText.trim();
      if (text) callbackRef.current(text);
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch {
      recRef.current = null;
      setError('No se pudo iniciar el micrófono.');
    }
  }, [lang]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* nada */
    }
  }, []);

  const toggle = useCallback(() => {
    if (recRef.current) stop();
    else start();
  }, [start, stop]);

  return { supported: !!SpeechRecognitionCtor, listening, interim, error, start, stop, toggle };
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
  return (
    <>
      <style>{`
        @keyframes nexus-mic-pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.55); }
          70% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
      `}</style>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? 'Detener dictado' : 'Hablar con Nexus'}
        title={listening ? 'Toca para detener' : 'Toca y habla'}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: listening ? '#dc2626' : '#2563eb',
          animation: listening ? 'nexus-mic-pulse 1.2s infinite' : 'none',
          opacity: disabled ? 0.5 : 1,
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

/*
 * EJEMPLO DE USO dentro de tu componente de chat:
 *
 *   import { useSpeechInput, MicButton } from './voiceInput';
 *
 *   const { supported, listening, interim, error, toggle } = useSpeechInput((text) => {
 *     sendMessage(text); // la misma función que usas al presionar "Enviar"
 *   });
 *
 *   // junto al campo de texto:
 *   <MicButton supported={supported} listening={listening} onClick={toggle} disabled={isLoading} />
 *   {listening && <p>{interim || 'Escuchando…'}</p>}
 *   {error && <p>{error}</p>}
 */
