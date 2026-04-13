import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="screen-loader">Loading your workspace...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

export default ProtectedRoute;
