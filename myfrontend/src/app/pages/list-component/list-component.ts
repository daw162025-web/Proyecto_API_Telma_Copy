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
  templateUrl: './list-component.html', // Ojo: asegúrate del nombre del archivo
  styleUrl: './list-component.css',
})
export class ListComponent implements OnInit {
  private peticionService = inject(PetitionService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  public peticiones: Petition[] = [];
  public allPeticiones: Petition[] = [];
  public cargando: boolean = true;

  ngOnInit(): void {
    this.cargarPeticiones();
  }

  cargarPeticiones() {
    this.cargando = true;
    this.peticionService.fetchPetitions().subscribe({
      next: (data: Petition[]) => {
        this.allPeticiones = data;
        this.peticiones = this.allPeticiones;

        // Filtrado por parámetros de URL (Categoría)
        this.route.queryParams.subscribe((params) => {
          if (params['categoria_id']) { // Asumo que en la URL usas 'categoria_id'
            // CORRECCIÓN: Usamos 'categoria_id' del modelo
            this.peticiones = this.allPeticiones.filter(
              (p) => p.categoria_id == params['categoria_id']
            );
          } else {
            this.peticiones = this.allPeticiones;
          }
        });

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando peticiones', err);
        this.cargando = false;
      },
    });
  }

  firmar(peticion: Petition) {
    if (!peticion.id) return;
    
    this.peticionService.firmar(peticion.id).subscribe({
      next: () => {
        // CORRECCIÓN: Usamos 'firmantes' del modelo
        peticion.firmantes = (peticion.firmantes || 0) + 1;
        alert('Petición firmada con éxito');
      },
      error: (err) =>
        alert('Error al firmar: ' + (err.error?.message || 'Error desconocido')),
    });
  }

  borrar(id: number) {
    if (confirm('¿Estás seguro de querer borrar esta petición?')) {
      this.peticionService.delete(id).subscribe({
        next: () => {
          this.peticiones = this.peticiones.filter((p) => p.id !== id);
          this.allPeticiones = this.allPeticiones.filter((p) => p.id !== id);
        },
        error: (err) => alert('No se pudo borrar la petición'),
      });
    }
  }
}