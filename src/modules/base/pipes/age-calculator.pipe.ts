import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    standalone: true,
    name: 'ageCalculator',
})
export class AgeCalculatorPipe implements PipeTransform {
    transform(startDate: string | Date, endDate: string | Date): string {
        if (!startDate || !endDate) {
            return '-'
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return '-'
        }

        let years = end.getFullYear() - start.getFullYear()
        let months = end.getMonth() - start.getMonth()
        let days = end.getDate() - start.getDate()

        if (months < 0 || (months === 0 && days < 0)) {
            years--
            months += 12
        }

        if (days < 0) {
            const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0)
            days += lastMonth.getDate()
            months--
        }

        return `${years} Tahun ${months} Bulan ${days} Hari`
    }
}
