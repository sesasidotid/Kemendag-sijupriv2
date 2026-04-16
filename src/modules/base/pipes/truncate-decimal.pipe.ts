import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'truncateDecimal',
    standalone: true,
})
export class TruncateDecimalPipe implements PipeTransform {
    // transform(value: unknown, ...args: unknown[]): unknown {
    //     return null
    // }

    transform(
        value: string | number | null | undefined,
        decimals: number = 2,
    ): string {
        if (value === null || value === undefined) {
            return '-'
        }

        const num = parseFloat(value.toString())

        if (isNaN(num)) {
            return '-'
        }

        const factor = Math.pow(10, decimals)

        const truncated = Math.trunc(num * factor) / factor

        return truncated.toFixed(decimals)
    }
}
