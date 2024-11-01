import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RwJabatanListComponent } from '../rw-jabatan-list/rw-jabatan-list.component';
import { RwPendidikanListComponent } from '../rw-pendidikan-list/rw-pendidikan-list.component';
import { RwPangkatListComponent } from '../rw-pangkat-list/rw-pangkat-list.component';
import { RwKinerjaListComponent } from '../rw-kinerja-list/rw-kinerja-list.component';
import { RwKompetensiListComponent } from '../rw-kompetensi-list/rw-kompetensi-list.component';
import { RwSertifikasiListComponent } from '../rw-sertifikasi-list/rw-sertifikasi-list.component';
import { JfService } from '../../../modules/siap/services/jf.service';
import { JF } from '../../../modules/siap/models/jf.model';
import { CommonModule } from '@angular/common';

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
