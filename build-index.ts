import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { OFFICIAL_CONTEXT } from './src/data/institutionKnowledge.ts';
import { EXTRA_CONTEXT } from './src/data/extraKnowledge.ts';

const EMBED_MODEL = 'gemini-embedding-001';
const DIMS = 768; // se reduce de 3072 para que el JSON sea liviano
const MAX_CHARS = 500; // tamaño aproximado de cada trozo
const OVERLAP_LINES = 2; // líneas que se repiten entre trozos
const BATCH = 10; // textos por petición
const PAUSE_MS = 8000; // pausa entre lotes
const OUT_FILE = path.resolve('src', 'data', 'embeddingsIndex.json');
const CACHE_FILE = path.resolve('.embed-cache.json');
const RUN_TESTS = process.argv.includes('--test'); // las pruebas finales gastan cuota: solo con --test

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const hash = (s: string) =>
  crypto.createHash('sha1').update(`${EMBED_MODEL}|${DIMS}|${s}`).digest('hex');

// ---- Caché: vectores ya calculados (en disco + los del índice anterior) ----
const embedCache: Record<string, number[]> = fs.existsSync(CACHE_FILE)
  ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
  : {};
const saveCache = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(embedCache));

if (fs.existsSync(OUT_FILE)) {
  try {
    const old = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'));
    if (old.model === EMBED_MODEL && old.dims === DIMS && Array.isArray(old.chunks)) {
      let n = 0;
      for (const c of old.chunks) {
        const k = hash(`${c.docName}\n${c.text}`);
        if (!embedCache[k] && Array.isArray(c.vector)) {
          embedCache[k] = c.vector;
          n++;
        }
      }
      console.log(`Reutilizados ${n} vectores del índice anterior.`);
    }
  } catch {
    console.warn('No se pudo leer el índice anterior; se calculará lo que falte.');
  }
}

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
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const r = await ai.models.embedContent({
        model: EMBED_MODEL,
        contents: texts,
        config: { taskType, outputDimensionality: DIMS },
      });
      return r.embeddings!.map((e) => normalize(e.values!));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const is429 = /429|RESOURCE_EXHAUSTED|quota/i.test(msg);

      // Cuota diaria agotada: no tiene caso reintentar ahora
      if (/PerDay|per day|daily/i.test(msg)) {
        throw new Error('Cuota DIARIA de embeddings agotada. Vuelve a correr el script más tarde.');
      }

      // Si el error indica cuánto esperar, se respeta; si no, 65 s
      const m = msg.match(/retryDelay[^0-9]{0,6}(\d+(?:\.\d+)?)s/);
      const wait = is429 ? Math.ceil(m ? Number(m[1]) : 60) + 5 : 2 * attempt;
      console.warn(
        `  intento ${attempt} falló (${is429 ? 'límite de cuota' : 'error'}). Esperando ${wait}s... ${msg.slice(0, 90)}`
      );
      await sleep(wait * 1000);
    }
  }
  throw new Error('No se pudieron calcular los embeddings tras varios intentos.');
}

async function main() {
  const sections = [...splitOfficial(OFFICIAL_CONTEXT), ...splitExtra(EXTRA_CONTEXT)];
  const chunks: Chunk[] = sections.flatMap((s) => chunkLines(s.lines, s.docName));

  console.log('Trozos por documento:');
  const porDoc: Record<string, number> = {};
  for (const c of chunks) porDoc[c.docName] = (porDoc[c.docName] ?? 0) + 1;
  for (const [d, n] of Object.entries(porDoc)) console.log(`  ${n}  ${d}`);
  console.log(`Total: ${chunks.length} trozos.`);

  const texts = chunks.map((c) => `${c.docName}\n${c.text}`);
  const vectors: number[][] = new Array(chunks.length);
  const pending: number[] = [];
  texts.forEach((t, i) => {
    const cached = embedCache[hash(t)];
    if (cached) vectors[i] = cached;
    else pending.push(i);
  });
  console.log(`Ya disponibles: ${chunks.length - pending.length}. Por calcular: ${pending.length}`);

  for (let p = 0; p < pending.length; p += BATCH) {
    const idxs = pending.slice(p, p + BATCH);
    const v = await embedBatch(idxs.map((i) => texts[i]), 'RETRIEVAL_DOCUMENT');
    idxs.forEach((i, k) => {
      vectors[i] = v[k];
      embedCache[hash(texts[i])] = v[k];
    });
    saveCache(); // el progreso queda guardado aunque después falle
    console.log(`  ${Math.min(p + BATCH, pending.length)} / ${pending.length} nuevos`);
    await sleep(PAUSE_MS);
  }
  saveCache();

  const index = {
    model: EMBED_MODEL,
    dims: DIMS,
    createdAt: new Date().toISOString(),
    chunks: chunks.map((c, i) => ({ id: i, docName: c.docName, text: c.text, vector: vectors[i] })),
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(index));
  console.log(`✅ Índice guardado en ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} KB)`);

  // ---- Pruebas de búsqueda (solo con: npx tsx build-index.ts --test) ----
  if (!RUN_TESTS) {
    console.log('Pruebas omitidas (para correrlas: npx tsx build-index.ts --test).');
    return;
  }
  const PRUEBAS: Array<[string, string]> = [
    ['puedo meter comida al instituto', 'alimentos'],
    ['puedo traer gaseosa', 'energizantes'],
    ['cuánto dura mecánica automotriz', '3 años'],
    ['cuál es la nota mínima para pasar', 'nota mínima'],
    ['qué documentos piden para primer año', 'noveno grado'],
    ['qué pasa si un profesor me acosa', 'acoso'],
    ['cuándo son las vacaciones de agosto', 'agosto'],
    ['cuántas horas sociales son', '150 horas'],
    ['cómo se llama la directora', 'Lizbeth'],
  ];

  for (const [pregunta, esperado] of PRUEBAS) {
    await sleep(1500);
    const [qv] = await embedBatch([pregunta], 'RETRIEVAL_QUERY');
    const top = index.chunks
      .map((c) => ({ c, score: c.vector.reduce((s, x, i) => s + x * qv[i], 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const pos = top.findIndex((t) => t.c.text.toLowerCase().includes(esperado.toLowerCase()));
    console.log(`\n"${pregunta}" → "${esperado}": ${pos >= 0 ? `✅ puesto ${pos + 1}` : '❌ no está en el top 5'}`);
    for (const { c, score } of top.slice(0, 3)) {
      console.log(`   ${score.toFixed(3)} [${c.docName}] ${c.text.replace(/\s+/g, ' ').slice(0, 70)}...`);
    }
  }
}

main().catch((e) => {
  saveCache();
  console.error('\n⚠️', e instanceof Error ? e.message : e);
  console.error('El progreso quedó guardado en .embed-cache.json. Vuelve a ejecutar el script más tarde.');
  process.exit(1);
});