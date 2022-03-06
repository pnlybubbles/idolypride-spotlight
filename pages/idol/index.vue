<template>
  <Layout>
    <template #heading>アイドル</template>
    <div class="aligned">
      <Callout>
        <template #title>工事中</template>
        アイドルとスキルを一覧してソートしたりフィルタしたりできるページになる予定。
      </Callout>
      <div v-if="fetching" class="loading"><Spinner></Spinner></div>
      <ul v-else class="list">
        <li v-for="idol in idolList" :key="idol.id" class="item">
          <div class="heading">
            <div class="title">{{ idol.title }}</div>
            <div class="name">{{ idol.name }}</div>
          </div>
          <div class="status"></div>
        </li>
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
import { deserializeIdol } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'
const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const idolList = computed(() => (data.value ? deserializeIdol(data.value) : []))
console.log(idolList.value)

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

.loading {
  display: grid;
  justify-content: center;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid: auto-flow / auto;
  gap: 8px;
}

.item {
  display: grid;
  grid: auto auto / auto;
}

.heading {
  display: grid;
  grid: auto / auto auto;
  justify-content: start;
  align-items: flex-end;
  gap: 8px;
}

.title {
  font-size: $typography-l;
  color: $text1;
}

.name {
  font-size: $typography-s;
  color: $text3;
}
</style>
