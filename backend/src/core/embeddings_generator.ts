import { generateEmbedding } from "@logan/libsql-search";
import type { Chunk } from "../types/types.ts";

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

export const tokenize = (content: string) =>
  content.split(". ")
    .map((item) => item.trim())
    .filter((item) => item !== "");
