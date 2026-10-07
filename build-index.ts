import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { OFFICIAL_CONTEXT } from './src/data/institutionKnowledge.ts';
import { EXTRA_CONTEXT } from './src/data/extraKnowledge.ts';

const EMBED_MODEL = 'gemini-embedding-001';
const DIMS = 768; // se reduce de 3072 para que el JSON sea liviano
const MAX_CHARS = 500; // tamaño aproximado de cada trozo
const OVERLAP_LINES = 2; // líneas que se repiten entre trozos para no cortar ideas
const BATCH = 20;
const OUT_FILE = path.resolve('src', 'data', 'embeddingsIndex.json');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DOC_NAMES: Record<string, string> = {
  'NORMATIVA PARA ESTUDIANTES': 'Normativa para Estudiantes',
  'NORMATIVA PARA REFERENTES DE FAMILIA': 'Normativa para Referentes de Familia',
  'NORMATIVA PARA PERSONAL ADMINISTRATIVO': 'Normativa para Personal Administrativo',
  'NORMATIVA PARA PERSONAL DOCENTE': 'Normativa para Personal Docente',
};

type Section = { docName: string; lines: string[] };
type Chunk = { docName: string; text: string };

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
  const t = full.split('(')[0].trim(); // se ignora la nota entre paréntesis
  if (t.length < 4 || t.length > 110) return false;
  const letters = t.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length;
  return upper / letters.length > 0.7 || (/:\s*$/.test(full) && !/^[-•*\d]/.test(full));
}

// Título corto: sin la nota entre paréntesis ni los dos puntos finales
function cleanHeading(line: string): string {
  return line.trim().split('(')[0].trim().replace(/:\s*$/, '');
}

function chunkLines(lines: string[], docName: string): Chunk[] {
  const chunks: Chunk[] = [];
  let heading = '';
  let buf: string[] = [];
  let len = 0;
  let fresh = 0; // líneas nuevas desde el último corte

  const flush = () => {
    const body = buf.join('\n').trim();
    if (body.length > 40) {
      const text = heading && !body.includes(heading) ? `${heading}\n${body}` : body;
      chunks.push({ docName, text });
    }
  };

  for (const line of lines) {
    if (isHeading(line)) {
      if (fresh > 0) flush(); // cada sección nueva empieza su propio trozo
      buf = [];
      len = 0;
      fresh = 0;
      heading = cleanHeading(line);
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

async function embedBatch(texts: string[], taskType: string): Promise<number[][]> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await ai.models.embedContent({
        model: EMBED_MODEL,
        contents: texts,
        config: { taskType, outputDimensionality: DIMS },
      });
      return r.embeddings!.map((e) => normalize(e.values!));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`  intento ${attempt} falló: ${msg.slice(0, 120)}`);
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
  throw new Error('No se pudieron calcular los embeddings tras varios intentos');
}

// ---- Programa principal ----
const sections = [...splitOfficial(OFFICIAL_CONTEXT), ...splitExtra(EXTRA_CONTEXT)];
const chunks: Chunk[] = sections.flatMap((s) => chunkLines(s.lines, s.docName));

console.log('Trozos por documento:');
const porDoc: Record<string, number> = {};
for (const c of chunks) porDoc[c.docName] = (porDoc[c.docName] ?? 0) + 1;
for (const [d, n] of Object.entries(porDoc)) console.log(`  ${n}  ${d}`);
console.log(`Total: ${chunks.length} trozos. Calculando vectores...`);

const vectors: number[][] = [];
for (let i = 0; i < chunks.length; i += BATCH) {
  const lote = chunks.slice(i, i + BATCH);
  const v = await embedBatch(
    lote.map((c) => `${c.docName}\n${c.text}`),
    'RETRIEVAL_DOCUMENT'
  );
  vectors.push(...v);
  console.log(`  ${Math.min(i + BATCH, chunks.length)} / ${chunks.length}`);
}

const index = {
  model: EMBED_MODEL,
  dims: DIMS,
  createdAt: new Date().toISOString(),
  chunks: chunks.map((c, i) => ({ id: i, docName: c.docName, text: c.text, vector: vectors[i] })),
};
fs.writeFileSync(OUT_FILE, JSON.stringify(index));
console.log(`✅ Índice guardado en ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} KB)`);

// ---- Prueba rápida de búsqueda ----
// Cada prueba: [pregunta, palabra que debería aparecer en alguno de los 5 mejores trozos]
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

for (const [pregunta, esperado] of PRUEBAS) {
  const [qv] = await embedBatch([pregunta], 'RETRIEVAL_QUERY');
  const top = index.chunks
    .map((c) => ({ c, score: c.vector.reduce((s, x, i) => s + x * qv[i], 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const pos = top.findIndex((t) => t.c.text.toLowerCase().includes(esperado.toLowerCase()));
  console.log(
    `\n"${pregunta}" → "${esperado}": ${pos >= 0 ? `✅ puesto ${pos + 1}` : '❌ no está en el top 5'}`
  );
  for (const { c, score } of top.slice(0, 3)) {
    console.log(`   ${score.toFixed(3)} [${c.docName}] ${c.text.replace(/\s+/g, ' ').slice(0, 70)}...`);
  }
}