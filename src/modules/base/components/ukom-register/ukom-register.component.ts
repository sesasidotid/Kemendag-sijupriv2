import { PesertaUkom } from '../../../ukom/models/peserta-ukom.model'
import { Component, ViewChild } from '@angular/core'
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
import { Observable, of, Subject } from 'rxjs'
import { DokumenUkomPersyaratan } from '../../../maintenance/models/dokumen-persyaratan-ukom'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { ApiService } from '../../services/api.service'
import { HandlerService } from '../../services/handler.service'
import { ConfirmationService } from '../../services/confirmation.service'
import { CommonModule } from '@angular/common'
import { map } from 'rxjs/operators'
import { Instansi } from '../../../maintenance/models/instansi.model'
import { UnitKerja } from '../../../maintenance/models/unit-kerja.model'
import { QRCodeModule } from 'angularx-qrcode'
import { SafeUrl } from '@angular/platform-browser'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
import { Router } from '@angular/router'
import { LandingPageComponent } from '../../../landing-page/landing-page.component'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-ukom-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileHandlerComponent,
    QRCodeModule,
    ConfirmationDialogComponent,
    FilePreviewComponent,
    LandingPageComponent
  ],
  templateUrl: './ukom-register.component.html',
  styleUrl: './ukom-register.component.scss'
})
export class UkomRegisterComponent {
  @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent

  nonJFForm: FormGroup

  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  pangkatList$: Observable<Pangkat[]>

  NextjabatanList$: Observable<Jabatan[]>

  nextJenjang: Jenjang
  detectedDokumen: any = {}
  pesertaUkom: PesertaUkom = new PesertaUkom()
  dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

