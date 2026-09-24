import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { io } from "socket.io-client";
import { Edit2, Search, X, Plus, Check, Trash2, Lock, Unlock, Camera } from "lucide-react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "./services/product.service";
import { getStoreState, updateStoreState } from "./services/storeState.service";
import { uploadImage } from "./services/upload.service";
import "./AdminMenu.css";

// Nombre de la categoría especial: los productos de esta categoría son ADICIONALES.
// Solo el admin los ve como tarjetas; la app de clientes debe ocultarlos del menú.
const CATEGORIA_ADICIONALES = "Adicionales";
const CATEGORIAS = ["Comidas", "Bebidas", "Snacks", CATEGORIA_ADICIONALES] as const;
type Categoria = typeof CATEGORIAS[number];

interface Producto {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  available: boolean;
  // Ids (como texto) de los productos de categoría "Adicionales", ej. ["12", "15"]
  addons: string[];
}

// Quita acentos y mayúsculas para comparar textos ("café" = "cafe", "Leche" = "leche")
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Busca el adicional (producto de categoría "Adicionales") que corresponde a un id guardado
function buscarAddon(valor: string, adicionales: Producto[]) {
  return adicionales.find((a) => String(a.id) === valor);
}

// Texto que se muestra en pantalla para un valor guardado en producto.addons:
// - Si es el id de un adicional existente: "Nombre (+$precio)"
// - Si es un número que ya no corresponde a ningún adicional: fue eliminado
// - Si es texto normal: es un adicional viejo (de antes de esta categoría), se muestra tal cual
function etiquetaAddon(valor: string, adicionales: Producto[]) {
  const addon = buscarAddon(valor, adicionales);
  if (addon) return `${addon.name} (+$${addon.price})`;
  return /^\d+$/.test(valor) ? "Adicional eliminado" : valor;
}

// ¿Es un id que apunta a un adicional que ya no existe? (para pintarlo en rojo)
function esHuerfano(valor: string, adicionales: Producto[]) {
  return /^\d+$/.test(valor) && !buscarAddon(valor, adicionales);
}

interface AddonSelectorProps {
  value: string[];                   // ids de adicionales que ya tiene este producto
  onChange: (ids: string[]) => void; // devuelve la lista nueva completa de ids
  adicionales: Producto[];           // todos los productos de categoría "Adicionales"
}

