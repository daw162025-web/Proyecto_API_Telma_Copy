import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PetitionService } from '../../petition.service'; // Ajusta la ruta
import { AuthService } from '../../auth/auth.service';     // Ajusta la ruta
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
      // CONVERSIÓN A NÚMERO PARA EVITAR EL ERROR DE TIPADO
      const id = Number(idParam); 
      
      this.petitionService.getById(id).subscribe({
        next: (res: any) => {
          console.log('LO QUE LLEGA DEL SERVICIO:', res); // <--- Mira esto en la consola (F12)
          
          // Si en la consola ves el objeto {id: 3, title: ...} directamente:
          this.petition.set(res); 

          // Si en la consola ves {data: {id: 3...}}:
          // this.petition.set(res.data);
          
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        }
      });
    }
  }

  // show-component.ts

getImageUrl(): string {
  const pet = this.petition();
  if (!pet) return 'assets/imagenes/default-petition.png';

  // 1. PRIORIDAD: Buscar en la tabla 'files' (es la más fiable tras tu edición)
  if (pet.files && pet.files.length > 0) {
    // Tomamos el ÚLTIMO archivo subido (el más reciente)
    const lastFile = pet.files[pet.files.length - 1];
    return `http://localhost:8000/storage/${lastFile.file_path}`;
  }

  // 2. Fallback: Usar la columna 'image' de la tabla petitions
  if (pet.image) {
    return `http://localhost:8000/storage/${pet.image}`;
  }

  // 3. Si no hay nada, imagen por defecto
  return 'assets/imagenes/default-petition.png';
}

  delete(): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta petición?')) {
      this.petitionService.delete(this.petition().id).subscribe({
        next: () => {
          alert('Petición eliminada correctamente');
          this.router.navigate(['/petitions']);
        },
        error: (err) => alert('No se pudo eliminar la petición')
      });
    }
  }
}