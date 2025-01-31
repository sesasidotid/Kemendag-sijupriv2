export class PageColumn {
  columnType: 'primary' | 'action'

  label: string
  property: string
  defaultValue: string | number | boolean
  dynamic: Function

  process: Function
  inactive: Function
  icon: string
  color: string

  constructor (object: {
    columnType?: 'primary' | 'action'
    label?: string
    property?: string
    dynamic?: Function
    defaultValue?: string | number | boolean
    process?: Function
    icon?: string
    color?: string
    inactive?: Function
  }) {
    this.columnType = object.columnType
    this.label = object.label
    this.property = object.property
    this.dynamic = object.dynamic
    this.defaultValue = object.defaultValue
    this.process = object.process
    this.icon = object.icon
    this.color = object.color
    this.inactive = object.inactive
  }
}
