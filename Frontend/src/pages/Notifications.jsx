import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import { Bell, X, CheckCircle2, ThumbsUp, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "../utils/translations";

const Notifications = () => {
  const { user } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const t = useTranslation();

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "all"
          ? `${import.meta.env.VITE_BACKEND_URL}/api/notification`
          : `${import.meta.env.VITE_BACKEND_URL}/api/notification/type/${activeTab}`;
      const response = await axios.get(url, {
        headers: { Authorization: token },
        data: { token },
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error(error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user, activeTab]);

  const markAllRead = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notification/mark-all-read`,
        { token },
      );
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const markRead = async (notificationId) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/notification/mark-read`, { token, notificationId });
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notification/delete`,
        { token, notificationId },
      );
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="x-page-header">
        <div className="flex items-center gap-3">
          <Bell size={24} />
          <div>
            <h1>{t("notificationTitle")}</h1>
            <p className="text-sm text-x-text-secondary">
              {notifications.length
                ? `${notifications.length} ${t("notifications")}`
                : t("noNotifications")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: "all", label: t("notifications") },
          { key: "comment", label: t("comment") },
          { key: "upvote", label: t("upvote") },
          { key: "downvote", label: t("downvote") },
          { key: "status", label: t("statusUpdate") },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-x-primary text-white"
                : "bg-x-bg text-x-text-secondary hover:bg-x-bg-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={markAllRead}
          className="x-btn x-btn-secondary"
        >
          {t("markAllRead")}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="x-panel text-center text-x-text-secondary py-10">
            {t("noNotifications")}
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.type === 'upvote' ? ThumbsUp : notification.type === 'comment' ? MessageSquare : notification.type === 'status' ? AlertCircle : RefreshCw;
            return (
              <div key={notification._id} className={`flex items-start gap-3 p-4 rounded-2xl border ${notification.read ? 'bg-white border-x-border' : 'bg-x-primary/5 border-transparent'}`}>
                <div className="p-2 rounded-lg bg-white/40">
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{notification.message}</p>
                      <p className="mt-1 text-xs text-x-text-secondary">{notification.sourceUserId?.name || 'System'} • {new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => markRead(notification._id)} className="text-x-text-secondary hover:text-x-accent text-xs">Mark read</button>
                      <button onClick={() => deleteNotification(notification._id)} className="text-x-text-secondary hover:text-red-500"><X size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
