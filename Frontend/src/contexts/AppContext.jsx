import React, { createContext, useState, useEffect } from "react";
export const AppContext = createContext();
import axios from "axios";
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const checkUser = async () => {
    try {
      const response = await axios.post(
        `https://messageadministrative.onrender.com/api/check`,
        {
          token: localStorage.getItem("token"),
        }
      );
      console.log(response);
      if (response.status === 200 && response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
    }
  };
  useEffect(() => {
    checkUser();
  }, []);
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAdmin,
        setIsAdmin,
        isLoading,
        setIsLoading,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;
