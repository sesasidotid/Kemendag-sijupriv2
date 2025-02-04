import { Routes } from '@angular/router'
import { authGuard } from '../modules/base/guards/auth.guard'
import { RouteLoader } from '../modules/base/commons/route-loader'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../sijupri-jf/template/sijupri-jf/sijupri-jf.component').then(
        m => m.SijupriJfComponent
      ),
    canActivate: [authGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../sijupri-jf/template/dashboard/dashboard.component').then(
            m => m.DashboardComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../sijupri-jf/template/profile/profile.component').then(
            m => m.ProfileComponent
          ),
        data: {
          title: 'Profile'
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../sijupri-jf/siap/jf/jf.component').then(
                m => m.JfComponent
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/jf/jf-detail/jf-detail.component'
                  ).then(m => m.JfDetailComponent)
              },
              {
                path: 'pending',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/jf/jf-pending/jf-pending.component'
                  ).then(m => m.JfPendingComponent)
              }
            ]
          },
          {
            path: 'rw-pendidikan',
            loadComponent: () =>
              import('../sijupri-jf/template/riwayat/riwayat.component').then(
                m => m.RiwayatComponent
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-pendidikan/rw-pendidikan-list/rw-pendidikan-list.component'
                  ).then(m => m.RwPendidikanListComponent)
              },
              {
                path: 'pending',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-pendidikan/rw-pendidikan-pending/rw-pendidikan-pending.component'
                  ).then(m => m.RwPendidikanPendingComponent)
              },
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-pendidikan/rw-pendidikan-add/rw-pendidikan-add.component'
                  ).then(m => m.RwPendidikanAddComponent)
              }
            ]
          },
          {
            path: 'rw-pangkat',
            loadComponent: () =>
              import('../sijupri-jf/template/riwayat/riwayat.component').then(
                m => m.RiwayatComponent
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-pangkat/rw-pangkat-list/rw-pangkat-list.component'
                  ).then(m => m.RwPangkatListComponent)
              },
              {
                path: 'pending',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-pangkat/rw-pangkat-pending/rw-pangkat-pending.component'
                  ).then(m => m.RwPangkatPendingComponent)
              },
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-pangkat/rw-pangkat-add/rw-pangkat-add.component'
                  ).then(m => m.RwPangkatAddComponent)
              }
            ]
          },
          {
            path: 'rw-jabatan',
            loadComponent: () =>
              import('../sijupri-jf/template/riwayat/riwayat.component').then(
                m => m.RiwayatComponent
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-jabatan/rw-jabatan-list/rw-jabatan-list.component'
                  ).then(m => m.RwJabatanListComponent)
              },
              {
                path: 'pending',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-jabatan/rw-jabatan-pending/rw-jabatan-pending.component'
                  ).then(m => m.RwJabatanPendingComponent)
              },
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-jabatan/rw-jabatan-add/rw-jabatan-add.component'
                  ).then(m => m.RwJabatanAddComponent)
              }
            ]
          },
          {
            path: 'rw-kinerja',
            loadComponent: () =>
              import('../sijupri-jf/template/riwayat/riwayat.component').then(
                m => m.RiwayatComponent
              ),

            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-kinerja/rw-kinerja-list/rw-kinerja-list.component'
                  ).then(m => m.RwKinerjaListComponent)
              },
              {
                path: 'pending',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-kinerja/rw-kinerja-pending/rw-kinerja-pending.component'
                  ).then(m => m.RwKinerjaPendingComponent)
              },
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-kinerja/rw-kinerja-add/rw-kinerja-add.component'
                  ).then(m => m.RwKinerjaAddComponent)
              }
            ]
          },
          {
            path: 'rw-kompetensi',
            loadComponent: () =>
              import('../sijupri-jf/template/riwayat/riwayat.component').then(
                m => m.RiwayatComponent
              ),

            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-kompetensi/rw-kompetensi-list/rw-kompetensi-list.component'
                  ).then(m => m.RwKompetensiListComponent)
              },
              {
                path: 'pending',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-kompetensi/rw-kompetensi-pending/rw-kompetensi-pending.component'
                  ).then(m => m.RwKompetensiPendingComponent)
              },
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-kompetensi/rw-kompetensi-add/rw-kompetensi-add.component'
                  ).then(m => m.RwKompetensiAddComponent)
              }
            ]
          },
          {
            path: 'rw-sertifikasi',
            loadComponent: () =>
              import('../sijupri-jf/template/riwayat/riwayat.component').then(
                m => m.RiwayatComponent
              ),

            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-sertifikasi/rw-sertifikasi-list/rw-sertifikasi-list.component'
                  ).then(m => m.RwSertifikasiListComponent)
              },
              {
                path: 'pending',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-sertifikasi/rw-sertifikasi-pending/rw-sertifikasi-pending.component'
                  ).then(m => m.RwSertifikasiPendingComponent)
              },
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/siap/rw-sertifikasi/rw-sertifikasi-add/rw-sertifikasi-add.component'
                  ).then(m => m.RwSertifikasiAddComponent)
              }
            ]
          }
        ]
      },
      ...(RouteLoader.loadRouter({
        UKom: {
          'Pendaftaran Ukom': {
            components: () =>
              import('../sijupri-jf/ukom/ukom-task/ukom-task.component').then(
                m => m.UkomTaskComponent
              ),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/ukom/ukom-task-form/ukom-task-form.component'
                  ).then(m => m.UkomTaskFormComponent)
              },
              {
                path: 'revisi',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/ukom/ukom-revision/ukom-revision.component'
                  ).then(m => m.UkomRevisionComponent)
              }
            ]
          },
          'Riwayat Ukom': {
            components: () =>
              import('../sijupri-jf/ukom/ukom-list/ukom-list.component').then(
                m => m.UkomListComponent
              ),
            routes: [
              {
                path: 'detail/:id',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/ukom/ukom-task-detail/ukom-task-detail.component'
                  ).then(m => m.UkomTaskDetailComponent)
              }
            ]
          }
        },
        AKP: {
          'Penilaian AKP': {
            components: () =>
              import('../sijupri-jf/akp/akp-task/akp-task.component').then(
                m => m.AkpTaskComponent
              )
          },
          'Riwayat AKP': {
            components: () =>
              import('../sijupri-jf/akp/akp-list/akp-list.component').then(
                m => m.AkpListComponent
              ),
            routes: [
              {
                path: 'detail/:id',
                loadComponent: () =>
                  import(
                    '../sijupri-jf/akp/akp-detail/akp-detail.component'
                  ).then(m => m.AkpDetailComponent)
              }
            ]
          }
        },
        Formasi: {
          'Daftar Formasi': {
            components: () =>
              import('../sijupri-jf/jf-formasi/jf-formasi.component').then(
                m => m.JfFormasiComponent
              )
          }
        }
      }) ?? [])
    ]
  }
]
