import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  user = this.authService.currentUser; 

  ngOnInit(): void {
  }

  onLogout() {
    this.authService.logout().subscribe();
  }
}