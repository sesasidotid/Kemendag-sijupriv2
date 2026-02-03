import { Instansi } from './../../../modules/maintenance/models/instansi.model'
import { ApiService } from './../../../modules/base/services/api.service'
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import * as L from 'leaflet'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { AvailableFormasiInMap } from '../../../modules/formasi/models/map/available-map'
import { Observable, map, BehaviorSubject, of } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

type DaumT = {
    id: string
    rekomendasi: string
    formasiStatus: string
    unitKerjaId: string
    updatedBy: any
    lastUpdated: string
    version: number
    deleteFlag: boolean
    inactiveFlag: boolean
    createdBy: string
    dateCreated: string
    idx: number
    unitKerjaName: string
}
@Component({
    selector: 'app-deprecated_formasi-pemetaan',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './formasi-pemetaan.component.html',
    styleUrl: './formasi-pemetaan.component.scss',
})
export class FormasiPemetaanComponent {
    map!: L.Map
    provinceContainedData: Provinsi[] = []
    kabKotaData: KabKota[] = []
    unitKerjaData: UnitKerja[] = []
    unitKerjaDetail: UnitKerja = new UnitKerja()
    InstansiDetail: Instansi = new Instansi()
    availableFormation: AvailableFormasiInMap[] = []
    untuK: string = ''
    hoveredJabatanIndex: number | null = null
    searchControl = new FormControl('')
    results: DaumT[] = []
    showDropdownSubject = new BehaviorSubject<boolean>(false)
    showDropdown$: Observable<boolean> = this.showDropdownSubject.asObservable()

    selectedItem: string = ''

    private markerIcon = L.icon({
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })

