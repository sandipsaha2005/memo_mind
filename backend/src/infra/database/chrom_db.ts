import { ChromaClient } from "chromadb";

const chroma = new ChromaClient({
  host: Deno.env.get("CHROMA_DB_URL"),
  port: 8000,
  ssl: false,
});

export const documents = await chroma.getOrCreateCollection({
  name: "rag_chunks",
  embeddingFunction: null,
});
