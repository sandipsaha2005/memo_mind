# MemoMind Backend — Overview

> A RAG-powered knowledge notebook API: users upload documents into named notebooks and ask questions answered by an LLM grounded in only that notebook's content.

---

## What Is This?

MemoMind is the backend service for a personal knowledge-management app. Users create **notebooks**, upload PDF or text documents into them, then query those notebooks in natural language. The backend ingests documents into a vector store, retrieves the most relevant chunks at query time, and generates grounded answers via an LLM — all scoped per user and per notebook so answers never bleed between projects.

The service is consumed by a frontend (Vite/React, running on port 5173) and is not exposed publicly — it sits behind an nginx reverse proxy in Docker. Authentication is cookie-based JWT: the same token that proves identity also carries the `userId` used to filter vector search results.

The core value is the **iterative retrieval loop**: if the first round of retrieved chunks is judged insufficient by the LLM, the evaluator generates smarter follow-up queries and searches again (up to 3 rounds), improving answer quality without requiring the user to rephrase.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript (Deno runtime) | Deno latest |
| Web framework | Hono | ^4.12.14 |
| Vector DB | ChromaDB | ^3.4.3 |
| Document DB | MongoDB | ^7.2.0 |
| Embeddings | @logan/libsql-search (local, 768-dim) | ^0.1.3 |
| LLM API | OpenRouter → google/gemma-4-26b-a4b-it | ^0.12.25 |
| PDF parsing | pdfreader | ^3.0.8 |
| Deployment | Docker + nginx (3 replicas) | — |

---

## Repository Structure

```
backend/
├── main.ts                  # App entry point: wires DB + controllers → starts server
├── deno.json                # Task runner + dependency imports
├── Dockerfile               # Container image (denoland/deno:latest)
├── .env                     # Local dev secrets (never commit)
├── .env.stage               # Docker-compose secrets (uses service hostnames)
├── src/
│   ├── app.ts               # Hono factory: middleware + route registration
│   ├── api/
│   │   ├── handler/         # HTTP layer — parse req, call controller, return JSON
│   │   ├── middleware/       # CORS + JWT middleware
│   │   └── routes/          # Sub-routers (notebook)
│   ├── controllers/         # Business logic orchestration (auth, notebook, rag)
│   ├── services/rag/        # Embedding generation, cosine retrieval, LLM response
│   ├── infra/
│   │   ├── clients/         # OpenRouter API client
│   │   └── database/        # MongoDB + ChromaDB connection singletons
│   └── shared/
│       ├── types/           # All shared TypeScript types
│       ├── errors/          # Custom error hierarchy (AppError subclasses)
│       └── utils/           # (reserved)
└── onboarding-docs/         # This documentation
```

---

## Key Stats

- **Language:** TypeScript on Deno (no Node.js)
- **License:** not specified
- **Primary contributor:** sandip
- **No tests:** zero test files found in the repo
- **Commits:** 9 total — project is early-stage
