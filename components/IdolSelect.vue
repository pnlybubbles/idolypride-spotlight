<template>
  <button class="idol-select" @click="present = true" @touchend="null">
    <div v-if="modelValue" class="selected">
      <div class="title">{{ modelValue.title }}</div>
      <div class="name">{{ modelValue.name }}</div>
    </div>
    <div v-else class="not-selected">未選択</div>
  </button>
  <Sheet v-model:present="present" fixed>
    <div class="filter">
      <IdolFilter v-model="filter"></IdolFilter>
    </div>
    <ul class="options">
      <li v-if="fetching" class="loading"><Spinner></Spinner></li>
      <li v-for="item in filteredIdolList" :key="item.id">
        <IdolItem :idol="item" variant="mini" @click="handleClick(item)"></IdolItem>
      </li>
    </ul>
  </Sheet>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { GetIdolListDocument } from '~~/generated/graphql'
import { deserializeIdolList } from '~~/utils/formatter'
import { IdolData } from '~~/utils/types'
import { Filter, idolFilter } from './idol-filter/helper'

interface Props {
  modelValue: null | IdolData
}
defineProps<Props>()
interface Emits {
  (e: 'update:modelValue', value: IdolData): void
}
const emit = defineEmits<Emits>()

const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const idolList = computed(() => (data.value ? deserializeIdolList(data.value) : []))
const filteredIdolList = computed(() => idolFilter(idolList.value, filter.value))

const present = ref(false)

const handleClick = (item: IdolData) => {
  emit('update:modelValue', item)
  present.value = false
}

const filter = ref<Filter[]>([])
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.idol-select {
  @include reset-button;
  @include clickable;
  padding: 8px 0;
}

.not-selected {
  font-size: $typography-s;
  color: $text3;
}

.selected {
  display: grid;
  grid: auto auto / auto;
}

.title {
  font-size: $typography-s;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  mask-image: linear-gradient(-90deg, transparent 0, #000 20px);
}

.name {
  font-size: $typography-s;
  color: $text3;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.filter {
  padding: 0 0 8px;
}

.button {
  @include reset-button;
  @include align;
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100%;
  text-align: start;
  user-select: none;
  display: grid;
  grid: auto / auto 1fr;
  align-items: center;
  gap: 12px;

  &:active {
    background-color: $surface1;
  }
}

.loading {
  display: grid;
  justify-content: center;
}
</style>
