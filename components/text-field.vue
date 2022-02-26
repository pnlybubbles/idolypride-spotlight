<template>
  <div class="text-field">
    <input
      :model="modelValue"
      class="input"
      :class="{ error: errorHysteresis }"
      type="text"
      :placeholder="placeholder ?? ''"
      :disabled="disabled ?? false"
      @input="$emit('update:modelValue', ($event.target as any).value)"
      @focus="focusing = true"
      @blur="focusing = false"
    />
    <div v-if="errorHysteresis" class="assistive error"><slot name="error"></slot></div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  modelValue: string
  disabled?: boolean
  placeholder?: string
  error?: boolean
}
interface Emits {
  (e: 'update:modelValue', value: string): void
}
const props = defineProps<Props>()
defineEmits<Emits>()
const focusing = ref(false)
const errorHysteresis = ref(false)
watchEffect(() => {
  if (focusing.value && props.error) {
    return
  }
  errorHysteresis.value = props.error ?? false
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
  border: 0;
  background-color: $surface1;
  padding: 8px;
  border-radius: 4px;
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
