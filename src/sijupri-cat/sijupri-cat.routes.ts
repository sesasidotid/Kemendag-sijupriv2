import { Routes } from '@angular/router'
import { authGuard } from '../modules/base/guards/auth.guard'
import { RouteLoader } from '../modules/base/commons/route-loader'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            m => m.DashboardComponent
          )
      }
      //   {
      //     path: 'cat',
      //     loadComponent: () =>
      //       import('./cat-page/cat-page.component').then(m => m.CatPageComponent)
      //   }
    ]
  },
  {
    path: 'cat',
    loadComponent: () =>
      import('./cat-page/cat-page.component').then(m => m.CatPageComponent)
  }
]
