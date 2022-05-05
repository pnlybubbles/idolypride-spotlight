import isNonNullable from 'is-non-nullable'
import { eraceArrayLiteralTypes, eraceObjectLiteralTypes, isUnique } from '~~/utils'
import { UNIT_TO_IDOL_NAME } from '~~/utils/common'
import { IdolData } from '~~/utils/types'

export type FilterType = 'name' | 'unit' | 'type' | 'role' | 'ability'
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

  return idolList.filter(
    (v) =>
      (computedNameList.length === 0 ? true : computedNameList.includes(v.name)) &&
      (typeList.length === 0 ? true : typeList.includes(v.type)) &&
      (roleList.length === 0 ? true : roleList.includes(v.role)) &&
      (abilityList.length === 0 ? true : idolHasAllAbilities(v, abilityList))
  )
}

export const idolSort = (idolList: IdolData[]) => {
  return [...idolList].sort((a, b) => {
    const nameOrdering = a.name.localeCompare(b.name, 'ja')
    if (nameOrdering !== 0) {
      return nameOrdering
    }
    const titleOrdering = a.title.localeCompare(b.title, 'ja')
    return titleOrdering
  })
}
