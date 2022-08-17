<template>
  <Layout class="root">
    <template #heading>アイドル</template>
    <template #right>
      <Button v-show="selectOwnedMode" variant="mini" @click="handleSubmitSelectOwned">複数選択完了</Button>
      <DotMenu v-show="!selectOwnedMode" v-slot="{ label, arg }" :menu="menu">
        <div class="dot-menu-item">
          <span>{{ label }}</span>
          <OwnSettingBadge v-if="(arg as any)?.annotate"></OwnSettingBadge>
        </div>
      </DotMenu>
    </template>
    <div class="main">
      <div class="sticky">
        <IdolFilter v-model="filter"></IdolFilter>
      </div>
      <div v-if="fetching" class="loading"><Spinner></Spinner></div>
      <ul v-else class="list">
        <li v-for="idol in filteredIdolList" :key="idol.id" class="item">
          <Virtualize>
            <template v-if="selectOwnedMode">
              <IdolItem :idol="idol" @click="toggleIsOwnedList(idol.id)"></IdolItem>
              <div
                class="box"
                :class="{ checked: isOwnedList[idol.id] }"
                :aria-disabled="isOwnedList[idol.id] === undefined"
                @click="toggleIsOwnedList(idol.id)"
                @touchend="null"
              >
                <font-awesome-icon class="icon" icon="check"></font-awesome-icon>
              </div>
            </template>
            <IdolItemEditable v-else :idol="idol" :is-admin="isAdmin"></IdolItemEditable>
          </Virtualize>
        </li>
      </ul>
      <div class="add-button">
        <Button v-if="selectOwnedMode" variant="secondary" @click="handleSubmitSelectOwned">複数選択完了</Button>
        <ButtonLink v-else to="/idol/new">アイドルを追加する</ButtonLink>
      </div>
    </div>
    <Sheet v-model:present="presentOwnedIdolChecker">
      <OwnedIdolChecker :idol-list="idolList"></OwnedIdolChecker>
    </Sheet>
  </Layout>
</template>
<script setup lang="ts">
import { useMutation, useQuery } from '@urql/vue'
import { GetIdolListDocument, IsUserAllowedDocument, UpdateOwnedIdolListDocument } from '~/generated/graphql'
import { Filter, idolFilter, idolSort } from '~~/components/idol-filter/helper'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { deserializeIdolList } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'

const { notAuthenticated, user } = useAuth()
const { data, fetching, error } = useQuery({
  query: GetIdolListDocument,
  pause: notAuthenticated,
  context: { additionalTypenames: ['owned_idol'] },
})
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

const selectOwnedMode = ref(false)
const presentOwnedIdolChecker = ref(false)

const menu = [
  { type: 'link', label: 'アイドルを追加する', to: '/idol/new' },
  {
    type: 'button',
    label: '加入済アイドルを複数選択する',
    arg: { annotate: true },
    action: () => (selectOwnedMode.value = true),
  },
  {
    type: 'button',
    label: '所持率チェッカー',
    action: () => (presentOwnedIdolChecker.value = true),
  },
] as const

const { executeMutation, error: addOwnedIdolListError } = useMutation(UpdateOwnedIdolListDocument)
useError(addOwnedIdolListError)

const isOwnedList = ref<Record<string, boolean>>({})

const toggleIsOwnedList = (id: string) => {
  const current = isOwnedList.value[id]
  if (current === undefined) {
    return
  }
  isOwnedList.value[id] = !current
}

watchEffect(() => {
  isOwnedList.value = Object.fromEntries(idolList.value.map((v) => [v.id, v.owned !== null] as const))
})

const handleSubmitSelectOwned = async () => {
  selectOwnedMode.value = false
  const diffAdd = Object.entries(isOwnedList.value)
    .filter(([, v]) => v)
    .map(([id]) => id)
    .filter((id) => idolList.value.find((v) => v.id === id)?.owned === null)
  const diffRemove = Object.entries(isOwnedList.value)
    .filter(([, v]) => !v)
    .map(([id]) => id)
    .filter((id) => idolList.value.find((v) => v.id === id)?.owned !== null)
  if (diffAdd.length === 0 && diffRemove.length === 0) {
    return
  }
  await executeMutation({
    add: diffAdd.map((v) => ({ idol_id: v })),
    remove: diffRemove,
  })
}

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
  display: grid;
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

.item {
  position: relative;
}

.box {
  @include clickable;
  @include round-corner;
  height: 20px;
  width: 20px;
  border: solid 1px $text3;
  display: grid;
  align-items: center;
  justify-items: center;
  position: absolute;
  right: 24px;
  top: 4px;

  &.checked {
    border-color: $text1;
    background-color: $text1;
  }

  &[aria-disabled='true'] {
    background: repeating-linear-gradient(-45deg, $surface1, $surface1 4px, transparent 4px, transparent 6px);
    border: solid 1px $surface1;
    opacity: 0.64;
  }
}

.box input {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  appearance: none;
  outline: none;
  opacity: 0;
  margin: 0;
}

.icon {
  color: $background1;
  opacity: 0;
}

.checked .icon {
  opacity: 1;
}

.dot-menu-item {
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
  justify-content: start;
  align-items: center;
}
</style>
