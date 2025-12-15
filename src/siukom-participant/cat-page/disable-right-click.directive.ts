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
    // @HostListener('contextmenu', ['$event'])
    // onRightClick(event: MouseEvent): void {
    //     event.preventDefault()
    // }
    @HostListener('mousedown', ['$event'])
    onMouseDown(e: MouseEvent) {
        if (e.button === 2) {
            // right button
            e.preventDefault()
        }
    }

    @HostListener('contextmenu', ['$event'])
    onContextMenu(e: MouseEvent) {
        e.preventDefault()
    }
}
