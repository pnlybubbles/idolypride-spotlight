<template>
  <Layout>
    <template #heading>アイドル</template>
    <div class="main">
      <div class="sticky">
        <IdolFilter v-model="filter"></IdolFilter>
      </div>
      <div v-if="fetching" class="loading"><Spinner></Spinner></div>
      <ul v-else class="list">
        <li v-for="idol in filteredIdolList" :key="idol.id">
          <IdolItem :idol="idol" @click="handleClick(idol.id)"></IdolItem>
        </li>
      </ul>
      <div class="add-button">
        <ButtonLink to="/idol/new">アイドルを追加する</ButtonLink>
      </div>
    </div>
    <Sheet v-model:present="present">
      <Section>
        <ButtonLink :to="`/idol/${currentIdolId}/edit`" :disabled="!isOwned(currentIdolId)"
          >アイドルを編集する</ButtonLink
        >
        <NoteText v-if="!isOwned(currentIdolId)">自分の追加したアイドルのみ編集できます</NoteText>
      </Section>
    </Sheet>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { GetIdolListDocument } from '~/generated/graphql'
import { Filter } from '~~/components/idol-filter/types'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { deserializeIdolList } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'

const { notAuthenticated, user } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
useError(error)

const idolList = computed(() => (data.value ? deserializeIdolList(data.value) : []))
const filteredIdolList = computed(() => {
  const nameList = filter.value.filter((v) => v.type === 'name').map((v) => v.value)
  return idolList.value.filter((v) => (nameList.length === 0 ? true : nameList.includes(v.name)))
})

const present = ref(false)
const currentIdolId = ref('')

const handleClick = (idolId: string) => {
  currentIdolId.value = idolId
  present.value = true
}

const isOwned = (idolId: string) => {
  const idolOwner = idolList.value.find((v) => v.id === idolId)?.userId
  return idolOwner != null && user.value?.sub != null && idolOwner == user.value.sub
}

const filter = ref<Filter[]>([])

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

.add-button {
  @include align;
}

.sticky {
  @include bloom(black);

  position: sticky;
  top: 0;
  padding: 16px 0;
  margin: -16px 0;
  background-color: $background1;
  z-index: 1;
}
</style>
