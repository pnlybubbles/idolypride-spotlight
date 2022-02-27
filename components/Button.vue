<template>
  <button :disabled="disabled ?? false" class="button" :class="[variant]"><slot></slot></button>
</template>
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}
interface Emits {
  (e: 'click'): void
}
defineProps<Props>()
defineEmits<Emits>()
</script>
<style lang="scss" scoped>
@import './token.scss';

.button {
  /* Reset user-agent styles */
  appearance: none;
  background: transparent;
  padding: 0;
  border-style: none;
  outline: none;
  color: inherit;
  text-rendering: inherit;
  letter-spacing: inherit;
  word-spacing: inherit;

  &:focus {
    outline: none;
  }

  /* Change the font styles in all browsers. */
  font: inherit;

  /* Remove the margin in Firefox and Safari. */
  margin: 0;

  /* Custom styles */
  font-size: 14px;
  font-weight: bold;
  padding: 8px 16px;
  background-color: $primary;
  color: $text1;

  @include round-corner;

  &:disabled {
    opacity: 0.32;
  }
}
</style>
