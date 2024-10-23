export class PageFilter {
    label: string;
    key: string;
    fieldType: string;
    value: string | number | boolean;
    optionList: { label: string, value: string | number | boolean }[];

    constructor(object: { label?: string, key?: string, fieldType?: string, value?: string | number | boolean, optionList?: { label: string, value: string | number | boolean }[] }) {
        this.label = object.label;
        this.key = object.key;
        this.fieldType = object.fieldType;
        this.value = object.value;
        this.optionList = object.optionList;
    }
}