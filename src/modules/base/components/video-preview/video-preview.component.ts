import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

interface VideoInfo {
    embedUrl: SafeResourceUrl | null
    platform: string
    originalUrl: string
    isEmbeddable: boolean
}

@Component({
    selector: 'app-video-preview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-preview.component.html',
    styleUrl: './video-preview.component.scss',
})
export class VideoPreviewComponent implements OnChanges {
    @Input() videoUrl: string = ''
    @Input() height: string = '400px'
    @Input() showTitle: boolean = true

    videoInfo: VideoInfo | null = null

    constructor(private sanitizer: DomSanitizer) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['videoUrl'] && this.videoUrl) {
            this.videoInfo = this.processVideoUrl(this.videoUrl)
        }
    }

    private processVideoUrl(url: string): VideoInfo {
        const trimmedUrl = url.trim()

        // YouTube detection
        const youtubeRegex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const youtubeMatch = trimmedUrl.match(youtubeRegex)
        if (youtubeMatch) {
            const videoId = youtubeMatch[1]
            return {
                embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
                    `https://www.youtube.com/embed/${videoId}`,
                ),
                platform: 'YouTube',
                originalUrl: trimmedUrl,
                isEmbeddable: true,
            }
        }

        // Google Drive detection
        const driveRegex =
            /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/
        const driveMatch = trimmedUrl.match(driveRegex)
        if (driveMatch) {
            const fileId = driveMatch[1]
            return {
                embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
                    `https://drive.google.com/file/d/${fileId}/preview`,
                ),
                platform: 'Google Drive',
                originalUrl: trimmedUrl,
                isEmbeddable: true,
            }
        }

        // Vimeo detection
        const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/
        const vimeoMatch = trimmedUrl.match(vimeoRegex)
        if (vimeoMatch) {
            const videoId = vimeoMatch[1]
            return {
                embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
                    `https://player.vimeo.com/video/${videoId}`,
                ),
                platform: 'Vimeo',
                originalUrl: trimmedUrl,
                isEmbeddable: true,
            }
        }

        // Fallback for other URLs
        return {
            embedUrl: null,
            platform: 'Unknown',
            originalUrl: trimmedUrl,
            isEmbeddable: false,
        }
    }

    openInNewTab() {
        if (this.videoInfo?.originalUrl) {
            window.open(this.videoInfo.originalUrl, '_blank')
        }
    }
}
