<template>
  <div>
    <h1>
      IDOLY PRIDE SPOTLIGHT
    </h1>
    <div>
      <NuxtLink :to="`/fumen/${item.id}`" class="item" v-for="item in data" :key="item.id">
        {{item.title}}
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import data from '../data/music'
</script>
<style lang="scss" scoped>
.item {
  border: solid 1px white;
  border-radius: 4px;
  padding: 10px;
}
a {
  color: white;
  text-decoration: none;
}
</style>
