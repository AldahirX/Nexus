import React from 'react';
import { BookOpen, PhoneCall, RefreshCw, ShieldCheck } from 'lucide-react';
import { INSTITUTION_INFO } from '../data/institutionKnowledge.ts';

interface HeaderProps {
  onOpenNormatives: () => void;
  onOpenContact: () => void;
  onResetChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNormatives,
  onOpenContact,
  onResetChat,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Left: Branding & Seal */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 border border-blue-400/30 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                NEXUS
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-700">
                  OFICIAL
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              {INSTITUTION_INFO.name} ({INSTITUTION_INFO.acronym})
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNormatives}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Consultar Documentos Oficiales"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Normativa Oficial</span>
          </button>

          <button
            onClick={onOpenContact}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Información y Contacto Institucional"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Contacto</span>
          </button>

          <button
            onClick={onResetChat}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reiniciar conversación"
            aria-label="Reiniciar conversación"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
