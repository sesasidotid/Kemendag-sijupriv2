import { ModalComponent } from './../../../modules/base/components/modal/modal.component'
import { Component, inject, signal } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { BehaviorSubject, map } from 'rxjs'
import { ForcePasswordFormComponent } from '../../../modules/base/components/force-password-form/force-password-form.component'
import { JfService } from '@/modules/siap/services/jf.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { JF } from '@/modules/siap/models/jf.model'
import { InstansiTypeService } from '@/modules/maintenance/services/instansi-type.service'
import { PageFilter } from '@/modules/base/commons/pagable/page-filter'
import { InstansiType } from '@/modules/maintenance/models/instansi-type.model'
import { ProvinsiService } from '@/modules/maintenance/services/provinsi.service'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { InstansiService } from '@/modules/maintenance/services/instansi.service'
import { Provinsi } from '@/modules/maintenance/models/provinsi.model'
import { KabKota } from '@/modules/maintenance/models/kab-kota.model'
import { Instansi } from '@/modules/maintenance/models/instansi.model'
import { filter } from 'rxjs/operators'

type FilterOption = { label: string; value: string | number | boolean }

@Component({
    selector: 'app-jf-list',
    standalone: true,
    imports: [
        PagableComponent,
        ModalComponent,
        ForcePasswordFormComponent,
        CommonModule,
    ],
    providers: [TitleCasePipe],
    templateUrl: './jf-list.component.html',
    styleUrl: './jf-list.component.scss',
})
export class JfListComponent {
    pagable = signal<Pagable | null>(null)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    userId: string

    instansiTypeService = inject(InstansiTypeService)
    provinsiService = inject(ProvinsiService)
    kabKotaService = inject(KabKotaService)
    instansiService = inject(InstansiService)
    titleCase = inject(TitleCasePipe)
    refresh: boolean

    instansiType = signal<InstansiType[]>([])
    provinsiList = signal<Provinsi[]>([])
    kabKotaList = signal<KabKota[]>([])
    instansiList = signal<Instansi[]>([])

    private selectedInstansiType = ''
    private selectedProvinsiId = ''
    private selectedKabKotaId = ''

    private readonly dependentFilterKeys = [
        'eq_provinsiId',
        'eq_kabupatenId',
        'eq_kotaId',
        'eq_instansiId',
    ]
    constructor(
        private router: Router,
        private jfService: JfService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
    ) {
        // effect(() => {
        //     this.instansiTypeOptions()
        //     this.handlePagable()
        // })
    }

    ngOnInit() {
        this.handlePagable()
        this.initInstansiTypeOptions()
    }

    initInstansiTypeOptions() {
        this.instansiTypeService
            .findAll()
            .pipe(
                map((instansiType) => {
                     return instansiType.filter((type) => type.code !== "IT1")
                }),
            )
            .subscribe({
                next: (instansiTypes) => {
                    this.instansiType.set(instansiTypes)
                    this.updateFilterPagable()
                },
                error: (error) => this.handlerService.handleException(error),
            })
    }

