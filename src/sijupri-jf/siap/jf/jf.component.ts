import { Component } from '@angular/core'
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router'

@Component({
  selector: 'app-jf',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './jf.component.html',
  styleUrl: './jf.component.scss'
})
export class JfComponent {
  currentPath: string

  constructor (private router: Router) {}

  ngOnInit (): void {
    this.getCurrentPath()
  }

  getCurrentPath (): void {
    this.currentPath = this.router.url.replace('pending', '').replace('add', '')
  }
}
