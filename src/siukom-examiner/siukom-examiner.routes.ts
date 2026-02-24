import { Routes } from '@angular/router'
import { authGuard } from '@/modules/base/guards/auth.guard'

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('@/siukom-examiner/home/home.component').then(
                (m) => m.HomeComponent,
            ),
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
                path: 'interviews/:id/:participantId',
                loadComponent: () =>
                    import('./wawancara/wawancara.component').then(
                        (m) => m.WawancaraComponent,
                    ),
            },
            {
                path: 'seminar-paper/:id/:participantId',
                loadComponent: () =>
                    import('./seminer-makalah/seminer-makalah.component').then(
                        (m) => m.SeminerMakalahComponent,
                    ),
            },
            {
                path: 'paper/:id/:participantId',
                loadComponent: () =>
                    import('./makalah/makalah.component').then(
                        (m) => m.MakalahComponent,
                    ),
            },
            {
                path: 'portfolio/:id/:participantId',
                loadComponent: () =>
                    import('./portofolio/portofolio.component').then(
                        (m) => m.PortofolioComponent,
                    ),
            },
            {
                path: 'case-study/:id/:participantId',
                loadComponent: () =>
                    import('./studi-kasus/studi-kasus.component').then(
                        (m) => m.StudiKasusComponent,
                    ),
            },
            {
                path: 'practical-work/:id/:participantId',
                loadComponent: () =>
                    import('./practical-work/practical-work.component').then(
                        (m) => m.PracticalWorkComponent,
                    ),
            },
        ],
    },
]
