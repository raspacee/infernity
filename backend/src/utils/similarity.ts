export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  // const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  // const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  // return dotProduct / (normA * normB);
  return dotProduct;
}

export function findTopKSimilar(
  query: number[],
  embeddings: { embedding: number[]; text: string }[],
  k: number
): { text: string; similarity: number }[] {
  console.log(embeddings);
  const similarities = embeddings.map((item) => ({
    text: item.text,
    similarity: cosineSimilarity(query, item.embedding),
  }));

  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, k);
}
