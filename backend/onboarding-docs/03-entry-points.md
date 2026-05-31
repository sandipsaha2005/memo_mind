# MemoMind Backend — Entry Points

## HTTP Server

- **File**: `main.ts`
- **Invocation**: `deno task dev` (development, file-watching) or `deno task start` (production)
- **What it does**: Connects to MongoDB and ChromaDB, instantiates all four controllers, creates the Hono app, and starts listening on port 9999 on all interfaces (`0.0.0.0`)
- **Required env/config**: `JWT_SECRET`, `OPEN_ROUTER_API_KEY`, `MONGO_URL`, `CHROMA_DB_URL`
- **Notes**: No CLI flags — all configuration is via environment variables loaded from `.env` at startup via `@std/dotenv/load` (imported in `src/app.ts`)

---

## deno.json Tasks

| Task | Command | Use |
|------|---------|-----|
| `deno task dev` | `deno run --watch --allow-ffi --allow-net --allow-env --allow-read --allow-sys main.ts` | Development with hot reload |
| `deno task start` | `deno run --allow-ffi --allow-net --allow-env --allow-read --allow-sys main.ts` | Production / Docker |

> `--allow-ffi` is required by `@logan/libsql-search` which calls native code for local embedding generation.

---

## Startup Sequence (main server)

1. **`src/app.ts`** loads `@std/dotenv/load` → reads `.env` into `Deno.env`
2. **`main.ts:main()`**:
   a. `getDB()` — opens MongoDB connection (singleton), selects `memo_mind` database
   b. `chrom_db.ts` (top-level `await`) — connects to ChromaDB, calls `getOrCreateCollection("rag_chunks")`
   c. Instantiates `MongoAuthController(usersCollection)`
   d. Instantiates `NotebookController(notebooksCollection, interactionCollection)`
   e. Instantiates `RetrievalController(chromaDocuments)`
   f. Instantiates `IngestionController(chromaDocuments)`
   g. `createApp(...)` — builds Hono app with middleware + routes
3. `Deno.serve({ port: 9999, hostname: "0.0.0.0" }, app.fetch)` — begins accepting requests

> **Note:** ChromaDB connection (`chrom_db.ts`) uses a top-level `await`, so it resolves before `main()` even runs. If ChromaDB is unreachable at startup, the process exits immediately.

---

## No Background Jobs or CLI

There are no cron jobs, message queue consumers, CLI commands, or serverless handlers. The only way to trigger logic is via HTTP.
