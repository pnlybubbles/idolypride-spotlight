<template>
  <div class="popover" :class="[position]">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
interface Props {
  position?: 'left' | 'right'
}
withDefaults(defineProps<Props>(), { position: 'left' })
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.popover {
  @include round-corner;
  @include background-blur;
  position: absolute;
  top: 50%;
  background-color: $surface2;
  color: $text4;

  &.left {
    right: 50%;
    transform: translate(-4px, 4px);
  }

  &.right {
    left: 50%;
    transform: translate(4px, 4px);
  }
}
</style>
