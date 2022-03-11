<template>
  <Layout>
    <template #heading>アイドルを編集する</template>
  </Layout>
  <Loading :busy="fetching">アイドルを読み込んでいます...</Loading>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { GetIdolDocument } from '~~/generated/graphql'

const route = useRoute()
const idolId = route.params.id

const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({
  query: GetIdolDocument,
  variables: { id: idolId },
  pause: notAuthenticated,
})
if (error.value) {
  console.error(error.value)
}
console.log(data.value)
</script>
