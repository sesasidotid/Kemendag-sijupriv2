import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { Instrument } from '../../../modules/akp/models/instrument.model';
import { KategoriInstrument } from '../../../modules/akp/models/kategori-instrument.model';
import { Pertanyaan } from '../../../modules/akp/models/pertanyaan.model';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { TabService } from '../../../modules/base/services/tab.service';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-kkn-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kkn-add.component.html',
  styleUrl: './kkn-add.component.scss'
})
export class KknAddComponent {
  instrumentList: Instrument[] = [];
  kategoriInstrument: KategoriInstrument = new KategoriInstrument();

  constructor(
    private tabService: TabService,
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar KKN',
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() + `/akp/kkn`]),
    }).addTab({
      label: 'Tambah KKN',
      isActive: true,
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() + `/akp/kkn/add`]),
    });

    this.getInstrumenList();
  }

  getInstrumenList() {
    this.apiService.getData('/api/v1/instrument').subscribe({
      next: (response) => {
        this.instrumentList = response.map((instrument: { [key: string]: any; }) => new Instrument(instrument));
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', "Terjadi Masalah");
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

        this.apiService.postData('/api/v1/kategori_instrument', this.kategoriInstrument).subscribe({
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
