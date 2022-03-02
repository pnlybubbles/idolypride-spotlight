<template>
  <Layout>
    <template #heading>アイドル</template>
    <div class="aligned">
      <Callout>
        <template #title>工事中</template>
        アイドルとスキルを一覧してソートしたりフィルタしたりできるページになる予定。
      </Callout>
      <div v-if="fetching">読込中...</div>
      <ul v-else>
        <li v-for="idol in idolList" :key="idol.id">{{ idol.name }}</li>
      </ul>
      <ButtonLink to="/idol/new">アイドルを追加する</ButtonLink>
    </div>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { GetIdolListDocument } from '~/generated/graphql'
import { useAuth } from '~~/composable/auth0'
import { useRouteGuard } from '~~/composable/route'
import { DEFAULT_META } from '~~/utils/meta'
const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const idolList = computed(() => data.value?.idol ?? [])

useRouteGuard()
useMeta(DEFAULT_META)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.aligned {
  @include align;

  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
}
</style>
