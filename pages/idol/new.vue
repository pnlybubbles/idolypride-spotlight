<template>
  <div>
    <NuxtLink to="/idol">アイドル一覧</NuxtLink>
    <h1>アイドル追加</h1>
    <input v-model="name" type="text" />
    <button @click="submit">追加</button>
  </div>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { CreateIdolDocument } from '~~/generated/graphql'

const name = ref('')
const { executeMutation } = useMutation(CreateIdolDocument)
const submit = () => executeMutation({ object: { name: name.value } })
</script>
<style lang="scss" scoped></style>