// Selector de adicionales reutilizable (lo usan "Nuevo producto" y "Editar producto").
// Solo permite elegir adicionales que ya existen: para crear uno nuevo se usa la
// categoría "Adicionales" (así cada adicional tiene un único precio).
function AddonSelector({ value, onChange, adicionales }: AddonSelectorProps) {
  // En el dropdown solo mostramos los que este producto todavía no tiene
  const disponibles = adicionales.filter((a) => !value.includes(String(a.id)));

  // Agrega el id elegido a la lista del producto
  function agregar(id: string) {
    if (!id || value.includes(id)) return;
    onChange([...value, id]);
  }

  // Quita un adicional de la lista por su posición
  function quitar(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="field field-full">
      <label>Adicionales (opcional)</label>

      {adicionales.length === 0 ? (
        // Todavía no se ha creado ningún adicional
        <p className="addon-empty-hint">
          Aún no hay adicionales. Crea uno en la categoría "{CATEGORIA_ADICIONALES}".
        </p>
      ) : (
        // value="" para que después de elegir siempre vuelva a "Selecciona..."
        <select value="" onChange={(e) => agregar(e.target.value)}>
          <option value="">
            {disponibles.length > 0 ? "Selecciona un adicional..." : "Ya agregaste todos los adicionales"}
          </option>
          {disponibles.map((a) => (
            <option key={a.id} value={String(a.id)}>
              {etiquetaAddon(String(a.id), adicionales)}
              {a.available ? "" : " — agotado"}
            </option>
          ))}
        </select>
      )}

      {/* Adicionales elegidos para este producto, con botón para quitarlos */}
      {value.length > 0 && (
        <div className="addon-tags">
          {value.map((valor, i) => (
            <span
              key={valor}
              className={`addon-tag addon-tag-removable ${esHuerfano(valor, adicionales) ? "addon-tag-missing" : ""}`}
            >
              {etiquetaAddon(valor, adicionales)}
              <button type="button" onClick={() => quitar(i)} aria-label={`Quitar ${etiquetaAddon(valor, adicionales)}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  producto: Producto;
  adicionales: Producto[]; // productos de categoría "Adicionales" (para mostrar y elegir)
  onGuardarEdicion: (id: number, data: Partial<{ name: string; description: string; category: string; price: number; image_url: string; available: boolean; addons: string[] }>) => void;
  onEliminar: (id: number) => void;
  guardando: boolean;
  eliminando: boolean;
}

// Tarjeta individual de producto: muestra vista normal; al editar, abre un pop-up igual al de "Nuevo producto"
function ProductCard({ producto, adicionales, onGuardarEdicion, onEliminar, guardando, eliminando }: ProductCardProps) {
  const [editando, setEditando] = useState(false);
  const [editError, setEditError] = useState("");
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Copia local editable del producto (no se toca el original hasta guardar)
  const [form, setForm] = useState({
    name: producto.name,
    description: producto.description,
    category: producto.category,
    price: String(producto.price),
    image_url: producto.image_url,
    addons: producto.addons ?? [] as string[],
  });

  // ¿Esta tarjeta es un adicional? Los adicionales no llevan foto ni descripción
  const esAdicionalCard = producto.category === CATEGORIA_ADICIONALES;

  // ¿El formulario de edición está editando un adicional? (cambia si el usuario cambia la categoría)
  const formEsAdicional = form.category === CATEGORIA_ADICIONALES;

  // Bloquear el scroll de fondo (incluyendo la rueda del mouse) mientras el pop-up está abierto
  useEffect(() => {
    if (editando) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [editando]);

  // Cambiar disponibilidad (Disponible / Agotado) — se guarda de inmediato, sin pasar por "Guardar"
  function handleCambiarDisponibilidad(nuevoValor: boolean) {
    onGuardarEdicion(producto.id, { available: nuevoValor });
  }

  // Subida de imagen: toma el archivo elegido (cámara o galería), lo sube al bucket
  // y guarda la URL pública resultante en el formulario
  async function handleArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendoImagen(true);
    setEditError("");
    try {
      const { publicUrl } = await uploadImage(archivo);
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
    } catch {
      setEditError("No se pudo subir la imagen. Intenta de nuevo o pega una URL manual.");
    } finally {
      setSubiendoImagen(false);
      e.target.value = "";
    }
  }

  // Validar y guardar cambios del producto editado
  function handleGuardar() {
    const precioNumero = Number(form.price);
    if (!form.name.trim() || !form.category.trim() || isNaN(precioNumero)) {
      setEditError("El nombre, la categoría y el precio (numérico) son obligatorios.");
      return;
    }

    onGuardarEdicion(producto.id, {
      name: form.name.trim(),
      // Un adicional se guarda sin descripción ni imagen (texto vacío, porque la BD no admite nulos)
      description: formEsAdicional ? "" : form.description.trim(),
      category: form.category.trim(),
      price: precioNumero,
      image_url: formEsAdicional ? "" : form.image_url.trim(),
      // Un adicional no lleva adicionales
      addons: formEsAdicional ? [] : form.addons,
    });
    setEditError("");
    setEditando(false);
  }

  // Descartar cambios, cerrar el pop-up y volver el formulario a los valores originales
  function handleCancelar() {
    setForm({
      name: producto.name,
      description: producto.description,
      category: producto.category,
      price: String(producto.price),
      image_url: producto.image_url,
      addons: producto.addons ?? [],
    });
    setEditError("");
    setEditando(false);
  }

  return (
    <>
      <div className="ticket">
        {/* Los adicionales no muestran foto ni descripción */}
        {!esAdicionalCard && (
          <img src={producto.image_url} alt={producto.name} className="ticket-image" />
        )}
        <div className="ticket-body">
          <span className="ticket-category">{producto.category}</span>
          <h3>{producto.name}</h3>
          {!esAdicionalCard && <p className="ticket-desc">{producto.description}</p>}
          <p className="ticket-price">${producto.price}</p>

          {/* Adicionales del producto: se muestra nombre y precio de cada uno */}
          {producto.addons && producto.addons.length > 0 && (
            <div className="addon-tags">
              {producto.addons.map((valor) => (
                <span
                  key={valor}
                  className={`addon-tag ${esHuerfano(valor, adicionales) ? "addon-tag-missing" : ""}`}
                >
                  {etiquetaAddon(valor, adicionales)}
                </span>
              ))}
            </div>
          )}

          {/* Toggle de disponibilidad */}
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

          {/* Botones Editar / Eliminar (con confirmación antes de borrar) */}
          <div className="ticket-footer">
            {confirmarBorrado ? (
              <>
                <button
                  className="btn btn-danger"
                  onClick={() => onEliminar(producto.id)}
                  disabled={eliminando}
                >
                  <Trash2 size={14} />
                  {eliminando ? "Eliminando..." : "Confirmar"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmarBorrado(false)}
                  disabled={eliminando}
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => setEditando(true)}>
                  <Edit2 size={14} />
                  Editar
                </button>
                <button
                  className="btn btn-danger-outline"
                  onClick={() => setConfirmarBorrado(true)}
                  aria-label={`Eliminar ${producto.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up de editar producto: mismo estilo que el de "Nuevo producto" */}
      {editando && (
        <div className="modal-backdrop" onClick={handleCancelar}>
          <div className="ticket-panel modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2>{formEsAdicional ? "Editar adicional" : "Editar producto"}</h2>
            <div className="field-grid">
              <div className="field field-full">
                <label>Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre"
                />
              </div>

              {/* Descripción: no aplica a adicionales */}
              {!formEsAdicional && (
                <div className="field field-full">
                  <label>Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descripción"
                  />
                </div>
              )}

              <div className="field">
                <label>Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    const categoria = e.target.value;
                    // Un adicional no puede tener adicionales: si pasa a esa categoría se limpia la lista
                    setForm({
                      ...form,
                      category: categoria,
                      addons: categoria === CATEGORIA_ADICIONALES ? [] : form.addons,
                    });
                  }}
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

              {/* Adicionales: solo para productos normales (un adicional no lleva adicionales) */}
              {!formEsAdicional && (
                <AddonSelector
                  value={form.addons}
                  onChange={(addons) => setForm((prev) => ({ ...prev, addons }))}
                  adicionales={adicionales}
                />
              )}

              {/* Imagen: no aplica a adicionales. Vista previa + botón de cámara/galería + URL manual */}
              {!formEsAdicional && (
                <div className="field field-full">
                  <label>Imagen</label>
                  {form.image_url && (
                    <img src={form.image_url} alt="Vista previa" className="image-preview" />
                  )}
                  <label className="file-upload-btn">
                    <Camera size={14} />
                    {subiendoImagen ? "Subiendo..." : "Tomar foto o subir imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArchivoSeleccionado}
                      disabled={subiendoImagen}
                      hidden
                    />
                  </label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="O pega una URL de imagen"
                  />
                </div>
              )}
            </div>

            {editError && <p className="form-error">{editError}</p>}

            <div className="panel-actions">
              <button type="button" className="btn btn-secondary" onClick={handleCancelar} disabled={guardando}>
                <X size={14} />
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando || subiendoImagen}>
                <Check size={14} />
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminMenu() {
  const queryClient = useQueryClient();

  // Estado de búsqueda, filtro de categoría y formulario de nuevo producto
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmarDescartar, setConfirmarDescartar] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [subiendoImagenNueva, setSubiendoImagenNueva] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    image_url: "",
    addons: [] as string[],
  });

  // Obtención de datos: lista de productos desde el backend (incluye los adicionales)
  const {
    data: productos = [],
    isLoading,
    isError,
  } = useQuery<Producto[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Obtención de datos: estado actual de la cafetería (abierta/cerrada)
  const { data: storeState } = useQuery<{ isOpen: boolean }>({
    queryKey: ["storeState"],
    queryFn: getStoreState,
  });

  const cafeteriaAbierta = storeState?.isOpen ?? true;

  // Adicionales: los productos de categoría "Adicionales", ordenados por nombre.
  // Se recalcula solo cuando cambian los productos (incluso por los eventos de socket).
  const adicionales = useMemo(
    () =>
      productos
        .filter((p) => p.category === CATEGORIA_ADICIONALES)
        .sort((a, b) => normalizar(a.name).localeCompare(normalizar(b.name))),
    [productos]
  );

  // Bloquear el scroll de fondo (incluyendo la rueda del mouse) mientras el pop-up está abierto
  useEffect(() => {
    if (mostrarForm) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [mostrarForm]);

  // Conexión en tiempo real: si otro dispositivo abre/cierra la cafetería, o crea/edita/borra un producto, se refleja aquí solo
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
    const socket = io(socketUrl);

    socket.on("storeState:updated", (data: { isOpen: boolean }) => {
      queryClient.setQueryData(["storeState"], data);
    });

    socket.on("product:created", (nuevoProducto: Producto) => {
      queryClient.setQueryData<Producto[]>(["products"], (actual = []) => {
        if (actual.some((p) => p.id === nuevoProducto.id)) return actual;
        return [...actual, nuevoProducto];
      });
    });

    socket.on("product:updated", (productoActualizado: Producto) => {
      queryClient.setQueryData<Producto[]>(["products"], (actual = []) =>
        actual.map((p) => (p.id === productoActualizado.id ? productoActualizado : p))
      );
    });

    socket.on("product:deleted", (data: { id: number }) => {
      queryClient.setQueryData<Producto[]>(["products"], (actual = []) =>
        actual.filter((p) => p.id !== data.id)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // Apertura/cierre de la cafetería
  const storeStateMutation = useMutation({
    mutationFn: (isOpen: boolean) => updateStoreState({ isOpen }),
    onSuccess: (data) => {
      queryClient.setQueryData(["storeState"], data);
    },
    onError: () => {
      alert("No se pudo cambiar el estado de la cafetería. Intenta de nuevo.");
    },
  });

  // Si está abierta y le dan a "Cerrar", primero pide confirmación
  function handleToggleCafeteria() {
    if (cafeteriaAbierta) {
      setConfirmarCierre(true);
      return;
    }
    storeStateMutation.mutate(true);
  }

  function confirmarYCerrar() {
    storeStateMutation.mutate(false);
    setConfirmarCierre(false);
  }

  // Subida de imagen para el formulario de producto nuevo
  async function handleArchivoNuevoProducto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendoImagenNueva(true);
    setFormError("");
    try {
      const { publicUrl } = await uploadImage(archivo);
      setNuevoProducto((prev) => ({ ...prev, image_url: publicUrl }));
    } catch {
      setFormError("No se pudo subir la imagen. Intenta de nuevo o pega una URL manual.");
    } finally {
      setSubiendoImagenNueva(false);
      e.target.value = "";
    }
  }

  // ¿Hay texto escrito en algún campo del formulario de nuevo producto?
  function hayContenidoSinGuardar() {
    const { addons, ...resto } = nuevoProducto;
    return Object.values(resto).some((valor) => valor.trim() !== "") || addons.length > 0;
  }

  // Al intentar cerrar (clic afuera o botón Cancelar): si hay texto, pide confirmación primero
  function solicitarCerrarModal() {
    if (hayContenidoSinGuardar()) {
      setConfirmarDescartar(true);
      return;
    }
    cerrarModalDefinitivo();
  }

  // Cierra de verdad el pop-up y resetea todo
  function cerrarModalDefinitivo() {
    setMostrarForm(false);
    setFormError("");
    setConfirmarDescartar(false);
    setNuevoProducto({ name: "", description: "", category: "", price: "", image_url: "", addons: [] });
  }

  // Crear producto (o adicional, si la categoría elegida es "Adicionales")
  const crearMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      cerrarModalDefinitivo();
    },
    onError: () => {
      setFormError("Ocurrió un error al crear el producto. Intenta de nuevo.");
    },
  });

  // Editar producto existente
  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; description: string; category: string; price: number; image_url: string; available: boolean; addons: string[] }> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      alert("Ocurrió un error al actualizar el producto. Intenta de nuevo.");
    },
  });

  // Eliminar producto
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      alert("Ocurrió un error al eliminar el producto. Intenta de nuevo.");
    },
  });

  function handleGuardarEdicion(id: number, data: Partial<{ name: string; description: string; category: string; price: number; image_url: string; available: boolean; addons: string[] }>) {
    editarMutation.mutate({ id, data });
  }

  // Eliminar: si lo que se borra es un adicional, primero se quita su id de todos los
  // productos que lo usan, para no dejar referencias a un adicional que ya no existe
  async function handleEliminar(id: number) {
    const objetivo = productos.find((p) => p.id === id);

    if (objetivo?.category === CATEGORIA_ADICIONALES) {
      const idTexto = String(id);
      const afectados = productos.filter((p) => (p.addons ?? []).includes(idTexto));
      try {
        await Promise.all(
          afectados.map((p) => updateProduct(p.id, { addons: p.addons.filter((a) => a !== idTexto) }))
        );
      } catch {
        alert("No se pudo quitar el adicional de los productos que lo usan. Intenta de nuevo.");
        return;
      }
    }

    eliminarMutation.mutate(id);
  }

  // Filtrado + orden alfabético: se ordena por nombre para que la posición de cada
  // tarjeta sea siempre la misma, sin importar si cambia su disponibilidad.
  // "Todas" NO incluye los adicionales: esos se ven solo en el chip "Adicionales".
  const productosFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return productos
      .filter((p) => {
        const coincideTexto = !q || normalizar(p.name).includes(q);
        const coincideCategoria =
          categoriaFiltro === "Todas"
            ? p.category !== CATEGORIA_ADICIONALES
            : p.category === categoriaFiltro;
        return coincideTexto && coincideCategoria;
      })
      .sort((a, b) => normalizar(a.name).localeCompare(normalizar(b.name)));
  }, [busqueda, categoriaFiltro, productos]);

  // Rellenar información de producto nuevo y enviarlo a crear
  function handleCrearProducto(e: React.FormEvent) {
    e.preventDefault();

    const nombreLimpio = nuevoProducto.name.trim();
    const categoriaLimpia = nuevoProducto.category.trim();
    const precioNumero = Number(nuevoProducto.price);

    if (!nombreLimpio || !categoriaLimpia || !nuevoProducto.price.trim() || isNaN(precioNumero)) {
      setFormError("El nombre, la categoría y el precio (numérico) son obligatorios.");
      return;
    }

    // Un adicional se guarda sin descripción ni imagen (texto vacío, porque la BD no admite nulos).
    // Se fuerza aquí por si el usuario escribió algo antes de cambiar la categoría a "Adicionales".
    const esAdicional = categoriaLimpia === CATEGORIA_ADICIONALES;

    setFormError("");
    crearMutation.mutate({
      name: nombreLimpio,
      description: esAdicional ? "" : nuevoProducto.description.trim(),
      category: categoriaLimpia,
      price: precioNumero,
      image_url: esAdicional
        ? ""
        : nuevoProducto.image_url.trim() || "https://via.placeholder.com/220x150?text=Sin+imagen",
      addons: esAdicional ? [] : nuevoProducto.addons,
    });
  }

  // ¿El formulario de "Nuevo" está creando un adicional?
  const creandoAdicional = nuevoProducto.category === CATEGORIA_ADICIONALES;

  return (
    <div className="menu-admin">
      <div className="menu-admin__inner">

        {/* Barra de estado: abrir/cerrar la cafetería */}
        <div className={`shop-status-bar ${cafeteriaAbierta ? "is-open" : "is-closed"}`}>
          <div className="shop-status-text">
            <span className="shop-status-dot" />
            {cafeteriaAbierta
              ? "Cafetería abierta — se pueden hacer pedidos"
              : "Cafetería cerrada — no se pueden hacer pedidos"}
          </div>

          {confirmarCierre ? (
            <div className="shop-status-confirm">
              <span>¿Cerrar la cafetería ahora?</span>
              <button className="btn btn-danger" onClick={confirmarYCerrar} disabled={storeStateMutation.isPending}>
                Sí, cerrar
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirmarCierre(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button
              className={`btn ${cafeteriaAbierta ? "btn-danger-outline" : "btn-primary"}`}
              onClick={handleToggleCafeteria}
              disabled={storeStateMutation.isPending}
            >
              {cafeteriaAbierta ? <Lock size={14} /> : <Unlock size={14} />}
              {storeStateMutation.isPending
                ? "Actualizando..."
                : cafeteriaAbierta
                ? "Cerrar cafetería"
                : "Abrir cafetería"}
            </button>
          )}
        </div>

        {/* Encabezado */}
        <div className="menu-header">
          <div>
            <h1>Menú del día</h1>
            <p>Gestiona lo que se vende hoy en la cafetería</p>
          </div>

          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            <Plus size={16} />
            Nuevo producto
          </button>
        </div>

        {/* Pop-up de "Nuevo producto": fondo oscuro + formulario centrado */}
        {mostrarForm && (
          <div className="modal-backdrop" onClick={solicitarCerrarModal}>
            <form className="ticket-panel modal-panel" onSubmit={handleCrearProducto} onClick={(e) => e.stopPropagation()}>
              <h2>{creandoAdicional ? "Nuevo adicional" : "Nuevo producto"}</h2>

              {confirmarDescartar && (
                <div className="discard-warning">
                  <span>Tienes cambios sin guardar. ¿Cerrar de todas formas?</span>
                  <div className="discard-warning-actions">
                    <button type="button" className="btn btn-danger" onClick={cerrarModalDefinitivo}>
                      Sí, descartar
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setConfirmarDescartar(false)}>
                      Seguir editando
                    </button>
                  </div>
                </div>
              )}

              <div className="field-grid">
                <div className="field field-full">
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder={creandoAdicional ? "Ej. Leche de almendras" : "Ej. Chilaquilitos"}
                    value={nuevoProducto.name}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, name: e.target.value })}
                  />
                </div>

                {/* Descripción: no aplica a adicionales */}
                {!creandoAdicional && (
                  <div className="field field-full">
                    <label>Descripción</label>
                    <textarea
                      placeholder="Ej. Chilaquiles en salsa roja"
                      value={nuevoProducto.description}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, description: e.target.value })}
                    />
                  </div>
                )}

                <div className="field">
                  <label>Categoría</label>
                  <select
                    value={nuevoProducto.category}
                    onChange={(e) => {
                      const categoria = e.target.value;
                      // Un adicional no puede tener adicionales: si se elige esa categoría se limpia la lista
                      setNuevoProducto({
                        ...nuevoProducto,
                        category: categoria,
                        addons: categoria === CATEGORIA_ADICIONALES ? [] : nuevoProducto.addons,
                      });
                    }}
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

                {/* Adicionales: solo para productos normales (un adicional no lleva adicionales) */}
                {!creandoAdicional && (
                  <AddonSelector
                    value={nuevoProducto.addons}
                    onChange={(addons) => setNuevoProducto((prev) => ({ ...prev, addons }))}
                    adicionales={adicionales}
                  />
                )}

                {/* Imagen del producto nuevo: no aplica a adicionales */}
                {!creandoAdicional && (
                  <div className="field field-full">
                    <label>Imagen</label>
                    {nuevoProducto.image_url && (
                      <img src={nuevoProducto.image_url} alt="Vista previa" className="image-preview" />
                    )}
                    <label className="file-upload-btn">
                      <Camera size={14} />
                      {subiendoImagenNueva ? "Subiendo..." : "Tomar foto o subir imagen"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleArchivoNuevoProducto}
                        disabled={subiendoImagenNueva}
                        hidden
                      />
                    </label>
                    <input
                      type="text"
                      value={nuevoProducto.image_url}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, image_url: e.target.value })}
                      placeholder="O pega una URL de imagen"
                    />
                  </div>
                )}
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="panel-actions">
                <button type="button" className="btn btn-secondary" onClick={solicitarCerrarModal}>
                  <X size={14} />
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={crearMutation.isPending || subiendoImagenNueva}>
                  {crearMutation.isPending ? "Guardando..." : creandoAdicional ? "Guardar adicional" : "Guardar producto"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Búsqueda + filtro de categoría (el chip "Adicionales" sale solo, viene de CATEGORIAS) */}
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

        {/* Lista de productos (o estado de carga / error / vacío) */}
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
                adicionales={adicionales}
                onGuardarEdicion={handleGuardarEdicion}
                onEliminar={handleEliminar}
                guardando={editarMutation.isPending && editarMutation.variables?.id === prod.id}
                eliminando={eliminarMutation.isPending && eliminarMutation.variables === prod.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}