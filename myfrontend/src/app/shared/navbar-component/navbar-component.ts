import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css'
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public router = inject(Router);

  public currentUser = this.authService.currentUser;
  public isLoggedIn = this.authService.isLoggedIn;

  onLogout() {
    this.authService.logout().subscribe();
  }
}