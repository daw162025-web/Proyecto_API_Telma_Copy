import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PetitionService } from '../../petition.service'; // Ajusta la ruta

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.css']
})
export class HomeComponent implements OnInit {
  private petitionService = inject(PetitionService);
  
  successStories = [
    { img: 'assets/imagenes/carousel1.jpg', firmas: '157.929' },
    { img: 'assets/imagenes/carousel2.jpg', firmas: '96.241' },
    { img: 'assets/imagenes/carousel3.jpg', firmas: '141.337' },
    { img: 'assets/imagenes/carousel4.jpg', firmas: '192.190' },
    { img: 'assets/imagenes/carousel5.jpg', firmas: '162.856' }
  ];

  categories = ['Sanidad', 'Animales', 'Medio Ambiente', 'Educación', 'Justicia Económica'];
  
  // Input del usuario
  searchTerm = signal(''); 

  petitions = this.petitionService.allPetitions;
  loading = this.petitionService.loading;

  // Cada vez que se escribe, la lista se recalcula sola
  filteredPetitions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.petitions();

    if (term) {
    // Filtramos en toda la lista y mostramos todas las coincidencias
    return all.filter(pet => 
      pet.title.toLowerCase().includes(term) || 
      pet.description.toLowerCase().includes(term)
    );
  }

  const topPetitions = [...all].sort((a, b) => (b.signeds || 0) - (a.signeds || 0));

  // Devolvemos solo las 3 primeras con mas firmas
  return topPetitions.slice(0, 3); 
});

  constructor(private router: Router) { }

  ngOnInit(): void {
  console.log('1. Iniciando Home Component...');

  this.petitionService.fetchPetitions().subscribe({
    next: (data) => {
      console.log('2. ¡Datos recibidos del servidor!', data);
      console.log('3. Estado del signal petitions:', this.petitions());
    },
    error: (err) => {
      console.error('2. Error al pedir peticiones:', err);
    }
  });
}

  // Helper para las imágenes de la bd
  getImgUrl(pet: any): string {
    if (pet.image) {
      return `http://localhost:8000/storage/${pet.image}`;
    }
    return 'assets/imagenes/petition1.jpg'; // Imagen por defecto si no tienen
  }
}