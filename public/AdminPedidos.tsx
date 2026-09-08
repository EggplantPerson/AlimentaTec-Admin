import { useState } from "react";

interface ProductProps {
  N0: string;
  nombre: string;
  descripcion: string;
}

// Lista de estados en orden. El pedido solo avanza, nunca retrocede.
const ESTADOS = ["En espera", "En preparacion", "Completado", "Entregado"];

function ProductCard({ N0, nombre, descripcion }: ProductProps) {
  // Guardamos solo el índice del estado actual dentro de ESTADOS
  const [indice, setIndice] = useState(0);

  // Avanza al siguiente estado, si ya no hay más, no hace nada
  const avanzarEstado = () => {
    if (indice < ESTADOS.length - 1) {
      setIndice(indice + 1);
    }
  };

  const esUltimoEstado = indice === ESTADOS.length - 1;

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", width: "220px" }}>
      <p style={{ fontSize: "12px", color: "#666", margin: "0 0 8px 0" }}>
        Pedido #: {N0}
      </p>
      <h3 style={{ marginTop: 0 }}>{nombre}</h3>
      <p>{descripcion}</p>

      <p style={{ marginBottom: "8px" }}><strong>Estado:</strong> {ESTADOS[indice]}</p>

      {/* Botón deshabilitado cuando ya se llegó al último estado */}
      <button
        onClick={avanzarEstado}
        disabled={esUltimoEstado}
        style={{
          padding: "8px 12px",
          border: "1px solid #333",
          borderRadius: "6px",
          background: esUltimoEstado ? "#eee" : "#fff",
          cursor: esUltimoEstado ? "not-allowed" : "pointer",
        }}
      >
        {esUltimoEstado ? "Pedido finalizado" : "Siguiente estado"}
      </button>
    </div>
  );
}

const productos = [
  { id: 1, N0: "123", nombre: "Sándwich", descripcion: "Sándwich sin queso" },
  { id: 2, N0: "456", nombre: "Hamburguesa", descripcion: "Hamburguesa de res sin lechuga" },
  { id: 3, N0: "789", nombre: "Pizza de peperoni", descripcion: "Pizza de peperoni con todo" },
  { id: 4, N0: "101", nombre: "Croissant de jamón con queso", descripcion: "Croissant sin queso" },
];

export default function AdminPedidos() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        Administración de pedidos
      </h1>

      {productos.map((prod) => (
        <ProductCard
          key={prod.id}
          N0={prod.N0}
          nombre={prod.nombre}
          descripcion={prod.descripcion}
        />
      ))}
    </div>
  );
}