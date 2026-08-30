import React, { useState } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

export const LoginCajero: React.FC<Props> = ({ onLoginSuccess }) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pinCorrecto = import.meta.env.VITE_CAJERO_PIN || '1234';

    if (pinInput === pinCorrecto) {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
      setPinInput('');
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="text-center mb-6">
        <div className="bg-amber-100 text-amber-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
          <Lock size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Acceso Restringido - Cajero</h2>
        <p className="text-xs text-gray-500 mt-1">Ingresa la clave o PIN de acceso para gestionar los pagos</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">PIN / Clave de Cajero</label>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="****"
            className="w-full px-4 py-2 border rounded-lg text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
            required
            autoFocus
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-xs border border-red-200">
            <ShieldAlert size={16} />
            <span>Clave incorrecta. Acceso no autorizado.</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer"
        >
          Ingresar al Panel
        </button>
      </form>
    </div>
  );
};