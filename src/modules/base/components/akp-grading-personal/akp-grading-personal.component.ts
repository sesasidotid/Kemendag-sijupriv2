import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AkpTaskService } from '../../../akp/services/akp-task.service';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { AKPByPersonal } from '../../../akp/models/akp-by-personal.model';

interface Option {
    id: number;
    label: string;
}

interface MQuestion {
    formControlName: string;
    question: string;
    options: Option[];
}

interface Matrix2_3Questions {
    M2: MQuestion[]
    M3: MQuestion[]
}

type InputData = Record<string, number>;

type Matrix1D = { pertanyaanId: number; nilaiYbs: number };
type Matrix2D = {
    pertanyaanId: number;
    nilai_penugasan: number;
    nilai_materi: number;
    nilai_informasi: number;
    nilai_standar: number;
    nilai_metode: number;
    nilaiRekan?: number;  // added optional field
    nilaiAtasan?: number; // added optional field
};
type Matrix3D = {
    pertanyaanId: number;
    nilai_waktu: number;
    nilai_kesulitan: number;
    nilai_kualitas: number;
    nilai_pengaruh: number;
};

interface OutputData {
    id: string;
    matrix1DtoList: Matrix1D[];
    matrix2DtoList: Matrix2D[];
    matrix3DtoList: Matrix3D[];
}


@Component({
    selector: 'app-akp-grading-personal',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, CommonModule, EmptyStateComponent],
    templateUrl: './akp-grading-personal.component.html',
    styleUrl: './akp-grading-personal.component.scss'
})
export class AKPGradingPersonalComponent {
    form!: FormGroup;
    @Input() AKPId: string;
    @Input() backButonAction: () => void = () => {};

    AKPGrading = new AKPByPersonal();

    AKPLoading$ = new BehaviorSubject<boolean>(true);
    submitLoading$ = new BehaviorSubject<boolean>(false);

    optionsM1: Option[] = [
        { id: 1, label: 'Tidak Mampu' },
        { id: 2, label: 'Cukup Mampu' },
        { id: 3, label: 'Mampu' }
    ];

