import { Routes } from '@angular/router'
import { authGuard } from '../modules/base/guards/auth.guard'
import { RouteLoader } from '../modules/base/commons/route-loader'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        '../sijupri-unit-kerja/template/sijupri-unit-kerja/sijupri-unit-kerja.component'
      ).then(m => m.SijupriUnitKerjaComponent),
    canActivate: [authGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../sijupri-unit-kerja/template/dashboard/dashboard.component'
          ).then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            '../sijupri-unit-kerja/template/profile/profile.component'
          ).then(m => m.ProfileComponent)
      },
      ...(RouteLoader.loadRouter({
        Formasi: {
          'Pendaftaran Formasi': {
            components: () =>
              import(
                '../sijupri-unit-kerja/formasi/formasi-task/formasi-task.component'
              ).then(m => m.FormasiTaskComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-unit-kerja/formasi/formasi-task/formasi-jabatan/formasi-jabatan.component'
                  ).then(m => m.FormasiJabatanComponent)
              }
            ]
          },
          'Rekomendasi Formasi': {
            components: () =>
              import(
                '../sijupri-unit-kerja/formasi/formasi-rekomendasi/formasi-rekomendasi.component'
              ).then(m => m.FormasiRekomendasiComponent),
            routes: [
              {
                path: ':formasiId',
                loadComponent: () =>
                  import(
                    './formasi/formasi-rekomendasi/formasi-detail/formasi-detail.component'
                  ).then(m => m.FormasiDetailComponent)
              }
            ]
          }
        },
        SIAP: {
          'User JF': {
            components: () =>
              import(
                '../sijupri-unit-kerja/siap/jf-list/jf-list.component'
              ).then(m => m.JfListComponent),
            routes: [
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-unit-kerja/siap/jf-add/jf-add.component'
                  ).then(m => m.JfAddComponent)
              },
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-unit-kerja/siap/jf-detail/jf-detail.component'
                  ).then(m => m.JfDetailComponent)
              }
            ]
          },
          'Verifikasi User JF': {
            components: () =>
              import(
                '../sijupri-unit-kerja/siap/jf-task-list/jf-task-list.component'
              ).then(m => m.JfTaskListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-unit-kerja/siap/jf-task-detail/jf-task-detail.component'
                  ).then(m => m.JfTaskDetailComponent)
              }
            ]
          },
          'User Instansi': {
            components: () =>
              import(
                '../sijupri-unit-kerja/siap/user-instansi-list/user-instansi-list.component'
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
                '../sijupri-unit-kerja/siap/user-unit-kerja-list/user-unit-kerja-list.component'
              ).then(m => m.UserUnitKerjaListComponent),
            routes: [
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
