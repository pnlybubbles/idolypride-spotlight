import { StorageDescriptor, useLocalStorage } from './localstorage'

const INTERNAL_LABEL_STORAGE_DESCRIPTOR: StorageDescriptor<boolean> = {
  key: 'internal-label',
  defaultValue: () => false,
}

export function useInternalLabel() {
  return useLocalStorage(INTERNAL_LABEL_STORAGE_DESCRIPTOR)
}
