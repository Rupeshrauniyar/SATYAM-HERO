import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import {
  Book,
  Hamburger,
  Home,
  LayoutDashboard,
  Menu,
  PlusSquare,
  User2,
  UserIcon,
} from "lucide-react";

const Navbar = () => {
  const { user } = useContext(AppContext);
  const NavItem = ({ to, icon: Icon, label }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-xs transition ${
            isActive ? "text-black font-semibold" : "text-gray-500"
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
          `flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all 
         ${
           isActive
             ? "bg-black text-white shadow-md"
             : "bg-transparent text-gray-700 hover:bg-gray-100"
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
      <header className="fixed top-0 left-0 right-0 z-[999] bg-white border-b border-gray-200">
        <div className="mx-auto h-16 px-4 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="text-xl font-semibold text-gray-900 hover:text-gray-700"
          >
            CivicReport
          </Link>

          {/* Right section */}
          <nav className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 bg-gray-200  rounded-full p-1">
                  <User2 size={20} className=" text-zinc-700 " />
                </span>
                <p className="ml-1">{user?.name?.split(" ")[0]}</p>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800"
                >
                  Sign in
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <footer className="fixed xl:hidden visible bottom-[-2px] left-0 z-[999]  bg-white w-full h-15 px-3 shadow-3xl border-t-2 border-zinc-100">
        <div className=" flex items-center justify-between w-full h-full mb-10">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/create" icon={PlusSquare} label="Create" />
          <NavItem to="/profile" icon={User2} label="Profile" />
          <NavItem to="/settings" icon={Menu} label="Settings" />
        </div>
      </footer>
      <div className="fixed  xl:flex hidden left-0 z-[999]  bg-gray-100/50 border-1 border-gray-200 shadow-xl w-[20%] h-screen p-3 shadow-3xl border-t-2 border-zinc-100">
        <div className=" flex flex-col items-center justify-start w-full h-full mb-10">
          <NavItem2 to="/" icon={Home} label="Home" className="flex" />
          <NavItem2 to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem2 to="/create" icon={PlusSquare} label="Create" />
          <NavItem2 to="/profile" icon={User2} label="Profile" />
          <NavItem2 to="/settings" icon={Menu} label="Settings" />
        </div>
      </div>
    </>
  );
};

export default Navbar;
