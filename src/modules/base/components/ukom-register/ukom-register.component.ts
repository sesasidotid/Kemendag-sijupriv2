import { PesertaUkom } from '../../../ukom/models/peserta-ukom.model'
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
import { Observable, of, Subject } from 'rxjs'
import { DokumenUkomPersyaratan } from '../../../maintenance/models/dokumen-persyaratan-ukom'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { ApiService } from '../../services/api.service'
import { HandlerService } from '../../services/handler.service'
import { ConfirmationService } from '../../services/confirmation.service'
import { CommonModule } from '@angular/common'
import { map, filter } from 'rxjs/operators'
import { Instansi } from '../../../maintenance/models/instansi.model'
import { UnitKerja } from '../../../maintenance/models/unit-kerja.model'
import { ModalComponent } from '../modal/modal.component'
import { QRCodeModule } from 'angularx-qrcode'
import { SafeUrl } from '@angular/platform-browser'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
@Component({
  selector: 'app-ukom-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileHandlerComponent,
    ModalComponent,
    QRCodeModule,
    ConfirmationDialogComponent,
    FilePreviewComponent
  ],
  templateUrl: './ukom-register.component.html',
  styleUrl: './ukom-register.component.scss'
})
export class UkomRegisterComponent {
  nonJFForm: FormGroup

  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  pangkatList$: Observable<Pangkat[]>

  instansiSearch = new Subject<string>()
  instansiList$: Observable<Instansi[]>
  unitKerjaList$: Observable<UnitKerja[]>

  NextjabatanList$: Observable<Jabatan[]>

  nextJenjang: Jenjang
  detectedDokumen: any = {}
  pesertaUkom: PesertaUkom = new PesertaUkom()
  filteredInstansiList: any[] = []
  dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

  registerComplete: boolean = false

