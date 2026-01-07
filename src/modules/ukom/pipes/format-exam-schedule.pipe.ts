// import { Pipe, PipeTransform } from '@angular/core'
// import { DatePipe } from '@angular/common'
//
// @Pipe({
//     name: 'formatExamSchedule',
//     standalone: true,
//     pure: true, // safe & fast
// })
// export class FormatExamSchedulePipe implements PipeTransform {
//     private datePipe = new DatePipe('id-ID')
//
//     transform(start: string | Date, end: string | Date): string {
//         if (!start || !end) return ''
//
//         const startDate = new Date(start)
//         const endDate = new Date(end)
//
//         const dateString = this.datePipe.transform(startDate, 'dd MMMM yyyy')
//         const startTime = this.datePipe.transform(startDate, 'HH.mm')
//         const endTime = this.datePipe.transform(endDate, 'HH.mm')
//
//         return `${dateString}, pukul : ${startTime} - ${endTime}`
//     }
// }
import { Pipe, PipeTransform } from '@angular/core'
import { DatePipe } from '@angular/common'

@Pipe({
    name: 'formatExamSchedule',
    standalone: true,
    pure: true,
})
export class FormatExamSchedulePipe implements PipeTransform {
    private datePipe = new DatePipe('id-ID')

    transform(
        start: string | Date,
        end?: string | Date,
        duration?: number,
    ): string {
        if (!start) return ''

        const startDate = new Date(start)
        let endDate: Date | undefined

        if (duration !== undefined && duration > 0) {
            // duration provided → calculate end time
            endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000)
        } else if (end) {
            endDate = new Date(end)
        }

        const startDay = this.datePipe.transform(startDate, 'dd MMMM yyyy')
        const startTime = this.datePipe.transform(startDate, 'HH.mm')
        const endTime = endDate
            ? this.datePipe.transform(endDate, 'HH.mm')
            : null
        const endDay = endDate
            ? this.datePipe.transform(endDate, 'dd MMMM yyyy')
            : null

        if (!endDate) {
            // only start date/time
            return `${startDay}, pukul : ${startTime}`
        }

        if (startDay === endDay) {
            // same day → show single date, start-end time
            return `${startDay}, pukul : ${startTime} - ${endTime}`
        } else {
            // multi-day → show both dates
            return `${startDay} ${startTime} - ${endDay} ${endTime}`
        }
    }
}
