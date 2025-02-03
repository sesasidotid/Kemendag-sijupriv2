import { Routes } from '@angular/router'
import { authGuard } from '../modules/base/guards/auth.guard'
import { RouteLoader } from '../modules/base/commons/route-loader'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        '../sijupri-instansi/template/sijupri-instansi/sijupri-instansi.component'
      ).then(m => m.SijupriInstansiComponent),
    canActivate: [authGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./template/profile/profile.component').then(
            m => m.ProfileComponent
          ),
        data: {
          title: 'Profile'
        }
      },
      ...(RouteLoader.loadRouter({
        Maintenance: {
          'Unit Kerja': {
            components: () =>
              import(
                '../sijupri-instansi/maintenance/unit-kerja-list/unit-kerja-list.component'
              ).then(m => m.UnitKerjaListComponent),
            routes: [
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-instansi/maintenance/unit-kerja-add/unit-kerja-add.component'
                  ).then(m => m.UnitKerjaAddComponent)
              }
            ]
          }
        },
        SIAP: {
          'User JF': {
            components: () =>
              import('../sijupri-instansi/siap/jf-list/jf-list.component').then(
                m => m.JfListComponent
              ),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-instansi/siap/jf-detail/jf-detail.component'
                  ).then(m => m.JfDetailComponent)
              }
            ]
          },
          'User Instansi': {
            components: () =>
              import(
                '../sijupri-instansi/siap/user-instansi-list/user-instansi-list.component'
              ).then(m => m.UserInstansiListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    './siap/user-instasi-detail/user-instasi-detail.component'
                  ).then(m => m.UserInstasiDetailComponent)
              }
            ]
          },
          'User Unit Kerja': {
            components: () =>
              import(
                '../sijupri-instansi/siap/user-unit-kerja-list/user-unit-kerja-list.component'
              ).then(m => m.UserUnitKerjaListComponent),
            routes: [
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-instansi/siap/user-unit-kerja-add/user-unit-kerja-add.component'
                  ).then(m => m.UserUnitKerjaAddComponent)
              },
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    './siap/user-unit-kerja-detail/user-unit-kerja-detail.component'
                  ).then(m => m.UserUnitKerjaDetailComponent)
              }
            ]
          }
        }
      }) ?? [])
    ]
  }
]
