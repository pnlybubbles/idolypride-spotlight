<template>
  <div class="section">
    <div class="label">
      <slot name="label"></slot>
    </div>
    <slot></slot>
  </div>
</template>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.section {
  @include align;

  display: grid;
  grid: auto-flow / auto;
  gap: 8px;
}

.label {
  font-weight: bold;
  font-size: 12px;
  color: $text2;
}
</style>
