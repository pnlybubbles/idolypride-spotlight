<template>
  <div v-if="busy">
    <Spinner></Spinner>
  </div>
  <div v-else-if="!isAuthenticated">
    <button @click="signIn">サインイン</button>
  </div>
  <Shell v-else-if="isAuthenticated">
    <template #heading>IDOLY PRIDE SPOTLIGHT</template>
    <span>{{ user?.email }}</span>
    <div>
      <button @click="signOut">サインアウト</button>
      <NuxtLink to="/idol">アイドル一覧</NuxtLink>
    </div>
    <div>
      <NuxtLink v-for="item in data" :key="item.id" :to="`/fumen/${item.id}`" class="item">
        {{ item.title }}
      </NuxtLink>
    </div>
    <NuxtLink to="/fumen/new">譜面追加</NuxtLink>
  </Shell>
</template>
<script setup lang="ts">
import data from '~/data/live'
import { useAuth } from '~~/composable/auth0'

const { isAuthenticated, user, busy, getToken, signIn, signOut } = useAuth()

watchEffect(async () => {
  if (!user.value) {
    return
  }
  const token = await getToken()
  console.log(token)
})
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
