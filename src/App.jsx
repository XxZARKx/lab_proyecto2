import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/shared/PrivateRoute";
import AdminRoute from "./components/shared/AdminRoute";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import AdminUsersPage from "./pages/Admin/UserPage";
import NewTicketPage from "./pages/Tickets/NewTicketPage";
import TicketListPage from "./pages/Tickets/TicketsListPage";
import ProfilePage from "./pages/User/ProfilePage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/admin/register" element={<RegisterPage />} />
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AdminRoute />}>
              {/* rutas donde se necesita logearse */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
