import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { Loader2 } from "lucide-react";

const GovMiddleware = () => {
  const { isAuthenticated, isLoading, user } = useContext(AppContext);

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  if (user.role !== "gov") {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <Outlet />
    </>
  );
};

export default GovMiddleware;
