import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Petition } from '../../models/petition';
import { PetitionService } from '../../petition.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-list-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css',
})
export class ListComponent implements OnInit {
  // Services
  private petitionService = inject(PetitionService);
  public authService = inject(AuthService); // Public for HTML access
  private route = inject(ActivatedRoute);

  // Data State (Renamed to English)
  public petitions: Petition[] = [];
  public allPetitions: Petition[] = [];

  ngOnInit(): void {
    this.petitionService.fetchCategories().subscribe();
    // Primero nos suscribimos a los cambios de la URL
    this.route.queryParams.subscribe((params) => {
      this.loadPetitions(params['category_id']);
    });
  }
  
  getCategoryName(id: number): string {
    const categories = this.petitionService.allCategories();
    const found = categories.find(c => c.id === id);
    return found ? found.name : 'Sin categoría';
  }

  loadPetitions(categoryId?: string) {
    // 1. Usamos el Signal del servicio para que todo el sitio sepa que carga
    this.authService.loading.set(true); 

    this.petitionService.fetchPetitions().subscribe({
      next: (data: Petition[]) => {
        this.allPetitions = data;
        this.petitions = categoryId 
          ? this.allPetitions.filter(p => p.category_id == Number(categoryId)) 
          : data;
        
        // 2. Apagamos el Signal
        this.authService.loading.set(false); 
      },
      error: (err) => {
        console.error('Error:', err);
        // 3. ¡IMPORTANTE! Apagarlo también en caso de error
        this.authService.loading.set(false); 
      }
    });
  }

  // Renamed firmar -> sign
  sign(petition: Petition) {
    if (!petition.id) return;
    
    // Asumo que en el servicio también cambiaste el método a 'sign', 
    // si no, usa 'this.petitionService.firmar'
    this.petitionService.sign(petition.id).subscribe({
      next: () => {
        // Usamos 'signatories' (o 'firmantes' si tu BD aún lo devuelve así)
        petition.signeds = (petition.signeds || 0) + 1;
        alert('Petition signed successfully');
      },
      error: (err) =>
        alert('Error signing: ' + (err.error?.message || 'Unknown error')),
    });
  }

  // Renamed borrar -> delete
  delete(id: number) {
    if (confirm('Are you sure you want to delete this petition?')) {
      this.petitionService.delete(id).subscribe({
        next: () => {
          // Actualizamos los arrays locales eliminando la ID
          this.petitions = this.petitions.filter((p) => p.id !== id);
          this.allPetitions = this.allPetitions.filter((p) => p.id !== id);
        },
        error: (err) => alert('Could not delete petition'),
      });
    }
  }
}