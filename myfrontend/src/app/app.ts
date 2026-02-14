import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // Importante: RouterOutlet
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { NavbarComponent } from './shared/navbar-component/navbar-component';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importamos RouterOutlet para el contenido dinámico y RouterLink para la navegación
  imports: [CommonModule, RouterOutlet, RouterLink, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'myfrontend';

  // Inyectamos auth público para usarlo en el HTML (Navbar)
  constructor(public auth: AuthService) {}
}