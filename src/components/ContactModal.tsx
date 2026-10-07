import React from 'react';
import { X, Phone, Mail, MapPin, Clock, ShieldAlert } from 'lucide-react';
import { INSTITUTION_INFO } from '../data/institutionKnowledge.ts';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Información y Directorio Institucional</h2>
              <p className="text-xs text-slate-300">{INSTITUTION_INFO.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-sm">
          {/* Student School Shifts */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-800">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Horarios y Jornadas Escolares Estándar</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-blue-900 block mb-0.5">Jornada Matutina:</span>
                <p className="text-slate-700">• Entrada: 7:00 am (ingreso 6:45 am)</p>
                <p className="text-slate-700">• 1° Recreo: 8:20 am | 2° Recreo: 10:15 am</p>
                <p className="text-slate-700">• Salida: 12:00 pm (mediodía)</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-blue-900 block mb-0.5">Jornada Vespertina:</span>
                <p className="text-slate-700">• Entrada: 1:00 pm (ingreso 12:45 pm)</p>
                <p className="text-slate-700">• 1° Recreo: 2:30 pm | 2° Recreo: 4:15 pm</p>
                <p className="text-slate-700">• Salida: 5:15 pm o 6:00 pm (según grupo)</p>
              </div>
            </div>
          </div>

          {/* Attention Hours */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950 text-xs uppercase tracking-wide">
                Horario de Atención para Consultas Docentes y Familias
              </p>
              <p className="text-slate-800 font-medium text-sm mt-0.5">
                {INSTITUTION_INFO.attentionSchedule}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                (7:00 am - 12:00 m y 1:00 pm - 4:00 pm en jornada laboral)
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Línea Telefónica Directa</p>
                <p className="font-bold text-slate-900">{INSTITUTION_INFO.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${INSTITUTION_INFO.phone}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              Llamar
            </a>
          </div>

          {/* Email */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Correo Electrónico Institucional</p>
                <p className="font-bold text-slate-900 break-all">{INSTITUTION_INFO.email}</p>
              </div>
            </div>
            <a
              href={`mailto:${INSTITUTION_INFO.email}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white transition-colors"
            >
              Escribir
            </a>
          </div>

          {/* Location */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Dirección de la Sede</p>
              <p className="font-medium text-slate-800 mt-0.5">{INSTITUTION_INFO.address}</p>
            </div>
          </div>

          {/* Protocol Alert */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Casos Especiales y Faltas Muy Graves:</p>
              <p className="text-amber-800 mt-0.5">
                Conforme a la normativa, se informará oportunamente a las instancias legales correspondientes: CONAPINA, PNC, Fiscalía, ISDEMU o Unidad de Salud.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
