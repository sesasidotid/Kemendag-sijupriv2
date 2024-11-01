import { Component } from '@angular/core';
import { MapComponent } from '../../../modules/map-leaflet/components/map/map.component';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { FormsModule } from '@angular/forms';
import { Instansi } from '../../../modules/maintenance/models/instansi.model';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model';
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model';
import { CommonModule } from '@angular/common';
import { Wilayah } from '../../../modules/maintenance/models/wilayah.model';
import { TabService } from '../../../modules/base/services/tab.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ApiService } from '../../../modules/base/services/api.service';

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
    private apiService: ApiService,
    private tabService: TabService,
    private handlerService: HandlerService,
  ) { }

  ngOnInit() {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs();
    }

    this.tabService.addTab({
      label: 'Daftar Unit Kerja',
      onClick: () => this.handlerService.handleNavigate(`/maintenance/unit-kerja`),
    }).addTab({
      label: 'Tambah Unit Kerja',
      isActive: true,
      onClick: () => this.handlerService.handleNavigate(`/maintenance/unit-kerja/add`),
    });

    this.getInstansi();
  }

  onCoordinatesReceived(coordinates: { lat: number, lng: number }): void {
    this.unitKerja.latitude = coordinates.lat;
    this.unitKerja.longitude = coordinates.lng;
  }

  getWilayahList() {
    this.apiService.getData(`/api/v1/wilayah`).subscribe({
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
    this.apiService.getData(`/api/v1/instansi/${this.instansiId}`).subscribe({
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
    this.apiService.getData(`/api/v1/provinsi/${this.instansi.provinsiId}`).subscribe({
      next: (provinsi: Provinsi) => {
        this.provinsi = provinsi;
        this.unitKerja.wilayahCode = this.provinsi.wilayahCode;
        this.getWilayahList();
      }
    });
  }

  getKabKota() {
    let kabKotaId = this.instansi.kabupatenId ?? this.instansi.kotaId;
    this.apiService.getData(`/api/v1/kab_kota/${kabKotaId}`).subscribe({
      next: (kabKota: KabKota) => this.kabKota = kabKota
    });
  }

  submit() {
    this.apiService.postData(`/api/v1/unit_kerja`, this.unitKerja).subscribe({
      next: () => this.handlerService.handleNavigate('/maintenance/unit-kerja')
    })
  }
}
