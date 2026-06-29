import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";

import AppProvider from "./contexts/AppContext";

// layouts
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";

// middlewares
import UserMiddleware from "./middlewares/UserMiddleware";
import GovMiddleware from "./middlewares/GovMiddleware";
import UnverifiedMiddleware from "./middlewares/UnverifiedMiddleware";

// user pages
import Landing from "./pages/Landing";

import Home from "./pages/Home";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Search from "./pages/Search";
import Insights from "./pages/Insights";
import EditProfile from "./pages/EditProfile";

// gov pages
import GovHome from "./pages_gov/GovHome";
import GovSearch from "./pages_gov/GovSearch";
import GovUsers from "./pages_gov/GovUsers";
import GovCreate from "./pages_gov/GovCreate";
import GovDashboard from "./pages_gov/GovDashboard";
import GovProfile from "./pages_gov/GovProfile";
import GovSettings from "./pages_gov/GovSettings";
import Alerts from "./pages/Alerts";
import Notifications from "./pages/Notifications";

// auth
import Signinv2 from "./pages/Signinv2";
import Signup from "./pages/Signup";

function AndroidBackHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const backAction = () => {
      const params = new URLSearchParams(location.search);
      const hasOverlayParams = params.has("comments") || params.has("share") || params.has("report");

      if (hasOverlayParams) {
        params.delete("comments");
        params.delete("share");
        params.delete("report");
        const search = params.toString();
        navigate(`${location.pathname}${search ? `?${search}` : ""}`, { replace: true });
        return;
      }

      if (location.pathname === "/") {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    };

    const listener = CapacitorApp.addListener("backButton", backAction);
    return () => listener.remove();
  }, [location, navigate]);

  return null;
}

const App = () => {
  useEffect(() => {
    const hide = async () => {
      try {
        await SplashScreen.hide();
      } catch (error) {
        // ignore if plugin is unavailable
      }
    };

    hide();
  }, []);

  return (
    <AppProvider>
      <Router>
        <AndroidBackHandler />
        <Routes>
          {/* USER APP */}
          <Route element={<UserMiddleware />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              {/* <Route path="/privacy" element={<PrivacyPolicy />} /> */}
              <Route path="/search" element={<Search />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/insights" element={<Insights />} />

            </Route>
          </Route>

          {/* GOV APP */}
          <Route element={<GovMiddleware />}>
            <Route element={<AppLayout />}>
              <Route path="/gov" element={<GovHome />} />
              <Route path="/gov/search" element={<GovSearch />} />
              <Route path="/gov/users" element={<GovUsers />} />
              <Route path="/gov/create" element={<GovCreate />} />
              <Route path="/gov/dashboard" element={<GovDashboard />} />
              <Route path="/gov/profile" element={<GovProfile />} />
              <Route path="/gov/profile/edit" element={<EditProfile />} />
              <Route path="/gov/settings" element={<GovSettings />} />
              <Route path="/gov/alerts" element={<Alerts />} />
              <Route path="/gov/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* PUBLIC */}
          <Route element={<PublicLayout />}>
              <Route path="/landing" element={<Landing />} />
            <Route path="/signin" element={<Signinv2 />} />
            <Route path="/privacy" element={< Privacy/>} />

            <Route element={<UnverifiedMiddleware />}>
              <Route path="/signup" element={<Signup />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
