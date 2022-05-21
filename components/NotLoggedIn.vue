<template>
  <div class="signin-view">
    <NoteText>非公式のファンサイトです。公式とは一切関係ありませんので、迷惑をかけないようお願いします。</NoteText>
    <NoteText><HelpText /></NoteText>
    <NoteText
      ><a href="https://github.com/pnlybubbles/idolypride-spotlight" target="_blank" rel="noreferrer"
        >ソースコード (GitHub)</a
      ></NoteText
    >
    <Button @click="signIn">サインイン</Button>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'

const { signIn } = useAuth()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.signin-view {
  @include align;
  display: grid;
  gap: 16px;
}

a {
  text-decoration: underline;
  color: inherit;
}
</style>
