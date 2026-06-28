import { Loader2, LayoutDashboard } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles.css";
import ReportFeedItem from "../components/ReportFeedItem";
import CommentSheet from "../components/CommentSheet";
import InsightsSheet from "../components/InsightsSheet";
import ShareSheet from "../components/ShareSheet";
import { AppContext } from "../contexts/AppContext";

const GovDashboard = () => {
  const { user, setUser } = useContext(AppContext);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [confirmIssue, setConfirmIssue] = useState(null);
  const [commentReport, setCommentReport] = useState(null);
  const [insightsReport, setInsightsReport] = useState(null);
  const [shareReport, setShareReport] = useState(null);
  const statuses = ["Pending", "Progress", "Resolved"];
  const token = localStorage.getItem("token");

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
          `${import.meta.env.VITE_BACKEND_URL}/api/gov/report/getMyWork`,
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

  const updateIssueInState = (issueId, updater) => {
    setIssues((prev) => prev.map((issue) => (issue._id === issueId ? updater(issue) : issue)));
  };

  const handleStatusChange = (issue, newStatus) => {
    setSelectedStatus(newStatus);
    setConfirmIssue(issue);
  };

  const saveStatusChange = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/updateReportStatus`,
        { status: selectedStatus, reportId: confirmIssue._id, token },
      );
      setIssues((prev) =>
        prev.map((i) =>
          i._id === confirmIssue._id ? { ...i, status: selectedStatus } : i,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmIssue(null);
      setSelectedStatus(null);
    }
  };

  const handleUpvote = async (issueId, role) => {
    if (!user) return;
    try {
      const tokenValue = localStorage.getItem("token");
      const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === issueId.toString());
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
        { reportId: issueId, token: tokenValue, method: hasUpvoted ? "pull" : "push", resourceType: role === "gov" ? "govPost" : "report" },
      );
      if (res.status === 200 && res.data.success) {
        if (!hasUpvoted) {
          setUser((prev) => ({ ...prev, upvotes: [...(prev.upvotes || []), issueId], downvotes: (prev.downvotes || []).filter((down) => down !== issueId) }));
          updateIssueInState(issueId, (issue) => ({ ...issue, upvotes: [...(issue.upvotes || []), user._id], downvotes: (issue.downvotes || []).filter((d) => d !== user._id) }));
        } else {
          setUser((prev) => ({ ...prev, upvotes: (prev.upvotes || []).filter((up) => up !== issueId) }));
          updateIssueInState(issueId, (issue) => ({ ...issue, upvotes: (issue.upvotes || []).filter((id) => id !== user._id) }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownvote = async (issueId, role) => {
    if (!user) return;
    try {
      const tokenValue = localStorage.getItem("token");
      const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === issueId.toString());
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`,
        { reportId: issueId, token: tokenValue, method: hasDownvoted ? "pull" : "push", resourceType: role === "gov" ? "govPost" : "report" },
      );
      if (res.status === 200 && res.data.success) {
        if (!hasDownvoted) {
          setUser((prev) => ({ ...prev, downvotes: [...(prev.downvotes || []), issueId], upvotes: (prev.upvotes || []).filter((up) => up !== issueId) }));
          updateIssueInState(issueId, (issue) => ({ ...issue, downvotes: [...(issue.downvotes || []), user._id], upvotes: (issue.upvotes || []).filter((u) => u !== user._id) }));
        } else {
          setUser((prev) => ({ ...prev, downvotes: (prev.downvotes || []).filter((down) => down !== issueId) }));
          updateIssueInState(issueId, (issue) => ({ ...issue, downvotes: (issue.downvotes || []).filter((id) => id !== user._id) }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentAdded = (issueId, comment) => {
    updateIssueInState(issueId, (issue) => ({ ...issue, comments: [...(issue.comments || []), comment] }));
  };

  const handleCommentLiked = (issueId, updatedComment) => {
    updateIssueInState(issueId, (issue) => ({ ...issue, comments: (issue.comments || []).map((comment) => (comment._id === updatedComment._id ? updatedComment : comment)) }));
  };

  const handleShared = (issueId) => {
    updateIssueInState(issueId, (issue) => ({ ...issue, shares: (issue.shares || 0) + 1 }));
  };

  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-x-accent" size={28} />
      </div>
    );

  return (
    <div>
      <div className="x-page-header"><h1>My Work</h1></div>

      {confirmIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmIssue(null)} />
          <div className="relative bg-x-bg rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
            <h3 className="text-lg font-bold mb-2">Confirm status change</h3>
            <p className="text-sm text-x-text-secondary mb-6">
              Change &ldquo;{confirmIssue.title}&rdquo; to <strong>{selectedStatus}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmIssue(null)} className="x-btn x-btn-secondary flex-1">Cancel</button>
              <button onClick={saveStatusChange} className="x-btn x-btn-accent flex-1">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 grid grid-cols-3 gap-2 border-b border-x-border">
        <div className="x-panel text-center py-3">
          <p className="text-xl font-bold">{issues.length}</p>
          <p className="text-xs text-x-text-secondary">Worked On</p>
        </div>
        {/* <div className="x-panel text-center py-3">
          <p className="text-xl font-bold text-x-accent">
            {issues.reduce((s, i) => s + i.upvotes.length, 0)}
          </p>
          <p className="text-xs text-x-text-secondary">Upvotes</p>
        </div> */}
        {/* <div className="x-panel text-center py-3">
          <p className="text-xl font-bold">
            {issues.reduce((s, i) => s + i.downvotes.length, 0)}
          </p>
          <p className="text-xs text-x-text-secondary">Downvotes</p>
        </div> */}
      </div>

      {issues.length < 1 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <LayoutDashboard size={48} className="text-x-text-secondary mb-4" strokeWidth={1.25} />
          <h3 className="text-xl font-bold mb-2">No work yet</h3>
          <p className="text-x-text-secondary text-sm mb-6">Issues you manage will appear here.</p>
          <Link to="/gov" className="x-btn x-btn-primary">View Issues</Link>
        </div>
      ) : (
        issues.map((issue) => (
          <ReportFeedItem
            key={issue._id}
            issue={issue}
            user={user}
            feedTab="authority"
            feedTabs={{ PUBLIC: "public", AUTHORITY: "authority" }}
            expanded={expanded}
            onToggleDescription={toggleDescription}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onComment={setCommentReport}
            onShare={setShareReport}
            onInsights={setInsightsReport}
            onChangeStatus={handleStatusChange}
            timeAgo={timeAgo}
            statusBadge={() => "x-badge-progress"}
          />
        ))
      )}

      <CommentSheet
        report={commentReport}
        open={!!commentReport}
        onClose={() => setCommentReport(null)}
        onCommentAdded={handleCommentAdded}
        onCommentLiked={handleCommentLiked}
        user={user}
        resourceType="report"
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

export default GovDashboard;
