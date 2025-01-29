import { Component, OnDestroy, OnInit } from '@angular/core'
import { TopBarComponent } from '../../app/Velzon/top-bar/top-bar.component'
import { SideBarComponent } from '../../app/Velzon/side-bar/side-bar.component'
import { FooterComponent } from '../../app/Velzon/footer/footer.component'
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  ActivatedRoute,
  RouterLink
} from '@angular/router'
import { ConfirmationDialogComponent } from '../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../../modules/base/components/file-preview/file-preview.component'
import { Tab, TabService } from '../../modules/base/services/tab.service'
import { Subscription } from 'rxjs'
import { CommonModule } from '@angular/common'
import { filter, map } from 'rxjs/operators'
import { LoginContext } from '../../modules/base/commons/login-context'
import { MainComponent } from '../../app/Velzon/main/main.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TopBarComponent,
    SideBarComponent,
    FooterComponent,
    RouterOutlet,
    ConfirmationDialogComponent,
    FilePreviewComponent,
    MainComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
