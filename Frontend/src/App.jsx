import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppProvider from "./contexts/AppContext";

// layouts
import UserLayout from "./layouts/UserLayout";
import GovLayout from "./layouts/GovLayout";
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

// gov pages
import GovHome from "./pages_gov/GovHome";
import GovSearch from "./pages_gov/GovSearch";
import GovDashboard from "./pages_gov/GovDashboard";
import GovProfile from "./pages_gov/GovProfile";
import GovSettings from "./pages_gov/GovSettings";

// auth
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* USER APP */}
          <Route element={<UserMiddleware />}>
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* GOV APP */}
          <Route element={<GovMiddleware />}>
            <Route element={<GovLayout />}>
              <Route path="/gov" element={<GovHome />} />
              <Route path="/gov/search" element={<GovSearch />} />
              <Route path="/gov/dashboard" element={<GovDashboard />} />
              <Route path="/gov/profile" element={<GovProfile />} />
              <Route path="/gov/settings" element={<GovSettings />} />
            </Route>
          </Route>

          {/* PUBLIC */}
          <Route element={<PublicLayout />}>
            <Route path="/signin" element={<Signin />} />
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
