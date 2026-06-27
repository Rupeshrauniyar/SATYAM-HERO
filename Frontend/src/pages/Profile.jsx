import React, { useContext,useState,useEffect} from "react";
import { AppContext } from "../contexts/AppContext";
import {
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Trash,
  LayoutDashboard 
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
          `${import.meta.env.VITE_BACKEND_URL}/api/report/getMy`,
          { token },
        );
        if (response.status === 200 && response.data.Reports)
          setIssues(response.data.Reports);
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
    try {
      const token = localStorage.getItem("token");
      const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === e.toString());

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
        { reportId: e, token, method: hasUpvoted ? "pull" : "push" },
      );

      if (res.status === 200 && res.data.success) {
        if (!hasUpvoted) {
          setUser((prev) => ({
            ...prev,
            upvotes: [...prev.upvotes, e],
            downvotes: prev.downvotes.filter((down) => down !== e),
          }));
          updateIssueInState(e, (issue) => ({
            ...issue,
            upvotes: [...(issue.upvotes || []), user._id],
            downvotes: (issue.downvotes || []).filter((d) => d !== user._id),
          }));
        } else {
          setUser((prev) => ({ ...prev, upvotes: prev.upvotes.filter((up) => up !== e) }));
          updateIssueInState(e, (issue) => ({
            ...issue,
            upvotes: (issue.upvotes || []).filter((id) => id !== user._id),
          }));
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownvote = async (e) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === e.toString());

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`,
        { reportId: e, token, method: hasDownvoted ? "pull" : "push" },
      );

      if (res.status === 200 && res.data.success) {
        if (!hasDownvoted) {
          setUser((prev) => ({
            ...prev,
            downvotes: [...prev.downvotes, e],
            upvotes: prev.upvotes.filter((up) => up !== e),
          }));
          updateIssueInState(e, (issue) => ({
            ...issue,
            downvotes: [...(issue.downvotes || []), user._id],
            upvotes: (issue.upvotes || []).filter((u) => u !== user._id),
          }));
        } else {
          setUser((prev) => ({ ...prev, downvotes: prev.downvotes.filter((down) => down !== e) }));
          updateIssueInState(e, (issue) => ({
            ...issue,
            downvotes: (issue.downvotes || []).filter((id) => id !== user._id),
          }));
        }
      }
    } catch (err) {
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

  const totalReports = issues.length || 1;
  const totalUpvotes = issues.reduce((sum, i) => sum + i.upvotes.length, 0);
  const totalDownvotes = issues.reduce((sum, i) => sum + i.downvotes.length, 0);

  const formattedDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div>
      {/* Banner */}
      <div className="h-32 bg-x-bg-secondary border-b border-x-border" />

      <div className="px-4 pb-6">
        <div className="flex justify-between items-end -mt-12 mb-4">
          <div className="x-avatar x-avatar-lg w-24 h-24 text-3xl border-4 border-x-bg">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>

        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-x-text-secondary text-sm">
          +977 {user.phone_number}
        </p>

        <div className="flex items-center gap-2 mt-2">
          {user.verified ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-x-text-secondary">
            {user.verified ? "Verified account" : "Unverified account"}
          </span>
        </div>

        {/* Stats row — X style */}
        <div className="flex gap-5 mt-4 text-sm">
          <StatInline label="Reports" value={user.reports?.length || 0} />
          <StatInline label="Upvotes" value={user.upvotes.length} />
          <StatInline label="Downvotes" value={user.downvotes.length} />
        </div>

        <div className="mt-6 space-y-3">
          <div className="x-panel">
            <h2 className="font-bold mb-3">Account Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Detail label="Joined" value={formattedDate(user.createdAt)} />
              <Detail
                label="Last updated"
                value={formattedDate(user.updatedAt)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard
              icon={<ThumbsUp size={18} />}
              label="Upvotes"
              value={user.upvotes.length}
            />
            <StatCard
              icon={<ThumbsDown size={18} />}
              label="Downvotes"
              value={user.downvotes.length}
            />
            <StatCard
              icon={<FileText size={18} />}
              label="Reports"
              value={user.reports?.length || 0}
            />
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

function StatInline({ label, value }) {
  return (
    <span>
      <strong className="text-x-text">{value}</strong>{" "}
      <span className="text-x-text-secondary">{label}</span>
    </span>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="x-panel text-center py-4">
      <div className="flex justify-center text-x-text-secondary mb-1">
        {icon}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-x-text-secondary">{label}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-x-text-secondary text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
