import { Collection } from "chromadb";
import { generate, tokenize } from "../services/rag/embeddings_generator.ts";
import { EvaluationResult, RequestBody } from "../shared/types/types.ts";
import { openRouterClient } from "../infra/clients/open_router.ts";

export class RetrievalController {
  private documents: Collection;

  constructor(documents: Collection) {
    this.documents = documents;
  }

  async retrieve(body: RequestBody, userId: string) {
    let i = 0;
    const chunks = [];
    chunks.push(...await this.search(body, userId));
    const evalRes = await this.evaluateChunks(chunks, body.text);

    while (!evalRes.sufficient && i < 3) {
      if (evalRes.sufficient) break;

      for (const query of evalRes.followUpQuery) {
        console.log({ query });

        const payload: RequestBody = {
          text: query,
          notebookId: body.notebookId,
        };

        chunks.push(...await this.search(payload, userId));
      }
      i++;
    }

    return chunks;
  }

  async search(body: RequestBody, userId: string) {
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

    return results.documents[0] as string[];
  }

  async evaluateChunks(
    chunks: string[],
    question: string,
  ): Promise<EvaluationResult> {
    const completion = await openRouterClient.chat.send({
      chatRequest: {
        maxTokens: 200,
        model: "google/gemma-4-26b-a4b-it",
        messages: [
          {
            role: "system",
            content:
              `You are an evaluator. Given a question and some context chunks,
          decide if the chunks contain enough information to answer the question.
          
          Respond ONLY in this JSON format, nothing else:
          { "sufficient": true }
          or
          { "sufficient": false, "followUpQuery": [
           "<a better search query>"
           ] }`,
          },
          {
            role: "user",
            content: `Question: ${question}
                      
                      Chunks:
                      ${chunks.join("\n\n")}`,
          },
        ],
      },
    });

    const text = completion.choices[0].message.content;
    return JSON.parse(text);
  }
}
