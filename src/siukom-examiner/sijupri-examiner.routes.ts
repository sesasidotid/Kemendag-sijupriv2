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
    },
]