    private unitKerjaMarkerIcon = L.icon({
        iconUrl: 'assets/marker-icon-gold.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })

    private provinceLayerGroup = L.layerGroup()
    private kabKotaLayerGroup = L.layerGroup()
    private unitKerjaLayerGroup = L.layerGroup()

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    ngOnInit(): void {
        this.getProvince()
        this.getUnitKerjaIT1()
        this.getUnitKerjaIT2()
        this.initMap()
        this.handleSearch()
    }

    onFocusInput() {
        this.showDropdownSubject.next(true)
    }

    onBlurInput() {
        setTimeout(() => {
            this.showDropdownSubject.next(false)
        }, 200)
    }

    handleSearch() {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap((term) => {
                    console.log('term', term)
                    if (!term.trim()) {
                        this.results = []
                        this.showDropdownSubject.next(false)
                        return of([])
                    }
                    return this.search(term)
                }),
            )
            .subscribe((response) => {
                this.results = response.data || []
                if (this.results.length > 0) {
                    this.showDropdownSubject.next(true)
                }
            })
    }

    search(term: string): Observable<any[]> | any[] {
        return this.apiService.getData(
            `/api/v1/formasi/search?limit=10&like_unit_kerja|name=${term}`,
        )
    }

    selectItem(item: DaumT) {
        this.searchControl.setValue(item.unitKerjaName, { emitEvent: false })
        this.showDropdownSubject.next(false)

        this.selectItemSearch(item.unitKerjaName)
        this.getUnitKerjaAvailableFormation(item.unitKerjaId).subscribe(
            (response) => {
                console.log('availableFormation', response)
                this.availableFormation = response
            },
        )
        this.untuK = item.unitKerjaName
    }

    selectItemSearch(eq_name?: string) {
        if (!eq_name) {
            return
        }

        this.apiService
            .getData(`/api/v1/unit_kerja/search?eq_name=${eq_name}`)
            .subscribe({
                next: (response) => {
                    this.unitKerjaData = response.data

                    this.removeLayers(
                        this.provinceLayerGroup,
                        this.kabKotaLayerGroup,
                        this.unitKerjaLayerGroup,
                    )
                    this.addUnitKerjaMarkers()
                },
            })
    }

    hoverJabatan(index: number, isHovering: boolean) {
        this.hoveredJabatanIndex = isHovering ? index : null
    }

    getProvinceAvailableFormation(
        provinsi_id: string,
    ): Observable<AvailableFormasiInMap[]> {
        return this.apiService
            .getData(`/api/v1/formasi/calculate/provinsi/${provinsi_id}`)
            .pipe(
                map((response) =>
                    response.map(
                        (formation: AvailableFormasiInMap) =>
                            new AvailableFormasiInMap(formation),
                    ),
                ),
            )
    }

    getKabKotaAvailableFormation(
        kabkota_id: string,
    ): Observable<AvailableFormasiInMap[]> {
        return this.apiService
            .getData(`/api/v1/formasi/calculate/kab_kota/${kabkota_id}`)
            .pipe(
                map((response) =>
                    response.map(
                        (formation: AvailableFormasiInMap) =>
                            new AvailableFormasiInMap(formation),
                    ),
                ),
            )
    }

    getUnitKerjaAvailableFormation(
        unit_kerja_id: string,
    ): Observable<AvailableFormasiInMap[]> {
        console.log('getUnitKerjaAvailableFormation caleed', unit_kerja_id)
        return this.apiService
            .getData(`/api/v1/formasi/calculate/unit_kerja/${unit_kerja_id}`)
            .pipe(
                map((response) =>
                    response.map(
                        (formation: AvailableFormasiInMap) =>
                            new AvailableFormasiInMap(formation),
                    ),
                ),
            )
    }

    getProvince(isReset?: boolean): void {
        this.apiService
            .getData(`/api/v1/provinsi/search?limit=1000`)
            .subscribe({
                next: (response) => {
                    this.provinceContainedData = response.data

                    this.addProvinceMarkers()
                },
            })
    }

    toTitleCase(str: string) {
        return str
        return str.replace(
            /\w\S*/g,
            (text) =>
                text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
        )
    }

    addProvinceMarkers(): void {
        this.provinceContainedData.forEach((province) => {
            const marker = L.marker(
                [parseFloat(province.latitude), parseFloat(province.longitude)],
                { icon: this.markerIcon },
            ).addTo(this.provinceLayerGroup)

            marker.bindPopup(
                `<b>${province.name}</b><br><br><button id="select-province-${province.id}" class="btn btn-soft-primary">Detail</button>`,
            )

            marker.on('popupopen', () => {
                this.getProvinceAvailableFormation(province.id).subscribe(
                    (response) => {
                        this.availableFormation = response
                    },
                )

                this.untuK = this.toTitleCase(province.name)

                document
                    .getElementById(`select-province-${province.id}`)
                    ?.addEventListener('click', () =>
                        this.selectProvince(province.id, marker),
                    )
            })
        })

        this.provinceLayerGroup.addTo(this.map)
    }

    selectProvince(provinsiId: string, marker: L.Marker): void {
        this.apiService
            .getData(
                `/api/v1/kab_kota/search?eq_provinsiId=${provinsiId}&limit=10000`,
            )
            .subscribe({
                next: (response) => {
                    this.getUnitKerjaIT3(provinsiId)
                    this.kabKotaData = response.data
                    this.map.setView(marker.getLatLng(), 8) // Zoom into province
                    this.removeLayers(
                        this.provinceLayerGroup,
                        this.unitKerjaLayerGroup,
                    ) // Remove kabKota and unitKerja markers
                    this.addKabKotaMarkers()
                },
            })
    }

    addKabKotaMarkers(): void {
        this.kabKotaData.forEach((city) => {
            const marker = L.marker(
                [parseFloat(city.latitude), parseFloat(city.longitude)],
                { icon: this.markerIcon },
            ).addTo(this.kabKotaLayerGroup)

            marker.bindPopup(
                `<b>${city.name}</b><br><button id="select-kabkota-${city.id}-${city.type}" class="btn btn-soft-primary">Detail</button>`,
            )

            marker.on('popupopen', () => {
                this.getKabKotaAvailableFormation(city.id).subscribe(
                    (response) => {
                        this.availableFormation = response
                    },
                )

                this.untuK = this.toTitleCase(city.name)

                document
                    .getElementById(`select-kabkota-${city.id}-${city.type}`)
                    ?.addEventListener('click', () =>
                        this.selectCity(city.id, city.type, marker),
                    )
            })
        })

        this.kabKotaLayerGroup.addTo(this.map)
    }

    selectCity(cityId: string, type: string, marker: L.Marker): void {
        const apiLink =
            type == 'KABUPATEN'
                ? `/api/v1/unit_kerja/search?eq_instansi|kabupatenId=${cityId}&limit=10000`
                : `/api/v1/unit_kerja/search?eq_instansi|kotaId=${cityId}&limit=10000`

        this.apiService.getData(apiLink).subscribe({
            next: (response) => {
                console.log('called getKota', this.provinceLayerGroup)
                this.unitKerjaData = response.data

                if (this.unitKerjaData.length === 0) {
                    this.handlerService.handleAlert(
                        'Info',
                        'Data tidak ditemukan',
                    )
                    return
                }
                this.map.setView(marker.getLatLng(), 10) // Zoom into city
                this.removeLayers(
                    this.provinceLayerGroup,
                    this.kabKotaLayerGroup,
                    this.unitKerjaLayerGroup,
                ) // Remove province and unitKerja markers
                this.addUnitKerjaMarkers()
            },
        })
    }

    selectKab(kabupatenId: string, marker: L.Marker): void {
        this.apiService
            .getData(
                `/api/v1/unit_kerja/search?eq_instansi|kabupatenId=${kabupatenId}&limit=10000`,
            )
            .subscribe({
                next: (response) => {
                    this.unitKerjaData = response.data

                    if (this.unitKerjaData.length === 0) {
                        this.handlerService.handleAlert(
                            'Info',
                            'Data tidak ditemukan',
                        )
                        return
                    }
                    this.map.setView(marker.getLatLng(), 10)
                    this.removeLayers(
                        this.provinceLayerGroup,
                        this.kabKotaLayerGroup,
                    )
                    this.addUnitKerjaMarkers()
                },
            })
    }

    getInstansiDetail(instansiId: string): Observable<any> {
        return this.apiService.getData(`/api/v1/instansi/${instansiId}`)
    }

    addUnitKerjaMarkers(): void {
        this.unitKerjaData.forEach((unitkerja) => {
            const marker = L.marker([unitkerja.latitude, unitkerja.longitude], {
                icon: this.unitKerjaMarkerIcon,
                layerType: 'unitkerja',
            } as CustomMarkerOptions).addTo(this.unitKerjaLayerGroup)

            this.getInstansiDetail(unitkerja.instansiId).subscribe(
                (response) => {
                    const instansiName = response?.name || '-'

                    let instansiType = ''
                    switch (response?.instansiTypeCode) {
                        case 'IT1':
                            instansiType = 'Pusbin'
                            break
                        case 'IT2':
                            instansiType = 'Kementerian Lembaga'
                            break
                        case 'IT3':
                            instansiType = 'Provinsi'
                            break
                        case 'IT4':
                            instansiType = 'Kabupaten'
                            break
                        case 'IT5':
                            instansiType = 'Kota'
                            break
                    }

                    marker.bindPopup(`
          <div style="
            font-family: Arial, sans-serif;
            padding: 10px;
            max-width: 250px;
          ">
            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${unitkerja.name}</h4>
            <br>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${unitkerja.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${unitkerja.phone}</p>
            <p style="margin: 5px 0;"><strong>Alamat:</strong> ${unitkerja.alamat}</p>
            <p style="margin: 5px 0;"><strong>Instansi:</strong> ${instansiName}</p>
            <p style="margin: 5px 0;"><strong>Tipe Instansi:</strong> ${instansiType}</p>
          </div>
        `)
                },
            )

            marker.on('popupopen', () => {
                this.getUnitKerjaAvailableFormation(unitkerja.id).subscribe(
                    (response) => {
                        this.availableFormation = response
                    },
                )

                this.untuK = this.toTitleCase(unitkerja.name)
            })
        })

        this.unitKerjaLayerGroup.addTo(this.map)
    }

    initMap(): void {
        console.log('initMap', this.provinceContainedData)
        this.map = L.map('map').setView([-2.5, 118.0], 5)

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(this.map)

        // Add layer groups to the map
        this.provinceLayerGroup.addTo(this.map)

        this.addLegend()
    }

    addLegend(): void {
        const legend = new L.Control({ position: 'bottomleft' })

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend')
            div.innerHTML = `
        <div><img src="assets/marker-icon-gold.png" alt="Unit Kerja" /> Unit Kerja</div>
        <div><img src="assets/marker-icon.png" alt="Provinsi" /> Provinsi/KabKota</div>
        `
            return div
        }

        legend.addTo(this.map)
    }

