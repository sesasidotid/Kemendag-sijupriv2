import { Routes } from '@angular/router';
import { LoginContext } from '../modules/base/commons/login-context';

export const routes: Routes = [
    {
        path: '',
        redirectTo: LoginContext.getUserLoginRoute(),
        pathMatch: 'full',
    },
    getMenus(),
    {
        path: 'login',
        loadComponent: () => import('../modules/auth/components/login/login.component').then(m => m.LoginComponent),
    },

    { path: '**', redirectTo: 'not-found' }
];

function getMenus(): any {
    switch (LoginContext.getApplicationCode()) {
        case 'sijupri-admin':
            return {
                path: 'admin',
                loadChildren: () => import('../sijupri-admin/sijupri-admin.module').then(m => m.SijupriAdminModule)
            }
        case 'sijupri-instansi':
            return {
                path: 'instansi',
                loadChildren: () => import('../sijupri-instansi/sijupri-instansi.module').then(m => m.SijupriInstansiModule)
            }
        case 'sijupri-unit-kerja':
            return {
                path: 'unit-kerja',
                loadChildren: () => import('../sijupri-unit-kerja/sijupri-unit-kerja.module').then(m => m.SijupriUnitKerjaModule)
            }
        case 'sijupri-external':
            return {
                path: 'jf-external',
                loadChildren: () => import('../sijupri-jf/sijupri-jf.module').then(m => m.SijupriJfModule)
            }
        case 'sijupri-internal':
            return {
                path: 'jf-internal',
                loadChildren: () => import('../sijupri-jf/sijupri-jf.module').then(m => m.SijupriJfModule)
            }
        default:
            return {
                path: 'not-found',
                loadComponent: () => import('./template/not-found/not-found.component').then(m => m.NotFoundComponent),
            }
    }
}
