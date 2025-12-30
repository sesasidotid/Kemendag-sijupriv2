/**
 * EXAMPLE: How to use the Admin Schedule Viewer
 * 
 * This file demonstrates how to integrate the schedule viewer
 * into your existing Angular components.
 */

import { Component, signal } from '@angular/core'
import { UkomExamWawancaraComponent } from './ukom-exam-wawancara.component'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

@Component({
    selector: 'app-schedule-viewer-example',
    standalone: true,
    imports: [UkomExamWawancaraComponent],
    template: `
        <div class="container mt-4">
            <h2>Schedule Viewer Integration Example</h2>
            
            <!-- Load your actual exam data here -->
            <app-ukom-exam-wawancara 
                [examDetail]="mockExamSchedule()">
            </app-ukom-exam-wawancara>
        </div>
    `,
})
export class ScheduleViewerExampleComponent {
    // Mock data for demonstration
    mockExamSchedule = signal<ExamSchedule>(this.createMockSchedule())

    private createMockSchedule(): ExamSchedule {
        // Create mock participants
        const participants: any[] = [
            {
                id: 'ps-001',
                participantId: 'p-001',
                examScheduleId: 'exam-001',
                personalSchedule: '2025-01-15T08:00:00',
                participantUkom: {
                    name: 'Ahmad Susanto',
                    nip: '198501012010011001',
                } as Participant,
            },
            {
                id: 'ps-002',
                participantId: 'p-002',
                examScheduleId: 'exam-001',
                personalSchedule: '2025-01-15T08:30:00',
                participantUkom: {
                    name: 'Siti Nurhaliza',
                    nip: '198602022011012001',
                } as Participant,
            },
            {
                id: 'ps-003',
                participantId: 'p-003',
                examScheduleId: 'exam-001',
                personalSchedule: '2025-01-15T09:00:00',
                participantUkom: {
                    name: 'Budi Hartono',
                    nip: '198703032012011002',
                } as Participant,
            },
            {
                id: 'ps-004',
                participantId: 'p-004',
                examScheduleId: 'exam-001',
                personalSchedule: null, // Not scheduled yet
                participantUkom: {
                    name: 'Dewi Kartika',
                    nip: '198804042013012003',
                } as Participant,
            },
            {
                id: 'ps-005',
                participantId: 'p-005',
                examScheduleId: 'exam-001',
                personalSchedule: '2025-01-15T10:00:00',
                participantUkom: {
                    name: 'Rudi Hermawan',
                    nip: '198905052014011003',
                } as Participant,
            },
        ]

        // Create exam schedule
        const examSchedule = new ExamSchedule({
            id: 'exam-001',
            startTime: '2025-01-15T08:00:00', // 08:00 AM
            endTime: '2025-01-15T18:00:00', // 06:00 PM (10 hours)
            duration: 0.5, // 30 minutes per slot
            examTypeCode: ExamTypeCategory.WAWANCARA,
            roomUkomId: 'room-001',
            secretKey: null,
            participantScheduleList: participants,
            examinerScheduleList: [],
        })

        return examSchedule
    }

    /**
     * INTEGRATION NOTES:
     * 
     * 1. Real Data Integration:
     *    Replace mockExamSchedule() with actual API call:
     *    
     *    constructor(private examService: UkomExamScheduleService) {
     *        this.examService.getExamScheduleDetailById('exam-id')
     *            .subscribe(data => this.examSchedule.set(data))
     *    }
     * 
     * 2. Multiple Exam Schedules:
     *    Add a selector dropdown to switch between exams
     * 
     * 3. Real-time Updates:
     *    Use WebSocket or polling to refresh schedule
     * 
     * 4. Backend API:
     *    Implement the reschedule endpoint:
     *    PUT /api/exam-schedule/{examId}/participant/{participantId}/reschedule
     *    Body: { newPersonalSchedule: "2025-01-15T14:00:00" }
     * 
     * 5. Permissions:
     *    Add role-based access control for reschedule action
     */
}

/**
 * EXAMPLE 2: With Real API Integration
 */
/*
@Component({
    selector: 'app-schedule-viewer-real',
    standalone: true,
    imports: [UkomExamWawancaraComponent, CommonModule],
    template: `
        <div class="container mt-4">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label>Select Exam Schedule:</label>
                    <select class="form-control" 
                            (change)="onExamSelect($event)"
                            [value]="selectedExamId()">
                        <option *ngFor="let exam of examList()" [value]="exam.id">
                            {{ exam.examTypeCode }} - {{ exam.startTime | date:'short' }}
                        </option>
                    </select>
                </div>
            </div>

            <app-ukom-exam-wawancara 
                *ngIf="currentExam()"
                [examDetail]="currentExam()!">
            </app-ukom-exam-wawancara>
        </div>
    `,
})
export class ScheduleViewerRealComponent implements OnInit {
    private examService = inject(UkomExamScheduleService)
    
    examList = signal<ExamSchedule[]>([])
    selectedExamId = signal<string>('')
    currentExam = signal<ExamSchedule | null>(null)

    ngOnInit(): void {
        this.loadExamList()
    }

    loadExamList(): void {
        this.examService.getExamScheduleList()
            .subscribe({
                next: (exams) => {
                    this.examList.set(exams)
                    if (exams.length > 0) {
                        this.selectedExamId.set(exams[0].id)
                        this.loadExamDetail(exams[0].id)
                    }
                }
            })
    }

    loadExamDetail(examId: string): void {
        this.examService.getExamScheduleDetailById(examId)
            .subscribe({
                next: (exam) => this.currentExam.set(exam)
            })
    }

    onExamSelect(event: Event): void {
        const examId = (event.target as HTMLSelectElement).value
        this.selectedExamId.set(examId)
        this.loadExamDetail(examId)
    }
}
*/
