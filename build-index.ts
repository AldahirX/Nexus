import 'dotenv/config';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { OFFICIAL_CONTEXT } from './src/data/institutionKnowledge.ts';
import { EXTRA_CONTEXT } from './src/data/extraKnowledge.ts';

const EMBED_MODEL = 'gemini-embedding-001';
const DIMS = 768; // se reduce de 3072 para que el JSON sea liviano
const MAX_CHARS = 500; // tamaño aproximado de cada trozo
const OVERLAP_LINES = 2; // líneas que se repiten entre trozos para no cortar ideas
const BATCH = 20;
const PAUSE_MS = 15000; // pausa entre lotes: el plan gratuito limita los embeddings por minuto (~100 textos)
const CACHE_FILE = path.resolve('.embeddings-cache.json'); // guarda el avance; está en .gitignore
const OUT_FILE = path.resolve('src', 'data', 'embeddingsIndex.json');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DOC_NAMES: Record<string, string> = {
  'NORMATIVA PARA ESTUDIANTES': 'Normativa para Estudiantes',
  'NORMATIVA PARA REFERENTES DE FAMILIA': 'Normativa para Referentes de Familia',
  'NORMATIVA PARA PERSONAL ADMINISTRATIVO': 'Normativa para Personal Administrativo',
  'NORMATIVA PARA PERSONAL DOCENTE': 'Normativa para Personal Docente',
};

// Prefijo del identificador legible de cada fragmento (p. ej. est-014)
const DOC_PREFIX: Record<string, string> = {
  'Compendio Normativo Institucional': 'comp',
  'Normativa para Estudiantes': 'est',
  'Normativa para Referentes de Familia': 'fam',
  'Normativa para Personal Administrativo': 'adm',
  'Normativa para Personal Docente': 'doc',
  'Información General del INDEL': 'gen',
};

type Section = { docName: string; lines: string[] };
type Chunk = { docName: string; seccion: string; referencia: string; text: string };

// Separa OFFICIAL_CONTEXT en documentos
function splitOfficial(text: string): Section[] {
  const sections: Section[] = [{ docName: 'Compendio Normativo Institucional', lines: [] }];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*DOCUMENTO\s+\d+\s*:\s*(.+?)\s*$/i);
    if (m) {
      const raw = m[1].trim();
      sections.push({ docName: DOC_NAMES[raw.toUpperCase()] ?? raw, lines: [] });
      continue;
    }
    if (/^\s*={5,}\s*$/.test(line)) continue; // líneas decorativas
    sections[sections.length - 1].lines.push(line);
  }
  return sections;
}

// El archivo extra es un solo documento
function splitExtra(text: string): Section[] {
  const lines = text.split('\n').filter((l) => !l.trim().startsWith('==='));
  return [{ docName: 'Información General del INDEL', lines }];
}

// Detecta títulos de sección (MAYÚSCULAS o terminan en ":")
function isHeading(line: string): boolean {
  const full = line.trim();
  // Los elementos de una lista ("5. OTROS.", "3. USO DE CALCETAS BLANCAS...", "a) ...", "• ...") NO son títulos,
  // aunque estén en mayúsculas; si lo fueran, partirían la lista y darían secciones falsas.
  if (/^(\d+[.)]|[a-z]\)|[-•●*])/i.test(full)) return false;
  const t = full.split('(')[0].trim(); // se ignora la nota entre paréntesis
  if (t.length < 4 || t.length > 110) return false;
  const letters = t.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length;
  return upper / letters.length > 0.7 || (/:\s*$/.test(full) && !/^[-•*\d]/.test(full));
}

// Título corto: sin la nota entre paréntesis ni los dos puntos finales
function cleanHeading(line: string): string {
  return line.trim().split('(')[0].trim().replace(/[.:]\s*$/, '');
}

// Referencia citable: el título limpio más el paréntesis SOLO si menciona un artículo o ley
// (p. ej. "SUSPENSIÓN PREVIA (LCD, Art. 60)"). Las notas largas se descartan.
function headingReference(line: string): string {
  const clean = cleanHeading(line);
  const paren = line.match(/\(([^)]*)\)/)?.[1]?.trim();
  return paren && /\b(art|lcd|rlcd|ley)\b/i.test(paren) ? `${clean} (${paren})` : clean;
}

