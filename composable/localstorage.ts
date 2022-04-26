import { lift } from '~~/utils'

export interface StorageDescriptor<T> {
  key: string
  defaultValue: () => T
}

export function useLocalStorage<T>(descriptor: StorageDescriptor<T>) {
  const ready = ref(false)
  const state = ref<T>()

  onMounted(() => {
    fetch()
    window.addEventListener('storage', handleStorage)
  })
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorage)
  })

  const handleStorage = (e: StorageEvent) => {
    if (e.storageArea !== localStorage) {
      return
    }
    if (e.key !== descriptor.key) {
      return
    }
    fetch()
  }

  const fetch = () => {
    const raw = localStorage.getItem(descriptor.key)
    state.value = lift(deserialize)<T>(raw) ?? descriptor.defaultValue()

    if (!ready.value) {
      ready.value = true
    }
  }

  const set = (value: T | undefined) => {
    if (value === undefined) {
      // undefinedがセットされる場合にはkeyごと削除
      localStorage.removeItem(descriptor.key)
      return
    }

    const raw = serialize(value)
    localStorage.setItem(descriptor.key, raw)

    // 同一ウィンドウではstorageイベントが発火しないので、手動で発火させる
    const event = document.createEvent('StorageEvent')
    event.initStorageEvent('storage', true, false, descriptor.key, null, null, location.href, localStorage)
    dispatchEvent(event)
  }

  const model = computed({
    get: () => state.value ?? descriptor.defaultValue(),
    set,
  })

  return [model, ready] as const
}

function deserialize<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    // syntax error はすべて文字列として扱う
    return raw as unknown as T
  }
}

function serialize(value: unknown): string {
  if (typeof value === 'string') {
    return value
  } else {
    return JSON.stringify(value)
  }
}
