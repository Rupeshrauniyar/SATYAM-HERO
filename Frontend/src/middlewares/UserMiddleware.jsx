import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { Loader2 } from "lucide-react";

const UserMiddleware = () => {
  const { isAuthenticated, isLoading, user } = useContext(AppContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    const redirect = encodeURIComponent(
      location.pathname + location.search,
    );
    return <Navigate to={`/signin?redirect=${redirect}`} replace />;
  }
  if (user.role === "gov") {
    return <Navigate to="/gov" replace />;
  }
  return (
    <>
      <Outlet />
    </>
  );
};

export default UserMiddleware;
