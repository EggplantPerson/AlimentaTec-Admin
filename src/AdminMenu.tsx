import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Edit2, Search, X, Plus, Check } from "lucide-react";
import { getProducts, createProduct, updateProduct } from "./services/product.service";

const CATEGORIAS = ["Comidas", "Bebidas", "Snacks"] as const;
type Categoria = typeof CATEGORIAS[number]; 

interface Producto {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  available: boolean;
}

interface ProductCardProps {
  producto: Producto;
  onGuardarEdicion: (id: number, data: Partial<{ name: string; description: string; category: string; price: number; image_url: string; available: boolean }>) => void;
  guardando: boolean;
}

function ProductCard({ producto, onGuardarEdicion, guardando }: ProductCardProps) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    name: producto.name,
    description: producto.description,
    category: producto.category,
    price: String(producto.price),
    image_url: producto.image_url,
  });

  function handleCambiarDisponibilidad(nuevoValor: boolean) {
    onGuardarEdicion(producto.id, { available: nuevoValor });
  }

  function handleGuardar() {
    const precioNumero = Number(form.price);
    if (!form.name.trim() || !form.category.trim() || isNaN(precioNumero)) {
      alert("El nombre, la categoría y el precio (numérico) son obligatorios.");
      return;
    }

    onGuardarEdicion(producto.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: precioNumero,
      image_url: form.image_url.trim(),
    });
    setEditando(false);
  }

  function handleCancelar() {
    setForm({
      name: producto.name,
      description: producto.description,
      category: producto.category,
      price: String(producto.price),
      image_url: producto.image_url,
    });
    setEditando(false);
  }

  if (editando) {
    return (
      <div style={{ border: "1px solid #333", borderRadius: "8px", padding: "16px", width: "220px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          style={{ padding: "6px", border: "1px solid #ccc", borderRadius: "6px" }}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descripción"
          style={{ padding: "6px", border: "1px solid #ccc", borderRadius: "6px", resize: "vertical", minHeight: "60px" }}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ padding: "6px", border: "1px solid #ccc", borderRadius: "6px" }}
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Precio"
          style={{ padding: "6px", border: "1px solid #ccc", borderRadius: "6px" }}
        />
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="URL de imagen"
          style={{ padding: "6px", border: "1px solid #ccc", borderRadius: "6px" }}
        />

        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "6px", border: "none", borderRadius: "6px", background: "#333", color: "#fff", cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.6 : 1 }}
          >
            <Check size={14} />
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={handleCancelar}
            disabled={guardando}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "6px", border: "1px solid #ccc", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
          >
            <X size={14} />
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", width: "220px", display: "flex", flexDirection: "column" }}>
      <img
        src={producto.image_url}
        alt={producto.name}
        style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px" }}
      />
      <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "6px" }}>
        {producto.category}
      </span>
      <h3 style={{ margin: "4px 0" }}>{producto.name}</h3>
      <p style={{ flexGrow: 1 }}>{producto.description}</p>
      <p><strong>${producto.price}</strong></p>

      <div>
        <label>
          <input
            type="radio"
            checked={producto.available}
            onChange={() => handleCambiarDisponibilidad(true)}
            disabled={guardando}
          />
          Disponible
        </label>

        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            checked={!producto.available}
            onChange={() => handleCambiarDisponibilidad(false)}
            disabled={guardando}
          />
          Agotado
        </label>
      </div>

      <p>Estado: {producto.available ? "Disponible" : "Agotado"}</p>

      <button
        onClick={() => setEditando(true)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "6px", border: "1px solid #333", borderRadius: "6px", background: "#fff", cursor: "pointer", marginTop: "8px" }}
      >
        <Edit2 size={14} />
        Editar
      </button>
    </div>
  );
}

export default function AdminMenu() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    image_url: ""
  });

  const {
    data: productos = [],
    isLoading,
    isError,
  } = useQuery<Producto[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const crearMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setNuevoProducto({ name: "", description: "", category: "", price: "", image_url: "" });
      setMostrarForm(false);
    },
    onError: () => {
      alert("Ocurrió un error al crear el producto. Intenta de nuevo.");
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; description: string; category: string; price: number; image_url: string; available: boolean }> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      alert("Ocurrió un error al actualizar el producto. Intenta de nuevo.");
    },
  });

  function handleGuardarEdicion(id: number, data: Partial<{ name: string; description: string; category: string; price: number; image_url: string; available: boolean }>) {
    editarMutation.mutate({ id, data });
  }

  const normalizar = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const productosFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return productos;
    return productos.filter((p) => normalizar(p.name).includes(q));
  }, [busqueda, productos]);

  function handleCrearProducto(e: React.FormEvent) {
    e.preventDefault();

    const nombreLimpio = nuevoProducto.name.trim();
    const categoriaLimpia = nuevoProducto.category.trim();
    const precioNumero = Number(nuevoProducto.price);

    if (!nombreLimpio || !categoriaLimpia || !nuevoProducto.price.trim() || isNaN(precioNumero)) {
      alert("El nombre, la categoría y el precio (numérico) son obligatorios.");
      return;
    }

    crearMutation.mutate({
      name: nombreLimpio,
      description: nuevoProducto.description.trim(),
      category: categoriaLimpia,
      price: precioNumero,
      image_url: nuevoProducto.image_url.trim() || "https://via.placeholder.com/220x150?text=Sin+imagen",
    });
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ color: "#333", margin: 0 }}>Administración de Menú</h1>

        <button
          onClick={() => setMostrarForm((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            border: "1px solid #333",
            borderRadius: "6px",
            background: mostrarForm ? "#333" : "#fff",
            color: mostrarForm ? "#fff" : "#333",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          {mostrarForm ? "Cancelar" : "Crear producto"}
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleCrearProducto}
          style={{
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
          }}
        >
          <input
            type="text"
            placeholder="Nombre*"
            value={nuevoProducto.name}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, name: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <textarea
            placeholder="Descripción"
            value={nuevoProducto.description}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, description: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px", resize: "vertical" }}
          />
          <select
            value={nuevoProducto.category}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, category: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          >
            <option value="">Selecciona una categoría*</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
             ))}
          </select>
          <input
            type="number"
            placeholder="Precio* (ej. 45)"
            value={nuevoProducto.price}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, price: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <input
            type="text"
            placeholder="URL de imagen"
            value={nuevoProducto.image_url}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, image_url: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <button
            type="submit"
            disabled={crearMutation.isPending}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              background: "#333",
              color: "#fff",
              cursor: crearMutation.isPending ? "not-allowed" : "pointer",
              opacity: crearMutation.isPending ? 0.6 : 1,
            }}
          >
            {crearMutation.isPending ? "Guardando..." : "Guardar producto"}
          </button>
        </form>
      )}

      <div style={{ position: "relative", maxWidth: "360px", margin: "0 auto 30px auto" }}>
        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          style={{
            width: "100%",
            padding: "10px 36px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            aria-label="Limpiar búsqueda"
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Cargando productos...</p>
      ) : isError ? (
        <p style={{ textAlign: "center", color: "red" }}>No se pudieron cargar los productos.</p>
      ) : productosFiltrados.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No se encontraron productos que coincidan con "{busqueda}".
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
          {productosFiltrados.map((prod) => (
            <ProductCard
              key={prod.id}
              producto={prod}
              onGuardarEdicion={handleGuardarEdicion}
              guardando={editarMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}