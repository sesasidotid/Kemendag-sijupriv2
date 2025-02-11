import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ConverterService {
  dateToHumanReadable (dateTimeString: string): string {
    const days = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu'
    ]
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des'
    ]

    // Konversi string ke objek Date
    const date = new Date(dateTimeString.replace(' ', 'T')) // Ubah spasi menjadi 'T' untuk format ISO

    // Ambil komponen tanggal dan waktu
    const day = days[date.getDay()]
    const month = months[date.getMonth()]
    const dayOfMonth = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'

    // Konversi format 24 jam ke 12 jam
    hours = hours % 12
    hours = hours ? hours : 12 // Jam 0 menjadi 12

    // Format tanggal sesuai format yang diminta
    return `${day}, ${dayOfMonth} ${month} ${year}, ${hours}:${minutes} ${ampm}`
  }
}
