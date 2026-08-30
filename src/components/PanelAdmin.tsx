import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapaDelivery } from './MapaDelivery';
import { CheckCircle, XCircle, Clock, FileText, MapPin, Eye, X } from 'lucide-react';

interface Orden {
  id: string;
  created_at: string;
  cliente_nombre: string;
  cliente_telefono: string;
  monto_usd: number;
  tasa_bcv: number;
  monto_bs: number;
  numero_referencia: string;
  banco_emisor: string;
  cedula_emisor: string;
  telefono_emisor: string;
  capture_pago?: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: 'PENDIENTE_VERIFICACION' | 'APROBADO' | 'RECHAZADO';
}

export function PanelAdmin() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [captureModal, setCaptureModal] = useState<string | null>(null);

  useEffect(() => {
    cargarOrdenes();

    // Escuchar cambios en tiempo real (Nuevas órdenes o actualizaciones de GPS/Estado)
    const channel = supabase
      .channel('ordenes_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordenes' },
        () => {
          cargarOrdenes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cargarOrdenes = async () => {
    const { data, error } = await supabase
      .from('ordenes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrdenes(data as Orden[]);
    }
    setCargando(false);
  };

  const cambiarEstadoOrden = async (id: string, nuevoEstado: 'APROBADO' | 'RECHAZADO') => {
    const { error } = await supabase
      .from('ordenes')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar el estado: ' + error.message);
    } else {
      cargarOrdenes();
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12 text-gray-500 font-semibold text-sm">
        Cargando órdenes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel de Control - Cajero</h1>
          <p className="text-xs text-gray-500">Gestión de verificaciones y monitoreo de delivery GPS</p>
        </div>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
          {ordenes.filter((o) => o.estado === 'PENDIENTE_VERIFICACION').length} Pendientes
        </span>
      </div>

      {ordenes.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500 text-sm">
          No hay órdenes registradas por el momento.
        </div>
      ) : (
        <div className="grid gap-6">
          {ordenes.map((orden) => (
            <div
              key={orden.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col md:flex-row"
            >
              {/* DETALLES DE LA ORDEN Y PAGO */}
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{orden.cliente_nombre}</h3>
                    <p className="text-xs text-gray-500">
                      Teléfono: <span className="font-semibold text-gray-700">{orden.cliente_telefono}</span>
                    </p>
                  </div>

                  {/* BADGE DE ESTADO */}
                  <div>
                    {orden.estado === 'PENDIENTE_VERIFICACION' && (
                      <span className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        <Clock size={14} /> Pendiente
                      </span>
                    )}
                    {orden.estado === 'APROBADO' && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        <CheckCircle size={14} /> Aprobado
                      </span>
                    )}
                    {orden.estado === 'RECHAZADO' && (
                      <span className="flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        <XCircle size={14} /> Rechazado
                      </span>
                    )}
                  </div>
                </div>

                {/* INFORMACIÓN DEL PAGO MÓVIL */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500">Monto Bs:</p>
                    <p className="font-bold text-gray-800 text-sm">{orden.monto_bs} Bs.</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monto USD:</p>
                    <p className="font-bold text-gray-800 text-sm">${orden.monto_usd}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nº Referencia:</p>
                    <p className="font-bold text-gray-800">{orden.numero_referencia}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Banco / Cédula:</p>
                    <p className="font-semibold text-gray-800">{orden.banco_emisor} - {orden.cedula_emisor}</p>
                  </div>
                </div>

                {/* VER CAPTURE DE PAGO MÓVIL */}
                {orden.capture_pago ? (
                  <div className="flex items-center justify-between bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <img
                        src={orden.capture_pago}
                        alt="Capture Pago"
                        className="w-10 h-10 object-cover rounded border border-blue-300"
                      />
                      <span className="text-xs text-blue-900 font-semibold">Capture de Pago Móvil adjunto</span>
                    </div>
                    <button
                      onClick={() => setCaptureModal(orden.capture_pago!)}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-all cursor-pointer"
                    >
                      <Eye size={14} /> Ver Imagen
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded border border-gray-100">
                    Sin capture de pago adjunto.
                  </div>
                )}

                {/* ACCIONES DEL CAJERO */}
                {orden.estado === 'PENDIENTE_VERIFICACION' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => cambiarEstadoOrden(orden.id, 'APROBADO')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle size={16} /> Aprobar Pago
                    </button>
                    <button
                      onClick={() => cambiarEstadoOrden(orden.id, 'RECHAZADO')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                  </div>
                )}
              </div>

              {/* RASTREO GPS Y NAVEGACIÓN MAPS/WAZE */}
              <div className="p-5 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 md:w-80 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1 mb-3">
                    <MapPin size={16} className="text-amber-500" /> Ubicación GPS en Tiempo Real
                  </h4>
                  <MapaDelivery latitud={orden.latitud} longitud={orden.longitud} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA VER EL CAPTURE COMPLETO */}
      {captureModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-4 relative">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <FileText size={16} /> Capture del Pago Móvil
              </h3>
              <button
                onClick={() => setCaptureModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto flex justify-center bg-gray-900 rounded-lg p-2">
              <img
                src={captureModal}
                alt="Capture Completo"
                className="max-w-full h-auto object-contain rounded-md"
              />
            </div>

            <button
              onClick={() => setCaptureModal(null)}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 rounded-lg text-xs transition-all cursor-pointer"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}