  registerComplete: boolean = false
  registerOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  )

  myAngularxQrCode: string = ''
  stringCode: string = ''
  qrCodeDownloadLink: SafeUrl = ''
  inputs: FIleHandler = {
    files: {},
    maxSize: 5 * 1024 * 1024,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ],
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string,
      id: string
    ) => {
      this.detectedDokumen[key] = {
        base64: base64Data,
        label: label,
        id: id
      }
    }
  }

  hadItemsLoading$ = new BehaviorSubject<boolean>(false)

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    setTimeout(() => {}, 0)
  }

  passwordMatchValidator (
    control: FormControl
  ): { [key: string]: boolean } | null {
    if (this.nonJFForm) {
      const password = this.nonJFForm.get('password')?.value
      const confirmPassword = control.value
      if (password !== confirmPassword) {
        return { mismatch: true }
      }
    }
    return null
  }

  isAnyFileMissing (): boolean {
    return Object.keys(this.inputs.files).some(key => {
      return !this.detectedDokumen[key]
    })
  }

  backToLandingPage () {
    this.router.navigate([''])
  }

  getDokumenPersyaratan (jenis_ukom: string) {
    this.apiService
      .getData(`/api/v1/document_ukom/jenis_ukom/${jenis_ukom}`)
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
              label: dokumen.dokumenPersyaratanName,
              id: dokumen.dokumenPersyaratanId
            }
          })
        },
        error: error => {
          console.log(error)
          this.handlerService.handleAlert(
            'Error',
            'Gagal mengambil dokumen persyaratan'
          )
        }
      })
  }

  getListJabatan () {
    this.jabatanList$ = this.apiService
      .getData(`/api/v1/jabatan`)
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
      .getData(`/api/v1/jenjang`)
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
      .getData(`/api/v1/pangkat`)
      .pipe(
        map(response =>
          response.map(
            (pangkat: { [key: string]: any }) => new Pangkat(pangkat)
          )
        )
      )
  }

  onJenisUkomSwitch (event: Event) {
    this.clearFilesName()
    const jenis_ukom = (event.target as HTMLSelectElement).value

    this.nonJFForm.get('nextJabatanCode')?.setValue('')
    this.nonJFForm.get('nextJenjangCode')?.setValue('')
    this.nonJFForm.get('jabatanCode')?.setValue('')
    this.nonJFForm.get('jenjangCode')?.setValue('')
    this.nonJFForm.get('pangkatCode')?.setValue('')

    this.inputs.files = {}
    this.detectedDokumen = {}
    if (jenis_ukom) {
      this.nonJFForm.patchValue({ jenis_ukom })
      this.pesertaUkom.jenis_ukom = jenis_ukom

      if (jenis_ukom == 'PERPINDAHAN_JABATAN') {
        this.getListJabatan()
        this.getDokumenPersyaratan(jenis_ukom)
      }

      if (jenis_ukom == 'PROMOSI') {
        this.getDokumenPersyaratan(jenis_ukom)
      }
    }
  }

  clearFilesName () {
    if (this.fileHandler) {
      this.fileHandler.clearFileName()
    }
  }

  onChangeURL (url: SafeUrl) {
    this.qrCodeDownloadLink = url
  }

  checkStatusRegister () {
    this.apiService.getData(`/api/v1/sys_conf/UKM_REGISTRATION`).subscribe({
      next: response => {
        this.registerOpened$.next(response.value == 'ya')
      }
    })
  }

  submit () {
    this.hadItemsLoading$.next(true)
    const jenis_ukom = this.nonJFForm.get('jenis_ukom').value
    this.pesertaUkom.name = this.nonJFForm.get('name').value
    this.pesertaUkom.email = this.nonJFForm.get('email').value
    this.pesertaUkom.password = this.nonJFForm.get('password').value
    this.pesertaUkom.nip = this.nonJFForm.get('nip').value
    this.pesertaUkom.unitKerjaName = this.nonJFForm.get('unitKerjaName')?.value
    this.pesertaUkom.jenis_ukom = jenis_ukom
    this.pesertaUkom.jabatanName = this.nonJFForm.get('jabatanName')?.value
    this.pesertaUkom.jenjangName =
      this.nonJFForm.get('jenjangName')?.value || '-'
    this.pesertaUkom.pangkatCode = this.nonJFForm.get('pangkatCode')?.value
    this.pesertaUkom.nextJabatanCode =
      this.nonJFForm.get('nextJabatanCode')?.value
    this.pesertaUkom.nextJenjangCode =
      this.nonJFForm.get('nextJenjangCode')?.value

    if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
      this.pesertaUkom.dokumenUkomList = []
    }

    const documentMap = new Map()

    for (const key in this.detectedDokumen) {
      if (this.detectedDokumen.hasOwnProperty(key)) {
        const detected = this.detectedDokumen[key]

        const dokumenPersyaratan = this.dokumenPersyaratanList.find(
          dokumen => dokumen.dokumenPersyaratanName === detected.label
        )

        if (dokumenPersyaratan) {
          const newDoc = {
            dokumenFile: detected.base64,
            dokumenPersyaratanName: `${
              dokumenPersyaratan.dokumenPersyaratanName
            }_${this.pesertaUkom.nip}_${Date.now()}`,
            dokumenPersyaratanId: detected.id
          }

          documentMap.set(detected.id, newDoc)
        }
      }
    }

    this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        console.log('payload', this.pesertaUkom)

        this.apiService
          .postData('/api/v1/participant_ukom/task', this.pesertaUkom)
          .subscribe({
            next: response => {
              this.registerComplete = true
              this.myAngularxQrCode = `${window.location.origin}/ukom/external/status?key=${response.key}`
              this.stringCode = response.key
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              this.hadItemsLoading$.next(false)
            },
            error: error => {
              this.hadItemsLoading$.next(false)
              console.log('error', error)
              this.handlerService.handleAlert(
                'Error',
                'Gagal mendaftar UKom, silahkan coba lagi'
              )
            }
          })
      },
      error: error => {
        this.hadItemsLoading$.next(false)
        console.log('error', error)
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  ngOnInit () {
    this.checkStatusRegister()
    this.nonJFForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        this.passwordMatchValidator.bind(this)
      ]),
      jenis_ukom: new FormControl('', Validators.required),
      nip: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{18}$/)
      ]),
      unitKerjaName: new FormControl('', Validators.required),
      jabatanName: new FormControl('', Validators.required),
      jenjangName: new FormControl(''),
      pangkatCode: new FormControl('', Validators.required),
      nextJabatanCode: new FormControl('', Validators.required),
      nextJenjangCode: new FormControl('', Validators.required)
    })

    this.registerOpened$.subscribe(opened => {
      console.log('re', opened)
    })

    this.getListJabatan()
    this.getListJenjang()
    this.getListPanngkat()
  }
}
