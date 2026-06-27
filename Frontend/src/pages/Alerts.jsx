import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import ReportFeedItem from "../components/ReportFeedItem";
import { AppContext } from "../contexts/AppContext";
import { useTranslation } from "../utils/translations";

const Alerts = () => {
  const { user } = useContext(AppContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const t = useTranslation();

  const FEED_TABS = { PUBLIC: "public", AUTHORITY: "authority" };

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/gov/post/alerts`,
        );
        setAlerts(response.data.reports || []);
      } catch (err) {
        console.error(err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const statusBadge = (status) => {
    const map = {
      Pending: "x-badge-pending",
      Progress: "x-badge-progress",
      Resolved: "x-badge-resolved",
    };
    return map[status] || "x-badge-pending";
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "y", seconds: 31536000 },
      { label: "mo", seconds: 2592000 },
      { label: "d", seconds: 86400 },
      { label: "h", seconds: 3600 },
      { label: "m", seconds: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count}${interval.label}`;
    }
    return "now";
  };

  return (
    <div className="space-y-6">
      <div className="x-page-header">
        <div>
          <h1>{t("alerts")}</h1>
          <p className="text-sm text-x-text-secondary">
            {alerts.length > 0
              ? `${alerts.length} ${t("alerts")}`
              : t("noNotifications")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-x-accent" size={28} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="x-panel text-center text-x-text-secondary py-10">
            {t("noNotifications")}
          </div>
        ) : (
          alerts.map((alert) => (
            <ReportFeedItem
              key={alert._id}
              issue={alert}
              user={user}
              feedTab={FEED_TABS.AUTHORITY}
              feedTabs={FEED_TABS}
              expanded={expanded}
              onToggleDescription={toggleDescription}
              statusBadge={statusBadge}
              timeAgo={timeAgo}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
