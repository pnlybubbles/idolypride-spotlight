<template>
  <div class="shell">
    <h1 class="heading">
      <slot name="heading"></slot>
    </h1>
    <slot></slot>
    <MenuBar></MenuBar>
  </div>
</template>
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
