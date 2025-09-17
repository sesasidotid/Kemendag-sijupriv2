// import { Component } from '@angular/core'
// import { SystemConfigService } from '@/modules/base/services/system-config.service'
// import { BehaviorSubject, combineLatest, finalize, map, Observable } from 'rxjs'

// @Component({
//     selector: 'app-non-jf-ukom-register',
//     standalone: true,
//     imports: [],
//     templateUrl: './non-jf-ukom-register.component.html',
//     styleUrl: './non-jf-ukom-register.component.scss',
// })
// export class NonJfUkomRegisterComponent {
//     isLoading$: Observable<boolean>

//     isRegisterOpenLoading$ = new BehaviorSubject<boolean>(false)
//     isPredikatKinerjaLoading$ = new BehaviorSubject<boolean>(false)
//     isPendidikanLoading$ = new BehaviorSubject<boolean>(false)
//     isProvinsiLoading$ = new BehaviorSubject<boolean>(false)

//     constructor(private systemConfigService: SystemConfigService) {
//         this.isLoading$ = combineLatest([
//             this.isRegisterOpenLoading$,
//             this.isPredikatKinerjaLoading$,
//             this.isPendidikanLoading$,
//             this.isProvinsiLoading$,
//         ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
//     }

//     ngOnInit() {}

//     checkUkomRegistration() {
//         this.isRegisterOpenLoading$.next(true)
//         this.systemConfigService
//             .checkUkomRegistration()
//             .pipe(
//                 finalize(() => {
//                     this.isRegisterOpenLoading$.next(false)
//                 }),
//             )
//             .subscribe({
//                 next: (isOpen) => {
//                     this.isRegisterOpenLoading$.next(false)
//                 },
//             })
//     }
// }
