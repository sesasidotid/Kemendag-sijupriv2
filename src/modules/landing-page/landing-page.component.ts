import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { LucideAngularModule, SquareX, SquareCheck } from 'lucide-angular'
import * as L from 'leaflet'
import { DataDokumenUkom } from '../ukom/models/data-dukung'
import { ApiService } from '../base/services/api.service'
import { forkJoin, map, of, timer } from 'rxjs'
import { Input } from '@angular/core'
@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
    @Input() imported?: boolean

    currentYear: number = new Date().getFullYear()
    isMenuOpen = false
    ukomForm!: FormGroup
    private map: L.Map | undefined
    greenIcon = L.icon({
        iconUrl: 'leaf-green.png',
        shadowUrl: 'leaf-shadow.png',

        iconSize: [38, 95], // size of the icon
        shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62], // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    })

    readonly SquareX = SquareX
    readonly SquareCheck = SquareCheck

    dokumenPromosi: DataDokumenUkom[] = []
    dokumenPindahJabatan: DataDokumenUkom[] = []
    dokumenKenaikanJenjang: DataDokumenUkom[] = []
    dokumenKenaikanDanPindah: DataDokumenUkom[] = []
    dokumenPromosiDanPindah: DataDokumenUkom[] = []

    constructor(private router: Router, private service: ApiService) { }

    ngOnInit() {
        this.ukomForm = new FormGroup({
            ukomCode: new FormControl('', [
                Validators.required,
                Validators.minLength(5)
            ])
        })
        this.fetchDokumenUkom()

        this.dokumenKenaikanJenjang
    }

    // fetchDokumenUkom() {
    //     forkJoin({
    //         kenaikanJenjang: this.service.getData('/api/v1/document_ukom/jenis_ukom/KENAIKAN_JENJANG'),
    //         pindahJabatan: this.service.getData('/api/v1/document_ukom/jenis_ukom/PERPINDAHAN_JABATAN'),
    //         promosi: this.service.getData('/api/v1/document_ukom/jenis_ukom/PROMOSI')
    //     }).pipe(
    //         map(({ kenaikanJenjang, pindahJabatan, promosi }) => ({
    //             kenaikanJenjang: this.filterUniqueByName(kenaikanJenjang),
    //             pindahJabatan: this.filterUniqueByName(pindahJabatan),
    //             promosi: this.filterUniqueByName(promosi)
    //         }))
    //     ).subscribe(({ kenaikanJenjang, pindahJabatan, promosi }) => {
    //         this.dokumenKenaikanJenjang = kenaikanJenjang;
    //         this.dokumenPindahJabatan = pindahJabatan;
    //         this.dokumenPromosi = promosi;
    //     });
    // }

    fetchDokumenUkom() {
        forkJoin({
            kenaikanJenjang: this.service.getData('/api/v1/document_ukom/jenis_ukom/KENAIKAN_JENJANG'),
            pindahJabatan: this.service.getData('/api/v1/document_ukom/jenis_ukom/PERPINDAHAN_JABATAN'),
            promosi: this.service.getData('/api/v1/document_ukom/jenis_ukom/PROMOSI')
        }).pipe(
            map(({ kenaikanJenjang, pindahJabatan, promosi }) => {
                const jenjangCode = 'JJ7'; // ahli madya

                const filteredKenaikan = this.filterUniqueByName(kenaikanJenjang);
                const filteredPindah = this.filterUniqueByName(pindahJabatan);
                const filteredPromosi = this.filterUniqueByName(promosi);



                const uniqueByNameAndJenjang = (data: DataDokumenUkom[]) => {
                    const seen = new Set<string>();
                    return data.filter(doc => {
                        const key = `${doc.dokumenPersyaratanName}-${doc.jabatanCode}`;
                        if (seen.has(key)) {
                            return false;
                        }
                        seen.add(key);
                        return true;
                    });
                };

                const sortByName = (a: DataDokumenUkom, b: DataDokumenUkom) => {
                    // First, compare by dokumenPersyaratanName
                    const nameComparison = a.dokumenPersyaratanName.localeCompare(b.dokumenPersyaratanName);

                    // If dokumenPersyaratanName is the same, compare by jabatanName
                    return nameComparison !== 0 ? nameComparison : a.jabatanName.localeCompare(b.jabatanName);
                };


                return {
                    kenaikanJenjang: filteredKenaikan,
                    pindahJabatan: filteredPindah,
                    promosi: filteredPromosi,
                    dokumenKenaikanDanPindah: uniqueByNameAndJenjang([...kenaikanJenjang, ...pindahJabatan]
                        .filter(doc => doc.jenjangCode === jenjangCode))
                        .sort(sortByName),
                    dokumenPromosiDanPindah: uniqueByNameAndJenjang([...promosi, ...pindahJabatan]
                        .filter(doc => doc.jenjangCode === jenjangCode))
                        .sort(sortByName)
                };
            })
        ).subscribe(({ kenaikanJenjang, pindahJabatan, promosi, dokumenKenaikanDanPindah, dokumenPromosiDanPindah }) => {
            this.dokumenKenaikanJenjang = kenaikanJenjang;
            this.dokumenPindahJabatan = pindahJabatan;
            this.dokumenPromosi = promosi;
            this.dokumenKenaikanDanPindah = dokumenKenaikanDanPindah;
            this.dokumenPromosiDanPindah = dokumenPromosiDanPindah;
        });
    }

    private filterUniqueByName(data: DataDokumenUkom[]): DataDokumenUkom[] {
        const seen = new Set<string>();
        return data.filter(item => {
            if (!item.dokumenPersyaratanName || seen.has(item.dokumenPersyaratanName) || item.jenjangCode === 'JJ7') {
                return false;
            }
            seen.add(item.dokumenPersyaratanName);
            return true;
        });
    }


    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen
    }

    navigateTo(path: string) {
        this.router.navigate([path])
    }

    onSubmit() {
        if (this.ukomForm.valid) {
            console.log(this.ukomForm.value)

            this.router.navigate(['/ukom/external/status'], {
                queryParams: { key: this.ukomForm.value.ukomCode }
            })
        }
    }
}
