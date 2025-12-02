import { Injectable, signal } from '@angular/core'
import { HandlerService } from '@/modules/base/services/handler.service'

/**
 * Service responsible for managing exam timer, countdown, and time-based auto-submission
 */
@Injectable({
    providedIn: 'root',
})
export class CatExamTimerService {
    readonly remainingTime = signal('00:00:00')
    readonly remainingSeconds = signal(0)

    private countdownInterval: any
    private onTimeExpiredCallback?: () => void

    constructor(private handler: HandlerService) {}

    /**
     * Start the exam countdown timer
     * @param examEndTime - The hard end time of the exam
     * @param startAt - When the participant started the exam
     * @param duration - Exam duration in hours
     * @param onTimeExpired - Callback to trigger when time expires
     */
    startCountdown(
        examEndTime: Date,
        startAt: string,
        duration: number,
        onTimeExpired: () => void,
    ) {
        this.onTimeExpiredCallback = onTimeExpired

        if (!examEndTime || !startAt || !duration) {
            console.error('Missing required parameters for countdown')
            return
        }

        const startTime = new Date(startAt).getTime()
        const durationMs = duration * 60 * 60 * 1000
        const calculatedEndTime = startTime + durationMs
        const hardEndTime = examEndTime.getTime()
        const effectiveEndTime = Math.min(calculatedEndTime, hardEndTime)

        const now = new Date().getTime()
        const initialTimeLeft = effectiveEndTime - now

        if (initialTimeLeft <= 0) {
            this.remainingTime.set('00:00:00')
            this.remainingSeconds.set(0)
            this.triggerTimeExpired()
            return
        }

        this.remainingTime.set(this.formatTime(initialTimeLeft))
        this.remainingSeconds.set(Math.floor(initialTimeLeft / 1000))

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
        }

        this.countdownInterval = setInterval(() => {
            const now = new Date().getTime()
            const timeLeft = effectiveEndTime - now

            if (timeLeft <= 0) {
                clearInterval(this.countdownInterval)
                this.remainingTime.set('00:00:00')
                this.remainingSeconds.set(0)
                this.triggerTimeExpired()
                this.handler.handleAlert(
                    'Info',
                    'Waktu ujian telah habis. Jawaban akan disimpan secara otomatis.',
                )
            } else {
                this.remainingTime.set(this.formatTime(timeLeft))
                this.remainingSeconds.set(Math.floor(timeLeft / 1000))
            }
        }, 1000)
    }

    /**
     * Stop the countdown timer
     */
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
        }
    }

    /**
     * Format milliseconds to HH:MM:SS
     */
    private formatTime(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(
            seconds,
        )}`
    }

    /**
     * Pad number with leading zero
     */
    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`
    }

    /**
     * Trigger time expired callback
     */
    private triggerTimeExpired() {
        if (this.onTimeExpiredCallback) {
            this.onTimeExpiredCallback()
        }
    }

    /**
     * Clean up timer
     */
    cleanup() {
        this.stopCountdown()
    }
}
