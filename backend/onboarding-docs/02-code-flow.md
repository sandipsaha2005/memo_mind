# MemoMind Backend — Code Flows

---

## Flow 1: Login (Auto-register if new user)

**Trigger:** `POST /login` with JSON `{ email, password }`  
**Path:** `auth_handlers.ts` → `MongoAuthController.login()` → MongoDB `users` → JWT cookie set

```mermaid
sequenceDiagram
    participant Client
    participant H as auth_handlers.ts:loginHandler
    participant AC as MongoAuthController.login()
    participant DB as MongoDB users collection

    Client->>H: POST /login { email, password }
    H->>AC: login({ email, password })
    AC->>DB: findOne({ email })
    alt user exists
        DB-->>AC: UserSchema doc
        AC->>AC: password === doc.password?
        alt mismatch
            AC-->>H: throw Error("Password is not matched")
            H-->>Client: 200 { success: false, message }
        end
    else user not found
        AC->>DB: insertOne({ email, password })
        DB-->>AC: insertedId
        AC->>DB: findOne({ _id: insertedId })
        DB-->>AC: new UserSchema doc
    end
    AC-->>H: UserSchema doc
    H->>H: sign JWT { id, email } with JWT_SECRET (HS256)
    H->>H: setCookie("token", jwt)
    H-->>Client: 200 { success: true, message: "logged in successfully" }
```

### Step-by-step

1. **`src/api/handler/auth_handlers.ts:loginHandler`** — reads JSON body, delegates to controller
2. **`src/controllers/auth_controller.ts:MongoAuthController.login()`** — looks up user by email; if found, validates password; if not found, inserts the user (login = auto-register on first call)
3. **`src/api/handler/auth_handlers.ts`** — signs a JWT carrying `{ id, email }` and sets it as an HTTP-only cookie named `token`
4. All subsequent `/api/*` routes read this cookie via Hono's `jwtMiddleware` and expose the payload as `c.get("jwtPayload")`

> **Gotcha:** There is no separate registration endpoint. First login with a new email silently creates the account.

---

## Flow 2: Document Ingestion

**Trigger:** `POST /api/ingest` (FormData: `text`, `notebookId`, optional `file` PDF)  
**Path:** `query_handlers.ts` → `IngestionController.ingest()` → `embeddings_generator` → ChromaDB, then `NotebookController.updateNotebook()` → MongoDB

```mermaid
sequenceDiagram
    participant Client
    participant H as query_handlers.ts:ingestionHandler
    participant IC as IngestionController.ingest()
    participant EG as embeddings_generator
    participant CHROMA as ChromaDB rag_chunks
    participant NC as NotebookController.updateNotebook()
    participant MONGO as MongoDB notebooks

    Client->>H: POST /api/ingest (FormData: text, notebookId, [file])
    Note over H: JWT middleware already validated token, userId available
    H->>H: parse FormData → { text, notebookId, userId }
    H->>IC: ingest({ text, notebookId, userId })
    IC->>EG: tokenize(text, chunkSize=3, overlap=1)
    EG-->>IC: string[] of sentence-chunks
    loop per chunk
        IC->>EG: generateEmbedding(chunk, { provider:"local", dimensions:768 })
        EG-->>IC: Chunk { text, embedding: number[768], id }
    end
    IC->>CHROMA: collection.add({ ids, embeddings, documents, metadatas })
    Note over CHROMA: metadatas = { userId, chatId: notebookId, timestamp }
    H->>NC: updateNotebook(notebookId)
    NC->>MONGO: updateOne (set isInitialIngestDone=true if first ingest)
    H-->>Client: 200 { success: true, message: "Embeddings generated successfully" }
```

### Step-by-step

1. **`src/api/handler/query_handlers.ts:ingestionHandler`** — extracts `text`, `notebookId`, `userId` (from JWT payload) from FormData; handles optional PDF file (currently only logs text, does not feed it to ingestion — see Gotchas doc)
2. **`src/controllers/ingestion_controller.ts:IngestionController.ingest()`** — calls tokenize then loops over chunks to generate embeddings
3. **`src/services/rag/embeddings_generator.ts:tokenize()`** — splits on sentence-ending punctuation (`.!?`), groups into windows of 3 with 1-sentence overlap
4. **`src/services/rag/embeddings_generator.ts:generate()`** — calls `@logan/libsql-search:generateEmbedding` locally for each chunk; 768-dimensional vectors
5. **ChromaDB `rag_chunks`** — stores vectors with metadata so they can later be filtered by `userId + notebookId`
6. **`NotebookController.updateNotebook()`** — atomic MongoDB update: flips `isInitialIngestDone` to `true` on first ingest only; does not increment `ingestCount` after that

