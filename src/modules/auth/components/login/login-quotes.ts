import { computed, signal } from '@angular/core'

// Kutipan yang bergantian di kartu kutipan halaman login.
// Sumber utama: API publik DummyJSON (±1.450 kutipan, CORS terbuka).
// Daftar lokal di bawah dipakai lebih dulu dan menjadi cadangan bila API gagal.
// Panggil stop() saat komponen dihancurkan.

export interface LoginQuote {
    text: string
    author: string
}

export const LOGIN_QUOTES: LoginQuote[] = [
    {
        text: 'Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani.',
        author: 'Ki Hajar Dewantara',
    },
    {
        text: 'Kurang cerdas dapat diperbaiki dengan belajar. Kurang cakap dapat dihilangkan dengan pengalaman. Namun tidak jujur sulit diperbaiki.',
        author: 'Mohammad Hatta',
    },
    {
        text: 'Setiap orang menjadi guru, setiap rumah menjadi sekolah.',
        author: 'Ki Hajar Dewantara',
    },
    {
        text: 'Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif.',
        author: 'Nilai Dasar ASN BerAKHLAK',
    },
    {
        text: 'Berakit-rakit ke hulu, berenang-renang ke tepian. Bersakit-sakit dahulu, bersenang-senang kemudian.',
        author: 'Peribahasa',
    },
    {
        text: 'Sedikit demi sedikit, lama-lama menjadi bukit.',
        author: 'Peribahasa',
    },
    {
        text: 'Di mana ada kemauan, di situ ada jalan.',
        author: 'Peribahasa',
    },
]

const API_URL = 'https://dummyjson.com/quotes'
const API_TOTAL = 1454 // jumlah kutipan di DummyJSON, untuk memilih halaman acak
const API_BATCH = 20
const API_TIMEOUT_MS = 5_000
const MAX_LENGTH = 160 // kutipan yang lebih panjang tidak muat rapi di kartu

// Lama satu kutipan tampil, dan lama efek memudar saat berganti (ms)
const SHOW_MS = 10_000
const FADE_MS = 400

// Sekitar separuh kutipan DummyJSON ditulis "Title Case" (Setiap Kata Kapital).
// Ubah menjadi huruf kalimat biasa agar enak dibaca.
function toSentenceCase(text: string): string {
    const words = text.match(/[A-Za-z']+/g) ?? []
    const isTitleCase = words.length > 3 && words.every((w) => /^[A-Z]/.test(w))
    if (!isTitleCase) return text
    return text
        .toLowerCase()
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, lead, ch) => lead + ch.toUpperCase())
        .replace(/\bi\b/g, 'I')
}

async function fetchQuotes(signal: AbortSignal): Promise<LoginQuote[]> {
    const skip = Math.floor(Math.random() * (API_TOTAL - API_BATCH))
    const res = await fetch(`${API_URL}?limit=${API_BATCH}&skip=${skip}`, { signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: { quotes?: { quote: string; author: string }[] } = await res.json()
    return (body.quotes ?? [])
        .filter((q) => q.quote && q.author && q.quote.length <= MAX_LENGTH)
        .map((q) => ({ text: toSentenceCase(q.quote.trim()), author: q.author.trim() }))
}

export function createQuoteRotator(fallback: LoginQuote[] = LOGIN_QUOTES) {
    const list = signal(fallback)
    // Mulai dari kutipan acak agar tidak selalu sama tiap membuka halaman
    const index = signal(Math.floor(Math.random() * fallback.length))
    const fading = signal(false)
    let swap: ReturnType<typeof setTimeout> | undefined
    // Daftar dari API menunggu di sini sampai pergantian berikutnya,
    // agar teks yang sedang tampil tidak berubah tiba-tiba tanpa efek memudar
    let pending: LoginQuote[] | null = null

    const timer = setInterval(() => {
        fading.set(true)
        swap = setTimeout(() => {
            if (pending) {
                list.set(pending)
                index.set(0)
                pending = null
            } else {
                index.update((i) => (i + 1) % list().length)
            }
            fading.set(false)
        }, FADE_MS)
    }, SHOW_MS)

    // Ambil kutipan dari API; bila gagal / terlalu lama, tetap pakai daftar lokal.
    const request = new AbortController()
    const timeout = setTimeout(() => request.abort(), API_TIMEOUT_MS)
    fetchQuotes(request.signal)
        .then((quotes) => {
            if (quotes.length >= 3) pending = quotes
        })
        .catch(() => {
            /* cadangan lokal tetap dipakai */
        })
        .finally(() => clearTimeout(timeout))

    return {
        list,
        index,
        fading,
        current: computed(() => list()[index()]),
        stop: () => {
            clearInterval(timer)
            clearTimeout(swap)
            clearTimeout(timeout)
            request.abort()
        },
    }
}
