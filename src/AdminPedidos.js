import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
// Lista de estados en orden. El pedido solo avanza, nunca retrocede.
const ESTADOS = ["En espera", "En preparacion", "Completado", "Entregado"];
function ProductCard({ N0, nombre, descripcion }) {
    // Guardamos solo el índice del estado actual dentro de ESTADOS
    const [indice, setIndice] = useState(0);
    // Avanza al siguiente estado, si ya no hay más, no hace nada
    const avanzarEstado = () => {
        if (indice < ESTADOS.length - 1) {
            setIndice(indice + 1);
        }
    };
    const esUltimoEstado = indice === ESTADOS.length - 1;
    return (_jsxs("div", { style: { border: "1px solid #ccc", borderRadius: "8px", padding: "16px", width: "220px" }, children: [_jsxs("p", { style: { fontSize: "12px", color: "#666", margin: "0 0 8px 0" }, children: ["Pedido #: ", N0] }), _jsx("h3", { style: { marginTop: 0 }, children: nombre }), _jsx("p", { children: descripcion }), _jsxs("p", { style: { marginBottom: "8px" }, children: [_jsx("strong", { children: "Estado:" }), " ", ESTADOS[indice]] }), _jsx("button", { onClick: avanzarEstado, disabled: esUltimoEstado, style: {
                    padding: "8px 12px",
                    border: "1px solid #333",
                    borderRadius: "6px",
                    background: esUltimoEstado ? "#eee" : "#fff",
                    cursor: esUltimoEstado ? "not-allowed" : "pointer",
                }, children: esUltimoEstado ? "Pedido finalizado" : "Siguiente estado" })] }));
}
const productos = [
    { id: 1, N0: "123", nombre: "Sándwich", descripcion: "Sándwich sin queso" },
    { id: 2, N0: "456", nombre: "Hamburguesa", descripcion: "Hamburguesa de res sin lechuga" },
    { id: 3, N0: "789", nombre: "Pizza de peperoni", descripcion: "Pizza de peperoni con todo" },
    { id: 4, N0: "101", nombre: "Croissant de jamón con queso", descripcion: "Croissant sin queso" },
];
export default function AdminPedidos() {
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "20px", padding: "20px", fontFamily: "sans-serif" }, children: [_jsx("h1", { style: { textAlign: "center", marginBottom: "30px", color: "#333" }, children: "Administraci\u00F3n de pedidos" }), productos.map((prod) => (_jsx(ProductCard, { N0: prod.N0, nombre: prod.nombre, descripcion: prod.descripcion }, prod.id)))] }));
}
//# sourceMappingURL=AdminPedidos.js.map