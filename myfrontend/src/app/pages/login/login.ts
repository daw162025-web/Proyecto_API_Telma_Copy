import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app‐login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  loading = signal(false);

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  login() {
    this.errorMessage = ''; // Reseteamos errores previos
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        // Si todo va bien, nos vamos a las peticiones
        this.loading.set(false);
        this.router.navigate(['/petitions']);
      },
      error: (err: { status: number }) => {
        this.loading.set(false);
        console.error('LOGIN ERROR', err);
        if (err.status === 401) {
          this.errorMessage = 'El email o la contraseña son incorrectos.';
          this.password = ''; // Borramos pass para facilitar reintento
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Inténtalo luego.';
        }
      },
    });
  }
}
