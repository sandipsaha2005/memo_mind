import { ChromaClient } from "chromadb";

const chroma = new ChromaClient({ host: "chroma", port: 8000, ssl: false });
export const rabCollection = await chroma.getOrCreateCollection({
  name: "rag_chunks",
  embeddingFunction: null,
});
