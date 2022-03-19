import { Ref } from 'vue'
import { useToast } from './toast'

export const DEFAULT_ERROR_MESSAGE = 'エラーが発生しました'

export const useError = (error: Ref<Error | undefined>, title = DEFAULT_ERROR_MESSAGE) => {
  const toast = useToast()

  watchEffect(() => {
    if (error.value) {
      toast({
        variant: 'error',
        title,
        message: error.value.message,
      })
    }
  })
}
