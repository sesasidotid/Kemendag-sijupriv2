import { computed, signal } from '@angular/core'
import { Moon, Sun, Sunset } from 'lucide-angular'

// Jam, tanggal, dan sapaan untuk kartu tanggal di halaman login.
// Panggil stop() saat komponen dihancurkan.
export function createLoginClock() {
    const now = signal(new Date())
    const timer = setInterval(() => now.set(new Date()), 30_000)

    const today = computed(() => {
        const format = (options: Intl.DateTimeFormatOptions) =>
            new Intl.DateTimeFormat('id-ID', options).format(now())
        return {
            day: format({ weekday: 'long' }),
            dayNum: format({ day: 'numeric' }),
            month: format({ month: 'long' }),
            year: format({ year: 'numeric' }),
            date: format({ day: 'numeric', month: 'long', year: 'numeric' }),
            time: format({ hour: '2-digit', minute: '2-digit' }),
        }
    })

    const greeting = computed(() => {
        const hour = now().getHours()
        if (hour < 11) return { text: 'Selamat Pagi', icon: Sun }
        if (hour < 15) return { text: 'Selamat Siang', icon: Sun }
        if (hour < 18) return { text: 'Selamat Sore', icon: Sunset }
        return { text: 'Selamat Malam', icon: Moon }
    })

    // Posisi matahari/bulan di kartu tanggal mengikuti jam setempat.
    // Siang 05.00-18.00 untuk matahari, malam 18.00-05.00 untuk bulan.
    const sky = computed(() => {
        const hours = now().getHours() + now().getMinutes() / 60
        const isDay = hours >= 5 && hours < 18
        const progress = isDay ? (hours - 5) / 13 : ((hours - 18 + 24) % 24) / 11

        let phase: 'pagi' | 'siang' | 'sore' | 'malam' = 'malam'
        if (isDay) phase = hours < 11 ? 'pagi' : hours < 15 ? 'siang' : 'sore'

        return {
            phase,
            // lintasan busur di sisi kanan kartu (yang tidak tertutup lembar tanggal):
            // naik dari laut, memuncak, lalu turun kembali (dalam persen)
            x: 62 + progress * 18,
            y: 14 + Math.sin(progress * Math.PI) * 62,
        }
    })

    return { today, greeting, sky, stop: () => clearInterval(timer) }
}
