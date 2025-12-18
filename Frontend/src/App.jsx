import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";

import AppProvider from "./contexts/AppContext";
import UserMiddleware from "./middlewares/UserMiddleware";
const App = () => {
  return (
    <div className="min-h-screen bg-zinc-900">
      <AppProvider>
        <Router>
          <Navbar />

          <Routes>
            <Route element={<UserMiddleware />}>
              <Route
                path="/admin"
                element={<Admin />}
              />
              <Route
                path="/"
                element={<Home />}
              />
            </Route>
            <Route
              path="/signin"
              element={<Signin />}
            />
            <Route
              path="/signup"
              element={<Signup />}
            />
          </Routes>
        </Router>
      </AppProvider>
    </div>
  );
};

export default App;
