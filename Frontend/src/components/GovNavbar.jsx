import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import Avatar from "./Avatar";
import { useTranslation } from "../utils/translations";
import {
  Book,
  Hamburger,
  Home,
  LayoutDashboard,
  Menu,
  PlusSquare,
  Search,
  User2,
  UserIcon,
} from "lucide-react";

const Navbar = () => {
  const { user, language, toggleLanguage } = useContext(AppContext);
  const t = useTranslation();
  const NavItem = ({ to, icon: Icon, label }) => {
      return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-xs transition ${
            isActive ? "text-x-text font-semibold" : "text-x-text-secondary"
          }`
        }
      >
        <Icon size={24} />
        <span>{label}</span>
      </NavLink>
    );
  };
  const NavItem2 = ({ to, icon: Icon, label }) => {
      return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
           isActive
             ? "bg-x-primary text-x-text-on-primary shadow-md"
             : "bg-transparent text-x-text hover:bg-x-bg-hover"
         }`
        }
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </NavLink>
    );
  };
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[999] bg-x-bg border-b border-x-border">
        <div className="mx-auto h-16 px-4 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="text-xl font-semibold text-x-text hover:opacity-90">
            {t("appName")}
          </Link>

          {/* Right section */}
          <nav className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-2">
                <Avatar
                  src={user?.profilePicture}
                  label={user?.name || user?.phone_number || "User"}
                  className="w-9 h-9"
                />
                <p className="ml-1 text-x-text">{user?.name?.split(" ")[0]}</p>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-medium bg-x-primary text-x-text-on-primary rounded-xl hover:opacity-90"
                >
                  Sign in
                </Link>
              </>
            )}
            <button onClick={toggleLanguage} className="x-btn-ghost text-sm">
              {language === "en" ? t("nepali") : t("english")}
            </button>
          </nav>
        </div>
      </header>
      <footer className="fixed xl:hidden visible bottom-[-2px] left-0 z-[999]  bg-x-bg w-full h-15 px-3 shadow-3xl border-t-2 border-x-border">
        <div className=" flex items-center justify-between w-full h-full mb-10">
          <NavItem to="/gov" icon={Home} label={t("home")} className="flex" />
          <NavItem
            to="/gov/dashboard"
            icon={LayoutDashboard}
            label={t("dashboard")}
          />
          <NavItem to="/gov/search" icon={Search} label={t("search")} />
          <NavItem to="/gov/profile" icon={User2} label={t("profile")} />
          <NavItem to="/gov/settings" icon={Menu} label={t("settings")} />
        </div>
      </footer>
      <div className="fixed  xl:flex hidden left-0 z-[999]  bg-x-bg-secondary/50 border-1 border-x-border shadow-xl w-[20%] h-screen p-3 shadow-3xl border-t-2 border-x-border">
        <div className=" flex flex-col items-center justify-start w-full h-full mb-10">
          <NavItem2 to="/gov" icon={Home} label={t("home")} className="flex" />
          <NavItem2
            to="/gov/dashboard"
            icon={LayoutDashboard}
            label={t("dashboard")}
          />
          <NavItem2 to="/gov/search" icon={Search} label={t("search")} />
          <NavItem2 to="/gov/profile" icon={User2} label={t("profile")} />
          <NavItem2 to="/gov/settings" icon={Menu} label={t("settings")} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