    removeLayers(...layers: L.LayerGroup[]): void {
        layers.forEach((layer) => layer.clearLayers())
    }

    resetMap(): void {
        this.availableFormation = []
        this.removeLayers(
            this.provinceLayerGroup,
            this.kabKotaLayerGroup,
            this.unitKerjaLayerGroup,
        )

        this.searchControl.setValue('')
        this.provinceContainedData = new Array<Provinsi>()
        this.kabKotaData = new Array<KabKota>()
        this.unitKerjaData = new Array<UnitKerja>()

        this.map.setView([-2.5, 118.0], 5)
        this.getProvince(true)
        this.getUnitKerjaIT1(true)
        this.getUnitKerjaIT2(true)
        this.results = []
        this.initMap()
        this.showDropdownSubject.next(false)
    }

    getTotalRekapitulasi(): number {
        let total = 0
        this.availableFormation.forEach((item) => {
            item.jenjangSumList.forEach((formasi) => {
                total += Number(formasi.resultSum) || 0
            })
        })
        return total
    }

    getUnitKerjaIT1(isReset?: boolean): void {
        this.apiService
            .getData(
                `/api/v1/unit_kerja/search?eq_instansi|instansiTypeCode=IT1&limit=10000`,
            )
            .subscribe({
                next: (response) => {
                    response.data.forEach((unitkerja: any) => {
                        this.unitKerjaData.push(unitkerja)
                    })

                    this.addUnitKerjaMarkers()
                },
            })
    }

