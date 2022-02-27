<template>
  <div class="shell">
    <h1 class="heading">
      <slot name="heading"></slot>
    </h1>
    <slot></slot>
    <Menu v-if="isAuthenticated"></Menu>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'
const { isAuthenticated } = useAuth()
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
