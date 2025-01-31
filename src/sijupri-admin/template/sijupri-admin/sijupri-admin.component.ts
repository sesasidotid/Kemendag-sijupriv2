import { Component } from '@angular/core'
import { MainComponent } from '../../../app/Velzon/main/main.component'
import { ProfileCardComponent } from '../../../modules/base/components/profile-card/profile-card.component'
@Component({
  selector: 'app-sijupri-admin',
  standalone: true,
  imports: [MainComponent, ProfileCardComponent],
  templateUrl: './sijupri-admin.component.html',
  styleUrl: './sijupri-admin.component.scss'
})
export class SijupriAdminComponent {}
