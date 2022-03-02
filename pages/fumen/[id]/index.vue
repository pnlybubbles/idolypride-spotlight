<template>
  <Layout>
    <template #heading>{{ live?.title ?? 'ライブ' }}</template>
    <Live v-if="live" :live="live"></Live>
    <Loading :busy="fetching">譜面を読み込んでいます...</Loading>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { useRouteGuard } from '~~/composable/route'
import { GetFumenDocument } from '~~/generated/graphql'
import { ArrayN } from '~~/utils'
import { DEFAULT_META } from '~~/utils/meta'
import { LiveData } from '~~/utils/types'

const route = useRoute()

const id = route.params.id as string
const { notAuthenticated } = useAuth()
const { data, error, fetching } = useQuery({ query: GetFumenDocument, variables: { id: id }, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const live = computed(() => {
  const raw = data.value?.fumen_by_pk
  if (!raw) {
    return null
  }
  const formatted: LiveData = {
    id,
    title: raw.title,
    unit: raw.unit,
    beat: raw.beat,
    a: (raw.a as ArrayN<readonly number[], 5>) ?? [[], [], [], [], []],
    sp: (raw.sp as ArrayN<readonly number[], 5>) ?? [[], [], [], [], []],
  }
  return formatted
})

useRouteGuard()
useMeta(DEFAULT_META)
</script>
<style lang="scss" scoped></style>
