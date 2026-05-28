import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RootRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (location.pathname !== "/") return null;

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (user.role === "client") {
    return <Navigate to="/client-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RootRedirect;
