import { Ref } from 'vue'
import { useEnqueueToast } from './toast'

export const useError = (error: Ref<Error | undefined>, title = 'エラーが発生しました') => {
  const enqueueToast = useEnqueueToast()

  watchEffect(() => {
    if (error.value) {
      enqueueToast({
        variant: 'error',
        title,
        message: error.value.message,
      })
    }
  })
}
