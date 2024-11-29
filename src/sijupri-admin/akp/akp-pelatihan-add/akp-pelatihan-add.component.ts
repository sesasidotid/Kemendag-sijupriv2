import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PelatihanTeknis } from '../../../modules/akp/models/pelatihan-teknis.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Jabatan } from '../../../modules/maintenance/models/jabatan.model';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-akp-pelatihan-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './akp-pelatihan-add.component.html',
  styleUrl: './akp-pelatihan-add.component.scss'
})
export class AkpPelatihanAddComponent {
  @Input() tab: BehaviorSubject<number>;
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter();

  pelatihanTeknis: PelatihanTeknis = new PelatihanTeknis();
  jabatanList: Jabatan[];

  pelatihanTeknisForm: FormGroup;

  submitLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.pelatihanTeknisForm = new FormGroup({
      code: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      jabatanCode: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    this.getJabatanList();
  }

  getJabatanList() {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: (response) => {
        this.jabatanList = response.map((jabatan: { [key: string]: any; }) => new Jabatan(jabatan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data jabatan!");
      }
    })
  }

  submit() {
    if(this.pelatihanTeknisForm.valid) {
      this.apiService.postData('/api/v1/akp_pelatihan_teknis', this.pelatihanTeknisForm.value).subscribe({
        next: (response) => {
          this.alertService.showToast("Success", "Pelatihan Teknis berhasil ditambahkan!");
          setTimeout(() => {
            this.changeTabActive.emit();
          }, 1000); // Adjust the delay as needed
        },
        error: (error) => {
          console.log("error", error);
          this.alertService.showToast("Error", "Gagal menambahkan pelatihan teknis!");
        }
      })
    }
  }
}
