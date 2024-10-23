import { Component } from '@angular/core';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  nip: string = LoginContext.getUserId();
  name: string = LoginContext.getName();
}