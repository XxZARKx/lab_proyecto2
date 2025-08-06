import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/shared/PrivateRoute";
import AdminRoute from "./components/shared/AdminRoute";

// Páginas públicas
import LoginPage from "./pages/Auth/LoginPage";

// Páginas compartidas por todos los roles autenticados
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProfilePage from "./pages/User/ProfilePage";
import TicketListPage from "./pages/Tickets/TicketsListPage";
import NuevoTicketPage from "./pages/Tickets/NuevoTicketPage";

// Dashboards por rol
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import DashboardTecnico from "./pages/Dashboard/DashboardTecnico";
import UsuarioDashboard from "./pages/Dashboard/UsuarioDashboard";

// Funcionalidades del técnico
import TicketsAsignados from "./pages/Tecnico/TicketsAsignados";
import ActualizarEstado from "./pages/Tecnico/ActualizarEstado";

// Funcionalidades exclusivas del admin
import RegisterPage from "./pages/Auth/RegisterPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";

// Funcionalidades extra del usuario
import TicketsPendientes from "./pages/Tickets/TicketsPendientes";
import HistorialUsuario from "./pages/Tickets/HistorialUsuario";
import AsignarTicketPage from "./pages/Admin/AsignarTicketPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 🌐 Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* 🔐 Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            {/* 📌 Rutas accesibles por cualquier usuario autenticado */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tickets" element={<TicketListPage />} />

            {/* 🧑 Dashboard Usuario */}
            <Route path="/usuario" element={<UsuarioDashboard />} />
            <Route
              path="/usuario/tickets/nuevo"
              element={<NuevoTicketPage />}
            />
            <Route path="/usuario/tickets" element={<TicketsPendientes />} />
            <Route path="/usuario/historial" element={<HistorialUsuario />} />

            {/* 🧑‍🔧 Dashboard Técnico */}
            <Route path="/tecnico" element={<DashboardTecnico />} />
            <Route
              path="/tecnico/tickets-asignados"
              element={<TicketsAsignados />}
            />
            <Route
              path="/tecnico/actualizar-estado"
              element={<ActualizarEstado />}
            />

            {/* 🛠️ Dashboard Administrador */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/register" element={<RegisterPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/asignar" element={<AsignarTicketPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
