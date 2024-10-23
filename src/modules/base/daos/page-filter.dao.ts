type inputType = 'text' | 'select' | 'date' | 'datetime';

export class PageFilterDao {
    key: any = '';
    value?: any = '';
    lable?: string;
    type?: inputType = 'text';
    data?: {
        propertyKey: string;
        propertyValue: string;
        list: any[]
    };
}