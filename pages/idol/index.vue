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
      <NuxtLink to="/idol/new">追加</NuxtLink>
    </div>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { GetIdolListDocument } from '~/generated/graphql'
import { useAuth } from '~~/composable/auth0'
import { useRouteGuard } from '~~/composable/route'
const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const idolList = computed(() => data.value?.idol ?? [])

useRouteGuard()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.aligned {
  @include align;
}
</style>
