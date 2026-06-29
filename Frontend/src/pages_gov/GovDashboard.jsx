import { Loader2, LayoutDashboard } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { applyOptimisticVote } from "../utils/voteHelpers";
import { Link } from "react-router-dom";
import "../styles.css";
import ReportFeedItem from "../components/ReportFeedItem";
import CommentSheet from "../components/CommentSheet";
import InsightsSheet from "../components/InsightsSheet";
import ShareSheet from "../components/ShareSheet";
import { AppContext } from "../contexts/AppContext";

const GovDashboard = () => {
  const { user, setUser } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [issues, setIssues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [confirmIssue, setConfirmIssue] = useState(null);
  const statuses = ["Pending", "Progress", "Resolved"];
  const token = localStorage.getItem("token");

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
        if (response.status === 200) {
          if (response.data.Reports) setIssues(response.data.Reports);
          if (response.data.summary) setSummary(response.data.summary);
        }
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
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/updateReportStatus`,
        { status: selectedStatus, reportId: confirmIssue._id, token },
      );
      if (res.status === 200 && res.data.success && res.data.report) {
        updateIssueInState(confirmIssue._id, () => res.data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmIssue(null);
      setSelectedStatus(null);
    }
  };

  const handleUpvote = async (issueId, role) => {
    if (!user) return;

    const resourceId = issueId;
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
      const tokenValue = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
        { reportId: resourceId, token: tokenValue, method: hasUpvoted ? "pull" : "push", resourceType: role === "gov" ? "govPost" : "report" },
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
      console.error(err);
    }
  };

  const handleDownvote = async (issueId, role) => {
    if (!user) return;

    const resourceId = issueId;
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
      const tokenValue = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`,
        { reportId: resourceId, token: tokenValue, method: hasDownvoted ? "pull" : "push", resourceType: role === "gov" ? "govPost" : "report" },
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
          <div className="relative bg-x-bg-elevated rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
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
          <p className="text-xl font-bold">{summary?.totalHandled ?? issues.length}</p>
          <p className="text-xs text-x-text-secondary">Worked On</p>
        </div>
        {/* Upvotes/Downvotes removed — use detailed view for counts when needed */}
      </div>

      {!(issues.length > 0 || (summary && summary.totalHandled > 0)) ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <LayoutDashboard size={48} className="text-x-text-secondary mb-4" strokeWidth={1.25} />
          <h3 className="text-xl font-bold mb-2">No work yet</h3>
          <p className="text-x-text-secondary text-sm mb-6">Issues you manage will appear here.</p>
          <Link to="/gov" className="x-btn x-btn-primary">View Issues</Link>
        </div>
      ) : (
        issues.length > 0 ? (
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
        ) : (
          <div className="p-6 text-center text-x-text-secondary">You have worked on {summary?.totalHandled} items.</div>
        )
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
