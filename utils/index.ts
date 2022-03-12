/**
 * Function used to assert a given code path is unreachable
 */
export function unreachable(): never
export function unreachable(value: never): never
export function unreachable(value?: never): never {
  throw new Error(arguments.length === 0 ? 'unreachable' : `unreachable (${JSON.stringify(value)})`)
}

export function defined<T>(value: T | null | undefined, error?: string): T {
  if (value == null) {
    throw new Error(error ?? '`value` must not be null or undefined.')
  }
  return value
}

export function strictParseInt(value: string, error?: string): number {
  const int = parseInt(value, 10)
  if (isFinite(int)) {
    return int
  } else {
    throw new Error(error ?? `"${value}" must be numerical string.`)
  }
}

/**
 * Create upto specified number of union
 *
 * @example
 * NumberUnion<3> // => 0 | 1 | 2
 */
export type NumberUnion<N extends number, T extends unknown[] = [], U extends number = never> = T extends { length: N }
  ? U
  : NumberUnion<N, [...T, unknown], U | (T extends { length: infer L } ? L : never)>

/**
 * Create fixed length array
 *
 * @example
 * ArrayN<string, 3> // => readonly [string, string, string]
 */
export type ArrayN<T, N extends number, A extends unknown[] = []> = A extends { length: N }
  ? Readonly<A>
  : ArrayN<T, N, [...A, T]>

/**
 * Derive length of array
 *
 * @example
 * Length<[string, string, string]> // => 3
 */
type Length<A> = A extends { length: infer N } ? N : never

export function indexed<A extends readonly unknown[]>(array: A) {
  return array.map((value, index) => [value, index]) as [A[number], NumberUnion<Length<A>>][]
}

export function mapArrayN<A extends readonly unknown[], U>(
  array: A,
  map: (domain: A[number], index: NumberUnion<Length<A>>) => U
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return array.map(map as any) as ArrayN<U, Length<A>>
}

export function mapObject<S extends string | number, T, U>(object: { [key in S]: T }, map: (domain: T) => U) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, map(value as T)])) as { [key in S]: U }
}

export function uid() {
  return Math.random().toString(36).substr(2, 9)
}
