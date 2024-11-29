import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { KategoriInstrument } from '../../../modules/akp/models/kategori-instrument.model';
import { Pertanyaan } from '../../../modules/akp/models/pertanyaan.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { LucideAngularModule, FilePlus  } from 'lucide-angular';
import { PelatihanTeknis } from '../../../modules/akp/models/pelatihan-teknis.model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-kkn-detail',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './kkn-detail.component.html',
  styleUrl: './kkn-detail.component.scss'
})
export class KknDetailComponent {
  kategoriInstrument: KategoriInstrument = new KategoriInstrument();
  pelatihanList: PelatihanTeknis[] = [];
  id: string;
  isEdit = false;

  kknForm: FormGroup;

  submitLoading$ = new BehaviorSubject<boolean>(false);
  kategoriInstrumentLoading$ = new BehaviorSubject<boolean>(false);

  readonly filePlus = FilePlus;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id');
    });

    this.kknForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      pelatihanTeknisId: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    this.getKategoriInstrument();
  }

  getKategoriInstrument() {
    this.kategoriInstrumentLoading$.next(true);
    this.apiService.getData(`/api/v1/kategori_instrument/${this.id}`).subscribe({
      next: (response) => {
        this.kategoriInstrument = new KategoriInstrument(response);
        this.getPelatihanList(this.kategoriInstrument.instrumentId);
        this.kknForm.get('name').patchValue(this.kategoriInstrument.name);
        this.kknForm.get('pelatihanTeknisId').patchValue(this.kategoriInstrument.pelatihanTeknisId);
        this.kategoriInstrumentLoading$.next(false);
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', "Galat saat mengambil data kategori instrument!");
        this.kategoriInstrumentLoading$.next(false);
      }
    });
  }

  getPelatihanList(instrumentId: string) {
    this.apiService.getData(`/api/v1/akp_pelatihan_teknis/instrument/${instrumentId}`).subscribe({
      next: (response) => {
        this.pelatihanList = response.map((pelatihan: { [key: string]: any; }) => new PelatihanTeknis(pelatihan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data pelatihan!");
      }
    })
  }

  backToList() {
    this.router.navigate(['/akp/kkn'])
  }

  add() {
    this.kategoriInstrument.pertanyaanList.push(new Pertanyaan());
  }

  remove(index: number) {
    this.kategoriInstrument.pertanyaanList.splice(index, 1);
  }

  onDelete() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.deleteData(`/api/v1/kategori_instrument/${this.id}`).subscribe({
          next: () => {
            this.router.navigate(['/akp/kkn'])
            this.alertService.showToast('Success', "Berhasil menghapus kategori instrument!");
          },
          error: (error) => {
            console.error('Error fetching data', error);
            this.alertService.showToast('Error', "Gagal menghapus kategori instrument!");
          },
        })
      }
    })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.kategoriInstrument.name = this.kknForm.get('name')?.value;
        this.kategoriInstrument.pelatihanTeknisId = this.kknForm.get('pelatihanTeknisId')?.value;

        this.apiService.putData('/api/v1/kategori_instrument', this.kategoriInstrument).subscribe({
          next: () => {
            this.router.navigate(['/akp/kkn'])
            this.alertService.showToast('Success', "Berhasil mengubah kategori instrument!");
          },
          error: (error) => {
            console.error('Error fetching data', error);
            this.alertService.showToast('Error', "Gagal mengubah kategori instrument!");
          },
        })
      }
    })
  }
}
