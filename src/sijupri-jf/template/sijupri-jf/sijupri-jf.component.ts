import { Component, Inject } from '@angular/core'
import { MainComponent } from '../../../app/Velzon/main/main.component'
import { DOCUMENT } from '@angular/common'

@Component({
  selector: 'app-sijupri-jf',
  standalone: true,
  imports: [MainComponent],
  templateUrl: './sijupri-jf.component.html',
  styleUrl: './sijupri-jf.component.scss'
})
export class SijupriJfComponent {
  constructor (@Inject(DOCUMENT) private document: Document) {
    this.document.documentElement.setAttribute('data-layout', 'horizontal')
  }
}
