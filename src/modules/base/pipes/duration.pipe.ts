import { Injectable, Pipe, PipeTransform } from '@angular/core'
@Injectable({
    providedIn: 'root',
})
@Pipe({
    name: 'duration',
    standalone: true,
})
export class DurationPipe implements PipeTransform {
    transform(durationInHours: number | null | undefined): string {
        if (!durationInHours) return '-'

        const totalMinutes = Math.round(durationInHours * 60)

        const days = Math.floor(totalMinutes / (24 * 60))
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
        const minutes = totalMinutes % 60

        const parts: string[] = []

        if (days) parts.push(`${days} hari`)
        if (hours) parts.push(`${hours} jam`)
        if (minutes) parts.push(`${minutes} menit`)

        return parts.length ? parts.join(' ') : '-'
    }
}
