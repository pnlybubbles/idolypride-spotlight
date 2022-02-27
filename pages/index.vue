<template>
  <div v-if="busy">
    <Spinner></Spinner>
  </div>
  <div v-else-if="!isAuthenticated">
    <button @click="signIn">サインイン</button>
  </div>
  <Shell v-else-if="isAuthenticated">
    <template #heading>IDOLY PRIDE SPOTLIGHT</template>
    <div class="list">
      <NuxtLink v-for="item in data" :key="item.id" :to="`/fumen/${item.id}`" class="item">
        {{ item.title }}
      </NuxtLink>
      <Link to="/fumen/new">譜面追加</Link>
    </div>
  </Shell>
</template>
<script setup lang="ts">
import data from '~/data/live'
import { useAuth } from '~~/composable/auth0'

const { isAuthenticated, user, busy, getToken, signIn } = useAuth()

watchEffect(async () => {
  if (!user.value) {
    return
  }
  const token = await getToken()
  console.log(token)
})
</script>
<style lang="scss" scoped>
@import '../components/token.scss';

.list {
  @include align;

  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
}

.item {
  display: block;
  background-color: $surface1;
  border-radius: 4px;
  padding: 16px;
  font-weight: bold;
}

a {
  color: white;
  text-decoration: none;
}
</style>
