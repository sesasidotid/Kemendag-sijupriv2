import { CommonModule } from '@angular/common'
import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
} from '@angular/core'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import {
    LucideAngularModule,
    SquareX,
    SquareCheck,
    ArrowRight,
    ArrowUp,
    ClipboardList,
    QrCode,
    ShieldCheck,
    FileText,
    UserCheck,
    TrendingUp,
    Repeat,
    Search,
    MapPin,
    Phone,
    Headset,
} from 'lucide-angular'
import * as L from 'leaflet'
import { DataDokumenUkom } from '../ukom/models/data-dukung'
import { ApiService } from '../base/services/api.service'
import { forkJoin, map } from 'rxjs'
import { Input } from '@angular/core'
@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
    @Input() imported?: boolean

    currentYear: number = new Date().getFullYear()
    isMenuOpen = false
    ukomForm!: FormGroup
    greenIcon = L.icon({
        iconUrl: 'leaf-green.png',
        shadowUrl: 'leaf-shadow.png',

        iconSize: [38, 95], // size of the icon
        shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62], // the same for the shadow
        popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
    })

    readonly SquareX = SquareX
    readonly SquareCheck = SquareCheck
    readonly ArrowRight = ArrowRight
    readonly ArrowUp = ArrowUp
    readonly ClipboardList = ClipboardList
    readonly QrCode = QrCode
    readonly ShieldCheck = ShieldCheck
    readonly FileText = FileText
    readonly UserCheck = UserCheck
    readonly TrendingUp = TrendingUp
    readonly Repeat = Repeat
    readonly Search = Search
    readonly MapPin = MapPin
    readonly Phone = Phone
    readonly Headset = Headset

    isScrolled = false
    private revealObserver?: IntersectionObserver

    dokumenPromosi: DataDokumenUkom[] = []
    dokumenPindahJabatan: DataDokumenUkom[] = []
    dokumenKenaikanJenjang: DataDokumenUkom[] = []
    dokumenKenaikanDanPindah: DataDokumenUkom[] = []
    dokumenPromosiDanPindah: DataDokumenUkom[] = []

    constructor(
        private router: Router,
        private service: ApiService,
        private el: ElementRef<HTMLElement>,
    ) {}

    /** Header transparan (menyatu dengan hero) sebelum halaman di-scroll */
    get isOnHero(): boolean {
        return !this.imported && !this.isScrolled && !this.isMenuOpen
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        this.isScrolled = window.scrollY > 40
    }

    ngAfterViewInit() {
        this.onWindowScroll()
        const targets = this.el.nativeElement.querySelectorAll('.reveal')
        if (!targets.length) return

        if (!('IntersectionObserver' in window)) {
            targets.forEach((t) => t.classList.add('visible'))
            return
        }

        this.revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                        this.revealObserver?.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
        )
        targets.forEach((t) => this.revealObserver!.observe(t))
    }

    ngOnDestroy() {
        this.revealObserver?.disconnect()
    }

    ngOnInit() {
        this.ukomForm = new FormGroup({
            ukomCode: new FormControl('', [
                Validators.required,
                Validators.minLength(5),
            ]),
        })
        this.fetchDokumenUkom()

        this.dokumenKenaikanJenjang
    }

    fetchDokumenUkom() {
        forkJoin({
            kenaikanJenjang: this.service.getData(
                '/api/v1/document_ukom/jenis_ukom/KENAIKAN_JENJANG',
            ),
            pindahJabatan: this.service.getData(
                '/api/v1/document_ukom/jenis_ukom/PERPINDAHAN_JABATAN',
            ),
            promosi: this.service.getData(
                '/api/v1/document_ukom/jenis_ukom/PROMOSI',
            ),
        })
            .pipe(
                map(({ kenaikanJenjang, pindahJabatan, promosi }) => {
                    const jenjangCodes = ['JJ7', 'JJ8']
                    const filteredKenaikan =
                        this.filterUniqueByName(kenaikanJenjang)
                    const filteredPindah =
                        this.filterUniqueByName(pindahJabatan)
                    const filteredPromosi = this.filterUniqueByName(promosi)
                    const uniqueByNameAndJenjang = (
                        data: DataDokumenUkom[],
                    ) => {
                        const seen = new Set<string>()
                        return data.filter((doc) => {
                            const key = `${doc.dokumenPersyaratanName}-${doc.jabatanCode}`
                            if (seen.has(key)) {
                                return false
                            }
                            seen.add(key)
                            return true
                        })
                    }

                    const sortByName = (
                        a: DataDokumenUkom,
                        b: DataDokumenUkom,
                    ) => {
                        const nameComparison =
                            a.dokumenPersyaratanName.localeCompare(
                                b.dokumenPersyaratanName,
                            )
                        return nameComparison !== 0
                            ? nameComparison
                            : a.jabatanName.localeCompare(b.jabatanName)
                    }

                    return {
                        kenaikanJenjang: filteredKenaikan,
                        pindahJabatan: filteredPindah,
                        promosi: filteredPromosi,
                        // dokumenKenaikanDanPindah: uniqueByNameAndJenjang(
                        //     [...kenaikanJenjang, ...pindahJabatan].filter(
                        //         (doc) => jenjangCodes.includes(doc.jenjangCode),
                        //     ),
                        // ).sort(sortByName),
                        dokumenKenaikanDanPindah: uniqueByNameAndJenjang(
                            [...pindahJabatan].filter((doc) =>
                                jenjangCodes.includes(doc.jenjangCode),
                            ),
                        ).sort(sortByName),
                        // dokumenPromosiDanPindah: uniqueByNameAndJenjang(
                        //     [...promosi, ...pindahJabatan].filter((doc) =>
                        //         jenjangCodes.includes(doc.jenjangCode),
                        //     ),
                        // ).sort(sortByName),
                        dokumenPromosiDanPindah: uniqueByNameAndJenjang(
                            [...promosi].filter((doc) =>
                                jenjangCodes.includes(doc.jenjangCode),
                            ),
                        ).sort(sortByName),
                    }
                }),
            )
            .subscribe(
                ({
                    kenaikanJenjang,
                    pindahJabatan,
                    promosi,
                    dokumenKenaikanDanPindah,
                    dokumenPromosiDanPindah,
                }) => {
                    this.dokumenKenaikanJenjang = kenaikanJenjang
                    this.dokumenPindahJabatan = pindahJabatan
                    this.dokumenPromosi = promosi
                    this.dokumenKenaikanDanPindah = dokumenKenaikanDanPindah
                    this.dokumenPromosiDanPindah = dokumenPromosiDanPindah
                },
            )
    }

    private filterUniqueByName(data: DataDokumenUkom[]): DataDokumenUkom[] {
        const seen = new Set<string>()
        const excludedJenjang = ['JJ7', 'JJ8']

        return data.filter((item) => {
            if (
                !item.dokumenPersyaratanName ||
                seen.has(item.dokumenPersyaratanName) ||
                excludedJenjang.includes(item.jenjangCode)
            ) {
                return false
            }

            seen.add(item.dokumenPersyaratanName)
            return true
        })
    }

    formatJabatanJenjang(item: any): string {
        const names = [item.jabatanName, item.jenjangName]
            .filter(Boolean)
            .join(' - ')
        return names ? ` (${names})` : ''
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen
    }

    closeMenu() {
        this.isMenuOpen = false
    }

    scrollToTop(event: Event) {
        event.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    onSubmit() {
        this.router.navigate(['/ukom/external/status'], {
            queryParams: { key: this.ukomForm.value.ukomCode },
        })
    }
}
