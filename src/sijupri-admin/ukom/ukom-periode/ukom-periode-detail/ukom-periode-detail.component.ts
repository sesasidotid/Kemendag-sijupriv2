import { Component } from '@angular/core'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { PeriodePendaftaran } from '../../../../modules/maintenance/models/periode-pendaftaran.model'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { EditorModule } from '@tinymce/tinymce-angular'
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/plugins/image'
import 'tinymce/plugins/code'

@Component({
  selector: 'app-ukom-periode-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './ukom-periode-detail.component.html',
  styleUrl: './ukom-periode-detail.component.scss'
})
export class UkomPeriodeDetailComponent {
  periodePendaftaran: PeriodePendaftaran = new PeriodePendaftaran()
  editorContent: string = ''
  init: any
  id: string

  constructor (
    private apiService: ApiService,
    private allertService: AlertService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })

    this.init = {
      base_url: '/assets/tinymce',
      suffix: '.min',
      height: 500,
      menubar: false,
      plugins: 'image code',
      toolbar:
        'undo redo | bold italic | alignleft aligncenter alignright | code | image',
      images_upload_handler: this.handleImageUpload,
      skin_url: '/assets/tinymce/skins/ui/oxide',
      icons_url: '/assets/tinymce/icons/default/icons.min.js',
      theme_url: '/assets/tinymce/themes/silver/theme.min.js'
    }
  }

  ngOnInit () {
    this.getUkomPeriode()
  }

  getUkomPeriode () {
    this.apiService.getData(`/api/v1/periode_ukom/${this.id}`).subscribe({
      next: response => {
        this.periodePendaftaran = new PeriodePendaftaran(response)
      },
      error: error => {
        console.error('Error:', error)
        this.allertService.showToast('Error', 'gagal mengambil informasi')
      }
    })
  }

  handleImageUpload = (blobInfo: any, progress: Function) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(blobInfo.blob())

      reader.onprogress = e => {
        progress((e.loaded / e.total) * 100)
      }

      reader.onload = () => {
        resolve(reader.result)
      }

      reader.onerror = error => {
        console.error('Image to Base64 failed', error)
        reject('Image upload failed')
      }
    })

  onEditorChange (content: any) {
    this.editorContent = content
  }

  submit () {
    this.periodePendaftaran.type = 'periode_ukom'
    if (this.periodePendaftaran.notify)
      this.periodePendaftaran.announcement = this.editorContent
    else this.periodePendaftaran.announcement = undefined

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService
          .putData('/api/v1/periode_ukom', this.periodePendaftaran)
          .subscribe({
            next: response => {
              console.log('Success:', response)
            },
            error: error => {
              console.error('Error:', error)
              this.allertService.showToast(
                'Error',
                'gagal mengirimkan informasi'
              )
            }
          })
      }
    })
  }
}
