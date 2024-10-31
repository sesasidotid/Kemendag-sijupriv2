import { Component } from '@angular/core';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProfileCardComponent } from '../profile-card/profile-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ProfileCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
}