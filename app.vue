<template>
  <div>
    <NuxtPage />
  </div>
</template>
<script setup lang="ts">
import { provideUID } from './composable/atom'
import { provideToast } from './composable/toast'

provideUID()
provideToast()
</script>
