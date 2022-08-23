<template>
  <Layout class="root">
    <template #heading>{{ live?.title ?? 'ライブ' }}</template>
    <div class="idol">
      <div></div>
      <template v-for="i in LANES" :key="i">
        <IdolSelect v-model="selectedIdols[i].value" v-model:lane-type="selectedLaneType[i].value"></IdolSelect>
      </template>
    </div>
    <Live v-if="live" :live="live" :idols="mapArrayN(selectedIdols, (v) => v.value)" :lane="laneData"></Live>
    <div v-if="!noIdolSelected" class="footer">
      <Callout>
        <template #title>注意</template>
        一部のPスキルの発動条件、スキルの対象、乱数が絡んだ条件、Aシフトなど再現できていない部分があります
      </Callout>
    </div>
    <Loading :busy="fetching">譜面を読み込んでいます...</Loading>
    <Loading :busy="!fetching && idolFetch">アイドルを読み込んでいます...</Loading>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import produce from 'immer'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { useLiveIdolSelectRecent } from '~~/composable/localstorage-descriptors'
import { GetFumenDocument, GetIdolListDocument } from '~~/generated/graphql'
import { ArrayN, mapArrayN, unitArrayN } from '~~/utils'
import { LANES } from '~~/utils/common'
import { deserializeIdolList } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'
import { IdolData, IdolType, LiveData } from '~~/utils/types'

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

const {
  data: idolData,
  error: idolError,
  fetching: idolFetch,
} = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
useError(idolError)
const idolList = computed(() => (idolData.value ? deserializeIdolList(idolData.value) : []))

const [selectedIdolsRecent] = useLiveIdolSelectRecent()

const uncontrolledSelectedIdols = reactive(unitArrayN(5, null as null | IdolData))
const selectedIdols = mapArrayN(unitArrayN(5), (i) =>
  computed({
    get: () =>
      // オンメモリ優先、その次にローカルストレージ
      // オンメモリを併用している理由はスキルレベル選択で具体的なアイドルデータも書き換わるため (ローカルストレージにはidしか保存されてない)
      uncontrolledSelectedIdols[i] ?? idolList.value.find((v) => v.id === selectedIdolsRecent.value[id]?.[i]) ?? null,
    set: (value) => {
      uncontrolledSelectedIdols[i] = value
      // アイドルが選択されたらローカルストレージに保存する
      // immerのProxyと干渉するので生オブジェクトに戻す
      selectedIdolsRecent.value = produce(toRaw(selectedIdolsRecent.value), (draft) => {
        draft[id] ??= unitArrayN(5, null)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        draft[id]![i] = value?.id ?? null
      })
    },
  })
)

const noIdolSelected = computed(() => selectedIdols.every((v) => v === null))

const inputSelectedLaneType = reactive(unitArrayN(5, null as null | IdolType))
const selectedLaneType = mapArrayN(unitArrayN(5), (i) =>
  computed({
    // 選択されてない場合にはアイドルのタイプと一致するようにフォールバック
    get: () => inputSelectedLaneType[i] ?? selectedIdols[i]?.value?.type ?? null,
    set: (value) => (inputSelectedLaneType[i] = value),
  })
)
const laneData = computed(() => mapArrayN(selectedLaneType, (v) => ({ type: v.value })))

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
  margin-bottom: 8px;
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
