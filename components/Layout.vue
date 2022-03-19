<template>
  <div class="shell">
    <h1 class="heading">
      <slot name="heading"></slot>
    </h1>
    <slot v-if="!busy"></slot>
    <Menu v-if="isAuthenticated"></Menu>
    <Loading :busy="busy">認証情報を読み込んでいます...</Loading>
    <ToastManager></ToastManager>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'
import { DEFAULT_ERROR_MESSAGE } from '~~/composable/error'
import { useToast } from '~~/composable/toast'

const { busy, isAuthenticated, user } = useAuth()

const toast = useToast()

onErrorCaptured((error) => {
  toast({ variant: 'error', title: DEFAULT_ERROR_MESSAGE, message: error.message })
})

const { $sentry } = useNuxtApp()
watchEffect(() => {
  const id = user.value?.sub
  const email = user.value?.email
  if (id === undefined || email === undefined) {
    return
  }
  $sentry.setUser({ id, email })
})
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
