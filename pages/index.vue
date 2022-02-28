<template>
  <Layout>
    <template #heading>IDOLY PRIDE SPOTLIGHT</template>
    <div v-if="!isAuthenticated" class="signin-view">
      <NoteText>非公式のファンサイトです。公式とは一切関係ありませんので、迷惑をかけないようお願いします。</NoteText>
      <HelpText></HelpText>
      <Button @click="signIn">サインイン</Button>
    </div>
    <div v-else class="list">
      <NuxtLink v-for="item in fumenList" :key="item.id" :to="`/fumen/${item.id}`" class="item">
        <div class="title">{{ item.title }}</div>
        <div class="unit">
          <UnitIcon class="unit-icon" :unit="item.unit"></UnitIcon>
          <span>{{ item.unit }}</span>
        </div>
      </NuxtLink>
      <div v-if="fetching || fetchingAllow" class="loading"><Spinner></Spinner></div>
      <div v-else-if="isNotAllowed" class="caveat">
        <div class="bold">ユーザーが許可されていません。</div>
        <div>ただいま完全許可制になっております。こちらまでご連絡ください。<HelpLink /></div>
      </div>
      <ButtonLink to="/fumen/new">譜面追加</ButtonLink>
    </div>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { GetFumentListDocument, GetFumentListQuery, IsUserAllowedDocument } from '~~/generated/graphql'

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
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

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
  font-size: 18px;
  color: $text1;
}

.unit {
  font-size: 12px;
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

.caveat {
  @include round-corner;
  font-size: 14px;
  background-color: rgba($error, 0.1);
  border: 1px solid $error;
  color: $error;
  padding: 16px;
  display: grid;
  grid: auto auto / auto;
  gap: 4px;

  & .bold {
    font-weight: bold;
  }
}
</style>
