<template>
  <div>
    <h1>アイドル追加</h1>
    <input v-model="name" type="text" :disabled="fetching" />
    <button :disabled="fetching" @click="submit">追加</button>
  </div>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { CreateIdolDocument } from '~~/generated/graphql'

const { push } = useRouter()
const name = ref('')
const { executeMutation, fetching } = useMutation(CreateIdolDocument)
const submit = async () => {
  await executeMutation({ object: { name: name.value } })
  name.value = ''
  push('/idol')
}
</script>
<style lang="scss" scoped></style>
