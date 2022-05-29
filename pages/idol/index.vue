<template>
  <Layout class="root">
    <template #heading>アイドル</template>
    <div class="main">
      <div class="sticky">
        <IdolFilter v-model="filter"></IdolFilter>
      </div>
      <div v-if="fetching" class="loading"><Spinner></Spinner></div>
      <ul v-else class="list">
        <li v-for="idol in filteredIdolList" :key="idol.id">
          <IdolItemEditable :idol="idol" :is-admin="isAdmin"></IdolItemEditable>
        </li>
      </ul>
      <div class="add-button">
        <ButtonLink to="/idol/new">アイドルを追加する</ButtonLink>
      </div>
    </div>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { GetIdolListDocument, IsUserAllowedDocument } from '~/generated/graphql'
import { Filter, idolFilter, idolSort } from '~~/components/idol-filter/helper'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { deserializeIdolList } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'

const { notAuthenticated, user } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
useError(error)

const idolList = computed(() => (data.value ? deserializeIdolList(data.value) : []))
const filteredIdolList = computed(() => idolSort(idolFilter(idolList.value, filter.value)))

const filter = ref<Filter[]>([])

const { data: isAllowedData, error: isAllowedError } = useQuery({
  query: IsUserAllowedDocument,
  variables: computed(() => ({ id: user.value?.sub ?? '' })),
  pause: notAuthenticated,
})
useError(isAllowedError)

const isAdmin = computed(() => {
  const allow = isAllowedData.value?.user_by_pk?.allow
  return allow !== undefined && allow
})

useHead(DEFAULT_META)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/utils.scss';
@import '~~/components/partials/token.scss';

.root {
  position: relative;
  z-index: 0;
}

.main {
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
  gap: 16px;
}

.add-button {
  @include align;
}

.sticky {
  @include background-blur('blend');

  position: sticky;
  top: 0;
  padding: 16px 0;
  margin-top: -16px;
  z-index: 1;
  border-bottom: solid 1px $surface1;
}
</style>
