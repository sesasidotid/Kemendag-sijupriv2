import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model';
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-pak-detail-child',
  standalone: true,
  imports: [CommonModule, FileHandlerComponent],
  templateUrl: './pak-detail-child.component.html',
  styleUrl: './pak-detail-child.component.scss'
})
export class PakDetailChildComponent {
  rwKinerja: RWKinerja = new RWKinerja();

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      var id = params.get('rwKinerjaId')
      this.getRWKinerja(id);
    });
  }

  getRWKinerja(id: string) {
    this.apiService.getData(`/api/v1/rw_kinerja/${id}`).subscribe({
      next: (response) => {
        this.rwKinerja = new RWKinerja(response);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data riwayat");
      }
    })
  }
}
