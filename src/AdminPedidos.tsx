import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getOrders, updateOrder } from "./services/order.service";
import { getProducts } from "./services/product.service";
import "./AdminPedidos.css";

interface Order {
  uid: string;
  id: number;
  products: string[];
  total: number;
  orderTime: string;
  status: string;
  notes?: string
}

interface Producto {
  id: number;
  name: string;
}

// Lista de estados en orden. El pedido solo avanza, nunca retrocede.
// Verificar si hay estado de cancelacion
const ESTADOS = ["En espera", "En preparacion", "Completado", "Entregado"];

function estadoIndex(status: string) {
  const i = ESTADOS.indexOf(status);
  return i === -1 ? 0 : i;
}

// Agrupa los ids repetidos del arreglo products y los convierte a { nombre, cantidad }
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
  guardando: boolean;
}

function OrderCard({ order, nombresPorId, onAvanzar, guardando }: OrderCardProps) {
  const indice = estadoIndex(order.status);
  const esUltimoEstado = indice === ESTADOS.length - 1;
  const items = resolverItems(order.products ?? [], nombresPorId);

  function avanzarEstado() {
    if (indice < ESTADOS.length - 1) {
      onAvanzar(order.uid, ESTADOS[indice + 1]!);
    }
  }

  return (
    <div className="pedido-ticket">
      <span className="pedido-num">Pedido #{order.id}</span>

      <ul className="pedido-items">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.nombre}</span>
            {item.cantidad > 1 && <span className="pedido-item-qty">×{item.cantidad}</span>}
          </li>
        ))}
      </ul>

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
      </div>
    </div>
  );
}

export default function AdminPedidos() {
  const queryClient = useQueryClient();

  const {
    data: pedidos = [],
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const nombresPorId: Record<number, string> = {};
  productos.forEach((p) => {
    nombresPorId[p.id] = p.name;
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ uid, status }: { uid: string; status: string }) =>
      updateOrder(uid, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  function handleAvanzar(uid: string, siguienteEstado: string) {
    actualizarMutation.mutate({ uid, status: siguienteEstado });
  }

  return (
    <div className="pedidos-admin">
      <div className="pedidos-admin__inner">
        <div className="pedidos-header">
          <h1>Pedidos</h1>
          <p>Sigue el estado de las órdenes que llegan desde la app</p>
        </div>

        {isLoading ? (
          <p className="pedidos-status">Cargando pedidos...</p>
        ) : isError ? (
          <p className="pedidos-status is-error">No se pudieron cargar los pedidos.</p>
        ) : pedidos.length === 0 ? (
          <p className="pedidos-status">No hay pedidos por ahora.</p>
        ) : (
          <div className="pedidos-grid">
            {pedidos.map((order) => (
              <OrderCard
                key={order.uid}
                order={order}
                nombresPorId={nombresPorId}
                onAvanzar={handleAvanzar}
                guardando={
                  actualizarMutation.isPending &&
                  actualizarMutation.variables?.uid === order.uid
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}