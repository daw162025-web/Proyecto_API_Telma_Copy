import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PetitionService } from '../../petition.service'; 
@Component({
  selector: 'app-edit-petition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-component.html',
  styleUrl: './edit-component.css'
})
export class EditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private petitionService = inject(PetitionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  petitionId: number = 0;
  
  // Signals para gestionar el estado de la vista
  categories = this.petitionService.allCategories; 
  loading = signal(false);
  currentImage = signal<string | null>(null); 
  selectedFile: File | null = null;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.required],
      destinatary: ['', Validators.required],
      category_id: ['', Validators.required],
      file: [null] 
    }); 
  }

  ngOnInit(): void {
    // Cargamos las categorías si no están cargadas
    this.petitionService.fetchCategories().subscribe();

    // Obtenemos el ID y cargamos la petición
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.petitionId = Number(idParam);
      this.loadPetitionData(this.petitionId);
    }
  }

  loadPetitionData(id: number) {
    this.loading.set(true);
    this.petitionService.getById(id).subscribe({
      next: (petition: any) => {
        // Rellenamos el formulario con los datos recibidos
        this.form.patchValue({
          title: petition.title,
          description: petition.description,
          destinatary: petition.destinatary,
          category_id: petition.category_id
        });

        let imagePath = null;
        // Guardamos la imagen actual para mostrarla
        if (petition.files && petition.files.length > 0) {
            const lastFile = petition.files[petition.files.length - 1];
            imagePath = lastFile.file_path; 
        } 
        // Buscar en la columna simple
        else if (petition.image) {
            imagePath = petition.image;
        }

        //Si hemos encontrado imagen, actualizamos la señal para que se vea
        if (imagePath) {
            this.currentImage.set('http://localhost:8000/storage/' + imagePath);
        } else {
            // Resetear si no hay imagen
            this.currentImage.set(null); 
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar la petición');
        this.router.navigate(['/petitions']);
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formData = new FormData();
    formData.append('title', this.form.get('title')?.value);
    formData.append('description', this.form.get('description')?.value);
    formData.append('destinatary', this.form.get('destinatary')?.value);
    formData.append('category_id', this.form.get('category_id')?.value);

    // Solo enviamos archivo si el usuario seleccionó uno nuevo
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    formData.append('_method', 'PUT');

    this.petitionService.update(this.petitionId, formData).subscribe({
      next: () => {
        alert('Petición actualizada correctamente');
        this.router.navigate(['/petitions', this.petitionId]); // Volver al detalle
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar');
      }
    });
  }
}