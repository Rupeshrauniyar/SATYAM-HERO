import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { applyOptimisticVote } from "../utils/voteHelpers";
import { Loader2 } from "lucide-react";
import ReportFeedItem from "../components/ReportFeedItem";
import CommentSheet from "../components/CommentSheet";
import InsightsSheet from "../components/InsightsSheet";
import ShareSheet from "../components/ShareSheet";
import { AppContext } from "../contexts/AppContext";
import { useTranslation } from "../utils/translations";

const Alerts = () => {
  const { user, setUser } = useContext(AppContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [commentReport, setCommentReport] = useState(null);
  const [insightsReport, setInsightsReport] = useState(null);
  const [shareReport, setShareReport] = useState(null);
  const t = useTranslation();

  const FEED_TABS = { PUBLIC: "public", AUTHORITY: "authority" };

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/gov/post/alerts?page=1&limit=3`,
        );
        setAlerts(mergeUniqueItems([], response.data.reports || []));
        setHasMore(Boolean(response.data.hasMore));
      } catch (err) {
        console.error(err);
        setAlerts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 320;
      if (nearBottom) {
        loadMoreAlerts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, page]);

  const loadMoreAlerts = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/gov/post/alerts?page=${nextPage}&limit=3`,
      );
      setAlerts((prev) => mergeUniqueItems(prev, response.data.reports || []));
      setPage(nextPage);
      setHasMore(Boolean(response.data.hasMore));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

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

  const updateAlertInState = (alertId, updater) => {
    setAlerts((prev) => prev.map((alert) => (alert._id === alertId ? updater(alert) : alert)));
  };

  const handleUpvote = async (id) => {
    if (!user) return;

    const resourceId = id;
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const previousUserState = {
      upvotes: user?.upvotes || [],
      downvotes: user?.downvotes || [],
    };
    const previousAlert = alerts.find((alert) => alert._id === resourceId);

    setUser((prev) => {
      if (!prev) return prev;
      const nextUpvotes = [...(prev.upvotes || [])];
      const nextDownvotes = [...(prev.downvotes || [])];
      const normalizedId = resourceId.toString();
      const hasExistingUpvote = nextUpvotes.some((up) => up.toString() === normalizedId);

      return {
        ...prev,
        upvotes: hasExistingUpvote
          ? nextUpvotes.filter((up) => up.toString() !== normalizedId)
          : [...nextUpvotes.filter((up) => up.toString() !== normalizedId), resourceId],
        downvotes: nextDownvotes.filter((down) => down.toString() !== normalizedId),
      };
    });

    updateAlertInState(resourceId, (alert) =>
      applyOptimisticVote({
        issue: alert,
        userId: user?._id,
        voteType: "up",
        hasCurrentVote: hasUpvoted,
        hasOppositeVote: hasDownvoted,
      }),
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
        { reportId: resourceId, token, method: hasUpvoted ? "pull" : "push", resourceType: "govPost" },
      );
      if (res.status === 200 && res.data.success) {
        const nextUser = res.data.user || null;
        const nextResource = res.data.resource || null;

        if (nextUser) {
          setUser((prev) => ({ ...(prev || {}), ...nextUser }));
        }

        if (nextResource) {
          updateAlertInState(resourceId, (alert) => ({
            ...alert,
            upvotes: nextResource.upvotes || [],
            downvotes: nextResource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, upvotes: previousUserState.upvotes, downvotes: previousUserState.downvotes } : prev));
      if (previousAlert) {
        updateAlertInState(resourceId, (alert) => ({
          ...alert,
          upvotes: previousAlert.upvotes || [],
          downvotes: previousAlert.downvotes || [],
        }));
      }
      console.error(err);
    }
  };

  const handleDownvote = async (id) => {
    if (!user) return;

    const resourceId = id;
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const previousUserState = {
      upvotes: user?.upvotes || [],
      downvotes: user?.downvotes || [],
    };
    const previousAlert = alerts.find((alert) => alert._id === resourceId);

    setUser((prev) => {
      if (!prev) return prev;
      const nextUpvotes = [...(prev.upvotes || [])];
      const nextDownvotes = [...(prev.downvotes || [])];
      const normalizedId = resourceId.toString();
      const hasExistingDownvote = nextDownvotes.some((down) => down.toString() === normalizedId);

      return {
        ...prev,
        downvotes: hasExistingDownvote
          ? nextDownvotes.filter((down) => down.toString() !== normalizedId)
          : [...nextDownvotes.filter((down) => down.toString() !== normalizedId), resourceId],
        upvotes: nextUpvotes.filter((up) => up.toString() !== normalizedId),
      };
    });

    updateAlertInState(resourceId, (alert) =>
      applyOptimisticVote({
        issue: alert,
        userId: user?._id,
        voteType: "down",
        hasCurrentVote: hasDownvoted,
        hasOppositeVote: hasUpvoted,
      }),
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`,
        { reportId: resourceId, token, method: hasDownvoted ? "pull" : "push", resourceType: "govPost" },
      );
      if (res.status === 200 && res.data.success) {
        const nextUser = res.data.user || null;
        const nextResource = res.data.resource || null;

        if (nextUser) {
          setUser((prev) => ({ ...(prev || {}), ...nextUser }));
        }

        if (nextResource) {
          updateAlertInState(resourceId, (alert) => ({
            ...alert,
            upvotes: nextResource.upvotes || [],
            downvotes: nextResource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, upvotes: previousUserState.upvotes, downvotes: previousUserState.downvotes } : prev));
      if (previousAlert) {
        updateAlertInState(resourceId, (alert) => ({
          ...alert,
          upvotes: previousAlert.upvotes || [],
          downvotes: previousAlert.downvotes || [],
        }));
      }
      console.error(err);
    }
  };

  const handleCommentAdded = (alertId, comment) => {
    updateAlertInState(alertId, (alert) => ({
      ...alert,
      comments: [...(alert.comments || []), comment],
    }));
  };

  const handleCommentLiked = (alertId, updatedComment) => {
    updateAlertInState(alertId, (alert) => ({
      ...alert,
      comments: (alert.comments || []).map((comment) => (comment._id === updatedComment._id ? updatedComment : comment)),
    }));
  };

  const handleShared = (alertId) => {
    updateAlertInState(alertId, (alert) => ({
      ...alert,
      shares: (alert.shares || 0) + 1,
    }));
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

  const mergeUniqueItems = (existingItems = [], incomingItems = []) => {
    const seenIds = new Set(existingItems.map((item) => item?._id).filter(Boolean));
    const deduped = incomingItems.filter((item) => item?._id && !seenIds.has(item._id));
    return [...existingItems, ...deduped];
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
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onComment={setCommentReport}
              onShare={setShareReport}
              onInsights={setInsightsReport}
              statusBadge={statusBadge}
              timeAgo={timeAgo}
            />
          ))
        )}

        {loadingMore && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-x-accent" size={24} />
          </div>
        )}
      </div>

      <CommentSheet
        report={commentReport}
        open={!!commentReport}
        onClose={() => setCommentReport(null)}
        onCommentAdded={handleCommentAdded}
        onCommentLiked={handleCommentLiked}
        user={user}
        resourceType="govPost"
      />

      <InsightsSheet
        report={insightsReport}
        open={!!insightsReport}
        onClose={() => setInsightsReport(null)}
      />

      <ShareSheet
        report={shareReport}
        open={!!shareReport}
        onClose={() => setShareReport(null)}
        onShared={handleShared}
      />
    </div>
  );
};

export default Alerts;
