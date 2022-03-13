<template>
  <div class="shell">
    <h1 class="heading">
      <slot name="heading"></slot>
    </h1>
    <slot v-if="!busy"></slot>
    <Menu v-if="isAuthenticated"></Menu>
    <Loading :busy="busy">認証情報を読み込んでいます...</Loading>
    <Toast></Toast>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'

const { busy, isAuthenticated } = useAuth()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.shell {
  padding-top: 20px;
  padding-bottom: 80px;
}

.heading {
  @include align;
}
</style>
