import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { KompetensiUkom } from '../../../../modules/ukom/models/kompetensi'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model'

@Component({
  selector: 'app-ukom-kompetensi-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './ukom-kompetensi-add.component.html',
  styleUrl: './ukom-kompetensi-add.component.scss'
})
export class UkomKompetensiAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter()
  tab$ = new BehaviorSubject<number | null>(0)
  kompetensiForm: FormGroup
  submitLoading$ = new BehaviorSubject<boolean>(false)

  kompetensiData: KompetensiUkom = new KompetensiUkom()
  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  pangkatList$: Observable<Pangkat[]>

  constructor (
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.kompetensiForm = new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      jabatan_code: new FormControl('', Validators.required),
      jenjang_code: new FormControl('', Validators.required)
      //   bidang_jabatan_code: new FormControl('', Validators.required)
    })

    this.getJabatanList()
  }

  //   ngOnInit () {
  //     this.getJabatanList()
  //   }

  getJabatanList () {
    this.jabatanList$ = this.apiService
      .getData(`/api/v1/jabatan`)
      .pipe(
        map(response =>
          response.map(
            (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
          )
        )
      )

    this.jabatanList$.forEach(jabatanList => {
      console.log(jabatanList)
    })
  }

  onSwitchJabatan (event: Event) {
    const jabatanCode = (event.target as HTMLInputElement).value
    this.jenjangList$ = this.apiService
      .getData(`/api/v1/jenjang/jabatan/${jabatanCode}`)
      .pipe(
        map(response =>
          response.map(
            (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
          )
        )
      )

    this.jenjangList$.forEach(jenjangList => {
      console.log(jenjangList)
    })
  }

  onSwitchJenjang (event: Event) {
    const jenjangCode = (event.target as HTMLInputElement).value

    this.pangkatList$ = this.apiService
      .getData(`/api/v1/pangkat/jenjang/${jenjangCode}`)
      .pipe(
        map(response =>
          response.map(
            (pangkat: { [key: string]: any }) => new Pangkat(pangkat)
          )
        )
      )

    this.pangkatList$.forEach(pangkatList => {
      console.log(pangkatList)
    })
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.kompetensiData.code = this.kompetensiForm.get('code')?.value
        this.kompetensiData.name = this.kompetensiForm.get('name')?.value
        this.kompetensiData.jabatan_code =
          this.kompetensiForm.get('jabatan_code')?.value
        this.kompetensiData.jenjang_code =
          this.kompetensiForm.get('jenjang_code')?.value
        this.kompetensiData.bidang_jabatan_code = this.kompetensiForm.get(
          'bidang_jabatan_code'
        )?.value

        this.apiService
          .postData(`/api/v1/kompetensi`, this.kompetensiData)
          .subscribe({
            next: (response: any) => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )

              this.kompetensiForm.reset()
            },
            error: error => {
              this.handlerService.handleAlert('Error', 'Data gagal disimpan')
            }
          })
      }
    })
  }
}
