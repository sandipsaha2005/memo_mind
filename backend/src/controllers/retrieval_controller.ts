import { Collection } from "chromadb";
import { generate, tokenize } from "../services/rag/embeddings_generator.ts";
import { RequestBody } from "../shared/types/types.ts";

export class RetrievalController {
  private documents: Collection;

  constructor(documents: Collection) {
    this.documents = documents;
  }

  async retrieve(body: RequestBody, userId: string) {
    const tokenizedQuery = tokenize(body.text);
    const queryEmbeddings = await generate(tokenizedQuery);

    const results = await this.documents.query({
      queryEmbeddings: queryEmbeddings.map(({ embedding }) => embedding),
      nResults: 10,
      where: {
        $and: [
          { userId: { $eq: userId } },
          { chatId: { $eq: body.notebookId } },
        ],
      },
      include: ["documents", "metadatas", "distances"],
    });

    return results;
  }
}
