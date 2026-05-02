// Same heuristic used in design/screens-2.jsx and the publish_poem edge function:
// count vowel groups per word, floor each word at 1.
export function countSyllables(text: string): number {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((acc, word) => {
      const cleaned = word.replace(/[^a-z']/g, "");
      if (!cleaned) return acc;
      const groups = cleaned.match(/[aeiouy]+/g);
      return acc + Math.max(1, groups?.length ?? 1);
    }, 0);
}

export function readTimeSeconds(syllables: number): number {
  return Math.max(15, Math.round(syllables / 3));
}

export function formatReadTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  return `${m} min`;
}
