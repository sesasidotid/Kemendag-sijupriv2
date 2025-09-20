import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { combineLatest, map } from 'rxjs'

import { TabService } from '@/modules/base/services/tab.service'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'

import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { UkomRegistrationRequirementAddComponent } from './ukom-registration-requirement-add/ukom-registration-requirement-add.component'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { UkomRegistrationRequirement } from '@/modules/ukom/models/ukom-registration-refactored/ukom-registration-rule.model'
import { UkomRegistrationRuleService } from '@/modules/ukom/services/ukom-registration-rule.service'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { UkomRegistrationRequirementUpdateComponent } from './ukom-registration-requirement-update/ukom-registration-requirement-update.component'

@Component({
    selector: 'app-ukom-registration-requirement',
    standalone: true,
    imports: [
        UkomRegistrationRequirementAddComponent,
        CommonModule,
        PagableComponent,
        ModalComponent,
        UkomRegistrationRequirementUpdateComponent,
    ],
    templateUrl: './ukom-registration-requirement.component.html',
    styleUrl: './ukom-registration-requirement.component.scss',
})
export class UkomRegistrationRequirementComponent {
    pagable$ = combineLatest([
        this.jenjangService.jenjangList$,
        this.kinerjaService.ratingKinerjaList$,
        this.kinerjaService.predikatKinerjaList$,
    ]).pipe(
        map(([jenjangList, ratingList, predikatList]) => {
            return (
                new PagableBuilder('/api/v1/ukom_registration_rules/search')
                    // Jenjang column
                    .addPrimaryColumn(
                        new PrimaryColumnBuilder()
                            .withDynamicValue(
                                'Jenjang',
                                (data: UkomRegistrationRequirement) => {
                                    const jenjang = jenjangList.find(
                                        (j) => j.code === data.jenjangCode,
                                    )
                                    return jenjang ? jenjang.name : '-'
                                },
                            )
                            .build(),
                    )
                    // Jenis UKom column
                    .addPrimaryColumn(
                        new PrimaryColumnBuilder()
                            .withDynamicValue(
                                'Jenis UKom',
                                (data: UkomRegistrationRequirement) => {
                                    const jenisUkom =
                                        this.jenisUkomService.jenisUkomList.find(
                                            (j) => j.value === data.jenisUkom,
                                        )
                                    return jenisUkom ? jenisUkom.label : '-'
                                },
                            )
                            .build(),
                    )
                    // Angka Kredit column
                    .addPrimaryColumn(
                        new PrimaryColumnBuilder(
                            'Angka Kredit',
                            'angkaKreditThreshold',
                        ).build(),
                    )
                    // N Tahun Terakhir column
                    .addPrimaryColumn(
                        new PrimaryColumnBuilder(
                            'N Tahun Terakhir',
                            'lastNYear',
                        ).build(),
                    )
                    // Rating Hasil Kinerja
                    .addPrimaryColumn(
                        new PrimaryColumnBuilder()
                            .withDynamicValue(
                                'Rating Hasil Kinerja',
                                (data: UkomRegistrationRequirement) => {
                                    const ratingHasil = ratingList.find(
                                        (r) => r.id === data.ratingHasilId,
                                    )
                                    return ratingHasil ? ratingHasil.name : '-'
                                },
                            )
                            .build(),
                    )
                    // Rating Perilaku Kinerja
                    .addPrimaryColumn(
                        new PrimaryColumnBuilder()
                            .withDynamicValue(
                                'Rating Perilaku Kinerja',
                                (data: UkomRegistrationRequirement) => {
                                    const ratingPerilaku = ratingList.find(
                                        (r) => r.id === data.ratingKinerjaId,
                                    )
                                    return ratingPerilaku
                                        ? ratingPerilaku.name
                                        : '-'
                                },
                            )
                            .build(),
                    )
                    // Predikat Kinerja
                    .addPrimaryColumn(
                        new PrimaryColumnBuilder()
                            .withDynamicValue(
                                'Predikat Kinerja',
                                (data: UkomRegistrationRequirement) => {
                                    const predikat = predikatList.find(
                                        (p) => p.id === data.predikatKinerjaId,
                                    )
                                    return predikat ? predikat.name : '-'
                                },
                            )
                            .build(),
                    )
                    .addActionColumn(
                        new ActionColumnBuilder()
                            .withIcon('update')
                            .setAction(
                                (data: UkomRegistrationRequirement) =>
                                    this.openUpdateModal(data),
                                'primary',
                            )
                            .build(),
                    )
                    .addActionColumn(
                        new ActionColumnBuilder()
                            .withIcon('danger')
                            .setAction(
                                (data: UkomRegistrationRequirement) =>
                                    this.handleDeleteRule(data.id),
                                'danger',
                            )
                            .build(),
                    )
                    .build()
            )
        }),
    )

    refresh: boolean
    isUpdateModalOpen: boolean

    selectedRule: UkomRegistrationRequirement

    constructor(
        public tabService: TabService,
        public jenjangService: JenjangService,
        public jenisUkomService: JenisUkomService,
        public kinerjaService: KinerjaService,
        public ukomRegistrationRuleService: UkomRegistrationRuleService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        // fetch lists
        this.jenjangService.fetchJenjang()
        this.kinerjaService.fetchPredikatKinerja()
        this.kinerjaService.fetchRatingKinerja()

        this.initTabs()
    }

    private initTabs() {
        this.tabService
            .addTab({
                label: 'Persyaratan Pendaftaran',
                icon: 'mdi-list-box',
                onClick: () => this.tabService.changeTabActive(0),
            })
            .addTab({
                label: 'Tambah Syarat Pendaftaran',
                icon: 'mdi-plus-circle',
                onClick: () => this.tabService.changeTabActive(1),
            })

        setTimeout(() => this.tabService.changeTabActive(0), 0)
    }

    refreshPagable() {
        this.refresh = !this.refresh
    }

    private handleDeleteRule(id: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.ukomRegistrationRuleService.deleteRule(id, () =>
                    this.refreshPagable(),
                )
            },
        })
    }

    closeUpdateModal() {
        this.isUpdateModalOpen = false
        this.selectedRule = undefined
    }

    openUpdateModal(body: UkomRegistrationRequirement) {
        this.selectedRule = body
        this.isUpdateModalOpen = true
    }
}
