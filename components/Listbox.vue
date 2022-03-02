<template>
  <AssistiveText :show="showError">
    <button class="listbox" @click="handleOpen">
      <div class="current" :class="{ placeholder: modelValue === null }">
        {{ modelValue ?? placeholder ?? '選択してください' }}
      </div>
      <font-awesome-icon icon="angle-down" class="icon"></font-awesome-icon>
    </button>
    <Sheet v-model:present="present">
      <ul class="options">
        <li v-for="item in options" :key="item" class="item">
          <button class="button" @click="handleClick(item)" @touchend="null">
            <font-awesome-icon class="check" icon="check" :class="{ checked: item === modelValue }"></font-awesome-icon>
            <div>{{ item }}</div>
          </button>
        </li>
      </ul>
    </Sheet>
  </AssistiveText>
</template>
<script setup lang="ts">
import { useFormComponent } from '~~/composable/form'

interface Props {
  modelValue: string | null
  options: string[]
  disabled?: boolean
  // eslint-disable-next-line vue/require-default-prop
  placeholder?: string
  error?: boolean
  required?: boolean
}
interface Emits {
  (e: 'update:modelValue', value: string): void
}
const props = withDefaults(defineProps<Props>(), { disabled: false, error: false, required: false })
const emit = defineEmits<Emits>()

const present = ref(false)
const oncePresent = ref(false)

const handleClick = (item: string) => {
  emit('update:modelValue', item)
  present.value = false
}

const handleOpen = () => {
  present.value = true
  oncePresent.value = true
}

// どのエラーを表示するか (入力中や未入力では不完全な状態になっているはずなので、入力が終わるまでエラーを出すのを待つ制御をする)
const showError = ref<null | 'required'>(null)
// 入力必須エラーが発生しているかどうか
const requiredError = computed(() => props.required && props.modelValue === null)
// ユーザーのキー入力によってエラーが発生したかどうか
const requiredErrorOnEditing = ref(false)
watchEffect(() => {
  // フォーカスの中以外では入力必須エラーは起きないようにする
  // エラーを消す処理は即時に行う
  if (!present.value && requiredError.value) {
    return
  }
  requiredErrorOnEditing.value = requiredError.value
})
watchEffect(() => {
  const error = requiredErrorOnEditing.value ? 'required' : null
  // 一貫してフォーカス中にエラーが表示されないようにする
  // エラーを消す処理は即時に行う
  if (present.value && showError.value == null && error) {
    return
  }
  showError.value = error
})

useFormComponent(computed(() => ({ error: requiredError.value })))
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.listbox {
  @include reset-button;
  @include clickable;
  @include round-corner;
  background-color: $surface1;
  padding: 0 12px;
  height: 40px;
  font-size: 16px;
  color: $text1;
  outline: none;
  border: solid 1px transparent;
  text-align: start;

  display: grid;
  grid: auto / 1fr auto;
  gap: 12px;
  align-items: center;
}

.icon {
  color: $text3;
}

.options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.button {
  @include reset-button;
  @include align;
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100%;
  text-align: start;
  user-select: none;
  display: grid;
  grid: auto / auto 1fr;
  align-items: center;
  gap: 12px;

  &:active {
    background-color: $surface1;
  }
}

.check {
  opacity: 0;

  &.checked {
    opacity: 1;
  }
}

.current {
  &.placeholder {
    color: $text3;
  }
}
</style>
