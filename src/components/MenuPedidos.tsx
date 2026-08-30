import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

// Tipos definidos directamente para evitar errores de módulos en Vite
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioUsd: number;
  categoria: 'hamburguesas' | 'perros' | 'bebidas' | 'combos';
  imagenUrl: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface MenuPedidosProps {
  tasaBcv: number;
  onContinuarCheckout: (montoUsd: number, items: ItemCarrito[]) => void;
}

// Menú de ejemplo
const PRODUCTOS_EJEMPLO: Producto[] = [
  {
    id: '1',
    nombre: 'Hamburguesa Doble Carne con Queso',
    descripcion: 'Doble carne de res, queso cheddar, tocineta, lechuga, tomate y salsa especial.',
    precioUsd: 6.50,
    categoria: 'hamburguesas',
    imagenUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    nombre: 'Perro Caliente Especial',
    descripcion: 'Salchicha de pavo, cebolla picadita, papitas, queso rallado y salsas.',
    precioUsd: 2.50,
    categoria: 'perros',
    imagenUrl: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    nombre: 'Combo FastFood Familiar',
    descripcion: '2 Hamburguesas sencillas, 2 Perros calientes, ración de papas y refresco 1.5L.',
    precioUsd: 14.00,
    categoria: 'combos',
    imagenUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    nombre: 'Refresco 500ml',
    descripcion: 'Coca-Cola, Pepsi o Chinotto bien frío.',
    precioUsd: 1.50,
    categoria: 'bebidas',
    imagenUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
  },
];

export const MenuPedidos: React.FC<MenuPedidosProps> = ({ tasaBcv, onContinuarCheckout }) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [categoriaSel, setCategoriaSel] = useState<string>('todos');

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const modificarCantidad = (id: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === id) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemCarrito[]
    );
  };

  const totalUsd = carrito.reduce((acc, item) => acc + item.producto.precioUsd * item.cantidad, 0);
  const totalBs = (totalUsd * tasaBcv).toFixed(2);

  const productosFiltrados = categoriaSel === 'todos'
    ? PRODUCTOS_EJEMPLO
    : PRODUCTOS_EJEMPLO.filter((p) => p.categoria === categoriaSel);

  return (
    <div className="max-w-4xl mx-auto my-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Menú de Productos */}
      <div className="md:col-span-2 space-y-4">
        {/* Filtros de Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
          {['todos', 'hamburguesas', 'perros', 'combos', 'bebidas'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap border cursor-pointer transition-all ${
                categoriaSel === cat
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lista de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col justify-between">
              <img src={prod.imagenUrl} alt={prod.nombre} className="h-32 w-full object-cover" />
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{prod.nombre}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{prod.descripcion}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div>
                    <p className="font-bold text-amber-600 text-sm">${prod.precioUsd.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400">{(prod.precioUsd * tasaBcv).toFixed(2)} Bs.</p>
                  </div>
                  <button
                    onClick={() => agregarAlCarrito(prod)}
                    className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen del Carrito */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 h-fit sticky top-4">
        <div className="flex items-center gap-2 border-b pb-3 mb-3">
          <ShoppingCart className="text-amber-500" size={20} />
          <h2 className="font-bold text-gray-800">Tu Pedido</h2>
        </div>

        {carrito.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">Tu carrito está vacío.<br />¡Elige algo delicioso!</p>
        ) : (
          <div className="space-y-3">
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {carrito.map((item) => (
                <div key={item.producto.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-gray-700">{item.producto.nombre}</p>
                    <p className="text-gray-400">${(item.producto.precioUsd * item.cantidad).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => modificarCantidad(item.producto.id, -1)}
                      className="p-1 hover:bg-white rounded text-gray-600 cursor-pointer"
                    >
                      {item.cantidad === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                    </button>
                    <span className="font-bold px-1.5 text-gray-700">{item.cantidad}</span>
                    <button
                      onClick={() => modificarCantidad(item.producto.id, 1)}
                      className="p-1 hover:bg-white rounded text-gray-600 cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal USD:</span>
                <span className="font-semibold">${totalUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tasa BCV:</span>
                <span>{tasaBcv} Bs.</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-amber-900 pt-1 border-t border-amber-200">
                <span>TOTAL BS:</span>
                <span>{totalBs} Bs.</span>
              </div>
            </div>

            <button
              onClick={() => onContinuarCheckout(totalUsd, carrito)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Ir a Pagar <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};