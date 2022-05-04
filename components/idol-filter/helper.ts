import isNonNullable from 'is-non-nullable'
import { eraceObjectLiteralTypes, isUnique } from '~~/utils'
import { UNIT_TO_IDOL_NAME } from '~~/utils/common'
import { IdolData } from '~~/utils/types'

export type FilterType = 'name' | 'unit' | 'type' | 'role'
export type Filter = {
  type: FilterType
  label: string
  value: string
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

  return idolList
    .filter((v) => (computedNameList.length === 0 ? true : computedNameList.includes(v.name)))
    .filter((v) => (typeList.length === 0 ? true : typeList.includes(v.type)))
    .filter((v) => (roleList.length === 0 ? true : roleList.includes(v.role)))
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
