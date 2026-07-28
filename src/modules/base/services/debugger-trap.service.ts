import { Injectable, isDevMode } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class DebuggerTrapService {
    // constructor() {
    //     if (false) {
    //         this.initDebuggerTrap()
    //     }
    // }

    // private initDebuggerTrap() {
    //     setInterval(() => {
    //         const check = function () {
    //             debugger
    //         }
    //         check()
    //     }, 200)
    // }
}
