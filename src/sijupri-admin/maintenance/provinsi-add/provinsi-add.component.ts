import { Component, EventEmitter, Output } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { TabService } from '../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { InstasiAddComponent } from '../instasi-add/instasi-add.component'
import { CommonModule } from '@angular/common'
import { Wilayah } from '../../../modules/maintenance/models/wilayah.model'
import {
    Form,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { MapComponent } from '../../../modules/map-leaflet/components/map/map.component'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { FormValidationService } from '../../../modules/base/services/form-validation.service'

@Component({
    selector: 'app-provinsi-add',
    standalone: true,
    imports: [
        PagableComponent,
        MapComponent,
        FormsModule,
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './provinsi-add.component.html',
    styleUrl: './provinsi-add.component.scss'
})
export class ProvinsiAddComponent {
    @Output() changeTabActive: EventEmitter<any> = new EventEmitter()
    tab$ = new BehaviorSubject<number | null>(0)
    submitLoading$ = new BehaviorSubject<boolean>(false)

    wilayahList: Wilayah[] = []
    provinsi: Provinsi = new Provinsi()

    addProvinsiForm!: FormGroup
    isLoading$ = new BehaviorSubject<boolean>(false)
    constructor(
        private router: Router,
        private tabService: TabService,
        private handlerService: HandlerService,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService
    ) { }

    ngOnInit() {
        this.handleFormInit()
        this.getWilayahList()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(this.addProvinsiForm.get(controlName), controlName, label);
    }

    handleFormInit() {
        this.addProvinsiForm = new FormGroup({
            name: new FormControl('', Validators.required),
            wilayah_code: new FormControl('', Validators.required),
            latitude: new FormControl('', Validators.required),
            longitude: new FormControl('', Validators.required)
        })
    }

    onCoordinatesReceived(coordinates: { lat: number; lng: number }): void {
        this.addProvinsiForm.patchValue({
            latitude: coordinates.lat.toString(),
            longitude: coordinates.lng.toString()
        })
    }

    getWilayahList() {
        this.apiService.getData(`/api/v1/wilayah`).subscribe({
            next: (wilayahList: Wilayah[]) => {
                this.wilayahList = wilayahList
                console.log(this.wilayahList)
            }
        })
    }

    submit() {
        if (this.addProvinsiForm.valid) {

            this.confirmationService.open(false).subscribe({
                next: result => {
                    if (!result.confirmed) {
                        return
                    }

                    this.isLoading$.next(true)

                    this.provinsi.name = this.addProvinsiForm.value.name
                    this.provinsi.wilayah_code = this.addProvinsiForm.value.wilayah_code
                    this.provinsi.latitude = this.addProvinsiForm.value.latitude
                    this.provinsi.longitude = this.addProvinsiForm.value.longitude

                    this.apiService
                        .postData(`/api/v1/provinsi`, this.provinsi)
                        .subscribe({
                            next: () => {
                                this.isLoading$.next(false)
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Provinsi berhasil ditambahkan'
                                )
                                this.addProvinsiForm.reset()
                                this.provinsi = new Provinsi()
                                this.changeTabActive.emit(0)
                            },
                            error: error => {
                                this.isLoading$.next(false)
                                this.handlerService.handleAlert(
                                    'Error',
                                    'Gagal menambahkan provinsi'
                                )
                                console.log(error)
                            }
                        })
                }
            })
        }
    }
}
