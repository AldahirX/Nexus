// Muestra los 6 fragmentos más cercanos a una pregunta por similitud coseno, con sus puntajes.
// Sirve como evidencia ("captura") de la entrega.
//
// Uso:
//   npx tsx consultar.ts "¿puedo meter comida al instituto?"

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const pregunta = process.argv.slice(2).join(' ').trim() || '¿puedo meter comida al instituto?';
const INDEX_FILE = path.resolve('src', 'data', 'embeddingsIndex.json');

if (!fs.existsSync(INDEX_FILE)) {
  console.error('No existe el índice. Primero corre: npx tsx build-index.ts');
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let raw: number[];
try {
  const r = await ai.models.embedContent({
    model: index.model,
    contents: [pregunta],
    config: { taskType: 'RETRIEVAL_QUERY', outputDimensionality: index.dims },
  });
  raw = r.embeddings![0].values!;
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('No se pudo calcular el vector de la pregunta:', msg.slice(0, 160));
  if (/429|quota/i.test(msg)) console.error('Cuota agotada: espera unos minutos y vuelve a intentar.');
  process.exit(1);
}

// Los vectores del índice ya están normalizados; se normaliza también el de la pregunta
const norm = Math.sqrt(raw.reduce((s, x) => s + x * x, 0)) || 1;
const qv = raw.map((x) => x / norm);

const top = index.chunks
  .map((c: any) => ({ c, score: c.vector.reduce((s: number, x: number, i: number) => s + x * qv[i], 0) }))
  .sort((a: any, b: any) => b.score - a.score)
  .slice(0, 6);

console.log(`\nPregunta: "${pregunta}"`);
console.log(`Índice: ${index.chunks.length} fragmentos · modelo ${index.model} · ${index.dims} dimensiones`);
console.log('Los 6 fragmentos más cercanos (similitud coseno):\n');

top.forEach(({ c, score }: any, i: number) => {
  const lineas = String(c.text).split('\n');
  const titulo = lineas[0].trim() || '(sin título)';
  const cuerpo = lineas.slice(1).join(' ').replace(/\s+/g, ' ').trim();
  console.log(`${i + 1}. puntaje ${score.toFixed(4)} · fragmento #${c.id} · ${c.docName}`);
  console.log(`   sección: ${titulo}`);
  console.log(`   ${cuerpo.slice(0, 170)}${cuerpo.length > 170 ? '...' : ''}\n`);
});