<template>
  <div class="buff" :class="{ affected, highlighted }"></div>
</template>
<script setup lang="ts">
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'
import { px } from '~~/utils/common'
import { AbilityType } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  /**
   * 開始ビート
   */
  beat: number
  /**
   * バフの種類
   */
  buff: AbilityType
  /**
   * バフの持続ビート数
   */
  span: number
  /**
   * バフ表示が重ならないようにするための右ずらし
   */
  shift: number
  /**
   * バフがなんらかのスキルに影響があったか
   */
  affected: boolean
  /**
   * ハイライト表示
   */
  highlighted: boolean
}

const props = defineProps<Props>()
const { beat, buff, affected, shift, span, highlighted } = toRefs(props)

const [scaleFactor] = useFumenScaleFactor()
const top = computed(() => cssBeat(beat.value, scaleFactor.value))
const color = computed(() => cssBuff(buff.value))
const height = computed(() => px((span.value - 1) * scaleFactor.value))
</script>
<style lang="scss" scoped>
$size: 1.5px;
$shift-scale: 7px;

.buff {
  position: absolute;
  top: v-bind(top);
  left: calc(50% + v-bind(shift) * $shift-scale);
  height: calc(v-bind(height) + $size * 2);
  width: calc($size * 2);
  transform: translate(-50%, calc($size * -1));
  border-radius: 999999999px;
  background: repeating-linear-gradient(45deg, v-bind(color), v-bind(color) 2px, transparent 2px, transparent 4px);
  opacity: 0.4;

  &.affected {
    background: none;
    background-color: v-bind(color);
  }

  &.highlighted {
    opacity: 1;
  }
}
</style>
