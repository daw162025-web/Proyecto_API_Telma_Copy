import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, of } from 'rxjs'; //<- Añadimos 'of'

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // CASO 1: Bucle infinito o ruta prohibida
      if (req.url.includes('/refresh') || req.url.includes('/login')) {
        // En lugar de subscribe(), encadenamos el logout
        return auth.logout().pipe(
          // Si el logout falla (ej. servidor caído), no nos importa,
          // capturamos ese error interno y devolvemos null para seguir
          catchError(() => of(null)),
          // Al final, lanzamos el error original (401) para que la app reaccione
          switchMap(() => throwError(() => err)),
        );
      }
      // CASO 2: Error 401 estándar ‐> Intentar Refresh
      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.access_token;
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            // Si falla el refresh, hacemos logout encadenado correctamente
            return auth.logout().pipe(
              catchError(() => of(null)),
              switchMap(() => throwError(() => refreshErr)),
            );
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
