import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { JfService } from '../../../modules/siap/services/jf.service'
import { JF } from '../../../modules/siap/models/jf.model'
import { CommonModule, Location } from '@angular/common'
import { RwPendidikanListComponent } from '../../../sijupri-jf/siap/rw-pendidikan/rw-pendidikan-list/rw-pendidikan-list.component'
import { RwPangkatListComponent } from '../../../sijupri-jf/siap/rw-pangkat/rw-pangkat-list/rw-pangkat-list.component'
import { RwJabatanListComponent } from '../../../sijupri-jf/siap/rw-jabatan/rw-jabatan-list/rw-jabatan-list.component'
import { RwKinerjaListComponent } from '../../../sijupri-jf/siap/rw-kinerja/rw-kinerja-list/rw-kinerja-list.component'
import { RwKompetensiListComponent } from '../../../sijupri-jf/siap/rw-kompetensi/rw-kompetensi-list/rw-kompetensi-list.component'
import { RwSertifikasiListComponent } from '../../../sijupri-jf/siap/rw-sertifikasi/rw-sertifikasi-list/rw-sertifikasi-list.component'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ApiService } from '../../../modules/base/services/api.service'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
import { RwUkomListComponent } from '@/sijupri-admin/siap/jf-detail/rw-ukom-list/rw-ukom-list.component'
import { AdminRwPendidikanComponent } from './admin-rw-pendidikan/admin-rw-pendidikan.component'
import { AdminRwPangkatComponent } from './admin-rw-pangkat/admin-rw-pangkat.component'

@Component({
    selector: 'app-jf-detail',
    standalone: true,
    imports: [
        AdminRwPendidikanComponent,
        AdminRwPangkatComponent,
        RwJabatanListComponent,
        RwKinerjaListComponent,
        RwKompetensiListComponent,
        RwSertifikasiListComponent,
        RwUkomListComponent,
        CommonModule,
    ],
    templateUrl: './jf-detail.component.html',
    styleUrl: './jf-detail.component.scss',
})
export class JfDetailComponent {
    nip: string
    jf: JF = new JF()
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

    activeTab = 'pendidikan'
    readonly tabs = {
        pendidikan: 'Pendidikan',
        pangkat: 'Pangkat',
        jabatan: 'Jabatan',
        kinerja: 'Kinerja',
        kompetensi: 'Kompetensi',
        sertifikasi: 'Sertifikasi',
        ukom: 'RiwayatUKom',
    }
    location = inject(Location)

    constructor(
        private jfService: JfService,
        private activatedRoute: ActivatedRoute,
        private apiService: ApiService,
        private sanitizer: DomSanitizer,
        private filePreviewService: FilePreviewService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((params) => {
            this.nip = params.get('id')
        })
        this.activatedRoute.queryParamMap.subscribe((params) => {
            this.activeTab = params.get('tab') ?? 'pendidikan'
        })

        this.getJF()
        this.fetchPhotoProfile()
    }

    changeTab(tab: string) {
        this.activeTab = tab

        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { tab },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        })
    }

    backToList() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
        // this.router.navigate(['/siap/user-jf'])
    }

    fetchPhotoProfile() {
        this.apiService.getPhotoProfile(this.nip).subscribe({
            next: (blob) => {
                if (blob.size === 0) {
                    this.profileImageSrc = 'assets/no-profile.jpg'
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                this.profileImageSrc =
                    this.sanitizer.bypassSecurityTrustUrl(objectUrl)
            },
            error: () => {
                this.profileImageSrc = 'assets/no-profile.jpg'
            },
        })
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }

    getJF() {
        this.jfService.findByNip(this.nip).subscribe({
            next: (jf: JF) => (this.jf = jf),
        })
    }
}
