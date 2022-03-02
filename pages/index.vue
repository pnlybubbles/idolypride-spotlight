<template>
  <Layout>
    <template #heading>{{ TITLE }}<span class="badge">alpha</span></template>
    <div v-if="!isAuthenticated" class="signin-view">
      <NoteText>非公式のファンサイトです。公式とは一切関係ありませんので、迷惑をかけないようお願いします。</NoteText>
      <NoteText>現在は許可制で運営しております。</NoteText>
      <NoteText><HelpText /></NoteText>
      <Button @click="signIn">サインイン</Button>
    </div>
    <div v-else class="list">
      <NuxtLink v-for="item in fumenList" :key="item.id" :to="`/fumen/${item.id}`" class="item" @touchend="null">
        <div class="title">{{ item.title }}</div>
        <div class="unit">
          <UnitIcon class="unit-icon" :unit="item.unit"></UnitIcon>
          <span>{{ item.unit }}</span>
        </div>
      </NuxtLink>
      <div v-if="fetching || fetchingAllow" class="loading"><Spinner></Spinner></div>
      <Callout v-else-if="isNotAllowed">
        <template #title>ユーザーが許可されていません</template>
        ただいま完全許可制になっております。こちらまでご連絡ください。<HelpLink />
      </Callout>
      <ButtonLink to="/fumen/new">譜面を追加する</ButtonLink>
    </div>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { GetFumentListDocument, GetFumentListQuery, IsUserAllowedDocument } from '~~/generated/graphql'
import { DEFAULT_META, TITLE } from '~~/utils/meta'

const { isAuthenticated, user, getToken, signIn, notAuthenticated } = useAuth()

watchEffect(async () => {
  if (!user.value) {
    return
  }
  const token = await getToken()
  console.log(token)
})

const { data, error, fetching } = useQuery({ query: GetFumentListDocument, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const fumenList = computed(() => data.value?.fumen ?? [])

const notAllowedCandidate = (value: GetFumentListQuery | undefined) => value !== undefined && value.fumen.length === 0
const { data: allowData, fetching: fetchingAllow } = useQuery({
  query: IsUserAllowedDocument,
  variables: computed(() => ({ id: user.value?.sub ?? '' })),
  pause: computed(() => notAuthenticated.value || !notAllowedCandidate(data.value)),
})
const isNotAllowed = computed(() => {
  const allow = allowData.value?.user_by_pk?.allow
  return notAllowedCandidate(data.value) && allow !== undefined && !allow
})
useMeta(DEFAULT_META)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

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

.list {
  @include align;

  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
}

.item {
  @include clickable;

  display: grid;
  background-color: $surface1;
  border-radius: 4px;
  padding: 16px;
  grid: auto auto / auto;
  gap: 4px;
}

.title {
  font-weight: bold;
  font-size: $typography-l;
  color: $text1;
}

.unit {
  font-size: $typography-s;
  color: $text3;
}

.unit-icon {
  margin-right: 4px;
}

.signin-view {
  @include align;
  display: grid;
  gap: 16px;
}

.loading {
  display: grid;
  justify-items: center;
}
</style>
