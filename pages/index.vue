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
      <NuxtLink v-for="item in fumenList" :key="item.id" :to="`/fumen/${item.id}`" class="item">
        <div class="title">{{ item.title }}</div>
        <div class="unit">
          <UnitIcon class="unit-icon" :unit="item.unit"></UnitIcon>
          <span>{{ item.unit }}</span>
        </div>
      </NuxtLink>
      <ButtonLink to="/fumen/new">譜面追加</ButtonLink>
    </div>
  </Shell>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { GetFumentListDocument } from '~~/generated/graphql'

const { isAuthenticated, user, busy, getToken, signIn } = useAuth()

watchEffect(async () => {
  if (!user.value) {
    return
  }
  const token = await getToken()
  console.log(token)
})

const { data, error } = useQuery({ query: GetFumentListDocument })
if (error.value) {
  console.error(error.value)
}
const fumenList = computed(() => data.value?.fumen ?? [])
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
  display: grid;
  background-color: $surface1;
  border-radius: 4px;
  padding: 16px;
  grid: auto auto / auto;
  gap: 4px;
}

.title {
  font-weight: bold;
  font-size: 18px;
  color: $text1;
}

.unit {
  font-size: 12px;
  color: $text3;
}

.unit-icon {
  margin-right: 4px;
}

a {
  color: white;
  text-decoration: none;
}
</style>
