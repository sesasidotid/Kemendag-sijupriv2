import { Component, Input } from '@angular/core';
import { DokumenPersyaratanService } from '../../../../modules/maintenance/services/dokumen-persyaratan.service';
import { DokumenPersyaratan } from '../../../../modules/maintenance/models/dokumen-persyaratan.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormasiService } from '../../../../modules/formasi/services/formasi.service';
import { FormasiRequest } from '../../../../modules/formasi/models/formasi-request.model';
import { FormasiDokumen } from '../../../../modules/formasi/models/formasi-dokumen.model';
import { take } from 'rxjs';
import { LoginContext } from '../../../../modules/base/commons/login-context';
import { ObjectTaskService } from '../../../../modules/workflow/services/object-task.service';
import { ObjectTask } from '../../../../modules/workflow/models/object-task.model';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';

@Component({
  selector: 'app-formasi-dokumen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formasi-dokumen.component.html',
  styleUrl: './formasi-dokumen.component.scss'
})
export class FormasiDokumenComponent {
  formasiDokumenList: FormasiDokumen[] = [];
  formasiRequest: FormasiRequest = new FormasiRequest();

  @Input() objectTaskId: string;

  constructor(
    private formasiService: FormasiService,
    private dokumenPersyaratan: DokumenPersyaratanService,
    private objectTaskService: ObjectTaskService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit() {
    if (this.objectTaskId) {
      this.getDokumenPersyaratanListFromObjecTask();
    }
    else {
      this.getDokumenPersyaratanList();
    }
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.formasiDokumenList[index].status = "PENDING";
        this.formasiDokumenList[index].dokumenFile = (reader.result as string);
      };

      reader.onerror = (error) => {
        console.error('Error: ', error);
      };
    }
  }

  getDokumenPersyaratanList() {
    this.dokumenPersyaratan.findByAssociation("for_formasi").subscribe({
      next: (dokumenPersyaratanList: DokumenPersyaratan[]) => {
        this.formasiDokumenList.length = 0;
        dokumenPersyaratanList.forEach(dokumenPersyaratan => {
          const formasiDokumen: FormasiDokumen = new FormasiDokumen();
          formasiDokumen.dokumenName = dokumenPersyaratan.name;
          this.formasiDokumenList.push(formasiDokumen);
        });
      },
    })
  }

  getDokumenPersyaratanListFromObjecTask() {
    this.objectTaskService.findById(this.objectTaskId).subscribe({
      next: (objectTask: ObjectTask) => {
        this.formasiDokumenList.length = 0;
        const dokumenPersyaratanList = objectTask.object;
        for (const dokumenPersyaratan of dokumenPersyaratanList) {
          this.formasiDokumenList.push(dokumenPersyaratan);
        }
      },
    })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;


        this.formasiRequest.formasiDokumenList = this.formasiDokumenList;
        this.formasiRequest.unitKerjaId = LoginContext.getUnitKerjaId();
        this.formasiService.saveTask(this.formasiRequest).subscribe({
          next: () => { window.location.reload() },
        })
      }
    });
  }
}
