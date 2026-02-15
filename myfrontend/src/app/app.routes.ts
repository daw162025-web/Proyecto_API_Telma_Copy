import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';
import { ListComponent } from './pages/list-component/list-component';
import { CreateComponent } from './pages/create-component/create-component';
import { EditComponent } from './pages/edit-component/edit-component';
import { ShowComponent } from './pages/show-component/show-component';
import { HomeComponent } from './home/home-component/home-component';
import { MyPetitionsComponent } from './pages/mypetitions-component/mypetitions-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'petitions', component: ListComponent }, 
  { path: 'petitions/create', component: CreateComponent, canActivate: [authGuard] },
  { path: 'petitions/edit/:id', component: EditComponent, canActivate: [authGuard] },
  { path: 'petitions/:id', component: ShowComponent}, // Detalle público

  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'mypetitions', component: MyPetitionsComponent, canActivate: [authGuard] },

  // 5. Wildcard: Cualquier ruta desconocida redirige al login o home
  { path: '**', redirectTo: 'login' },
];
