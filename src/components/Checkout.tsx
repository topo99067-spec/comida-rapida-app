import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface CheckoutProps {
  montoUsd: number;
  tasaBcv: number;
  onOrdenCreada: (ordenId: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ montoUsd, tasaBcv, onOrdenCreada }) => {
  const montoBs = Number((montoUsd * tasaBcv).toFixed(2));

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [bancoEmisor, setBancoEmisor] = useState('Mercantil');
  const [cedulaEmisor, setCedulaEmisor] = useState('');
  const [telefonoEmisor, setTelefonoEmisor] = useState('');
  const [numeroReferencia, setNumeroReferencia] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg(null);

    try {
      let urlComprobante = null;

      // 1. Subir comprobante a Supabase Storage si se adjuntó una imagen
      if (comprobanteFile) {
        const fileExt = comprobanteFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `comprobantes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(filePath, comprobanteFile);

        if (uploadError) {
          console.warn('No se pudo subir la imagen del comprobante:', uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('comprobantes')
            .getPublicUrl(filePath);
          urlComprobante = publicUrlData.publicUrl;
        }
      }

      // 2. Insertar la orden en Supabase (incluyendo los campos de GPS)
      const { data, error } = await supabase
        .from('ordenes')
        .insert([
          {
            cliente_nombre: clienteNombre,
            cliente_telefono: clienteTelefono,
            monto_usd: montoUsd,
            tasa_bcv: tasaBcv,
            monto_bs: montoBs,
            banco_emisor: bancoEmisor,
            cedula_emisor: cedulaEmisor,
            telefono_emisor: telefonoEmisor,
            numero_referencia: numeroReferencia,
            url_comprobante: urlComprobante,
            latitud: null,
            longitud: null,
            estado: 'PENDIENTE_VERIFICACION',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data && data.id) {
        onOrdenCreada(data.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la orden. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard className="text-amber-600" /> Registro de Pago Móvil
      </h2>

      {/* Resumen del Pago */}
      <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-amber-800 font-semibold">Monto Total USD:</span>
          <span className="text-sm font-bold text-amber-900">${montoUsd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-amber-800 font-semibold">Tasa Oficial (BCV):</span>
          <span className="text-xs text-amber-800">{tasaBcv} Bs/$</span>
        </div>
        <div className="flex justify-between items-center border-t border-amber-200 pt-2 mt-2">
          <span className="text-sm font-bold text-amber-900">Total a pagar en Bolívares:</span>
          <span className="text-lg font-extrabold text-amber-900">{montoBs} Bs.</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Tu Nombre Completo</label>
          <input
            type="text"
            required
            placeholder="Ej. Juan Pérez"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Tu Teléfono de Contacto</label>
          <input
            type="tel"
            required
            placeholder="Ej. 04141234567"
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <hr className="my-2" />
        <p className="font-bold text-gray-700 text-sm">Datos del Pago Móvil Realizado</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Banco Emisor</label>
            <select
              value={bancoEmisor}
              onChange={(e) => setBancoEmisor(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Banesco">Banesco</option>
              <option value="Mercantil">Mercantil</option>
              <option value="Provincial">Provincial</option>
              <option value="Venezuela">Banco de Venezuela</option>
              <option value="BNC">BNC</option>
              <option value="Otro">Otro Banco</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Cédula del Titular</label>
            <input
              type="text"
              required
              placeholder="Ej. V12345678"
              value={cedulaEmisor}
              onChange={(e) => setCedulaEmisor(e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Teléfono Pagador</label>
            <input
              type="tel"
              required
              placeholder="Ej. 04241234567"
              value={telefonoEmisor}
              onChange={(e) => setTelefonoEmisor(e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nº Referencia (Últimos 4 o 6)</label>
            <input
              type="text"
              required
              placeholder="Ej. 998845"
              value={numeroReferencia}
              onChange={(e) => setNumeroReferencia(e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Adjuntar Comprobante (Opcional)</label>
          <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50">
            <Upload size={16} className="text-gray-500" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setComprobanteFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer"
        >
          {guardando ? (
            <span>Enviando pago...</span>
          ) : (
            <>
              <CheckCircle2 size={18} /> Confirmar y Enviar Pago
            </>
          )}
        </button>
      </form>
    </div>
  );
};