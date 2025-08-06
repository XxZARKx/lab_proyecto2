import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // ⏳ o puedes poner un spinner

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
