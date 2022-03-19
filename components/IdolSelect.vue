<template>
  <button class="idol-select" @click="present = true" @touchend="handleTouchEnd" @touchstart="handleTouchStart">
    <div v-if="modelValue" class="selected">
      <div class="title">{{ modelValue.title }}</div>
      <div class="name">{{ modelValue.name }}</div>
    </div>
    <div v-else class="not-selected">未選択</div>
  </button>
  <Sheet v-model:present="present" fixed no-top-padding>
    <div class="container">
      <div class="sticky">
        <IdolFilter v-model="filter"></IdolFilter>
      </div>
      <ul class="options">
        <li v-if="fetching" class="loading"><Spinner></Spinner></li>
        <li v-for="item in filteredIdolList" :key="item.id">
          <IdolItem :idol="item" variant="mini" @click="handleClick(item)"></IdolItem>
        </li>
      </ul>
    </div>
  </Sheet>
  <Sheet v-model:present="detailPresent">
    <VStack :spacing="16">
      <IdolItem v-if="modelValue !== null" :idol="modelValue"></IdolItem>
      <Section>
        <Button @click="handleReset">未選択に戻す</Button>
      </Section>
    </VStack>
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
  (e: 'update:modelValue', value: null | IdolData): void
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

const detailPresent = ref(false)

let touchTimer: NodeJS.Timeout | null = null
const handleTouchStart = () => {
  touchTimer = setTimeout(handleLongTouch, 500)
}
const handleTouchEnd = () => touchTimer && clearTimeout(touchTimer)

const handleLongTouch = () => (detailPresent.value = true)

const handleReset = () => {
  emit('update:modelValue', null)
  detailPresent.value = false
}

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

.sticky {
  @include bloom(black);
  position: sticky;
  padding: 24px 0 16px;
  top: 0;
  background-color: $background1;
  z-index: 1;
}

.container {
  position: relative;
  z-index: 0;
}

.loading {
  display: grid;
  justify-content: center;
}
</style>
