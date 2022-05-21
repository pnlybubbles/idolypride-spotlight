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
    <div v-if="!noIdolSelected" class="footer">
      <Callout>
        <template #title>注意</template>
        Pスキルの発動条件,CT減少,SPシフトなど再現できていない部分が多々あります
      </Callout>
    </div>
    <Loading :busy="fetching">譜面を読み込んでいます...</Loading>
    <Loading :busy="!fetching && idolFetch">アイドルを読み込んでいます...</Loading>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { useLiveIdolSelectRecent } from '~~/composable/localstorage-descriptors'
import { GetFumenDocument, GetIdolListDocument } from '~~/generated/graphql'
import { ArrayN, indexed, mapArrayN } from '~~/utils'
import { LANES } from '~~/utils/common'
import { deserializeIdolList } from '~~/utils/formatter'
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

const {
  data: idolData,
  error: idolError,
  fetching: idolFetch,
} = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
useError(idolError)
const idolList = computed(() => (idolData.value ? deserializeIdolList(idolData.value) : []))

const [selectedIdolsRecent, readySelectedIdolsRecent] = useLiveIdolSelectRecent()
const selectedIdolsCurrentLive = computed(() => selectedIdolsRecent.value[id])

const restored = ref(false)
// ローカルストレージにアイドル選択状態が保持されていたら、復元する
watchEffect(() => {
  // ローカルストレージを読込中, アイドルデータを取得中は待機
  if (!readySelectedIdolsRecent.value || idolFetch.value || restored.value) {
    return
  }

  restored.value = true

  if (selectedIdolsCurrentLive.value === undefined) {
    return
  }

  for (const [idolId, index] of indexed(selectedIdolsCurrentLive.value)) {
    const idol = idolList.value.find((v) => v.id === idolId)
    selectedIdols[index] = idol ?? null
  }
})

const noIdolSelected = computed(() => selectedIdols.every((v) => v === null))

// アイドルが選択されたらローカルストレージに保存する
watchEffect(() => {
  if (noIdolSelected.value) {
    return
  }
  // なんか[id]に代入するとreactiveがうまく発火しないのでrefのルートに代入している
  selectedIdolsRecent.value = {
    ...selectedIdolsRecent.value,
    [id]: mapArrayN(selectedIdols, (v) => v?.id ?? null),
  }
})

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

.footer {
  @include align;
  padding-top: 40px;
}
</style>
