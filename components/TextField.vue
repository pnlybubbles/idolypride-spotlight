<template>
  <AssistiveText :show="showError" class="text-field">
    <input
      ref="inputRef"
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
      @touchend="null"
    />
    <div v-if="preset.length !== 0 && focusing" class="preset">
      <button v-for="item in preset" :key="item" class="preset-item" @click="handleFillPreset(item)" @touchend="null">
        {{ item }}
      </button>
    </div>
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
  preset?: (string | number)[]
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
  preset: () => [],
})
const emit = defineEmits<Emits>()

const slots = useSlots()
const isCustomErrorDefined = slots.error != undefined

const focusing = ref(false)
const handleFocus = () => {
  focusing.value = true
}

// プリセットが押されてフォーカスが外れた時だけプリセットを閉じないようにする
let timer: NodeJS.Timeout | null = null
const handleBlur = () => {
  timer = setTimeout(() => {
    focusing.value = false
  }, 0)
}
const inputRef = ref<HTMLInputElement | null>(null)
const handleFillPreset = (input: string | number) => {
  timer && clearTimeout(timer)
  emit('update:modelValue', input.toString())
  if (inputRef.value === null) {
    return
  }
  inputRef.value.focus()
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
  const error = validationError.value ? 'validation' : requiredErrorOnEditing.value ? 'required' : null
  // 一貫してフォーカス中にエラーが表示されないようにする
  // エラーを消す処理は即時に行う
  if (focusing.value && showError.value == null && error !== null) {
    return
  }
  showError.value = error
})

useFormComponent(computed(() => ({ error: requiredError.value || validationError.value })))
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.text-field {
  position: relative;
}

.input {
  @include round-corner;
  @include clickable;
  user-select: auto;
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

  /* remove horizontal margin on safari */
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

.preset {
  @include round-corner;
  @include background-blur;
  position: absolute;
  left: 12px;
  top: 34px;
  background-color: $surface2;
  color: $text4;
  height: 32px;
  display: grid;
  grid: auto / auto-flow;
  align-items: stretch;
  padding: 0 4px;
  gap: 1px;
}

.preset-item {
  @include clickable;
  @include reset-button;
  font-size: $typography-s;
  padding: 0 8px;
  position: relative;

  & + & {
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: -1px;
      top: 50%;
      height: 60%;
      transform: translateY(-50%);
      border-left: solid 1px $surface2-stroke;
    }
  }
}
</style>
