export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioUsd: number;
  categoria: 'hamburguesas' | 'perros' | 'bebidas' | 'combos';
  imagenUrl: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}