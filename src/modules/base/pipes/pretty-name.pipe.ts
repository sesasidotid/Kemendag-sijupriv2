import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'prettyName',
    standalone: true,
})
export class PrettyNamePipe implements PipeTransform {
    transform(value: string | null | undefined): string | null {
        if (!value) return '-'

        return value
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
    }
}
