import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    Award,
    ClipboardCheck,
    FileText,
    LucideAngularModule,
    TrendingUp,
} from 'lucide-angular'

// Latar halaman login: grid tipis, ubin kaca berisi ikon fungsi SIJUPRI yang
// melayang pelan, dan garis cahaya yang meluncur di sepanjang garis grid.
// Dipakai bersama oleh halaman login dan login UKom.

// Jarak garis grid (px). Garis cahaya diletakkan tepat di atas garis grid.
const CELL = 96

interface Tile {
    icon: typeof Award
    label: string
    left: number // %
    top: number // %
    delay: number // detik
}

interface Beam {
    col: number
    row: number
    vertical: boolean
    delay: number
    duration: number
}

const TILES: Tile[] = [
    { icon: ClipboardCheck, label: 'UKom', left: 12, top: 22, delay: 0 },
    { icon: FileText, label: 'Dokumen', left: 40, top: 27, delay: 1.5 },
    { icon: TrendingUp, label: 'Angka Kredit', left: 7, top: 62, delay: 2.2 },
    { icon: Award, label: 'Sertifikat', left: 31, top: 75, delay: 3 },
]

const BEAMS: Beam[] = [
    { col: 3, row: 1, vertical: false, delay: 0, duration: 5 },
    { col: 7, row: 0, vertical: true, delay: 2.5, duration: 6 },
    { col: 2, row: 3, vertical: false, delay: 1.2, duration: 5.5 },
    { col: 1, row: 5, vertical: true, delay: 3.6, duration: 6 },
    { col: 5, row: 7, vertical: false, delay: 4.2, duration: 5 },
    { col: 9, row: 4, vertical: true, delay: 1.8, duration: 6.5 },
]

@Component({
    selector: 'app-login-backdrop',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid"></div>

        <div
            *ngFor="let b of beams"
            class="beam-track"
            [class.is-vertical]="b.vertical"
            [style.left.px]="b.col * cell"
            [style.top.px]="b.row * cell"
        >
            <span class="beam-dot"></span>
            <span
                class="beam"
                [style.animation-delay.s]="b.delay"
                [style.animation-duration.s]="b.duration"
            ></span>
        </div>

        <span
            *ngFor="let t of tiles"
            class="tile"
            [style.left.%]="t.left"
            [style.top.%]="t.top"
            [style.animation-delay.s]="t.delay"
            [attr.title]="t.label"
        >
            <i-lucide [img]="t.icon" [size]="22"></i-lucide>
        </span>
    `,
    styles: `
        :host {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            /* Sorotan biru lembut di area identitas + pendar hijau brand di kanan bawah */
            background:
                radial-gradient(ellipse 55% 60% at 30% 50%, rgba(41, 103, 190, 0.4), transparent 70%),
                radial-gradient(ellipse 45% 40% at 90% 95%, rgba(73, 171, 73, 0.22), transparent 70%);
        }

        .grid {
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: ${CELL}px ${CELL}px;
            mask-image: radial-gradient(ellipse 80% 80% at 35% 50%, #000 30%, transparent 85%);
            -webkit-mask-image: radial-gradient(
                ellipse 80% 80% at 35% 50%,
                #000 30%,
                transparent 85%
            );
        }

        /* ---------- Garis cahaya ---------- */
        .beam-track {
            position: absolute;
            width: ${CELL * 2}px;
            height: 1px;
            transform-origin: 0 0;
        }

        .beam-track.is-vertical {
            transform: rotate(90deg);
        }

        .beam-dot {
            position: absolute;
            left: -3px;
            top: -3px;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.35);
        }

        .beam {
            position: absolute;
            left: 0;
            top: 0;
            width: 90px;
            height: 1px;
            opacity: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7));
            animation: beam-run 5s ease-in-out infinite;
        }

        /* Kepala garis yang berpendar */
        .beam::after {
            content: '';
            position: absolute;
            right: -3px;
            top: -2px;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 8px 2px rgba(143, 188, 243, 0.9);
        }

        @keyframes beam-run {
            0% {
                transform: translateX(-90px) scaleX(0.2);
                opacity: 0;
            }
            15% {
                opacity: 1;
            }
            45% {
                transform: translateX(${CELL * 2 - 90}px) scaleX(1);
                opacity: 1;
            }
            60%,
            100% {
                transform: translateX(${CELL * 2 - 90}px) scaleX(1);
                opacity: 0;
            }
        }

        /* ---------- Ubin ikon ---------- */
        .tile {
            position: absolute;
            display: grid;
            place-items: center;
            width: 56px;
            height: 56px;
            border-radius: 14px;
            color: #fff;
            background: linear-gradient(
                150deg,
                rgba(255, 255, 255, 0.16),
                rgba(255, 255, 255, 0.05)
            );
            border: 1px solid rgba(255, 255, 255, 0.22);
            box-shadow:
                0 10px 28px rgba(5, 12, 30, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            animation: tile-float 6s ease-in-out infinite;
        }

        @keyframes tile-float {
            0%,
            100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        /* Satu kolom: ubin & garis cahaya akan menimpa form, cukup grid */
        @media (max-width: 1279.98px) {
            .tile,
            .beam-track {
                display: none;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .tile,
            .beam {
                animation: none;
            }
        }
    `,
})
export class LoginBackdropComponent {
    readonly cell = CELL
    readonly tiles = TILES
    readonly beams = BEAMS
}
