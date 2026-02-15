import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PetitionService } from '../../petition.service'; 
import { AuthService } from '../../auth/auth.service';     
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './show-component.html',
  styleUrl: './show-component.css'
})
export class ShowComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petitionService = inject(PetitionService);
  private authService = inject(AuthService);

  petition = signal<any>(null);
  loading = signal(true);

  // Obtenemos el ID del usuario logueado desde el signal del AuthService
  currentUserId = computed(() => this.authService.currentUser()?.id);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam); 
      
      this.petitionService.getById(id).subscribe({
        next: (res: any) => {
          console.log('LO QUE LLEGA DEL SERVICIO:', res); 
          
          this.petition.set(res); 
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        }
      });
    }
  }

  getImageUrl(): string {
    const pet = this.petition();
    if (!pet) return 'assets/imagenes/default-petition.png';

  
    if (pet.files && pet.files.length > 0) {

      const lastFile = pet.files[pet.files.length - 1];
      return `http://localhost:8000/storage/${lastFile.file_path}`;
    }

    if (pet.image) {
      return `http://localhost:8000/storage/${pet.image}`;
    }

    return 'assets/imagenes/default-petition.png';
  }



  delete() {
    if (confirm('¿Estás seguro de que quieres borrar esta petición?')) {
      this.petitionService.delete(this.petition()!.id).subscribe({
        next: () => {
          alert('✅ Petición eliminada correctamente.');
          this.router.navigate(['/petitions']); 
        },
        error: (err) => {
          console.error(err);
          alert('❌ Ocurrió un error al intentar borrar.');
        }
      });
    }
  }
}