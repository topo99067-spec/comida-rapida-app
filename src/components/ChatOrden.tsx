import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, MessageCircle } from 'lucide-react';

export interface Mensaje {
  id?: string;
  orden_id: string;
  remitente: 'cliente' | 'cajero';
  texto: string;
  created_at?: string;
}

interface Props {
  ordenId: string;
  rol: 'cliente' | 'cajero';
}

export const ChatOrden: React.FC<Props> = ({ ordenId, rol }) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes existentes
  const cargarMensajes = async () => {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('orden_id', ordenId)
      .order('created_at', { ascending: true });

    if (data) setMensajes(data as Mensaje[]);
  };

  useEffect(() => {
    cargarMensajes();

    // Escuchar mensajes en Tiempo Real para esta orden
    const channel = supabase
      .channel(`chat-orden-${ordenId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `orden_id=eq.${ordenId}`,
        },
        (payload) => {
          setMensajes((prev) => [...prev, payload.new as Mensaje]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ordenId]);

  // Scroll automático al final al recibir un mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;

    setEnviando(true);
    const texto = nuevoMensaje;
    setNuevoMensaje('');

    await supabase.from('mensajes').insert([
      {
        orden_id: ordenId,
        remitente: rol,
        texto: texto.trim(),
      },
    ]);

    setEnviando(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-80 w-full mt-4">
      {/* Encabezado del Chat */}
      <div className="bg-gray-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-amber-400" />
          <span>Chat de Soporte / Pedido</span>
        </div>
        <span className="bg-gray-700 px-2 py-0.5 rounded text-[10px] text-gray-300 capitalize">
          Modo: {rol}
        </span>
      </div>

      {/* Cuerpo de Mensajes */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50 text-xs">
        {mensajes.length === 0 ? (
          <p className="text-center text-gray-400 py-6 italic">
            Escribe un mensaje si necesitas comunicarte con {rol === 'cliente' ? 'el cajero' : 'el cliente'}.
          </p>
        ) : (
          mensajes.map((m, index) => {
            const esMio = m.remitente === rol;
            return (
              <div
                key={m.id || index}
                className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    esMio
                      ? 'bg-amber-500 text-white rounded-br-none'
                      : 'bg-white border text-gray-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="font-semibold text-[10px] opacity-75 mb-0.5 capitalize">
                    {m.remitente}
                  </p>
                  <p>{m.texto}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Formulario de Envío */}
      <form onSubmit={enviarMensaje} className="p-2 bg-white border-t flex gap-2">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder={`Escribir a ${rol === 'cliente' ? 'cajero' : 'cliente'}...`}
          className="flex-1 border text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={!nuevoMensaje.trim() || enviando}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};