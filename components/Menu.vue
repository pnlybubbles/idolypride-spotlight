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
      <div class="heading">
        <img src="/logo.png" alt="logo" class="logo" />
        <div class="logo-label">{{ TITLE }}</div>
      </div>
      <div class="section">
        <div class="section-hedding">このページについて</div>
        <NoteText><HelpText /></NoteText>
      </div>
      <div class="section">
        <div class="section-hedding">ユーザー情報</div>
        <NoteText>{{ user?.email }}</NoteText>
      </div>
      <div class="section">
        <Button @click="handleSignOut">サインアウト</Button>
      </div>
    </VStack>
  </Sheet>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'
import { TITLE } from '~~/utils/meta'

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

$gap: 4px;
.menu-button {
  @include reset-button;
  @include clickable;

  display: grid;
  align-items: center;
  justify-items: center;
  width: 40px;
  height: 40px;
  color: $text1;
  border-radius: map-get($border-radius-map, 'L') - calc($gap / 2);

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
  padding: $gap $gap;
  gap: $gap;

  @include background-blur;
  @include round-corner('L');
  @include bloom(black);
}

.heading {
  display: grid;
  grid: auto auto / auto;
  justify-items: center;
  padding-bottom: 8px;
}

.logo {
  display: block;
  width: 40px;
  height: 40px;
  justify-self: center;
}

.logo-label {
  font-size: $typography-s;
  font-weight: bold;
}

.section {
  @include align;
  display: grid;
  grid: auto-flow / auto;
  gap: 4px;
}

.section-hedding {
  font-size: $typography-s;
  color: $text1;
  font-weight: bold;
}
</style>
