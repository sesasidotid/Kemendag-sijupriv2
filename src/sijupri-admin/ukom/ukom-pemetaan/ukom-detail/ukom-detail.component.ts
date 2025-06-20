import { ConfirmationService } from './../../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { ActivatedRoute, Router } from '@angular/router'
import { JF } from '../../../../modules/siap/models/jf.model'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../../modules/base/services/api.service'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { FilePreviewService } from '../../../../modules/base/services/file-preview.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
@Component({
    selector: 'app-ukom-detail',
    standalone: true,
    imports: [PagableComponent, CommonModule],
    templateUrl: './ukom-detail.component.html',
    styleUrl: './ukom-detail.component.scss'
})
export class UkomDetailComponent {
    pagable: Pagable
    jf: JF = new JF()
    jfLoading$ = new BehaviorSubject<boolean>(false)

    id: string
    isBanned: boolean = false
    bannedDue: string = ''
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    predikatKinerjaList: any[] = []
    refresh: boolean

    constructor (
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private sanitizer: DomSanitizer,
        private filePreviewService: FilePreviewService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService
    ) {}

    ngOnInit () {
        this.activatedRoute.paramMap.subscribe(params => {
            this.id = params.get('id')
        })

        this.handlePagable()
        this.getJF()
        this.isUserBanned()
    }

    handlePagable () {
        this.pagable = new PagableBuilder(
            `/api/v1/participant_ukom/all/${this.id}`
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    // .withDynamicValue('Jenis Ukom', (data: any) =>
                    //     data.jenisUkom === 'KENAIKAN_JENJANG'
                    //         ? 'Kenaikan Jenjang'
                    //         : data.jenisUkom === 'PERPINDAHAN_JABATAN'
                    //         ? 'Perpindahan Jabatan'
                    //         : data.jenisUkom
                    // )
                    .withDynamicValue('Jenis Ukom', (data: any) => {
                        switch (data.jenisUkom) {
                            case 'KENAIKAN_JENJANG':
                                return 'Kenaikan Jenjang'
                            case 'PERPINDAHAN_JABATAN':
                                return 'Perpindahan Jabatan'
                            case 'PROMOSI':
                                return 'Promosi'
                            case 'PROMOSI_JF':
                                return 'Promosi Jabatan Fungsional'
                            default:
                                return data.jenisUkom
                        }
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tanggal', 'dateCreated').build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: any) => {
                        this.router.navigate([
                            `/ukom/ukom-list/detail/${ukom.id}`
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: any) => {
                        this.handleDeleteTask(ukom.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build()
            )
            .build()
    }

    handleDeleteTask (id: string) {
        this.confirmationService.open(false).subscribe({
            next: res => {
                if (!res.confirmed) {
                    return
                }

                this.apiService
                    .deleteData(`/api/v1/participant_ukom/${id} `)
                    .subscribe({
                        next: res => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil dihapus'
                            )
                            this.refresh = !this.refresh
                        },
                        error: err => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Data gagal dihapus'
                            )
                            this.refresh = !this.refresh
                        }
                    })
            }
        })
    }

    preview (fileName: string, fileSource: string) {
        this.filePreviewService.open(fileName, fileSource)
    }

    getJF () {
        this.jfLoading$.next(true)

        this.apiService.getData(`/api/v1/jf/${this.id}`).subscribe({
            next: (response: any) => {
                this.jf = new JF(response)
                this.jfLoading$.next(false)
            }
        })
    }

    fetchPhotoProfile () {
        this.apiService.getPhotoProfile(LoginContext.getUserId()).subscribe({
            next: blob => {
                if (blob.size === 0) {
                    this.profileImageSrc = 'assets/no-profile.jpg'
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                this.profileImageSrc =
                    this.sanitizer.bypassSecurityTrustUrl(objectUrl)
            },
            error: err => {
                console.error('Error fetching profile image', err)
                this.profileImageSrc = 'assets/no-profile.jpg'
            }
        })
    }

    back () {
        history.back()
    }

    isUserBanned () {
        this.apiService
            .getData(
                `/api/v1/participant_ukom/search?limit=100&eq_nip=${this.id}`
            )
            .subscribe({
                next: (response: any) => {
                    this.isBanned = response.data[0].ukomBan != null
                    this.bannedDue = response.data[0].ukomBan?.until
                }
            })
    }
}
