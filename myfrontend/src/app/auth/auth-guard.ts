import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) { 
    console.warn('Acceso denegado: No hay sesión activa');
    router.navigate(['/login']);
    return false;
  }

  return true;
};