export interface Sala {
  id: number;
  nombre: string;
  capacidad: number;
  ubicacion?: string;
  descripcion?: string;
  recursos?: string[];
}