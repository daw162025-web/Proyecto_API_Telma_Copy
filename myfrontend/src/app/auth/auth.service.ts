import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, tap, of, Observable, catchError } from 'rxjs'; 
import { LoginResponse, User } from './auth.model';
import { Router } from '@angular/router';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  private router = inject(Router);

  // SIGNALS
  currentUser = signal<any>(JSON.parse(localStorage.getItem('user_data') || 'null'));
  isLoggedIn = signal<boolean>(!!localStorage.getItem('access_token'));
  loading = signal<boolean>(false);

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_data');

    if (token) {
      this.isLoggedIn.set(true); 
    }

    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  // LOGIN
  login(credentials: any) {
    this.loading.set(true);
    return this.http.post<any>(`${this.api}/login`, credentials).pipe(
      tap((res) => {
        // Guardamos token
        localStorage.setItem('access_token', res.access_token);
        
        // Guardamos  usuario
        if (res.user) {
          localStorage.setItem('user_data', JSON.stringify(res.user));
          this.currentUser.set(res.user);
        }
        
        this.isLoggedIn.set(true);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  // REGISTER 
  register(data: { name: string; email: string; password: string }) {
    this.loading.set(true); 
    return this.http.post(`${this.api}/register`, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  // LOGOUT
  logout(): Observable<any> { 
    const token = this.getAccessToken();

    if (!token) {
      this.limpiarSesionLocal();
      return of(null); 
    }

    return this.http.post(`${this.api}/logout`, {}).pipe(
      catchError(() => of(null)), 
      finalize(() => {
        this.limpiarSesionLocal();
      })
    );
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  limpiarSesionLocal() {
    // Borramos datos del navegador
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    // Reseteamos los signals
    this.isLoggedIn.set(false);
    this.currentUser.set(null); 
    
    // Navegamos al login
    this.router.navigate(['/login']);
  }

  refreshToken() {
    return this.http.post<{ access_token: string }>(`${this.api}/refresh`, {}).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
      }),
    );
  }
  
  getProfile() {
    return this.http.get<User>(`${this.api}/me`).pipe(
      tap((user) => this.userSubject.next(user))
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