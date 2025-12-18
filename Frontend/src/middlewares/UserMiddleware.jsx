import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";

const UserMiddleware = () => {
  const { user, isAuthenticated, isLoading } = useContext(AppContext);
  const location = useLocation();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }
  if (user?.role === "admin" && !location.pathname.startsWith("/admin")) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  if (location.pathname === "/admin" && user?.role !== "admin") {
    return <Navigate to="/" />;
  }
  return (
    <>
      <Outlet />
    </>
  );
};

export default UserMiddleware;
