/**
 * Epley formula — estimates one-rep max from a multi-rep set.
 * https://en.wikipedia.org/wiki/One-repetition_maximum#Epley_formula
 */
export function estimateOneRM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}
