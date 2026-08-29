/**
 * DataLoader contract: the returned array must match the requested keys
 * one-to-one and keep their order.
 */
export const groupByKey = <T, K extends string | number>(
  rows: readonly T[],
  keys: readonly K[],
  selectKey: (row: T) => K,
): T[][] => {
  const buckets = new Map<K, T[]>(keys.map((key) => [key, []]));
  for (const row of rows) {
    buckets.get(selectKey(row))?.push(row);
  }
  return keys.map((key) => buckets.get(key) ?? []);
};
