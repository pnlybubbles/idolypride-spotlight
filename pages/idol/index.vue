<template>
  <div>
    <NuxtLink to="/">トップ</NuxtLink>
    <h1>アイドル一覧</h1>
    <div v-if="fetching">読込中...</div>
    <ul v-else>
      <li v-for="idol in idolList" :key="idol.id">{{ idol.name }}</li>
    </ul>
    <NuxtLink to="/idol/new">追加</NuxtLink>
  </div>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { GetIdolListDocument } from '~/generated/graphql'
const { data, fetching, error } = useQuery({ query: GetIdolListDocument })
if (error.value) {
  console.error(error.value)
}
const idolList = computed(() => data.value?.idol ?? [])
</script>
<style lang="scss" scoped></style>
