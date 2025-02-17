import { Routes } from '@angular/router'
import { LoginContext } from '../modules/base/commons/login-context'
import { authGuard } from '../modules/base/guards/auth.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    canActivate: [authGuard],
    pathMatch: 'full'
  },
  getMenus(),
  {
    path: 'login',
    loadComponent: () =>
      import('../modules/auth/components/login/login.component').then(
        m => m.LoginComponent
      )
  },
  {
    path: 'login-cat',
    loadComponent: () =>
      import('../modules/auth/components/login-cat/login-cat.component').then(
        m => m.LoginCatComponent
      )
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./template/not-found/not-found.component').then(
        m => m.NotFoundComponent
      )
  },
  {
    path: 'ukom/external',
    loadComponent: () =>
      import(
        '../modules/base/components/ukom-register/ukom-register.component'
      ).then(m => m.UkomRegisterComponent)
  },
  {
    path: 'ukom/external/status',
    loadComponent: () =>
      import(
        '../modules/base/components/status-pendaftaran-ukom/status-pendaftaran-ukom.component'
      ).then(m => m.StatusPendaftaranUkomComponent)
  },
  {
    path: 'akp-grading/:whoIs/:id',
    loadComponent: () =>
      import(
        '../modules/base/components/akp-grading/akp-grading.component'
      ).then(m => m.AKPGradingComponent)
  },
  {
    path: 'ukm-clarrify',
    loadComponent: () =>
      import(
        '../modules/base/components/reject-ukom-schedule/reject-ukom-schedule.component'
      ).then(m => m.RejectUkomScheduleComponent)
  },
  { path: '**', redirectTo: 'not-found' }
]

function getMenus (): any {
  switch (LoginContext.getApplicationCode()) {
    case 'sijupri-admin':
      return {
        path: '',
        loadChildren: () =>
          import('../sijupri-admin/sijupri-admin.module').then(
            m => m.SijupriAdminModule
          )
      }
    case 'sijupri-instansi':
      return {
        path: '',
        loadChildren: () =>
          import('../sijupri-instansi/sijupri-instansi.module').then(
            m => m.SijupriInstansiModule
          )
      }
    case 'sijupri-unit-kerja':
      return {
        path: '',
        loadChildren: () =>
          import('../sijupri-unit-kerja/sijupri-unit-kerja.module').then(
            m => m.SijupriUnitKerjaModule
          )
      }
    case 'sijupri-external':
      return {
        path: '',
        loadChildren: () =>
          import('../sijupri-jf/sijupri-jf.module').then(m => m.SijupriJfModule)
      }
    case 'sijupri-internal':
      return {
        path: '',
        loadChildren: () =>
          import('../sijupri-jf/sijupri-jf.module').then(m => m.SijupriJfModule)
      }
    case 'siukom-participant':
      return {
        path: '',
        loadChildren: () =>
          import('../sijupri-cat/sijupri-cat.module').then(
            m => m.SijupriCAtModule
          )
      }
    default:
      return {
        path: '',
        loadComponent: () =>
          import('../modules/landing-page/landing-page.component').then(
            m => m.LandingPageComponent
          )
      }
  }
}
