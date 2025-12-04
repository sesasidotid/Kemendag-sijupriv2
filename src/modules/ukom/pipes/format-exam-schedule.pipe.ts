import { Pipe, PipeTransform } from '@angular/core'
import { DatePipe } from '@angular/common'

@Pipe({
    name: 'formatExamSchedule',
    standalone: true,
    pure: true, // safe & fast
})
export class FormatExamSchedulePipe implements PipeTransform {
    private datePipe = new DatePipe('id-ID')

    transform(start: string | Date, end: string | Date): string {
        if (!start || !end) return ''

        const startDate = new Date(start)
        const endDate = new Date(end)

        const dateString = this.datePipe.transform(startDate, 'dd MMMM yyyy')
        const startTime = this.datePipe.transform(startDate, 'HH.mm')
        const endTime = this.datePipe.transform(endDate, 'HH.mm')

        const durationMs = endDate.getTime() - startDate.getTime()
        const durationMinutes = Math.floor(durationMs / 60000)

        return `${dateString}, pukul : ${startTime} - ${endTime} ( Durasi : ${durationMinutes} menit )`
    }
}
