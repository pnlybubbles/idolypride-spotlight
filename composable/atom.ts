import { onBeforeRouteLeave } from 'vue-router'
import { InjectionKey } from 'vue'
import { defined } from '~~/utils'

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