    matrix2_3Questions: Matrix2_3Questions = {
        M2: [
            {
                formControlName: 'nilai_penugasan',
                question: 'Anda belum mendapatkan penugasan tersebut',
                options: [
                    { id: 1, label: 'Tidak Mampu' },
                    { id: 0, label: 'Cukup Mampu' },
                ]
            },
            {
                formControlName: 'nilai_materi',
                question: 'Anda belum menguasai materi tersebut',
                options: [
                    { id: 1, label: 'Tidak Mampu' },
                    { id: 0, label: 'Cukup Mampu' },
                ]
            },
            {
                formControlName: 'nilai_informasi',
                question: 'Anda tidak update terhadap informasi tersebut',
                options: [
                    { id: 1, label: 'Tidak Mampu' },
                    { id: 0, label: 'Cukup Mampu' },
                ]
            },
        ],
        M3: [
            {
                formControlName: 'nilai_waktu',
                question: 'Waktu Penyelesaian Pekerjaan',
                options: [
                    { id: 1, label: 'Normal' },
                    { id: 3, label: 'Lambat' },
                    { id: 5, label: 'Sangat Lambat' },
                ]
            },
            {
                formControlName: 'nilai_kesulitan',
                question: 'Tingkat Kesulitan Dalam Menyelesaikan Pekerjaan',
                options: [
                    { id: 1, label: 'Normal' },
                    { id: 3, label: 'Sulit' },
                    { id: 5, label: 'Sangat Sulit' },
                ]
            },
            {
                formControlName: 'nilai_kualitas',
                question: 'Kualitas Hasil Kerja',
                options: [
                    { id: 1, label: 'Cukup Baik' },
                    { id: 3, label: 'Kurang Baik' },
                    { id: 5, label: 'Buruk' },
                ]
            },
            {
                formControlName: 'nilai_pengaruh',
                question: 'Dampak Terhadap Layanan yang Diberikan',
                options: [
                    { id: 1, label: 'Berdampak Kecil' },
                    { id: 3, label: 'Berdampak Besar' },
                    { id: 5, label: 'Berdampak Sangat Besar' },
                ]
            }
        ]
    }

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private akpTaskService: AkpTaskService,
        private fb: FormBuilder,
        private alertService: AlertService,
    ) {

    }

    ngOnInit() {
        this.getAKPGradingPersonal();

        this.AKPLoading$.subscribe((loading) => {
            if (!loading) {

            }
        })
    }

    createForm() {
        // Explicitly type `controls` to allow dynamic keys
        const controls: { [key: string]: FormControl } = {};

        this.AKPGrading.dataPertanyaanList.forEach(question => {
            const controlYbs = `${question.pertanyaanId}_nilaiYbs`;
            const controlAtasan = `${question.pertanyaanId}_nilaiAtasan`;
            const controlRekan = `${question.pertanyaanId}_nilaiRekan`;
            const controlPenugasan = `${question.pertanyaanId}_nilai_penugasan`;
            const controlMateri = `${question.pertanyaanId}_nilai_materi`;
            const controlInformasi = `${question.pertanyaanId}_nilai_informasi`;
            const controlStandar = `${question.pertanyaanId}_nilai_standar`;
            const controlMetode = `${question.pertanyaanId}_nilai_metode`;
            const controlWaktu = `${question.pertanyaanId}_nilai_waktu`;
            const controlKesulitan = `${question.pertanyaanId}_nilai_kesulitan`;
            const controlKualitas = `${question.pertanyaanId}_nilai_kualitas`;
            const controlPengaruh = `${question.pertanyaanId}_nilai_pengaruh`;

            controls[controlYbs] = new FormControl(1);
            controls[controlAtasan] = new FormControl(question.nilaiAtasan);
            controls[controlRekan] = new FormControl(question.nilaiRekan);
            controls[controlPenugasan] = new FormControl(1);
            controls[controlMateri] = new FormControl(1);
            controls[controlInformasi] = new FormControl(1);
            controls[controlStandar] = new FormControl(0);
            controls[controlMetode] = new FormControl(0);
            controls[controlWaktu] = new FormControl(1);
            controls[controlKesulitan] = new FormControl(1);
            controls[controlKualitas] = new FormControl(1);
            controls[controlPengaruh] = new FormControl(1);

        });

        this.form = new FormGroup(controls);
        console.log('form', this.form);
    }

    getAKPGradingPersonal() {
        this.AKPLoading$.next(true);
        this.akpTaskService.getAKPByPersonal(this.AKPId).subscribe({
            next: (response) => {
                this.AKPGrading = response;
                this.createForm();
                console.log('AKPGrading', this.AKPGrading);
            },
            complete: () => { this.AKPLoading$.next(false); },
            error: (error) => {
                console.error('Error fetching data', error);
                this.AKPLoading$.next(false);
            }
        });
    }

    onSubmit() {
      this.AKPLoading$.next(true);
        this.akpTaskService.saveAKPReviewBySelf(this.payloadFormatter(this.form.value)).subscribe({
            next: () => {
                this.alertService.showToast('Success', 'Berhasil menyimpan data');
                this.AKPLoading$.next(false);
                setTimeout(() => {
                    this.router.navigate(['/akp/akp-task']).then(() => { window.location.reload() });
                }, 1000);
            },
            error: (error) => {
                console.error('error', error);
                this.alertService.showToast('Error', error.error.message);
                this.AKPLoading$.next(false);
            }
        });
    }

    payloadFormatter(data: Record<string, any>) {
        const matrix1DtoList: Matrix1D[] = [];
        const matrix2DtoList: Matrix2D[] = [];
        const matrix3DtoList: Matrix3D[] = [];
      
        // Temporary storage to organize data by matrixId
        const tempData: { [matrixId: number]: Matrix1D & Matrix2D & Matrix3D } = {};
      
        for (const [key, value] of Object.entries(data)) {
          const match = key.match(/^(\d+)_([^_]+(?:_[^_]+)*)$/);
          if (!match) continue;
      
          const matrixId = parseInt(match[1], 10); // Get the ID as a number
          const field = match[2]; // Get the remaining part as the field name
      
          // If the matrixId is not initialized, initialize it
          if (!tempData[matrixId]) {
            tempData[matrixId] = {} as Matrix1D & Matrix2D & Matrix3D;
          }
      
          // Organize fields according to the matrix lists
          switch (field) {
            case "nilaiYbs":
              tempData[matrixId].nilaiYbs = value;
              break;
            case "nilaiRekan":
              tempData[matrixId].nilaiRekan = value;
              break;
            case "nilaiAtasan":
              tempData[matrixId].nilaiAtasan = value;
              break;
            case "nilai_penugasan":
              tempData[matrixId].nilai_penugasan = value;
              break;
            case "nilai_materi":
              tempData[matrixId].nilai_materi = value;
              break;
            case "nilai_informasi":
              tempData[matrixId].nilai_informasi = value;
              break;
            case "nilai_standar":
              tempData[matrixId].nilai_standar = value;
              break;
            case "nilai_metode":
              tempData[matrixId].nilai_metode = value;
              break;
            case "nilai_waktu":
              tempData[matrixId].nilai_waktu = value;
              break;
            case "nilai_kesulitan":
              tempData[matrixId].nilai_kesulitan = value;
              break;
            case "nilai_kualitas":
              tempData[matrixId].nilai_kualitas = value;
              break;
            case "nilai_pengaruh":
              tempData[matrixId].nilai_pengaruh = value;
              break;
            default:
              console.warn(`Unrecognized field: ${field}`);
          }
        }
      
        // Build the final lists by converting tempData
        for (const [matrixIdStr, values] of Object.entries(tempData)) {
          const pertanyaanId = parseInt(matrixIdStr, 10);
      
          // Push to matrix1DtoList if nilaiYbs exists
          if ("nilaiYbs" in values) {
            matrix1DtoList.push({ pertanyaanId, nilaiYbs: values.nilaiYbs as number });
          }
      
          // Calculate the sum of nilaiYbs, nilaiRekan, and nilaiAtasan
          const sumCondition =
            (values.nilaiYbs ?? 0) + (values.nilaiRekan ?? 0) + (values.nilaiAtasan ?? 0) < 7;
      
          // Conditionally push to matrix2DtoList and matrix3DtoList
          if (sumCondition) {
            // Only push to matrix2DtoList if necessary values exist
            if ("nilai_penugasan" in values || "nilai_materi" in values || "nilai_informasi" in values || "nilai_standar" in values || "nilai_metode" in values) {
              matrix2DtoList.push({
                pertanyaanId,
                nilai_penugasan: values.nilai_penugasan ?? 0,
                nilai_materi: values.nilai_materi ?? 0,
                nilai_informasi: values.nilai_informasi ?? 0,
                nilai_standar: values.nilai_standar ?? 0,
                nilai_metode: values.nilai_metode ?? 0,
              });
            }
      
            // Only push to matrix3DtoList if necessary values exist
            if ("nilai_waktu" in values || "nilai_kesulitan" in values || "nilai_kualitas" in values || "nilai_pengaruh" in values) {
              matrix3DtoList.push({
                pertanyaanId,
                nilai_waktu: values.nilai_waktu ?? 0,
                nilai_kesulitan: values.nilai_kesulitan ?? 0,
                nilai_kualitas: values.nilai_kualitas ?? 0,
                nilai_pengaruh: values.nilai_pengaruh ?? 0,
              });
            }
          }
        }
      

        return {
            id: this.AKPId,
            matrix1DtoList,
            matrix2DtoList,
            matrix3DtoList
        };
    }
}
