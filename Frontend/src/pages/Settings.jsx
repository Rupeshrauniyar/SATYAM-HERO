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
} from "lucide-react";

export default function Settings() {
  const { user, setUser, setIsAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    document.body.style.overflow = confirmLogout ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [confirmLogout]);

  const handleLogout = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/signin");
  };

  return (
    <div>
      <div className="x-page-header">
        <h1>Settings</h1>
      </div>

      <div className="p-4">
        <div className="x-panel mb-4 flex items-center gap-4">
          <div className="x-avatar x-avatar-lg">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-sm text-x-text-secondary">{user?.phone_number}</p>
            <span
              className={`inline-block mt-1 x-badge ${
                user?.verified ? "x-badge-resolved" : "x-badge-pending"
              }`}
            >
              {user?.verified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>

        <div className="border border-x-border rounded-2xl overflow-hidden divide-y divide-x-border">
          <SettingsItem icon={<User size={18} />} label="Account" description="Personal information" />
          <SettingsItem icon={<Shield size={18} />} label="Privacy & Security" description="Permissions" />
          <SettingsItem icon={<Bell size={18} />} label="Notifications" description="Push and email alerts" />
          <SettingsItem icon={<Palette size={18} />} label="Appearance" description="Theme and display" />
        </div>

        <button
          onClick={() => setConfirmLogout(true)}
          className="mt-6 x-btn x-btn-secondary x-btn-full text-red-500 border-red-200 hover:bg-red-50"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmLogout(false)}
          />
          <div className="relative bg-x-bg rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
            <button
              onClick={() => setConfirmLogout(false)}
              className="absolute top-3 right-3 x-btn-ghost text-x-text-secondary"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold mb-2">Log out?</h2>
            <p className="text-sm text-x-text-secondary mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="x-btn x-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleLogout} className="x-btn x-btn-primary flex-1 !bg-red-500 hover:!bg-red-600">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsItem({ icon, label, description }) {
  return (
    <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-x-bg-hover transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-x-text-secondary">{icon}</div>
        <div className="text-left">
          <p className="font-bold text-sm">{label}</p>
          <p className="text-xs text-x-text-secondary mt-0.5">{description}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-x-text-secondary" />
    </button>
  );
}
