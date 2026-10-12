# NEXUS — Asistente académico institucional con IA

Asistente virtual del **Instituto Nacional Cantón Lourdes (INDEL)** basado en arquitectura **RAG** (Retrieval-Augmented Generation). Responde con base en la documentación del instituto (normativas, matrícula, horarios, evaluación y más), **cita el documento de donde sale cada respuesta** y, si la información no está en los documentos, lo dice en lugar de inventarla.

> Proyecto desarrollado por
- Gilmar Aldahir Pleitez Argueta
- Jorge Alberto Villegas Santos
- Axel Byron Pineda Rivas
- Jimmy Mauricio Ayala Larreynaga

## Qué hace

- Responde preguntas escritas o dictadas por voz sobre normativa, faltas y sanciones, horarios, uniforme, inasistencias, matrícula, especialidades, evaluación, calendario, horas sociales, becas y comités.
- Muestra la fuente de cada respuesta.
- Busca por **significado** (embeddings y similitud coseno) y por **palabras clave**, y combina ambos rankings.
- Orienta con cuidado en situaciones de acoso, abuso o violencia, derivando a las instancias adecuadas.
- Sigue funcionando si un proveedor de IA falla (cadena de respaldo).
- Incluye historial, preguntas frecuentes, lectura de respuestas en voz alta y modo de letra grande para pantallas de presentación.

## Cómo funciona

```
Pregunta (texto o voz)
        ↓
Búsqueda híbrida en el índice (significado + palabras clave)
        ↓
Los 6 fragmentos más relevantes + reglas de comportamiento
        ↓
Modelo de lenguaje → respuesta con fuente
```

**Cadena de respaldo:** modelos en la nube (Gemini, Groq y otros proveedores configurados) → modelo local con Ollama → respuestas fijas por palabras clave.

## Tecnologías

| Área | Herramientas |
|---|---|
| Interfaz | React, Vite, Tailwind CSS, TypeScript |
| Servidor | Node.js, Express |
| IA | Gemini, Groq, Mistral, OpenRouter, Cerebras (opcionales), Ollama (local) |
| Búsqueda | `gemini-embedding-001`, similitud coseno, palabras clave, fusión de rankings (RRF) |
| Voz | Web Speech API y síntesis de voz del navegador |
| Despliegue | GitHub y Render |

## Estructura del proyecto

```
server.ts                      Servidor, reglas del asistente y cadena de proveedores
build-index.ts                 Genera el índice de embeddings
src/
  App.tsx                      Interfaz del chat
  voiceInput.tsx               Dictado por voz
  search.ts                    Búsqueda híbrida
  components/                  Componentes de la interfaz
  data/
    institutionKnowledge.ts    Normativas oficiales
    extraKnowledge.ts          Información general complementaria
    embeddingsIndex.json       Índice generado (se sube al repositorio)
```

## Ejecutar en tu computadora

**Requisitos:** Node.js y una clave de API de Gemini (gratuita en [Google AI Studio](https://aistudio.google.com/apikey)).

1. Instalar dependencias:
```bash
   npm install
```
   El archivo `.npmrc` del proyecto ya incluye `legacy-peer-deps=true`, necesario por un conflicto de versiones entre dependencias.

2. Crear el archivo `.env` a partir del ejemplo y poner tus claves:
```bash
   copy .env.example .env
```

3. Iniciar el servidor:
```bash
   npm run dev
```
   Abre `http://localhost:3000`.

## Variables de entorno

Se configuran en `.env` (local) o en el panel de Render (producción). **Nunca se suben al repositorio.**

| Variable | Uso |
|---|---|
| `GEMINI_API_KEY` | Obligatoria. Respuestas y embeddings. |
| `GROQ_API_KEY` | Opcional. Proveedor de respaldo. |
| `MISTRAL_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY` | Opcionales. Más proveedores de respaldo. |
| `OLLAMA_URL`, `OLLAMA_MODEL` | Opcionales. Modelo local (por defecto `http://localhost:11434` y `llama3.2:3b`). |
| `OFFLINE_MODE` | `true` para usar solo el modelo local, sin internet. |
| `NODE_ENV` | `production` en el servidor publicado. |

## Actualizar el contenido

Cuando cambien las normativas o la información general, hay que regenerar el índice, o el asistente seguirá respondiendo con la
