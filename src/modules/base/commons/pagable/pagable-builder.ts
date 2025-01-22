import { Pagable } from './pagable'
import { PageColumn } from './page-column'
import { PageFilter } from './page-filter'

export class PagableBuilder {
  private endpoint: string
  private primaryColumnList: PageColumn[] = []
  private actionColumnList: PageColumn[] = []
  private filterList: PageFilter[] = []
  private limit: number = 10

  constructor (endpoint: string) {
    this.endpoint = endpoint
  }

  addPrimaryColumn (pageColumn: PageColumn): PagableBuilder {
    this.primaryColumnList.push(pageColumn)
    return this
  }

  addActionColumn (pageColumn: PageColumn): PagableBuilder {
    this.actionColumnList.push(pageColumn)
    return this
  }

  addFilter (pageFilter: PageFilter): PagableBuilder {
    this.filterList.push(pageFilter)
    return this
  }

  setLimit (limit: number) {
    this.limit = limit
    return this
  }

  build (): Pagable {
    return new Pagable(
      this.endpoint,
      this.primaryColumnList,
      this.actionColumnList,
      this.filterList,
      this.limit
    )
  }
}

export class PageFilterBuilder {
  private lable: string
  private fieldType: string
  private value: string | number | boolean
  private optionList: { label: string; value: string | number | boolean }[]
  private property: string = ''
  private clause: string
  private clauses: any = {
    equal: 'eq_',
    like: 'like_'
  }

  constructor (clause: 'equal' | 'like') {
    this.clause = clause
  }

  withField (
    lable: string,
    fieldType: 'text' | 'date' | 'select'
  ): PageFilterBuilder {
    this.lable = lable
    this.fieldType = fieldType
    return this
  }

  withDefaultValue (value: string | number | boolean): PageFilterBuilder {
    this.value = value
    return this
  }

  setOptionList (
    optionList: { label: string; value: string | number | boolean }[]
  ): PageFilterBuilder {
    this.optionList = optionList
    return this
  }

  setOptionListFromObjectList (
    objectList: any[],
    labelProperty: string,
    valueProperty: string
  ): PageFilterBuilder {
    this.optionList = []
    objectList.forEach(object => {
      this.optionList.push({
        label: object[labelProperty],
        value: object[valueProperty]
      })
    })
    return this
  }

  setProperty (
    property: string,
    parentsProperty: string[] = []
  ): PageFilterBuilder {
    parentsProperty.forEach(pProp => {
      this.property = `${pProp}|` + this.property
    })
    this.property = this.property + property

    return this
  }

  build (): PageFilter {
    return new PageFilter({
      label: this.lable,
      fieldType: this.fieldType,
      value: this.value,
      key: `${this.clauses[this.clause]}${this.property}`,
      optionList: this.optionList
    })
  }
}

export class PrimaryColumnBuilder {
  private label: string
  private property: string
  private dynamic: Function
  private defaultValue: string | number | boolean | null

  constructor (label?: string, property?: string, parentsProperty?: string[]) {
    if (label) {
      this.label = label
      if (parentsProperty)
        parentsProperty.forEach(pProp => {
          this.property = `${pProp}|` + property
        })
      if (property && parentsProperty === undefined) {
        this.property = this.property + property
        this.property = property
      }
    }
  }

  withDynamicValue (label: string, dynamic: Function): PrimaryColumnBuilder {
    this.label = label
    this.dynamic = dynamic
    return this
  }

  withPropertyValue (
    label: string,
    property: string,
    parentsProperty?: string[]
  ): PrimaryColumnBuilder {
    this.label = label
    if (parentsProperty)
      parentsProperty.forEach(pProp => {
        this.property = `${pProp}|` + this.property
      })
    this.property = this.property + property
    this.property = property
    return this
  }

  withDefaultValue (
    defaultValue: string | number | boolean | null = null
  ): PrimaryColumnBuilder {
    this.defaultValue = defaultValue
    return this
  }

  build (): PageColumn {
    return new PageColumn({
      columnType: 'primary',
      label: this.label,
      property: this.property,
      dynamic: this.dynamic,
      defaultValue: this.defaultValue
    })
  }
}

export class ActionColumnBuilder {
  private process: Function
  private color: string
  private icon: string | null
  private inactive: Function
  private icons = {
    create: 'ri-add-box-line',
    update: 'ri-pencil-line',
    detail: 'ri-eye-line',
    danger: 'ri-delete-bin-line',
    download: 'ri-download-line'
  }

  setAction (
    process: Function,
    color: 'primary' | 'success' | 'info' | 'danger'
  ): ActionColumnBuilder {
    this.process = process
    this.color = color
    return this
  }

  withIcon (
    icon: 'create' | 'detail' | 'danger' | 'update' | 'download'
  ): ActionColumnBuilder {
    this.icon = this.icons[icon]
    return this
  }

  addInactiveCondition (inactive: Function): ActionColumnBuilder {
    this.inactive = inactive
    return this
  }

  build (): PageColumn {
    return new PageColumn({
      columnType: 'action',
      process: this.process,
      icon: this.icon,
      color: this.color,
      inactive: this.inactive
    })
  }
}
