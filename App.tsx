import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import AdminPedidos from "./AdminPedidos";

export default function App() {
  return (
    <Router>
      <div style={{ fontFamily: "sans-serif" }}>
        <nav style={{ padding: "15px", backgroundColor: "#f4f4f4", textAlign: "center", marginBottom: "20px" }}>
          <Link to="/" style={{ margin: "0 15px", textDecoration: "none", color: "#333", fontWeight: "bold" }}>
            Menú
          </Link>
          <Link to="/pedidos" style={{ margin: "0 15px", textDecoration: "none", color: "#333", fontWeight: "bold" }}>
            Pedidos
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route path="/pedidos" element={<AdminPedidos />} />
        </Routes>
      </div>
    </Router>
  );
}