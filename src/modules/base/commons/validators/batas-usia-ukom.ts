/**
 * Validasi batas usia pendaftaran UKom.
 *
 * 1. KENAIKAN_JENJANG (promosi vertikal) — dinamis, mengikuti BUP jenjang SAAT INI:
 *    - Keterampilan / Ahli Pertama / Ahli Muda : 58 th
 *    - Ahli Madya                               : 60 th
 *    - Ahli Utama                               : tidak ada jenjang berikutnya
 *
 * 2. PERPINDAHAN_JABATAN / PROMOSI / PROMOSI_JF — statis, mengikuti jenjang YANG DITUJU:
 *    - Keterampilan / Ahli Pertama / Ahli Muda : 53 th
 *    - Ahli Madya                               : 55 th
 *    - Ahli Utama                               : 60 th
 *
 * Pendaftaran diblokir 6 bulan sebelum batas tersebut (buffer sistem).
 * Tanggal lahir diambil dari 8 digit pertama NIP (YYYYMMDD).
 *
 * Jenjang dicocokkan lewat nama (mengandung "madya" / "utama"),
 * sehingga tidak bergantung pada kode jenjang.
 */

export const UKOM_BUFFER_BULAN = 6

const BUP_KENAIKAN_JENJANG = { DEFAULT: 58, AHLI_MADYA: 60 }
const BATAS_USIA_PENGANGKATAN = { DEFAULT: 53, AHLI_MADYA: 55, AHLI_UTAMA: 60 }

export interface BatasUsiaUkomError {
    jenisUkom: string
    jenjangName: string
    batasUsia: number
    batasDaftar: number
}

export function getTanggalLahirFromNip(nip: string): Date | null {
    if (!nip || !/^\d{18}$/.test(nip)) return null

    const year = Number(nip.substring(0, 4))
    const month = Number(nip.substring(4, 6))
    const day = Number(nip.substring(6, 8))
    const date = new Date(year, month - 1, day)

    const isValid =
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    return isValid ? date : null
}

function jenjangLevel(name: string): 'UTAMA' | 'MADYA' | 'LAINNYA' {
    const n = (name || '').toLowerCase()
    if (n.includes('utama')) return 'UTAMA'
    if (n.includes('madya')) return 'MADYA'
    return 'LAINNYA'
}

/** Batas usia (tahun) sesuai jenis UKom, atau null jika tidak berlaku. */
export function getBatasUsiaUkom(
    jenisUkom: string,
    currentJenjangName: string | null | undefined,
    targetJenjangName: string | null | undefined,
): number | null {
    if (jenisUkom === 'KENAIKAN_JENJANG') {
        if (!currentJenjangName) return null
        const level = jenjangLevel(currentJenjangName)
        if (level === 'UTAMA') return null
        return level === 'MADYA'
            ? BUP_KENAIKAN_JENJANG.AHLI_MADYA
            : BUP_KENAIKAN_JENJANG.DEFAULT
    }

    if (!targetJenjangName) return null
    const level = jenjangLevel(targetJenjangName)
    if (level === 'UTAMA') return BATAS_USIA_PENGANGKATAN.AHLI_UTAMA
    if (level === 'MADYA') return BATAS_USIA_PENGANGKATAN.AHLI_MADYA
    return BATAS_USIA_PENGANGKATAN.DEFAULT
}

/** Mengembalikan error jika usia (dari NIP) sudah melewati batas pendaftaran. */
export function cekBatasUsiaUkom(params: {
    nip: string
    jenisUkom: string
    currentJenjangName?: string | null
    targetJenjangName?: string | null
    today?: Date
}): BatasUsiaUkomError | null {
    const { nip, jenisUkom, currentJenjangName, targetJenjangName } = params
    if (!jenisUkom) return null

    const birthDate = getTanggalLahirFromNip(nip)
    if (!birthDate) return null

    const batasUsia = getBatasUsiaUkom(
        jenisUkom,
        currentJenjangName,
        targetJenjangName,
    )
    if (batasUsia === null) return null

    // Tanggal ditutupnya pendaftaran = tgl lahir + (batas usia - buffer)
    const batasDaftarDate = new Date(birthDate)
    batasDaftarDate.setMonth(
        batasDaftarDate.getMonth() + batasUsia * 12 - UKOM_BUFFER_BULAN,
    )

    const today = params.today ? new Date(params.today) : new Date()
    today.setHours(0, 0, 0, 0)

    if (today < batasDaftarDate) return null

    return {
        jenisUkom,
        jenjangName:
            (jenisUkom === 'KENAIKAN_JENJANG'
                ? currentJenjangName
                : targetJenjangName) || '-',
        batasUsia,
        batasDaftar: batasUsia - UKOM_BUFFER_BULAN / 12,
    }
}

export function getBatasUsiaUkomMessage(error: BatasUsiaUkomError): string {
    const { jenisUkom, jenjangName, batasUsia, batasDaftar } = error
    if (jenisUkom === 'KENAIKAN_JENJANG') {
        return `Usia Anda (berdasarkan NIP) telah melewati batas pendaftaran Kenaikan Jenjang. Batas Usia Pensiun jenjang saat ini (${jenjangName}) adalah ${batasUsia} tahun, pendaftaran ditutup pada usia ${batasDaftar} tahun.`
    }
    return `Usia Anda (berdasarkan NIP) telah melewati batas pendaftaran untuk jenjang ${jenjangName}. Batas usia pengangkatan ${batasUsia} tahun, pendaftaran ditutup pada usia ${batasDaftar} tahun.`
}