    getUnitKerjaIT2(isReset?: boolean): void {
        this.apiService
            .getData(
                `/api/v1/unit_kerja/search?eq_instansi|instansiTypeCode=IT2&limit=10000`,
            )
            .subscribe({
                next: (response) => {
                    response.data.forEach((unitkerja: any) => {
                        this.unitKerjaData.push(unitkerja)
                    })

                    this.addUnitKerjaMarkers()
                },
            })
    }

    getUnitKerjaIT3(provinsiId: string): void {
        this.apiService
            .getData(
                `/api/v1/unit_kerja/search?eq_instansi|instansiTypeCode=IT3&eq_instansi|provinsiId=${provinsiId}&limit=10000`,
            )
            .subscribe({
                next: (response) => {
                    //   response.data.forEach((unitkerja: any) => {
                    //     this.unitKerjaData.push(unitkerja)
                    //   })

                    this.unitKerjaData = response.data

                    this.removeLayers(this.unitKerjaLayerGroup)
                    this.addUnitKerjaMarkers()
                },
            })
    }

    getUnitKerjaIT4(kabupatenId: string): void {
        this.apiService
            .getData(
                `/api/v1/unit_kerja/search?eq_instansi|instansiTypeCode=IT4&eq_instansi|kabupatenId=${kabupatenId}&limit=10000`,
            )
            .subscribe({
                next: (response) => {
                    this.unitKerjaData = response.data

                    this.removeLayers(
                        this.unitKerjaLayerGroup,
                        this.provinceLayerGroup,
                    )
                    this.addUnitKerjaMarkers()
                },
            })
    }

    getUnitKerjaIT5(kotaId: string): void {
        this.apiService
            .getData(
                `/api/v1/unit_kerja/search?eq_instansi|instansiTypeCode=IT3&eq_instansi|kotaId=${kotaId}&limit=10000`,
            )
            .subscribe({
                next: (response) => {
                    this.unitKerjaData = response.data

                    this.removeLayers(
                        this.unitKerjaLayerGroup,
                        this.provinceLayerGroup,
                    )
                    this.addUnitKerjaMarkers()
                },
            })
    }
}

interface CustomMarkerOptions extends L.MarkerOptions {
    layerType?: string
}
