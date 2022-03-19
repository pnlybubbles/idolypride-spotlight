export type FilterType = 'name' | 'type' | 'role'
export type Filter = {
  type: FilterType
  label: string
  value: string
}
