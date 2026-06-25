# Memo Mind

Memo Mind is a full-stack notebook and chat application for asking questions about uploaded content. Users can create notebooks, upload text or PDF files, and chat with the stored knowledge. The backend chunks uploaded content, stores embeddings in ChromaDB, keeps app data in MongoDB, and uses OpenRouter to generate retrieval augmented answers.

## Tech Stack

- Frontend: React, TypeScript, and Vite
- Backend: Deno and Hono
- Database: MongoDB
- Vector store: ChromaDB
- LLM provider: OpenRouter

## Project Structure

```text
.
├── frontend/        # React/Vite web app
├── backend/         # Deno/Hono API and RAG pipeline
├── compose.yaml     # Main Docker Compose stack
└── compose.dev.yaml # Development Docker Compose stack
```

## Environment Files

Create the following environment files before running the project.

### Backend

Docker Compose loads backend environment variables from:

```text
backend/.env.stage
```

Required variables:

```env
JWT_SECRET=replace-with-a-secret-value
OPEN_ROUTER_API_KEY=replace-with-your-openrouter-api-key
MONGO_URL=mongodb://mongo:27017/memo_mind
CHROMA_DB_URL=http://chroma:8000
```

`MONGO_URL` and `CHROMA_DB_URL` should use the Docker service names shown above when running with Docker Compose.

### Frontend

Vite uses these frontend environment files:

```text
frontend/.env.development
frontend/.env.production
```

Required variable:

```env
VITE_API_URL=/api
```

## Run With Docker

From the repository root, run:

```bash
docker compose up
```

The app will be available at:

```text
http://localhost:3000
```

Docker Compose starts the frontend, backend, MongoDB, and ChromaDB services. MongoDB is also exposed on local port `5000`.

To stop the stack, press `Ctrl+C`. To remove containers and networks after stopping:

```bash
docker compose down
```

## Optional Local Development

You can also run the frontend and backend directly if MongoDB and ChromaDB are available.

Backend:

```bash
cd backend
deno task dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
