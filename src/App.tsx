/**
 * NEXUS - Asistente Académico Institucional
 * Instituto Nacional Cantón Lourdes (INDEL)
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, ShieldCheck, AlertCircle, ArrowDown, ZoomIn } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { ChatMessage, Message } from './components/ChatMessage.tsx';
import { NormativeModal } from './components/NormativeModal.tsx';
import { ContactModal } from './components/ContactModal.tsx';
import { INSTITUTION_INFO } from './data/institutionKnowledge.ts';
import { useSpeechInput, MicButton } from './voiceInput.tsx';

const INITIAL_WELCOME: Message = {
  id: 'welcome-msg',
  role: 'model',
  text: `¡Hola! Soy **NEXUS**, el asistente virtual oficial del **Instituto Nacional Cantón Lourdes (INDEL)**.

Estoy aquí para responder dudas de estudiantes, referentes de familia, docentes y visitantes basándome de forma estricta y transparente en la normativa institucional.

Puedes preguntarme de forma natural, por ejemplo:
• "¿A qué hora es la entrada y salida de clases?"
• "¿Cómo puedo evitar faltas o castigos?"
• "¿Por qué me pueden poner deméritos o reportes?"
• "¿Me pueden suspender por una falta grave?"
• "Reglas sobre el uniforme, corte de cabello y uso del celular"

📌 Fuente: Compendio Normativo Institucional`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_QUESTIONS = [
  '¿Qué pasa si cometo una falta?',
  '¿Se puede mascar chicle o comer en clase?',
  '¿A qué hora es la entrada y salida de clases?',
  '¿Cómo puedo evitar faltas o problemas?',
  '¿Por qué me pueden poner deméritos o reportes?',
  '¿Me pueden echar o suspender por una falta grave?',
  '¿Qué pasa si un profesor me dice malas palabras?',
  '¿Cuáles son las reglas sobre el uniforme y el celular?',
  '¿Cuántas horas sociales debo hacer?',
  '¿Qué venden en la cafetería?',
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNormatives, setShowNormatives] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [bigText, setBigText] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Modo presentación: agranda toda la letra (los tamaños de Tailwind se escalan con la letra base)
  useEffect(() => {
    document.documentElement.style.fontSize = bigText ? '125%' : '';
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [bigText]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 150);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for server
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error('Error de comunicación con el servidor institucional.');
      }

      const data = await res.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Lo siento, no encuentro información específica sobre esto en la documentación oficial actual del INDEL.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        text: 'Lo siento, ocurrió una dificultad temporal al procesar la consulta. Por favor, reintente en unos segundos.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dictado por voz: al terminar de hablar, el texto reconocido se envía como una pregunta normal
  const {
    supported: voiceSupported,
    listening,
    interim,
    error: voiceError,
    toggle: toggleVoice,
  } = useSpeechInput((text) => {
    handleSendMessage(text);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_WELCOME,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Institutional Top Navigation */}
      <Header
        onOpenNormatives={() => setShowNormatives(true)}
        onOpenContact={() => setShowContact(true)}
        onResetChat={handleResetChat}
      />

      {/* Main Chat Feed */}
      <main
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-6"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Institutional Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    SISTEMA DE ASISTENCIA REGLAMENTARIA
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {INSTITUTION_INFO.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Sede: {INSTITUTION_INFO.address} • Tel: {INSTITUTION_INFO.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowNormatives(true)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                Explorar Normativa Completa
              </button>
            </div>
          </div>

          {/* Quick FAQ Suggestion Chips if initial */}
          {messages.length <= 2 && (
            <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Consultas Frecuentes de la Comunidad Educativa
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="text-left p-3 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-950 transition-all cursor-pointer flex items-center justify-between group disabled:opacity-50"
                  >
                    <span className="line-clamp-2">{q}</span>
                    <span className="text-slate-300 group-hover:text-blue-600 font-bold ml-2 transition-transform group-hover:translate-x-0.5 shrink-0">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render All Chat Messages */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 my-4 max-w-4xl mx-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-900 border border-blue-700/60 text-amber-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-5 py-4 text-sm text-slate-600 shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Consultando, por favor espera...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="relative max-w-4xl mx-auto w-full">
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute -top-12 right-6 p-2 rounded-full bg-blue-950 text-white shadow-lg hover:bg-blue-900 transition-all cursor-pointer border border-blue-800"
            title="Ir al último mensaje"
            aria-label="Ir al último mensaje"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sticky Bottom Input Bar */}
      <footer className="bg-white border-t border-slate-200/90 py-3 sm:py-4 px-3 sm:px-6 shadow-xs">
        <div className="max-w-4xl mx-auto">
          {/* Quick Guidance Tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
              Respuestas oficiales y citadas estrictamente del compendio reglamentario.
            </span>
            <span className="flex items-center gap-3">
              <span className="hidden sm:inline">Presiona Enter para enviar • Shift + Enter para salto de línea</span>
              <button
                type="button"
                onClick={() => setBigText((v) => !v)}
                aria-pressed={bigText}
                title="Letra grande para pantalla de presentación"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                {bigText ? 'Letra normal' : 'Letra grande'}
              </button>
            </span>
          </div>

          {/* Voice status */}
          {(listening || voiceError) && (
            <div className="mb-2 px-1 text-xs flex items-center gap-2" role="status" aria-live="polite">
              {listening ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-slate-700">
                    Escuchando: <span className="font-medium">{interim || 'habla ahora…'}</span>
                  </span>
                </>
              ) : (
                <span className="text-red-700">{voiceError}</span>
              )}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2 bg-slate-50 border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-1.5 sm:p-2 transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Haz tu consulta sobre normas, uniforme, inasistencias, faltas, docentes o procesos..."
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden max-h-32 min-h-[40px]"
              style={{
                height: 'auto',
                minHeight: '40px',
              }}
            />

            <MicButton
              supported={voiceSupported}
              listening={listening}
              onClick={toggleVoice}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Enviar mensaje"
            >
              <span className="hidden sm:inline">Preguntar</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Institutional Compliance Notice */}
          <div className="text-center text-[11px] text-slate-400 mt-2">
            NEXUS • Instituto Nacional Cantón Lourdes (INDEL) • Colón, La Libertad
          </div>
        </div>
      </footer>

      {/* Normative Documents Browser Modal */}
      <NormativeModal
        isOpen={showNormatives}
        onClose={() => setShowNormatives(false)}
        onSelectQuestion={(q) => handleSendMessage(q)}
      />

      {/* Institutional Contacts Modal */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </div>
  );
}
