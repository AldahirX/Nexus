# NEXUS — Asistente académico institucional con IA

Asistente virtual del **Instituto Nacional Cantón Lourdes (INDEL)** basado en arquitectura **RAG** (Retrieval-Augmented Generation). Responde con base en la documentación del instituto (normativas, matrícula, horarios, evaluación y más), **cita el documento de donde sale cada respuesta** y, si la información no está en los documentos, lo dice en lugar de inventarla.

**Proyecto desarrollado por:**

- Gilmar Aldahir Pleitez Argueta
- Jorge Alberto Villegas Santos
- Axel Byron Pineda Rivas
- Jimmy Mauricio Ayala Larreynaga

## Enlaces

- **Sistema publicado:** [CONFIRMAR: https://tu-servicio.onrender.com]
  El servicio gratuito puede tardar cerca de un minuto en despertar la primera vez que se abre.
- **Video de la demo (90 s):** [CONFIRMAR: enlace]
- **Manual técnico:** [CONFIRMAR: enlace o ruta dentro del repositorio]

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
consultar.ts                   Muestra los 6 fragmentos más cercanos a una pregunta
.npmrc                         Opción necesaria para instalar las dependencias
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

   En Mac o Linux: `cp .env.example .env`

3. Iniciar el servidor:

   ```bash
   npm run dev
   ```

   Abre `http://localhost:3000`.

## Cómo probar el sistema

NEXUS es de acceso público y **no requiere usuario ni contraseña**, porque solo consulta documentos institucionales y no maneja datos personales de estudiantes.

Preguntas sugeridas para probarlo:

| Pregunta | Qué se espera |
|---|---|
| ¿Qué pasa si cometo una falta? | Sistema de sanciones, con fuente |
| ¿Puedo meter comida al instituto? | Faltas leves sobre alimentos y bebidas |
| ¿Me pueden echar? | Suspensión y matrícula condicionada |
| ¿Qué documentos piden para primer año? | Lista de documentos de matrícula |
| ¿Cuánto dura Desarrollo de Software? | Duración de la especialidad |
| ¿Cuál es la nota mínima para pasar? | 6 en materias básicas y 7 en módulos |
| ¿Cuántas horas sociales debo hacer? | Alrededor de 150 horas |
| ¿Cómo se llama la directora? | Nombre, aclarando que conviene confirmarlo |
| ¿Qué pasa si un profesor me acosa? | Respuesta cuidadosa con vías de denuncia |
| Cuéntame un chiste | Rechazo amable: solo responde sobre el INDEL |

## Pruebas y evidencias

- **Ver los fragmentos que recupera la búsqueda** para una pregunta, con su puntaje de similitud coseno:

  ```bash
  npx tsx consultar.ts "¿puedo meter comida al instituto?"
  ```

- **Regenerar el índice y probar la búsqueda:**

  ```bash
  npx tsx build-index.ts --test
  ```

- **Banco de preguntas:** [CONFIRMAR: ruta o enlace a la tabla de resultados]

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

Cuando cambien las normativas o la información general, hay que regenerar el índice, o el asistente seguirá respondiendo con la información anterior.

1. Edita `src/data/institutionKnowledge.ts` o `src/data/extraKnowledge.ts`.
2. Detén el servidor y ejecuta:

   ```bash
   npx tsx build-index.ts
   ```

   Solo recalcula los fragmentos modificados y reutiliza los vectores anteriores. Si la API devuelve un error de cuota, espera y vuelve a ejecutarlo: el progreso queda guardado en `.embed-cache.json`.
3. Reinicia el servidor (carga el índice una sola vez).
4. Sube los cambios, incluido `src/data/embeddingsIndex.json`.

## Despliegue en Render

- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/info`
- Las variables de entorno se agregan en el panel de Render.

Cada `git push` a la rama `main` vuelve a desplegar el servicio. Ollama no funciona en Render: allí el respaldo es el de proveedores en la nube y, al final, las respuestas fijas.

## Limitaciones

- Solo conoce los documentos cargados; no accede a notas, horarios personales ni datos de estudiantes.
- No incluye el detalle de módulos por año de cada especialidad; en esos casos orienta a Registro Académico o a la Dirección.
- Parte de la información complementaria (calendario, becas, comités) debe ser validada por la institución. Las fechas de matrícula son del proceso 2025.
- El dictado por voz requiere internet y funciona en Chrome y Edge, no en navegadores como Brave.
- Las APIs usan planes gratuitos con límites de cuota.
- El modelo local es más lento y menos preciso que los de la nube.
- Aunque la arquitectura reduce las alucinaciones, no las elimina por completo.

