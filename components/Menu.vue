<template>
  <div class="menu-bar">
    <NuxtLink class="menu-button" to="/" :class="{ active: active === 'top' }" @touchend="null">
      <font-awesome-icon icon="music" />
    </NuxtLink>
    <NuxtLink class="menu-button" to="/idol" :class="{ active: active === 'idol' }" @touchend="null">
      <font-awesome-icon icon="user-group" />
    </NuxtLink>
    <button class="menu-button" @click="present = true" @touchend="null">
      <font-awesome-icon icon="gear" />
    </button>
  </div>
  <Sheet v-model:present="present">
    <VStack :spacing="16">
      <Section>
        <template #label>このページについて</template>
        <NoteText><HelpText /></NoteText>
      </Section>
      <Section>
        <template #label>ユーザー情報</template>
        <NoteText>{{ user?.email }}</NoteText>
      </Section>
      <Section>
        <Button @click="handleSignOut">サインアウト</Button>
      </Section>
    </VStack>
  </Sheet>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'

const router = useRouter()
const route = useRoute()
const active = route.path === '/' ? 'top' : route.path === '/idol' ? 'idol' : null
const present = ref(false)
const { user, signOut } = useAuth()
const handleSignOut = async () => {
  await signOut()
  await router.push('/')
}
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.menu-button {
  @include reset-button;
  @include clickable;

  display: grid;
  align-items: center;
  justify-items: center;
  width: 40px;
  height: 40px;
  color: $text1;
  border-radius: 12px;

  &.active {
    background-color: $surface1;
  }
}

.menu-bar {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  border: solid 1px $surface1;
  display: grid;
  grid: auto / auto-flow;
  padding: 4px 4px;

  @include background-blur;
  @include round-corner('L');
}
</style>
