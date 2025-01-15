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
import { TabService } from '../../../../modules/base/services/tab.service'
import { Router, RouterLink } from '@angular/router'

@Component({
  selector: 'app-ukom-class-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-class-add.component.html',
  styleUrl: './ukom-class-add.component.scss'
})
export class UkomClassAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter()

  tab$ = new BehaviorSubject<number | null>(0)

  kelasForm: FormGroup
  submitLoading$ = new BehaviorSubject<boolean>(false)

  //change after api integration
  kelasData: any = []
  pengawasKelasList: any[] = [
    { id: 1, nama: 'Pengawas 1' },
    { id: 2, nama: 'Pengawas 2' }
  ]

  constructor (
    private confirmationService: ConfirmationService,
    private tabService: TabService,
    private router: Router
  ) {
    this.kelasForm = new FormGroup({
      tempat: new FormControl('', [Validators.required]),
      tanggal: new FormControl('', [Validators.required]),
      jam: new FormControl('', [Validators.required]),
      'pengawas kelas': new FormControl('', [Validators.required])
    })
  }

  ngOnInit () {
    // if (this.tabService.getTabsLength() > 0) {
    //   this.tabService.clearTabs()
    // }
    // this.tabService
    //   .addTab({
    //     label: 'Daftar Kelas',
    //     icon: 'mdi-list-box',
    //     onClick: () => this.handleTabChange(0)
    //   })
    //   .addTab({
    //     label: 'Tambah Kelas',
    //     isActive: true,
    //     icon: 'mdi-plus-circle',
    //     onClick: () => this.handleTabChange(1)
    //   })
  }

  //   handleTabChange (tab?: number) {
  //     this.tab$.next(tab)
  //     this.tabService.changeTabActive(tab)
  //   }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        this.submitLoading$.next(true),
          (this.kelasData.tempat = this.kelasForm.get('tempat')?.value),
          (this.kelasData.tanggal = this.kelasForm.get('tanggal')?.value),
          (this.kelasData.jam = this.kelasForm.get('jam')?.value),
          (this.kelasData.pengawas = this.kelasForm.get('pengawas')?.value)

        console.log(this.kelasData)

        setTimeout(() => {
          this.submitLoading$.next(false)
          this.router.navigate(['/ukom/ukom-periode'])
        }, 2000)
      }
    })
  }
}
