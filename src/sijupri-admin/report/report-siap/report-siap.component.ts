import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model';
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ApiService } from '../../../modules/base/services/api.service';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { ReportGenerate } from '../../../modules/report/models/report-generate.model';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Instansi } from '../../../modules/maintenance/models/instansi.model';

@Component({
  selector: 'app-report-siap',
  standalone: true,
  imports: [
    PagableComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './report-siap.component.html',
  styleUrl: './report-siap.component.scss'
})
export class ReportSiapComponent {
  pagable: Pagable;

  addSiapReportForm!: FormGroup;

  instansiList: Instansi[];
  unitKerjaList: UnitKerja[];
  provinsiList: Provinsi[];
  kabKotaList: KabKota[];

  reportId: string = "siapReport";

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

  ngOnInit() {
    this.apiService.getData('/api/v1/instansi').subscribe({
      next: ((response: any) => {
        this.instansiList = response.map((instansi: { [key: string]: any; }) => new Instansi(instansi));
      }),
      error: ((error) => {
        this.handlerService.handleException(error);
      })
    });

    this.apiService.getData('/api/v1/unit_kerja').subscribe({
      next: ((response: any) => {
        this.unitKerjaList = response.map((unitKerja: { [key: string]: any; }) => new UnitKerja(unitKerja));
      }),
      error: ((error) => {
        this.handlerService.handleException(error);
      })
    });

    this.apiService.getData('/api/v1/provinsi').subscribe({
      next: ((response: any) => {
        this.provinsiList = response.map((provinsi: { [key: string]: any; }) => new Provinsi(provinsi));
      }),
      error: ((error) => {
        this.handlerService.handleException(error);
      })
    });

    this.apiService.getData('/api/v1/kab_kota').subscribe({
      next: ((response: any) => {
        this.kabKotaList = response.map((kabKota: { [key: string]: any; }) => new KabKota(kabKota));
      }),
      error: ((error) => {
        this.handlerService.handleException(error);
      })
    });

    this.addSiapReportForm = new FormGroup({
      instansiId: new FormControl(''),
      instansiName: new FormControl(''),
      unitKerjaId: new FormControl(''),
      unitKerjaName: new FormControl(''),
      provinsiId: new FormControl(''),
      provinsiName: new FormControl(''),
      kabKotaId: new FormControl(''),
      kabKotaName: new FormControl(''),
      fileType: new FormControl('', [Validators.required]),
    })
  }

  onInstansiChange(event: Event) {
    const instansiId = (event.target as HTMLSelectElement).value;
    for (const instansi of this.instansiList) {
      if (instansi.id == instansiId) {
        this.addSiapReportForm.get("instansiId").setValue(instansi.id)
        this.addSiapReportForm.get("instansiName").setValue(instansi.name)
        break;
      } else {
        this.addSiapReportForm.get("instansiId").setValue('')
        this.addSiapReportForm.get("instansiName").setValue('')
      }
    }
  }

  onUnitKerjaChange(event: Event) {
    const unitKerjaId = (event.target as HTMLSelectElement).value;
    for (const unitKerja of this.unitKerjaList) {
      if (unitKerja.id == unitKerjaId) {
        this.addSiapReportForm.get("unitKerjaId").setValue(unitKerja.id)
        this.addSiapReportForm.get("unitKerjaName").setValue(unitKerja.name)
        break;
      } else {
        this.addSiapReportForm.get("unitKerjaId").setValue('')
        this.addSiapReportForm.get("unitKerjaName").setValue('')
      }
    }
  }

  onProvinsiChange(event: Event) {
    const provinsiId = (event.target as HTMLSelectElement).value;
    for (const provinsi of this.provinsiList) {
      if (provinsi.id == provinsiId) {
        this.addSiapReportForm.get("provinsiId").setValue(provinsi.id)
        this.addSiapReportForm.get("provinsiName").setValue(provinsi.name)
        break;
      } else {
        this.addSiapReportForm.get("provinsiId").setValue('')
        this.addSiapReportForm.get("provinsiName").setValue('')
      }
    }
  }

  onKabKotaChange(event: Event) {
    const kabKotaId = (event.target as HTMLSelectElement).value;
    for (const kabKota of this.kabKotaList) {
      if (kabKota.id == kabKotaId) {
        this.addSiapReportForm.get("kabKotaId").setValue(kabKota.id)
        this.addSiapReportForm.get("kabKotaName").setValue(kabKota.name)
        break;
      } else {
        this.addSiapReportForm.get("kabKotaId").setValue('')
        this.addSiapReportForm.get("kabKotaName").setValue('')
      }
    }
  }

  onSubmit() {
    if (this.addSiapReportForm.valid) {
      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;

          const reportGenerate = new ReportGenerate();
          reportGenerate.reportId = this.reportId;
          reportGenerate.fileType = this.addSiapReportForm.value.fileType;
          reportGenerate.parameter = {}
          if (this.addSiapReportForm.value.instansiId != '') {
            reportGenerate.parameter.instansiId = this.addSiapReportForm.value.instansiId;
            reportGenerate.parameter.instansiName = this.addSiapReportForm.value.instansiName;
          }
          if (this.addSiapReportForm.value.unitKerjaId != '') {
            reportGenerate.parameter.unitKerjaId = this.addSiapReportForm.value.unitKerjaId;
            reportGenerate.parameter.unitKerjaName = this.addSiapReportForm.value.unitKerjaName;
          }
          if (this.addSiapReportForm.value.provinsiId != '') {
            reportGenerate.parameter.provinsiId = this.addSiapReportForm.value.provinsiId;
            reportGenerate.parameter.provinsiName = this.addSiapReportForm.value.provinsiName;
          }
          if (this.addSiapReportForm.value.kabKotaId != '') {
            reportGenerate.parameter.kabKotaId = this.addSiapReportForm.value.kabKotaId;
            reportGenerate.parameter.kabKotaName = this.addSiapReportForm.value.kabKotaName;
          }

          this.apiService.postData('/api/v1/report_generate', reportGenerate).subscribe({
            next: () => {
              this.handlerService.handleAlert("Success", "Report Generating")
              window.location.reload();
            }
          })
        }
      })
    }
  }

}
