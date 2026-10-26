import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  GraduationCap,
  Users,
  Briefcase,
  FileText,
  Clock,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { OFFICIAL_CONTEXT, NORMATIVE_DOCS } from '../data/institutionKnowledge.ts';

interface NormativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion?: (question: string) => void;
}

type Category = 'estudiantes' | 'familias' | 'docentes' | 'administrativo' | 'institucional';

type Sec = {
  id: string;
  docTitle: string;
  category: Category;
  title: string;
  content: string;
  haystack: string; // texto sin tildes ni mayúsculas, para buscar
};

// ---------- Utilidades de texto ----------

// Quita tildes y pasa a minúsculas conservando el largo del texto (para poder resaltar coincidencias)
function fold(s: string): string {
  return s
    .split('')
    .map((ch) => {
      const f = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return f.charAt(0) || ch;
    })
    .join('');
}

// ---------- Lectura del texto oficial ----------

const DOC_RE = /^\s*DOCUMENTO\s+\d+\s*:\s*(.+?)\s*$/i;

function docMeta(raw: string): { title: string; category: Category } {
  const u = raw.toUpperCase();
  if (u.includes('ESTUDIANTES')) return { title: 'Normativa para Estudiantes', category: 'estudiantes' };
  if (u.includes('REFERENTES') || u.includes('FAMILIA'))
    return { title: 'Normativa para Referentes de Familia', category: 'familias' };
  if (u.includes('ADMINISTRATIVO'))
    return { title: 'Normativa para Personal Administrativo', category: 'administrativo' };
  if (u.includes('DOCENTE')) return { title: 'Normativa para Personal Docente', category: 'docentes' };
  return { title: raw.trim(), category: 'institucional' };
}

// Un título es una línea sin sangría que termina en ":" y está en MAYÚSCULAS
// (o empieza con "Artículo", "Sanciones", "Acciones a realizar", "Normas estipuladas")
function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t.endsWith(':') || t.length < 4 || t.length > 110) return false;
  if (/^\s/.test(line)) return false;
  if (/^(\d+[.)]|[a-z]\)|[•●*-])/i.test(t)) return false;
  if (/^Art[ií]culo\s+\d+/i.test(t) || /^(Sanciones|Acciones a realizar|Normas estipuladas)/i.test(t)) return true;
  const letters = t.split('(')[0].replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length;
  return letters.length >= 4 && upper / letters.length > 0.6;
}

function parseOfficialContext(text: string): Sec[] {
  const secs: Sec[] = [];
  let doc: { title: string; category: Category } = { title: 'Datos generales y horarios', category: 'institucional' };
  let cur: { title: string; lines: string[]; placeholder: boolean } = {
    title: 'Datos de contacto',
    lines: [],
    placeholder: true,
  };
  let n = 0;

  const flush = () => {
    const content = cur.lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (content) {
      secs.push({
        id: `s${n++}`,
        docTitle: doc.title,
        category: doc.category,
        title: cur.title,
        content,
        haystack: fold(`${doc.title} ${cur.title} ${content}`),
      });
    }
  };

  for (const line of text.split('\n')) {
    if (/^\s*={5,}\s*$/.test(line)) continue;

    const m = line.match(DOC_RE);
    if (m) {
      flush();
      doc = docMeta(m[1]);
      cur = { title: 'Introducción', lines: [], placeholder: true };
      continue;
    }

    if (isHeading(line)) {
      const title = line.trim().replace(/:\s*$/, '');
      if (cur.lines.every((l) => !l.trim())) {
        // El título anterior no tenía texto propio: se combinan (p. ej. "CLASIFICACIÓN DE LAS FALTAS — FALTAS LEVES")
        cur.title = cur.placeholder ? title : `${cur.title} — ${title}`;
        cur.placeholder = false;
      } else {
        flush();
        cur = { title, lines: [], placeholder: false };
      }
      continue;
    }

    cur.lines.push(line);
  }
  flush();
  return secs;
}

