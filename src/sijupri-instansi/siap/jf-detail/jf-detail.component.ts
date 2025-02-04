import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { JfService } from '../../../modules/siap/services/jf.service'
import { JF } from '../../../modules/siap/models/jf.model'
import { CommonModule } from '@angular/common'
import { RwPendidikanListComponent } from '../../../sijupri-jf/siap/rw-pendidikan/rw-pendidikan-list/rw-pendidikan-list.component'
import { RwPangkatListComponent } from '../../../sijupri-jf/siap/rw-pangkat/rw-pangkat-list/rw-pangkat-list.component'
import { RwJabatanListComponent } from '../../../sijupri-jf/siap/rw-jabatan/rw-jabatan-list/rw-jabatan-list.component'
import { RwKinerjaListComponent } from '../../../sijupri-jf/siap/rw-kinerja/rw-kinerja-list/rw-kinerja-list.component'
import { RwKompetensiListComponent } from '../../../sijupri-jf/siap/rw-kompetensi/rw-kompetensi-list/rw-kompetensi-list.component'
import { RwSertifikasiListComponent } from '../../../sijupri-jf/siap/rw-sertifikasi/rw-sertifikasi-list/rw-sertifikasi-list.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { ApiService } from '../../../modules/base/services/api.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
@Component({
  selector: 'app-jf-detail',
  standalone: true,
  imports: [
    RwPendidikanListComponent,
    RwPangkatListComponent,
    RwJabatanListComponent,
    RwKinerjaListComponent,
    RwKompetensiListComponent,
    RwSertifikasiListComponent,
    CommonModule
  ],
  templateUrl: './jf-detail.component.html',
  styleUrl: './jf-detail.component.scss'
})
export class JfDetailComponent {
  nip: string
  jf: JF = new JF()
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  constructor (
    private jfService: JfService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private filePreviewService: FilePreviewService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.nip = params.get('id')
    })
    this.getJF()
  }

  ngOnInit () {
    this.fetchPhotoProfile()
  }

  getJF () {
    this.jfService.findByNip(this.nip).subscribe({
      next: (jf: JF) => (this.jf = jf)
    })
  }

  fetchPhotoProfile () {
    this.apiService.getPhotoProfile(this.nip).subscribe({
      next: blob => {
        if (blob.size === 0) {
          this.profileImageSrc = 'assets/no-profile.jpg'
          return
        }
        const objectUrl = URL.createObjectURL(blob)
        this.profileImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl)
      },
      error: err => {
        console.error('Error fetching profile image', err)
        this.profileImageSrc = 'assets/no-profile.jpg'
      }
    })
  }

  preview (fileName: string, source: string) {
    this.filePreviewService.open(fileName, source)
  }
}
