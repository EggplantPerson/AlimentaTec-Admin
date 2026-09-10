import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Edit2, Search, X, Plus, Check } from "lucide-react";
import { getProducts, createProduct, updateProduct } from "./services/product.service";
function ProductCard({ producto, onGuardarEdicion, guardando }) {
    const [disponible, setDisponible] = useState(true);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({
        name: producto.name,
        description: producto.description,
        price: String(producto.price),
        image_url: producto.image_url,
    });
    function handleGuardar() {
        const precioNumero = Number(form.price);
        if (!form.name.trim() || isNaN(precioNumero)) {
            alert("El nombre y el precio son obligatorios.");
            return;
        }
        onGuardarEdicion(producto.id, {
            name: form.name.trim(),
            description: form.description.trim(),
            price: precioNumero,
            image_url: form.image_url.trim(),
        });
        setEditando(false);
    }
    function handleCancelar() {
        setForm({
            name: producto.name,
            description: producto.description,
            price: String(producto.price),
            image_url: producto.image_url,
        });
        setEditando(false);
    }
    if (editando) {
        return (_jsxs("div", { style: { border: "1px solid #333", borderRadius: "8px", padding: "16px", width: "220px", display: "flex", flexDirection: "column", gap: "8px" }, children: [_jsx("input", { type: "text", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), placeholder: "Nombre", style: { padding: "6px", border: "1px solid #ccc", borderRadius: "6px" } }), _jsx("textarea", { value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), placeholder: "Descripci\u00F3n", style: { padding: "6px", border: "1px solid #ccc", borderRadius: "6px", resize: "vertical", minHeight: "60px" } }), _jsx("input", { type: "number", value: form.price, onChange: (e) => setForm({ ...form, price: e.target.value }), placeholder: "Precio", style: { padding: "6px", border: "1px solid #ccc", borderRadius: "6px" } }), _jsx("input", { type: "text", value: form.image_url, onChange: (e) => setForm({ ...form, image_url: e.target.value }), placeholder: "URL de imagen", style: { padding: "6px", border: "1px solid #ccc", borderRadius: "6px" } }), _jsxs("div", { style: { display: "flex", gap: "8px", marginTop: "4px" }, children: [_jsxs("button", { onClick: handleGuardar, disabled: guardando, style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "6px", border: "none", borderRadius: "6px", background: "#333", color: "#fff", cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.6 : 1 }, children: [_jsx(Check, { size: 14 }), guardando ? "Guardando..." : "Guardar"] }), _jsxs("button", { onClick: handleCancelar, disabled: guardando, style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "6px", border: "1px solid #ccc", borderRadius: "6px", background: "#fff", cursor: "pointer" }, children: [_jsx(X, { size: 14 }), "Cancelar"] })] })] }));
    }
    return (_jsxs("div", { style: { border: "1px solid #ccc", borderRadius: "8px", padding: "16px", width: "220px", display: "flex", flexDirection: "column" }, children: [_jsx("img", { src: producto.image_url, alt: producto.name, style: { width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px" } }), _jsx("h3", { children: producto.name }), _jsx("p", { style: { flexGrow: 1 }, children: producto.description }), _jsx("p", { children: _jsxs("strong", { children: ["$", producto.price] }) }), _jsxs("div", { children: [_jsxs("label", { children: [_jsx("input", { type: "radio", checked: disponible, onChange: () => setDisponible(true) }), "Disponible"] }), _jsxs("label", { style: { marginLeft: "10px" }, children: [_jsx("input", { type: "radio", checked: !disponible, onChange: () => setDisponible(false) }), "Agotado"] })] }), _jsxs("p", { children: ["Estado: ", disponible ? "Disponible" : "Agotado"] }), _jsxs("button", { onClick: () => setEditando(true), style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "6px", border: "1px solid #333", borderRadius: "6px", background: "#fff", cursor: "pointer", marginTop: "8px" }, children: [_jsx(Edit2, { size: 14 }), "Editar"] })] }));
}
export default function AdminMenu() {
    const queryClient = useQueryClient();
    const [busqueda, setBusqueda] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        name: "",
        description: "",
        price: "",
        image_url: ""
    });
    const { data: productos = [], isLoading, isError, } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    const crearMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setNuevoProducto({ name: "", description: "", price: "", image_url: "" });
            setMostrarForm(false);
        },
        onError: () => {
            alert("Error al crear el producto. Intente nuevamente.");
        },
    });
    const editarMutation = useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => {
            alert("Ocurrió un error al editar el producto. Intenta de nuevo.");
        },
    });
    function handleGuardarEdicion(id, data) {
        editarMutation.mutate({ id, data });
    }
    const normalizar = (texto) => texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // quita acentos/diacríticos
    const productosFiltrados = useMemo(() => {
        const q = normalizar(busqueda.trim());
        if (!q)
            return productos;
        return productos.filter((p) => normalizar(p.name).includes(q));
    }, [busqueda, productos]);
    //Función para crear un producto nuevo
    function handleCrearProducto(e) {
        e.preventDefault();
        const nombreLimpio = nuevoProducto.name.trim();
        const precioNumero = Number(nuevoProducto.price);
        if (!nombreLimpio || !nuevoProducto.price.trim() || isNaN(precioNumero)) {
            alert("El nombre y el precio son obligatorios.");
            return;
        }
        crearMutation.mutate({
            name: nombreLimpio,
            description: nuevoProducto.description.trim(),
            price: precioNumero,
            image_url: nuevoProducto.image_url.trim() || "https://via.placeholder.com/220x150?text=Sin+imagen",
        });
    }
    return (_jsxs("div", { style: { padding: "20px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }, children: [_jsx("h1", { style: { color: "#333", margin: 0 }, children: "Administraci\u00F3n de Men\u00FA" }), _jsxs("button", { onClick: () => setMostrarForm((prev) => !prev), style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 12px",
                            border: "1px solid #333",
                            borderRadius: "6px",
                            background: mostrarForm ? "#333" : "#fff",
                            color: mostrarForm ? "#fff" : "#333",
                            cursor: "pointer",
                        }, children: [_jsx(Plus, { size: 16 }), mostrarForm ? "Cancelar" : "Crear producto"] })] }), mostrarForm && (_jsxs("form", { onSubmit: handleCrearProducto, style: {
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "24px",
                    maxWidth: "400px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }, children: [_jsx("input", { type: "text", placeholder: "Nombre*", value: nuevoProducto.name, onChange: (e) => setNuevoProducto({ ...nuevoProducto, name: e.target.value }), style: { padding: "8px", border: "1px solid #ccc", borderRadius: "6px" } }), _jsx("textarea", { placeholder: "Descripci\u00F3n", value: nuevoProducto.description, onChange: (e) => setNuevoProducto({ ...nuevoProducto, description: e.target.value }), style: { padding: "8px", border: "1px solid #ccc", borderRadius: "6px", resize: "vertical" } }), _jsx("input", { type: "number", placeholder: "Precio* (ej. 45)", value: nuevoProducto.price, onChange: (e) => setNuevoProducto({ ...nuevoProducto, price: e.target.value }), style: { padding: "8px", border: "1px solid #ccc", borderRadius: "6px" } }), _jsx("input", { type: "text", placeholder: "URL de imagen", value: nuevoProducto.image_url, onChange: (e) => setNuevoProducto({ ...nuevoProducto, image_url: e.target.value }), style: { padding: "8px", border: "1px solid #ccc", borderRadius: "6px" } }), _jsx("button", { type: "submit", disabled: crearMutation.isPending, style: {
                            padding: "10px",
                            border: "none",
                            borderRadius: "6px",
                            background: "#333",
                            color: "#fff",
                            cursor: crearMutation.isPending ? "not-allowed" : "pointer",
                            opacity: crearMutation.isPending ? 0.6 : 1,
                        }, children: crearMutation.isPending ? "Guardando..." : "Guardar producto" })] })), _jsxs("div", { style: { position: "relative", maxWidth: "360px", margin: "0 auto 30px auto" }, children: [_jsx(Search, { size: 18, style: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" } }), _jsx("input", { type: "text", value: busqueda, onChange: (e) => setBusqueda(e.target.value), placeholder: "Buscar producto...", style: {
                            width: "100%",
                            padding: "10px 36px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                        } }), busqueda && (_jsx("button", { onClick: () => setBusqueda(""), "aria-label": "Limpiar b\u00FAsqueda", style: { position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center" }, children: _jsx(X, { size: 16 }) }))] }), isLoading ? (_jsx("p", { style: { textAlign: "center", color: "#888" }, children: "Cargando productos..." })) : isError ? (_jsx("p", { style: { textAlign: "center", color: "red" }, children: "No se pudieron cargar los productos." })) : productosFiltrados.length === 0 ? (_jsxs("p", { style: { textAlign: "center", color: "#888" }, children: ["No se encontraron productos que coincidan con \"", busqueda, "\"."] })) : (_jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }, children: productosFiltrados.map((prod) => (_jsx(ProductCard, { producto: prod, onGuardarEdicion: handleGuardarEdicion, guardando: editarMutation.isPending }, prod.id))) }))] }));
}
//# sourceMappingURL=AdminMenu.js.map