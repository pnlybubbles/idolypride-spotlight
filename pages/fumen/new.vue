<template>
  <Shell>
    <template #heading>譜面を追加する</template>
    <VStack :spacing="16">
      <Section>
        <template #label>タイトル</template>
        <TextField v-model="name" placeholder="Sunny Peace Harmony"></TextField>
      </Section>
      <Section>
        <template #label>ビート数</template>
        <TextField v-model="beat" placeholder="167"></TextField>
      </Section>
      <Section>
        <template #label>Aスキル</template>
        <div class="note">一番左のレーンから順に、レーンごとのAスキルの発動ビートをスペース区切りで入力します</div>
        <TextField v-model="aSkill[0]" placeholder="28 64 120"></TextField>
        <TextField v-model="aSkill[1]" placeholder="24 128 167"></TextField>
        <TextField v-model="aSkill[2]" placeholder="13 48 90 160"></TextField>
        <TextField v-model="aSkill[3]" placeholder="4 59 79 152"></TextField>
        <TextField v-model="aSkill[4]" placeholder="32 105 142"></TextField>
      </Section>
      <Section>
        <template #label>SPスキル</template>
        <div class="note">
          一番左のレーンから順に、レーンごとのSPスキルの発動ビートを入力します。SPレーンではない場合には入力する必要はありません
        </div>
        <TextField v-model="spSkill[0]" placeholder=""></TextField>
        <TextField v-model="spSkill[1]" placeholder="99"></TextField>
        <TextField v-model="spSkill[2]" placeholder="63"></TextField>
        <TextField v-model="spSkill[3]" placeholder=""></TextField>
        <TextField v-model="spSkill[4]" placeholder=""></TextField>
      </Section>
    </VStack>
    <!-- <button :disabled="fetching" @click="submit">追加</button> -->
  </Shell>
</template>
<script setup lang="ts">
// import { useMutation } from '@urql/vue'
// import { CreateIdolDocument } from '~~/generated/graphql'

// const { push } = useRouter()
const name = ref('')
const beat = ref('')
const aSkill = reactive(['', '', '', '', ''] as const)
const spSkill = reactive(['', '', '', '', ''] as const)
// const { executeMutation, fetching } = useMutation(CreateIdolDocument)
// const submit = async () => {
//   await executeMutation({ object: { name: name.value } })
//   name.value = ''
//   push('/idol')
// }
</script>
<style lang="scss" scoped>
@import '~/components/token.scss';

.note {
  font-size: 12px;
  color: $text3;
}
</style>
