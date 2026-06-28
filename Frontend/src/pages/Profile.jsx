import React, { useContext,useState,useEffect} from "react";
import { AppContext } from "../contexts/AppContext";
import {
  CheckCircle,
  XCircle,
  Trash,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReportFeedItem from "../components/ReportFeedItem";
import CommentSheet from "../components/CommentSheet";
import InsightsSheet from "../components/InsightsSheet";
import ShareSheet from "../components/ShareSheet";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "../styles.css";
import { Pagination } from "swiper/modules";
export default function Profile() {
  const { user, setUser } = useContext(AppContext);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32 text-x-text-secondary">
        Loading profile...
      </div>
    );
  }
  const [issues, setIssues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [commentReport, setCommentReport] = useState(null);
  const [insightsReport, setInsightsReport] = useState(null);
  const [shareReport, setShareReport] = useState(null);
  const token = localStorage.getItem("token");
  const FEED_TABS = { PUBLIC: "public", AUTHORITY: "authority" };

  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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

  useEffect(() => {
    const getReport = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/getMy?recent=1`,
          { token },
        );
        if (response.status === 200) {
          if (response.data.reports) setIssues(response.data.reports);
          else if (response.data.Reports) setIssues(response.data.Reports);
          else if (response.data.recent) setIssues(response.data.recent);
          if (response.data.summary) setSummary(response.data.summary);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    getReport();
  }, []);

  const updateIssueInState = (reportId, updater) => {
    setIssues((prev) => prev.map((issue) => (issue._id === reportId ? updater(issue) : issue)));
  };

  const handleUpvote = async (e) => {
    if (!user) return;

    const resourceId = e;
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const previousUserState = {
      upvotes: user?.upvotes || [],
      downvotes: user?.downvotes || [],
    };
    const previousIssue = issues.find((issue) => issue._id === resourceId);

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

    updateIssueInState(resourceId, (issue) =>
      applyOptimisticVote({
        issue,
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
        { reportId: resourceId, token, method: hasUpvoted ? "pull" : "push" },
      );

      if (res.status === 200 && res.data.success) {
        const nextUser = res.data.user || null;
        const nextResource = res.data.resource || null;

        if (nextUser) {
          setUser((prev) => ({ ...(prev || {}), ...nextUser }));
        }

        if (nextResource) {
          updateIssueInState(resourceId, (issue) => ({
            ...issue,
            upvotes: nextResource.upvotes || [],
            downvotes: nextResource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, upvotes: previousUserState.upvotes, downvotes: previousUserState.downvotes } : prev));
      if (previousIssue) {
        updateIssueInState(resourceId, (issue) => ({
          ...issue,
          upvotes: previousIssue.upvotes || [],
          downvotes: previousIssue.downvotes || [],
        }));
      }
      console.log(err);
    }
  };

  const handleDownvote = async (e) => {
    if (!user) return;

    const resourceId = e;
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const previousUserState = {
      upvotes: user?.upvotes || [],
      downvotes: user?.downvotes || [],
    };
    const previousIssue = issues.find((issue) => issue._id === resourceId);

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

    updateIssueInState(resourceId, (issue) =>
      applyOptimisticVote({
        issue,
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
        { reportId: resourceId, token, method: hasDownvoted ? "pull" : "push" },
      );

      if (res.status === 200 && res.data.success) {
        const nextUser = res.data.user || null;
        const nextResource = res.data.resource || null;

        if (nextUser) {
          setUser((prev) => ({ ...(prev || {}), ...nextUser }));
        }

        if (nextResource) {
          updateIssueInState(resourceId, (issue) => ({
            ...issue,
            upvotes: nextResource.upvotes || [],
            downvotes: nextResource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, upvotes: previousUserState.upvotes, downvotes: previousUserState.downvotes } : prev));
      if (previousIssue) {
        updateIssueInState(resourceId, (issue) => ({
          ...issue,
          upvotes: previousIssue.upvotes || [],
          downvotes: previousIssue.downvotes || [],
        }));
      }
      console.log(err);
    }
  };

  const handleShared = (reportId) => {
    updateIssueInState(reportId, (i) => ({ ...i, shares: (i.shares || 0) + 1 }));
  };

  const handleCommentAdded = (reportId, comment) => {
    updateIssueInState(reportId, (issue) => ({ ...issue, comments: [...(issue.comments || []), comment] }));
  };

  const handleCommentLiked = (reportId, updatedComment) => {
    updateIssueInState(reportId, (issue) => ({ ...issue, comments: (issue.comments || []).map((c) => (c._id === updatedComment._id ? updatedComment : c)) }));
  };

  const handleDelete = async (reportId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/delete`,
        { reportId, token },
      );
      if (response.status === 200) {
        setIssues((prev) => prev.filter((r) => r._id !== reportId));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const totalReports = summary?.totalReports ?? user.reports?.length ?? issues.length ?? 0;
  const totalUpvotes = summary?.upvotes ?? issues.reduce((sum, i) => sum + (Array.isArray(i.upvotes) ? i.upvotes.length : i.upvotesCount || 0), 0);
  const totalDownvotes = summary?.downvotes ?? issues.reduce((sum, i) => sum + (Array.isArray(i.downvotes) ? i.downvotes.length : i.downvotesCount || 0), 0);
  const displayName = (user?.name || "").trim() || (user?.phone_number ? `User ${user.phone_number.slice(-4)}` : "User");
  const displayInitial = displayName.charAt(0).toUpperCase();

  const formattedDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="pb-6">
      <div className="px-4 pt-2">
        <div className="x-panel p-4">
          <div className="flex items-center gap-3">
            <div className="x-avatar x-avatar-lg w-16 h-16 text-xl border-2 border-x-bg shrink-0">
              {displayInitial}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{displayName}</h1>
              <p className="text-sm text-x-text-secondary">
                {user.phone_number ? `+977 ${user.phone_number}` : "No phone number"}
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-x-text-secondary">
                {user.verified ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>{user.verified ? "Verified" : "Unverified"}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatCard label="Reports" value={totalReports} icon={<LayoutDashboard size={15} />} />
            <StatCard label="Upvotes" value={totalUpvotes} icon={<TrendingUp size={15} />} />
            <StatCard label="Downvotes" value={totalDownvotes} icon={<MessageSquare size={15} />} />
          </div>
        </div>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative bg-x-bg rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
              <h3 className="text-lg font-bold mb-2">Delete report?</h3>
              <p className="text-sm text-x-text-secondary mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="x-btn x-btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  className="x-btn x-btn-primary flex-1 !bg-red-500 hover:!bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        
        <CommentSheet
          report={commentReport}
          open={!!commentReport}
          onClose={() => setCommentReport(null)}
          onCommentAdded={handleCommentAdded}
          onCommentLiked={handleCommentLiked}
          user={user}
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


<div className="mt-5 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-base font-semibold">Your reports</h2>
          <p className="text-sm text-x-text-secondary">Recent issues you shared</p>
        </div>
        <span className="text-sm text-x-text-secondary">{issues.length}</span>
      </div>
        {issues.length < 1 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <LayoutDashboard
              size={48}
              className="text-x-text-secondary mb-4"
              strokeWidth={1.25}
            />
            <h3 className="text-xl font-bold mb-2">No reports yet</h3>
            <p className="text-x-text-secondary text-sm mb-6">
              Your submitted issues will appear here.
            </p>
            <Link to="/create" className="x-btn x-btn-primary">
              Report an Issue
            </Link>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue._id} className="relative">
              <ReportFeedItem
                issue={issue}
                user={user}
                feedTab={FEED_TABS.PUBLIC}
                feedTabs={FEED_TABS}
                expanded={expanded}
                onToggleDescription={toggleDescription}
                timeAgo={timeAgo}
                statusBadge={(s) => {
                  const map = { Pending: "x-badge-pending", Progress: "x-badge-progress", Resolved: "x-badge-resolved" };
                  return map[s] || "x-badge-pending";
                }}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onComment={setCommentReport}
                onShare={setShareReport}
                onInsights={setInsightsReport}
              />

              <button
                onClick={() => setDeleteTarget(issue._id)}
                className="absolute top-3 right-3 x-btn-ghost text-red-500"
                title="Delete"
              >
                <Trash size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-x-border bg-x-bg-secondary px-2 py-3 text-center">
      <div className="flex justify-center text-x-accent mb-1">{icon}</div>
      <p className="text-base font-semibold">{value}</p>
      <p className="text-[11px] text-x-text-secondary">{label}</p>
    </div>
  );
}
