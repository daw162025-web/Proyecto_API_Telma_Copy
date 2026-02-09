import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../petition.service'; // Asegúrate de la ruta
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './create-component.html', // Cuidado con el nombre del archivo
  styleUrl: './create-component.css',
})
export class CreateComponent {
  private fb = inject(FormBuilder);
  private peticionService = inject(PetitionService);
  private router = inject(Router);

  loading = signal(false);
  fileToUpload: File | null = null;

  // Lista temporal de categorías para el select
  // (En el futuro podrías cargarlas desde un CategoryService)
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
    categoria_id: ['', [Validators.required]],
    file: [null, [Validators.required]] // Control para validación visual
  });

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
      // Actualizamos el estado del formulario para que sepa que hay archivo
      this.itemForm.patchValue({ file: file as any }); 
    }
  }

  onSubmit() {
    if (this.itemForm.valid && this.fileToUpload) {
      this.loading.set(true);

      const formData = new FormData();
      formData.append('titulo', this.itemForm.value.titulo!);
      formData.append('descripcion', this.itemForm.value.descripcion!);
      formData.append('destinatario', this.itemForm.value.destinatario!);
      formData.append('categoria_id', this.itemForm.value.categoria_id!);
      formData.append('file', this.fileToUpload);

      this.peticionService.create(formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/peticiones']);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
          alert('Error al crear la petición');
        }
      });
    } else {
      this.itemForm.markAllAsTouched(); // Marca campos en rojo
      alert('Por favor, rellena todos los campos e incluye una imagen.');
    }
  }
}