import React, { useContext, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { useTranslation } from "../utils/translations";
import {
  Home,
  LayoutDashboard,
  PlusSquare,
  User2,
  Settings,
  Search,
  Feather,
  Siren,
  Bell,
  Globe,
} from "lucide-react";

const PUBLIC_NAV = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/alerts", icon: Siren, label: "Alerts" },
  { to: "/create", icon: PlusSquare, label: "Report" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/profile", icon: User2, label: "Profile" },

  // { to: "/settings", icon: Settings, label: "Settings" },
];

const GOV_NAV = [
  { to: "/gov", icon: Home, label: "Home" },
  { to: "/gov/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/gov/create", icon: PlusSquare, label: "Create" },
  { to: "/gov/search", icon: Search, label: "Search" },
  { to: "/gov/profile", icon: User2, label: "Profile" },
];

function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/" || to === "/gov"}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-full text-[1.0625rem] transition-colors ${
          isActive
            ? "font-bold text-x-text bg-x-bg-hover"
            : "font-normal text-x-text hover:bg-x-bg-hover"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={26} strokeWidth={isActive ? 2.5 : 1.75} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function MobileNavLink({ to, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/" || to === "/gov"}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isActive ? "text-x-text" : "text-x-text-secondary"
        }`
      }
    >
      {({ isActive }) => <Icon size={22} strokeWidth={isActive ? 1.8 : 1.6} />}
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const { user, language, toggleLanguage } = useContext(AppContext);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const isGov = location.pathname.startsWith("/gov");
  const navItems = isGov
    ? [
        { to: "/gov", icon: Home, label: t("home") },
        { to: "/gov/dashboard", icon: LayoutDashboard, label: t("dashboard") },
        { to: "/gov/create", icon: PlusSquare, label: t("create") },
        { to: "/gov/search", icon: Search, label: t("search") },
        { to: "/alerts", icon: Siren, label: t("alerts") },
        { to: "/gov/profile", icon: User2, label: t("profile") },
      ]
    : [
        { to: "/", icon: Home, label: t("home") },
        { to: "/alerts", icon: Siren, label: t("alerts") },
        { to: "/create", icon: PlusSquare, label: t("reportIssue") },
        { to: "/search", icon: Search, label: t("search") },
        { to: "/profile", icon: User2, label: t("profile") },
      ];
  const createPath = isGov ? "/gov/dashboard" : "/create";
  const searchPlaceholder = t("search");

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchValue("");
  };

  return (
    <div className="min-h-screen bg-x-bg text-x-text">
      <header
        className="fixed top-0 inset-x-0 z-50 bg-x-bg/92 backdrop-blur-xl border-b border-x-border"
        style={{ height: "var(--topbar-h)" }}
      >
        <div className="max-w-[1280px] mx-auto h-full px-4 flex items-center justify-between">
          <Link
            to={isGov ? "/gov" : "/"}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-x-primary flex items-center justify-center">
              <Feather size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              CivicReport
            </span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center gap-2 border border-x-border rounded-full px-3 py-1 bg-white">
            <Search size={18} className="text-x-text-secondary" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent outline-none text-sm min-w-[160px]"
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              type="button"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-x-border px-3 py-2 text-sm"
            >
              <Globe size={16} />
              {language === "en" ? t("nepali") : t("english")}
            </button>

            <Link
              to="/notifications"
              className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-x-bg-hover transition-colors"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </Link>

            <Link
              to={isGov ? "/gov/settings" : "/settings"}
              className="inline-flex items-center justify-center p-2 rounded-full hover:bg-x-bg-hover transition-colors"
            >
              <Settings size={20} />
            </Link>

            {user ? (
              <Link
                to={isGov ? "/gov/profile" : "/profile"}
                className="flex items-center gap-2 hover:bg-x-bg-hover rounded-full pl-1 pr-3 py-1 transition-colors"
              >
                <div className="x-avatar w-8 h-8 text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-bold hidden sm:block">
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link to="/signin" className="x-btn x-btn-primary x-btn-sm">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div
        className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[var(--sidebar-w)_minmax(0,1fr)] xl:grid-cols-[var(--sidebar-w)_minmax(0,1fr)_var(--right-rail-w)]"
        style={{
          paddingTop: "var(--topbar-h)",
          minHeight: "calc(100vh - var(--topbar-h))",
        }}
      >
        <aside
          className="hidden lg:flex flex-col px-3 py-4 sticky"
          style={{
            top: "var(--topbar-h)",
            height: "calc(100vh - var(--topbar-h))",
          }}
        >
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </nav>
          <Link
            to={createPath}
            className="x-btn x-btn-primary x-btn-full mt-4 py-3 text-[1.0625rem]"
          >
            {isGov ? "Manage Issues" : "Report Issue"}
          </Link>
        </aside>

        <main
          className="min-w-0 flex justify-center border-x border-x-border pb-20 lg:pb-0"
          style={{ minHeight: "calc(100vh - var(--topbar-h))" }}
        >
          <div className="w-full max-w-[var(--feed-max-w)]">{children}</div>
        </main>

        <aside
          className="hidden xl:block px-4 py-4 sticky"
          style={{
            top: "var(--topbar-h)",
            height: "calc(100vh - var(--topbar-h))",
          }}
        >
          <div className="space-y-4">
            <div className="x-panel">
              <h3 className="font-bold text-lg mb-1">
                {isGov ? "Government Portal" : "Community Feed"}
              </h3>
              <p className="text-x-text-secondary text-sm leading-relaxed">
                {isGov
                  ? "Review, track, and resolve civic issues reported by citizens."
                  : "Report local issues, upvote concerns, and track resolution progress."}
              </p>
            </div>
            <div className="x-panel">
              <h4 className="font-bold text-xs mb-3 text-x-text-secondary uppercase tracking-wider">
                Quick Actions
              </h4>
              <div className="space-y-2">
                {!isGov && (
                  <Link
                    to="/create"
                    className="x-btn x-btn-accent x-btn-full x-btn-sm"
                  >
                    Report an Issue
                  </Link>
                )}
                <Link
                  to={isGov ? "/gov/dashboard" : "/dashboard"}
                  className="x-btn x-btn-secondary x-btn-full x-btn-sm text-center"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
            {user && (
              <div className="x-panel">
                <div className="flex items-center gap-3">
                  <div className="x-avatar">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{user.name}</p>
                    <p className="text-x-text-secondary text-sm truncate">
                      {user.role === "gov" ? "Government Official" : "Citizen"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-x-bg/92 backdrop-blur-xl border-t border-x-border h-14">
        <div className="flex items-center justify-around h-full max-w-lg mx-auto ">
          {navItems.slice(0, 5).map((item) => (
            <MobileNavLink key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}
