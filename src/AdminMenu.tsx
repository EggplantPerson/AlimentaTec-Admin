import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Edit2, Search, X, Plus, Check } from "lucide-react";
import { getProducts, createProduct, updateProduct } from "./services/product.service";
import "./AdminMenu.css";

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
  const [editError, setEditError] = useState("");
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
      setEditError("El nombre, la categoría y el precio (numérico) son obligatorios.");
      return;
    }

    onGuardarEdicion(producto.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: precioNumero,
      image_url: form.image_url.trim(),
    });
    setEditError("");
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
    setEditError("");
    setEditando(false);
  }

  if (editando) {
    return (
      <div className="ticket">
        <div className="ticket-edit">
          <div className="field">
            <label>Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre"
            />
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción"
            />
          </div>
          <div className="field">
            <label>Categoría</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Precio</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Precio"
            />
          </div>
          <div className="field">
            <label>URL de imagen</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="URL de imagen"
            />
          </div>

          {editError && <p className="form-error">{editError}</p>}

          <div className="edit-actions">
            <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
              <Check size={14} />
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button className="btn btn-secondary" onClick={handleCancelar} disabled={guardando}>
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket">
      <img src={producto.image_url} alt={producto.name} className="ticket-image" />
      <div className="ticket-body">
        <span className="ticket-category">{producto.category}</span>
        <h3>{producto.name}</h3>
        <p className="ticket-desc">{producto.description}</p>
        <p className="ticket-price">${producto.price}</p>

        <div className="avail-toggle" role="group" aria-label={`Disponibilidad de ${producto.name}`}>
          <button
            type="button"
            className={`is-available ${producto.available ? "is-active" : ""}`}
            aria-pressed={producto.available}
            onClick={() => handleCambiarDisponibilidad(true)}
            disabled={guardando}
          >
            Disponible
          </button>
          <button
            type="button"
            className={`is-out ${!producto.available ? "is-active" : ""}`}
            aria-pressed={!producto.available}
            onClick={() => handleCambiarDisponibilidad(false)}
            disabled={guardando}
          >
            Agotado
          </button>
        </div>

        <div className="ticket-footer">
          <button className="btn btn-secondary" onClick={() => setEditando(true)}>
            <Edit2 size={14} />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMenu() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formError, setFormError] = useState("");
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
      setFormError("");
      setMostrarForm(false);
    },
    onError: () => {
      setFormError("Ocurrió un error al crear el producto. Intenta de nuevo.");
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
    return productos.filter((p) => {
      const coincideTexto = !q || normalizar(p.name).includes(q);
      const coincideCategoria = categoriaFiltro === "Todas" || p.category === categoriaFiltro;
      return coincideTexto && coincideCategoria;
    });
  }, [busqueda, categoriaFiltro, productos]);

  function handleCrearProducto(e: React.FormEvent) {
    e.preventDefault();

    const nombreLimpio = nuevoProducto.name.trim();
    const categoriaLimpia = nuevoProducto.category.trim();
    const precioNumero = Number(nuevoProducto.price);

    if (!nombreLimpio || !categoriaLimpia || !nuevoProducto.price.trim() || isNaN(precioNumero)) {
      setFormError("El nombre, la categoría y el precio (numérico) son obligatorios.");
      return;
    }

    setFormError("");
    crearMutation.mutate({
      name: nombreLimpio,
      description: nuevoProducto.description.trim(),
      category: categoriaLimpia,
      price: precioNumero,
      image_url: nuevoProducto.image_url.trim() || "https://via.placeholder.com/220x150?text=Sin+imagen",
    });
  }

  return (
    <div className="menu-admin">
      <div className="menu-admin__inner">
        <div className="menu-header">
          <div>
            <h1>Menú del día</h1>
            <p>Gestiona lo que se vende hoy en la cafetería</p>
          </div>

          <button
            className={`btn btn-primary ${mostrarForm ? "is-open" : ""}`}
            onClick={() => {
              setMostrarForm((prev) => !prev);
              setFormError("");
            }}
          >
            <Plus size={16} />
            {mostrarForm ? "Cancelar" : "Nuevo producto"}
          </button>
        </div>

        {mostrarForm && (
          <form className="ticket-panel" onSubmit={handleCrearProducto}>
            <h2>Nuevo producto</h2>
            <div className="field-grid">
              <div className="field field-full">
                <label>Nombre</label>
                <input
                  type="text"
                  placeholder="Ej. Chilaquilitos"
                  value={nuevoProducto.name}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, name: e.target.value })}
                />
              </div>
              <div className="field field-full">
                <label>Descripción</label>
                <textarea
                  placeholder="Ej. Chilaquiles en salsa roja"
                  value={nuevoProducto.description}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, description: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Categoría</label>
                <select
                  value={nuevoProducto.category}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, category: e.target.value })}
                >
                  <option value="">Selecciona...</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Precio</label>
                <input
                  type="number"
                  placeholder="Ej. 45"
                  value={nuevoProducto.price}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, price: e.target.value })}
                />
              </div>
              <div className="field field-full">
                <label>URL de imagen</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={nuevoProducto.image_url}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, image_url: e.target.value })}
                />
              </div>
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <div className="panel-actions">
              <button type="submit" className="btn btn-primary" disabled={crearMutation.isPending}>
                {crearMutation.isPending ? "Guardando..." : "Guardar producto"}
              </button>
            </div>
          </form>
        )}

        <div className="filters-row">
          <div className="search-box">
            <Search size={16} className="icon-search" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
            />
            {busqueda && (
              <button className="icon-clear" onClick={() => setBusqueda("")} aria-label="Limpiar búsqueda">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="chip-row">
            <button
              className={`chip ${categoriaFiltro === "Todas" ? "is-active" : ""}`}
              onClick={() => setCategoriaFiltro("Todas")}
            >
              Todas
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                className={`chip ${categoriaFiltro === cat ? "is-active" : ""}`}
                onClick={() => setCategoriaFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="status-text">Cargando productos...</p>
        ) : isError ? (
          <p className="status-text is-error">No se pudieron cargar los productos.</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="status-text">
            No se encontraron productos{busqueda ? ` que coincidan con "${busqueda}"` : ""}.
          </p>
        ) : (
          <div className="product-grid">
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
    </div>
  );
}
