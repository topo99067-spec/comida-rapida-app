import { useState } from 'react';
import { PinLogin } from './PinLogin';

export function PanelAdmin() {
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState<{ nombre: string; rol: string } | null>(null);

  // Si no ha iniciado sesión, mostramos la pantalla de PIN
  if (!sesionIniciada) {
    return (
      <PinLogin
        titulo="Panel de Cajero / Admin"
        onLoginSuccess={(usuario) => {
          setDatosUsuario(usuario);
          setSesionIniciada(true);
        }}
      />
    );
  }

  // Aquí continúa tu código normal del panel de cajero ya protegido
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Bienvenido, <b>{datosUsuario?.nombre}</b> ({datosUsuario?.rol})</span>
          <button
            onClick={() => setSesionIniciada(false)}
            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-200 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Resto de tu contenido y lógica de cajero */}
    </div>
  );
}