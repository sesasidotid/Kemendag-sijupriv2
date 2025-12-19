import { Component } from '@angular/core'
import { AssessmentFormComponent } from '@/siukom-examiner/wawancara/assessment-form/assessment-form.component'

@Component({
    selector: 'app-wawancara',
    standalone: true,
    imports: [AssessmentFormComponent],
    templateUrl: './wawancara.component.html',
    styleUrl: './wawancara.component.scss',
})
export class WawancaraComponent {}
