import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
