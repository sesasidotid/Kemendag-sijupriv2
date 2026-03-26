import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { LoginContext } from '../../modules/base/commons/login-context'
import { catchError } from 'rxjs/operators'

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router)

    return next(req).pipe(
        catchError((error) => {
            const currentRoute = router.url
            const EXACT_ROUTES = ['/']
            const PREFIX_ROUTES = [
                '/login',
                '/login-cat',
                '/forgot_password',
                '/not-found',
                '/ukom/external',
                '/ukom/external/status',
                '/akp-grading',
                '/ukm-clarrify',
            ]

            const shouldIgnore =
                EXACT_ROUTES.includes(currentRoute) ||
                PREFIX_ROUTES.some(
                    (route) =>
                        currentRoute === route ||
                        currentRoute.startsWith(route + '/'),
                )

            console.log('test', shouldIgnore)
            console.error('err', error)

            // if (
            //     !shouldIgnore &&
            //     error?.error?.message === 'Unauthenticated.' &&
            //     error?.error?.code === 'Unhandled Error'
            // )
            if (
                !shouldIgnore &&
                error?.error?.cause === 'Unauthenticated.' &&
                error?.error?.code === 'Unhandled Error'
            ) {
                if (
                    LoginContext.getApplicationCode() === 'siukom-participant'
                ) {
                    console.log('test2')

                    router.navigate(['/login-cat']).then(() => {
                        window.location.reload()
                    })
                } else {
                    router.navigate(['/login']).then(() => {
                        window.location.reload()
                    })
                    console.log('test3')
                }
                LoginContext.release()
            }
            throw error
        }),
    )
}
