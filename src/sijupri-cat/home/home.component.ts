import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MainComponent } from '../../app/Velzon/main/main.component'

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, MainComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {}
