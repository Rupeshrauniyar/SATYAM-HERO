import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { Loader2 } from "lucide-react";

const UnverifiedMiddleware = () => {
  const { isAuthenticated, isLoading, user } = useContext(AppContext);

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  // Not logged in → redirect to signin
  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />;
  }

  // Verified user → cannot access signup
  if (user.verified) {
    return <Navigate to="/" replace />;
  }

  // Logged-in but unverified → allow access
  return <Outlet />;
};

export default UnverifiedMiddleware;
