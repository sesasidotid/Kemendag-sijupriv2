import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { KategoriInstrument } from '../../../modules/akp/models/kategori-instrument.model';
import { Pertanyaan } from '../../../modules/akp/models/pertanyaan.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-kkn-detail',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './kkn-detail.component.html',
  styleUrl: './kkn-detail.component.scss'
})
export class KknDetailComponent {
  kategoriInstrument: KategoriInstrument = new KategoriInstrument();
  id: string;
  isEdit = false;

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
  }

  ngOnInit() {
    this.getKategoriInstrument();
  }

  getKategoriInstrument() {
    this.apiService.getData(`/api/v1/kategori_instrument/${this.id}`).subscribe({
      next: (response) => {
        this.kategoriInstrument = new KategoriInstrument(response);
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', "Terjadi Masalah");
      }
    });
  }

  add() {
    this.kategoriInstrument.pertanyaanList.push(new Pertanyaan());
  }

  remove(index: number) {
    this.kategoriInstrument.pertanyaanList.splice(index, 1);
  }

  delete() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.deleteData(`/api/v1/kategori_instrument/${this.id}`).subscribe({
          next: () => this.router.navigate([LoginContext.getUserLoginRoute() + '/akp/kkn']),
          error: (error) => {
            console.error('Error fetching data', error);
            this.alertService.showToast('Error', "Terjadi Masalah");
          },
        })
      }
    })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.putData('/api/v1/kategori_instrument', this.kategoriInstrument).subscribe({
          next: () => this.router.navigate([LoginContext.getUserLoginRoute() + '/akp/kkn']),
          error: (error) => {
            console.error('Error fetching data', error);
            this.alertService.showToast('Error', "Terjadi Masalah");
          },
        })
      }
    })
  }
}
