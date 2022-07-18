<template>
  <div class="with-symbol">
    <slot></slot>
    <slot name="symbol"></slot>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.with-symbol {
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
  justify-content: start;
  align-items: center;
  width: max-content;
}
</style>
