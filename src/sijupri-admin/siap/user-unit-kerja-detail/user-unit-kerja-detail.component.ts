import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { UserUnitKerjaDetail } from '../../../modules/siap/models/user-unit-kerja-detail'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { UnitKerjaDetailComponent } from '../../maintenance/unit-kerja-detail/unit-kerja-detail.component'
@Component({
  selector: 'app-user-unit-kerja-detail',
  standalone: true,
  imports: [CommonModule, UnitKerjaDetailComponent],
  templateUrl: './user-unit-kerja-detail.component.html',
  styleUrl: './user-unit-kerja-detail.component.scss'
})
export class UserUnitKerjaDetailComponent {
  nip: string = ''
  userUnitKerjaDetail: UserUnitKerjaDetail = new UserUnitKerjaDetail()
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  constructor (
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private handlerService: HandlerService,
    private sanitizer: DomSanitizer
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.nip = params.get('id')
    })
    this.fetchPhotoProfile()
  }

  ngOnInit () {
    this.getUserUnitKerjaDetail()
  }

  backToList () {
    history.back()
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

  getUserUnitKerjaDetail () {
    this.apiService.getData(`/api/v1/user_unit_kerja/${this.nip}`).subscribe({
      next: (data: UserUnitKerjaDetail) => {
        this.userUnitKerjaDetail = data
        console.log('111', this.userUnitKerjaDetail)
      },
      error: err => {
        console.error(err)
        this.handlerService.handleAlert('Error', 'Gagal mengambil data')
      }
    })
  }
}
