import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  id: string;
  name: string;

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router) {
    this.id = LoginContext.getUserId();
    this.name = LoginContext.getName();
  }

  toggelSidebar() {
    this.document.body.classList.toggle('toggle-sidebar');
  }

  logOut() {
    LoginContext.release();
    this.router.navigate(['/login'])
  }
}
