import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../petition.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './create-component.html', 
  styleUrl: './create-component.css',
})
export class CreateComponent {
  private fb = inject(FormBuilder);
  public petitionService = inject(PetitionService);
  private router = inject(Router);

  loading = signal(false);
  fileToUpload: File | null = null;

  itemForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    destinatary: ['', [Validators.required]],
    category_id: ['', [Validators.required]],
    file: [null, [Validators.required]] 
  });

  ngOnInit(): void {
    this.petitionService.fetchCategories().subscribe();
  }

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
      formData.append('title', this.itemForm.value.title!);
      formData.append('description', this.itemForm.value.description!);
      formData.append('destinatary', this.itemForm.value.destinatary!);
      formData.append('category_id', this.itemForm.value.category_id!);
      formData.append('file', this.fileToUpload);

      this.petitionService.create(formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/petitions']);
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