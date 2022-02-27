<template>
  <div class="text-field">
    <input
      :model="modelValue"
      class="input"
      :class="{ error: showError }"
      type="text"
      :placeholder="placeholder ?? ''"
      :disabled="disabled ?? false"
      @input="$emit('update:modelValue', ($event.target as any).value)"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div v-if="showError === 'required'" class="assistive error">この項目は必須です</div>
    <div v-else-if="showError === 'validation'" class="assistive error"><slot name="error"></slot></div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  modelValue: string
  disabled?: boolean
  placeholder?: string
  error?: boolean
  required?: boolean
}
interface Emits {
  (e: 'update:modelValue', value: string): void
}
const props = withDefaults(defineProps<Props>(), { disabled: false, placeholder: '', error: false, required: false })
defineEmits<Emits>()

const focusing = ref(false)
const onceFocused = ref(false)
const handleFocus = () => {
  focusing.value = true
  onceFocused.value = true
}
const handleBlur = () => {
  focusing.value = false
}

// どのエラーを表示するか (入力中や未入力では不完全な状態になっているはずなので、入力が終わるまでエラーを出すのを待つ制御をする)
const showError = ref<null | 'validation' | 'required'>(null)
// 必須エラーが発生しているかどうか (未入力では発生しないようにする)
const requiredError = ref(false)
watchEffect(() => {
  // フォーカスの中以外では入力必須エラーは起きない
  if (!focusing.value) {
    return
  }
  requiredError.value = props.required && props.modelValue === ''
})
// 空文字は入力必須エラーで扱うので、バリデーションエラーは起きない
const validationError = computed(() => props.modelValue !== '' && props.error)
watchEffect(() => {
  const error = validationError.value ? 'validation' : requiredError.value ? 'required' : null
  // 一貫してフォーカス中にエラーが表示されないようにする
  // エラーを消す処理は即時に行う
  if (focusing.value && error) {
    return
  }
  showError.value = error
})
</script>
<style lang="scss" scoped>
@import './token.scss';

.text-field {
  display: grid;
  grid: auto-flow / auto;
  gap: 2px;
}

.input {
  @include round-corner;
  border: 0;
  background-color: $surface1;
  padding: 8px;
  font-size: 16px;
  line-height: 1em;
  color: $text1;
  outline: none;
  border: solid 1px transparent;

  &::placeholder {
    color: $text3;
  }

  &.error {
    border-color: $error;
  }
}

.assistive {
  padding: 0 8px;
  font-size: 12px;

  &.error {
    color: $error;
  }
}
</style>
