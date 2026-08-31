import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PinLogin } from './PinLogin';

export function PanelAdmin() {
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState<{ nombre: string; rol: string } | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sesionIniciada) {
      fetchPedidos();
    }
  }, [sesionIniciada]);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // BLOQUEO ABSOLUTO: Si no hay sesión iniciada, muestra obligatoriamente el PIN y frena todo lo demás
  if (!sesionIniciada) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <PinLogin
          titulo="Seguridad de Cajero"
          onLoginSuccess={(usuario) => {
            setDatosUsuario(usuario);
            setSesionIniciada(true);
          }}
        />
      </div>
    );
  }

  // Panel real protegido
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-xs text-gray-500">
            Cajero: <b>{datosUsuario?.nombre}</b> ({datosUsuario?.rol})
          </p>
        </div>
        <button
          onClick={() => setSesionIniciada(false)}
          className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Gestión de Pedidos</h2>
          <button
            onClick={fetchPedidos}
            className="bg-amber-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-amber-600 transition"
          >
            Actualizar Lista
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay pedidos registrados todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase bg-gray-50">
                  <th className="p-3">ID / Cliente</th>
                  <th className="p-3">Detalle</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">
                      {pedido.cliente_nombre || 'Cliente'} <br/>
                      <span className="text-xs text-gray-400 font-normal">{pedido.cliente_telefono}</span>
                    </td>
                    <td className="p-3 text-gray-600 max-w-xs truncate">
                      ${pedido.monto_usd} ({pedido.banco_emisor})
                    </td>
                    <td className="p-3 font-semibold text-gray-800">
                      ${pedido.monto_usd?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                        {pedido.estado || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(pedido.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}