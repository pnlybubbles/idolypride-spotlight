<template>
  <span class="own-setting-badge">自分の設定</span>
</template>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.own-setting-badge {
  @include round-corner('S');
  font-size: $typography-xs;
  padding: 2px 8px;
  background-color: rgba($warning, 0.1);
  color: $warning;
}
</style>
