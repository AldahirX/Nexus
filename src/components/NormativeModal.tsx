import React, { useState } from 'react';
import { X, Search, BookOpen, GraduationCap, Users, Briefcase, FileText } from 'lucide-react';
import { NORMATIVE_DOCS, NormativeSection } from '../data/institutionKnowledge.ts';

interface NormativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion?: (question: string) => void;
}

export const NormativeModal: React.FC<NormativeModalProps> = ({ isOpen, onClose, onSelectQuestion }) => {
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredDocs = NORMATIVE_DOCS.filter((doc) => {
    const matchesTab = activeTab === 'todos' || doc.category === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      doc.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-900 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Compendio Normativo Institucional</h2>
              <p className="text-xs text-slate-300">Instituto Nacional Cantón Lourdes (INDEL)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en reglamentos (ej: celulares, uniforme, inasistencia, acoso, faltas)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'todos'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Todos los documentos
            </button>
            <button
              onClick={() => setActiveTab('estudiantes')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'estudiantes'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Estudiantes
            </button>
            <button
              onClick={() => setActiveTab('familias')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'familias'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Referentes de Familia
            </button>
            <button
              onClick={() => setActiveTab('docentes')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'docentes'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Personal Docente
            </button>
            <button
              onClick={() => setActiveTab('administrativo')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'administrativo'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Personal Administrativo
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No se encontraron artículos con el término buscado.</p>
            </div>
          ) : (
            filteredDocs.map((doc: NormativeSection) => (
              <div
                key={doc.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded mb-1">
                      {doc.documentTitle}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {doc.subtitle}
                    </h3>
                  </div>
                  {onSelectQuestion && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectQuestion(`Explícame los detalles de: ${doc.subtitle}`);
                      }}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium underline shrink-0 cursor-pointer"
                    >
                      Preguntar a NEXUS
                    </button>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mt-2 bg-white p-3.5 rounded-lg border border-slate-200 font-mono text-[13px]">
                  {doc.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Fuente Oficial: Reglamentos aprobados del Instituto Nacional Cantón Lourdes</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
