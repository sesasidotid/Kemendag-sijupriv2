import { inject, Injectable, signal, effect } from '@angular/core'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ApiService } from '@/modules/base/services/api.service'
import { interval, Subscription } from 'rxjs'
import { SystemConfig } from '@/modules/base/models/system-config.model'
import { CatExamQueueService } from './cat-exam-queue.service'

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
    private queueService = inject(CatExamQueueService)

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
    private onExamFinishCallback?: () => void

    private isOnline = navigator.onLine
    // todo : remove this debug flag in production
    // private isOnline = false
    private connectionCheckSub?: Subscription

    // Translation Detection
    readonly isTranslated = signal(false)
    private translationObserver?: MutationObserver
    private isMouseTrackingReady = false

    constructor() {
        this.detectTranslation()
        this.setupViolationWatcher()
        this.startConnectionCheck()
        this.queueService.cleanupOldQueues()
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

        this.connectionCheckSub = interval(10000).subscribe(() => {
            this.checkConnection()
        })
    }

    private checkConnection() {
        this.api.getData('/api/v1/exam_type').subscribe({
            next: () => {
                if (!this.isOnline) {
                    this.isOnline = true
                    this.sendPendingQueues()
                }
            },
            error: () => {
                this.isOnline = false
            },
        })
    }

    private async sendPendingQueues() {
        if (!this.examScheduleId) return

        const queue = await this.queueService.getQueue(this.examScheduleId)
        if (!queue) return

        if (queue.violations.length > 0) {
            const violations = [...queue.violations]
            for (const violation of violations) {
                await this.sendViolationFromQueue(violation.reason)
            }
        }

        if (queue.mouseAwayDurations.length > 0) {
            const mouseAwayDurations = [...queue.mouseAwayDurations]
            for (const mouseAway of mouseAwayDurations) {
                await this.sendMouseAwayFromQueue(mouseAway.numOfSeconds)
            }
        }
    }

    /**
     * Initialize security measures for the exam
     */
    initializeSecurity(onExamFinish: () => void) {
        this.onExamFinishCallback = onExamFinish
        this.enterFullScreen()
        this.setupEventListeners()
        setTimeout(() => {
            this.isMouseTrackingReady = true
        }, 1000)
        if (this.isOnline) {
            this.sendPendingQueues()
        }
    }

    /**
     * Clean up security measures
     */
    cleanup() {
        this.pauseWarningCountdown()
        this.removeEventListeners()
        this.connectionCheckSub?.unsubscribe()
        this.translationObserver?.disconnect()
        this.isMouseTrackingReady = false
    }

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
        } else {
            if (this.examScheduleId) {
                this.queueService.addViolation(this.examScheduleId, {
                    reason,
                    timestamp: now,
                })
            }
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
                    console.error('Error sending violation:', err)
                    if (err.error?.code == 'VIOLATION_LIMIT_REACHED') {
                        this.handler.handleAlert(
                            'Error',
                            'Anda telah melanggar aturan ujian terlalu banyak. Ujian akan disubmit secara otomatis.',
                            10000,
                        )
                        this.handleExamFinish()
                    } else {
                        if (this.examScheduleId) {
                            this.queueService.addViolation(
                                this.examScheduleId,
                                {
                                    reason,
                                    timestamp: Date.now(),
                                },
                            )
                        }
                    }
                },
            })
    }

    /**
     * Send violation from queue (with removal on success)
     */
    private sendViolationFromQueue(reason: string): Promise<void> {
        return new Promise((resolve) => {
            if (!this.examScheduleId) {
                resolve()
                return
            }

            this.api
                .postData(`/api/v1/exam/violation/${this.examScheduleId}`, {
                    remark: reason,
                })
                .subscribe({
                    next: () => {
                        if (this.examScheduleId) {
                            this.queueService.removeViolations(
                                this.examScheduleId,
                                1,
                            )
                        }
                        resolve()
                    },
                    error: (err) => {
                        console.error(
                            'Error sending violation from queue:',
                            err,
                        )
                        if (err.error?.code == 'VIOLATION_LIMIT_REACHED') {
                            this.handler.handleAlert(
                                'Error',
                                'Anda telah melanggar aturan ujian terlalu banyak. Ujian akan disubmit secara otomatis.',
                                10000,
                            )
                            this.handleExamFinish()
                        }
                        resolve()
                    },
                })
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
     * Watch for violation threshold and show warnings
     * Auto-submit is triggered by backend response in sendViolation()
     * This effect runs automatically whenever violationCount changes
     */
    private setupViolationWatcher() {
        effect(() => {
            const currentViolations = this._violationCount()
            const reason = this.lastViolationReason()

            if (currentViolations > 0 && reason) {
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
        if (this.isSubmitted() || !this.isMouseTrackingReady) return

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
                if (this.mouseAwayStartTime) {
                    const duration = Math.floor(
                        (Date.now() - this.mouseAwayStartTime) / 1000,
                    )
                    if (duration > 0) {
                        this.sendMouseAway(duration)
                        this.currentMouseAwayDuration += duration
                    }
                    this.mouseAwayStartTime = undefined
                }
            }
        }, 1000)
    }

    handleFullscreenExit() {
        if (!document.fullscreenElement) {
            this._isFullscreen.set(false)

            this.addViolation(
                'Anda keluar dari fullscreen, mohon tetap berada dalam model fullscreen saat waktu ujian berlangsung',
            )
        } else {
            this._isFullscreen.set(true)
        }
    }

    /**
     * Pause warning countdown (when user returns to exam area)
     * Does NOT reset the countdown - preserves the current value
     */
    private pauseWarningCountdown() {
        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }

        if (this.mouseAwayStartTime) {
            const duration = Math.floor(
                (Date.now() - this.mouseAwayStartTime) / 1000,
            )

            if (duration >= 1) {
                this.sendMouseAway(duration)
                this.currentMouseAwayDuration += duration
            }
            this.mouseAwayStartTime = undefined
        }
    }

    private sendMouseAway(
        numOfSeconds: number,
        remark: string = 'Cursor keluar area ujian',
    ) {
        if (!this.examScheduleId) return
        this.api
            .postData(`/api/v1/exam/mouse_away/${this.examScheduleId}`, {
                numOfSeconds: numOfSeconds,
                remark: remark,
            })
            .subscribe({
                next: () => {},
                error: (err) => {
                    console.error('Error sending mouse away:', err)
                    if (err.error?.code === 'VIOLATION_LIMIT_REACHED') {
                        this.handler.handleAlert(
                            'Error',
                            'Batas waktu mouse di luar area ujian telah habis. Ujian akan disubmit otomatis.',
                            10000,
                        )
                        this.handleExamFinish()
                    } else {
                        // If failed to send, queue it for retry
                        if (this.examScheduleId) {
                            this.queueService.addMouseAway(
                                this.examScheduleId,
                                {
                                    numOfSeconds,
                                    timestamp: Date.now(),
                                },
                            )
                        }
                    }
                },
            })
    }

    /**
     * Send mouse away from queue (with removal on success)
     */
    private sendMouseAwayFromQueue(numOfSeconds: number): Promise<void> {
        return new Promise((resolve) => {
            if (!this.examScheduleId) {
                resolve()
                return
            }

            this.api
                .postData(`/api/v1/exam/mouse_away/${this.examScheduleId}`, {
                    numOfSeconds: numOfSeconds,
                    remark: 'Cursor keluar area ujian',
                })
                .subscribe({
                    next: () => {
                        // Successfully sent, remove from queue
                        if (this.examScheduleId) {
                            this.queueService.removeMouseAwayDurations(
                                this.examScheduleId,
                                1,
                            )
                        }
                        resolve()
                    },
                    error: (err) => {
                        console.error(
                            'Error sending mouse away from queue:',
                            err,
                        )
                        if (err.error?.code === 'VIOLATION_LIMIT_REACHED') {
                            this.handler.handleAlert(
                                'Error',
                                'Batas waktu mouse di luar area ujian telah habis. Ujian akan disubmit otomatis.',
                                10000,
                            )
                            this.handleExamFinish()
                        }
                        resolve()
                    },
                })
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

    private handleExamFinish() {
        if (this.onExamFinishCallback) {
            this.onExamFinishCallback()
        }
    }
    /**
     * Clear violations (call after successful submission)
     */
    clearViolations() {
        this.clearViolationCount()
        this.clearWarningCountdown()
        if (this.examScheduleId) {
            this.queueService.clearQueue(this.examScheduleId)
        }
    }
}
