<template>
  <VStack :spacing="16">
    <Section>
      <Callout>
        <template #title>注意</template>
        一部のアイドルが追加されていない可能性があるため、割合が正しくないことがあります
      </Callout>
    </Section>
    <Section>
      <template #label>現在の加入済</template>
      <div class="text">
        <div class="em">{{ owned }}</div>
        <div>/</div>
        <div>{{ all }}</div>
      </div>
    </Section>
    <Section>
      <template #label>コンプリート率</template>
      <div class="text">
        <div class="em">{{ ratio }}</div>
        <div>%</div>
      </div>
    </Section>
    <Section>
      <template #label>未加入 (タイプ別)</template>
      <div class="horizontal">
        <div v-for="(item, key) in notOwnedSummaryByType" :key="key" class="text">
          <div>{{ item.label }}</div>
          <div class="em">{{ item.owned }}</div>
          <div>/</div>
          <div>{{ item.all }}</div>
        </div>
      </div>
    </Section>
    <Section>
      <template #label>未加入 (ロール別)</template>
      <div class="horizontal">
        <div v-for="(item, key) in notOwnedSummaryByRole" :key="key" class="text">
          <div>{{ item.label }}</div>
          <div class="em">{{ item.owned }}</div>
          <div>/</div>
          <div>{{ item.all }}</div>
        </div>
      </div>
    </Section>
    <Section>
      <ButtonLink :to="tweetLink">ツイートする</ButtonLink>
    </Section>
  </VStack>
</template>
<script setup lang="ts">
import { IdolData } from '~~/utils/types'
import { BASE_URL } from '~~/utils/meta'
import { IDOL_ROLE, IDOL_TYPE } from '~~/utils/common'
import { mapObject } from '~~/utils'

interface Props {
  idolList: IdolData[]
}

const props = defineProps<Props>()

const owned = computed(() => props.idolList.filter((v) => v.owned).length)
const all = computed(() => props.idolList.length)
const ratio = computed(() => (Math.round((owned.value / all.value) * 1000) / 10).toFixed(1))

const notOwnedSummaryByType = computed(() =>
  mapObject(IDOL_TYPE, (v, k) => ({
    label: v,
    owned: props.idolList.filter((v) => v.owned === false).filter((v) => v.type === k).length,
    all: props.idolList.filter((v) => v.type === k).length,
  }))
)

const notOwnedSummaryByRole = computed(() =>
  mapObject(IDOL_ROLE, (v, k) => ({
    label: v,
    owned: props.idolList.filter((v) => v.owned === false).filter((v) => v.role === k).length,
    all: props.idolList.filter((v) => v.role === k).length,
  }))
)

const tweetLink = computed(() => {
  const text = `アイドル加入率チェッカー
・加入済：${owned.value}/${all.value}（コンプリート率 ${ratio.value}%）
・未加入：${Object.values(notOwnedSummaryByType.value)
    .map((v) => `${v.label} ${v.owned}`)
    .join(', ')}
${BASE_URL}
#アイプラ
`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
})
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.horizontal {
  display: grid;
  grid: auto / auto-flow;
  gap: 8px;
  justify-content: start;
}

.text {
  font-size: $typography-s;
  color: $text3;
  grid: auto / auto-flow;
  display: grid;
  justify-content: start;
  align-items: flex-end;
  gap: 4px;
}

.em {
  font-size: $typography-l;
  color: $text1;
  font-weight: bold;
}
</style>
