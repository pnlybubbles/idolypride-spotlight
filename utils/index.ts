/**
 * Function used to assert a given code path is unreachable
 */
export function unreachable(): never
export function unreachable(value: never): never
export function unreachable(value?: never): never {
  throw new Error(arguments.length === 0 ? 'unreachable' : `unreachable (${JSON.stringify(value)})`)
}

/**
 * Create upto specified number of union
 *
 * @example
 * type A = NumberUnion<3> // => 0 | 1 | 2
 */
export type NumberUnion<N extends number, T extends unknown[] = [], U extends number = never> = T extends { length: N }
  ? U
  : NumberUnion<N, [...T, unknown], U | (T extends { length: infer L } ? L : never)>

export type ArrayN<T, N extends number, A extends unknown[] = []> = A extends { length: N }
  ? Readonly<A>
  : ArrayN<T, N, [...A, T]>

export function indexed<A extends readonly unknown[]>(
  array: A
): A extends { length: infer L } ? (L extends number ? [A[number], NumberUnion<L>][] : unknown) : unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return array.map((value, index) => [value, index]) as any
}

export function mapArrayN<A extends readonly unknown[], U>(
  array: A,
  map: (domain: A[number], index: keyof A) => U
): A extends { length: infer L } ? (L extends number ? ArrayN<U, L> : unknown) : unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (array as any).map(map)
}

export function mapObject<S extends string | number, T, U>(
  object: { [key in S]: T },
  map: (domain: T) => U
): { [key in S]: U } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, map(value as T)])) as any
}
