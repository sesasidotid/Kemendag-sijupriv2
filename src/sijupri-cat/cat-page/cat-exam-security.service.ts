import { inject, Injectable, signal, effect } from '@angular/core'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ApiService } from '@/modules/base/services/api.service'
import { interval, Subscription } from 'rxjs'
import { environment } from '@/environments/environment'
import { SystemConfig } from '@/modules/base/models/system-config.model'

/**
 * Service responsible for handling all exam security and anti-cheating measures
 * including fullscreen enforcement, tab detection, DevTools detection, and mouse tracking
 */
@Injectable({
    providedIn: 'root',
})
export class CatExamSecurityService {
    private handler = inject(HandlerService)
    private api = inject(ApiService)

    readonly isUnloading = signal(false)
    readonly isSubmitted = signal(false)
    private isInside = true
    private warningInterval: ReturnType<typeof setInterval> | undefined
    private INITIAL_WARNING_TIME = 30

    // Violation management
    MAX_VIOLATIONS: number = 10

    examScheduleId: string | undefined
    private mouseAwayStartTime: number | undefined
    private currentMouseAwayDuration = 0

    readonly showWarning = signal(false)
    readonly warningCountdown = signal(30)
    private _violationCount = signal(0)
    readonly violationCount = this._violationCount.asReadonly()
    private lastViolationReason = signal<string>('')
    private lastViolationTime = 0
    private _isFullscreen = signal(false)
    readonly isFullscreen = this._isFullscreen.asReadonly()
    /**
     * Callbacks for security events
     */
    private onAutoSubmitCallback?: () => void

    private isOnline = navigator.onLine
    private connectionCheckSub?: Subscription

    // Translation Detection
    readonly isTranslated = signal(false)
    private translationObserver?: MutationObserver

    constructor() {
        this.setupViolationWatcher()

        window.addEventListener('online', () => {
            this.checkConnection()
        })

        window.addEventListener('offline', () => {
            this.isOnline = false
        })

        this.startConnectionCheck()
        this.detectTranslation()
    }

