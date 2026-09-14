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
                '/ukom/detail',
            ]

            // --- role check ---
            const appCode = LoginContext.getApplicationCode()

            const isParticipantOrExaminer =
                appCode === 'siukom-participant' ||
                appCode === 'siukom-examiner'

            // --- error check ---
            const isUnauthenticated =
                error?.error?.cause === 'Unauthenticated.' &&
                error?.error?.code === 'Unhandled Error'

            // --- route checks ---
            const isExactIgnored = EXACT_ROUTES.includes(currentRoute)
            const isPrefixIgnored = PREFIX_ROUTES.some(
                (route) =>
                    currentRoute === route ||
                    currentRoute.startsWith(route + '/'),
            )

            /**
             * Ignore logic:
             * - "/" ignored ONLY if NOT participant/examiner
             * - prefix routes always ignored
             */
            const shouldIgnore =
                (isExactIgnored && !isParticipantOrExaminer) || isPrefixIgnored

            // --- main logic ---
            if (!shouldIgnore && isUnauthenticated) {
                if (isParticipantOrExaminer) {
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
