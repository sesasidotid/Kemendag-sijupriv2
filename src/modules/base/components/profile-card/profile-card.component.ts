import { Component } from '@angular/core'
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router'
import { CommonModule } from '@angular/common'
import { LoginContext } from '../../commons/login-context'
import { ApiService } from '../../services/api.service'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { FileHandlerComponent } from '../file-handler/file-handler.component'
import { ConfirmationService } from '../../services/confirmation.service'
import { HandlerService } from '../../services/handler.service'

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FileHandlerComponent
  ],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {
  nip: string = LoginContext.getUserId()
  name: string = LoginContext.getName()
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'
  file: File | null = null
  filePreview: string = ''

  currentRoute: string = this.router.url

  constructor (
    private router: Router,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService
  ) {}

  ngOnInit () {
    this.fetchPhotoProfile()
  }

  fetchPhotoProfile () {
    this.apiService.getPhotoProfile(this.nip).subscribe({
      next: blob => {
        console.log('Profile image fetched', blob)
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

  onFileChange (event: any) {
    const files = event.target.files as FileList

    if (files.length > 0) {
      this.file = files[0]
      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.filePreview = fileReader.result as string
      }
      fileReader.readAsDataURL(this.file)
    }
  }

  saveProfileImage () {
    if (!this.file) {
      alert('No file selected')
      return
    }

    const fileReader = new FileReader()
    fileReader.onload = () => {
      const base64Image = fileReader.result as string
      const payload = { imgProfileFile: base64Image }

      this.confirmationService.open(false).subscribe({
        next: response => {
          if (!response.confirmed) {
            return
          }
          this.apiService
            .postData('/api/v1/profile_img/upload', payload)
            .subscribe({
              next: () => {
                this.handlerService.handleAlert(
                  'Success',
                  'Profile image saved'
                )

                this.filePreview = base64Image
                this.fetchPhotoProfile()

                window.location.reload()
              },
              error: err => {
                console.error('Error saving profile image', err)
                alert('Failed to save profile image')
              }
            })
        },
        error: err => {
          this.handlerService.handleAlert(
            'Error',
            'Failed to save profile image'
          )
        }
      })
    }

    fileReader.readAsDataURL(this.file) // This converts the selected file to Base64
  }
}
