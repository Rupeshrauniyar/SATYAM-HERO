import React, { createContext, useState, useEffect } from "react";
export const AppContext = createContext();
import axios from "axios";

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const [resolvedTheme, setResolvedTheme] = useState(() => getSystemTheme());
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
    document.documentElement.lang = language === "ne" ? "ne" : "en";
    document.documentElement.dir = "ltr";
  }, [language]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(effectiveTheme);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    document.documentElement.style.colorScheme = effectiveTheme;
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return undefined;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const effectiveTheme = getSystemTheme();
      setResolvedTheme(effectiveTheme);
      document.documentElement.setAttribute("data-theme", effectiveTheme);
      document.documentElement.style.colorScheme = effectiveTheme;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

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
        theme,
        setTheme,
        resolvedTheme,
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
