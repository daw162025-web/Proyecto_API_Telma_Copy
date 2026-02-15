import { Component, inject, computed } from '@angular/core';
import { PetitionService } from '../../petition.service';
import { AuthService } from '../../auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-petitions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mypetitions-component.html'
})
export class MyPetitionsComponent {
  private petitionService = inject(PetitionService);
  private authService = inject(AuthService);

  // Cargamos peticiones si no están cargadas
  constructor() {
    this.petitionService.fetchPetitions().subscribe();
  }


  myPetitions = computed(() => {
    const userId = this.authService.currentUser()?.id;
    const all = this.petitionService.allPetitions();
    
    // Devolvemos solo donde el user_id coincide con el logueado
    return all.filter(p => p.user_id === userId);
  });
}