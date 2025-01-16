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

  readonly BookOpenText = BookOpenText
  readonly ScrollText = ScrollText
  readonly FileText = FileText

  //   getIcon (menuCode: string): any {
  //     const iconMap: { [key: string]: any } = {
  //       MNU_AKP0001: BookOpenText,
  //       MNU_AKPJE001: BookOpenText,
  //       MNU_FOR0001: FileText,
  //       MNU_FORU0001: FileText,
  //       MNU_FORJE001: FileText,
  //       MNU_PAK0001: SquareActivity,
  //       MNU_UKM0001: ScrollText,
  //       MNU_UKMJE001: ScrollText,
  //       MNU_SIP0001: BookUser,
  //       MNU_SIPU0001: BookUser,
  //       MNU_SIPI0001: BookUser,
  //       MNU_SEC0001: UserRoundCog,
  //       MNU_MNT0001: Database,
  //       MNU_MNTI0001: Database
  //     }

  //     return iconMap[menuCode] || LayoutDashboard // Default to Menu icon if no match
  //   }
}
