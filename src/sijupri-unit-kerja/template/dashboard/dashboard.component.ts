import { Component } from '@angular/core'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { RouterLink } from '@angular/router'
import { ProfileCardComponent } from '../../../modules/base/components/profile-card/profile-card.component'
import {
  LucideAngularModule,
  BookOpenText,
  FileText,
  SquareActivity,
  ScrollText,
  BookUser,
  UserRoundCog,
  Database
} from 'lucide-angular'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ProfileCardComponent, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  nip: string = LoginContext.getUserId()
  name: string = LoginContext.getName()

  readonly icon1 = BookUser
  readonly icon2 = FileText
}
