import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = () => {
  const { user } = useAuth();

  return user?.rol === "ADMINISTRADOR" ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
