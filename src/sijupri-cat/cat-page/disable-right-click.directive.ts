import { Directive, HostListener } from '@angular/core'

/**
 * Directive to disable right-click context menu on exam pages
 * Usage: <div appDisableRightClick>...</div>
 */
@Directive({
    selector: '[appDisableRightClick]',
    standalone: true,
})
export class DisableRightClickDirective {
    @HostListener('contextmenu', ['$event'])
    onRightClick(event: MouseEvent): void {
        event.preventDefault()
    }
}
