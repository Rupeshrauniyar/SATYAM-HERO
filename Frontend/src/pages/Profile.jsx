import React, { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import {
  CheckCircle,
  XCircle,
  Trash,
  LayoutDashboard,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReportFeedItem from "../components/ReportFeedItem";
import CommentSheet from "../components/CommentSheet";
import InsightsSheet from "../components/InsightsSheet";
import ShareSheet from "../components/ShareSheet";
import Avatar from "../components/Avatar";
import { applyOptimisticVote } from "../utils/voteHelpers";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "../styles.css";
import { Pagination } from "swiper/modules";

export default function Profile() {
  const { user, setUser } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32 text-x-text-secondary text-sm">
        Loading profile...
      </div>
    );
  }

  const [issues, setIssues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const token = localStorage.getItem("token");
  const FEED_TABS = { PUBLIC: "public", AUTHORITY: "authority" };

  const commentReportId = searchParams.get("comments");
  const shareReportId = searchParams.get("share");
  const insightsReportId = searchParams.get("insights");

  const commentReport = commentReportId ? issues.find((i) => i._id === commentReportId) : null;
  const shareReport = shareReportId ? issues.find((i) => i._id === shareReportId) : null;
  const insightsReport = insightsReportId ? issues.find((i) => i._id === insightsReportId) : null;

  const setCommentReport = (report) => {
    if (report?._id) {
      setSearchParams((prev) => { prev.set("comments", report._id); return prev; });
    } else {
      setSearchParams((prev) => { prev.delete("comments"); return prev; });
    }
  };

  const setShareReport = (report) => {
    if (report?._id) {
      setSearchParams((prev) => { prev.set("share", report._id); return prev; });
    } else {
      setSearchParams((prev) => { prev.delete("share"); return prev; });
    }
  };

  const setInsightsReport = (report) => {
    if (report?._id) {
      setSearchParams((prev) => { prev.set("insights", report._id); return prev; });
    } else {
      setSearchParams((prev) => { prev.delete("insights"); return prev; });
    }
  };

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
    const previousUserState = { upvotes: user?.upvotes || [], downvotes: user?.downvotes || [] };
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
      applyOptimisticVote({ issue, userId: user?._id, voteType: "up", hasCurrentVote: hasUpvoted, hasOppositeVote: hasDownvoted }),
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`, {
        reportId: resourceId, token, method: hasUpvoted ? "pull" : "push",
      });
      if (res.status === 200 && res.data.success) {
        if (res.data.user) setUser((prev) => ({ ...(prev || {}), ...res.data.user }));
        if (res.data.resource) {
          updateIssueInState(resourceId, (issue) => ({
            ...issue, upvotes: res.data.resource.upvotes || [], downvotes: res.data.resource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, ...previousUserState } : prev));
      if (previousIssue) updateIssueInState(resourceId, () => previousIssue);
    }
  };

  const handleDownvote = async (e) => {
    if (!user) return;
    const resourceId = e;
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const previousUserState = { upvotes: user?.upvotes || [], downvotes: user?.downvotes || [] };
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
      applyOptimisticVote({ issue, userId: user?._id, voteType: "down", hasCurrentVote: hasDownvoted, hasOppositeVote: hasUpvoted }),
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`, {
        reportId: resourceId, token, method: hasDownvoted ? "pull" : "push",
      });
      if (res.status === 200 && res.data.success) {
        if (res.data.user) setUser((prev) => ({ ...(prev || {}), ...res.data.user }));
        if (res.data.resource) {
          updateIssueInState(resourceId, (issue) => ({
            ...issue, upvotes: res.data.resource.upvotes || [], downvotes: res.data.resource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, ...previousUserState } : prev));
      if (previousIssue) updateIssueInState(resourceId, () => previousIssue);
    }
  };

  const handleShared = (reportId) => {
    updateIssueInState(reportId, (i) => ({ ...i, shares: (i.shares || 0) + 1 }));
  };

  const handleCommentAdded = (reportId, comment) => {
    updateIssueInState(reportId, (issue) => ({ ...issue, comments: [...(issue.comments || []), comment] }));
  };

  const handleCommentLiked = (reportId, updatedComment) => {
    updateIssueInState(reportId, (issue) => ({
      ...issue,
      comments: (issue.comments || []).map((c) => (c._id === updatedComment._id ? updatedComment : c)),
    }));
  };

  const handleDelete = async (reportId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/report/delete`, { reportId, token });
      if (response.status === 200) setIssues((prev) => prev.filter((r) => r._id !== reportId));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

    const totalReports = user?.reports?.length;
  const totalUpvotes =  user?.upvotes?.length 
  const totalDownvotes = user?.downvotes?.length
  const displayName = (user?.name || "").trim() || (user?.phone_number ? `User ${user.phone_number.slice(-4)}` : "User");

  return (
    <div className="bg-x-bg p-2 pb-10 pt-4 lg:px-6 max-w-6xl mx-auto">

      <div className=" lg:rounded-xl lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.profilePicture || user.profile_picture}
              label={displayName}
              className="w-16 h-16 text-xl border-2 border-x-border shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xl font-semibold text-x-text truncate">{displayName}</p>
              <p className="text-sm text-x-text-secondary mt-1">
                {user.phone_number ? `+977 ${user.phone_number}` : "No phone number"}
              </p>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${user.verified ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {user.verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {user.verified ? "Verified" : "Unverified"}
              </div>
            </div>
          </div>

          <Link to={user?.role === "gov" ? "/gov/profile/edit" : "/profile/edit"} className="x-btn x-btn-primary x-btn-sm h-fit">
            Edit profile
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatItem icon={<LayoutDashboard size={16} />} label="Reports" value={totalReports} />
          <StatItem icon={<ThumbsUp size={16} />} label="Upvotes" value={totalUpvotes} />
          <StatItem icon={<ThumbsDown size={16} />} label="Downvotes" value={totalDownvotes} />
        </div>
      </div>

      <div className="mt-6 ">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-x-text">Your reports</h2>
            <p className="text-sm text-x-text-secondary">Track your recent issues and community engagement.</p>
          </div>
          <span className="rounded-3xl bg-x-bg-secondary px-4 py-2 text-sm font-medium text-x-text-secondary">
            {issues.length} report{issues.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="mt-4 grid gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-[1.5rem] border border-x-border bg-x-bg-secondary p-4 h-28" />
            ))}
          </div>
        ) : issues.length < 1 ? (
          <div className="mt-4 rounded-[1.5rem] border border-dashed border-x-border bg-x-bg-secondary p-8 text-center">
            <LayoutDashboard size={32} className="mx-auto mb-4 text-x-text-secondary opacity-50" />
            <p className="text-base font-semibold text-x-text">No reports yet</p>
            <p className="mt-2 text-sm text-x-text-secondary max-w-sm mx-auto">
              Start reporting your civic issues and see the impact in your profile.
            </p>
            <Link to="/create" className="mt-5 inline-flex rounded-full bg-x-accent px-5 py-2 text-sm font-semibold text-x-text-on-accent shadow-sm hover:opacity-95">
              Report an issue
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="rounded-[1.5rem] border border-x-border bg-white/95 p-4 shadow-sm">
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
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  <Trash size={13} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[var(--color-x-bg-elevated)] text-x-text rounded-2xl border border-x-border shadow-2xl shadow-black/20 w-full max-w-sm p-5 animate-fadeIn">
            <h3 className="text-sm font-semibold mb-1">Delete this report?</h3>
            <p className="text-xs text-x-text-secondary mb-5">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="x-btn x-btn-secondary x-btn-sm flex-1 text-xs">
                Cancel
              </button>
              <button
                onClick={() => { handleDelete(deleteTarget); setDeleteTarget(null); }}
                className="x-btn x-btn-primary x-btn-sm flex-1 text-xs !bg-red-500 hover:!bg-red-600"
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
      <InsightsSheet report={insightsReport} open={!!insightsReport} onClose={() => setInsightsReport(null)} />
      <ShareSheet report={shareReport} open={!!shareReport} onClose={() => setShareReport(null)} onShared={handleShared} />
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div style={{
      background: "var(--surface-1)",
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <div className="flex-shrink-0 w-[30px] h-[30px] rounded-lg bg-x-bg-accent flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[17px] font-medium leading-tight text-x-text">{value ?? 0}</p>
        <p className="text-[11px] text-x-text-secondary mt-0.5">{label}</p>
      </div>
    </div>
  );
}