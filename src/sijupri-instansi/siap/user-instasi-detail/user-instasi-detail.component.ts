import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { UserInstansiDetail } from '../../../modules/siap/models/user-instansi-detail.model'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
@Component({
  selector: 'app-user-instasi-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-instasi-detail.component.html',
  styleUrl: './user-instasi-detail.component.scss'
})
export class UserInstasiDetailComponent {
  nip: string = ''
  userInstansiDetail: UserInstansiDetail = new UserInstansiDetail()
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
    this.getInstansiDetail()
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

  getInstansiDetail () {
    this.apiService.getData(`/api/v1/user_instansi/${this.nip}`).subscribe({
      next: (data: UserInstansiDetail) => {
        this.userInstansiDetail = data
      },
      error: err => {
        console.error(err)
        this.handlerService.handleAlert('Error', 'Gagal mengambil data')
      }
    })
  }
}
