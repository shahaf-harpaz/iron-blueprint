/**
 * Total volume = weight × reps × sets
 */
export function calcVolume(weight: number, reps: number, sets: number = 1): number {
  return weight * reps * sets
}

/**
 * Group an array of performance records by ISO date string.
 */
export function groupByDate<T extends { logged_at: string }>(records: T[]) {
  return records.reduce<Record<string, T[]>>((acc, r) => {
    const day = r.logged_at.slice(0, 10)
    ;(acc[day] ??= []).push(r)
    return acc
  }, {})
}
