import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'tanggalIndo',
    standalone: true
})
export class TanggalIndoPipe implements PipeTransform {
    transform (start?: string | Date, end?: string | Date): string {
        const bulanIndo = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember'
        ]

        const parse = (tanggal: string | Date): string => {
            const date =
                typeof tanggal === 'string' ? new Date(tanggal) : tanggal
            if (isNaN(date.getTime())) return '-' // invalid date
            return `${date.getDate()} ${
                bulanIndo[date.getMonth()]
            } ${date.getFullYear()}`
        }

        // Handle missing start
        if (!start) return '-'

        // Handle only one valid date
        if (!end || start === end) return parse(start)

        return `${parse(start)} s.d. ${parse(end)}`
    }
}
