import { PetitionFile } from './petition-file';
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}
export interface User {
  id: number;
  name: string;
  email?: string;
}
export interface Petition {
  id?: number;
  titulo: string;
  descripcion: string;
  destinatario: string;
  user_id?: number;
  categoria_id?: number;
  firmantes?: number;
  estado?: string;
  created_at?: Date;
  // Array de objetos PeticionFile
  files?: PetitionFile[];
  // Relaciones opcionales
  categoria?: Categoria;
  user?: User;
}
