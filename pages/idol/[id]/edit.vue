<template>
  <Layout>
    <template #heading>アイドルを編集する</template>
    <IdolForm v-if="idol" :disabled="invalid || updating" :idol="idol" submit-label="保存" @submit="submit"></IdolForm>
    <Loading :busy="fetching">アイドルを読み込んでいます...</Loading>
    <Loading :busy="updating">アイドルを更新しています...</Loading>
  </Layout>
</template>
<script setup lang="ts">
import { useMutation, useQuery } from '@urql/vue'
import { useBeforeUnload } from '~~/composable/atom'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { useForm } from '~~/composable/form'
import { GetIdolDocument, UpdateIdolDocument } from '~~/generated/graphql'
import { deserializeIdol, serializeIdol } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'
import { IdolData } from '~~/utils/types'

const router = useRouter()
const route = useRoute()
const idolId = route.params.id

const { notAuthenticated } = useAuth()

const ready = ref(false)

const {
  data,
  fetching,
  error: getError,
} = useQuery({
  query: GetIdolDocument,
  variables: { id: idolId },
  pause: computed(() => notAuthenticated.value || ready.value),
})
useError(getError)

const idol = computed(() => (data.value ? deserializeIdol(data.value) : null))

const { invalid } = useForm()
const { executeMutation, fetching: updating, error: updateError } = useMutation(UpdateIdolDocument)
useError(updateError)

const submit = async (data: IdolData) => {
  const oldAbilityIds = idol.value?.skills.flatMap((v) => v.ability.map((w) => w.id)) ?? []
  const newAbilityIds = data.skills.flatMap((v) => v.ability.map((w) => w.id))
  const deletedAbilityIds = oldAbilityIds.filter((v) => !newAbilityIds.includes(v))

  ready.value = true

  const { error } = await executeMutation({
    object: serializeIdol(data, true),
    delete_ability_ids: deletedAbilityIds,
  })

  if (error) {
    return
  }

  skipUnloadConfirm()
  void router.push('/idol')
}

const skipUnloadConfirm = useBeforeUnload(() => confirm('ページを離れる場合は編集内容が破棄されます。よろしいですか？'))

useMeta(DEFAULT_META)
</script>
