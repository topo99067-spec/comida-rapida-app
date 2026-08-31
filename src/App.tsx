import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { UbicacionCliente } from './components/UbicacionCliente';
import { PanelAdmin } from './components/PanelAdmin';
import { ShoppingCart, CheckCircle, Clock, XCircle, ArrowLeft, Send, ShieldCheck, User, Upload, Image as ImageIcon } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  precio_usd: number;
  imagen: string;
}

interface Orden {
  id: string;
  cliente_nombre: string;
  monto_usd: number;
  tasa_bcv: number;
  monto_bs: number;
  estado: string;
  numero_referencia: string;
}

const PRODUCTOS_EJEMPLO: Producto[] = [
  {
    id: '1',
    nombre: 'Hamburguesa Doble Carne + Papas',
    precio_usd: 6.5,
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '2',
    nombre: 'Combo Perro Caliente Especial',
    precio_usd: 2.5,
    imagen: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '3',
    nombre: 'Pizza Familiar Pepperoni',
    precio_usd: 12.5,
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '4',
    nombre: 'Ración de Tequeños (6 unid)',
    precio_usd: 4.0,
    imagen: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=500&q=80',
  },
];

export function App() {
  const [modo, setModo] = useState<'cliente' | 'cajero'>('cliente');

  const [tasaCambio] = useState<number>(787.52);
  const [paso, setPaso] = useState<'menu' | 'pago' | 'estado'>('menu');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Formulario Pago Móvil
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [referencia, setReferencia] = useState('');
  const [banco, setBanco] = useState('Provincial');
  const [cedula, setCedula] = useState('');
  const [captureBase64, setCaptureBase64] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Orden Activa
  const [ordenActiva, setOrdenActiva] = useState<Orden | null>(null);

  useEffect(() => {
    if (!ordenActiva) return;

    const channel = supabase
      .channel(`orden_${ordenActiva.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ordenes',
          filter: `id=eq.${ordenActiva.id}`,
        },
        (payload) => {
          setOrdenActiva(payload.new as Orden);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ordenActiva?.id]);

  const seleccionarProducto = (prod: Producto) => {
    setProductoSeleccionado(prod);
    setPaso('pago');
  };

  const manejarArchivoImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCaptureBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const enviarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado) return;

    setCargando(true);
    const montoBs = Number((productoSeleccionado.precio_usd * tasaCambio).toFixed(2));

    const nuevaOrden = {
      cliente_nombre: nombre,
      cliente_telefono: telefono,
      monto_usd: productoSeleccionado.precio_usd,
      tasa_bcv: tasaCambio,
      monto_bs: montoBs,
      numero_referencia: referencia,
      banco_emisor: banco,
      cedula_emisor: cedula,
      telefono_emisor: telefono,
      capture_pago: captureBase64,
      latitud: null,
      longitud: null,
      estado: 'PENDIENTE_VERIFICACION',
    };

    const { data, error } = await supabase
      .from('ordenes')
      .insert([nuevaOrden])
      .select()
      .single();

    setCargando(false);

    if (error) {
      alert('Error al registrar la orden: ' + error.message);
    } else if (data) {
      setOrdenActiva(data);
      setPaso('estado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      {/* HEADER */}
      <header className="bg-amber-500 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-lg">
          <ShoppingCart size={22} />
          <span>Fast Food Express</span>
        </div>

        <div className="flex gap-2 bg-amber-600/60 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setModo('cliente')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              modo === 'cliente' ? 'bg-white text-amber-700 shadow-sm' : 'text-white hover:bg-amber-600'
            }`}
          >
            <User size={14} /> Vista Cliente
          </button>
          <button
            onClick={() => setModo('cajero')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              modo === 'cajero' ? 'bg-white text-amber-700 shadow-sm' : 'text-white hover:bg-amber-600'
            }`}
          >
            <ShieldCheck size={14} /> Panel Cajero
          </button>
        </div>
      </header>

      {/* RENDERIZADO PRINCIPAL */}
      {modo === 'cajero' ? (
        <main className="max-w-4xl mx-auto p-4">
          <PanelAdmin />
        </main>
      ) : (
        <main className="max-w-md mx-auto p-4 space-y-4">
          {paso === 'menu' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 text-base">Selecciona tu Pedido</h2>
              <div className="grid gap-4">
                {PRODUCTOS_EJEMPLO.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row"
                  >
                    <img
                      src={prod.imagen}
                      alt={prod.nombre}
                      className="w-full sm:w-32 h-36 object-cover"
                    />
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{prod.nombre}</h3>
                        <p className="text-xs text-amber-600 font-bold mt-1">
                          ${prod.precio_usd.toFixed(2)} USD / {(prod.precio_usd * tasaCambio).toFixed(2)} Bs.
                        </p>
                      </div>
                      <button
                        onClick={() => seleccionarProducto(prod)}
                        className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg transition-all cursor-pointer"
                      >
                        Pedir Ahora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paso === 'pago' && productoSeleccionado && (
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 space-y-4">
              <button
                onClick={() => setPaso('menu')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <ArrowLeft size={14} /> Volver al menú
              </button>

              <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <img
                  src={productoSeleccionado.imagen}
                  alt={productoSeleccionado.nombre}
                  className="w-14 h-14 object-cover rounded-md"
                />
                <div className="text-xs text-amber-900 space-y-0.5">
                  <p className="font-bold">{productoSeleccionado.nombre}</p>
                  <p><span className="font-semibold">Monto USD:</span> ${productoSeleccionado.precio_usd.toFixed(2)}</p>
                  <p><span className="font-semibold">Monto Bs:</span> {(productoSeleccionado.precio_usd * tasaCambio).toFixed(2)} Bs.</p>
                </div>
              </div>

              <form onSubmit={enviarPago} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Tu Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan García"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 04248697854"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Número de Referencia (Pago Móvil)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 998685279"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Banco Emisor</label>
                    <select
                      value={banco}
                      onChange={(e) => setBanco(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="Provincial">Provincial</option>
                      <option value="Mercantil">Mercantil</option>
                      <option value="Banesco">Banesco</option>
                      <option value="Venezuela">BDV (Venezuela)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Cédula Titular</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 13145683"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Capture de Pago Móvil (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarArchivoImagen}
                      className="hidden"
                      id="input-capture"
                    />
                    <label htmlFor="input-capture" className="cursor-pointer flex flex-col items-center gap-1">
                      {captureBase64 ? (
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                          <ImageIcon size={18} />
                          <span>¡Capture adjuntado correctamente!</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-500">
                          <Upload size={20} />
                          <span>Haz clic para subir la foto del recibo</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
                >
                  <Send size={16} /> {cargando ? 'Procesando...' : 'Confirmar y Enviar Pedido'}
                </button>
              </form>
            </div>
          )}

          {paso === 'estado' && ordenActiva && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 text-center space-y-3">
                <h2 className="font-bold text-gray-800 text-lg">Estado de tu Pedido</h2>

                <div className="flex justify-center">
                  {ordenActiva.estado === 'PENDIENTE_VERIFICACION' && (
                    <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold text-xs animate-pulse">
                      <Clock size={16} /> Pendiente de Verificación por el Cajero
                    </div>
                  )}
                  {ordenActiva.estado === 'APROBADO' && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-xs">
                      <CheckCircle size={16} /> ¡Pago Aprobado! Preparando tu Delivery
                    </div>
                  )}
                  {ordenActiva.estado === 'RECHAZADO' && (
                    <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold text-xs">
                      <XCircle size={16} /> Pago Rechazado. Por favor contacta a soporte.
                    </div>
                  )}
                </div>

                <div className="text-left bg-gray-50 p-3 rounded-lg text-xs space-y-1 text-gray-600 border border-gray-100">
                  <p><span className="font-semibold text-gray-800">Cliente:</span> {ordenActiva.cliente_nombre}</p>
                  <p><span className="font-semibold text-gray-800">Referencia:</span> {ordenActiva.numero_referencia}</p>
                  <p><span className="font-semibold text-gray-800">Monto:</span> {ordenActiva.monto_bs} Bs. (${ordenActiva.monto_usd})</p>
                </div>
              </div>

              <UbicacionCliente ordenId={ordenActiva.id} />
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;