# MemoMind Backend — Dev Setup

## Prerequisites

- **Deno** (latest stable) — install via `brew install deno` or `curl -fsSL https://deno.land/install.sh | sh`
- **MongoDB** — local instance on port 27017 (or use Docker)
- **ChromaDB** — local instance on port 8000 (or use Docker)
- **Docker + Docker Compose** — only needed for full-stack mode (`../compose.yaml`)

No `.nvmrc` or `.tool-versions` file exists. Deno version is pinned implicitly via `deno.lock`.

---

## Option A: Run backend only (local dev)

```bash
# 1. Clone the repo
git clone <repo-url>
cd memo_mind/backend

# 2. Start MongoDB (if not already running)
# macOS: brew services start mongodb-community
# Or with Docker:
docker run -d -p 27017:27017 --name mongo mongo:latest

# 3. Start ChromaDB
docker run -d -p 8000:8000 --name chroma chromadb/chroma:latest

# 4. Environment is already set in .env — review and adjust if needed
# The .env file is committed to the repo (not a .env.example)
cat .env

# 5. Install dependencies (populates node_modules via Deno)
deno install

# 6. Start dev server with hot reload
deno task dev
# → Listening on http://0.0.0.0:9999
```

---

## Option B: Full stack with Docker Compose

```bash
# From the repo root (one level above backend/)
cd memo_mind

docker compose -f compose.yaml up
# → nginx reverse proxy, 3 backend replicas, MongoDB, ChromaDB all start together
```

---

## Verify It's Working

```bash
# Hit the login endpoint (auto-creates a user on first call)
curl -c cookies.txt -X POST http://localhost:9999/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
# → {"success":true,"message":"logged in successfully"}

# Create a notebook (uses the cookie set above)
curl -b cookies.txt -X POST http://localhost:9999/api/notebook/create \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Notebook"}'
# → {"success":true,"message":"Notebook created successfully","data":"<objectId>"}
```

---

## Common Issues

**ChromaDB connection fails at startup**
`chrom_db.ts` uses a top-level `await` — if ChromaDB isn't reachable, the process exits before `main()` runs. Start ChromaDB first.

**`Deno.env.get("MONGO_URL")` is undefined**
The `.env` file must exist in the `backend/` directory. `@std/dotenv/load` is imported in `src/app.ts` and reads `.env` relative to the working directory. Run `deno task dev` from `backend/`, not from a subdirectory.

**`--allow-ffi` permission error**
The embedding library `@logan/libsql-search` requires `--allow-ffi`. This is already included in both `deno task dev` and `deno task start` — don't strip it.

**Port 9999 in use**
Port is hardcoded in `main.ts:34` (`Deno.serve({ port: 9999 })`). Kill the existing process or change the constant directly.

**CORS errors from frontend**
Allowed origins are hardcoded in `src/api/middleware/cors.ts`: `http://localhost:5173` and `http://localhost:3000`. If your frontend runs on a different port, update that file.

**`SyntaxError: JSON.parse` on retrieval**
The LLM evaluator (`RetrievalController.evaluateChunks`) calls `JSON.parse()` on the raw LLM output. If the model wraps its response in a markdown code block, parsing will fail. This is a known fragility — see Gotchas.