// Respaldo: si el texto oficial cambiara de formato y no se pudiera leer, se usan los resúmenes
function fallbackSections(): Sec[] {
  return NORMATIVE_DOCS.map((d, i) => ({
    id: `f${i}`,
    docTitle: d.documentTitle,
    category: d.category as Category,
    title: d.subtitle,
    content: d.content,
    haystack: fold(`${d.documentTitle} ${d.subtitle} ${d.content}`),
  }));
}

const SECTIONS: Sec[] = (() => {
  try {
    const parsed = parseOfficialContext(OFFICIAL_CONTEXT);
    return parsed.length >= 4 ? parsed : fallbackSections();
  } catch {
    return fallbackSections();
  }
})();

// ---------- Presentación ----------

const TABS: Array<{ id: 'todos' | Category; label: string; icon: React.ReactNode }> = [
  { id: 'todos', label: 'Todo', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'estudiantes', label: 'Estudiantes', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: 'familias', label: 'Referentes de familia', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'docentes', label: 'Docentes', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'administrativo', label: 'Administrativo', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'institucional', label: 'Horarios y datos', icon: <Clock className="w-3.5 h-3.5" /> },
];

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const norm = fold(text);
  const marks: Array<[number, number]> = [];
  for (const w of words) {
    let i = norm.indexOf(w);
    while (i !== -1) {
      marks.push([i, i + w.length]);
      i = norm.indexOf(w, i + w.length);
    }
  }
  if (!marks.length) return <>{text}</>;

  marks.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const m of marks) {
    const last = merged[merged.length - 1];
    if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]);
    else merged.push([m[0], m[1]]);
  }

  const out: React.ReactNode[] = [];
  let pos = 0;
  merged.forEach(([a, b], idx) => {
    if (a > pos) out.push(text.slice(pos, a));
    out.push(
      <mark key={idx} className="bg-amber-200 text-slate-900 rounded-xs px-0.5">
        {text.slice(a, b)}
      </mark>
    );
    pos = b;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return <>{out}</>;
}

const ITEM_RE = /^(\s*)(\d+[.)]|[a-z]\)|[•●*-])\s+(.*)$/i;

function SectionBody({ content, words }: { content: string; words: string[] }) {
  return (
    <div className="space-y-1.5 text-sm text-slate-700 leading-relaxed">
      {content.split('\n').map((raw, i) => {
        if (!raw.trim()) return <div key={i} className="h-1.5" />;
        const m = raw.match(ITEM_RE);
        if (m) {
          const indented = m[1].length >= 2;
          const marker = /^[•●*-]$/.test(m[2]) ? '•' : m[2];
          return (
            <div key={i} className={`flex gap-2 ${indented ? 'ml-5' : ''}`}>
              <span className="shrink-0 min-w-5 font-semibold text-blue-800">{marker}</span>
              <span className="min-w-0">
                <Highlight text={m[3]} words={words} />
              </span>
            </div>
          );
        }
        return (
          <p key={i}>
            <Highlight text={raw.trim()} words={words} />
          </p>
        );
      })}
    </div>
  );
}

function preview(content: string): string {
  const flat = content.replace(/\s+/g, ' ').trim();
  return flat.length > 95 ? `${flat.slice(0, 95)}…` : flat;
}

