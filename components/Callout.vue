<template>
  <div class="callout caveat">
    <div class="title"><slot name="title"></slot></div>
    <div><slot></slot></div>
  </div>
</template>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.caveat {
  background-color: rgba($error, 0.1);
  border: 1px solid $error;
  color: $error;
}
.callout {
  @include round-corner;
  font-size: 14px;
  padding: 16px;
  display: grid;
  grid: auto auto / auto;
  gap: 4px;
}

.title {
  font-weight: bold;
}
</style>
