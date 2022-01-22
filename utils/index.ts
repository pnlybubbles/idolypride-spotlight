/**
 * Function used to assert a given code path is unreachable
 */
export function unreachable(): never
export function unreachable(value: never): never
export function unreachable(value?: never): never {
  throw new Error(arguments.length === 0 ? 'unreachable' : `unreachable (${JSON.stringify(value)})`)
}
