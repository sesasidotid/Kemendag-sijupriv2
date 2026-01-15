import {
    Directive,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    Optional,
} from '@angular/core'
import { NgControl } from '@angular/forms'
import { merge, Subscription } from 'rxjs'

@Directive({
    selector: '[appInvalidOnTouch]',
    standalone: true,
})
export class InvalidOnTouchDirective implements OnInit, OnDestroy {
    private sub?: Subscription

    constructor(
        private el: ElementRef<HTMLElement>,
        @Optional() private ngControl: NgControl,
    ) {}

    ngOnInit() {
        const control = this.ngControl?.control
        if (!control) return

        // Listen to both statusChanges (validity) and valueChanges (dirty state)
        this.sub = merge(
            control.statusChanges || [],
            control.valueChanges || [],
        ).subscribe(() => {
            this.updateClass()
        })

        // Initial check
        this.updateClass()
    }

    @HostListener('blur')
    onBlur() {
        // Check again on blur since touched state changes
        this.updateClass()
    }

    private updateClass() {
        const control = this.ngControl?.control
        if (!control) return

        const invalid = control.invalid && (control.touched || control.dirty)
        this.el.nativeElement.classList.toggle('is-invalid', invalid)
    }

    ngOnDestroy() {
        this.sub?.unsubscribe()
    }
}
