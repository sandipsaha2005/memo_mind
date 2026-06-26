import { pipeline } from "@xenova/transformers";
import type { Chunk } from "../../shared/types/types.ts";

let extractor: ReturnType<typeof pipeline> | null = null;

function getExtractor() {
  if (!extractor) {
    extractor = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

async function generateEmbedding(
  text: string,
  dimensions = 768,
): Promise<number[]> {
  const ext = await getExtractor();
  // deno-lint-ignore no-explicit-any
  const output = await (ext as any)(text, { pooling: "mean", normalize: true });
  const raw: number[] = Array.from(output.data as Float32Array);

  if (raw.length >= dimensions) return raw.slice(0, dimensions);

  const padded = new Array<number>(dimensions).fill(0);
  for (let i = 0; i < raw.length; i++) padded[i] = raw[i];
  return padded;
}

export const generate = async (text: string[]): Promise<Chunk[]> => {
  const embeddings: Chunk[] = [];
  let i = 0;
  for (const chunk of text) {
    const embedding = await generateEmbedding(chunk, 768);

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
