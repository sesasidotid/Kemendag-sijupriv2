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
                path: 'makalah/:examScheduleId',
                loadComponent: () =>
                    import('./makalah-page/makalah-page.component').then(
                        (m) => m.MakalahPageComponent,
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
