# MemoMind Backend — Config & Environment

## Environment Variables

| Variable | Required | Local default | Docker default | Description |
|----------|----------|--------------|----------------|-------------|
| `JWT_SECRET` | ✓ | `"reddit"` | `"reddit"` | HS256 signing secret for JWT cookies |
| `OPEN_ROUTER_API_KEY` | ✓ | `sk-or-v1-...` | `sk-or-v1-...` | OpenRouter API key for LLM calls |
| `MONGO_URL` | ✓ | `mongodb://127.0.0.1:27017` | `mongodb://mongo:27017` | MongoDB connection string |
| `CHROMA_DB_URL` | ✓ | `localhost` | `chroma` | ChromaDB host (no protocol, no port — port 8000 is hardcoded in `chrom_db.ts`) |
| `GEMINI_API_KEY2` | — | set in .env | set in .env | Present in both env files but **not used anywhere** in the codebase — dead variable |

> **⚠️ Security note:** The default `JWT_SECRET` value `"reddit"` and the API keys in `.env`/`.env.stage` are committed to the repository. These must be rotated before any public deployment.

---

## Config Files

### `.env`
- **Purpose**: Local development secrets
- **Key difference from `.env.stage`**: `MONGO_URL` points to `127.0.0.1:27017`, `CHROMA_DB_URL` is `localhost`

### `.env.stage`
- **Purpose**: Secrets for Docker Compose environment
- **Key difference from `.env`**: `MONGO_URL` uses `mongo` (Docker service name), `CHROMA_DB_URL` uses `chroma` — both resolvable only on the Docker `back-tier` network

### `deno.json`
- **Format**: Deno task + import map file
- **Tasks**: `dev` (with `--watch`) and `start`
- **Deno permissions**: `--allow-ffi` (for local embedding model), `--allow-net`, `--allow-env`, `--allow-read`, `--allow-sys`

### `src/infra/database/chrom_db.ts` — hardcoded config
```ts
port: 8000,   // hardcoded — not env-configurable
ssl: false,   // hardcoded
```
ChromaDB port and SSL are not environment-configurable.

---

## Environment Differences

| Behaviour | Local dev | Docker (stage) |
|-----------|-----------|----------------|
| MongoDB host | `127.0.0.1:27017` | `mongo:27017` |
| ChromaDB host | `localhost` | `chroma` |
| CORS origins | `localhost:5173`, `localhost:3000` | same (hardcoded in `cors.ts`) |
| Replicas | 1 (direct `deno task dev`) | 3 (nginx load-balanced) |
| Hot reload | ✓ (`--watch`) | ✗ |

---

## Hardcoded Values Worth Knowing

| Value | Location | Should probably be env var |
|-------|----------|--------------------------|
| ChromaDB port `8000` | `src/infra/database/chrom_db.ts:6` | ✓ |
| ChromaDB `ssl: false` | `src/infra/database/chrom_db.ts:7` | for prod |
| CORS origins `localhost:5173`, `localhost:3000` | `src/api/middleware/cors.ts` | ✓ |
| LLM model `google/gemma-4-26b-a4b-it` | `src/controllers/retrieval_controller.ts:64`, `src/services/rag/response_generator.ts:53` | ✓ |
| Embedding dimensions `768` | `src/services/rag/embeddings_generator.ts:9` | — |
| Max retrieval iterations `3` | `src/controllers/retrieval_controller.ts:19` | — |
| Chunk size `3` sentences, overlap `1` | `src/services/rag/embeddings_generator.ts:26` | — |
