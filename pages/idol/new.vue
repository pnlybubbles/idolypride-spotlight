<template>
  <Shell>
    <template #heading>アイドル追加</template>
    <input v-model="name" type="text" :disabled="fetching" />
    <button :disabled="fetching" @click="submit">追加</button>
  </Shell>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { CreateIdolDocument } from '~~/generated/graphql'

const router = useRouter()
const name = ref('')
const { executeMutation, fetching } = useMutation(CreateIdolDocument)
const submit = async () => {
  await executeMutation({ object: { name: name.value } })
  name.value = ''
  void router.push('/idol')
}
</script>
<style lang="scss" scoped></style>
