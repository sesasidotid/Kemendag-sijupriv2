import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { ScheduleTimelineComponent } from './schedule-timeline.component'
import { ScheduleTimelineTableComponent } from './schedule-timeline-table.component'
import { ScheduleItem } from './schedule-timeline.component'

type ViewMode = 'gantt' | 'table'

@Component({
    selector: 'app-schedule-timeline-modal',
    standalone: true,
    imports: [CommonModule, ScheduleTimelineComponent, ScheduleTimelineTableComponent],
    template: `
        <div class="timeline-modal-container">
            <!-- View Toggle -->
            <div class="view-toggle-section">
                <div class="btn-group" role="group">
                    <button
                        type="button"
                        class="btn btn-sm"
                        [class.btn-primary]="(viewMode$ | async) === 'gantt'"
                        [class.btn-outline-primary]="(viewMode$ | async) !== 'gantt'"
                        (click)="setViewMode('gantt')"
                    >
                        <i class="ri-bar-chart-horizontal-line me-1"></i>
                        Gantt Chart
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm"
                        [class.btn-primary]="(viewMode$ | async) === 'table'"
                        [class.btn-outline-primary]="(viewMode$ | async) !== 'table'"
                        (click)="setViewMode('table')"
                    >
                        <i class="ri-table-line me-1"></i>
                        Tabel
                    </button>
                </div>
            </div>

            <!-- Gantt View -->
            <div *ngIf="(viewMode$ | async) === 'gantt'" class="view-content">
                <app-schedule-timeline
                    [schedules]="schedules"
                    (closeTimeline)="close()"
                ></app-schedule-timeline>
            </div>

            <!-- Table View -->
            <div *ngIf="(viewMode$ | async) === 'table'" class="view-content">
                <app-schedule-timeline-table
                    [schedules]="schedules"
                    (closeTimeline)="close()"
                ></app-schedule-timeline-table>
            </div>
        </div>
    `,
    styles: [`
        .timeline-modal-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 500px;
        }

        .view-toggle-section {
            display: flex;
            justify-content: center;
            padding: 12px 16px;
            background-color: #fff;
            border-bottom: 1px solid #dee2e6;
            flex-shrink: 0;

            .btn-group {
                .btn {
                    padding: 6px 16px;
                    font-size: 13px;
                    font-weight: 500;
                }
            }
        }

        .view-content {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;

            app-schedule-timeline,
            app-schedule-timeline-table {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleTimelineModalComponent {
    @Input() schedules: ScheduleItem[] = []
    @Input() defaultView: ViewMode = 'gantt'
    @Output() closeTimeline = new EventEmitter<void>()

    viewMode$ = new BehaviorSubject<ViewMode>('gantt')

    ngOnInit(): void {
        this.viewMode$.next(this.defaultView)
    }

    setViewMode(mode: ViewMode): void {
        this.viewMode$.next(mode)
    }

    close(): void {
        this.closeTimeline.emit()
    }
}
