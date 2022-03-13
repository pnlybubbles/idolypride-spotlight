import { InjectionKey } from 'vue'
import { defined } from '~~/utils'

export interface ToastDescriptor {
  variant: 'error' | 'info'
  title: string
  message?: string
}

export interface ToastDescriptorWithId extends ToastDescriptor {
  id: number
}

const ToastContext: InjectionKey<{ descriptor: ToastDescriptorWithId[]; count: number }> = Symbol()
export const provideToast = () => {
  const descriptor = reactive<ToastDescriptorWithId[]>([])
  provide(ToastContext, { descriptor, count: 0 })
}

export const useToastDescriptor = () => {
  const context = defined(inject(ToastContext), '`provideToast` is not mounted')
  return context.descriptor
}

export const useEnqueueToast = () => {
  const context = defined(inject(ToastContext), '`provideToast` is not mounted')
  const enqueueToast = (descriptor: ToastDescriptor) => {
    context.descriptor.push({ ...descriptor, id: context.count })
    context.count++
  }
  return enqueueToast
}
