import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export interface Specification {
    value: string
    label: string
}

@Injectable({
    providedIn: 'root',
})
export class SpecificationService {
    specificationList: Specification[] = [
        { value: null, label: 'Untuk Semua' },
        { value: 'jf', label: 'Jabatan Fungsional' },
        { value: 'non_jf', label: 'Non Jabatan Fungsional' },
    ]

    private specificationListSubject = new BehaviorSubject<Specification[]>(
        this.specificationList,
    )
    specificationList$ = this.specificationListSubject.asObservable()

    constructor() {}

    fetchSpecification(): Specification[] {
        return [...this.specificationList]
    }
}
