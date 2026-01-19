import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import {
  LogOut,
  ChevronRight,
  X,
  Shield,
  Bell,
  User,
  Palette,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Settings() {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    document.body.style.overflow = confirmLogout ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [confirmLogout]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
            <SettingsIcon size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* User Card */}
        <div className="relative bg-white rounded-2xl shadow-lg p-5 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.phone_number}</p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.verified
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {user?.verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="bg-white rounded-2xl shadow-lg divide-y">
          <SettingsItem
            icon={<User size={18} />}
            label="Account"
            description="Personal information and security"
          />
          <SettingsItem
            icon={<Shield size={18} />}
            label="Privacy & Security"
            description="Password, permissions"
          />
          <SettingsItem
            icon={<Bell size={18} />}
            label="Notifications"
            description="Push and email alerts"
          />
          <SettingsItem
            icon={<Palette size={18} />}
            label="Appearance"
            description="Theme and display"
          />
        </div>

        {/* Logout */}
        <button
          onClick={() => setConfirmLogout(true)}
          className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-600 py-3 font-semibold hover:bg-red-100 transition"
        >
          <LogOut size={18} /> Log out
        </button>

        {/* Logout Confirmation */}
        {confirmLogout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setConfirmLogout(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fadeIn">
              <button
                onClick={() => setConfirmLogout(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>

              <h2 className="text-lg font-semibold mb-2">Confirm logout</h2>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to log out of your account?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, description }) {
  return (
    <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-600">{icon}</div>
        <div className="text-left">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </button>
  );
}
