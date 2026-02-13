import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast"; // <--- 1. IMPORTAR
import PrivateRoute from "./components/shared/PrivateRoute";
import AdminRoute from "./components/shared/AdminRoute";

// ... (Resto de tus imports se mantienen igual) ...
// Páginas públicas
import LoginPage from "./pages/Auth/LoginPage";
import NotificacionesPage from "./pages/User/Notificaciones";
import TicketDetalle from "./pages/User/TicketDetalle";

// Páginas compartidas
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProfilePage from "./pages/User/ProfilePage";
import TicketListPage from "./pages/Tickets/TicketsListPage";
import NuevoTicketPage from "./pages/Tickets/NuevoTicketPage";

// Dashboards
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import DashboardTecnico from "./pages/Dashboard/DashboardTecnico";
import UsuarioDashboard from "./pages/Dashboard/UsuarioDashboard";

// Técnico
import TicketsAsignados from "./pages/Tecnico/TicketsAsignados";
import ActualizarEstado from "./pages/Tecnico/ActualizarEstado";

// Admin
import RegisterPage from "./pages/Auth/RegisterPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import EditarUsuario from "./pages/Admin/EditarUsuario";
import AsignarTicketPage from "./pages/Admin/AsignarTicketPage";
import AdminReportsPage from "./pages/Admin/AdminReportsPage";

// Usuario Extra
import TicketsPendientes from "./pages/Tickets/TicketsPendientes";
import HistorialUsuario from "./pages/Tickets/HistorialUsuario";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* 👇 2. AGREGAR EL TOASTER AQUÍ 👇 */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#333", color: "#fff" },
            success: {
              duration: 3000,
              style: { background: "#DEF7EC", color: "#03543F" },
            },
            error: {
              duration: 5000,
              style: { background: "#FDE8E8", color: "#9B1C1C" },
            },
          }}
        />

        <Routes>
          {/* 🌐 Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<DashboardPage />} />

          {/* 🔐 Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/:id" element={<TicketDetalle />} />

            {/* 🧑 Usuario */}
            <Route path="/usuario" element={<UsuarioDashboard />} />
            <Route
              path="/usuario/tickets/nuevo"
              element={<NuevoTicketPage />}
            />
            <Route path="/usuario/tickets/:id" element={<TicketDetalle />} />
            <Route
              path="/usuario/notificaciones"
              element={<NotificacionesPage />}
            />
            <Route path="/usuario/tickets" element={<TicketsPendientes />} />
            <Route path="/usuario/historial" element={<HistorialUsuario />} />

            {/* 🧑‍🔧 Técnico */}
            <Route path="/tecnico" element={<DashboardTecnico />} />
            <Route
              path="/tecnico/tickets-asignados"
              element={<TicketsAsignados />}
            />
            <Route
              path="/tecnico/tickets/:id/actualizar"
              element={<ActualizarEstado />}
            />
            <Route
              path="/tecnico/notificaciones"
              element={<NotificacionesPage />}
            />

            {/* 🛠️ Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/register" element={<RegisterPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/asignar" element={<AsignarTicketPage />} />
              <Route path="/admin/users/:id/edit" element={<EditarUsuario />} />
              <Route path="/admin/reportes" element={<AdminReportsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
