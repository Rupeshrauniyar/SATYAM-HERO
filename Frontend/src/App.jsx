import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppProvider from "./contexts/AppContext";

// layouts
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";

// middlewares
import UserMiddleware from "./middlewares/UserMiddleware";
import GovMiddleware from "./middlewares/GovMiddleware";
import UnverifiedMiddleware from "./middlewares/UnverifiedMiddleware";

// user pages
import Home from "./pages/Home";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Search from "./pages/Search";

// gov pages
import GovHome from "./pages_gov/GovHome";
import GovSearch from "./pages_gov/GovSearch";
import GovCreate from "./pages_gov/GovCreate";
import GovDashboard from "./pages_gov/GovDashboard";
import GovProfile from "./pages_gov/GovProfile";
import GovSettings from "./pages_gov/GovSettings";
import Alerts from "./pages/Alerts";
import Notifications from "./pages/Notifications";

// auth
import Signinv2 from "./pages/Signinv2";
import Signup from "./pages/Signup";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* USER APP */}
          <Route element={<UserMiddleware />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<Search />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* GOV APP */}
          <Route element={<GovMiddleware />}>
            <Route element={<AppLayout />}>
              <Route path="/gov" element={<GovHome />} />
              <Route path="/gov/search" element={<GovSearch />} />
              <Route path="/gov/create" element={<GovCreate />} />
              <Route path="/gov/dashboard" element={<GovDashboard />} />
              <Route path="/gov/profile" element={<GovProfile />} />
              <Route path="/gov/settings" element={<GovSettings />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* PUBLIC */}
          <Route element={<PublicLayout />}>
            <Route path="/signin" element={<Signinv2 />} />
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
