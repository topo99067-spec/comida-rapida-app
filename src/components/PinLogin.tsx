import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface PinLoginProps {
  onLoginSuccess: (usuario: { nombre: string; rol: string }) => void;
  titulo?: string;
}

export const PinLogin: React.FC<PinLoginProps> = ({ onLoginSuccess, titulo = "Acceso Restringido" }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('cajeros')
        .select('*')
        .eq('pin', pin)
        .eq('activo', true)
        .single();

      if (error || !data) {
        setError('PIN incorrecto o usuario inactivo.');
      } else {
        onLoginSuccess({ nombre: data.nombre, rol: data.rol });
      }
    } catch (err) {
      setError('Error al validar el PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{titulo}</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Introduce tu PIN de acceso para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-3xl tracking-widest px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};