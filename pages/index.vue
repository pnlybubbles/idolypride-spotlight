<template>
  <div>
    <h1>IDOLY PRIDE SPOTLIGHT</h1>
    <div v-if="isAuthenticated">{{ user?.email }}</div>
    <button v-else @click="signIn">Sign In</button>
    <NuxtLink to="/idol">アイドル一覧</NuxtLink>
    <div>
      <NuxtLink v-for="item in data" :key="item.id" :to="`/fumen/${item.id}`" class="item">
        {{ item.title }}
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import data from '~/data/live'
import { useAuth } from '~~/composable/auth0'

const { $auth0 } = useNuxtApp()
const { isAuthenticated, user, signIn } = useAuth($auth0)
</script>
<style lang="scss" scoped>
.item {
  display: inline-block;
  border: solid 1px white;
  border-radius: 4px;
  padding: 10px;
}
a {
  color: white;
  text-decoration: none;
}
</style>
