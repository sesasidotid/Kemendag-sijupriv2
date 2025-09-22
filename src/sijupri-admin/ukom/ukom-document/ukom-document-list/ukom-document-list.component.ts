import { ConfirmationService } from './../../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { TabService } from '../../../../modules/base/services/tab.service'
import { UkomDocumentAddComponent } from '../ukom-document-add/ukom-document-add.component'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { UkomDocumentUpdateComponent } from '../ukom-document-update/ukom-document-update.component'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { DokumenUkom } from '@/modules/ukom/models/ukom-registration-refactored/document.model'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { SpecificationService } from '@/modules/complement/services/specification.service'
@Component({
    selector: 'app-ukom-document-list',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        UkomDocumentAddComponent,
        UkomDocumentUpdateComponent,
        ModalComponent,
    ],
    templateUrl: './ukom-document-list.component.html',
    styleUrl: './ukom-document-list.component.scss',
})
export class UkomDocumentListComponent {
    pagable!: Pagable
    refresh: boolean = false

    isUpdateModalOpen: boolean
    selectedDocument: DokumenUkom

    constructor(
        public tabService: TabService,
        private confirmationService: ConfirmationService,
        private apiService: ApiService,
        private handlerService: HandlerService,
        public documentService: UkomDocumentService,
        public jenisUkomService: JenisUkomService,
        public sp: SpecificationService,
    ) {}

    ngOnInit() {
        this.handlePagable()
        this.handleTabService()
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/document_ukom/all')
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Nama',
                    'dokumenPersyaratanName',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis UKom', (data: DokumenUkom) => {
                        const jenisUkom =
                            this.jenisUkomService.jenisUkomList.find(
                                (j) => j.value === data.jenisUkom,
                            )
                        return jenisUkom ? jenisUkom.label : '-'
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jabatan', 'jabatanName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jenjang', 'jenjangName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Khusus Mengulang?',
                        (data: DokumenUkom) =>
                            data.isMengulang ? 'Ya' : 'Tidak',
                    )
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Diperuntukan', (data: DokumenUkom) => {
                        const specification = this.sp.specificationList.find(
                            (s) => s.value === data.specification,
                        )

                        return specification ? specification.label : '-'
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .withIcon('update')
                    .setAction(
                        (data: DokumenUkom) => this.openUpdateModal(data),
                        'primary',
                    )
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: DokumenUkom) => {
                        this.delete(item.dokumenPersyaratanId)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()
    }

    handleTabService() {
        this.tabService
            .addTab({
                label: 'Daftar Dokumen Ukom',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.tabService.changeTabActive(0),
            })
            .addTab({
                label: 'Tambah Dokumen Ukom',
                icon: 'mdi-plus-circle',
                onClick: () => this.tabService.changeTabActive(1),
            })
    }

    refreshPagable() {
        this.refresh = !this.refresh
    }

    closeUpdateModal() {
        this.isUpdateModalOpen = false
        this.selectedDocument = undefined
    }

    openUpdateModal(document: DokumenUkom) {
        this.selectedDocument = document
        this.isUpdateModalOpen = true
    }

    delete(id: string) {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                this.documentService.deleteDocument(id, () => {
                    this.refreshPagable()
                })
            },
        })
    }
}