function chunkLines(lines: string[], docName: string): Chunk[] {
  const chunks: Chunk[] = [];
  let heading = '';
  let reference = '';
  let buf: string[] = [];
  let len = 0;
  let fresh = 0; // líneas nuevas desde el último corte

  const flush = () => {
    const body = buf.join('\n').trim();
    if (body.length > 40) {
      const text = heading && !body.includes(heading) ? `${heading}\n${body}` : body;
      // Si el fragmento menciona artículos (p. ej. "Art. 60, LCD"), se agregan a la referencia citable
      const arts = [...new Set([...body.matchAll(/\bArt(?:[ií]culo|\.)?\s*(\d+)/gi)].map((m) => m[1]))].slice(0, 4);
      const base = reference || heading;
      const referencia =
        arts.length && !/\bart/i.test(base) ? (base ? `${base} (Art. ${arts.join(', ')})` : `Art. ${arts.join(', ')}`) : base;
      chunks.push({ docName, seccion: heading, referencia, text });
    }
  };

  for (const line of lines) {
    if (isHeading(line)) {
      if (fresh > 0) flush(); // cada sección nueva empieza su propio trozo
      buf = [];
      len = 0;
      fresh = 0;
      heading = cleanHeading(line);
      reference = headingReference(line);
    }
    buf.push(line);
    len += line.length + 1;
    fresh++;
    if (len >= MAX_CHARS) {
      flush();
      buf = buf.slice(-OVERLAP_LINES);
      len = buf.reduce((n, l) => n + l.length + 1, 0);
      fresh = 0;
    }
  }
  if (fresh > 0) flush();
  return chunks;
}

function normalize(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => Math.round((x / n) * 1e5) / 1e5);
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

class DailyQuotaError extends Error {}

async function embedBatch(texts: string[], taskType: string): Promise<number[][]> {
  const MAX_ATTEMPTS = 6;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const r = await ai.models.embedContent({
        model: EMBED_MODEL,
        contents: texts,
        config: { taskType, outputDimensionality: DIMS },
      });
      return r.embeddings!.map((e) => normalize(e.values!));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const esCuota = /429|RESOURCE_EXHAUSTED|quota/i.test(msg);

      if (esCuota && /PerDay|per day|daily/i.test(msg)) {
        throw new DailyQuotaError(
          'La cuota DIARIA de embeddings de tu proyecto de Google se agotó. Se restablece cada día; ' +
            'también puedes usar una clave creada en otro proyecto de Google AI Studio.'
        );
      }
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`No se pudieron calcular los embeddings: ${msg.slice(0, 160)}`);
      }
      if (esCuota) {
        // Límite por minuto: se espera lo que indique Google (o 65 s) y se reintenta
        const m = msg.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/) ?? msg.match(/retry in (\d+(?:\.\d+)?)s/i);
        const wait = m ? Math.ceil(parseFloat(m[1])) + 3 : 65;
        console.warn(`  límite por minuto alcanzado; esperando ${wait} s (intento ${attempt}/${MAX_ATTEMPTS - 1})...`);
        await sleep(wait * 1000);
      } else {
        console.warn(`  intento ${attempt} falló: ${msg.slice(0, 120)}`);
        await sleep(2000 * attempt);
      }
    }
  }
  throw new Error('No se pudieron calcular los embeddings tras varios intentos');
}

// Caché de vectores: si el texto de un fragmento no cambió, no se vuelve a calcular
const keyOf = (text: string) =>
  crypto.createHash('sha1').update(`${EMBED_MODEL}|${DIMS}|${text}`).digest('hex');

function loadCache(): Record<string, number[]> {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, number[]>) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}

// ---- Programa principal ----
const sections = [...splitOfficial(OFFICIAL_CONTEXT), ...splitExtra(EXTRA_CONTEXT)];
const chunks: Chunk[] = sections.flatMap((s) => chunkLines(s.lines, s.docName));

