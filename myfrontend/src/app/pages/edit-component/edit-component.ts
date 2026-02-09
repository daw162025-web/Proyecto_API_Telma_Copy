import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../petition.service'; // Asegúrate de la ruta
import { Petition } from '../../models/petition'; // Asegúrate de la ruta
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-peticion-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './edit-component.html', // Corregido nombre estándar
  styleUrl: './edit-component.css'       // Añadido styleUrl
})
export class EditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private peticionService = inject(PetitionService);

  readonly API_STORAGE = 'http://localhost:8000/storage/';
  
  id = signal<number | null>(null);
  loading = signal(false);
  fileToUpload: File | null = null;
  peticion: Petition | null = null;

  // Lista de categorías para el select (Misma que en Create)
  categorias = [
    { id: 1, nombre: 'Naturaleza' },
    { id: 2, nombre: 'Derechos Humanos' },
    { id: 3, nombre: 'Educación' },
    { id: 4, nombre: 'Salud' },
    { id: 5, nombre: 'Justicia Económica' }
  ];

  itemForm = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    destinatario: ['', [Validators.required]],
    categoria_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
      this.cargarDatos(this.id()!);
    }
  }

  cargarDatos(id: number) {
    this.peticionService.getById(id).subscribe({
      next: (res: any) => {
        // Adaptamos la respuesta según venga (res.data o res directo)
        const data = res.data ? res.data : res;
        this.peticion = data as Petition;
        
        // Rellenamos el formulario con los datos recibidos
        this.itemForm.patchValue({
          titulo: data.titulo,
          descripcion: data.descripcion,
          destinatario: data.destinatario,
          categoria_id: data.categoria_id // Esto seleccionará la opción en el select
        });
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/peticiones']); // Si falla, volver al listado
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.fileToUpload = file;
  }

  onSubmit() {
    if (this.itemForm.invalid || !this.id()) {
        this.itemForm.markAllAsTouched();
        return;
    }

    this.loading.set(true);
    const formData = new FormData();
    
    // Obtenemos valores seguros
    formData.append('titulo', this.itemForm.get('titulo')?.value || '');
    formData.append('descripcion', this.itemForm.get('descripcion')?.value || '');
    formData.append('destinatario', this.itemForm.get('destinatario')?.value || '');
    formData.append('categoria_id', this.itemForm.get('categoria_id')?.value || '');

    // Solo añadimos archivo si el usuario seleccionó uno nuevo
    if (this.fileToUpload) {
      formData.append('file', this.fileToUpload);
    }

    // El servicio ya se encarga de añadir _method: PUT si usas el código anterior
    this.peticionService.update(this.id()!, formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/peticiones', this.id()]); // Volver al detalle
      },
      error: () => {
        this.loading.set(false);
        alert('Error al actualizar la petición');
      }
    });
  }

  getImagenUrl(): string {
    if (this.peticion && this.peticion.files && this.peticion.files.length > 0) {
      // Limpiamos la ruta igual que en ShowComponent
      const path = this.peticion.files[0].file_path.replace('storage/', '').replace('public/', '');
      return `${this.API_STORAGE}${path}`;
    }
    return 'assets/imagenes/placeholder.jpg'; // Imagen por defecto
  }
}