import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'examDuration',
    standalone: true,
})
export class ExamDurationPipe implements PipeTransform {
    transform(hours: number): string {
        if (hours == null || isNaN(hours) || hours < 0) return ''

        const HOURS_IN_DAY = 24
        const MINUTES_IN_HOUR = 60

        const days = Math.floor(hours / HOURS_IN_DAY)
        const remainingHours = Math.floor(hours % HOURS_IN_DAY)
        const remainingMinutes = Math.round((hours % 1) * MINUTES_IN_HOUR)

        const parts: string[] = []
        if (days > 0) parts.push(`${days} hari`)
        if (remainingHours > 0) parts.push(`${remainingHours} jam`)
        if (remainingMinutes > 0) parts.push(`${remainingMinutes} menit`)

        return parts.join(' ') || '0 menit'
    }
}
