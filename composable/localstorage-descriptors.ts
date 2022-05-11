import { Filter } from '~~/components/idol-filter/helper'
import { ArrayN } from '~~/utils'
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

const IDOL_FILTER_RECENT: StorageDescriptor<Filter[]> = {
  key: 'idol-filter-recent',
  defaultValue: () => [],
}

export function useIdolFilterRecent() {
  return useLocalStorage(IDOL_FILTER_RECENT)
}

const LIVE_IDOL_SELECT_RECENT: StorageDescriptor<{ [fumentId: string]: ArrayN<string | null, 5> }> = {
  key: 'live-idol-select-recent',
  defaultValue: () => ({}),
}

export function useLiveIdolSelectRecent() {
  return useLocalStorage(LIVE_IDOL_SELECT_RECENT)
}
