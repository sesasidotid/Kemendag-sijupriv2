import { PesertaUkom } from './../../../ukom/models/peserta-ukom.model'
import { Component } from '@angular/core'
import { Jabatan } from '../../../maintenance/models/jabatan.model'
import { Jenjang } from '../../../maintenance/models/jenjang.modle'
import { Pangkat } from '../../../maintenance/models/pangkat.model'
import { FileHandlerComponent } from '../file-handler/file-handler.component'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { Observable } from 'rxjs'
import { DokumenUkomPersyaratan } from '../../../../modules/maintenance/models/dokumen-persyaratan-ukom'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { CommonModule } from '@angular/common'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-ukom-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ukom-register.component.html',
  styleUrl: './ukom-register.component.scss'
})
export class UkomRegisterComponent {
  customHeader = {
    Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzaWp1cHJpLXdlYiIsImp0aSI6ImY4YjFhMjE5YWYzZjczYmNmODhiZTY1MjIyZWFlNzE2ZDU5NjgzYzZjN2UzZmU1OGQ3Zjk0Yjc0OGFhYTlkMWE1ZGQyMzU4ODkzODJkYTQxIiwiaWF0IjoxNzM3NjAwMTk3LjcwMTQ2OSwibmJmIjoxNzM3NjAwMTk3LjcwMTQ3NSwiZXhwIjoxNzQwNjAwMTk3LjYyOTg1OSwic3ViIjoiNDQ0NDQ0NDQ0NDQ0NDQ0NDQxIiwic2NvcGVzIjpbXSwiZGV0YWlscyI6eyJpZCI6IjQ0NDQ0NDQ0NDQ0NDQ0NDQ0MSIsIm5hbWUiOiJUZXN0IEpGIDEiLCJyb2xlX2NvZGVzIjpbIlVTRVJfRVhURVJOQUwiXSwibWVudV9jb2RlcyI6WyJNTlVfQUtQSkUwMDEiLCJNTlVfQUtQSkUwMDIiLCJNTlVfQUtQSkUwMDMiLCJNTlVfVUtNSkUwMDEiLCJNTlVfVUtNSkUwMDIiLCJNTlVfVUtNSkUwMDMiLCJNTlVfRk9SSkUwMDEiLCJNTlVfRk9SSkUwMDIiXSwiYXBwbGljYXRpb25fY29kZSI6InNpanVwcmktZXh0ZXJuYWwiLCJpbnN0YW5zaV9pZCI6IjJiYTU5YTc4LTBlMTQtNGUwMy1hOTk4LTNiY2Q0ZWU4OGEzMSIsInVuaXRfa2VyamFfaWQiOiI3MDUwOTg0Yy1mYjZiLTQxMjgtOWExYS1iNTEzNjY0Nzk0NDIiLCJ1cmxzIjpbIi9hcGkvdjEvKip8Q1VEIl19fQ.aLDxwTxdUl2hcGYtCGNehzI3qbEWd9Bz8NE7n18BMzXtsk25ZFzBEGj0JUZ4hY4_xCvDuS_yglQQ0pjIk-jXGPXmbQT6yYG737wAJtVDhomMcFAXg2NkAlUjwlE8X0i8UhD-G-L7jIKq_0dlB0QImaqlGaPPo4kx21gkDIrj8dkNu5jj7GCrO7g4nCbtKz9axg9gttQrMBaRcF82OzeqN9H34XLgh4Uro1FvkSLCAOzzaPcu06gWkMLraW0fl0XeiT6QTirH2CrJJcF-a8oetors3hExf9qudhG-s13mWa0kI1XxkFPYjNcfOJopNTlg5qQscXNC0_5eVRkoxXxNDPE20zgUuv9vJLiiy1aAryR2abVkbqBzCHAYVBDKFPV2-GSXIfK0jdY42DIK1B3_U_mdgZqt4qM5skp5gzOcZn9eBfhR2UGsv0LPidhb8PEnEQs6TG5bVIZ7WsrscpUAvAdI-zNqVCaB2FrhOfL3RYhIONmRtSiU5Rifd6CsgRL6lnvgV45jBmJN7boQ6sPxaw-VCbGwQWhUp8MK2GNmW0MaqmPcajT0I-h7BYUxUqrKAlsWECtvJdzHcJsnjJug9aMa75R66MOwV0fbe07Gci50fENaS_D0e72tw0o0x8oKMQV1rbnCiEojQQau33WKPFCcVNzTW9al6DcGJE0_RC0`
  }
  nonJFForm: FormGroup

  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  pangkatList$: Observable<Pangkat[]>

  nextJenjang: Jenjang
  detectedDokumen: any = {}
  pesertaUkom: PesertaUkom = new PesertaUkom()

  dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

  inputs: FIleHandler = {
    files: {},
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      this.detectedDokumen[key] = {
        base64: base64Data,
        label: label
      }
    }
  }

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.nonJFForm = new FormGroup({
      jenis_ukom: new FormControl('', Validators.required),
      nip: new FormControl('', Validators.required),
      nik: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      tempatLahir: new FormControl('', Validators.required),
      tanggalLahir: new FormControl('', Validators.required),
      jenisKelaminCode: new FormControl('', Validators.required),
      jabatanCode: new FormControl('', Validators.required),
      jenjangCode: new FormControl('', Validators.required),
      pangkatCode: new FormControl('', Validators.required),
      nextJabatanCode: new FormControl('', Validators.required),
      nextJenjangCode: new FormControl('', Validators.required)
    })
  }

  ngOnInit () {
    this.getListJabatan()
    this.getListJenjang()
    this.getListPanngkat()
  }

  getDokumenPersyaratan (jenis_ukom: string) {
    this.apiService
      .getData(
        `/api/v1/document_ukom/jenis_ukom/${jenis_ukom}`,
        this.customHeader
      )
      .subscribe({
        next: response => {
          this.dokumenPersyaratanList = response.map((dokumen: any) => {
            return new DokumenUkomPersyaratan({
              dokumenPersyaratanId: dokumen.dokumenPersyaratanId,
              dokumenPersyaratanName: dokumen.dokumenPersyaratanName
            })
          })

          this.detectedDokumen = {}
          this.inputs.files = {}

          this.dokumenPersyaratanList.forEach((dokumen, index) => {
            const key = `dokumenPersyaratan_${index + 1}`
            this.inputs.files[key] = {
              label: dokumen.dokumenPersyaratanName
            }
          })
        },
        error: error => this.handlerService.handleException(error)
      })
  }

  getListJabatan () {
    this.jabatanList$ = this.apiService
      .getData(`/api/v1/jabatan`, this.customHeader)
      .pipe(
        map(response =>
          response.map(
            (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
          )
        )
      )
  }

  getListJenjang () {
    this.jenjangList$ = this.apiService
      .getData(`/api/v1/jenjang`, this.customHeader)
      .pipe(
        map(response =>
          response.map(
            (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
          )
        )
      )
  }

  getListPanngkat () {
    this.pangkatList$ = this.apiService
      .getData(`/api/v1/pangkat`, this.customHeader)
      .pipe(
        map(response =>
          response.map(
            (pangkat: { [key: string]: any }) => new Pangkat(pangkat)
          )
        )
      )
  }

  getNextJenjang (jenjang_code: string) {
    if (jenjang_code) {
      this.apiService
        .getData(`/api/v1/jenjang/next/${jenjang_code}`, this.customHeader)
        .subscribe({
          next: (response: any) => {
            this.nextJenjang = new Jenjang(response)
          },
          error: error => this.handlerService.handleException(error)
        })
    }
  }

  onJenisUkomSwitch (event: Event) {
    const jenis_ukom = (event.target as HTMLSelectElement).value
    console.log('Jenis Ukom changed to:', jenis_ukom)

    // this.pesertaUkom = new PesertaUkom()
    // this.nonJFForm.reset()

    if (jenis_ukom) {
      this.nonJFForm.patchValue({ jenis_ukom })
      this.pesertaUkom.jenis_ukom = jenis_ukom

      if (jenis_ukom == 'PERPINDAHAN_JABATAN') {
        this.getListJabatan()
        this.getDokumenPersyaratan(jenis_ukom)
      }

      if (jenis_ukom == 'PROMOSI') {
        // this.getNextJenjang()
        this.getDokumenPersyaratan(jenis_ukom)
      }
    }
  }

  onJenjangSwitch (event: Event) {
    const jenjangCode = (event.target as HTMLSelectElement).value

    if (jenjangCode) {
      this.pesertaUkom.jenjangCode = jenjangCode
    }
    this.getNextJenjang(jenjangCode)
  }

  submit () {
    console.log('Submitting data:')

    const jenis_ukom = this.nonJFForm.get('jenis_ukom')?.value
    console.log(jenis_ukom)

    this.pesertaUkom.jenis_ukom = jenis_ukom
    this.pesertaUkom.nip = this.nonJFForm.get('nip')?.value
    this.pesertaUkom.nik = this.nonJFForm.get('nik')?.value
    this.pesertaUkom.name = this.nonJFForm.get('name')?.value
    this.pesertaUkom.email = this.nonJFForm.get('email')?.value
    this.pesertaUkom.phone = this.nonJFForm.get('phone')?.value
    this.pesertaUkom.tempatLahir = this.nonJFForm.get('tempatLahir')?.value
    this.pesertaUkom.tanggalLahir = this.nonJFForm.get('tanggalLahir')?.value
    this.pesertaUkom.jenisKelaminCode =
      this.nonJFForm.get('jenisKelaminCode')?.value
    this.pesertaUkom.jabatanCode = this.nonJFForm.get('jabatanCode')?.value
    this.pesertaUkom.jenjangCode = this.nonJFForm.get('jenjangCode')?.value
    this.pesertaUkom.pangkatCode = this.nonJFForm.get('pangkatCode')?.value
    this.pesertaUkom.nextPangkatName = this.nonJFForm.get('pangkatCode')?.value

    if (jenis_ukom === 'PERPINDAHAN_JABATAN') {
      this.pesertaUkom.nextJabatanCode =
        this.nonJFForm.get('nextJabatanCode')?.value
    }

    if (jenis_ukom === 'PROMOSI') {
      this.pesertaUkom.nextJenjangCode =
        this.nonJFForm.get('nextJenjangCode')?.value
      this.pesertaUkom.nextJabatanCode =
        this.nonJFForm.get('jabatanCode')?.value
    }

    console.log('Submitting data:', this.pesertaUkom)
    // this.confirmationService.open(false).subscribe({
    //   next: result => {
    //     if (!result.confirmed) return

    //     // const jenis_ukom = this.nonJFForm.get('jenis_ukom')?.value

    //     // this.pesertaUkom.jabatanCode = this.nonJFForm.get('jabatanCode')?.value
    //     // this.pesertaUkom.jenjangCode = this.nonJFForm.get('jenjangCode')?.value
    //     // this.pesertaUkom.pangkatCode = this.nonJFForm.get('pangkatCode')?.value
    //     // this.pesertaUkom.nextJabatanCode =
    //     //   this.nonJFForm.get('jabatanCode')?.value
    //     // this.pesertaUkom.nextJenjangCode =
    //     //   this.nonJFForm.get('jenjangCode')?.value
    //     // this.pesertaUkom.nextPangkatCode =
    //     //   this.nonJFForm.get('pangkatCode')?.value

    //     // if (jenis_ukom === 'PERPINDAHAN_JABATAN') {
    //     //   this.pesertaUkom.nextJabatanCode =
    //     //     this.nonJFForm.get('nextJabatanCode')?.value
    //     // }

    //     // if (jenis_ukom === 'PROMOSI') {
    //     //   this.pesertaUkom.nextJenjangCode =
    //     //     this.nonJFForm.get('nextJenjangCode')?.value
    //     // }

    //     console.log('Submitting data:', this.pesertaUkom)
    //   },
    //   error: error => {
    //     console.log('error', error)
    //     this.handlerService.handleAlert('Error', error.error.message)
    //   }
    // })
  }
}
