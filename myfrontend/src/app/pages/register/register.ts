import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterLink], 
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  formData = {
    name: '',
    email: '',
    password: '',
  };

  validationErrors: any = {};
  errorMessage: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  register() {
    this.validationErrors = {}; // Limpiar errores viejos
    this.errorMessage = '';

    this.auth.register(this.formData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log('🔴 Error crudo:', err);

        if (err.status === 422) {
          // Guardamos los errores
          this.validationErrors = err.error.errors;
          console.log('✅ Errores guardados para el HTML:', this.validationErrors);
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
        }
      },
    });
  }
}