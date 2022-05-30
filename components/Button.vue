<template>
  <button :disabled="disabled" class="button" :class="[variant]" @click="$emit('click')" @touchend="null">
    <slot></slot>
  </button>
</template>
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'mini'
  disabled?: boolean
}
interface Emits {
  (e: 'click'): void
}
withDefaults(defineProps<Props>(), { variant: 'primary', disabled: false })
defineEmits<Emits>()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.button {
  @include reset-button;

  &.primary {
    @include button-like;
  }

  &.secondary {
    @include button-like('secondary');
  }

  &.mini {
    font-size: $typography-xs;
    height: 32px;
    min-width: 32px;
    padding: 0 16px;
    display: grid;
    align-items: center;
    justify-items: center;
    border-radius: 9999px;
    background-color: $surface1;
    color: $text1;
    align-self: flex-start;
  }
}
</style>
