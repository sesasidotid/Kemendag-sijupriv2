import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { LoginContext } from '@/modules/base/commons/login-context'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

/**
 * Guard to validate that user has access to CAT exam
 * Checks:
 * - User is logged in
 * - User is registered as a participant
 * - Exam session is valid
 */
export const catExamGuard: CanActivateFn = (route, state) => {
    const router = inject(Router)
    const participantService = inject(UkomParticipantService)

    const userId = LoginContext.getUserId()

    // Check if user is logged in
    if (!userId) {
        router.navigate(['/login'])
        return false
    }

    // Extract NIP from user ID
    const nip = userId.replace('PU-', '')

    // Verify participant registration
    return participantService.getParticipantUkom(nip).pipe(
        map((participant) => {
            if (!participant || !participant.roomUkomDto) {
                router.navigate(['/'])
                return false
            }

            const catSchedule =
                participant.roomUkomDto?.examScheduleDtoList?.find(
                    (e) => e.examTypeCode === 'CAT',
                )

            if (!catSchedule) {
                router.navigate(['/'])
                return false
            }

            return true
        }),
        catchError((error) => {
            console.error('Error validating CAT exam access:', error)
            router.navigate(['/'])
            return of(false)
        }),
    )
}
