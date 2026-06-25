import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  if (!localStorage.getItem("isLoggedIn")) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
