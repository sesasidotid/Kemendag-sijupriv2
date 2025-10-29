import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LandingPageComponent } from '../landing-page/landing-page.component'

@Component({
    selector: 'app-privacy-policy',
    standalone: true,
    imports: [CommonModule, LandingPageComponent],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent {}
