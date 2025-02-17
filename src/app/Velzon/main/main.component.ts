import { Component, OnDestroy, OnInit } from '@angular/core'
import { TopBarComponent } from '../top-bar/top-bar.component'
import { SideBarComponent } from '../side-bar/side-bar.component'
import { FooterComponent } from '../footer/footer.component'
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  ActivatedRoute,
  RouterLink
} from '@angular/router'
import { ConfirmationDialogComponent } from '../../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../../../modules/base/components/file-preview/file-preview.component'
import { Tab, TabService } from '../../../modules/base/services/tab.service'
import { Subscription } from 'rxjs'
import { CommonModule } from '@angular/common'
import { filter, map } from 'rxjs/operators'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TopBarComponent,
    SideBarComponent,
    FooterComponent,
    RouterOutlet,
    ConfirmationDialogComponent,
    FilePreviewComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  title: string = ''
  routeTrail: { path: string; title: string }[] = []

  private routerSubscription: Subscription
  private tabSubscription: Subscription
  tabs: Tab[] = []

  applicationCode: string = LoginContext.getApplicationCode()

  constructor (
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tabService: TabService
  ) {}

  ngOnInit (): void {
    const initialRoute = this.getActiveRoute(this.activatedRoute)
    this.updateRouteData(initialRoute)
    this.buildRouteTrail(initialRoute)

    this.tabSubscription = this.tabService.tabs$.subscribe(tabs => {
      this.tabs = tabs
    })

    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.getActiveRoute(this.activatedRoute))
      )
      .subscribe(activeRoute => {
        this.tabService.clearTabs()
        this.updateRouteData(activeRoute)
        this.buildRouteTrail(activeRoute)
      })
  }

  isCurrentRouteMatching (): boolean {
    const currentUrl = this.router.url
    const outletPath = this.activatedRoute.routeConfig?.path || ''
    return currentUrl === `/${outletPath}`
  }

  ngOnDestroy (): void {
    if (this.routerSubscription) this.routerSubscription.unsubscribe()
    if (this.tabSubscription) this.tabSubscription.unsubscribe()
  }

  onTabClick (tab: any): void {
    tab.onClick()
  }

  private getActiveRoute (route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild
    }
    return route
  }

  private updateRouteData (activeRoute: ActivatedRoute): void {
    const data = activeRoute.snapshot.data

    if (data) {
      this.title = data['title'] || ''
    }
  }

  private buildRouteTrail (route: ActivatedRoute): void {
    this.routeTrail = []

    let currentRoute: ActivatedRoute | null = route
    while (currentRoute) {
      const routeData = currentRoute.snapshot.data
      const routePath = currentRoute.snapshot.routeConfig?.path || ''

      if (routeData && routeData['title']) {
        this.routeTrail.push({
          path: routePath,
          title: routeData['title']
        })
      }

      currentRoute = currentRoute.parent
    }

    this.routeTrail.reverse()

    if (this.routeTrail.length > 1) {
      const indexToDelete = this.routeTrail.length - 2 // Index before last
      this.routeTrail.splice(indexToDelete, 1) // Remove the element at that index
    }
  }
}