---

## Flow 3: Query / Retrieval (the main RAG loop)

**Trigger:** `POST /api/retrieve` with JSON `{ text, notebookId }`  
**Path:** `query_handlers.ts` → save query interaction → `RetrievalController.retrieve()` (iterative) → `generateResponse()` → save response interaction → return answer

```mermaid
sequenceDiagram
    participant Client
    participant H as query_handlers.ts:retrievalHandler
    participant NC as NotebookController
    participant RC as RetrievalController.retrieve()
    participant EG as embeddings_generator
    participant CHROMA as ChromaDB rag_chunks
    participant OR_EVAL as OpenRouter (evaluator)
    participant RG as response_generator
    participant OR_GEN as OpenRouter (answer)
    participant MONGO as MongoDB interaction

    Client->>H: POST /api/retrieve { text, notebookId }
    H->>NC: addInteraction({ type:"query", content: text, notebookId })
    NC->>MONGO: insertOne(interaction)

    H->>RC: retrieve({ text, notebookId }, userId)
    RC->>EG: tokenize + generate(text)
    RC->>CHROMA: query(embeddings, nResults=10, where {userId, chatId})
    CHROMA-->>RC: string[] chunks

    RC->>OR_EVAL: evaluateChunks(chunks, question)
    OR_EVAL-->>RC: { sufficient: true } or { sufficient: false, followUpQuery: [...] }

    loop while !sufficient && i < 3
        loop per followUpQuery
            RC->>EG: tokenize + generate(followUpQuery)
            RC->>CHROMA: query(followUpQuery embeddings)
            CHROMA-->>RC: more chunks
        end
        Note over RC: appends new chunks to existing set (no dedup)
    end

    H->>NC: getNoteBook(notebookId)
    NC->>MONGO: findOne(notebook) + find(interactions)
    MONGO-->>H: last N interactions

    H->>RG: generateResponse(text, chunks, interactions)
    RG->>OR_GEN: chat.send({ system: chunks as context, history: last 10, user: text })
    OR_GEN-->>RG: answer message
    RG-->>H: { content: answerText }

    H->>NC: addInteraction({ type:"response", content: answerText, notebookId })
    NC->>MONGO: insertOne(interaction)

    H-->>Client: 200 { success: true, content: answerText, query: text }
```

### Step-by-step

1. **`retrievalHandler`** — saves the user's query as a `type:"query"` interaction immediately (before retrieval, so it's in history on next turn)
2. **`RetrievalController.retrieve()`** — embeds the query, searches ChromaDB top-10 filtered by userId+notebookId
3. **`RetrievalController.evaluateChunks()`** — sends chunks + question to Gemma via OpenRouter; expects raw JSON back (`{ "sufficient": true }` or `{ "sufficient": false, "followUpQuery": [...] }`). No retry/fallback if JSON parsing fails.
4. **Iteration loop** — if not sufficient, embeds each follow-up query and concatenates new results. Counter `i` increments each outer loop, but the `while` condition checks `evalRes.sufficient` which is set only once before the loop — **the loop will always run 3 times if initially insufficient** (see Gotchas)
5. **`NotebookController.getNoteBook()`** — fetches all interactions for this notebook; `generateResponse` uses `slice(-10)` to limit to last 10
6. **`generateResponse()`** — builds system prompt from retrieved chunks, prepends chat history, sends to Gemma for final answer
7. **`retrievalHandler`** — saves the LLM answer as `type:"response"` interaction

---

## Flow 4: Notebook CRUD

**Trigger:** Various `GET/POST /api/notebook/*` routes (all JWT-protected)

These are straightforward CRUD operations. The interesting piece is how `userId` scoping works:

- **Create** (`POST /api/notebook/create`): handler reads `jwtPayload.id`, converts to `ObjectId`, passes as `userId` on the notebook document
- **Get all** (`GET /api/notebook/get-all`): `NotebookController.getAllNotebook(id)` filters `{ userId: new ObjectId(id) }` — only returns notebooks owned by the caller
- **Get one** (`GET /api/notebook/get/:id`): returns notebook + all its interactions (no userId check on this route — anyone with the ID can fetch it)
- **Delete** (`GET /api/notebook/delete/:id`): cascades — deletes notebook doc **and** all interactions with matching `notebookId`

> **Note:** Delete uses `GET` method, not `DELETE` — a REST convention deviation worth knowing.
