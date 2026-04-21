import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'gender',
    standalone: true,
})
export class GenderPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (!value) return '-'

        switch (value.toLowerCase()) {
            case 'm':
                return 'Pria'
            case 'f':
                return 'Wanita'
            default:
                return value
        }
    }
}
