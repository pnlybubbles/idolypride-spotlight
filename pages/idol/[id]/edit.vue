<template>
  <Layout>
    <template #heading>アイドルを編集する</template>
    <IdolForm v-if="idol" :disabled="invalid || updating" :idol="idol" @submit="submit"></IdolForm>
    <Loading :busy="fetching">アイドルを読み込んでいます...</Loading>
    <Loading :busy="updating">アイドルを更新しています...</Loading>
  </Layout>
</template>
<script setup lang="ts">
import { useMutation, useQuery } from '@urql/vue'
import { useBeforeUnload } from '~~/composable/atom'
import { useAuth } from '~~/composable/auth0'
import { useForm } from '~~/composable/form'
import { useRouteGuard } from '~~/composable/route'
import { GetIdolDocument, UpdateIdolDocument } from '~~/generated/graphql'
import { deserializeIdol, serializeIdol } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'
import { IdolData } from '~~/utils/types'

const router = useRouter()
const route = useRoute()
const idolId = route.params.id

const { notAuthenticated } = useAuth()

const ready = ref(false)

const { data, fetching, error } = useQuery({
  query: GetIdolDocument,
  variables: { id: idolId },
  pause: computed(() => notAuthenticated.value || ready.value),
})
if (error.value) {
  console.error(error.value)
}

const idol = computed(() => (data.value ? deserializeIdol(data.value) : null))

const { invalid } = useForm()
const { executeMutation, fetching: updating } = useMutation(UpdateIdolDocument)
const submit = async (data: IdolData) => {
  const oldAbilityIds = idol.value?.skills.flatMap((v) => v.ability.map((w) => w.id)) ?? []
  const newAbilityIds = data.skills.flatMap((v) => v.ability.map((w) => w.id))
  const deletedAbilityIds = oldAbilityIds.filter((v) => !newAbilityIds.includes(v))

  ready.value = true

  await executeMutation({
    object: serializeIdol(data, true),
    delete_ability_ids: deletedAbilityIds,
  })

  skipUnloadConfirm()
  void router.push('/idol')
}

const skipUnloadConfirm = useBeforeUnload(() => confirm('ページを離れる場合は編集内容が破棄されます。よろしいですか？'))

useRouteGuard()
useMeta(DEFAULT_META)
</script>
