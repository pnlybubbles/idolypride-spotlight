<template>
  <Layout>
    <template #heading>アイドル</template>
    <div class="main">
      <div v-if="fetching" class="loading"><Spinner></Spinner></div>
      <ul v-else class="list">
        <li v-for="idol in idolList" :key="idol.id">
          <button class="item-button" @click="handleClick(idol.id)" @touchend="null">
            <IdolItem :idol="idol"></IdolItem>
          </button>
        </li>
      </ul>
      <div class="add-button">
        <ButtonLink to="/idol/new">アイドルを追加する</ButtonLink>
      </div>
    </div>
    <Sheet v-model:present="present">
      <div class="align">
        <ButtonLink :to="`/idol/${currentIdolId}/edit`">アイドルを編集する</ButtonLink>
      </div>
    </Sheet>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { GetIdolListDocument } from '~/generated/graphql'
import { useAuth } from '~~/composable/auth0'
import { useRouteGuard } from '~~/composable/route'
import { deserializeIdolList } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'

const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const idolList = computed(() => (data.value ? deserializeIdolList(data.value) : []))

const present = ref(false)
const currentIdolId = ref('')

const handleClick = (idolId: string) => {
  currentIdolId.value = idolId
  present.value = true
}

useRouteGuard()
useMeta(DEFAULT_META)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/utils.scss';
@import '~~/components/partials/token.scss';

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

.item-button {
  @include clickable;
  @include reset-button;
}

.add-button {
  @include align;
}

.align {
  @include align;
}
</style>
