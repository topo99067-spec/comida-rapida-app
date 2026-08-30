export interface Orden {
  id?: string;
  cliente_nombre: string;
  cliente_telefono: string;
  monto_usd: number;
  tasa_bcv: number;
  monto_bs: number;
  banco_emisor: string;
  cedula_emisor: string;
  telefono_emisor: string;
  numero_referencia: string;
  url_comprobante?: string;
  estado?: 'PENDIENTE_VERIFICACION' | 'APROBADO' | 'RECHAZADO' | 'EN_PREPARACION' | 'ENTREGADO';
  created_at?: string;
}

export type EstadoOrden = Orden['estado'];