  myAngularxQrCode: string = ''
  stringCode: string = ''
  qrCodeDownloadLink: SafeUrl = ''
  inputs: FIleHandler = {
    files: {},
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

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.nonJFForm = new FormGroup({
      jenis_ukom: new FormControl('', Validators.required),
      nip: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{18}$/) // Ensures exactly 18 digits
      ]),
      nik: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{16}$/) // Ensures exactly 16 digits
      ]),
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/) // Ensures only numbers
      ]),
      tempatLahir: new FormControl('', Validators.required),
      tanggalLahir: new FormControl('', Validators.required),
      jenisKelaminCode: new FormControl('M', Validators.required),
      jabatanCode: new FormControl('', Validators.required),
      jenjangCode: new FormControl('', Validators.required),
      pangkatCode: new FormControl('', Validators.required),
      nextJabatanCode: new FormControl(''),
      nextJenjangCode: new FormControl(''),
      instansi_id: new FormControl(''),
      unit_kerja_id: new FormControl(''),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        this.passwordMatchValidator.bind(this)
      ])

      //   instansi_name: new FormControl('', Validators.required)
    })
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

  ngOnInit () {
    this.getListJabatan()
    // this.getListJenjang()
    // this.getListPanngkat()
    this.getListInstansi()

    this.instansiList$.subscribe(instansiList => {
      this.filteredInstansiList = instansiList
    })
  }

  filterInstansi (event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value // Get the input value
    console.log('Search Term:', searchTerm)

    // Subscribe to the instansiList$ observable to get the full list of instansi
    this.instansiList$.subscribe(instansiList => {
      if (searchTerm) {
        // Filter the list based on the search term
        this.filteredInstansiList = instansiList.filter(instansi =>
          instansi.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else {
        // If the search term is empty, reset the filtered list to the original list
        this.filteredInstansiList = instansiList
      }
      console.log('Filtered Instansi:', this.filteredInstansiList)
    })
  }

  onInstansiNameChange (name: string) {
    this.instansiSearch.next(name)
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

          console.log('Dokumen Persyaratan:', this.dokumenPersyaratanList)

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
        error: error => this.handlerService.handleException(error)
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

  getNextListJabatan (jenjangCode: string) {
    this.NextjabatanList$ = this.apiService
      .getData(`/api/v1/jabatan/jenjang/${jenjangCode}`)
      .pipe(
        map(response =>
          response.map(
            (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
          )
        )
      )
  }

  onJabatanSwitch (event: Event) {
    const jabatanCode = (event.target as HTMLSelectElement).value

    if (jabatanCode) {
      this.pesertaUkom.jabatanCode = jabatanCode
      this.getListJenjang(jabatanCode)
    }
  }

  getListJenjang (jabatanCode: string) {
    this.jenjangList$ = this.apiService
      .getData(`/api/v1/jenjang/jabatan/${jabatanCode}`)
      .pipe(
        map(response =>
          response.map(
            (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
          )
        )
      )
  }

  getListPanngkat (jenjangCode: string) {
    this.pangkatList$ = this.apiService
      .getData(`/api/v1/pangkat/jenjang/${jenjangCode}`)
      .pipe(
        map(response =>
          response.map(
            (pangkat: { [key: string]: any }) => new Pangkat(pangkat)
          )
        )
      )
  }

  getListInstansi (instasi_name: string = '') {
    this.instansiList$ = this.apiService
      //   .getData(
      //     `/api/v1/instansi/search?eq_name=Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten  Kaur`
      //   )
      .getData(`/api/v1/instansi`)
      .pipe(
        map(response =>
          response.map(
            (instansi: { [key: string]: any }) => new Instansi(instansi)
          )
        )
      )
  }

  getListUnitKerja (instansiId: string) {
    this.unitKerjaList$ = this.apiService
      .getData(`/api/v1/unit_kerja/instansi/${instansiId}`)
      .pipe(
        map(response =>
          response.map(
            (unitKerja: { [key: string]: any }) => new UnitKerja(unitKerja)
          )
        )
      )
  }

  getNextJenjang (jenjang_code: string) {
    if (jenjang_code) {
      this.apiService
        .getData(`/api/v1/jenjang/next/${jenjang_code}`)
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
    this.nonJFForm.get('nextJabatanCode')?.setValue('')
    this.nonJFForm.get('nextJenjangCode')?.setValue('')
    this.nonJFForm.get('jabatanCode')?.setValue('')
    this.nonJFForm.get('jenjangCode')?.setValue('')
    this.nonJFForm.get('pangkatCode')?.setValue('')

    if (jenis_ukom) {
      this.nonJFForm.patchValue({ jenis_ukom })
      this.pesertaUkom.jenis_ukom = jenis_ukom

      if (jenis_ukom == 'PERPINDAHAN_JABATAN') {
        this.getListJabatan()
        this.getDokumenPersyaratan(jenis_ukom)
      }

      if (jenis_ukom == 'PROMOSI') {
        // this.getNextJenjang()
        // this.nonJFForm.get('jenjangCode')?.setValue('JJ1')
        this.getDokumenPersyaratan(jenis_ukom)
      }
    }
  }

  onJenjangSwitch (event: Event) {
    const jenjangCode = (event.target as HTMLSelectElement).value

    if (jenjangCode) {
      this.pesertaUkom.jenjangCode = jenjangCode
      this.getNextListJabatan(jenjangCode)
      this.getListPanngkat(jenjangCode)
    }
    // this.getNextJenjang(jenjangCode)
  }

  onInstansiSwitch (event: Event) {
    const instansiId = (event.target as HTMLSelectElement).value
    console.log('instansiId', instansiId)

    if (instansiId) {
      this.pesertaUkom.instansi_id = instansiId
      this.nonJFForm.get('instansi_id')?.setValue(instansiId)
      this.getListUnitKerja(instansiId)
    }
  }

  onUnitKerjaSwitch (event: Event) {
    const unitKerjaId = (event.target as HTMLSelectElement).value

    if (unitKerjaId) {
      this.nonJFForm.get('unit_kerja_id')?.setValue(unitKerjaId)

      this.pesertaUkom.unit_kerja_id = unitKerjaId
    }
  }

  onChangeURL (url: SafeUrl) {
    this.qrCodeDownloadLink = url
  }

  submit () {
    console.log(this.nonJFForm.get('instansi_id')?.value)

    const jenis_ukom = this.nonJFForm.get('jenis_ukom')?.value
    this.pesertaUkom.jenis_ukom = jenis_ukom
    this.pesertaUkom.password = this.nonJFForm.get('password')?.value
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
    this.pesertaUkom.nextPangkatCode = this.nonJFForm.get('pangkatCode')?.value
    // this.pesertaUkom.instansi_id = this.nonJFForm.get('instansi_id')?.value
    // this.pesertaUkom.unit_kerja_id = this.nonJFForm.get('unit_kerja_id')?.value
    if (jenis_ukom === 'PERPINDAHAN_JABATAN') {
      this.pesertaUkom.nextJabatanCode =
        this.nonJFForm.get('nextJabatanCode')?.value
      this.pesertaUkom.nextJenjangCode =
        this.nonJFForm.get('jenjangCode')?.value
    }
    if (jenis_ukom === 'PROMOSI') {
      this.pesertaUkom.nextJenjangCode =
        this.nonJFForm.get('jenjangCode')?.value
      this.pesertaUkom.nextJabatanCode =
        this.nonJFForm.get('jabatanCode')?.value
    }

    // if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
    //   this.pesertaUkom.dokumenUkomList = []
    // }

    // for (const key in this.detectedDokumen) {
    //   if (this.detectedDokumen.hasOwnProperty(key)) {
    //     const detected = this.detectedDokumen[key]
    //     this.pesertaUkom.dokumenUkomList.push({
    //       dokumenFile: detected.base64,
    //       dokumenPersyaratanName:
    //         this.dokumenPersyaratanList.find(
    //           dokumen => dokumen.dokumenPersyaratanName == detected.label
    //         ).dokumenPersyaratanName +
    //         '_' +
    //         this.pesertaUkom.nip +
    //         '_' +
    //         Date.now(),
    //       dokumenPersyaratanId: detected.id
    //     })
    //   }
    // }

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

          // Store only the latest document for each dokumenPersyaratanId
          documentMap.set(detected.id, newDoc)
        }
      }
    }

    // Convert the Map values to an array and assign it to pesertaUkom.dokumenUkomList
    this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

    // if (this.nonJFForm.invalid) {
    //   this.handlerService.handleAlert('Error', 'Data belum lengkap')
    //   return
    // }

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

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
            },
            error: error => {
              console.log('error', error)
              this.handlerService.handleAlert(
                'Error',
                'Gagal mendaftar UKom, silahkan coba lagi'
              )
            }
          })
      },
      error: error => {
        console.log('error', error)
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }
}
