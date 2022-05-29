<template>
  <button class="dot-button" :class="{ active: open }" @click="open = !open" @touchend="null">
    <font-awesome-icon icon="ellipsis"></font-awesome-icon>
    <Sheet v-model:present="open">
      <ul class="menu">
        <li v-for="item in menu" :key="item.label">
          <NuxtLink v-if="item.type === 'link'" class="item" :to="item.to" @click="handleClickItem" @touchend="null">{{
            item.label
          }}</NuxtLink>
          <button v-else class="item" @click="handleClickItem(), item.action()" @touchend="null">
            {{ item.label }}
          </button>
        </li>
      </ul>
    </Sheet>
  </button>
</template>
<script setup lang="ts">
interface Props {
  menu: readonly ({ type: 'link'; label: string; to: string } | { type: 'button'; label: string; action: () => void })[]
}
defineProps<Props>()
const handleClickItem = () => {
  open.value = false
}

const open = ref(false)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.dot-button {
  @include reset-button;
  @include clickable;

  font-size: $typography-xs;
  height: 32px;
  width: 32px;
  display: grid;
  align-items: center;
  justify-items: center;
  border-radius: 50%;
  background-color: $surface1;
  color: $text1;
  align-self: flex-start;
  border: solid 1px transparent;
  margin: -1px;

  &.active {
    border-color: $text1;
  }
}

.menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  @include reset-button;
  @include clickable;
  @include align;

  display: block;
  width: 100%;
  text-align: left;
  color: inherit;
  padding-top: 8px;
  padding-bottom: 8px;

  &:active {
    background-color: $surface1;
  }
}
</style>
