# MemoMind Backend — Gotchas

---

## Retrieval Loop Runs 3× Even After Evaluation Passes

**What**: `RetrievalController.retrieve()` calls `evaluateChunks()` once before the while-loop and stores the result in `evalRes`. The while condition checks `evalRes.sufficient` — but `evalRes` is never reassigned inside the loop. So if the initial evaluation returns `{ sufficient: false }`, the loop always runs all 3 iterations regardless of whether later chunks would have been sufficient.

**Why**: Likely an incomplete implementation — the intent was to re-evaluate after each follow-up search, but the re-evaluation call was never added inside the loop.

**How to handle it**: When adding follow-up queries, reassign `evalRes` inside the loop after each search batch:
```ts
// Inside the while loop, after pushing new chunks:
const newEval = await this.evaluateChunks(chunks, body.text);
if (newEval.sufficient) break;
```

---

## Login Also Registers — No Separate Sign-Up Endpoint

**What**: `POST /login` will silently create a new user if the email doesn't exist. There is no `POST /register` endpoint.

**Why**: Likely intentional for simplicity in early development.

**How to handle it**: If you need to distinguish "first login" from "returning login" in the frontend, check the response — both cases return `{ success: true }`. You'd need to add a flag (e.g. `isNewUser`) to the response, or check if the notebook list is empty.

---

## Passwords Are Stored and Compared in Plain Text

**What**: `auth_controller.ts` does `body.password === presentUser.password`. Passwords go into MongoDB as plain strings.

**Why**: No hashing has been implemented.

**How to handle it**: Before adding any real users, add bcrypt or Argon2 hashing to `MongoAuthController.login()`.

---

## PDF File Content Is Not Actually Ingested

**What**: `ingestionHandler` accepts a `file` field in the FormData and parses it with `PdfReader`. However, the parsed text is only `console.log`ged — it is never passed to `ingestionController.ingest()`. PDF uploads silently succeed without storing any content.

**Why**: The PDF parsing integration was started but never completed.

**How to handle it**: The `PdfReader.parseBuffer` callback must accumulate the text and pass it to `ingestionController.ingest()` once parsing is complete. Note that `parseBuffer` is callback-based and must be promisified to work with the async handler.

---

## `ingestionController.ingest()` Is Fire-and-Forget

**What**: In `ingestionHandler`, the call to `ingestionController.ingest(payload)` is **not awaited**. The handler immediately calls `controller.updateNotebook(...)` and returns success — whether or not the actual embedding write to ChromaDB succeeded.

**Why**: Missing `await` — `src/api/handler/query_handlers.ts:37`.

**How to handle it**: Add `await` before `ingestionController.ingest(payload)`. Without it, ChromaDB errors are silently lost and the notebook is marked as ingested even when it isn't.

---

## Chunk IDs Are Hardcoded and May Collide

**What**: `IngestionController.ingest()` generates chunk IDs as `` `${10}_${10}_${Date.now()}_${i}` ``. The two `10`s are hardcoded literals — they were likely meant to be `body.userId` and `body.notebookId`.

**Why**: Placeholder values that were never replaced.

**How to handle it**: If two ingestion calls happen in the same millisecond, their chunk IDs will collide and one will overwrite the other in ChromaDB. Replace with actual userId and notebookId.

---

## `CHROMA_DB_URL` Does Not Include Protocol or Port

**What**: `chrom_db.ts` constructs the ChromaDB client as:
```ts
new ChromaClient({ host: Deno.env.get("CHROMA_DB_URL"), port: 8000, ssl: false })
```
The env var should be just the hostname (e.g. `localhost` or `chroma`) — **not** a full URL with `http://`.

**Why**: The ChromaDB client takes `host` and `port` separately.

**How to handle it**: If you set `CHROMA_DB_URL=http://localhost:8000`, the connection will fail. Keep it as `localhost` (local) or `chroma` (Docker).

---

## `deleteNotebook` Uses GET, Not DELETE

**What**: `GET /api/notebook/delete/:id` deletes the notebook. This is not RESTful.

**Why**: Likely an oversight — DELETE methods can be tricky with some HTTP clients.

**How to handle it**: Be aware when writing API clients or curl commands — you need `GET`, not `DELETE`.

---

## `GEMINI_API_KEY2` Is Set but Never Used

**What**: Both `.env` files define `GEMINI_API_KEY2` but no code in the repository reads it.

**Why**: Leftover from an earlier design using Google's Gemini API directly before switching to OpenRouter.

**How to handle it**: Ignore it. Don't build anything on top of it without first checking if the key is still valid.

---

## Conventions Worth Knowing

- **Controllers are injected via Hono context** at startup in `src/app.ts`. Handlers call `c.get("controllerName")` to access them — this is the DI pattern used throughout.
- **`notebookId` is stored as a plain string** in the `interaction` collection but as an `ObjectId` in the `notebook` collection. Don't accidentally pass an ObjectId where a string is expected.
- **Error responses always use status 400 for `AppError`** — even if the error is logically a 404 or 422. The `statusCode` field on `AppError` is defined but not used in the handlers.
- **No request body validation** — handlers cast directly with `as string` or `as RequestBody`. Missing fields silently become `null`.

---

## Known Tech Debt

- Dead code: `src/services/rag/embeddings_retriver.ts` (old in-memory cosine search), `response_generator.ts:generateResponseUsingOllama()` — safe to delete
- PDF ingestion is wired but broken (`ingestionHandler` never feeds PDF text into pipeline)
- Missing `await` on `ingestionController.ingest()` — fire-and-forget swallows errors
- Passwords stored in plain text
- No tests
- Secrets committed to `.env` and `.env.stage`
