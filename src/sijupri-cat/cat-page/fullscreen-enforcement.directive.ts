import { Directive, OnInit, OnDestroy, inject } from '@angular/core'
import { CatExamSecurityService } from './cat-exam-security.service'

/**
 * Directive to enforce fullscreen mode and handle fullscreen exit events
 * Usage: <div appFullscreenEnforcement>...</div>
 */
@Directive({
    selector: '[appFullscreenEnforcement]',
    standalone: true,
})
export class FullscreenEnforcementDirective implements OnInit, OnDestroy {
    private securityService = inject(CatExamSecurityService)
    private fullscreenChangeHandler = this.onFullscreenChange.bind(this)

    ngOnInit(): void {
        this.setupFullscreenListener()
    }

    ngOnDestroy(): void {
        this.removeFullscreenListener()
    }

    private setupFullscreenListener(): void {
        document.addEventListener(
            'fullscreenchange',
            this.fullscreenChangeHandler,
        )
        document.addEventListener(
            'webkitfullscreenchange',
            this.fullscreenChangeHandler,
        )
        document.addEventListener(
            'mozfullscreenchange',
            this.fullscreenChangeHandler,
        )
        document.addEventListener(
            'MSFullscreenChange',
            this.fullscreenChangeHandler,
        )
    }

    private removeFullscreenListener(): void {
        document.removeEventListener(
            'fullscreenchange',
            this.fullscreenChangeHandler,
        )
        document.removeEventListener(
            'webkitfullscreenchange',
            this.fullscreenChangeHandler,
        )
        document.removeEventListener(
            'mozfullscreenchange',
            this.fullscreenChangeHandler,
        )
        document.removeEventListener(
            'MSFullscreenChange',
            this.fullscreenChangeHandler,
        )
    }

    private onFullscreenChange(): void {
        // If user exits fullscreen, re-enter it
        if (!document.fullscreenElement) {
            this.securityService.enterFullScreen()
        }
    }
}
