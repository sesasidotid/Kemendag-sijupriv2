import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  id: string;
  name: string;
  role: string[];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {
    this.id = LoginContext.getUserId();
    this.name = LoginContext.getName();
    this.role = LoginContext.getRoleCodes();
  }

  toggelSidebar() {
    const windowSize = this.document.documentElement.clientWidth;

    if (windowSize > 767) {
      this.document.querySelector('.hamburger-icon')?.classList.toggle('open');
    }

    // For collapse horizontal menu
    if (this.document.documentElement.getAttribute('data-layout') === 'horizontal') {
      this.document.body.classList.toggle('menu');
    }

    // For collapse vertical menu
    if (this.document.documentElement.getAttribute('data-layout') === 'vertical') {
      if (windowSize <= 1025 && windowSize > 767) {
        this.document.body.classList.remove('vertical-sidebar-enable');
        this.document.documentElement.getAttribute('data-sidebar-size') === 'sm' ?
          this.document.documentElement.setAttribute('data-sidebar-size', '') :
          this.document.documentElement.setAttribute('data-sidebar-size', 'sm');
      } else if (windowSize > 1025) {
        this.document.body.classList.remove('vertical-sidebar-enable');
        this.document.documentElement.getAttribute('data-sidebar-size') === 'lg' ?
          this.document.documentElement.setAttribute('data-sidebar-size', 'sm') :
          this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
      } else if (windowSize <= 767) {
        this.document.body.classList.add('vertical-sidebar-enable');
        this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
      }
    }

    // Semibox menu
    if (this.document.documentElement.getAttribute('data-layout') === 'semibox') {
      if (windowSize > 767) {
        if (this.document.documentElement.getAttribute('data-sidebar-visibility') === 'show') {
          this.document.documentElement.getAttribute('data-sidebar-size') === 'lg' ?
            this.document.documentElement.setAttribute('data-sidebar-size', 'sm') :
            this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
        } else {
          (this.document.getElementById('sidebar-visibility-show') as HTMLElement)?.click();
          this.document.documentElement.setAttribute('data-sidebar-size', this.document.documentElement.getAttribute('data-sidebar-size') || '');
        }
      } else if (windowSize <= 767) {
        this.document.body.classList.add('vertical-sidebar-enable');
        this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
      }
    }

    // Two column menu
    if (this.document.documentElement.getAttribute('data-layout') === 'twocolumn') {
      this.document.body.classList.toggle('twocolumn-panel');
    }
  }

  logOut() {
    LoginContext.release();
    this.router.navigate(['/login'])
  }
}
