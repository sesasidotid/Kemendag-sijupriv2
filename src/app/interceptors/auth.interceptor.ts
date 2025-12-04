import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { LoginContext } from '../../modules/base/commons/login-context'
import { catchError } from 'rxjs/operators'

const IGNORE_LOGOUT_ROUTES = [
    '/',
    '/login',
    '/login-cat',
    '/forgot_password',
    '/not-found',
    '/ukom/external',
    '/ukom/external/status',
    '/akp-grading',
    '/ukm-clarrify',
]

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router)

    return next(req).pipe(
        catchError((error) => {
            const currentRoute = router.url
            const shouldIgnore = IGNORE_LOGOUT_ROUTES.some((route) =>
                currentRoute.startsWith(route),
            )

            if (
                !shouldIgnore &&
                error?.error?.message === 'Unauthenticated.' &&
                error?.error?.code === 'Unhandled Error'
            ) {
                if (
                    LoginContext.getApplicationCode() === 'siukom-participant'
                ) {
                    router.navigate(['/login-cat']).then(() => {
                        window.location.reload()
                    })
                } else {
                    router.navigate(['/login']).then(() => {
                        window.location.reload()
                    })
                }
                LoginContext.release()
            }
            throw error
        }),
    )
}
