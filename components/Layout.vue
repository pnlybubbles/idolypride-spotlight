<template>
  <div class="shell">
    <h1 v-if="busy || isAuthenticated" class="heading">
      <slot name="heading"></slot>
    </h1>
    <h1 v-else class="heading">{{ TITLE }}<span class="badge">alpha</span></h1>
    <NotAllowed v-if="!fetching && isNotAllowed"></NotAllowed>
    <slot v-else-if="nonlogin || (!busy && isAuthenticated)"></slot>
    <NotLoggedIn v-else-if="!busy"></NotLoggedIn>
    <Menu v-if="isAuthenticated"></Menu>
    <Loading :busy="busy">認証情報を読み込んでいます...</Loading>
    <ToastManager></ToastManager>
  </div>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { DEFAULT_ERROR_MESSAGE, useError } from '~~/composable/error'
import { useToast } from '~~/composable/toast'
import { IsUserAllowedDocument } from '~~/generated/graphql'
import { TITLE } from '~~/utils/meta'

interface Props {
  nonlogin?: boolean
}
withDefaults(defineProps<Props>(), { nonlogin: false })

const { busy, isAuthenticated, user, notAuthenticated } = useAuth()

const { data, fetching, error } = useQuery({
  query: IsUserAllowedDocument,
  variables: computed(() => ({ id: user.value?.sub ?? '' })),
  pause: notAuthenticated,
})
useError(error)

const isNotAllowed = computed(() => {
  const allow = data.value?.user_by_pk?.allow
  return allow !== undefined && !allow
})

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

.badge {
  @include round-corner;
  font-size: $typography-s;
  font-weight: bold;
  border: 2px solid $text3;
  color: $text3;
  padding: 1px 3px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
