import { Component } from '@angular/core';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  nip: string = LoginContext.getUserId();
  name: string = LoginContext.getName();
}
