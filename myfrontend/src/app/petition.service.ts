import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Petition } from './models/petition';
import { tap, map } from 'rxjs';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })

export class PetitionService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8000/api/petitions';
  private readonly CATEGORIES_URL = 'http://localhost:8000/api/categories';

  // ‐‐‐ State (Signals) ‐‐‐
  // Store privado de petitions
  #petitions = signal<Petition[]>([]);
  #categories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  // ‐‐‐ Selectors ‐‐‐
  // Exponemos las peticiones como solo lectura
  allPetitions = this.#petitions.asReadonly();
  allCategories = this.#categories.asReadonly();

  
fetchCategories() {
  return this.http.get<any>(this.CATEGORIES_URL).pipe(
    map((res) => {
      // Si res es un array, lo devuelve. Si tiene .data, devuelve .data
      return Array.isArray(res) ? res : res.data;
    }),
    tap((data) => {
      console.log('Categorías recibidas:', data);
      this.#categories.set(data);
    })
  );
}

  fetchPetitions() {
    this.loading.set(true);
    return this.http.get<{ data: Petition[] }>(this.API_URL).pipe(
      map((res) => res.data),
      tap((data) => {
        this.#petitions.set(data);
        this.loading.set(false);
      }),
    );
  }


  getById(id: number): Observable<Petition> {
    // Solo añadimos la barra y el ID, porque API_URL ya tiene "/petitions"
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(res => res.data)
    );
}

  create(formData: FormData) {
    return this.http.post<{ data: Petition }>(this.API_URL, formData).pipe(
      tap((res) => {
        // Añadimos la nueva petición al principio de la lista local
        this.#petitions.update((list) => [res.data, ...list]);
      }),
    );
  }

  update(id: number, formData: FormData) {
    // Truco para que Laravel acepte archivos en actualización
    formData.append('_method', 'PUT');
    return this.http.post<{ data: Petition }>(`${this.API_URL}/${id}`, formData).pipe(
      tap((res) => {
        // Actualizamos solo la petición modificada en la lista local
        this.#petitions.update((list) => list.map((p) => (p.id === id ? res.data : p)));
      }),
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Eliminamos la petición de la lista local
        this.#petitions.update((list) => list.filter((p) => p.id !== id));
      }),
    );
    
  }
  sign(id: number) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.API_URL}/sign/${id}`,
      {},
    );
  }
  
}
