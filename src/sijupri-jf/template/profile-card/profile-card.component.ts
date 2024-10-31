import { Component } from '@angular/core';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {
  nip: string = LoginContext.getUserId();
  name: string = LoginContext.getName();

  currentRoute: string = this.router.url;

  constructor(private router: Router) {
  }
}