import { IdolData } from '~~/utils/types'

export type FilterType = 'name' | 'type' | 'role'
export type Filter = {
  type: FilterType
  label: string
  value: string
}

export const idolFilter = (idolList: IdolData[], filter: Filter[]) => {
  const nameList = filter.filter((v) => v.type === 'name').map((v) => v.value)
  const typeList = filter.filter((v) => v.type === 'type').map((v) => v.value)
  const roleList = filter.filter((v) => v.type === 'role').map((v) => v.value)

  return idolList
    .filter((v) => (nameList.length === 0 ? true : nameList.includes(v.name)))
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
