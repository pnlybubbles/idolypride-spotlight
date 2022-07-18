<template>
  <IdolItem :idol="idol" @click="present = true"></IdolItem>
  <Sheet v-model:present="present">
    <VStack :spacing="16">
      <IdolItem v-model:skill-levels="selectedLevels" :idol="idol" variant="big" no-event></IdolItem>
      <Section>
        <ButtonLink :to="`/idol/${idol.id}/edit`" :disabled="!canEdit">アイドルを編集する</ButtonLink>
        <NoteText v-if="!canEdit">自分の追加したアイドルのみ編集できます</NoteText>
        <NoteText v-if="isAdmin">管理者権限によりすべてのアイドルを編集できます</NoteText>
      </Section>
      <Section>
        <template #label>管理</template>
        <template #sub><OwnSettingBadge></OwnSettingBadge></template>
        <Check v-model="isOwned" :disabled="idol.owned === null" @update:model-value="mutate">加入している</Check>
      </Section>
    </VStack>
  </Sheet>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { useDebounce } from '~~/composable/atom'
import { AddOwnedIdolDocument, RemoveOwnedIdolDocument } from '~~/generated/graphql'
import { IdolData } from '~~/utils/types'
import { pickSkillsByLevel } from '~~/utils/formatter'
import { mapArrayN } from '~~/utils'

interface Props {
  idol: IdolData
  isAdmin: boolean
}
const props = defineProps<Props>()

const { user } = useAuth()

const present = ref(false)

const isManaged = computed(() => {
  const idolOwner = props.idol.userId
  return idolOwner != null && user.value?.sub != null && idolOwner == user.value.sub
})

const canEdit = computed(() => {
  return isManaged.value || props.isAdmin
})

const isOwned = ref(props.idol.owned !== null)

watchEffect(() => {
  isOwned.value = props.idol.owned !== null
})

const { executeMutation: executeAddMutation, error: errorAdding } = useMutation(AddOwnedIdolDocument)
useError(errorAdding)

const { executeMutation: executeRemoveMutation, error: errorRemoving } = useMutation(RemoveOwnedIdolDocument)
useError(errorRemoving)

const mutate = useDebounce(isOwned.value, 500, async (value) => {
  if (props.idol.owned === undefined) {
    return
  }
  if (value) {
    await executeAddMutation({ idol_id: props.idol.id })
  } else {
    await executeRemoveMutation({ idol_id: props.idol.id })
  }
})

const skillLevels = mapArrayN(pickSkillsByLevel(props.idol.skills), (v) => v.level)
const selectedLevels = ref(skillLevels)
</script>
