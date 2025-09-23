import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export interface JenisInstansi {
    value: string
    label: string
}

@Injectable({
    providedIn: 'root',
})
export class JenisInstansiService {
    jenisInstansiList: JenisInstansi[] = [
        { value: 'KEMENTERIAN_PERDAGANGAN', label: 'Kementerian Perdagangan' },
        {
            value: 'KEMENTERIAN_PERINDUSTRIAN',
            label: 'Kementerian Perindustrian',
        },
        { value: 'KEMENTERIAN_ESDM', label: 'Kementerian ESDM' },
        {
            value: 'KEMENTERIAN_KOORDINATOR_BIDANG_PANGAN',
            label: 'Kementerian Koordinator Bidang Pangan',
        },
        { value: 'KEMENTERIAN_PERHUBUNGAN', label: 'Kementerian Perhubungan' },
        { value: 'KEMENTERIAN_PERTANIAN', label: 'Kementerian Pertanian' },
        {
            value: 'BADAN_STANDARISASI_NASIONAL',
            label: 'Badan Standarisasi Nasional',
        },
        {
            value: 'PEMERINTAH_PROVINSI',
            label: 'Pemerintah Provinsi',
        },
        {
            value: 'PEMERINTAH_KABUPATEN_KOTA',
            label: 'Pemerintah Kabupaten/Kota',
        },
    ]

    private jenisInstansiListSubject = new BehaviorSubject<JenisInstansi[]>(
        this.jenisInstansiList,
    )
    jenisInstansiList$ = this.jenisInstansiListSubject.asObservable()

    constructor() {}

    getLabelByValue(value: string): string | undefined {
        return this.jenisInstansiList.find((item) => item.value === value)
            ?.label
    }
}