export const NormativeModal: React.FC<NormativeModalProps> = ({ isOpen, onClose, onSelectQuestion }) => {
  const [activeTab, setActiveTab] = useState<'todos' | Category>('todos');
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Esc para cerrar, y la página de atrás no se desplaza mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  // Al cerrar se limpia la búsqueda
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveTab('todos');
      setOpenIds(new Set());
    }
  }, [isOpen]);

  const words = useMemo(
    () =>
      fold(query)
        .split(/\s+/)
        .filter((w) => w.length >= 2),
    [query]
  );
  const searching = words.length > 0;

  // Secciones que cumplen la búsqueda (todas las palabras deben aparecer)
  const matching = useMemo(
    () => SECTIONS.filter((s) => words.every((w) => s.haystack.includes(w))),
    [words]
  );

  const visible = useMemo(
    () => matching.filter((s) => activeTab === 'todos' || s.category === activeTab),
    [matching, activeTab]
  );

  const countFor = (id: 'todos' | Category) =>
    id === 'todos' ? matching.length : matching.filter((s) => s.category === id).length;

  // Agrupa por documento, conservando el orden del reglamento
  const groups = useMemo(() => {
    const map = new Map<string, Sec[]>();
    for (const s of visible) {
      if (!map.has(s.docTitle)) map.set(s.docTitle, []);
      map.get(s.docTitle)!.push(s);
    }
    return Array.from(map.entries());
  }, [visible]);

  if (!isOpen) return null;

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOpen = visible.length > 0 && visible.every((s) => searching || openIds.has(s.id));
  const toggleAll = () => setOpenIds(allOpen ? new Set() : new Set(visible.map((s) => s.id)));

  const ask = (text: string) => {
    onClose();
    onSelectQuestion?.(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compendio normativo institucional"
        className="bg-white w-full sm:max-w-4xl max-h-[92vh] h-[92vh] sm:h-auto flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="relative px-5 sm:px-6 pt-5 pb-5 text-white bg-linear-to-br from-blue-950 via-blue-900 to-slate-900 overflow-hidden shrink-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-400/10" aria-hidden="true" />
          <div className="absolute -bottom-16 right-24 w-32 h-32 rounded-full bg-amber-300/10" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-amber-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold leading-tight">Compendio normativo</h2>
                <p className="text-xs sm:text-sm text-blue-100/80">Instituto Nacional Cantón Lourdes (INDEL)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca una palabra: chicle, uniforme, celular, acoso, suspensión…"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:outline-hidden focus:ring-2 focus:ring-amber-300"
              aria-label="Buscar en la normativa"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Borrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pestañas */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {TABS.filter((t) => t.id === 'todos' || SECTIONS.some((s) => s.category === t.id)).map((t) => {
              const active = activeTab === t.id;
              const count = countFor(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 border ${
                    active
                      ? 'bg-blue-950 text-white border-blue-950 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.icon}
                  {t.label}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span role="status" aria-live="polite">
              {searching
                ? `${visible.length} ${visible.length === 1 ? 'sección encontrada' : 'secciones encontradas'}`
                : `${visible.length} secciones · toca una para leerla completa`}
            </span>
            {visible.length > 0 && !searching && (
              <button onClick={toggleAll} className="font-semibold text-blue-800 hover:text-blue-950 cursor-pointer">
                {allOpen ? 'Contraer todo' : 'Expandir todo'}
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {visible.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-slate-600">
                No encontré esa palabra en este apartado. Prueba con una sola palabra o con otra pestaña.
              </p>
              {query.trim() && onSelectQuestion && (
                <button
                  onClick={() => ask(query.trim())}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Preguntarle a NEXUS: “{query.trim()}”
                </button>
              )}
            </div>
          ) : (
            groups.map(([docTitle, secs]) => (
              <section key={docTitle}>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-900 mb-2.5 px-1">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="shrink-0">{docTitle}</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </h3>

                <div className="space-y-2.5">
                  {secs.map((s) => {
                    const open = searching || openIds.has(s.id);
                    return (
                      <article
                        key={s.id}
                        className={`rounded-2xl border transition-colors ${
                          open ? 'border-blue-200 bg-white shadow-xs' : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => toggle(s.id)}
                          aria-expanded={open}
                          className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-snug">
                              <Highlight text={s.title} words={words} />
                            </p>
                            {!open && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{preview(s.content)}</p>}
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {open && (
                          <div className="px-4 pb-4">
                            <div className="border-t border-slate-100 pt-3">
                              <SectionBody content={s.content} words={words} />
                            </div>
                            {onSelectQuestion && (
                              <button
                                onClick={() => ask(`Explícame con palabras sencillas: ${s.title} (${s.docTitle})`)}
                                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Preguntar a NEXUS sobre esto
                              </button>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Pie */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <span className="min-w-0">
            Texto del reglamento interno del INDEL. Para un caso concreto, la autoridad es el instituto.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shrink-0"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};