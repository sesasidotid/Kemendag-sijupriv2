import { Directive, HostListener } from '@angular/core'

/**
 * Directive to prevent common keyboard shortcuts (copy, paste, cut, etc.)
 * Usage: <div appDisableKeyboardShortcuts>...</div>
 */
@Directive({
    selector: '[appDisableKeyboardShortcuts]',
    standalone: true,
})
export class DisableKeyboardShortcutsDirective {
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, F12
        if (
            (event.ctrlKey &&
                (event.key === 'c' ||
                    event.key === 'v' ||
                    event.key === 'x' ||
                    event.key === 'a' ||
                    event.key === 'p')) ||
            event.key === 'F12'
        ) {
            event.preventDefault()
        }
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        // Additional key monitoring if needed
    }
}
