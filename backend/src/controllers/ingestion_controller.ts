import { Collection } from "chromadb";
import { generate, tokenize } from "../services/rag/embeddings_generator.ts";

export class IngestionController {
  private documents: Collection;
  constructor(documents: Collection) {
    this.documents = documents;
  }

  async ingest(body: { text: string; notebookId: string; userId: string }) {
    const tokenized = tokenize(body.text);
    const chunks = await generate(tokenized);

    await this.documents.add({
      ids: chunks.map((_, i) => `${10}_${10}_${Date.now()}_${i}`),
      embeddings: chunks.map(({ embedding }) => embedding),
      documents: chunks.map(({ text }) => text),
      metadatas: chunks.map(() => ({
        userId: body.userId,
        chatId: body.notebookId,
        timestamp: Date.now(),
      })),
    });
  }
}
