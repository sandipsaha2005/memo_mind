# AGENT.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Runtime & Commands

This is a **Deno** project (not Node.js). Use `deno` commands, not `npm`/`node`.

```bash
deno task dev     # development with file watching
deno task start   # production start
```

Port: **9999**

## Architecture Overview

Layered architecture: **Handlers → Controllers → Services/Infrastructure**

- `main.ts` — wires MongoDB connection + all controllers → passes to `createApp()`
- `src/app.ts` — Hono app factory; registers middleware (CORS, JWT on `/api/*`) and routes
- `src/api/handler/` — HTTP layer: parses requests, calls controllers, returns JSON
- `src/controllers/` — orchestrates business logic and DB operations
- `src/services/rag/` — RAG pipeline: embedding generation, retrieval, LLM response
- `src/infra/` — DB clients (MongoDB, ChromaDB) and external API clients (OpenRouter)
- `src/shared/` — shared types and custom error classes

## RAG Pipeline

**Ingestion** (`POST /api/ingest`):
1. Parse PDF or text from FormData
2. Tokenize into sentence-based chunks (3 sentences, 1 overlap)
3. Generate embeddings via `@logan/libsql-search` (local, 768 dims)
4. Store in ChromaDB collection `rag_chunks` with metadata `{ userId, chatId (notebookId), timestamp }`

**Retrieval** (`POST /api/retrieve`):
1. Generate query embeddings → search ChromaDB (top 10, filtered by userId + notebookId)
2. Evaluation loop (up to 3 iterations): OpenRouter checks if chunks are sufficient; if not, generates follow-up queries and re-searches
3. Generate response via OpenRouter (`google/gemma-4-26b-a4b-it`) with retrieved chunks + last 10 interactions as history
4. Persist query and response as `interaction` documents in MongoDB

## Databases

- **MongoDB** (`memo_mind` database): collections `users`, `notebooks`, `interaction`
- **ChromaDB**: vector store for embeddings; collections created on first access via `getOrCreateCollection()`
- No migrations — schema is implicit in controller code

## Environment Variables

Copy `.env` for local dev; `.env.stage` uses Docker service hostnames (`mongo`, `chroma`).

Key vars: `JWT_SECRET`, `OPEN_ROUTER_API_KEY`, `MONGO_URL`, `CHROMA_DB_URL`

## Docker

The full stack is defined in `../compose.yaml` (one level up):
- Backend runs as 3 Deno replicas behind nginx
- Networks: `front-tier` (frontend↔backend), `back-tier` (backend↔MongoDB/ChromaDB)

```bash
docker compose -f ../compose.yaml up
```

## API Routes

All `/api/*` routes require JWT cookie (`token`, HS256).

| Method | Route | Handler |
|--------|-------|---------|
| POST | `/login` | loginHandler |
| POST | `/api/ingest` | ingestionHandler |
| POST | `/api/retrieve` | retrievalHandler |
| POST | `/api/notebook/create` | createNotebookHandler |
| GET | `/api/notebook/get-all` | getAllNotebooksHandler |
| GET | `/api/notebook/get/:id` | getNotebookHandler |
| GET | `/api/notebook/delete/:id` | deleteNotebookHandler |

## Error Handling

Custom error classes in `src/shared/errors/error.ts`: `AppError`, `InternalServerError`, `NotFoundError`, `BadRequestError`. All responses follow `{ success, message, [data] }`.
