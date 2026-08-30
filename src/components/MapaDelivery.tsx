import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface MapaDeliveryProps {
  latitud: number | null;
  longitud: number | null;
}

export const MapaDelivery: React.FC<MapaDeliveryProps> = ({ latitud, longitud }) => {
  if (!latitud || !longitud) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-500">
        <MapPin size={18} className="mx-auto mb-1 text-gray-400 animate-pulse" />
        <span>Esperando coordenadas GPS del cliente...</span>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
  const wazeUrl = `https://waze.com/ul?ll=${latitud},${longitud}&navigate=yes`;

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-2">
      <div className="flex items-center gap-1.5 font-bold text-amber-900">
        <MapPin size={16} className="text-amber-600" />
        <span>Ubicación de Entrega (GPS)</span>
      </div>

      <p className="text-gray-600 font-mono text-[11px]">
        Lat: {latitud.toFixed(6)}, Lng: {longitud.toFixed(6)}
      </p>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-2 rounded-md text-center flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Navigation size={12} /> Google Maps
        </a>

        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-1.5 px-2 rounded-md text-center flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Navigation size={12} /> Waze
        </a>
      </div>
    </div>
  );
};