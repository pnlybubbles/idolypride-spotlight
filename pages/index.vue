<template>
  <Layout>
    <template #heading>ライブ</template>
    <div class="list">
      <NuxtLink v-for="item in fumenList" :key="item.id" :to="`/fumen/${item.id}`" class="item" @touchend="null">
        <div class="title">{{ item.title }}</div>
        <div class="unit">
          <UnitIcon class="unit-icon" :unit="item.rawUnit"></UnitIcon>
          <span>{{ item.unit }}</span>
        </div>
      </NuxtLink>
      <div v-if="fetching" class="loading"><Spinner></Spinner></div>
      <ButtonLink to="/fumen/new">譜面を追加する</ButtonLink>
    </div>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { GetFumentListDocument } from '~~/generated/graphql'
import { lift, literal } from '~~/utils'
import { UnitName, UNIT_NAME, UNIT_NAME_ORDERING } from '~~/utils/common'
import { DEFAULT_META } from '~~/utils/meta'

const { notAuthenticated } = useAuth()

const { data, error, fetching } = useQuery({ query: GetFumentListDocument, pause: notAuthenticated })
useError(error)

const unitNameOrdering = lift(UNIT_NAME_ORDERING)

const sortFumen = <T extends { title: string; unit: UnitName | undefined }>(fumen: T[]) =>
  [...fumen].sort((a, b) => {
    const unitOrdering = (unitNameOrdering(a.unit) ?? 9999) - (unitNameOrdering(b.unit) ?? 9999)
    if (unitOrdering !== 0) {
      return unitOrdering
    }
    const titleOrdering = a.title.localeCompare(b.title, 'ja')
    return titleOrdering
  })

const fumenList = computed(() =>
  sortFumen(data.value?.fumen.map((v) => ({ ...v, rawUnit: v.unit, unit: literal(v.unit, UNIT_NAME) })) ?? [])
)

useHead(DEFAULT_META)
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
  @include round-corner('L');
  @include clickable;

  display: grid;
  background-color: $surface1;
  padding: 16px;
  grid: auto auto / auto;
  gap: 4px;
}

.title {
  font-weight: bold;
  font-size: $typography-l;
  color: $text1;
}

.unit {
  font-size: $typography-s;
  color: $text3;
  display: grid;
  grid: auto / auto-flow;
  align-items: center;
  justify-content: start;
  gap: 4px;

  .unit-icon {
    margin-top: -1px;
  }
}

.loading {
  display: grid;
  justify-items: center;
}
</style>
