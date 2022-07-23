/**
 * Function used to assert a given code path is unreachable
 */
export function unreachable(value: never): never {
  throw new Error(arguments.length === 0 ? 'unreachable' : `unreachable (${JSON.stringify(value)})`)
}

export function defined<T>(value: T | null | undefined, error?: string): T {
  if (value == null) {
    throw new Error(error ?? '`value` must not be null or undefined.')
  }
  return value
}

export function isDefined<T>(value: T | null | undefined): value is T {
  void defined(value)
  return true
}

export type IntLike = string | number | undefined | null
export function safeParseInt(value: IntLike): number | undefined {
  // 明示的に文字列か数値でない場合はパースを試みない
  if (typeof value !== 'number' && typeof value !== 'string') {
    return undefined
  }
  const number = typeof value === 'string' ? parseInt(value, 10) : value
  if (Number.isSafeInteger(number)) {
    return number
  } else {
    return undefined
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
  ? A
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

export function mapObject<S extends string | number, T, U>(object: { [key in S]: T }, map: (domain: T, key: S) => U) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, map(value as T, key as S)])) as {
    [key in S]: U
  }
}

export function unitArrayN<T extends number, V = number>(length: T, fill?: V) {
  return Array.from({ length }).map((_, i) => (fill !== undefined ? fill : i)) as ArrayN<V, T>
}

export function uid() {
  return Math.random().toString(36).substr(2, 9)
}

export type PartiallyNonNullable<T, S extends keyof T> = { [K in keyof T]: K extends S ? NonNullable<T[K]> : T[K] }

export function lift<T, S>(f: (domain: T) => S): (domain: T | null | undefined) => S | null | undefined {
  return (domain) => (domain != null ? f(domain) : (domain as null | undefined))
}

export const isKeyInObject =
  <T extends string>(map: Record<T, unknown>) =>
  (key: string): key is T =>
    map[key as T] !== undefined

export const eraceObjectLiteralTypes = <T>(object: Record<string, T>): Record<string, T> => object
export const eraceArrayLiteralTypes = (array: string[]): string[] => array

export const isUnique = (value: unknown, index: number, array: unknown[]) => array.indexOf(value) === index

export const literal = <T extends string>(literal: string, assertCandidates: readonly T[]): T | undefined =>
  assertCandidates.includes(literal as T) ? (literal as T) : undefined

export const omit = <T extends Record<string, unknown>, S extends keyof T>(object: T, omitKeys: S[]): Omit<T, S> =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !omitKeys.includes(key as S))) as Omit<T, S>
