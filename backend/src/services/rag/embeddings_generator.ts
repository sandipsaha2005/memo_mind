import { generateEmbedding } from "@logan/libsql-search";
import type { Chunk } from "../../shared/types/types.ts";


export const generate = async (text: string[]): Promise<Chunk[]> => {
  const embeddings: Chunk[] = [];
  let i = 0;
  for (const chunk of text) {
    const embedding = await generateEmbedding(chunk, {
      provider: "local",
      dimensions: 768,
    });

    embeddings.push(
      {
        text: chunk,
        embedding,
        id: i++,
      },
    );
  }

  return embeddings;
};

export const tokenize = (content: string, chunkSize = 3, overlap = 1) => {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const chunks: string[] = [];

  for (let i = 0; i < sentences.length; i += chunkSize - overlap) {
    const chunk = sentences.slice(i, i + chunkSize).join(" ").trim();
    if (chunk) chunks.push(chunk);
  }

  return chunks;
};
