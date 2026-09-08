import { Routes } from '@angular/router'
import { authGuard } from '../modules/base/guards/auth.guard'
import { catExamGuard } from './cat-page/cat-exam.guard'

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./home/home.component').then((m) => m.HomeComponent),
        canActivate: [authGuard],
        data: {
            title: 'Home',
        },
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./dashboard/dashboard.component').then(
                        (m) => m.DashboardComponent,
                    ),
            },
            {
                path: 'resignation',
                data: {
                    title: 'Pengunduran Diri',
                },
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('./resignation/resignation.component').then(
                                (m) => m.ResignationComponent,
                            ),
                    },
                    {
                        path: 'riwayat',
                        loadComponent: () =>
                            import('./resignation/rw-resignation-list/rw-resignation-list.component').then(
                                (m) => m.RwResignationListComponent,
                            ),
                        data: {
                            title: 'Riwayat',
                        },
                    },
                    {
                        path: 'detail/:id',
                        loadComponent: () =>
                            import('./resignation/rw-resignation-detail/rw-resignation-detail.component').then(
                                (m) => m.RwResignationDetailComponent,
                            ),
                        data: {
                            title: 'Riwayat',
                        },
                    },
                ],
            },
            {
                path: 'seminar-paper/:examScheduleId',
                loadComponent: () =>
                    import('./makalah-page/makalah-page.component').then(
                        (m) => m.MakalahPageComponent,
                    ),
            },
            {
                path: 'interviews/:examScheduleId',
                loadComponent: () =>
                    import('./wawancara-page/wawancara-page.component').then(
                        (m) => m.WawancaraPageComponent,
                    ),
            },
            {
                path: 'case-study/:examScheduleId',
                loadComponent: () =>
                    import('./studi-kasus-page/studi-kasus-page.component').then(
                        (m) => m.StudiKasusPageComponent,
                    ),
            },
            {
                path: 'portfolio/:examScheduleId',
                loadComponent: () =>
                    import('./portfolio-page/portfolio-page.component').then(
                        (m) => m.PortfolioPageComponent,
                    ),
            },
            {
                path: 'practical-work/:examScheduleId',
                loadComponent: () =>
                    import('./practical-work-page/practical-work-page.component').then(
                        (m) => m.PracticalWorkPageComponent,
                    ),
            },
        ],
    },
    {
        path: 'cat/:examScheduleId',
        loadComponent: () =>
            import('./cat-page/cat-page.component').then(
                (m) => m.CatPageComponent,
            ),
        canActivate: [authGuard, catExamGuard],
    },
]
