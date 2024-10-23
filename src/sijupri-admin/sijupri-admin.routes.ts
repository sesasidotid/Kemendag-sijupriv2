import { Routes } from '@angular/router';
import { authGuard } from '../modules/base/guards/auth.guard';
import { RouteLoader } from '../modules/base/commons/route-loader';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('../sijupri-admin/template/sijupri-admin/sijupri-admin.component').then(m => m.SijupriAdminComponent),
        canActivate: [authGuard],
        data: {
            title: 'Home',
        },
        children: RouteLoader.loadRouter({
            "Formasi": {
                "Data Dukung Formasi": {
                    components: () => import('../sijupri-admin/formasi/formasi-document-list/formasi-document-list.component').then(m => m.FormasiDocumentListComponent)
                },
                "Pengajuan Formasi": {
                    components: () => import('../sijupri-admin/formasi/formasi-task-list/formasi-task-list.component').then(m => m.FormasiTaskListComponent),
                    routes: [
                        {
                            path: 'jabatan/:unitKerjaId/:jabatanCode',
                            loadComponent: () => import('../sijupri-admin/formasi/formasi-task-jabatan/formasi-task-jabatan.component').then(m => m.FormasiTaskJabatanComponent),
                        },
                        {
                            path: ':id',
                            loadComponent: () => import('../sijupri-admin/formasi/formasi-task-detail/formasi-task-detail.component').then(m => m.FormasiTaskDetailComponent),
                        },
                    ]
                },
            },
            "Monitoring Kinerja": {
                "Pemetaan Kinerja": {
                    components: () => import('../sijupri-admin/pak/pak-list/pak-list.component').then(m => m.PakListComponent),
                    routes: [
                        {
                            path: ':id',
                            loadComponent: () => import('../sijupri-admin/pak/pak-detail/pak-detail.component').then(m => m.PakDetailComponent),
                            children: [
                                {
                                    path: ':rwKinerjaId',
                                    loadComponent: () => import('../sijupri-admin/pak/pak-graph/pak-graph.component').then(m => m.PakGraphComponent),
                                }
                            ]
                        }
                    ]
                }
            },
            "AKP": {
                "KKN": {
                    components: () => import('../sijupri-admin/akp/kkn/kkn.component').then(m => m.KknComponent),
                    routes: [
                        {
                            path: 'add',
                            loadComponent: () => import('../sijupri-admin/akp/kkn-add/kkn-add.component').then(m => m.KknAddComponent),
                        },
                        {
                            path: ':id',
                            loadComponent: () => import('../sijupri-admin/akp/kkn-detail/kkn-detail.component').then(m => m.KknDetailComponent),
                        }
                    ]
                },
            },
            "UKom": {
                "Data Dukung UKom": {
                    components: () => import('../sijupri-admin/ukom/ukom-document-list/ukom-document-list.component').then(m => m.UkomDocumentListComponent)
                },
                "Pemetaan Ukom": {
                    components: () => import('../sijupri-admin/ukom/ukom-list/ukom-list.component').then(m => m.UkomListComponent),
                    routes: [
                        {
                            path: 'add',
                            loadComponent: () => import('../sijupri-admin/ukom/ukom-add/ukom-add.component').then(m => m.UkomAddComponent),
                        },
                        {
                            path: ':id',
                            loadComponent: () => import('../sijupri-admin/ukom/ukom-detail/ukom-detail.component').then(m => m.UkomDetailComponent),
                        }
                    ]
                },
                "Pengajuan Ukom": {
                    components: () => import('../sijupri-admin/ukom/ukom-task-list/ukom-task-list.component').then(m => m.UkomTaskListComponent),
                    routes: [
                        {
                            path: ':id',
                            loadComponent: () => import('../sijupri-admin/ukom/ukom-task-detail/ukom-task-detail.component').then(m => m.UkomTaskDetailComponent),
                        }
                    ]
                },
                "Import Nilai": {
                    components: () => import('../sijupri-admin/ukom/ukom-grade-import/ukom-grade-import.component').then(m => m.UkomGradeImportComponent),
                },
            },
            "Maintenance": {
                "Instansi": {
                    components: () => import('../sijupri-admin/maintenance/instansi-list/instansi-list.component').then(m => m.InstansiListComponent)
                },
                "Unit Kerja": {
                    components: () => import('../sijupri-admin/maintenance/unit-kerja-list/unit-kerja-list.component').then(m => m.UnitKerjaListComponent)
                },
                "Provinsi": {
                    components: () => import('../sijupri-admin/maintenance/provinsi-list/provinsi-list.component').then(m => m.ProvinsiListComponent)
                },
                "Kabupaten/Kota": {
                    components: () => import('../sijupri-admin/maintenance/kab-kota-list/kab-kota-list.component').then(m => m.KabKotaListComponent)
                },
            },
            "SIAP": {
                "User JF": {
                    components: () => import('../sijupri-admin/siap/jf-list/jf-list.component').then(m => m.JfListComponent)
                },
                "User Instansi": {
                    components: () => import('../sijupri-admin/siap/user-instansi-list/user-instansi-list.component').then(m => m.UserInstansiListComponent),
                    routes: [
                        {
                            path: 'add',
                            loadComponent: () => import('../sijupri-admin/siap/user-instansi-add/user-instansi-add.component').then(m => m.UserInstansiAddComponent),
                        }
                    ]
                },
                "User Unit Kerja": {
                    components: () => import('../sijupri-admin/siap/user-unit-kerja-list/user-unit-kerja-list.component').then(m => m.UserUnitKerjaListComponent),
                },
            },
            "Security": {
                "User": {
                    components: () => import('../sijupri-admin/security/user-list/user-list.component').then(m => m.UserListComponent),
                    routes: [
                        {
                            path: 'add',
                            loadComponent: () => import('../sijupri-admin/security/user-add/user-add.component').then(m => m.UserAddComponent),
                        }
                    ]
                },
                "Role": {
                    components: () => import('../sijupri-admin/security/role-list/role-list.component').then(m => m.RoleListComponent),
                    routes: [
                        {
                            path: ':code',
                            loadComponent: () => import('../sijupri-admin/security/role-update/role-update.component').then(m => m.RoleUpdateComponent),
                        }
                    ]
                },
            },
        }) ?? [],
    }
];
