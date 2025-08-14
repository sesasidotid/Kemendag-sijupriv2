// import { Injectable } from '@angular/core';
// import {
//     HttpEvent,
//     HttpHandler,
//     HttpInterceptor,
//     HttpRequest,
//     HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { LoginContext } from '../../modules/base/commons/login-context'; // adjust path if needed

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//     constructor(private router: Router) { }

//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         return next.handle(req).pipe(
//             catchError((error: any) => {
//                 if (error instanceof HttpErrorResponse) {
//                     if (
//                         error.error?.message === 'Unauthenticated.' &&
//                         error.error?.code === 'Unhandled Error'
//                     ) {
//                         this.logOut();
//                     }
//                 }
//                 return throwError(() => error);
//             })
//         );
//     }

//     private logOut() {
//         if (LoginContext.getApplicationCode() === 'siukom-participant') {
//             this.router.navigate(['/login-cat']).then(() => {
//                 console.log('reload');
//                 window.location.reload();
//             });
//         } else {
//             this.router.navigate(['/login']).then(() => {
//                 console.log('reload');
//                 window.location.reload();
//             });
//         }

//         LoginContext.release();
//     }
// }

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginContext } from '../../modules/base/commons/login-context'; // adjust path if needed
import { catchError } from 'rxjs/operators';


export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        // Catch errors
        catchError((error) => {
            if (
                error?.error?.message === 'Unauthenticated.' &&
                error?.error?.code === 'Unhandled Error'
            ) {
                if (LoginContext.getApplicationCode() === 'siukom-participant') {
                    router.navigate(['/login-cat']).then(() => {
                        console.log('reload');
                        window.location.reload();
                    });
                } else {
                    router.navigate(['/login']).then(() => {
                        console.log('reload');
                        window.location.reload();
                    });
                }
                LoginContext.release();
            }
            throw error;
        })
    );
};
