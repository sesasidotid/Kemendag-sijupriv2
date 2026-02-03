import { Component, OnInit, signal } from '@angular/core'
import { CommonModule, KeyValuePipe } from '@angular/common'
import { JabatanSelectionComponent } from './jabatan-selection/jabatan-selection.component'
import { UploadDataDukungComponent } from '@/sijupri-unit-kerja/formasi/pendaftaran-formasi/upload-data-dukung/upload-data-dukung.component'

/**
 * Task history interface for tracking workflow status
 */
interface TaskHistory {
    flowId: string
    flowName: string
    taskStatus: 'PENDING' | 'COMPLETED' | 'REJECTED'
    needsRevision: boolean
    remark: string | null
    lastUpdated: Date | null
}

/**
 * Main orchestrator component for the Formasi Registration workflow
 * Handles the complete registration process with multiple steps:
 * 1. Upload data usulan formasi dari settingan super admin
 * 2. Jabatan selection & proposal (delegated to JabatanSelectionComponent)
 * 3. Document upload for non-proposed positions
 * 4. Verification schedule & invitation letter viewing
 * 5. BA (Berita Acara) download, upload, and final download workflow
 * 6. Formation recommendation letter, Menpan RB approval, and mapping table
 */
@Component({
    selector: 'app-pendaftaran-formasi',
    standalone: true,
    imports: [
        CommonModule,
        JabatanSelectionComponent,
        KeyValuePipe,
        UploadDataDukungComponent,
    ],
    templateUrl: './pendaftaran-formasi.component.html',
    styleUrl: './pendaftaran-formasi.component.scss',
})
export class PendaftaranFormasiComponent implements OnInit {
    // Current step in the registration workflow (1-6)
    // Step 1: Upload Data Usulan (outside stepper)
    // Steps 2-6: Inside stepper (Jabatan, Document Upload, Verification, BA, Final Docs)
    currentStep = signal(2)

    // Grouped task history by step
    groupedTaskHistory: Record<number, TaskHistory[]> = {}

    ngOnInit() {
        // Initialize workflow orchestration
        this.initializeWorkflow()
        this.loadTaskHistory()
    }

    handleStepClick(step: number) {
        // Allow navigation to completed steps or current step
        const canNavigate =
            step <= this.currentStep() || this.isStepAccessible(step)
        if (canNavigate) {
            this.currentStep.set(step)
        }
    }

    handleTaskClick(history: TaskHistory) {
        // Handle clicking on a task that needs revision
        console.log('Task clicked for revision:', history)
        // TODO: Open modal or navigate to revision form
        // TODO: Implement revision modal similar to status-pendaftaran-ukom
    }

    getTaskIcon(flowId: string): string {
        const iconMap: Record<string, string> = {
            formasi_flow_1: 'mdi mdi-file-upload-outline',
            formasi_flow_2: 'mdi mdi-briefcase-check-outline',
            formasi_flow_3: 'mdi mdi-file-document-outline',
            formasi_flow_4: 'mdi mdi-calendar-check-outline',
            formasi_flow_5: 'mdi mdi-file-sign',
            formasi_flow_6: 'mdi mdi-certificate-outline',
        }
        return iconMap[flowId] || 'mdi mdi-file-outline'
    }

    private initializeWorkflow() {
        // TODO: Load current registration state from service
        // TODO: Determine which step user should be on based on workflow state
        // TODO: Check for any pending notifications or revisions
    }

    private loadTaskHistory() {
        // TODO: Load task history from service
        // Mock data for demonstration
        this.groupedTaskHistory = {
            1: [
                {
                    flowId: 'formasi_flow_1',
                    flowName: 'Upload Data Usulan Formasi',
                    taskStatus: 'COMPLETED',
                    needsRevision: false,
                    remark: null,
                    lastUpdated: new Date('2026-01-15T10:30:00'),
                },
            ],
            2: [
                {
                    flowId: 'formasi_flow_2',
                    flowName: 'Verifikasi Pemilihan Jabatan',
                    taskStatus: 'PENDING',
                    needsRevision: true,
                    remark: 'Mohon perbaiki data volume ruang lingkup pada Jabatan Analis Perdagangan. Volume yang diinput tidak sesuai dengan dokumen pendukung.',
                    lastUpdated: null,
                },
            ],
            3: [
                {
                    flowId: 'formasi_flow_3',
                    flowName: 'Verifikasi Dokumen Pendukung',
                    taskStatus: 'PENDING',
                    needsRevision: false,
                    remark: null,
                    lastUpdated: null,
                },
            ],
            4: [
                {
                    flowId: 'formasi_flow_4',
                    flowName: 'Jadwal Verifikasi',
                    taskStatus: 'PENDING',
                    needsRevision: false,
                    remark: null,
                    lastUpdated: null,
                },
            ],
            5: [
                {
                    flowId: 'formasi_flow_5',
                    flowName: 'Proses Berita Acara',
                    taskStatus: 'PENDING',
                    needsRevision: false,
                    remark: null,
                    lastUpdated: null,
                },
            ],
            6: [
                {
                    flowId: 'formasi_flow_6',
                    flowName: 'Dokumen Formasi',
                    taskStatus: 'PENDING',
                    needsRevision: false,
                    remark: null,
                    lastUpdated: null,
                },
            ],
        }
    }

    private isStepAccessible(step: number): boolean {
        // Check if step has tasks that are accessible
        const tasks = this.groupedTaskHistory[step]
        if (!tasks) return false

        // Allow access to steps with completed or pending tasks
        return tasks.some(
            (task) =>
                task.taskStatus === 'COMPLETED' ||
                task.taskStatus === 'PENDING',
        )
    }
}
