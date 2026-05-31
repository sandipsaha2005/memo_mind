# MemoMind Backend — Dependencies

All dependencies are declared in `deno.json` using Deno's import map syntax. Deno resolves `jsr:` packages from the JSR registry and `npm:` packages from npm.

---

## Core Dependencies

| Package | Version | Why It's Used |
|---------|---------|--------------|
| `hono` | `npm:^4.12.14` | Lightweight HTTP framework; chosen for its native Deno/edge support, built-in JWT middleware, and cookie helpers — avoids the Node.js-centric overhead of Express |
| `mongodb` | `npm:^7.2.0` | Official MongoDB driver; stores users, notebooks, and interaction history |
| `chromadb` | `npm:^3.4.3` | Vector database client; stores and queries document embeddings with metadata filtering |
| `@logan/libsql-search` | `jsr:^0.1.3` | Local embedding generation (768-dim); runs entirely on-device via FFI — no external embedding API needed, no latency or cost per embed |
| `@openrouter/sdk` | `npm:^0.12.25` | OpenRouter client; routes LLM calls to `google/gemma-4-26b-a4b-it` for both chunk evaluation and answer generation |
| `pdfreader` | `npm:^3.0.8` | PDF text extraction; used in `ingestionHandler` to parse uploaded PDFs — **currently wired but not feeding text into the ingestion pipeline** |
| `@std/dotenv` | `jsr:^0.225.6` | Loads `.env` file into `Deno.env` at app startup |
| `@std/collections` | `jsr:^1.1.7` | Deno standard library collections utilities |
| `@std/assert` | `jsr:1` | Deno standard library assertions |

---

## External Services

| Service | Used For | Auth Method | Config Key |
|---------|----------|-------------|------------|
| MongoDB | Users, notebooks, interaction history | Connection string | `MONGO_URL` |
| ChromaDB | Vector storage and semantic search | Host URL (no auth) | `CHROMA_DB_URL` |
| OpenRouter | LLM inference (Gemma 4 26B) | API key in header | `OPEN_ROUTER_API_KEY` |

---

## Notable Observations

**`@logan/libsql-search` (JSR)** — This is an unusual choice. It's a small JSR package that wraps a local ONNX/native model via Deno FFI (`--allow-ffi` is required). This keeps embeddings free and offline but ties the service to a specific host architecture and requires the native binary to be present (handled in the Docker build via `deno install`).

**No validation library** — There is no Zod, Yup, or equivalent. Request bodies are cast directly with `as` type assertions (e.g. `body.get("text") as string`). If a client sends a missing or wrong-type field, it silently passes as `null` or `undefined`.

**OpenRouter used twice** — The same `openRouterClient` singleton is used for both the evaluation step (deciding if chunks are sufficient) and the final answer generation step. Both calls use the same model (`google/gemma-4-26b-a4b-it`) but with different system prompts and token budgets (200 vs 1000).

**Dead Ollama dependency** — `response_generator.ts` contains `generateResponseUsingOllama()` which calls `http://localhost:11434`. This is not imported or called anywhere — leftover from an earlier local-LLM experiment.
