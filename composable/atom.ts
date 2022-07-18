import { onBeforeRouteLeave } from 'vue-router'
import { InjectionKey, Ref } from 'vue'
import { defined, safeParseInt } from '~~/utils'

const UIDContext: InjectionKey<() => string> = Symbol()
export const provideUID = () => {
  let state = 0
  const generateUID = () => {
    state += 1
    return `uid-${state}`
  }
  provide(UIDContext, generateUID)
}
export const useUID = () => {
  const generateUID = defined(inject(UIDContext), '`provideUID` is not mounted')
  return generateUID()
}

export function useBeforeUnload(callback: () => boolean) {
  const skipUnloadFlag = { current: false }
  onBeforeRouteLeave((_to, _from, next) => {
    if (skipUnloadFlag.current || callback()) {
      next()
    }
    skipUnloadFlag.current = false
  })
  return () => {
    skipUnloadFlag.current = true
  }
}

export function useIntAsString(ref: Ref<number>) {
  return computed({
    get: () => ref.value.toString(),
    set: (value) => (ref.value = safeParseInt(value) ?? 0),
  })
}

export function useDebounce<T>(defaultValue: T, ms: number, task: (value: T) => Promise<unknown>) {
  const /* mutable */ queue: T[] = []
  let cached = defaultValue
  let timer: NodeJS.Timeout | null = null

  return (value: T) => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(async () => {
      timer = null
      queue.push(value)
      // 非同期処理中に次の処理が来た場合はキューイングする
      if (queue.length > 1) {
        return
      }
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const head = queue[0]
        if (head === undefined) {
          break
        }
        // shallow-equalityで重複除去
        if (head === cached) {
          queue.shift()
          return
        }
        await task(head)
        cached = head
        queue.shift()
      }
    }, ms)
  }
}

export function useBinding<P extends object, K extends Extract<keyof P, string>, T = P[K]>(
  props: P,
  emit: (e: `update:${K}`, value: P[K]) => void,
  key: K,
  mapper: {
    into: (value: P[K]) => T
    from: (value: T) => P[K]
  } = {
    into: (v) => v as unknown as T,
    from: (v) => v as unknown as P[K],
  }
) {
  const binding = ref(mapper.into(props[key])) as Ref<T>
  let cache = toRaw(props[key])
  watch(
    () => props[key],
    (value) => toRaw(value) !== cache && (binding.value = mapper.into(value)),
    { deep: true }
  )
  watch(binding, (value) => emit(`update:${key}`, (cache = mapper.from(value))), { deep: true })
  return binding
}
