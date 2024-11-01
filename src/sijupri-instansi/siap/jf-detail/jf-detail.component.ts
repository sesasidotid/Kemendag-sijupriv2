import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { JfService } from '../../../modules/siap/services/jf.service';
import { JF } from '../../../modules/siap/models/jf.model';
import { CommonModule } from '@angular/common';
import { RwPendidikanListComponent } from '../../../sijupri-jf/siap/rw-pendidikan/rw-pendidikan-list/rw-pendidikan-list.component';
import { RwPangkatListComponent } from '../../../sijupri-jf/siap/rw-pangkat/rw-pangkat-list/rw-pangkat-list.component';
import { RwJabatanListComponent } from '../../../sijupri-jf/siap/rw-jabatan/rw-jabatan-list/rw-jabatan-list.component';
import { RwKinerjaListComponent } from '../../../sijupri-jf/siap/rw-kinerja/rw-kinerja-list/rw-kinerja-list.component';
import { RwKompetensiListComponent } from '../../../sijupri-jf/siap/rw-kompetensi/rw-kompetensi-list/rw-kompetensi-list.component';
import { RwSertifikasiListComponent } from '../../../sijupri-jf/siap/rw-sertifikasi/rw-sertifikasi-list/rw-sertifikasi-list.component';

@Component({
  selector: 'app-jf-detail',
  standalone: true,
  imports: [
    RwPendidikanListComponent,
    RwPangkatListComponent,
    RwJabatanListComponent,
    RwKinerjaListComponent,
    RwKompetensiListComponent,
    RwSertifikasiListComponent,
    CommonModule
  ],
  templateUrl: './jf-detail.component.html',
  styleUrl: './jf-detail.component.scss'
})
export class JfDetailComponent {
  nip: string;
  jf: JF = new JF();

  constructor(
    private jfService: JfService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.nip = params.get('id');
    });
    this.getJF();
  }

  getJF() {
    this.jfService.findByNip(this.nip).subscribe({
      next: (jf: JF) => this.jf = jf,
    })
  }
}
