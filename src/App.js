import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import AdminPedidos from "./AdminPedidos";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
        }
    }
});
export default function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(Router, { children: _jsxs("div", { style: { fontFamily: "sans-serif" }, children: [_jsxs("nav", { style: { padding: "15px", backgroundColor: "#f4f4f4", textAlign: "center", marginBottom: "20px" }, children: [_jsx(Link, { to: "/", style: { margin: "0 15px", textDecoration: "none", color: "#333", fontWeight: "bold" }, children: "Men\u00FA" }), _jsx(Link, { to: "/pedidos", style: { margin: "0 15px", textDecoration: "none", color: "#333", fontWeight: "bold" }, children: "Pedidos" })] }), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(AdminMenu, {}) }), _jsx(Route, { path: "/pedidos", element: _jsx(AdminPedidos, {}) })] })] }) }) }));
}
//# sourceMappingURL=App.js.map