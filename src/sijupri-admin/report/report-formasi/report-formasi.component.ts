import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ApiService } from '../../../modules/base/services/api.service';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';

@Component({
  selector: 'app-report-formasi',
  standalone: true,
  imports: [
    PagableComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './report-formasi.component.html',
  styleUrl: './report-formasi.component.scss'
})
export class ReportFormasiComponent {
  pagable: Pagable;

  addFormasiReportForm!: FormGroup;

  reportId: string = "formasiReport";

  constructor(
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService,
    private apiService: ApiService
  ) {
    this.pagable = new PagableBuilder("/api/v1/report/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'fileName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tipe", 'fileType').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'status').build())
      .addActionColumn(new ActionColumnBuilder().setAction((report: any) => {
        this.apiService.postDownload('/api/v1/report/download', { id: report.id, bucketId: "report" }, report.fileName).subscribe({
          next: () => this.handlerService.handleAlert("Success", "file di download"),
          error: (error) => this.handlerService.handleException(error)
        })
      }, "success").withIcon("download").addInactiveCondition((report: any) => {
        return report.status == "FAILED";
      }).build())
      .addFilter(new PageFilterBuilder("like").setProperty("fileName").withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("fileType").withField("Tipe", "select").setOptionList([
        { label: "Excel", value: "xlsx" },
        { label: "CSV", value: "csv" }
      ]).build())
      .addFilter(new PageFilterBuilder("equal").setProperty("reportId").withDefaultValue(this.reportId).build())
      .setLimit(5)
      .build();
  }
}
