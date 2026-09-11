import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getOrders, updateOrder} from "./services/order.service";
import "./AdminPedidos.css";

interface Order {
  uid: string;
  id: number;
  products: string[];
  total: number;
  orderTime: string;
  status: string;
}

// Lista de estados en orden. El pedido solo avanza, nunca retrocede.
// Verificar si hay estado de cancelacion
const ESTADOS = ["En espera", "En preparacion", "Completado", "Entregado"];

function estadoIndex(status: string) {
  const i = ESTADOS.indexOf(status);
  return i === -1 ? 0 : i;
}

interface OrderCardProps {
  order: Order;
  onAvanzar: (uid: string, siguienteEstado: string) => void;
  guardando: boolean;
}

function OrderCard({ order, onAvanzar, guardando }: OrderCardProps) {
  const indice = estadoIndex(order.status);
  const esUltimoEstado = indice === ESTADOS.length - 1;

  function avanzarEstado() {
    if (indice < ESTADOS.length - 1) {
      onAvanzar(order.uid, ESTADOS[indice + 1]!);
    }
  }

  return (
    <div className="pedido-ticket">
      <span className="pedido-num">Pedido #{order.id}</span>

      <ul className="pedido-items">
        {(order.products ?? []).map((item, i) => (
          <li key={i}>{item}</li>
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

  const actualizarMutation = useMutation({
    mutationFn: ({ uid, status}: { uid: string; status: string }) =>
      updateOrder(uid, {status}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  function handleAvanzar(uid: string, siguienteEstado: string){
    actualizarMutation.mutate({uid, status: siguienteEstado});
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