<template>
  <VStack :spacing="16">
    <div class="heading">
      <img src="/logo.svg" alt="logo" class="logo" />
      <div class="logo-label">{{ TITLE }}</div>
    </div>
    <div class="section">
      <div class="section-headding">設定</div>
      <Check v-model="internalLabel" :disabled="!ready">内部的なラベルで表示する</Check>
    </div>
    <div class="section">
      <div class="section-headding">このページについて</div>
      <NoteText><HelpText /></NoteText>
    </div>
    <div class="section">
      <div class="section-headding">ユーザー情報</div>
      <NoteText>{{ user?.email }}</NoteText>
    </div>
    <div class="section">
      <Button @click="handleSignOut">サインアウト</Button>
    </div>
  </VStack>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'
import { useInternalLabel } from '~~/composable/localstorage-descriptors'
import { TITLE } from '~~/utils/meta'

const { user, signOut } = useAuth()

const router = useRouter()

const handleSignOut = async () => {
  await signOut()
  await router.push('/')
}

const [internalLabel, ready] = useInternalLabel()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.heading {
  display: grid;
  grid: auto auto / auto;
  justify-items: center;
  padding-bottom: 8px;
}

.logo {
  display: block;
  width: 40px;
  height: 40px;
  justify-self: center;
}

.logo-label {
  font-size: $typography-s;
  font-weight: bold;
}

.section {
  @include align;
  display: grid;
  grid: auto-flow / auto;
  gap: 4px;
}

.section-headding {
  font-size: $typography-s;
  color: $text1;
  font-weight: bold;
}
</style>
