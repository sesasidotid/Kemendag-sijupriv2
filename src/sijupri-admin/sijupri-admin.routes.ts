import { Routes } from '@angular/router'
import { authGuard } from '../modules/base/guards/auth.guard'
import { RouteLoader } from '../modules/base/commons/route-loader'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        '../sijupri-admin/template/sijupri-admin/sijupri-admin.component'
      ).then(m => m.SijupriAdminComponent),
    canActivate: [authGuard],
    data: {
      title: 'Home'
    },
    children: [
      // Custom route outside of RouteLoader.loadRouter
      {
        path: '',
        loadComponent: () =>
          import('./admin-dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        data: {
          title: 'Dashboard'
        }
      },
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
      // Routes loaded by RouteLoader.loadRouter
      ...(RouteLoader.loadRouter({
        Formasi: {
          'Data Dukung Formasi': {
            components: () =>
              import(
                '../sijupri-admin/formasi/formasi-document-list/formasi-document-list.component'
              ).then(m => m.FormasiDocumentListComponent)
          },
          'Pengajuan Formasi': {
            components: () =>
              import(
                '../sijupri-admin/formasi/formasi-task-list/formasi-task-list.component'
              ).then(m => m.FormasiTaskListComponent),
            routes: [
              {
                path: 'jabatan/:formasi_id/:jabatanCode',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/formasi/formasi-task-jabatan/formasi-task-jabatan.component'
                  ).then(m => m.FormasiTaskJabatanComponent)
              },
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/formasi/formasi-task-detail/formasi-task-detail.component'
                  ).then(m => m.FormasiTaskDetailComponent)
              }
            ]
          },
          'Pemetaan Formasi Seluruh Indonesia': {
            components: () =>
              import(
                '../sijupri-admin/formasi/formasi-pemetaan/formasi-pemetaan.component'
              ).then(m => m.FormasiPemetaanComponent)
          },
          'Data Rekomendasi Formasi': {
            components: () =>
              import(
                '../sijupri-admin/formasi/formasi-data-rekomendasi/formasi-data-rekomendasi.component'
              ).then(m => m.FormasiDataRekomendasiComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/formasi/formasi-data-rekomendasi-detail/formasi-data-rekomendasi-detail.component'
                  ).then(m => m.FormasiDataRekomendasiDetailComponent)
              }
            ]
          }
        },
        'Monitoring Kinerja': {
          'Pemetaan Kinerja': {
            components: () =>
              import('../sijupri-admin/pak/pak-list/pak-list.component').then(
                m => m.PakListComponent
              ),
            routes: [
              {
                path: ':id/:rwKinerjaId',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/pak/pak-detail-child/pak-detail-child.component'
                  ).then(m => m.PakDetailChildComponent)
              },
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/pak/pak-detail/pak-detail.component'
                  ).then(m => m.PakDetailComponent),
              }
            ]
          },
          'Konfirmasi Data Kinerja': {
            components: () =>
              import(
                '../sijupri-admin/pak/pak-task-list/pak-task-list.component'
              ).then(m => m.PakTaskListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/pak/pak-task-detail/pak-task-detail.component'
                  ).then(m => m.PakTaskDetailComponent)
              }
            ]
          }
        },
        AKP: {
          KKN: {
            components: () =>
              import('../sijupri-admin/akp/kkn/kkn.component').then(
                m => m.KknComponent
              ),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/akp/kkn-detail/kkn-detail.component'
                  ).then(m => m.KknDetailComponent)
              }
            ]
          },
          'Pengajuan AKP': {
            components: () =>
              import(
                '../sijupri-admin/akp/akp-task-list/akp-task-list.component'
              ).then(m => m.AKPTaskComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/akp/akp-task-detail/akp-task-detail.component'
                  ).then(m => m.AkpTaskDetailComponent)
              }
            ]
          },
          'Pemetaan AKP': {
            components: () =>
              import('../sijupri-admin/akp/akp-list/akp-list.component').then(
                m => m.AkpListComponent
              ),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/akp/jf-akp-list/jf-akp-list.component'
                  ).then(m => m.JfAkpListComponent)
              },
              {
                path: 'detail/:id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/akp/akp-detail/akp-detail.component'
                  ).then(m => m.AkpDetailComponent)
              }
            ]
          },
          'Pelatihan Teknis': {
            components: () =>
              import(
                '../sijupri-admin/akp/akp-pelatihan-list/akp-pelatihan-list.component'
              ).then(m => m.AkpPelatihanListComponent)
          },
          'Validasi Pelatihan': {
            components: () =>
              import(
                './akp/akp-verifikasi-pelatihan/akp-verifikasi-pelatihan.component'
              ).then(m => m.AkpVerifikasiPelatihanComponent)
          }
        },
        UKom: {
          'Data Dukung UKom': {
            components: () =>
              import(
                './ukom/ukom-document/ukom-document-list/ukom-document-list.component'
              ).then(m => m.UkomDocumentListComponent)
          },
          'Pemetaan Ukom': {
            components: () =>
              import('./ukom/ukom-pemetaan/ukom-list/ukom-list.component').then(
                m => m.UkomListComponent
              ),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    './ukom/ukom-pemetaan/ukom-detail/ukom-detail.component'
                  ).then(m => m.UkomDetailComponent)
              },
              {
                path: 'detail/:id',
                loadComponent: () =>
                  import(
                    './ukom/ukom-pemetaan/ukom-task-detail/ukom-task-detail.component'
                  ).then(m => m.UkomTaskDetailComponent)
              }
            ]
          },
          'Pengajuan Ukom': {
            components: () =>
              import(
                './ukom/ukom-pengajuan/ukom-task-list/ukom-task-list.component'
              ).then(m => m.UkomTaskListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    './ukom/ukom-pengajuan/ukom-task-detail/ukom-task-detail.component'
                  ).then(m => m.UkomTaskDetailComponent)
              }
            ]
          },
          Pertanyaan: {
            components: () =>
              import(
                './ukom/ukom-question/ukom-question-list/ukom-question-list.component'
              ).then(m => m.UkomQuestionListComponent)
          },
          'Rumus UKom': {
            components: () =>
              import(
                './ukom/ukom-formula/ukom-formula-list/ukom-formula-list.component'
              ).then(m => m.UkomFormulaListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    './ukom/ukom-formula/ukom-formula-detail/ukom-formula-detail.component'
                  ).then(m => m.UkomFormulaDetailComponent)
              }
            ]
          },
          Kelas: {
            components: () =>
              import(
                '../sijupri-admin/ukom/ukom-class/ukom-class-list/ukom-class-list.component'
              ).then(m => m.UkomClassListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    './ukom/ukom-class/ukom-class-detail/ukom-class-detail.component'
                  ).then(m => m.UkomClassDetailComponent)
              },
              {
                path: 'detail-participant/:id',
                loadComponent: () =>
                  import(
                    './ukom/ukom-class/ukom-class-participant-detail/ukom-class-participant-detail.component'
                  ).then(m => m.UkomClassParticipantDetailComponent)
              },
              {
                path: ':roomid/competence/:id',
                loadComponent: () =>
                  import(
                    './ukom/ukom-exam-schedule/ukom-exam-choose-comp-questions/ukom-exam-choose-comp-questions.component'
                  ).then(m => m.UkomExamChooseCompQuestionsComponent)
              }
            ]
          },
          'Penguji Ukom': {
            components: () =>
              import(
                './ukom/ukom-examiner/ukom-examiner-list/ukom-examiner-list.component'
              ).then(m => m.UkomExaminerListComponent)
          }
        },
        Maintenance: {
          Instansi: {
            components: () =>
              import(
                '../sijupri-admin/maintenance/instansi-list/instansi-list.component'
              ).then(m => m.InstansiListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/maintenance/instasi-detail/instasi-detail.component'
                  ).then(m => m.InstasiDetailComponent)
              }
            ]
          },
          'Unit Kerja': {
            components: () =>
              import(
                '../sijupri-admin/maintenance/unit-kerja-list/unit-kerja-list.component'
              ).then(m => m.UnitKerjaListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/maintenance/unit-kerja-detail/unit-kerja-detail.component'
                  ).then(m => m.UnitKerjaDetailComponent)
              }
            ]
          },
          Provinsi: {
            components: () =>
              import(
                '../sijupri-admin/maintenance/provinsi-list/provinsi-list.component'
              ).then(m => m.ProvinsiListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/maintenance/provinsi-detail/provinsi-detail.component'
                  ).then(m => m.ProvinsiDetailComponent)
              }
            ]
          },
          'Kabupaten/Kota': {
            components: () =>
              import(
                '../sijupri-admin/maintenance/kab-kota-list/kab-kota-list.component'
              ).then(m => m.KabKotaListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/maintenance/kab-kota-detail/kab-kota-detail.component'
                  ).then(m => m.KabKotaDetailComponent)
              }
            ]
          },
          Kompetensi: {
            components: () =>
              import(
                '../sijupri-admin/ukom/ukom-kompetensi/ukom-kompetensi-list/ukom-kompetensi-list.component'
              ).then(m => m.UkomKompetensiListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/ukom/ukom-kompetensi/ukom-kompetensi-detail/ukom-kompetensi-detail.component'
                  ).then(m => m.UkomKompetensiDetailComponent)
              }
            ]
          }
        },
        SIAP: {
          'User JF': {
            components: () =>
              import('../sijupri-admin/siap/jf-list/jf-list.component').then(
                m => m.JfListComponent
              ),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/siap/jf-detail/jf-detail.component'
                  ).then(m => m.JfDetailComponent)
              }
            ]
          },
          'User Instansi': {
            components: () =>
              import(
                '../sijupri-admin/siap/user-instansi-list/user-instansi-list.component'
              ).then(m => m.UserInstansiListComponent),
            routes: [
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/siap/user-instansi-add/user-instansi-add.component'
                  ).then(m => m.UserInstansiAddComponent)
              },
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/siap/user-instasi-detail/user-instasi-detail.component'
                  ).then(m => m.UserInstasiDetailComponent)
              }
            ]
          },
          'User Unit Kerja': {
            components: () =>
              import(
                './siap/user-unit-kerja-list/user-unit-kerja-list.component'
              ).then(m => m.UserUnitKerjaListComponent),
            routes: [
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/siap/user-unit-kerja-detail/user-unit-kerja-detail.component'
                  ).then(m => m.UserUnitKerjaDetailComponent)
              }
            ]
          }
        },
        Security: {
          User: {
            components: () =>
              import(
                '../sijupri-admin/security/user-list/user-list.component'
              ).then(m => m.UserListComponent),
            routes: [
              {
                path: 'add',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/security/user-add/user-add.component'
                  ).then(m => m.UserAddComponent)
              },
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/security/user-detail/user-detail.component'
                  ).then(m => m.UserDetailComponent)
              }
            ]
          },
          Role: {
            components: () =>
              import(
                '../sijupri-admin/security/role-list/role-list.component'
              ).then(m => m.RoleListComponent),
            routes: [
              {
                path: ':code',
                loadComponent: () =>
                  import(
                    '../sijupri-admin/security/role-update/role-update.component'
                  ).then(m => m.RoleUpdateComponent)
              }
            ]
          }
        },
        Report: {
          'Report SIAP': {
            components: () =>
              import(
                '../sijupri-admin/report/report-siap/report-siap.component'
              ).then(m => m.ReportSiapComponent)
          },
          'Report AKP': {
            components: () =>
              import(
                '../sijupri-admin/report/report-akp/report-akp.component'
              ).then(m => m.ReportAkpComponent)
          },
          'Report Formasi': {
            components: () =>
              import(
                '../sijupri-admin/report/report-formasi/report-formasi.component'
              ).then(m => m.ReportFormasiComponent)
          },
          'Report UKom': {
            components: () =>
              import(
                '../sijupri-admin/report/report-ukom/report-ukom.component'
              ).then(m => m.ReportUkomComponent)
          }
        }
      }) ?? [])
    ]
  }
]
