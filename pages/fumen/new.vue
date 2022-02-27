<template>
  <Shell>
    <template #heading>譜面を追加する</template>
    <VStack :spacing="16">
      <Section>
        <template #label>タイトル</template>
        <TextField v-model="title" placeholder="Sunny Peace Harmony" required></TextField>
      </Section>
      <Section>
        <template #label>ビート数</template>
        <TextField v-model="beat" placeholder="167" :error="!validPositiveInt(beat)" required>
          <template #error>半角数字で入力してください</template>
        </TextField>
      </Section>
      <Section>
        <template #label>Aスキル</template>
        <div class="note">一番左のレーンから順に、レーンごとのAスキルの発動ビートをスペース区切りで入力します</div>
        <TextField
          v-for="i in LANES"
          :key="i"
          v-model="aSkill[i]"
          :placeholder="A_SKILL_PLACEHOLDER[i]"
          :error="!validSpaceSeparatedPositiveInt(aSkill[i])"
        >
          <template #error>ビート数を半角スペース区切りで入力してください</template>
        </TextField>
      </Section>
      <Section>
        <template #label>SPスキル</template>
        <div class="note">
          一番左のレーンから順に、レーンごとのSPスキルの発動ビートを入力します。SPレーンではない場合には入力する必要はありません
        </div>
        <TextField
          v-for="i in LANES"
          :key="i"
          v-model="spSkill[i]"
          :placeholder="SP_SKILL_PLACEHOLDER[i]"
          :error="!validSpaceSeparatedPositiveInt(spSkill[i])"
        >
          <template #error>ビート数を半角スペース区切りで入力してください</template>
        </TextField>
      </Section>
      <Section>
        <Button :disabled="fetching" @click="submit">追加</Button>
      </Section>
    </VStack>
  </Shell>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { SUNNY_PEACE_HARMONY } from '~~/data/live'
import { CreateFumenDocument } from '~~/generated/graphql'
import { mapArrayN } from '~~/utils'
import { LANES } from '~~/utils/common'
import { validSpaceSeparatedPositiveInt, validPositiveInt } from '~~/utils/validation'

const { push } = useRouter()
const title = ref('')
const beat = ref('')
const aSkill = reactive(['', '', '', '', ''] as const)
const spSkill = reactive(['', '', '', '', ''] as const)
const parseSpaceSeparatedInt = (value: string) =>
  value
    .split(' ')
    .filter((v) => v !== '')
    .map((v) => parseInt(v, 10))
const aSkillArray = computed(() => mapArrayN(aSkill, parseSpaceSeparatedInt))
const spSkillArray = computed(() => mapArrayN(spSkill, parseSpaceSeparatedInt))
const { executeMutation, fetching } = useMutation(CreateFumenDocument)
const submit = async () => {
  const { error } = await executeMutation({
    object: { title: title.value, beat: parseInt(beat.value, 10), a: aSkillArray.value, sp: spSkillArray.value },
  })
  if (error === undefined) {
    push('/')
  }
}
const A_SKILL_PLACEHOLDER = mapArrayN(SUNNY_PEACE_HARMONY.a, (v) => v.join(' '))
const SP_SKILL_PLACEHOLDER = mapArrayN(SUNNY_PEACE_HARMONY.sp, (v) => v.join(' '))
</script>
<style lang="scss" scoped>
@import '~/components/token.scss';

.note {
  font-size: 12px;
  color: $text3;
}
</style>
