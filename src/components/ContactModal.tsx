import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldAlert,
  Sun,
  Sunset,
  Copy,
  Check,
  Facebook,
  Navigation,
} from 'lucide-react';
import { INSTITUTION_INFO } from '../data/institutionKnowledge.ts';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FACEBOOK_URL = 'https://www.facebook.com/indeloficial11028';

// Copia al portapapeles (con respaldo para navegadores o páginas sin permiso de clipboard)
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* se intenta el respaldo */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

const BTN_PRIMARY =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-950 transition-colors cursor-pointer';
const BTN_SECONDARY =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer';

function ContactCard({
  icon,
  tone,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm sm:text-base font-semibold text-slate-900 break-words mt-0.5">{value}</p>
        <div className="flex flex-wrap gap-2 mt-2.5">{children}</div>
      </div>
    </div>
  );
}

function ShiftCard({
  icon,
  title,
  tone,
  entry,
  recesses,
  exit,
}: {
  icon: React.ReactNode;
  title: string;
  tone: string;
  entry: string;
  recesses: { number: string; time: string }[];
  exit: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className={`px-3.5 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${tone}`}>
        {icon}
        {title}
      </div>
      <ul className="p-3.5 space-y-1.5 text-xs text-slate-700">
        <li>
          <span className="font-semibold text-slate-900">Entrada:</span> {entry}
        </li>
        {recesses.map((r) => (
          <li key={r.number}>
            <span className="font-semibold text-slate-900">{r.number}:</span> {r.time}
          </li>
        ))}
        <li>
          <span className="font-semibold text-slate-900">Salida:</span> {exit}
        </li>
      </ul>
    </div>
  );
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cierra con la tecla Escape y evita que la página de atrás se desplace
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  if (!isOpen) return null;

  const { name, address, email, phone, attentionSchedule, morningShift, afternoonShift } = INSTITUTION_INFO;

  const phoneDigits = phone.replace(/\D/g, '');
  const telHref = `tel:+503${phoneDigits}`; // código de El Salvador: funciona mejor en el celular
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const subject = encodeURIComponent('Consulta al INDEL');
  const mailtoHref = `mailto:${email}?subject=${subject}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}`;
  const outlookHref = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}&subject=${subject}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name}, Lourdes, Colón, El Salvador`
  )}`;

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const copyAndNotify = async (text: string, okMessage: string) => {
    const ok = await copyText(text);
    showToast(ok ? okMessage : 'No se pudo copiar. Selecciona el texto y cópialo manualmente.');
  };

  const handleCall = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // En computadora no hay app de llamadas: se copia el número para pegarlo donde se necesite
    if (!isMobile) {
      e.preventDefault();
      copyAndNotify(phone, 'Número copiado. Pégalo en tu teléfono o en tu app de llamadas.');
    }
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
        aria-label="Contacto y directorio institucional"
        className="relative bg-white w-full sm:max-w-xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="relative px-5 sm:px-6 pt-5 pb-6 text-white bg-linear-to-br from-blue-950 via-blue-900 to-slate-900 overflow-hidden shrink-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-400/10" aria-hidden="true" />
          <div className="absolute -bottom-16 right-16 w-32 h-32 rounded-full bg-amber-300/10" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
                Contacto
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-2 leading-tight">Información y directorio</h2>
              <p className="text-xs sm:text-sm text-blue-100/80 mt-1">{name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mt-4 inline-flex items-center gap-2 text-xs bg-white/10 border border-white/15 rounded-xl px-3 py-2">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <span className="font-semibold">Atención:</span> {attentionSchedule}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          <ContactCard
            icon={<Phone className="w-5 h-5" />}
            tone="bg-emerald-100 text-emerald-800"
            label="Teléfono"
            value={phone}
          >
            <a href={telHref} onClick={handleCall} className={BTN_PRIMARY}>
              <Phone className="w-3.5 h-3.5" />
              Llamar
            </a>
            <button
              type="button"
              onClick={() => copyAndNotify(phone, 'Número copiado.')}
              className={BTN_SECONDARY}
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </button>
          </ContactCard>

          <ContactCard
            icon={<Mail className="w-5 h-5" />}
            tone="bg-blue-100 text-blue-800"
            label="Correo institucional"
            value={email}
          >
            <a href={mailtoHref} className={BTN_PRIMARY}>
              <Mail className="w-3.5 h-3.5" />
              Mi app de correo
            </a>
            <a href={outlookHref} target="_blank" rel="noopener noreferrer" className={BTN_SECONDARY}>
              Outlook
            </a>
            <a href={gmailHref} target="_blank" rel="noopener noreferrer" className={BTN_SECONDARY}>
              Gmail
            </a>
            <button
              type="button"
              onClick={() => copyAndNotify(email, 'Correo copiado.')}
              className={BTN_SECONDARY}
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </button>
          </ContactCard>

          <ContactCard
            icon={<Facebook className="w-5 h-5" />}
            tone="bg-indigo-100 text-indigo-800"
            label="Página oficial de Facebook"
            value="INDEL oficial"
          >
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className={BTN_PRIMARY}>
              <Facebook className="w-3.5 h-3.5" />
              Abrir página
            </a>
            <button
              type="button"
              onClick={() => copyAndNotify(FACEBOOK_URL, 'Enlace copiado.')}
              className={BTN_SECONDARY}
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar enlace
            </button>
          </ContactCard>

          <ContactCard
            icon={<MapPin className="w-5 h-5" />}
            tone="bg-amber-100 text-amber-800"
            label="Dirección de la sede"
            value={address}
          >
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={BTN_PRIMARY}>
              <Navigation className="w-3.5 h-3.5" />
              Cómo llegar
            </a>
            <button
              type="button"
              onClick={() => copyAndNotify(address, 'Dirección copiada.')}
              className={BTN_SECONDARY}
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </button>
          </ContactCard>

          {/* Horarios */}
          <div className="pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              Horarios y jornadas escolares estándar
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ShiftCard
                icon={<Sun className="w-4 h-4" />}
                title="Jornada matutina"
                tone="bg-amber-50 text-amber-900 border-b border-amber-100"
                entry={morningShift.entry}
                recesses={morningShift.recesses}
                exit={morningShift.exit}
              />
              <ShiftCard
                icon={<Sunset className="w-4 h-4" />}
                title="Jornada vespertina"
                tone="bg-indigo-50 text-indigo-900 border-b border-indigo-100"
                entry={afternoonShift.entry}
                recesses={afternoonShift.recesses}
                exit={afternoonShift.exit}
              />
            </div>
          </div>

          {/* Avisos */}
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-900">
            <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold">Peligro inmediato:</span> llama al <span className="font-bold">911</span>. En
              casos de faltas muy graves, la normativa indica informar a las instancias correspondientes: CONAPINA,
              PNC, Fiscalía, ISDEMU o Unidad de Salud.
            </p>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        {/* Aviso de "copiado" */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[90%] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};