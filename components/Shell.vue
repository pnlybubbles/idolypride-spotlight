<template>
  <div class="shell">
    <h1 class="heading">
      <slot name="heading"></slot>
    </h1>
    <slot></slot>
    <MenuBar v-if="!disableMenu"></MenuBar>
  </div>
</template>
<script setup lang="ts">
interface Props {
  disableMenu?: boolean
}
withDefaults(defineProps<Props>(), {
  disableMenu: false,
})
</script>
<style lang="scss" scoped>
@import './token.scss';

.shell {
  padding-top: 20px;
  padding-bottom: 80px;
}

.heading {
  @include align;
}
</style>