console.log('Trozos por documento:');
const porDoc: Record<string, number> = {};
for (const c of chunks) porDoc[c.docName] = (porDoc[c.docName] ?? 0) + 1;
for (const [d, n] of Object.entries(porDoc)) console.log(`  ${n}  ${d}`);
console.log(`Total: ${chunks.length} trozos. Calculando vectores...`);

const textOf = (c: Chunk) => `${c.docName}\n${c.text}`;
const cache = loadCache();
const pending = chunks.filter((c) => !cache[keyOf(textOf(c))]);
console.log(`${chunks.length - pending.length} vectores ya estaban guardados (caché); faltan ${pending.length}.`);

try {
  for (let i = 0; i < pending.length; i += BATCH) {
    const lote = pending.slice(i, i + BATCH);
    const v = await embedBatch(lote.map(textOf), 'RETRIEVAL_DOCUMENT');
    lote.forEach((c, j) => {
      cache[keyOf(textOf(c))] = v[j];
    });
    saveCache(cache); // el avance queda guardado después de cada lote
    console.log(`  ${Math.min(i + BATCH, pending.length)} / ${pending.length}`);
    if (i + BATCH < pending.length) await sleep(PAUSE_MS);
  }
} catch (e) {
  console.error(`\n❌ ${e instanceof Error ? e.message : e}`);
  console.error('El avance quedó guardado: vuelve a correr el mismo comando y continúa donde se quedó.');
  process.exit(1);
}

const vectors: number[][] = chunks.map((c) => cache[keyOf(textOf(c))]);

const index = {
  model: EMBED_MODEL,
  dims: DIMS,
  createdAt: new Date().toISOString(),
  chunks: chunks.map((c, i) => ({
    id: i,
    codigo: `${DOC_PREFIX[c.docName] ?? 'doc'}-${String(chunks.slice(0, i).filter((x) => x.docName === c.docName).length + 1).padStart(3, '0')}`,
    docName: c.docName,
    seccion: c.seccion,
    referencia: c.referencia,
    text: c.text,
    vector: vectors[i],
  })),
};
fs.writeFileSync(OUT_FILE, JSON.stringify(index));
console.log(`✅ Índice guardado en ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} KB)`);

// ---- Prueba rápida de búsqueda ----
// Cada prueba: [pregunta, palabra que debería aparecer en alguno de los 6 mejores trozos]
const PRUEBAS: Array<[string, string]> = [
  ['puedo meter comida al instituto', 'chicle'],
  ['puedo traer gaseosa', 'energizantes'],
  ['cuánto dura mecánica automotriz', '3 años'],
  ['cuál es la nota mínima para pasar', 'nota mínima'],
  ['qué documentos piden para primer año', 'noveno grado'],
  ['qué pasa si un profesor me acosa', 'acoso'],
  ['cuándo son las vacaciones de agosto', 'agosto'],
  ['cuántas horas sociales son', '150 horas'],
];

if (pending.length > 0) {
  console.log('\nEsperando 20 s para no pasar el límite por minuto antes de las pruebas...');
  await sleep(20000);
}

for (const [pregunta, esperado] of PRUEBAS) {
  let qv: number[];
  try {
    [qv] = await embedBatch([pregunta], 'RETRIEVAL_QUERY');
  } catch (e) {
    console.warn(`\n"${pregunta}": no se pudo probar (${e instanceof Error ? e.message.slice(0, 90) : e})`);
    continue;
  }
  const top = index.chunks
    .map((c) => ({ c, score: c.vector.reduce((s, x, i) => s + x * qv[i], 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const pos = top.findIndex((t) => t.c.text.toLowerCase().includes(esperado.toLowerCase()));
  console.log(
    `\n"${pregunta}" → "${esperado}": ${pos >= 0 ? `✅ puesto ${pos + 1}` : '❌ no está en el top 6'}`
  );
  for (const { c, score } of top.slice(0, 3)) {
    console.log(`   ${score.toFixed(3)} [${c.docName}] ${c.text.replace(/\s+/g, ' ').slice(0, 70)}...`);
  }
}