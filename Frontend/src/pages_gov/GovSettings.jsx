import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { useTranslation } from "../utils/translations";
import { LogOut, ChevronRight, X, Shield, Bell, User, Palette } from "lucide-react";

export default function GovSettings() {
  const { user, setUser, setIsAuthenticated, theme, setTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const t = useTranslation();

  useEffect(() => {
    document.body.style.overflow = confirmLogout ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [confirmLogout]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/signin");
  };

  return (
    <div>
      <div className="x-page-header"><h1>{t("settings")}</h1></div>
      <div className="p-4">
        <div className="x-panel mb-4 flex items-center gap-4">
          <div className="x-avatar x-avatar-lg">{user?.name?.trim()?.charAt(0)?.toUpperCase()}</div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-sm text-x-text-secondary">{user?.phone_number}</p>
            <span className="inline-block mt-1 x-badge x-badge-progress">Government</span>
          </div>
        </div>
        <div className="border border-x-border rounded-2xl overflow-hidden divide-y divide-x-border">
          <SettingsItem icon={<User size={18} />} label={t("account")} description={t("personalInformation")} onClick={() => navigate('/gov/profile')} />
          <SettingsItem icon={<Shield size={18} />} label={t("privacyAndSecurity")} description={t("permissions")} onClick={() => navigate('/privacy')} />
          <SettingsItem icon={<Bell size={18} />} label={t("notifications")} description={t("pushAndEmailAlerts")} onClick={() => navigate('/notifications')} />
          <div className="px-4 py-4 bg-x-bg/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-x-text-secondary"><Palette size={18} /></div>
                <div className="text-left">
                  <p className="font-bold text-sm">{t("appearance")}</p>
                  <p className="text-xs text-x-text-secondary mt-0.5">{t("themeAndDisplay")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(["light", "dark", "system"]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${theme === mode ? "bg-x-accent text-white border-x-accent" : "border-x-border text-x-text-secondary bg-x-bg"}`}
                  >
                    {t(mode)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setConfirmLogout(true)} className="mt-6 x-btn x-btn-secondary x-btn-full text-red-500 border-red-200 hover:bg-red-50">
          <LogOut size={18} /> {t("logOut")}
        </button>
      </div>
      {confirmLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmLogout(false)} />
          <div className="relative bg-x-bg rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
            <h2 className="text-lg font-bold mb-2">{t("logOutQuestion")}</h2>
            <p className="text-sm text-x-text-secondary mb-6">{t("logOutMessage")}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmLogout(false)} className="x-btn x-btn-secondary flex-1">{t("cancel")}</button>
              <button onClick={handleLogout} className="x-btn x-btn-primary flex-1 !bg-red-500 hover:!bg-red-600">{t("logOut")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsItem({ icon, label, description, onClick }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-4 flex items-center justify-between hover:bg-x-bg-hover transition-colors cursor-pointer">
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
