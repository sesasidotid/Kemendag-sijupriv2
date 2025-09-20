import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export interface JenisUkom {
    value: string
    label: string
}

@Injectable({
    providedIn: 'root',
})
export class JenisUkomService {
    jenisUkomList: JenisUkom[] = [
        { value: 'KENAIKAN_JENJANG', label: 'Kenaikan Jenjang' },
        { value: 'PERPINDAHAN_JABATAN', label: 'Perpindahan Jabatan' },
        { value: 'PROMOSI', label: 'Promosi' },
        { value: 'PROMOSI_JF', label: 'Promosi Jabatan Fungsional' },
    ]

    private jenisUkomListSubject = new BehaviorSubject<JenisUkom[]>(
        this.jenisUkomList,
    )
    jenisUkomList$ = this.jenisUkomListSubject.asObservable()

    constructor() {}

    fetchJenisUkom(): JenisUkom[] {
        return [...this.jenisUkomList]
    }
}
