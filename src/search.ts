import fs from 'fs';
import path from 'path';
import type { GoogleGenAI } from '@google/genai';

type IndexChunk = {
  id: number;
  codigo?: string;
  docName: string;
  seccion?: string;
  referencia?: string;
  text: string;
  vector: number[];
};
type Index = { model: string; dims: number; chunks: IndexChunk[] };

const INDEX_PATH = path.resolve('src', 'data', 'embeddingsIndex.json');
const TOP_K = 6;
const RRF_K = 60; // constante estándar para mezclar rankings

let cached: Index | null = null;
function loadIndex(): Index {
  if (!cached) cached = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as Index;
  return cached;
}

// ---------- utilidades ----------
function stripAccents(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const STOPWORDS = new Set([
  'que', 'los', 'las', 'del', 'una', 'uno', 'por', 'para', 'con', 'como', 'cual', 'cuales',
  'cuando', 'donde', 'quien', 'puedo', 'puede', 'pueden', 'hay', 'esta', 'este', 'esto',
  'son', 'ser', 'mis', 'sus', 'muy', 'mas', 'pero', 'sin', 'sobre', 'entre', 'dura', 'pasa',
]);

function tokens(q: string): string[] {
  return stripAccents(q)
    .split(/[^a-z0-9ñ]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function normalizeVec(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

// ---------- búsqueda por significado ----------
async function semanticRanking(ai: GoogleGenAI, question: string, index: Index): Promise<number[]> {
  const r = await ai.models.embedContent({
    model: index.model,
    contents: [question],
    config: { taskType: 'RETRIEVAL_QUERY', outputDimensionality: index.dims },
  });
  const qv = normalizeVec(r.embeddings![0].values!);
  return index.chunks
    .map((c) => ({ id: c.id, score: c.vector.reduce((s, x, i) => s + x * qv[i], 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map((x) => x.id);
}

// ---------- búsqueda por palabras clave ----------
function keywordRanking(question: string, index: Index): number[] {
  const qTokens = tokens(question);
  if (qTokens.length === 0) return [];
  return index.chunks
    .map((c) => {
      const text = stripAccents(`${c.docName} ${c.text}`);
      let score = 0;
      for (const t of qTokens) {
        // se usa la raíz (primeras 5 letras) para tolerar plurales y conjugaciones
        const stem = t.length > 5 ? t.slice(0, 5) : t;
        if (text.includes(stem)) score += 1;
      }
      return { id: c.id, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map((x) => x.id);
}

// ---------- mezcla de rankings ----------
export async function searchChunks(ai: GoogleGenAI | null, question: string, k = TOP_K): Promise<IndexChunk[]> {
  const index = loadIndex();

  // Sin cliente (modo sin internet) se usan solo palabras clave
  let semantic: number[] = [];
  if (ai) {
    try {
      semantic = await Promise.race([
        semanticRanking(ai, question, index),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de embeddings (4s)')), 4000)
        ),
      ]);
    } catch (e) {
      console.warn('Búsqueda semántica falló, se usa solo palabras clave:', e instanceof Error ? e.message : e);
    }
  }
  const keyword = keywordRanking(question, index);

  const scores = new Map<number, number>();
  for (const ranking of [semantic, keyword]) {
    ranking.forEach((id, pos) => {
      scores.set(id, (scores.get(id) ?? 0) + 1 / (RRF_K + pos + 1));
    });
  }

  const byId = new Map(index.chunks.map((c) => [c.id, c]));
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([id]) => byId.get(id)!)
    .filter(Boolean);
}

// ---------- contexto listo para el modelo ----------
export async function buildContext(ai: GoogleGenAI | null, question: string): Promise<string> {
  const chunks = await searchChunks(ai, question);
  return chunks
    .map((c) => `[${c.docName}${c.referencia ? ' — ' + c.referencia : ''}]\n${c.text}`)
    .join('\n\n---\n\n');
}