    private detectTranslation() {
        const htmlElement = document.documentElement
        const initialLang = htmlElement.getAttribute('lang')

        this.translationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    (mutation.attributeName === 'class' ||
                        mutation.attributeName === 'lang')
                ) {
                    const classList = htmlElement.classList
                    const currentLang = htmlElement.getAttribute('lang')

                    // Check both Chromium and Firefox methods
                    const isTranslated =
                        classList.contains('translated-ltr') ||
                        classList.contains('translated-rtl') ||
                        (currentLang !== initialLang && currentLang !== null)

                    if (isTranslated !== this.isTranslated()) {
                        this.isTranslated.set(isTranslated)
                    }
                }
            })
        })

        this.translationObserver.observe(htmlElement, {
            attributes: true,
            attributeFilter: ['class', 'lang'],
        })
    }

    setExamScheduleId(id: string) {
        this.examScheduleId = id
        this.loadSystemConfig()
    }

    setInitialState(violationCount: number, mouseAwayDuration: number) {
        this._violationCount.set(violationCount)
        this.currentMouseAwayDuration = mouseAwayDuration

        const remaining = Math.max(
            0,
            this.INITIAL_WARNING_TIME - this.currentMouseAwayDuration,
        )
        this.warningCountdown.set(remaining)
    }

    private loadSystemConfig() {
        this.api.getData('/api/v1/sys_conf/UKM_MAUSE_AWAY_TIMEOUT').subscribe({
            next: (res: SystemConfig) => {
                if (res && res.value) {
                    this.INITIAL_WARNING_TIME = parseInt(res.value, 10)
                    // Recalculate countdown based on stored duration
                    const remaining = Math.max(
                        0,
                        this.INITIAL_WARNING_TIME -
                            this.currentMouseAwayDuration,
                    )
                    this.warningCountdown.set(remaining)
                }
            },
        })

        this.api.getData('/api/v1/sys_conf/UKM_MAX_VIOLATION').subscribe({
            next: (res: SystemConfig) => {
                if (res && res.value) {
                    this.MAX_VIOLATIONS = parseInt(res.value, 10)
                }
            },
        })
    }

    private startConnectionCheck() {
        if (this.isSubmitted()) {
            return
        }
        // Check connection every 10 seconds
        this.connectionCheckSub = interval(10000).subscribe(() => {
            this.checkConnection()
        })
    }

    private checkConnection() {
        // Ping the server to verify connectivity
        // Using a lightweight endpoint or one that we know exists
        this.api.getData('/api/v1/exam_type').subscribe({
            next: () => {
                if (!this.isOnline) {
                    this.isOnline = true
                }
            },
            error: () => {
                this.isOnline = false
            },
        })
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
        this.connectionCheckSub?.unsubscribe()
        this.translationObserver?.disconnect()
    }

    /**
     * Clear warning countdown from localStorage (call after successful submission)
     */
    clearWarningCountdown() {
        this.warningCountdown.set(this.INITIAL_WARNING_TIME)
    }

    /**
     * Add a violation
     */
    addViolation(reason: string) {
        if (this.isUnloading() || this.isSubmitted() || this.isTranslated())
            return
        const now = Date.now()
        if (now - this.lastViolationTime < 1000) {
            return
        }
        this.lastViolationTime = now
        if (reason) this.lastViolationReason.set(reason)

        if (this._violationCount() < this.MAX_VIOLATIONS) {
            this._violationCount.update((count) => count + 1)
        }

        if (this.isOnline) {
            this.sendViolation(reason)
        }
    }

    private sendViolation(reason: string) {
        if (!this.examScheduleId) return

        this.api
            .postData(`/api/v1/exam/violation/${this.examScheduleId}`, {
                remark: reason,
            })
            .subscribe({
                next: () => {},
                error: (err) => {
                    if (
                        err.error?.message === 'VIOLATION_LIMIT_REACHED' ||
                        err.error === 'VIOLATION_LIMIT_REACHED'
                    ) {
                        this.triggerAutoSubmit()
                    }
                },
            })
    }

    /**
     * Clear all violations from localStorage
     */
    private clearViolationCount() {
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
     * Request exit fullscreen mode
     */
    exitFullScreen() {
        const exit =
            document.exitFullscreen ||
            (document as any).mozCancelFullScreen ||
            (document as any).webkitExitFullscreen ||
            (document as any).msExitFullscreen

        if (exit) {
            exit.call(document).catch((err: any) => {
                console.error('Failed to exit fullscreen:', err)
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
                    `${reason}. Pelanggaran ${currentViolations}/${this.MAX_VIOLATIONS}.`,
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
    handleMouseMove(event: MouseEvent) {
        if (this.isSubmitted()) return

        const inside = this.isMouseInsideExamArea(event)

        if (inside !== this.isInside) {
            this.isInside = inside

            if (!inside && this.isFullscreen()) {
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
        this.mouseAwayStartTime = Date.now()
        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }

        this.warningInterval = setInterval(() => {
            this.warningCountdown.update((count) => count - 1)

            if (this.warningCountdown() <= 0) {
                clearInterval(this.warningInterval)
                this.lastViolationReason.set(
                    'Mouse keluar dari area ujian terlalu lama',
                )
                this.handler.handleAlert(
                    'Info',
                    'Anda telah tidak aktif terlalu lama. Ujian akan disubmit secara otomatis.',
                )
                // Send mouse away duration before submitting
                if (this.mouseAwayStartTime) {
                    const duration = Math.round(
                        (Date.now() - this.mouseAwayStartTime) / 1000,
                    )
                    if (duration > 0) {
                        this.sendMouseAway(duration)
                    }
                }
                this.triggerAutoSubmit()
            }
        }, 1000)
    }

    handleFullscreenExit() {
        // Check if we're actually exiting fullscreen (not entering it)
        // document.fullscreenElement is null when NOT in fullscreen
        if (!document.fullscreenElement) {
            this._isFullscreen.set(false)

            this.addViolation(
                'Anda keluar dari fullscreen, mohon tetap berada dalam model fullscreen saat waktu ujian berlangsung',
            )
        } else {
            this._isFullscreen.set(true)
        }
        // If document.fullscreenElement exists, user is entering fullscreen - no violation needed
    }
    /**
     * Pause warning countdown (when user returns to exam area)
     * Does NOT reset the countdown - preserves the current value
     */
    private pauseWarningCountdown() {
        if (this.mouseAwayStartTime) {
            const duration = Math.round(
                (Date.now() - this.mouseAwayStartTime) / 1000,
            )
            if (duration > 0) {
                this.sendMouseAway(duration)
            }
            this.mouseAwayStartTime = undefined
        }

        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }
    }

    private sendMouseAway(numOfSecods: number) {
        if (!this.examScheduleId) return
        this.currentMouseAwayDuration += numOfSecods
        this.api
            .postData(`/api/v1/exam/mouse_away/${this.examScheduleId}`, {
                numOfSecods,
            })
            .subscribe({
                next: () => {},
                error: (err) => {
                    if (
                        err.error?.message === 'VIOLATION_LIMIT_REACHED' ||
                        err.error === 'VIOLATION_LIMIT_REACHED'
                    ) {
                        this.handler.handleAlert(
                            'Error',
                            'Batas waktu mouse di luar area ujian telah habis. Ujian akan disubmit otomatis.',
                        )
                        this.triggerAutoSubmit()
                    }
                },
            })
    }

    /**
     * Mark that page is unloading
     */
    markUnloading() {
        this.isUnloading.set(true)
    }

    /**
     * Mark that exam is submitted
     */
    markSubmitted() {
        this.isSubmitted.set(true)
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

    /**
     * Send a beacon when user closes the tab
     * Uses navigator.sendBeacon for reliable delivery even as page unloads
     * This is treated as a violation
     */
    sendTabCloseBeacon(
        examTypeCode: string,
        roomUkomId: string,
        participantId: string,
    ): void {
        const reason = 'Menutup tab ujian'
        const timestamp = Date.now()

        // Add to violation count locally
        if (this._violationCount() < this.MAX_VIOLATIONS) {
            this._violationCount.update((count) => count + 1)
        }

        if (!this.examScheduleId) return

        // Send via beacon since normal requests may be cancelled during unload
        const url = `${environment.apiBaseUrl}/api/v1/exam/violation/${this.examScheduleId}`

        const payload = {
            reason,
        }

        const blob = new Blob([JSON.stringify(payload)], {
            type: 'application/json',
        })

        const queued = navigator.sendBeacon(url, blob)
    }
}
