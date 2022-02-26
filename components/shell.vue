<template>
  <div>
    <h1 class="heading">
      <slot name="heading"></slot>
    </h1>
    <slot></slot>
  </div>
</template>
<style lang="scss" scoped>
@import './token.scss';

.heading {
  @include align;
}
</style>
