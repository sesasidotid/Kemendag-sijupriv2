import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { BehaviorSubject } from 'rxjs'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Router } from '@angular/router'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { ConfirmationDialogComponent } from '../../../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { map, filter } from 'rxjs/operators'
import { Observable, of, Subject } from 'rxjs'
import { HandlerService } from '../../../../modules/base/services/handler.service'
@Component({
  selector: 'app-ukom-formula-list',
  standalone: true,
  imports: [
    CommonModule,
    PagableComponent,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule,
    ConfirmationDialogComponent
  ],
  templateUrl: './ukom-formula-list.component.html',
  styleUrl: './ukom-formula-list.component.scss'
})
export class UkomFormulaListComponent {
  pagable$ = new BehaviorSubject<Pagable | null>(null)
  isModalOpen$ = new BehaviorSubject<boolean>(false)

  editFormulaForm: FormGroup
  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  refreshToggle: boolean = false

  constructor (
    private apiService: ApiService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService
  ) {
    this.pagable$.next(
      new PagableBuilder('/api/v1/ukom_formula/search')

        .addPrimaryColumn(
          new PrimaryColumnBuilder('Jabatan', 'jabatanName').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Jenjang', 'jenjangName').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('CAT', 'catPercentage').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Wawancara', 'wawancaraPercentage').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Seminar', 'seminarPercentage').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Praktik', 'praktikPercentage').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Portofolio', 'portofolioPercentage').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('UKT', 'uktPercentage').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('UKMS', 'ukmskPercentage').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder(
            'Ambang Batas Nilai',
            'gradeThreshold'
          ).build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Ambang Batas UKT', 'uktThreshold').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Ambang Batas JPM', 'jpmThreshold').build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((data: any) => {
              this.setDefaultFormValues(data)

              this.toggleModal()
            }, 'primary')
            .withIcon('update')
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((data: any) => {
              this.router.navigate([`ukom/ukom-formula/${data.id}`])
            }, 'info')
            .withIcon('detail')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('jabatan|name')
            .withField('Jabatan', 'text')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('Jenjang|name')
            .withField('Jenjang', 'text')
            .build()
        )
        .build()
    )

    this.editFormulaForm = new FormGroup({
      id: new FormControl(''),
      //   jabatan_code: new FormControl('', Validators.required),
      //   jenjang_code: new FormControl('', Validators.required),
      cat_percentage: new FormControl('', Validators.required),
      wawancara_percentage: new FormControl('', Validators.required),
      seminar_percentage: new FormControl('', Validators.required),
      praktik_percentage: new FormControl('', Validators.required),
      portofolio_percentage: new FormControl('', Validators.required),
      ukt_percentage: new FormControl('', Validators.required),
      ukmsk_percentage: new FormControl('', Validators.required),
      //   jpm_percentage: new FormControl('', Validators.required),
      grade_threshold: new FormControl('', Validators.required),
      ukt_threshold: new FormControl('', Validators.required),
      jpm_threshold: new FormControl('', Validators.required)
    })

    this.getListJabatan()
    this.getListJenjang()
  }

  setDefaultFormValues (data: any) {
    console.log('data', data)
    this.editFormulaForm.patchValue({
      id: data.id || '',
      jabatan_code: data.jabatanCode || '',
      jenjang_code: data.jenjangCode || '',
      cat_percentage: data.catPercentage || '',
      wawancara_percentage: data.wawancaraPercentage || '',
      seminar_percentage: data.seminarPercentage || '',
      praktik_percentage: data.praktikPercentage || '',
      portofolio_percentage: data.portofolioPercentage || '',
      ukt_percentage: data.uktPercentage || '',
      ukmsk_percentage: data.ukmskPercentage || '',
      //   jpm_percentage: data.jpmPercentage || '',
      grade_threshold: data.gradeThreshold || '',
      ukt_threshold: data.uktThreshold || '',
      jpm_threshold: data.jpmThreshold || ''
    })
  }

  handleRefreshToggle () {
    this.refreshToggle = !this.refreshToggle
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
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

    this.jabatanList$.forEach(data => {
      console.log('jabatan', data)
    })
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
    this.jenjangList$.forEach(data => {
      console.log('jenjang', data)
    })
  }

  submit () {
    const payload = {
      id: this.editFormulaForm.value.id,
      //   jabatan_code: this.editFormulaForm.value.jabatan_code,
      //   jenjang_code: this.editFormulaForm.value.jenjang_code,
      cat_percentage: this.editFormulaForm.value.cat_percentage,
      wawancara_percentage: this.editFormulaForm.value.wawancara_percentage,
      seminar_percentage: this.editFormulaForm.value.seminar_percentage,
      praktik_percentage: this.editFormulaForm.value.praktik_percentage,
      portofolio_percentage: this.editFormulaForm.value.portofolio_percentage,
      ukt_percentage: this.editFormulaForm.value.ukt_percentage,
      ukmsk_percentage: this.editFormulaForm.value.ukmsk_percentage,
      //   jpm_percentage: this.editFormulaForm.value.jpm_percentage,
      grade_threshold: this.editFormulaForm.value.grade_threshold,
      ukt_threshold: this.editFormulaForm.value.ukt_threshold,
      jpm_threshold: this.editFormulaForm.value.jpm_threshold
    }
    this.confirmationService.open(false).subscribe({
      next: (response: { confirmed: boolean }) => {
        if (!response.confirmed) {
          return
        }

        console.log('payload', payload)
        this.apiService.putData('/api/v1/ukom_formula', payload).subscribe({
          next: () => {
            this.handlerService.handleAlert('Success', 'Data berhasil disimpan')
            this.toggleModal()
            this.handleRefreshToggle()
          },
          error: error => {
            console.log('error', error.error.message)
            this.handlerService.handleAlert(
              'Error',
              'Gagal mengubah data, silahkan coba lagi'
            )
          }
        })
      }
    })
  }
}
