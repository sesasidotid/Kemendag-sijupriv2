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

    return { today, greeting, stop: () => clearInterval(timer) }
}
