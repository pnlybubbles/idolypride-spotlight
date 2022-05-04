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
    set: (value) => (ref.value = safeParseInt(value)),
  })
}
