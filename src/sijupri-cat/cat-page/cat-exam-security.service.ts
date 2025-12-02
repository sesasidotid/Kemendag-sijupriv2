import { inject, Injectable, signal, effect } from '@angular/core'
import { HandlerService } from '@/modules/base/services/handler.service'

/**
 * Service responsible for handling all exam security and anti-cheating measures
 * including fullscreen enforcement, tab detection, DevTools detection, and mouse tracking
 */
@Injectable({
    providedIn: 'root',
})
export class CatExamSecurityService {
    private handler = inject(HandlerService)

    private isUnloading = false
    private isInside = true
    private warningInterval: ReturnType<typeof setInterval> | undefined
    private readonly WARNING_COUNTDOWN_KEY = 'cat_warning_countdown'
    private readonly INITIAL_WARNING_TIME = 30000

    // Violation management
    private readonly VIOLATION_KEY: string = 'cat_violation_count'
    readonly MAX_VIOLATIONS: number = 3000

    readonly showWarning = signal(false)
    readonly warningCountdown = signal(30)
    private _violationCount = signal(0)
    readonly violationCount = this._violationCount.asReadonly()
    private lastViolationReason = signal<string>('')
    private lastViolationTime = 0
    /**
     * Callbacks for security events
     */
    private onAutoSubmitCallback?: () => void

    constructor() {
        this.loadViolationCount()
        this.setupViolationWatcher()
        this.loadWarningCountdown()
    }

    /**
     * Initialize security measures for the exam
     */
    initializeSecurity(onAutoSubmit: () => void) {
        this.onAutoSubmitCallback = onAutoSubmit
        this.enterFullScreen()
        this.setupEventListeners()
    }

    /**
     * Clean up security measures
     */
    cleanup() {
        this.pauseWarningCountdown()
        this.removeEventListeners()
    }

    /**
     * Load warning countdown from localStorage
     */
    private loadWarningCountdown() {
        const stored = localStorage.getItem(this.WARNING_COUNTDOWN_KEY)
        const value = stored ? parseInt(stored, 10) : this.INITIAL_WARNING_TIME
        this.warningCountdown.set(value)
    }

    /**
     * Save warning countdown to localStorage
     */
    private saveWarningCountdown() {
        localStorage.setItem(
            this.WARNING_COUNTDOWN_KEY,
            this.warningCountdown().toString(),
        )
    }

    /**
     * Clear warning countdown from localStorage (call after successful submission)
     */
    clearWarningCountdown() {
        localStorage.removeItem(this.WARNING_COUNTDOWN_KEY)
        this.warningCountdown.set(this.INITIAL_WARNING_TIME)
    }

    /**
     * Load violation count from localStorage
     */
    private loadViolationCount() {
        const stored = localStorage.getItem(this.VIOLATION_KEY)
        this._violationCount.set(stored ? parseInt(stored, 10) : 0)
    }

    /**
     * Add a violation
     */
    addViolation(reason: string) {
        const now = Date.now()
        if (now - this.lastViolationTime < 1000) {
            return
        }
        this.lastViolationTime = now
        if (reason) this.lastViolationReason.set(reason)

        if (this._violationCount() < this.MAX_VIOLATIONS) {
            this._violationCount.update((count) => count + 1)
            localStorage.setItem(
                this.VIOLATION_KEY,
                this._violationCount().toString(),
            )
        }
    }

    /**
     * Clear all violations from localStorage
     */
    private clearViolationCount() {
        localStorage.removeItem(this.VIOLATION_KEY)
        this._violationCount.set(0)
    }

    /**
     * Request fullscreen mode
     */
    enterFullScreen() {
        const elem = document.documentElement as HTMLElement & {
            mozRequestFullScreen?: () => Promise<void>
            webkitRequestFullscreen?: () => Promise<void>
            msRequestFullscreen?: () => Promise<void>
        }

        const requestFullScreen =
            elem.requestFullscreen ||
            elem.mozRequestFullScreen ||
            elem.webkitRequestFullscreen ||
            elem.msRequestFullscreen

        if (requestFullScreen) {
            requestFullScreen.call(elem).catch((err) => {
                console.error('Failed to enter fullscreen:', err)
            })
        } else {
            console.warn('Fullscreen API is not supported in this browser.')
        }
    }

