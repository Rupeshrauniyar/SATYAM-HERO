import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import {
  Bell, X, ArrowBigUp, MessageSquare, AlertCircle,
   CheckCheck, Inbox, ChevronDown,ArrowBigDown, ThumbsUp, ThumbsDown
} from "lucide-react";
import { useTranslation } from "../utils/translations";

/* ── icon + colour mapping per notification type ─────────── */
const TYPE_CONFIG = {
  upvote: {
    Icon: ArrowBigUp,
    label: "Upvote",
    color: "#10B981",
    bg: "#ECFDF5",
    border: "#6EE7B7",
  },
  downvote: {
    Icon: ArrowBigDown,
    label: "Downvote",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FCA5A5",
  },
  comment: {
    Icon: MessageSquare,
    label: "Comment",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#93C5FD",
  },
  status: {
    Icon: AlertCircle,
    label: "Status",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FCD34D",
  },
  default: {
    Icon: ThumbsUp,
    label: "Update",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#C4B5FD",
  },
};

function getConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.default;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ── skeleton loader ────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: "#F1F5F9",
            borderRadius: 16,
            padding: "20px",
            display: "flex",
            gap: 14,
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#E2E8F0", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 13, background: "#E2E8F0", borderRadius: 6, width: "70%" }} />
            <div style={{ height: 11, background: "#E2E8F0", borderRadius: 6, width: "45%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── single notification card ───────────────────────────── */
function NotificationCard({ notification, onMarkRead, onDelete }) {
  const cfg = getConfig(notification.type);
  const { Icon } = cfg;
  const isUnread = !notification.read;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 16,
        background: isUnread ? "#fff" : "#F8FAFC",
        border: `1px solid ${isUnread ? cfg.border : "#E5E7EB"}`,
        boxShadow: isUnread ? "0 2px 12px rgba(15,31,61,0.07)" : "none",
        transition: "box-shadow 0.2s, border-color 0.2s, background 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,31,61,0.10)";
        e.currentTarget.style.borderColor = isUnread ? cfg.color : "#CBD5E1";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = isUnread ? "0 2px 12px rgba(15,31,61,0.07)" : "none";
        e.currentTarget.style.borderColor = isUnread ? cfg.border : "#E5E7EB";
      }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div style={{
          position: "absolute", top: 18, right: 18,
          width: 8, height: 8, borderRadius: "50%",
          background: cfg.color,
          boxShadow: `0 0 0 3px ${cfg.bg}`,
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: cfg.bg, display: "flex", alignItems: "center",
        justifyContent: "center", color: cfg.color,
      }}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: isUnread ? 600 : 500,
          color: "#0F1F3D", margin: "0 0 4px", lineHeight: 1.45,
          paddingRight: 48,
        }}>
          {notification.message}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px",
            borderRadius: 99, background: cfg.bg, color: cfg.color,
          }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            {notification.sourceUserId?.name || "System"}
          </span>
          <span style={{ fontSize: 12, color: "#CBD5E1" }}>·</span>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0, paddingTop: 2 }}>
        {isUnread && (
          <button
            onClick={() => onMarkRead(notification._id)}
            title="Mark as read"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#94A3B8", padding: "4px 6px", borderRadius: 6,
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 600, transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#0F1F3D"; e.currentTarget.style.background = "#F1F5F9"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "none"; }}
          >
            <CheckCheck size={13} />
            Read
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          title="Delete notification"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#CBD5E1", padding: "4px 6px", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "#FEF2F2"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#CBD5E1"; e.currentTarget.style.background = "none"; }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────── */
const Notifications = () => {
  const { user } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const t = useTranslation();

  const token = localStorage.getItem("token");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = [
    { key: "all",      label: "All",     icon: Bell },
    { key: "comment",  label: "Comments",icon: MessageSquare },
    { key: "upvote",   label: "Upvotes", icon: ArrowBigUp },
    { key: "downvote", label: "Downvotes",icon: ArrowBigDown },
    { key: "status",   label: "Status",  icon: AlertCircle },
  ];

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
        { token }
      );
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const markRead = async (notificationId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notification/mark-read`,
        { token, notificationId }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notification/delete`,
        { token, notificationId }
      );
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .notif-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px; border: 1px solid transparent;
          font-size: 13px; font-weight: 500; cursor: pointer;
          background: none; white-space: nowrap;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          color: #64748B;
        }
        .notif-tab:hover { background: #F1F5F9; color: #0F1F3D; }
        .notif-tab.active {
          background: #0F1F3D; color: #fff; border-color: #0F1F3D;
          font-weight: 600;
        }
        .notif-tab .tab-count {
          font-size: 10px; font-weight: 700; padding: 1px 6px;
          border-radius: 99px; background: rgba(255,255,255,0.2);
          color: inherit;
        }
        .notif-tab:not(.active) .tab-count {
          background: #E2E8F0; color: #64748B;
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 10px 40px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 16, marginBottom: 28, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "#0F1F3D", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Bell size={22} color="#F59E0B" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{
                  fontSize: 22, fontWeight: 800, color: "#0F1F3D",
                  margin: 0, letterSpacing: "-0.02em",
                }}>
                  {t("notificationTitle") || "Notifications"}
                </h1>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 99, background: "#FEF3C7",
                    color: "#92400E", letterSpacing: "0.01em",
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: "3px 0 0", fontWeight: 400 }}>
                {notifications.length > 0
                  ? `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 10,
                background: "#fff", border: "1.5px solid #E2E8F0",
                fontSize: 13, fontWeight: 600, color: "#374151",
                cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0F1F3D"; e.currentTarget.style.background = "#F8FAFC"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff"; }}
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 24,
          overflowX: "auto", paddingBottom: 4,
          scrollbarWidth: "none",
        }}>
          {tabs.map((tab) => {
            const count = tab.key === "all"
              ? notifications.length
              : notifications.filter((n) => n.type === tab.key).length;
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`notif-tab ${isActive ? "active" : ""}`}
              >
                <TabIcon size={13} />
                {tab.label}
                {count > 0 && <span className="tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Divider with label ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        }}>
          <div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1", letterSpacing: "0.06em" }}>
            {loading ? "LOADING" : `${notifications.length} RESULT${notifications.length !== 1 ? "S" : ""}`}
          </span>
          <div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />
        </div>

        {/* ── Notification list ── */}
        {loading ? (
          <Skeleton />
        ) : notifications.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "64px 24px", gap: 16,
            background: "#F8FAFC", borderRadius: 20,
            border: "1.5px dashed #E2E8F0",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: "#F1F5F9", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <Inbox size={26} color="#CBD5E1" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>
                No notifications yet
              </p>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
                When someone comments, upvotes, or updates a report you follow, it'll show up here.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Unread section */}
            {notifications.filter((n) => !n.read).length > 0 && (
              <>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#94A3B8",
                  letterSpacing: "0.07em", padding: "4px 2px 8px",
                }}>
                  UNREAD
                </div>
                {notifications
                  .filter((n) => !n.read)
                  .map((notification) => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                      onMarkRead={markRead}
                      onDelete={deleteNotification}
                    />
                  ))}
              </>
            )}

            {/* Read section */}
            {notifications.filter((n) => n.read).length > 0 && (
              <>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#CBD5E1",
                  letterSpacing: "0.07em", padding: "12px 2px 8px",
                }}>
                  EARLIER
                </div>
                {notifications
                  .filter((n) => n.read)
                  .map((notification) => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                      onMarkRead={markRead}
                      onDelete={deleteNotification}
                    />
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;