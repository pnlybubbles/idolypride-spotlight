<template>
  <div class="signin-view">
    <NoteText>非公式のファンサイトです。公式とは一切関係ありませんので、迷惑をかけないようお願いします。</NoteText>
    <NoteText>現在は許可制で運営しております。</NoteText>
    <NoteText><HelpText /></NoteText>
    <Button @click="signIn">サインイン</Button>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'

const { signIn } = useAuth()
</script>
<style lang="scss">
@import '~~/components/partials/token.scss';

.signin-view {
  @include align;
  display: grid;
  gap: 16px;
}
</style>
