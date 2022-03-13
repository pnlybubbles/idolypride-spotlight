import { InjectionKey } from 'vue'
import { defined } from '~~/utils'

export type ToastVariant = 'error' | 'info'

export interface ToastDescriptor {
  variant: ToastVariant
  title: string
  message?: string
}

export interface ToastDescriptorInternal extends ToastDescriptor {
  id: number
  show: boolean | null
}

const ToastContext: InjectionKey<{ descriptor: ToastDescriptorInternal[]; count: number }> = Symbol()
export const provideToast = () => {
  const descriptor = reactive<ToastDescriptorInternal[]>([])
  provide(ToastContext, { descriptor, count: 0 })
}

export const useToastDescriptor = () => {
  const context = defined(inject(ToastContext), '`provideToast` is not mounted')
  return context.descriptor
}

export const useEnqueueToast = () => {
  const context = defined(inject(ToastContext), '`provideToast` is not mounted')
  const enqueueToast = (descriptor: ToastDescriptor) => {
    context.descriptor.push({ ...descriptor, id: context.count, show: null })
    context.count++
  }
  return enqueueToast
}
