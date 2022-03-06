<template>
  <AssistiveText :show="showError">
    <input
      :value="modelValue"
      class="input"
      :class="{ error: showError }"
      type="text"
      :placeholder="placeholder ?? ''"
      :disabled="disabled ?? false"
      :inputmode="type === 'number' ? 'numeric' : 'text'"
      @input="$emit('update:modelValue', ($event.target as any).value)"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <template #error>
      <slot v-if="$slots.error" name="error"></slot>
      <template v-else-if="type === 'number'">半角数字で入力してください</template>
    </template>
  </AssistiveText>
</template>
<script setup lang="ts">
import { useFormComponent } from '~~/composable/form'
import { validPositiveInt } from '~~/utils/validation'

interface Props {
  modelValue: string
  disabled?: boolean
  placeholder?: string
  error?: boolean
  required?: boolean
  /**
   * numberを選ぶとデフォルトで正の整数のみ許可するバリデーションが入る。
   * `<template #error>` を指定することで無効化できる。
   */
  type?: 'text' | 'number'
}
interface Emits {
  (e: 'update:modelValue', value: string): void
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '',
  error: false,
  required: false,
  type: 'text',
})
defineEmits<Emits>()

const slots = useSlots()
const isCustomErrorDefined = slots.error != undefined

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
// 入力必須エラーが発生しているかどうか
const requiredError = computed(() => !props.disabled && props.required && props.modelValue === '')
// ユーザーのキー入力によってエラーが発生したかどうか
const requiredErrorOnEditing = ref(false)
watchEffect(() => {
  // フォーカスの中以外では入力必須エラーは起きないようにする
  // エラーを消す処理は即時に行う
  if (!focusing.value && requiredError.value) {
    return
  }
  requiredErrorOnEditing.value = requiredError.value
})
// バリデーションが発生しているかどうか (空文字は入力必須エラーで扱うので、バリデーションエラーは起きない)
const validationError = computed(
  () =>
    !props.disabled &&
    props.modelValue !== '' &&
    // ユーザーからエラーが指定されていない場合かつ、プリセットが利用できる場合は使う
    (isCustomErrorDefined ? props.error : props.type === 'number' ? !validPositiveInt(props.modelValue) : false)
)
watchEffect(() => {
  console.log(validationError.value, props.error, validPositiveInt(props.modelValue))
})
watchEffect(() => {
  const error = validationError.value ? 'validation' : requiredErrorOnEditing.value ? 'required' : null
  // 一貫してフォーカス中にエラーが表示されないようにする
  // エラーを消す処理は即時に行う
  if (focusing.value && showError.value == null && error) {
    return
  }
  showError.value = error
})

useFormComponent(computed(() => ({ error: requiredError.value || validationError.value })))
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.text-field {
  display: grid;
  grid: auto-flow / auto;
  gap: 2px;
}

.input {
  @include round-corner;
  border: 0;
  background-color: $surface1;
  padding: 0 12px;
  height: 40px;
  font-size: 16px;
  font-family: inherit;
  color: $text1;
  outline: none;
  border: solid 1px transparent;
  min-width: 0;

  // remove horizontal margin on safari
  margin: 0;

  &::placeholder {
    color: $text3;
  }

  &.error {
    border-color: $error;
  }

  &:disabled {
    background: repeating-linear-gradient(-45deg, $surface1, $surface1 4px, transparent 4px, transparent 6px);
    border: solid 1px $surface1;
    opacity: 0.64;
  }
}
</style>
