export class PageColumn {
    columnType: 'primary' | 'action'

    label: string
    property: string
    defaultValue: string | number | boolean
    dynamic: Function

    process: Function
    checked: Function
    inactive: Function
    inputType: string
    icon: string
    color: string
    sortable: boolean

    cellClass: (row: any) => string
    cellStyle: (row: any) => Record<string, string>

    constructor(object: {
        columnType?: 'primary' | 'action'
        label?: string
        property?: string
        dynamic?: Function
        defaultValue?: string | number | boolean
        process?: Function
        checked?: Function
        inputType?: string
        icon?: string
        color?: string
        inactive?: Function
        sortable?: boolean
        cellClass?: (row: any) => string
        cellStyle?: (row: any) => Record<string, string>
    }) {
        this.columnType = object.columnType
        this.label = object.label
        this.property = object.property
        this.dynamic = object.dynamic
        this.defaultValue = object.defaultValue
        this.process = object.process
        this.checked = object.checked
        this.inputType = object.inputType
        this.icon = object.icon
        this.color = object.color
        this.inactive = object.inactive
        this.sortable = object.sortable !== undefined ? object.sortable : true
        this.cellClass = object.cellClass
        this.cellStyle = object.cellStyle
    }
}
