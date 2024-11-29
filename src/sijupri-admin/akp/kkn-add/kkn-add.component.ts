import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { Instrument } from '../../../modules/akp/models/instrument.model';
import { KategoriInstrument } from '../../../modules/akp/models/kategori-instrument.model';
import { Pertanyaan } from '../../../modules/akp/models/pertanyaan.model';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { TabService } from '../../../modules/base/services/tab.service';
import { LucideAngularModule, FilePlus } from 'lucide-angular';
import { BehaviorSubject } from 'rxjs';
import { PelatihanTeknis } from '../../../modules/akp/models/pelatihan-teknis.model';

@Component({
  selector: 'app-kkn-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './kkn-add.component.html',
  styleUrl: './kkn-add.component.scss'
})
export class KknAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter();

  instrumentList: Instrument[] = [];
  pelatihanList: PelatihanTeknis[] = [];
  kategoriInstrument: KategoriInstrument = new KategoriInstrument();

  kknForm: FormGroup;

  submitLoading$ = new BehaviorSubject<boolean>(false);
  instrumentListLoading$ = new BehaviorSubject<boolean>(false);
  pelatihanListLoading$ = new BehaviorSubject<boolean>(false);

  readonly filePlus = FilePlus;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.kknForm = new FormGroup({
      instrumentId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      pelatihanTeknisId: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    this.getInstrumenList();

    this.kknForm.get('instrumentId').valueChanges.subscribe(instrumentId => {
      if (instrumentId) {
        this.getPelatihanList(instrumentId);
      } else {
        this.pelatihanList = []; // Clear jenjang list if no jabatan selected
        this.kknForm.get('pelatihanTeknisId').setValue('');
      }
    });
  }

  getPelatihanList(instrumentId: string) {
    this.pelatihanListLoading$.next(true);
    this.apiService.getData(`/api/v1/akp_pelatihan_teknis/instrument/${instrumentId}`).subscribe({
      next: (response) => {
        this.pelatihanList = response.map((pelatihan: { [key: string]: any; }) => new PelatihanTeknis(pelatihan))
        this.pelatihanListLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data pelatihan!");
        this.pelatihanListLoading$.next(false);
      }
    })
  }

  getInstrumenList() {
    this.instrumentListLoading$.next(true);
    this.apiService.getData('/api/v1/instrument').subscribe({
      next: (response) => {
        this.instrumentList = response.map((instrument: { [key: string]: any; }) => new Instrument(instrument));
        this.instrumentListLoading$.next(false);
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', "Gagal mendapatkan data instrumen!");
        this.instrumentListLoading$.next(false);
      }
    })
  }

  add() {
    this.kategoriInstrument.pertanyaanList.push(new Pertanyaan());
  }

  remove(index: number) {
    this.kategoriInstrument.pertanyaanList.splice(index, 1);
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;
        this.submitLoading$.next(true);
        this.kategoriInstrument.instrumentId = this.kknForm.get('instrumentId')?.value;
        this.kategoriInstrument.name = this.kknForm.get('name')?.value;
        this.kategoriInstrument.pelatihanTeknisId = this.kknForm.get('pelatihanTeknisId')?.value;
        console.log(this.kategoriInstrument)

        this.apiService.postData('/api/v1/kategori_instrument', this.kategoriInstrument).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil menambahkan KKN");
            this.submitLoading$.next(false);
            setTimeout(() => {
              // this.router.navigate(['/akp/kkn'])
              this.changeTabActive.emit();
            }, 500)
          },
          error: (error) => {
            console.error('Error fetching data', error);
            this.alertService.showToast('Error', "Gagal menambahkan KKN");
            this.submitLoading$.next(false);
          },
        })
      }
    })
  }
}
