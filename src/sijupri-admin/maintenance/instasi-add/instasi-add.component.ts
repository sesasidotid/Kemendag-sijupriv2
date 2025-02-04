import { Component, EventEmitter, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { LucideAngularModule } from 'lucide-angular'
import { map, filter } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { ApiService } from '../../../modules/base/services/api.service'
@Component({
  selector: 'app-instasi-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './instasi-add.component.html',
  styleUrl: './instasi-add.component.scss'
})
export class InstasiAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter()
  provinsiList$: Observable<Provinsi[]>
  kabKotaList$: Observable<KabKota[]>

  addInstasiForm: FormGroup
  constructor (private apiService: ApiService) {
    this.addInstasiForm = new FormGroup({
      instansi_type_code: new FormControl('', Validators.required),
      provinsi_id: new FormControl(''),
      kab_kota_id: new FormControl('')
    })
  }

  ngOnInit () {
    this.getListProvinsi()
  }

  getListProvinsi () {
    this.provinsiList$ = this.apiService
      .getData(`/api/v1/provinsi/search?limit=10000`)
      .pipe(
        map(response =>
          response.data.map(
            (provinsi: { [key: string]: any }) => new Provinsi(provinsi)
          )
        )
      )
  }

  onProvinsiSwitch (event: Event) {
    const provinsiId = (event.target as HTMLSelectElement).value

    if (provinsiId) {
      this.getKabKotaList(provinsiId)
    }
  }

  getKabKotaList (provinsiId: string) {
    this.kabKotaList$ = this.apiService
      .getData(
        `/api/v1/kab_kota/search?eq_provinsi|id=${provinsiId}&limit=10000`
      )
      .pipe(
        map(response =>
          response.data.map(
            (kabKota: { [key: string]: any }) => new KabKota(kabKota)
          )
        )
      )
  }

  submit () {}
}
