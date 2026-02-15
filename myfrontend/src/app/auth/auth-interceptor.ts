import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service'; 
import { catchError, switchMap, throwError, of } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  // Definimos qué rutas NO deben reintentarse nunca para evitar el bucle
  const isAuthRequest = req.url.includes('/login') || 
                        req.url.includes('/logout') || 
                        req.url.includes('/refresh');

  let request = req;
  if (token) {
    request = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      
      // Si el error viene de una ruta de autenticación
      if (isAuthRequest) {
        // Si falló el logout o el refresh, limpiamos los datos locales manualmente
        // para asegurar que el bucle se rompa aunque el servidor falle
        if (req.url.includes('/logout') || req.url.includes('/refresh')) {
          console.error('El refresco de token ha fallado en el servidor. Limpiando sesión...');
           auth.limpiarSesionLocal(); 
        }
        return throwError(() => err);
      }

      // CASO ESTÁNDAR: ERROR 401 en rutas normales (ej: /petitions)
      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap((res: any) => {
            localStorage.setItem('access_token', res.access_token);
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access_token}` }
            });
            return next(newReq);
          }),
          catchError((refreshErr) => {
            // Si el refresh falla, usamos la limpieza local para evitar peticiones extra
            auth.limpiarSesionLocal();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};