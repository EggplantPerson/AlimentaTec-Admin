import { useState, useMemo } from "react";
import { Edit2, Search, X, Plus } from "lucide-react";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
}

interface ProductProps {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
}

function ProductCard({ nombre, descripcion, precio, imagen }: ProductProps) {
  const [disponible, setDisponible] = useState<boolean>(true);

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", width: "220px", display: "flex", flexDirection: "column" }}>
      <img
        src={imagen}
        alt={nombre}
        style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px" }}
      />
      <h3>{nombre}</h3>
      <p style={{ flexGrow: 1 }}>{descripcion}</p>
      <p><strong>{precio}</strong></p>

      <div>
        <label>
          <input type="radio" checked={disponible} onChange={() => setDisponible(true)} />
          Disponible
        </label>

        <label style={{ marginLeft: "10px" }}>
          <input type="radio" checked={!disponible} onChange={() => setDisponible(false)} />
          Agotado
        </label>
      </div>

      <p>Estado: {disponible ? "Disponible" : "Agotado"}</p>
    </div>
  );
}

const productosIniciales: Producto[] = [
  {
    id: 1,
    nombre: "Sándwich",
    descripcion: "Delicioso sándwich de pavo y queso con vegetales frescos.",
    precio: "$199.00",
    imagen: "https://foodtrucksworld.com/wp-content/uploads/2024/01/Sandwiches-1024x683.jpg"
  },
  {
    id: 2,
    nombre: "Hamburguesa",
    descripcion: "Clásica hamburguesa de res con queso cheddar, lechuga y tomate.",
    precio: "$250.00",
    imagen: "https://www.cnature.es/wp-content/uploads/2021/12/hamburguesa-con-guacamole.jpg"
  },
  {
    id: 3,
    nombre: "Pizza",
    descripcion: "Rica pizza de peperoni.",
    precio: "$299.00",
    imagen: "https://media.mdzol.com/p/810cccf2a4e7c1b9cb529665e5bffeae/adjuntos/373/imagenes/001/035/0001035468/1200x675/smart/el-secreto-una-pizza-pepperoni-perfecta-foto-shutterstock.png"
  },
  {
    id: 4,
    nombre: "Croissant",
    descripcion: "Rico croissant de jamon y queso.",
    precio: "$160.00",
    imagen: "https://tse2.mm.bing.net/th/id/OIP.IdcHgYHrrqxo_Zji13VifQHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
  }
];

export default function AdminMenu() {
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: ""
  });

  const normalizar = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita acentos/diacríticos

  const productosFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return productos;
    return productos.filter((p) => normalizar(p.nombre).includes(q));
  }, [busqueda, productos]);

  // 👇 Función para crear un producto nuevo
  function handleCrearProducto(e: React.FormEvent) {
    e.preventDefault();

    if (!nuevoProducto.nombre.trim() || !nuevoProducto.precio.trim()) {
      alert("El nombre y el precio son obligatorios.");
      return;
    }

    const producto: Producto = {
      id: Date.now(), // id simple y único basado en timestamp
      nombre: nuevoProducto.nombre.trim(),
      descripcion: nuevoProducto.descripcion.trim(),
      precio: nuevoProducto.precio.trim(),
      imagen: nuevoProducto.imagen.trim() || "https://via.placeholder.com/220x150?text=Sin+imagen"
    };

    setProductos((prev) => [...prev, producto]);

    // Reiniciar el formulario
    setNuevoProducto({ nombre: "", descripcion: "", precio: "", imagen: "" });
    setMostrarForm(false);
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Encabezado con título y botones */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ color: "#333", margin: 0 }}>Administración de Menú</h1>

        <div style={{ display: "flex", gap: "10px" }}>
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

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              border: "1px solid #333",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <Edit2 size={16} />
            Editar
          </button>
        </div>
      </div>

      {/* Formulario para crear producto */}
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
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <textarea
            placeholder="Descripción"
            value={nuevoProducto.descripcion}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px", resize: "vertical" }}
          />
          <input
            type="text"
            placeholder="Precio* (ej. $199.00)"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <input
            type="text"
            placeholder="URL de imagen"
            value={nuevoProducto.imagen}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              background: "#333",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Guardar producto
          </button>
        </form>
      )}

      {/* Barra de búsqueda */}
      <div
        style={{
          position: "relative",
          maxWidth: "360px",
          margin: "0 auto 30px auto",
        }}
      >
        <Search
          size={18}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#888",
          }}
        />
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
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No se encontraron productos que coincidan con "{busqueda}".
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
          {productosFiltrados.map((prod) => (
            <ProductCard
              key={prod.id}
              nombre={prod.nombre}
              descripcion={prod.descripcion}
              precio={prod.precio}
              imagen={prod.imagen}
            />
          ))}
        </div>
      )}
    </div>
  );
}