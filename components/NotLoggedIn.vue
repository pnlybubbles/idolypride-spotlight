<template>
  <div class="signin-view">
    <NoteText>アイドルのスキルを見たり譜面を見たりするマネージャーのためのアプリ</NoteText>
    <NoteText>非公式のファンサイトです。公式とは一切関係ありませんので、迷惑をかけないようお願いします。</NoteText>
    <NoteText><HelpText /></NoteText>
    <NoteText><SourceCodeLink /></NoteText>
    <Button @click="signIn">サインイン ・ 新規登録</Button>
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
