<template>
  <Button
    v-if="idol.owned !== null"
    :disabled="disableUpdateSkillLevels"
    variant="secondary"
    @click="updateSkillLevels"
  >
    <with-symbol>
      {{ skillLevelsApplying ? 'スキルレベルを保存中...' : 'スキルレベルを保存する' }}
      <template #symbol><OwnSettingBadge></OwnSettingBadge></template>
    </with-symbol>
  </Button>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { AddOwnedIdolDocument } from '~~/generated/graphql'
import { ArrayN, mapArrayN } from '~~/utils'
import { IdolData } from '~~/utils/types'
import { useError } from '~~/composable/error'
import { pickSkillsByLevel } from '~~/utils/formatter'

interface Props {
  idol: IdolData
  skillLevels: ArrayN<number, 3> | null
}

const props = defineProps<Props>()

const {
  executeMutation: executeAddMutation,
  error: errorAdding,
  fetching: updatingSkillLevels,
} = useMutation(AddOwnedIdolDocument)
useError(errorAdding)

const maxSkillLevels = computed(() => mapArrayN(pickSkillsByLevel(props.idol.skills), (v) => v.level))

const updateSkillLevels = async () => {
  skillLevelsApplying.value = true
  await executeAddMutation({
    idol_id: props.idol.id,
    skill_levels: props.skillLevels ?? props.idol.owned?.skillLevels ?? maxSkillLevels.value,
  })
}

const skillLevelsUpToDate = computed(() => {
  const skillLevels = props.skillLevels
  return (
    // 加入していない場合は変更点はなしなので最新
    props.idol.owned === null ||
    // 保存済みデータがある、かつ変更がある場合は、データが全部一致していたら最新
    (props.idol.owned.skillLevels !== null
      ? skillLevels !== null
        ? mapArrayN(props.idol.owned.skillLevels, (v, i) => skillLevels[i] === v).every((v) => v)
        : // 保存済みデータがある、かつ変更がない場合は最新
          true
      : // 保存済みデータがない場合は、すべて最新ではない (MAXがデフォルト表示)
        false)
  )
})

const disableUpdateSkillLevels = computed(
  () => updatingSkillLevels.value || skillLevelsApplying.value || skillLevelsUpToDate.value
)

const skillLevelsApplying = ref(false)
watchEffect(() => {
  if (skillLevelsUpToDate.value) {
    skillLevelsApplying.value = false
  }
})
</script>
