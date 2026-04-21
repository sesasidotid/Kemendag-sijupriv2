import { Component, OnInit } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { LoginContext } from '@/modules/base/commons/login-context'
import { ApiService } from '@/modules/base/services/api.service'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { User } from '@/modules/security/models/user.model'

@Component({
    selector: 'app-profile-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './profile-card.component.html',
    styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent implements OnInit {
    nip = LoginContext.getUserId()
    name = LoginContext.getName()
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'
    file: File | null = null
    filePreview: string = ''
    userDetail = new User()

    currentRoute: string = this.router.url

    constructor(
        private router: Router,
        private apiService: ApiService,
        private sanitizer: DomSanitizer,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
    ) {}

    ngOnInit() {
        this.fetchPhotoProfile()
        this.getUserDetails()
    }

    getUserDetails() {
        this.apiService.getData(`/api/v1/user/${this.nip}`).subscribe({
            next: (res) => {
                this.userDetail = res
            },
        })
    }

    fetchPhotoProfile() {
        this.apiService.getPhotoProfile(this.nip).subscribe({
            next: (blob) => {
                console.log('Profile image fetched', blob)
                if (blob.size === 0) {
                    this.profileImageSrc = 'assets/no-profile.jpg'
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                this.profileImageSrc =
                    this.sanitizer.bypassSecurityTrustUrl(objectUrl)
            },
            error: (err) => {
                console.error('Error fetching profile image', err)
                this.profileImageSrc = 'assets/no-profile.jpg'
            },
        })
    }

    onFileChange(event: any) {
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

    saveProfileImage() {
        if (!this.file) {
            return
        }

        const fileReader = new FileReader()
        fileReader.onload = () => {
            const base64Image = fileReader.result as string
            const payload = { imgProfileFile: base64Image }

            this.confirmationService.open(false).subscribe({
                next: (response) => {
                    if (!response.confirmed) {
                        return
                    }
                    this.apiService
                        .postData('/api/v1/profile_img/upload', payload)
                        .subscribe({
                            next: () => {
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Profile image saved',
                                )

                                this.filePreview = base64Image
                                this.fetchPhotoProfile()

                                window.location.reload()
                            },
                            error: (err) => {
                                console.error('Error saving profile image', err)
                                alert('Failed to save profile image')
                            },
                        })
                },
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Failed to save profile image',
                    )
                },
            })
        }

        fileReader.readAsDataURL(this.file) // This converts the selected file to Base64
    }
}
