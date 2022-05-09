<template>
  <Layout class="root">
    <template #heading>{{ live?.title ?? 'ライブ' }}</template>
    <div class="idol">
      <div></div>
      <template v-for="i in LANES" :key="i">
        <IdolSelect v-model="selectedIdols[i]"></IdolSelect>
      </template>
    </div>
    <Live v-if="live" :live="live" :idols="selectedIdols"></Live>
    <Loading :busy="fetching">譜面を読み込んでいます...</Loading>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { GetFumenDocument } from '~~/generated/graphql'
import { ArrayN } from '~~/utils'
import { LANES } from '~~/utils/common'
import { DEFAULT_META } from '~~/utils/meta'
import { IdolData, LiveData } from '~~/utils/types'

const route = useRoute()

const id = route.params.id as string
const { notAuthenticated } = useAuth()

const { data, error, fetching } = useQuery({ query: GetFumenDocument, variables: { id: id }, pause: notAuthenticated })
useError(error)

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

const selectedIdols = reactive<ArrayN<IdolData | null, 5>>([null, null, null, null, null])

useHead(DEFAULT_META)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
.idol {
  @include lane-grid;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: $background1;
  margin-bottom: 4px;
}

.root {
  position: relative;
  z-index: 0;
}
</style>
