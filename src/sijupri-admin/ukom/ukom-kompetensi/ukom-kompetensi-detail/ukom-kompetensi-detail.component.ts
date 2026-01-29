import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, take } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { KompetensiUkom } from '@/modules/ukom/models/kompetensi'
import { CommonModule, Location } from '@angular/common'
import { UkomKompetensiDetailPagableComponent } from '../ukom-kompetensi-detail-pagable/ukom-kompetensi-detail-pagable.component'
import { TabService } from '@/modules/base/services/tab.service'
import { UkomIndikatorKompetensiAddComponent } from '../ukom-indikator-kompetensi-add/ukom-indikator-kompetensi-add.component'

@Component({
    selector: 'app-ukom-kompetensi-detail',
    standalone: true,
    imports: [
        CommonModule,
        UkomKompetensiDetailPagableComponent,
        UkomIndikatorKompetensiAddComponent,
    ],
    templateUrl: './ukom-kompetensi-detail.component.html',
    styleUrl: './ukom-kompetensi-detail.component.scss',
})
export class UkomKompetensiDetailComponent {
    id: string | null = null
    tab$ = new BehaviorSubject<number>(0)

    kompetensi = new KompetensiUkom()
    isKompetensiLoading$ = new BehaviorSubject<boolean>(false)

    router = inject(Router)
    constructor(
        private activatedRoute: ActivatedRoute,
        private apiService: ApiService,
        private location: Location,
        private tabService: TabService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(take(1)).subscribe((params) => {
            this.id = params.get('id')
            this.getKompetensiDetail()
        })
        this.handleTabService()
    }

    getKompetensiDetail(): void {
        this.isKompetensiLoading$.next(true)
        this.apiService
            .getData(`/api/v1/kompetensi/${this.id}`)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    this.kompetensi = new KompetensiUkom(response)
                    this.isKompetensiLoading$.next(false)
                },
                error: (err) => {
                    console.error('Error fetching kompetensi:', err)
                    this.isKompetensiLoading$.next(false)
                },
            })
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Indikator Kompetensi',
                icon: 'mdi-list-box',
                isActive: true,
                onClick: () => this.handleTabChange(0),
            })
            .addTab({
                label: 'Tambah Indikator Kompetensi',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1),
            })
    }

    handleTabChange(tab?: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            // this.router.navigate(['/'])
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
    }
}
