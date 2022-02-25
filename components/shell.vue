<template>
  <h1 class="heading">
    <slot name="heading"></slot>
  </h1>
  <slot></slot>
</template>
<style lang="scss" scoped>
@import './token.scss';

.heading {
  @include align;
}
</style>
