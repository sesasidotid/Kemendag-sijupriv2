import { IndikatorKompetensiUkom } from './../../../../modules/ukom/models/indikator-kompetensi'
import { KompetensiUkom } from './../../../../modules/ukom/models/kompetensi' // Assuming you have a KompetensiUkom model
import { Component, OnInit } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { BehaviorSubject, take, combineLatest, map, Observable } from 'rxjs'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ActivatedRoute } from '@angular/router'
import { HandlerService } from '../../../../modules/base/services/handler.service'

@Component({
    selector: 'app-ukom-indikator-kompetensi-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ukom-indikator-kompetensi-detail.component.html',
    styleUrl: './ukom-indikator-kompetensi-detail.component.scss'
})
export class UkomIndikatorKompetensiDetailComponent implements OnInit {
    private isIndikatorKompetensiLoading$ = new BehaviorSubject<boolean>(false)
    private isKompetensiLoading$ = new BehaviorSubject<boolean>(false)

    isLoading$: Observable<boolean>

    detailIndikatorKompetensi: IndikatorKompetensiUkom =
        new IndikatorKompetensiUkom()
    detailKompetensi: KompetensiUkom = new KompetensiUkom()

    constructor (
        private location: Location,
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private handlerService: HandlerService
    ) {
        this.isLoading$ = combineLatest([
            this.isIndikatorKompetensiLoading$,
            this.isKompetensiLoading$
        ]).pipe(
            map(
                ([isIndikatorLoading, isKompetensiLoading]) =>
                    isIndikatorLoading || isKompetensiLoading
            )
        )
    }

    ngOnInit (): void {
        this.activatedRoute.paramMap.pipe(take(1)).subscribe(params => {
            const indikatorId = params.get('id')
            const kompetensiId = params.get('kompetensi_id')

            if (indikatorId) {
                this.getIndikatorKompetensiDetail(indikatorId)
            } else {
                this.handlerService.handleAlert(
                    'Error',
                    'ID Indikator tidak ditemukan.'
                )
                this.onBack()
            }

            if (kompetensiId) {
                this.getKompetensiDetail(kompetensiId)
            } else {
                this.handlerService.handleAlert(
                    'Error',
                    'ID Kompetensi tidak ditemukan.'
                )
            }
        })
    }

    onBack (): void {
        this.location.back()
    }

    getIndikatorKompetensiDetail (id: string): void {
        this.isIndikatorKompetensiLoading$.next(true)
        this.apiService
            .getData(`/api/v1/kompetensi_indikator/${id}`)
            .subscribe({
                next: (res: any) => {
                    this.detailIndikatorKompetensi =
                        new IndikatorKompetensiUkom(res)
                },
                error: err => {
                    console.error('Error fetching Indikator Kompetensi:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data indikator kompetensi'
                    )
                },
                complete: () => {
                    this.isIndikatorKompetensiLoading$.next(false)
                }
            })
    }

    getKompetensiDetail (id: string): void {
        this.isKompetensiLoading$.next(true)
        this.apiService.getData(`/api/v1/kompetensi/${id}`).subscribe({
            next: (res: any) => {
                this.detailKompetensi = new KompetensiUkom(res)
            },
            error: err => {
                console.error('Error fetching Kompetensi:', err)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data kompetensi'
                )
            },
            complete: () => {
                this.isKompetensiLoading$.next(false)
                console.log(this.detailKompetensi)
            }
        })
    }
}
