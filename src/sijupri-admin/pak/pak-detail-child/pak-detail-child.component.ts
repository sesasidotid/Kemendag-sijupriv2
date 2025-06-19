import { Component } from '@angular/core'

import { CommonModule, Location } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { BehaviorSubject, take, finalize } from 'rxjs'

@Component({
    selector: 'app-pak-detail-child',
    standalone: true,
    imports: [CommonModule, FileHandlerComponent],
    templateUrl: './pak-detail-child.component.html',
    styleUrl: './pak-detail-child.component.scss'
})
export class PakDetailChildComponent {
    rwKinerja: RWKinerja = new RWKinerja()

    isLoadingRWKinerja$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)

    constructor (
        private apiService: ApiService,
        private alertService: AlertService,
        private activatedRoute: ActivatedRoute,
        private location: Location
    ) {}

    ngOnInit () {
        this.activatedRoute.paramMap.pipe(take(1)).subscribe(params => {
            const id = params.get('rwKinerjaId')
            if (id) {
                this.getRWKinerja(id)
            } else {
                this.alertService.showToast('Error', 'Id tidak ditemukan')
                this.onBack()
            }
        })
    }

    onBack (): void {
        this.location.back()
    }

    getRWKinerja (id: string) {
        this.isLoadingRWKinerja$.next(true)
        this.apiService
            .getData(`/api/v1/rw_kinerja/${id}`)
            .pipe(finalize(() => this.isLoadingRWKinerja$.next(false)))
            .subscribe({
                next: response => {
                    this.rwKinerja = new RWKinerja(response)
                },
                error: error => {
                    this.alertService.showToast(
                        'Error',
                        'Gagal mendapatkan data riwayat'
                    )
                }
            })
    }
}
