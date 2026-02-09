import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../auth/auth.model';

@Component({
  selector: 'app‐profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})

export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {
    // Enlazamos el observable del servicio directamente
    this.user$ = this.auth.user$;
  }
  
  ngOnInit(): void {
    // Si recargamos página en /profile, esto asegura que se pidan los datos
    this.auth.loadUserIfNeeded();
  }
  logout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