    /**
     * Watch for violation threshold and trigger auto-submit
     * This effect runs automatically whenever violationCount changes
     */
    private setupViolationWatcher() {
        effect(() => {
            const currentViolations = this._violationCount()
            const reason = this.lastViolationReason()

            if (currentViolations >= this.MAX_VIOLATIONS) {
                this.handler.handleAlert(
                    'Error',
                    'Anda telah melanggar aturan ujian terlalu banyak. Ujian akan disubmit secara otomatis.',
                )
                this.triggerAutoSubmit()
            } else if (currentViolations > 0 && reason) {
                this.handler.handleAlert(
                    'Warning',
                    `Peringatan: ${reason}. Pelanggaran ${currentViolations}/${this.MAX_VIOLATIONS}.`,
                    10000,
                )
            }
        })
    }

    /**
     * Handle visibility change (tab switching)
     * Only adds violation - the effect will handle alerts and auto-submit
     */
    handleVisibilityChange() {
        if (this.isUnloading) return

        if (document.hidden) {
            this.addViolation(
                'Anda meninggalkan halaman ujian (berpindah tab/window)',
            )
        }
    }

    handleBlur() {
        // If blur happens but tab is NOT hidden, it's suspicious ALT+TAB or OS switch
        if (!document.hidden) {
            this.addViolation(
                'Anda meninggalkan halaman ujian (berpindah tab/window atau aktivitas mencurigakan lainya). Jika merasa tidak sesuai, segera hubungi panitia',
            )
        }
    }

    /**
     * Handle mouse movement to detect if user is leaving exam area
     */
    handleMouseMove(event: MouseEvent, isSubmitted: boolean) {
        if (isSubmitted) return

        const inside = this.isMouseInsideExamArea(event)

        if (inside !== this.isInside) {
            this.isInside = inside

            if (!inside) {
                this.showWarning.set(true)
                this.startWarningCountdown()
            } else {
                this.showWarning.set(false)
                this.pauseWarningCountdown()
            }
        }
    }

    /**
     * Check if mouse is inside exam area
     */
    private isMouseInsideExamArea(event: MouseEvent): boolean {
        const examArea = document.querySelector('.root-cat') as HTMLElement
        if (!examArea) return false

        const rect = examArea.getBoundingClientRect()
        return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        )
    }

    /**
     * Start warning countdown when user is outside exam area
     */
    private startWarningCountdown() {
        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }

        this.warningInterval = setInterval(() => {
            this.warningCountdown.update((count) => count - 1)
            this.saveWarningCountdown()

            if (this.warningCountdown() <= 0) {
                clearInterval(this.warningInterval)
                this.lastViolationReason.set(
                    'Mouse keluar dari area ujian terlalu lama',
                )
                this.handler.handleAlert(
                    'Info',
                    'Anda telah tidak aktif terlalu lama. Ujian akan disubmit secara otomatis.',
                )
                this.triggerAutoSubmit()
            }
        }, 1000)
    }

    handleFullscreenExit() {
        // Check if we're actually exiting fullscreen (not entering it)
        // document.fullscreenElement is null when NOT in fullscreen
        if (!document.fullscreenElement) {
            this.addViolation(
                'Anda keluar dari fullscreen, mohon tetap berada dalam model fullscreen saat waktu ujian berlangsung',
            )
            this.enterFullScreen()
        }
        // If document.fullscreenElement exists, user is entering fullscreen - no violation needed
    }
    /**
     * Pause warning countdown (when user returns to exam area)
     * Does NOT reset the countdown - preserves the current value
     */
    private pauseWarningCountdown() {
        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }
        this.saveWarningCountdown()
    }

    /**
     * Mark that page is unloading
     */
    markUnloading() {
        this.isUnloading = true
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners() {
        // Event listeners are handled by component @HostListener
        // This method is here for future extensibility
    }

    /**
     * Remove event listeners
     */
    private removeEventListeners() {
        // Event listeners cleanup if needed
    }

    /**
     * Trigger auto-submit callback
     */
    private triggerAutoSubmit() {
        if (this.onAutoSubmitCallback) {
            this.onAutoSubmitCallback()
        }
    }
    /**
     * Clear violations (call after successful submission)
     */
    clearViolations() {
        this.clearViolationCount()
        this.clearWarningCountdown()
    }
}
