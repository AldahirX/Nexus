import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Check, Copy, Volume2, VolumeX, ShieldCheck, User } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

// Limpia markdown y emojis para copiar o leer en voz alta
const stripMarkdown = (t: string) =>
  t
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/📌/g, '');

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stripMarkdown(message.text));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(message.text));
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Extraer la fuente si existe: "📌 Fuente: [Documento]" o "Fuente: [Documento]"
  const lines = message.text.split('\n');
  const sourceLineIndex = lines.findIndex((l) => {
    const t = l.replace(/\*/g, '').trim().toLowerCase();
    return t.startsWith('📌 fuente:') || t.startsWith('fuente:') || t.startsWith('📌fuente:');
  });

  let mainBody = message.text;
  let sourceText: string | null = null;

  if (sourceLineIndex !== -1) {
    sourceText = lines[sourceLineIndex]
      .replace(/\*/g, '')
      .replace(/^[📌\s]*fuente:\s*/i, '')
      .trim();
    mainBody = lines.filter((_, idx) => idx !== sourceLineIndex).join('\n').trim();
  }

  return (
    <div
      className={`flex gap-3 sm:gap-4 my-4 max-w-4xl mx-auto ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-slate-700 text-white'
            : 'bg-blue-900 border border-blue-700/60 text-amber-300'
        }`}
      >
        {isUser ? <User className="w-5 h-5 text-slate-200" /> : <ShieldCheck className="w-5 h-5" />}
      </div>

      {/* Bubble container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-600">
            {isUser ? 'Tú' : 'NEXUS • Asistente Institucional'}
          </span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-sm sm:text-base leading-relaxed shadow-sm ${
            isUser
              ? 'bg-blue-950 text-white rounded-tr-xs'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
          }`}
        >
          {/* Contenido principal con markdown renderizado */}
          <div className="space-y-2">
            {isUser ? (
              <div className="whitespace-pre-line">{mainBody}</div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkBreaks]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-blue-950">{children}</strong>
                  ),
                }}
              >
                {mainBody}
              </ReactMarkdown>
            )}
          </div>

          {/* Source Citation Badge */}
          {sourceText && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                <span className="text-sm">📌</span>
                <span>Fuente: {sourceText}</span>
              </span>
            </div>
          )}
        </div>

        {/* Footer controls for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copiar respuesta"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            {'speechSynthesis' in window && (
              <button
                onClick={handleToggleVoice}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                title={isPlayingAudio ? 'Detener lectura' : 'Escuchar respuesta'}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-600 font-medium">Pausar</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};