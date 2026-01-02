import { Component, inject, OnInit, signal } from '@angular/core'
import { AssessmentFormComponent } from '@/siukom-examiner/wawancara/assessment-form/assessment-form.component'
import { ActivatedRoute } from '@angular/router'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-wawancara',
    standalone: true,
    imports: [CommonModule, AssessmentFormComponent],
    templateUrl: './wawancara.component.html',
    styleUrl: './wawancara.component.scss',
})
export class WawancaraComponent implements OnInit {
    examId: string | null
    participantId: string | null

    loadingQuestions = signal(false)

    private route = inject(ActivatedRoute)
    private handlerService = inject(HandlerService)
    private examService = inject(ExamService)

    ngOnInit() {
        this.examId = this.route.snapshot.paramMap.get('id')
        this.participantId = this.route.snapshot.paramMap.get('participantId')
        this.fetchQuestionsToGrade()
    }

    fetchQuestionsToGrade() {
        this.loadingQuestions.set(true)
        this.examService
            .getExamQuestionsByScheduleAndParticipant(
                this.examId,
                this.participantId,
            )
            .pipe(finalize(() => this.loadingQuestions.set(false)))
            .subscribe({
                next: (result) => {
                    console.log(result)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data pertanyaan untuk dinilai.',
                    )
                },
            })
    }
}
