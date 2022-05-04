import { StorageDescriptor, useLocalStorage } from './localstorage'

const INTERNAL_LABEL_STORAGE_DESCRIPTOR: StorageDescriptor<boolean> = {
  key: 'internal-label',
  defaultValue: () => false,
}

export function useInternalLabel() {
  return useLocalStorage(INTERNAL_LABEL_STORAGE_DESCRIPTOR)
}

const FUMEN_SCALE_FACTOR: StorageDescriptor<number> = {
  key: 'fumen-scale-factor',
  defaultValue: () => 5,
}

export function useFumenScaleFactor() {
  return useLocalStorage(FUMEN_SCALE_FACTOR)
}
