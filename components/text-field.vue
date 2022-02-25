<template>
  <input
    :model="modelValue"
    class="text-field"
    type="text"
    :disabled="disabled ?? false"
    @input="$emit('update:modelValue', ($event.target as any).value)"
  />
</template>
<script setup lang="ts">
interface Props {
  modelValue: string
  disabled?: boolean
}
interface Emits {
  (e: 'update:modelValue', value: string): void
}
defineProps<Props>()
defineEmits<Emits>()
</script>
<style lang="scss" scoped>
.text-field {
  border: 0;
  background-color: rgba(#fff, 0.1);
  padding: 8px;
  border-radius: 4px;
  font-size: 16px;
  line-height: 1em;
  color: #fff;
  outline: none;
}
</style>
