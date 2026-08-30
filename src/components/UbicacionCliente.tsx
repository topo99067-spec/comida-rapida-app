import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UbicacionClienteProps {
  ordenId: string;
}

export const UbicacionCliente: React.FC<UbicacionClienteProps> = ({ ordenId }) => {
  const [estadoGps, setEstadoGps] = useState<'obteniendo' | 'activo' | 'error'>('obteniendo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setEstadoGps('error');
      setErrorMsg('Tu navegador no soporta geolocalización.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const { error } = await supabase
          .from('ordenes')
          .update({
            latitud: latitude,
            longitud: longitude,
          })
          .eq('id', ordenId);

        if (!error) {
          setEstadoGps('activo');
        }
      },
      (error) => {
        setEstadoGps('error');
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg('Permiso de ubicación denegado. Habilita el GPS en tu navegador.');
        } else {
          setErrorMsg('No se pudo obtener la ubicación GPS.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [ordenId]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 text-center">
      {estadoGps === 'obteniendo' && (
        <div className="flex items-center justify-center gap-2 text-amber-600 text-xs font-semibold">
          <MapPin size={16} className="animate-bounce" />
          <span>Obteniendo tu ubicación GPS para el delivery...</span>
        </div>
      )}

      {estadoGps === 'activo' && (
        <div className="flex items-center justify-center gap-2 text-green-600 text-xs font-semibold">
          <CheckCircle2 size={16} />
          <span>Ubicación transmitida en tiempo real al delivery</span>
        </div>
      )}

      {estadoGps === 'error' && (
        <div className="flex items-center justify-center gap-2 text-red-600 text-xs font-semibold">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};