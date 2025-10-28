import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replaceUkomWord',
    standalone: true
})
export class ReplaceUkomWordPipe implements PipeTransform {

    transform(value: string): string {
        if (!value) return value;

        if (value === 'Perbaikan Dokumen UKom') {
            return 'Perbaikan Data Administrasi UKom';
        }

        return value;
    }
}
