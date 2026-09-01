import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";

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

const productos = [
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
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Encabezado con título y botón de editar (único, arriba de todo) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#333", margin: 0 }}>Administración de Menú</h1>

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
          <FiEdit2 />
          Editar
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        {productos.map((prod) => (
          <ProductCard
            key={prod.id}
            nombre={prod.nombre}
            descripcion={prod.descripcion}
            precio={prod.precio}
            imagen={prod.imagen}
          />
        ))}
      </div>
    </div>
  );
}