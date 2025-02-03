import { ApiService } from './../../../modules/base/services/api.service'
import { Component, AfterViewInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import * as L from 'leaflet'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { AvailableFormasiInMap } from '../../../modules/formasi/models/map/available-map'
import { Observable, map } from 'rxjs'
@Component({
  selector: 'app-formasi-pemetaan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formasi-pemetaan.component.html',
  styleUrl: './formasi-pemetaan.component.scss'
})
export class FormasiPemetaanComponent {
  map!: L.Map
  provinceContainedData: Provinsi[] = []
  kabKotaData: KabKota[] = []
  unitKerjaData: UnitKerja[] = []

  private markerIcon = L.icon({
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  //   availableFormation$: Observable<AvailableFormasiInMap[]>
  availableFormation: AvailableFormasiInMap[] = [] // Add this line

  untuK: string = ''

  private provinceLayerGroup = L.layerGroup()
  private kabKotaLayerGroup = L.layerGroup()
  private unitKerjaLayerGroup = L.layerGroup()

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.getProvince()
  }

  ngOnInit (): void {}

  //   getProvinceAvailableFormation (provinsi_id: string): void {
  //     this.apiService
  //       .getData(`/api/v1/formasi/calculate/provinsi/${provinsi_id}`)
  //       .pipe(
  //         map(response =>
  //           response.map(
  //             (formation: AvailableFormasiInMap) =>
  //               new AvailableFormasiInMap(formation)
  //           )
  //         )
  //       )
  //   }

  getProvinceAvailableFormation (
    provinsi_id: string
  ): Observable<AvailableFormasiInMap[]> {
    return this.apiService
      .getData(`/api/v1/formasi/calculate/provinsi/${provinsi_id}`)
      .pipe(
        map(response =>
          response.map(
            (formation: AvailableFormasiInMap) =>
              new AvailableFormasiInMap(formation)
          )
        )
      )
  }

  getKabKotaAvailableFormation (
    kabkota_id: string
  ): Observable<AvailableFormasiInMap[]> {
    return this.apiService
      .getData(`/api/v1/formasi/calculate/kab_kota/${kabkota_id}`)
      .pipe(
        map(response =>
          response.map(
            (formation: AvailableFormasiInMap) =>
              new AvailableFormasiInMap(formation)
          )
        )
      )
  }

  getUnitKerjaAvailableFormation (
    unit_kerja_id: string
  ): Observable<AvailableFormasiInMap[]> {
    return this.apiService
      .getData(`/api/v1/formasi/calculate/unit_kerja/${unit_kerja_id}`)
      .pipe(
        map(response =>
          response.map(
            (formation: AvailableFormasiInMap) =>
              new AvailableFormasiInMap(formation)
          )
        )
      )
  }

  getProvince (isReset?: boolean): void {
    this.apiService.getData(`/api/v1/provinsi/search?limit=100`).subscribe({
      next: response => {
        this.provinceContainedData = response.data
        if (!isReset) {
          this.initMap()
        }
        this.addProvinceMarkers()
      }
    })
  }

  toTitleCase (str: string) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    )
  }

  addProvinceMarkers (): void {
    this.provinceContainedData.forEach(province => {
      const marker = L.marker(
        [parseFloat(province.latitude), parseFloat(province.longitude)],
        { icon: this.markerIcon }
      ).addTo(this.provinceLayerGroup)

      marker.bindPopup(
        `<b>${province.name}</b><br><br><button id="select-province-${province.id}" class="btn btn-soft-primary">Detail</button>`
      )

      marker.on('popupopen', () => {
        this.getProvinceAvailableFormation(province.id).subscribe(response => {
          this.availableFormation = response // Store the response
        })

        this.untuK = this.toTitleCase(province.name)

        document
          .getElementById(`select-province-${province.id}`)
          ?.addEventListener('click', () =>
            this.selectProvince(province.id, marker)
          )
      })
    })

    this.provinceLayerGroup.addTo(this.map)
  }

  selectProvince (provinsiId: string, marker: L.Marker): void {
    this.apiService
      .getData(
        `/api/v1/kab_kota/search?eq_provinsiId=${provinsiId}&limit=10000`
      )
      .subscribe({
        next: response => {
          this.kabKotaData = response.data
          this.map.setView(marker.getLatLng(), 8) // Zoom into province
          this.removeLayers(this.provinceLayerGroup, this.unitKerjaLayerGroup) // Remove kabKota and unitKerja markers
          this.addKabKotaMarkers()
        }
      })
  }

  addKabKotaMarkers (): void {
    this.kabKotaData.forEach(city => {
      const marker = L.marker(
        [parseFloat(city.latitude), parseFloat(city.longitude)],
        { icon: this.markerIcon }
      ).addTo(this.kabKotaLayerGroup)

      marker.bindPopup(
        `<b>${city.name}</b><br><button id="select-kabkota-${city.id}" class="btn btn-soft-primary">Detail</button>`
      )

      //   marker.on('click', () => this.selectCity(city.id, marker))
      marker.on('popupopen', () => {
        this.getKabKotaAvailableFormation(city.id).subscribe(response => {
          this.availableFormation = response
        })

        this.untuK = this.toTitleCase(city.name)

        document
          .getElementById(`select-kabkota-${city.id}`)
          ?.addEventListener('click', () => this.selectCity(city.id, marker))
      })
    })

    this.kabKotaLayerGroup.addTo(this.map)
  }

  selectCity (cityId: string, marker: L.Marker): void {
    this.apiService
      .getData(
        `/api/v1/unit_kerja/search?eq_instansi|kabupatenId=${cityId}&limit=10000`
      )
      .subscribe({
        next: response => {
          this.unitKerjaData = response.data

          if (this.unitKerjaData.length === 0) {
            this.handlerService.handleAlert('Info', 'Data tidak ditemukan')
            return
          }
          this.map.setView(marker.getLatLng(), 10) // Zoom into city
          this.removeLayers(this.provinceLayerGroup, this.kabKotaLayerGroup) // Remove province and unitKerja markers
          this.addUnitKerjaMarkers()
        }
      })
  }

  addUnitKerjaMarkers (): void {
    this.unitKerjaData.forEach(unitkerja => {
      const marker = L.marker([unitkerja.latitude, unitkerja.longitude], {
        icon: this.markerIcon,
        layerType: 'unitkerja'
      } as CustomMarkerOptions).addTo(this.unitKerjaLayerGroup)

      marker.bindPopup(`<b>${unitkerja.name}</b>`)

      marker.on('popupopen', () => {
        this.getUnitKerjaAvailableFormation(unitkerja.id).subscribe(
          response => {
            this.availableFormation = response
          }
        )

        this.untuK = this.toTitleCase(unitkerja.name)
      })
    })

    this.unitKerjaLayerGroup.addTo(this.map)
  }

  initMap (): void {
    console.log('initMap', this.provinceContainedData)
    this.map = L.map('map').setView([-2.5, 118.0], 5)

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map)

    // Add layer groups to the map
    this.provinceLayerGroup.addTo(this.map)
  }

  removeLayers (...layers: L.LayerGroup[]): void {
    layers.forEach(layer => layer.clearLayers())
  }

  resetMap (): void {
    this.availableFormation = []
    this.removeLayers(
      this.provinceLayerGroup,
      this.kabKotaLayerGroup,
      this.unitKerjaLayerGroup
    )
    this.map.setView([-2.5, 118.0], 5)
    this.getProvince(true)
  }

  getTotalRekapitulasi (): number {
    let total = 0
    this.availableFormation.forEach(item => {
      item.jenjangSumList.forEach(formasi => {
        total += Number(formasi.resultSum) || 0
      })
    })
    return total
  }
}

interface CustomMarkerOptions extends L.MarkerOptions {
  layerType?: string
}
