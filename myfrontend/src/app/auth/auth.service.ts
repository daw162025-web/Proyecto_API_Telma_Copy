import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, tap } from 'rxjs';
import { LoginResponse, User } from './auth.model';
import { Router } from '@angular/router';
@Injectable({ providedIn: 'root' })

export class AuthService {
  private api = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  private router = inject(Router);

  // 1. SIGNAL: Estado reactivo para el Navbar.
  // Se inicializa comprobando si ya existe el token.
  isLoggedIn = signal<boolean>(!!localStorage.getItem('access_token'));

  user$ = this.userSubject.asObservable();
  currentUser = signal<any>(null);

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, credentials)
      .pipe(tap((res) => this.storeTokens(res)));
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    // Hacemos la petición al backend para invalidar el token allí
    return this.http.post(`${this.api}/logout`, {}).pipe(
      // 'finalize' se ejecuta SIEMPRE: cuando termina bien (next) O cuando falla (error)
      finalize(() => {
        this.limpiarSesionLocal();
      }),
    );
  }

  getProfile() {
    return this.http.get<User>(`${this.api}/me`).pipe(tap((user) => this.userSubject.next(user)));
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private storeTokens(res: LoginResponse) {
    console.log('LO QUE LLEGA DEL SERVIDOR:', res);
    localStorage.setItem('access_token', res.access_token);
    // 2. ACTUALIZACIÓN: Avisamos al signal de que ya estamos dentro
    this.isLoggedIn.set(true);
    // 2. Guardar Usuario (Ahora sí viene en 'res.user')
    if (res.user) {
      this.currentUser.set(res.user);
      // Guardamos en localStorage para que al pulsar F5 no se olvide
      localStorage.setItem('user_data', JSON.stringify(res.user));
    }
  }

  private limpiarSesionLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null); // Esto actualiza el Navbar al instante
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']); // Te manda al login
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  refreshToken() {
    return this.http.post<{ access_token: string }>(`${this.api}/refresh`, {}).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
      }),
    );
  }
  
  loadUserIfNeeded() {
    if (this.getAccessToken() && !this.userSubject.value) {
      this.getProfile().subscribe({
        error: () => this.limpiarSesionLocal(),
      });
    }
  }
}