    handlePagable() {
        this.pagable.set(
            new PagableBuilder('/api/v1/jf/search')
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('NIP', 'nip').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Nama', 'name', ['user']).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Email', 'email', [
                        'user',
                    ]).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Status', 'status', [
                        'user',
                    ]).build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((jf: JF) => {
                            this.router.navigate([`/siap/user-jf/${jf.nip}`])
                        }, 'info')
                        .withIcon('detail')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((user: JF) => {
                            this.userId = user.nip
                            this.toggleModal()
                        }, 'warning')
                        .withIcon('password')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((user: JF) => {
                            this.deleteJFByNip(user.nip)
                        }, 'danger')
                        .withIcon('danger')
                        .build(),
                )

                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('nip')
                        .withField('NIP', 'text')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('user|name')
                        .withField('Nama', 'text')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('user|email')
                        .withField('Email', 'text')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('equal')
                        .setProperty('instansiType')
                        .withField('Jenis Instansi', 'select')
                        .withDefaultValue('')
                        .build(),
                )
                .build(),
        )

        this.updateFilterPagable()
    }

    updateFilterPagable() {
        const currentPagable = this.pagable()
        if (!currentPagable) {
            return
        }

        let filterList = currentPagable.filterList.filter(
            (filter) => !this.dependentFilterKeys.includes(filter.key),
        )

        filterList = this.ensureFilter(
            filterList,
            'eq_instansiType',
            'Jenis Instansi',
            this.instansiTypeToOptions(),
            (value) => this.onInstansiTypeChange(value),
            this.selectedInstansiType,
            true,
        )

        if (this.shouldShowProvinsiFilter()) {
            filterList = this.ensureFilter(
                filterList,
                'eq_provinsiId',
                'Provinsi',
                this.provinsiToOptions(),
                (value) => this.onProvinsiChange(value),
                this.selectedProvinsiId,
                this.selectedInstansiType === 'IT4' ||
                    this.selectedInstansiType === 'IT5',
            )
        }

        if (this.selectedInstansiType === 'IT2') {
            filterList = this.ensureFilter(
                filterList,
                'eq_instansiId',
                'Instansi Kementerian',
                this.instansiToOptions(),
            )
        }

        if (this.shouldShowKabKotaFilter()) {
            filterList = this.ensureFilter(
                filterList,
                this.selectedInstansiType === 'IT4'
                    ? 'eq_kabupatenId'
                    : 'eq_kotaId',
                this.selectedInstansiType === 'IT4' ? 'Kabupaten' : 'Kota',
                this.kabKotaToOptions(),
                (value) => this.onKabKotaChange(value),
                this.selectedKabKotaId,
            )
        }

        // Keep the same pagable reference so PagableComponent does not auto-fetch on every select change.
        // Data refresh will happen only when user clicks "Terapkan".
        currentPagable.filterList.splice(
            0,
            currentPagable.filterList.length,
            ...filterList,
        )
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    deleteJFByNip(nip: string) {
        this.confirmationService.open(false).subscribe((res) => {
            if (!res.confirmed) return

            this.jfService.delete(nip).subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil menghapus Akun JF',
                    )
                    this.refresh = !this.refresh
                },
            })
        })
    }

    private shouldShowProvinsiFilter(): boolean {
        return ['IT3', 'IT4', 'IT5'].includes(this.selectedInstansiType)
    }

    private shouldShowKabKotaFilter(): boolean {
        return (
            ['IT4', 'IT5'].includes(this.selectedInstansiType) &&
            !!this.selectedProvinsiId
        )
    }

    private onInstansiTypeChange(value: string | number | boolean): void {
        this.selectedInstansiType = value ? String(value) : ''
        this.selectedProvinsiId = ''
        this.selectedKabKotaId = ''
        this.provinsiList.set([])
        this.kabKotaList.set([])
        this.instansiList.set([])
        this.updateFilterPagable()

        if (!this.selectedInstansiType) {
            return
        }

        if (this.selectedInstansiType === 'IT2') {
            this.fetchInstansiByType(this.selectedInstansiType)
            return
        }

        if (this.shouldShowProvinsiFilter()) {
            this.fetchProvinsi()
        }
    }

    private onProvinsiChange(value: string | number | boolean): void {
        this.selectedProvinsiId = value ? String(value) : ''
        this.selectedKabKotaId = ''
        this.kabKotaList.set([])
        this.updateFilterPagable()

        if (!this.shouldShowKabKotaFilter()) {
            return
        }

        this.fetchKabKotaByProvinsiId(Number(this.selectedProvinsiId))
    }

    private onKabKotaChange(value: string | number | boolean): void {
        this.selectedKabKotaId = value ? String(value) : ''
        this.updateFilterPagable()
    }

    private fetchProvinsi(): void {
        const activeInstansiType = this.selectedInstansiType

        this.provinsiService.findAll().subscribe({
            next: (provinsiList) => {
                if (activeInstansiType !== this.selectedInstansiType) {
                    return
                }

                this.provinsiList.set(provinsiList)
                this.updateFilterPagable()
            },
            error: (error) => this.handlerService.handleException(error),
        })
    }

    private fetchKabKotaByProvinsiId(provinsiId: number): void {
        const activeInstansiType = this.selectedInstansiType
        const activeProvinsiId = this.selectedProvinsiId
        const kabKotaType =
            this.selectedInstansiType === 'IT4' ? 'KABUPATEN' : 'KOTA'

        this.kabKotaService
            .findByTypeAndProvinsiId(kabKotaType, provinsiId)
            .subscribe({
                next: (kabKotaList) => {
                    if (
                        activeInstansiType !== this.selectedInstansiType ||
                        activeProvinsiId !== this.selectedProvinsiId
                    ) {
                        return
                    }

                    this.kabKotaList.set(kabKotaList)
                    this.updateFilterPagable()
                },
                error: (error) => this.handlerService.handleException(error),
            })
    }

    private fetchInstansiByType(instansiTypeCode: string): void {
        this.instansiService
            .findByInstansiTypeCode(instansiTypeCode)
            .subscribe({
                next: (instansiList) => {
                    if (instansiTypeCode !== this.selectedInstansiType) {
                        return
                    }

                    this.instansiList.set(instansiList)
                    this.updateFilterPagable()
                },
                error: (error) => this.handlerService.handleException(error),
            })
    }

    private instansiTypeToOptions(): FilterOption[] {
        return this.instansiType().map((type) => ({
            label: this.titleCase.transform(type.name),
            value: type.code,
        }))
    }

    private provinsiToOptions(): FilterOption[] {
        return this.provinsiList().map((provinsi) => ({
            label: this.titleCase.transform(provinsi.name),
            value: provinsi.id,
        }))
    }

    private kabKotaToOptions(): FilterOption[] {
        return this.kabKotaList().map((kabKota) => ({
            label: this.titleCase.transform(kabKota.name),
            value: kabKota.id,
        }))
    }

    private instansiToOptions(): FilterOption[] {
        return this.instansiList().map((instansi) => ({
            label: this.titleCase.transform(instansi.name),
            value: instansi.id,
        }))
    }

    private ensureFilter(
        filterList: PageFilter[],
        key: string,
        label: string,
        optionList: FilterOption[],
        onChange?: (value: string | number | boolean) => void,
        value: string | number | boolean = '',
        excludeFromApi: boolean = false,
    ): PageFilter[] {
        const updated = filterList.map((item) =>
            item.key === key
                ? {
                      ...item,
                      label,
                      value,
                      optionList,
                      onChange,
                      excludeFromApi,
                  }
                : item,
        )

        return updated.some((item) => item.key === key)
            ? updated
            : [
                  ...updated,
                  new PageFilter({
                      label,
                      fieldType: 'select',
                      key,
                      value,
                      optionList,
                      onChange,
                      excludeFromApi,
                  }),
              ]
    }
}
