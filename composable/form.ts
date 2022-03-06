import { InjectionKey, Ref } from 'vue'
import { useUID } from './atom'

export const FormContext: InjectionKey<Map<string, Ref<{ error: boolean }>>> = Symbol()

export const useFormComponent = (state: Ref<{ error: boolean }>) => {
  const context = inject(FormContext)
  if (!context) {
    return
  }
  const uid = useUID()
  context.set(uid, state)
  onUnmounted(() => {
    context.delete(uid)
  })
}

export const useForm = () => {
  const state = reactive(new Map<string, Ref<{ error: boolean }>>())
  provide(FormContext, state)
  const invalid = computed(() => {
    for (const item of state.values()) {
      if (item.value.error) {
        return true
      }
    }
    return false
  })
  return { invalid }
}
