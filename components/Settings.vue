<template>
  <VStack :spacing="16">
    <div class="heading">
      <img src="/logo.svg" alt="logo" class="logo" />
      <div class="logo-label">{{ TITLE }}</div>
    </div>
    <div class="section">
      <div class="section-headding">スキル名表示</div>
      <Check v-model="internalLabel" :disabled="!readyInternalLabel">内部的な識別子で表示する</Check>
    </div>
    <div class="section">
      <div class="section-headding">譜面表示の拡大率</div>
      <TextField
        v-model="fumenScaleFactor"
        placeholder="5"
        :disabled="!readyFumenScaleFactor"
        type="number"
        required
        :preset="[3, 4, 5, 10, 15]"
      ></TextField>
    </div>
    <div class="section">
      <div class="section-headding">このページについて</div>
      <NoteText><HelpText /></NoteText>
    </div>
    <div class="section">
      <div class="section-headding">ユーザー情報</div>
      <NoteText>{{ user?.email }}</NoteText>
    </div>
    <div class="section">
      <Button @click="handleSignOut">サインアウト</Button>
    </div>
  </VStack>
</template>
<script setup lang="ts">
import { useAuth } from '~~/composable/auth0'
import { useInternalLabel, useFumenScaleFactor } from '~~/composable/localstorage-descriptors'
import { TITLE } from '~~/utils/meta'
import { useIntAsString } from '~~/composable/atom'

const { user, signOut } = useAuth()

const router = useRouter()

const handleSignOut = async () => {
  await signOut()
  await router.push('/')
}

const [internalLabel, readyInternalLabel] = useInternalLabel()
const [fumenScaleFactorInt, readyFumenScaleFactor] = useFumenScaleFactor()
const fumenScaleFactor = useIntAsString(fumenScaleFactorInt)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

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

.section-headding {
  font-size: $typography-s;
  color: $text1;
  font-weight: bold;
}
</style>
