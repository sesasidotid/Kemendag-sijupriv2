import { Component, ViewChild } from '@angular/core'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ReportGenerate } from '../../../modules/report/models/report-generate.model'
import { BehaviorSubject } from 'rxjs'
import { FormValidationService } from '../../../modules/base/services/form-validation.service'
import { ReportService } from '@/modules/report/services/report.service'
import { ReportUkomRekapitulasiComponent } from './report-ukom-rekapitulasi/report-ukom-rekapitulasi.component'
import { ReportUkomCatComponent } from './report-ukom-cat/report-ukom-cat.component'
import { TabService } from '@/modules/base/services/tab.service'
@Component({
    selector: 'app-report-ukom',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        ReportUkomRekapitulasiComponent,
        ReportUkomCatComponent,
    ],
    templateUrl: './report-ukom.component.html',
    styleUrl: './report-ukom.component.scss',
})
export class ReportUkomComponent {
    constructor(
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private apiService: ApiService,
        private formValidationService: FormValidationService,
        public tabService: TabService,
    ) {}

    ngOnInit() {
        this.tabService.clearTabs()
        this.initTabs()
    }

    initTabs() {
        this.tabService
            .addTab({
                label: 'Report Rekapitulasi UKom',
                icon: 'mdi-list-box',
                onClick: () => this.tabService.changeTabActive(0),
            })
            .addTab({
                label: 'Report CAT UKom',
                icon: 'mdi-list-box',
                onClick: () => this.tabService.changeTabActive(1),
            })

        setTimeout(() => this.tabService.changeTabActive(0), 0)
    }
}
