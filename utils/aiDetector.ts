
export function fastAIDetector(message: string) {
  const words = message.trim().split(/\s+/);
  const wordCount = words.length;

  // Base score
  let score = 0.3;

  // Short or very long messages slightly suspicious
  if (wordCount < 3) score += 0.1;
  if (wordCount > 20) score += 0.2;

  // Word repetition increases suspicion
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const repetitionFactor = 1 - uniqueWords.size / words.length;
  score += repetitionFactor * 0.3;

  // Add tiny random factor for variation
  score += Math.random() * 0.1;

  // Clamp between 0 and 1
  score = Math.min(1, Math.max(0, score));

  return score; // 0.0 -> human, 1.0 -> AI-likely
}
