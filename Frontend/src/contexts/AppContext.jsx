import React, { createContext, useState, useEffect } from "react";
export const AppContext = createContext();
import axios from "axios";
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const checkUser = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/check`,
        {
          token: localStorage.getItem("token"),
        },
      );
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
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ne" : "en"));
  };

  useEffect(() => {
    checkUser();
  }, []);
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        toggleLanguage,
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
