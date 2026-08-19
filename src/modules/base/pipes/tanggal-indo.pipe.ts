import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tanggalIndo',
    standalone: true,
})
export class TanggalIndoPipe implements PipeTransform {
    transform(
        start?: string | Date,
        end?: string | Date,
        withTime = false,
    ): string {
        const bulanIndo = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];

        const parse = (tanggal: string | Date): string => {
            const date = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
            if (isNaN(date.getTime())) return '-';

            const tanggalStr = `${date.getDate()} ${bulanIndo[date.getMonth()]} ${date.getFullYear()}`;

            if (!withTime) return tanggalStr;

            const jam = date.getHours().toString().padStart(2, '0');
            const menit = date.getMinutes().toString().padStart(2, '0');
            return `${tanggalStr}, ${jam}:${menit}`;
        };

        if (!start) return '-';
        if (!end || start === end) return parse(start);

        return `${parse(start)} s.d. ${parse(end)}`;
    }
}