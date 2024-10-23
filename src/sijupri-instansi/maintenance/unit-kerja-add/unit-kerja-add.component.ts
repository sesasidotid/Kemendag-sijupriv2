import { Component } from '@angular/core';
import { MapComponent } from '../../../modules/map-leaflet/components/map/map.component';
import { UnitKerjaService } from '../../../modules/maintenance/services/unit-kerja.service';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { FormsModule } from '@angular/forms';
import { InstansiService } from '../../../modules/maintenance/services/instansi.service';
import { Instansi } from '../../../modules/maintenance/models/instansi.model';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { ProvinsiService } from '../../../modules/maintenance/services/provinsi.service';
import { KabKotaService } from '../../../modules/maintenance/services/kab-kota.service';
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model';
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WilayahService } from '../../../modules/maintenance/services/wilayah.service';
import { Wilayah } from '../../../modules/maintenance/models/wilayah.model';

@Component({
  selector: 'app-unit-kerja-add',
  standalone: true,
  imports: [MapComponent, FormsModule, CommonModule],
  templateUrl: './unit-kerja-add.component.html',
  styleUrl: './unit-kerja-add.component.scss'
})
export class UnitKerjaAddComponent {
  instansiId: string = LoginContext.getInstansiId();
  unitKerja: UnitKerja = new UnitKerja();
  wilayahList: Wilayah[] = [];
  instansi: Instansi;
  provinsi: Provinsi;
  kabKota: KabKota;

  constructor(
    private unitKerjaService: UnitKerjaService,
    private instansiService: InstansiService,
    private provinsiService: ProvinsiService,
    private kabKotaService: KabKotaService,
    private wilayahService: WilayahService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getInstansi();
  }

  onCoordinatesReceived(coordinates: { lat: number, lng: number }): void {
    this.unitKerja.latitude = coordinates.lat;
    this.unitKerja.longitude = coordinates.lng;
  }

  getWilayahList() {
    this.wilayahService.findAll().subscribe({
      next: (wilayahList: Wilayah[]) => {
        wilayahList.forEach(wilayah => {
          if (['WL7', 'WL8', 'WL9'].includes(wilayah.code) || wilayah.code == this.provinsi.wilayahCode) {
            this.wilayahList.push(wilayah);
          }
        });
      }
    })
  }

  getInstansi() {
    this.instansiService.findById(this.instansiId).subscribe({
      next: (instansi: Instansi) => {
        this.instansi = instansi;
        this.unitKerja.instansiId = this.instansi.id;
        if (this.instansi.provinsiId) {
          if (this.instansi.provinsiId) {
            this.getProvinsi();
          }
          if (this.instansi.kabupatenId || this.instansi.kotaId) {
            this.getKabKota();
          }
        }
      }
    });
  }

  getProvinsi() {
    this.provinsiService.findById(this.instansi.provinsiId).subscribe({
      next: (provinsi: Provinsi) => {
        this.provinsi = provinsi;
        this.unitKerja.wilayahCode = this.provinsi.wilayahCode;
        this.getWilayahList();
      }
    });
  }

  getKabKota() {
    let kabKotaId = this.instansi.kabupatenId ?? this.instansi.kotaId;
    this.kabKotaService.findById(kabKotaId).subscribe({
      next: (kabKota: KabKota) => this.kabKota = kabKota
    });
  }

  submit() {
    this.unitKerjaService.save(this.unitKerja).subscribe({
      next: () => this.router.navigate(['/maintenance/unit-kerja'])
    })
  }
}
