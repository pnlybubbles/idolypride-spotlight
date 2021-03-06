import isNonNullable from 'is-non-nullable'
import { eraceArrayLiteralTypes, eraceObjectLiteralTypes, isUnique, mapObject, unreachable } from '~~/utils'
import { IdolName, IDOL_NAME, UNIT_TO_IDOL_NAME } from '~~/utils/common'
import { IdolData } from '~~/utils/types'

export type FilterType = 'name' | 'unit' | 'type' | 'role' | 'ability' | 'formation' | 'other'
export type Filter = {
  type: FilterType
  label: string
  value: string
}

const idolHasAllAbilities = (idol: IdolData, abilityType: string[]) => {
  const ownedAbilityType = idol.skills.flatMap((w) =>
    w.ability.map((x) => (x.div === 'buff' ? x.type : x.div === 'action-buff' ? x.type : null)).filter(isNonNullable)
  )
  return abilityType.every((v) => eraceArrayLiteralTypes(ownedAbilityType).includes(v))
}

const idolMatchFormation = (idol: IdolData, formation: string) => {
  const formationDescriptor = eraceObjectLiteralTypes(SKILL_FORMATION)[formation]
  if (formationDescriptor === undefined) {
    return false
  }
  return idol.skills.every((skill) => {
    const v = formationDescriptor[skill.index]
    const type = v === 'SP' ? 'sp' : v === 'A' ? 'a' : v === 'P' ? 'p' : v === 'A30' ? 'a' : unreachable(v)
    const ct = v === 'A30' ? 30 : null
    return skill.type === type && (skill.type !== 'a' || ct === null || skill.ct <= ct)
  })
}

const idolMatchOther = (idol: IdolData, other: string[]) => {
  return (other as OtherFilterId[]).some((v) => {
    if (v === 'owned') {
      return idol.owned !== null
    } else if (v === 'not-owned') {
      return idol.owned === null
    } else {
      return true
    }
  })
}

export const idolFilter = (idolList: IdolData[], filter: Filter[]) => {
  const nameList = filter.filter((v) => v.type === 'name').map((v) => v.value)
  const unitList = filter.filter((v) => v.type === 'unit').map((v) => v.value)
  const computedNameList = [
    ...nameList,
    ...unitList.flatMap((unit) => eraceObjectLiteralTypes(UNIT_TO_IDOL_NAME)[unit]),
  ]
    .filter(isNonNullable)
    .filter(isUnique)

  const typeList = filter.filter((v) => v.type === 'type').map((v) => v.value)
  const roleList = filter.filter((v) => v.type === 'role').map((v) => v.value)
  const abilityList = filter.filter((v) => v.type === 'ability').map((v) => v.value)
  const formationList = filter.filter((v) => v.type === 'formation').map((v) => v.value)
  const otherList = filter.filter((v) => v.type === 'other').map((v) => v.value)

  return idolList.filter(
    (idol) =>
      (computedNameList.length === 0 ? true : computedNameList.includes(idol.name)) &&
      (typeList.length === 0 ? true : typeList.includes(idol.type)) &&
      (roleList.length === 0 ? true : roleList.includes(idol.role)) &&
      (abilityList.length === 0 ? true : idolHasAllAbilities(idol, abilityList)) &&
      (formationList.length === 0 ? true : formationList.some((v) => idolMatchFormation(idol, v))) &&
      (otherList.length === 0 ? true : idolMatchOther(idol, otherList))
  )
}

export const idolSort = (idolList: IdolData[]) => {
  return [...idolList].sort((a, b) => {
    const nameOrdering = IDOL_NAME.indexOf(a.name as IdolName) - IDOL_NAME.indexOf(b.name as IdolName)
    if (nameOrdering !== 0) {
      return nameOrdering
    }
    const titleOrdering = a.title.localeCompare(b.title, 'ja')
    return titleOrdering
  })
}

const SKILL_FORMATION = {
  spaa: ['SP', 'A', 'A'],
  aap: ['A', 'A', 'P'],
  app: ['A', 'P', 'P'],
  a30pp: ['A30', 'P', 'P'],
  spap: ['SP', 'A', 'P'],
  spa30p: ['SP', 'A30', 'P'],
} as const
export const FILTERABLE_SKILL_FORMATION = mapObject(SKILL_FORMATION, (v) => v.join('-'))

export type OtherFilterId = 'owned' | 'not-owned'
