import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Eye, EyeOff, Trash2, X } from "lucide-react";
import { getOrders, updateOrder, deleteOrder } from "./services/order.service";
import { getProducts } from "./services/product.service";
import "./AdminPedidos.css";

// Forma de un pedido tal como viene de la base de datos
interface Order {
  uid: string;
  id: number;
  products: string[];
  total: number;
  orderTime: string;
  status: string;
  notes?: string | null;
}

interface Producto {
  id: number;
  name: string;
}

// Lista de estados en orden. El pedido solo avanza, nunca retrocede.
// Verificar si hay estado de cancelacion
const ESTADOS = ["En espera", "En preparacion", "Completado", "Entregado"];
const OCULTOS_KEY = "pedidos_ocultos_manual";

function estadoIndex(status: string) {
  const i = ESTADOS.indexOf(status);
  return i === -1 ? 0 : i;
}

// Ocultar manualmente: guarda/lee la lista de pedidos ocultos en el navegador (no en la DB)
function cargarOcultosManual(): Set<string> {
  try {
    const guardado = localStorage.getItem(OCULTOS_KEY);
    return guardado ? new Set(JSON.parse(guardado)) : new Set();
  } catch {
    return new Set();
  }
}

function guardarOcultosManual(set: Set<string>) {
  try {
    localStorage.setItem(OCULTOS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // si localStorage falla (modo privado, etc.), simplemente no persiste
  }
}

// Convertir ids de producto a nombres: agrupa repetidos y los convierte a { nombre, cantidad }
function resolverItems(productIds: string[], nombresPorId: Record<number, string>) {
  const conteo = new Map<string, number>();
  productIds.forEach((pid) => conteo.set(pid, (conteo.get(pid) ?? 0) + 1));

  return Array.from(conteo.entries()).map(([pid, cantidad]) => ({
    id: pid,
    nombre: nombresPorId[Number(pid)] ?? `Producto #${pid}`,
    cantidad,
  }));
}

interface OrderCardProps {
  order: Order;
  nombresPorId: Record<number, string>;
  onAvanzar: (uid: string, siguienteEstado: string) => void;
  onOcultar: (uid: string) => void;
  onEliminar: (uid: string) => void;
  guardando: boolean;
  eliminando: boolean;
}

// Tarjeta de un pedido individual
function OrderCard({ order, nombresPorId, onAvanzar, onOcultar, onEliminar, guardando, eliminando }: OrderCardProps) {
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const indice = estadoIndex(order.status);
  const esUltimoEstado = indice === ESTADOS.length - 1;
  const items = resolverItems(order.products ?? [], nombresPorId);

  // Avanzar al siguiente estado (En espera -> En preparación -> Completado -> Entregado)
  function avanzarEstado() {
    if (indice < ESTADOS.length - 1) {
      onAvanzar(order.uid, ESTADOS[indice + 1]!);
    }
  }

  return (
    <div className="pedido-ticket">
      <div className="pedido-top-row">
        <span className="pedido-num">Pedido #{order.id}</span>
        <button
          className="pedido-hide-btn"
          onClick={() => onOcultar(order.uid)}
          aria-label={`Ocultar pedido ${order.id}`}
          title="Ocultar este pedido"
        >
          <EyeOff size={14} />
        </button>
      </div>

      {/* Lista de productos del pedido, con cantidad si se repite */}
      <ul className="pedido-items">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.nombre}</span>
            {item.cantidad > 1 && <span className="pedido-item-qty">×{item.cantidad}</span>}
          </li>
        ))}
      </ul>

      {/* Nota del pedido (ej. "sin queso", instrucciones especiales) */}
      {order.notes && (
        <p className="pedido-notas">
          <strong>Nota:</strong> {order.notes}
        </p>
      )}

      <p className="pedido-total">${order.total}</p>

      <span className={`pedido-badge estado-${indice}`}>{ESTADOS[indice]}</span>

      <div className="pedido-track" aria-hidden="true">
        {ESTADOS.map((_, i) => (
          <span key={i} className={`paso ${i <= indice ? "completo" : ""}`} />
        ))}
      </div>

      <div className="pedido-actions">
        <button className="pedido-btn" onClick={avanzarEstado} disabled={esUltimoEstado || guardando}>
          {esUltimoEstado ? "Pedido finalizado" : guardando ? "Actualizando..." : "Siguiente estado"}
        </button>

        {/* Eliminar solo aparece una vez que el pedido ya fue entregado */}
        {esUltimoEstado && (
          confirmarBorrado ? (
            <div className="pedido-confirm-delete">
              <span>¿Eliminar este pedido?</span>
              <button className="pedido-btn-delete" onClick={() => onEliminar(order.uid)} disabled={eliminando}>
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button className="pedido-btn-cancel" onClick={() => setConfirmarBorrado(false)} disabled={eliminando}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button className="pedido-btn-delete" onClick={() => setConfirmarBorrado(true)}>
              <Trash2 size={14} />
              Eliminar pedido
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function AdminPedidos() {
  const queryClient = useQueryClient();
  const [mostrarEntregados, setMostrarEntregados] = useState(false);
  const [ocultosManual, setOcultosManual] = useState<Set<string>>(cargarOcultosManual);

  // Obtención de datos: lista de pedidos
  const {
    data: pedidos = [],
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  // Obtención de datos: catálogo de productos (para mostrar nombres en vez de ids)
  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const nombresPorId: Record<number, string> = {};
  productos.forEach((p) => {
    nombresPorId[p.id] = p.name;
  });

  // Conexión en tiempo real: escucha pedidos nuevos y actualizados desde el backend
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
    const socket = io(socketUrl);

    socket.on("order:created", (nuevoPedido: Order) => {
      queryClient.setQueryData<Order[]>(["orders"], (actual = []) => [nuevoPedido, ...actual]);
    });

    socket.on("order:updated", (pedidoActualizado: Order) => {
      queryClient.setQueryData<Order[]>(["orders"], (actual = []) =>
        actual.map((o) => (o.uid === pedidoActualizado.uid ? pedidoActualizado : o))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // Actualizar el estado de un pedido en la base de datos
  const actualizarMutation = useMutation({
    mutationFn: ({ uid, status }: { uid: string; status: string }) =>
      updateOrder(uid, { status }),
    // El evento "order:updated" del socket actualiza la caché al confirmar el backend.
  });

  function handleAvanzar(uid: string, siguienteEstado: string) {
    actualizarMutation.mutate({ uid, status: siguienteEstado });
  }

  // Eliminar un pedido de la base de datos (solo pedidos ya entregados)
  const eliminarMutation = useMutation({
    mutationFn: (uid: string) => deleteOrder(uid),
    onSuccess: (_, uid) => {
      queryClient.setQueryData<Order[]>(["orders"], (actual = []) => actual.filter((o) => o.uid !== uid));
    },
    onError: () => {
      alert("No se pudo eliminar el pedido. Intenta de nuevo.");
    },
  });

  function handleEliminarPedido(uid: string) {
    eliminarMutation.mutate(uid);
  }

  // Ocultar manualmente un pedido puntual (solo en este navegador, no borra nada)
  function handleOcultar(uid: string) {
    setOcultosManual((prev) => {
      const nuevo = new Set(prev);
      nuevo.add(uid);
      guardarOcultosManual(nuevo);
      return nuevo;
    });
  }

  function handleMostrarOcultos() {
    setOcultosManual(() => {
      const vacio = new Set<string>();
      guardarOcultosManual(vacio);
      return vacio;
    });
  }

  // Pedidos a mostrar: ordenados por más reciente primero, sin los ocultos ni (por defecto) los entregados
  const pedidosVisibles = [...pedidos]
    .sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime())
    .filter((o) => {
      if (ocultosManual.has(o.uid)) return false;
      const esEntregado = estadoIndex(o.status) === ESTADOS.length - 1;
      if (esEntregado && !mostrarEntregados) return false;
      return true;
    });

  const totalOcultosManual = pedidos.filter((o) => ocultosManual.has(o.uid)).length;

  return (
    <div className="pedidos-admin">
      <div className="pedidos-admin__inner">
        <div className="pedidos-header">
          <div>
            <h1>Pedidos</h1>
            <p>Sigue el estado de las órdenes que llegan desde la app</p>
          </div>

          <div className="pedidos-controls">
            <button
              className={`pedido-chip ${mostrarEntregados ? "is-active" : ""}`}
              onClick={() => setMostrarEntregados((prev) => !prev)}
            >
              {mostrarEntregados ? <EyeOff size={13} /> : <Eye size={13} />}
              {mostrarEntregados ? "Ocultar entregados" : "Ver entregados"}
            </button>

            {totalOcultosManual > 0 && (
              <button className="pedido-link-btn" onClick={handleMostrarOcultos}>
                Mostrar {totalOcultosManual} oculto{totalOcultosManual > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>

        {/* Rellenar información de pedidos: lista de tarjetas, o mensaje de carga/error/vacío */}
        {isLoading ? (
          <p className="pedidos-status">Cargando pedidos...</p>
        ) : isError ? (
          <p className="pedidos-status is-error">No se pudieron cargar los pedidos.</p>
        ) : pedidosVisibles.length === 0 ? (
          <p className="pedidos-status">No hay pedidos por mostrar.</p>
        ) : (
          <div className="pedidos-grid">
            {pedidosVisibles.map((order) => (
              <OrderCard
                key={order.uid}
                order={order}
                nombresPorId={nombresPorId}
                onAvanzar={handleAvanzar}
                onOcultar={handleOcultar}
                onEliminar={handleEliminarPedido}
                guardando={
                  actualizarMutation.isPending &&
                  actualizarMutation.variables?.uid === order.uid
                }
                eliminando={
                  eliminarMutation.isPending &&
                  eliminarMutation.variables === order.uid
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}