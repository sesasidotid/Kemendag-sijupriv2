import { CanActivateFn, Router } from '@angular/router';
import { LoginContext } from '../commons/login-context';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (LoginContext.isLogin()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
