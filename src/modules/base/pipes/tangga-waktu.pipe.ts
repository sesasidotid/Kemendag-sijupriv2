import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'tanggalWaktuIndo',
    standalone: true
})
export class TanggalWaktuIndoPipe implements PipeTransform {
    transform (value?: string | Date): string {
        if (!value) return '-'

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

        const toValidDate = (tanggal: string | Date): Date => {
            if (typeof tanggal === 'string') {
                // fix format like '2025-07-08 14:24:00' -> '2025-07-08T14:24:00'
                const safeString = tanggal.includes('T')
                    ? tanggal
                    : tanggal.replace(' ', 'T')
                return new Date(safeString)
            }
            return tanggal
        }

        const date = toValidDate(value)
        if (isNaN(date.getTime())) return '-'

        const pad = (n: number) => n.toString().padStart(2, '0')

        return `${pad(date.getDate())} ${
            bulanIndo[date.getMonth()]
        } ${date.getFullYear()} ${pad(date.getHours())}:${pad(
            date.getMinutes()
        )}`
    }
}
