import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DashboardComponent } from './dashboard.component'

describe('DashboardComponent', () => {
    let component: DashboardComponent
    let fixture: ComponentFixture<DashboardComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(DashboardComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should display welcome message', () => {
        const compiled = fixture.nativeElement as HTMLElement
        expect(compiled.querySelector('.welcome-title')?.textContent).toContain(
            'Selamat Datang',
        )
    })

    it('should format current date correctly', () => {
        const formattedDate = component.formattedCurrentDate()
        expect(formattedDate).toMatch(/\w+, \d+ \w+ \d{4}/)
    })

    it('should group exams by status', () => {
        const grouped = component.groupedExams()
        expect(grouped.length).toBeGreaterThan(0)
        expect(grouped[0]).toHaveProperty('status')
        expect(grouped[0]).toHaveProperty('displayName')
    })

    it('should identify ongoing exam correctly', () => {
        const ongoing = component.ongoingExam()
        if (ongoing) {
            expect(ongoing.status).toBe('ongoing')
        }
    })

    it('should format date range correctly', () => {
        const result = component.formatDateRange(
            '2025-12-16 13:55:00',
            '2025-12-17 13:55:00',
        )
        expect(result).toBeTruthy()
        expect(typeof result).toBe('string')
    })

    it('should toggle completed exams visibility', () => {
        const initialState = component.showCompletedExams()
        component.toggleCompletedExams()
        expect(component.showCompletedExams()).toBe(!initialState)
    })
})
