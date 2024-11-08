import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AkpTaskService } from '../../../akp/services/akp-task.service';
import { AKPByReviewer } from '../../../akp/models/akp-by-reviewer.model';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

interface Option {
    id: number;
    label: string;
}

@Component({
    selector: 'app-akp-grading',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, CommonModule, EmptyStateComponent],
    templateUrl: './akp-grading.component.html',
    styleUrl: './akp-grading.component.scss'
})
export class AKPGradingComponent {
    form!: FormGroup;
    AKPId: string;
    whoIs: string;

    AKPGrading = new AKPByReviewer();

    AKPLoading$ = new BehaviorSubject<boolean>(true);
    AKPSumbitLoading$ = new BehaviorSubject<boolean>(false);

    isIDValid$ = new BehaviorSubject<boolean>(true);
    AKPStatus$ = new BehaviorSubject<string>('');

    options: Option[] = [
        { id: 1, label: 'Tidak Mampu' },
        { id: 2, label: 'Cukup Mampu' },
        { id: 3, label: 'Mampu' }
    ];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private akpTaskService: AkpTaskService,
        private fb: FormBuilder,
        private alertService: AlertService,
    ) {
        this.activatedRoute.paramMap.subscribe(params => {
            this.AKPId = params.get('id');
            if (params.get('whoIs') === '1') {
                this.whoIs = 'atasan';
            } else if (params.get('whoIs') === '2') {
                this.whoIs = 'rekan';
            } else {
                this.router.navigate(['/not-found']);
            }
        });
    }

    ngOnInit() {
        this.getAKPGrading();
        this.form = this.fb.group({
            answers: this.fb.array([])  // Create an empty FormArray
        });

        this.AKPLoading$.subscribe((loading) => {
            if (!loading && this.AKPGrading.status !== 'FINISHED') {
                this.addQuestions();
            }
        })
    }
    ngOnDestroy() {
        this.AKPLoading$.unsubscribe();
        this.AKPSumbitLoading$.unsubscribe();
        this.isIDValid$.unsubscribe();
        this.AKPStatus$.unsubscribe();
    }

    addQuestions(): void {
        this.AKPGrading.kategoriInstrumentList.forEach(category => {
            category.pertanyaanList.forEach(question => {
                const controlName = 'question_' + category.id + question.id // Use the same naming convention
                const control = this.fb.control(1); // Initialize each question control
                // Set the control name to be used later if needed
                this.form.addControl(controlName, control); // Add the control to the form
            });
        });
        console.log(this.form)
    }

    onSubmit(): void {
        const submittedValuesBoss: any = {
            id: this.AKPId,
            matrix1DtoList: []
        };
        const submittedValuesColleague: any = {
            id: this.AKPId,
            matrix1DtoList: []
        };


        this.AKPGrading.kategoriInstrumentList.forEach(category => {
            category.pertanyaanList.forEach(question => {
                const controlName = 'question_' + category.id + question.id
                const controlValue = this.form.get(controlName)?.value;

                if (controlValue !== undefined) {
                    if (this.whoIs === 'atasan') {
                        submittedValuesBoss.matrix1DtoList.push({
                            pertanyaanId: question.id,
                            nilaiAtasan: controlValue
                        });
                    } else if (this.whoIs === 'rekan') {
                        submittedValuesColleague.matrix1DtoList.push({
                            pertanyaanId: question.id, // Use the question ID
                            nilaiRekan: controlValue // Use the value from the control
                        });
                    }
                }
            });
        });

        if (this.whoIs === 'atasan') {
            console.log('submittedValuesBoss', submittedValuesBoss);
            this.akpTaskService.saveAKPReviewByBoss(submittedValuesBoss).subscribe({
                next: () => {
                    window.location.reload();
                }
            })
        } else if (this.whoIs === 'rekan') {
            console.log('submittedValuesColleague', submittedValuesColleague);
            this.akpTaskService.saveAKPReviewByColleague(submittedValuesColleague).subscribe({
                next: () => {
                    window.location.reload();
                },
                error: (error) => {
                    this.alertService.showToast('Error', error.message);
                }
            })
        }
    }

    getAKPGrading() {
        this.AKPLoading$.next(true);
        this.akpTaskService.getAKPByReviewer(this.AKPId, this.whoIs).subscribe({
            next: (response) => {
                this.AKPGrading = response;
                if (this.AKPGrading.status) {
                    this.AKPStatus$.next(this.AKPGrading.status);
                }
                this.AKPLoading$.next(false);
                this.isIDValid$.next(true);
                console.log('AKPGrading', this.AKPGrading);
            },
            error: (error) => {
                console.error('Error fetching data', error);
                this.AKPLoading$.next(false);
                this.isIDValid$.next(false);
            }
        });
    }
}
