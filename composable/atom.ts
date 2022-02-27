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
