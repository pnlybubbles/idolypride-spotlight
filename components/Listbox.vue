<template>
  <AssistiveText :show="showError">
    <button
      class="listbox"
      :class="{ error: showError !== null }"
      :disabled="disabled"
      @click="handleOpen"
      @touchend="null"
    >
      <div class="current" :class="{ placeholder: selectedLabel === undefined }">
        {{ selectedLabel ?? placeholder ?? '選択してください' }}
      </div>
      <font-awesome-icon icon="angle-down" class="icon"></font-awesome-icon>
    </button>
    <ListboxSheet
      v-model:present="present"
      :options="options"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    ></ListboxSheet>
    <template #error>選択肢が変化したため再選択が必要です</template>
  </AssistiveText>
</template>
<script setup lang="ts">
import { useFormComponent } from '~~/composable/form'

interface Option {
  id: string
  label: string
}

interface Props {
  modelValue: string | null
  options: Option[]
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
defineEmits<Emits>()

const selectedLabel = computed(() => props.options.find((v) => v.id === props.modelValue)?.label)

const present = ref(false)
const oncePresent = ref(false)

const handleOpen = () => {
  present.value = true
  oncePresent.value = true
}

// どのエラーを表示するか (入力中や未入力では不完全な状態になっているはずなので、入力が終わるまでエラーを出すのを待つ制御をする)
const showError = ref<null | 'required' | 'validation'>(null)
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
// オプションが変化して変更が必須になっているエラーが発生しているかどうか
const changeRequiredError = computed(
  () => props.modelValue !== null && props.options.find((v) => v.id === props.modelValue) === undefined
)
watchEffect(() => {
  const error = requiredErrorOnEditing.value ? 'required' : changeRequiredError.value ? 'validation' : null
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

  &.error {
    border-color: $error;
  }

  &:disabled {
    background: repeating-linear-gradient(-45deg, $surface1, $surface1 4px, transparent 4px, transparent 6px);
    border: solid 1px $surface1;
    opacity: 0.64;
  }
}

.icon {
  color: $text3;
}

.current {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.placeholder {
    color: $text3;
  }
}
</style>
