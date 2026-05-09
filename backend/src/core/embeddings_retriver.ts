import { Chunk, Memory, RetrievedChunks } from "../types/types.ts";

const sumOfSqr = (values: number[]) =>
  values.reduce((value, number) => value + number * number, 0);

const cosineSimilarity = (v1: number[], v2: number[]) => {
  const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
  const magOfFirst = Math.sqrt(sumOfSqr(v1));
  const magOfSecond = Math.sqrt(sumOfSqr(v2));

  if (magOfFirst === 0 || magOfSecond === 0) return 0;

  return dotProduct / (magOfFirst * magOfSecond);
};

export const retrieve = (
  memory: Memory,
  query: Chunk[],
  k = 5,
): RetrievedChunks[] => {
  const similarities = memory.embeddings.flatMap((chunk) =>
    query.map((queryChunk) => ({
      similarity: cosineSimilarity(chunk.embedding, queryChunk.embedding),
      text: chunk.text,
    }))
  );

  return similarities.toSorted((a, b) => b.similarity - a.similarity);
};
