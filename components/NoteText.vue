<template>
  <div class="note-text"><slot></slot></div>
</template>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.note-text {
  font-size: $typography-s;
  color: $text3;
}
</style>
