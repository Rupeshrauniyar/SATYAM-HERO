import { Loader2, MessageCircle } from "lucide-react";
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import { Link, useSearchParams } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";
import "../styles.css";
import CommentSheet from "../components/CommentSheet";
import InsightsSheet from "../components/InsightsSheet";
import ShareSheet from "../components/ShareSheet";
import ReportFeedItem from "../components/ReportFeedItem";

const FEED_TABS = {
  PUBLIC: "public",
  AUTHORITY: "authority",
};

function FeedTab({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 relative py-3 text-[0.9375rem] font-medium transition-colors hover:bg-x-bg-hover cursor-pointer ${
        active ? "text-x-text font-bold" : "text-x-text-secondary"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-x-accent" />
      )}
    </button>
  );
}

const Home = () => {
  const [searchParams] = useSearchParams();
  const sharedReportId = searchParams.get("report");

  const [feedTab, setFeedTab] = useState(FEED_TABS.PUBLIC);
  const [issues, setIssues] = useState([]);
  const [pinnedReport, setPinnedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [confirmIssue, setConfirmIssue] = useState(null);
  const [commentReport, setCommentReport] = useState(null);
  const [insightsReport, setInsightsReport] = useState(null);
  const [shareReport, setShareReport] = useState(null);
  const { user, setUser } = useContext(AppContext);
  const sharedRef = useRef(null);
  const hasScrolled = useRef(false);

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
    if (sharedReportId) {
      setFeedTab(FEED_TABS.PUBLIC);
      setExpanded((prev) => ({ ...prev, [sharedReportId]: true }));
      hasScrolled.current = false;
    }
  }, [sharedReportId]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const endpoint =
          feedTab === FEED_TABS.PUBLIC
            ? "/api/report/get"
            : "/api/gov/post/updates";

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        );

        let reports = response.data.Reports || [];
        let pinned = null;

        if (sharedReportId) {
          pinned = reports.find((r) => r._id === sharedReportId) || null;

          if (!pinned) {
            try {
              const single = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/report/single/${sharedReportId}`,
              );
              if (single.data.success && single.data.Report) {
                pinned = single.data.Report;
              }
            } catch (err) {
              console.error(err);
            }
          }
        }

        setPinnedReport(pinned);
        setIssues(reports);
      } catch (err) {
        console.error(err);
        setIssues([]);
        setPinnedReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [feedTab, sharedReportId]);

  const otherReports = useMemo(() => {
    if (!sharedReportId) return issues;
    return issues.filter((r) => r._id !== sharedReportId);
  }, [issues, sharedReportId]);

  useEffect(() => {
    if (!loading && pinnedReport && sharedReportId && !hasScrolled.current) {
      hasScrolled.current = true;
      requestAnimationFrame(() => {
        sharedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [loading, pinnedReport, sharedReportId]);

  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusChange = (issue, newStatus) => {
    setSelectedStatus(newStatus);
    setConfirmIssue(issue);
  };

  const saveStatusChange = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/updateReportStatus`,
        { status: selectedStatus, reportId: confirmIssue._id, token },
      );
      updateIssueInState(confirmIssue._id, (issue) => ({
        ...issue,
        status: selectedStatus,
        changer: { name: (user && user.name) || "Government" },
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setConfirmIssue(null);
      setSelectedStatus(null);
    }
  };

  const updateIssueInState = (reportId, updater) => {
    setIssues((prev) =>
      prev.map((issue) => (issue._id === reportId ? updater(issue) : issue)),
    );
    setPinnedReport((prev) =>
      prev?._id === reportId ? updater(prev) : prev,
    );
  };

  const handleUpvote = async (e) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const hasUpvoted = (user.upvotes || []).some(
        (up) => up.toString() === e.toString(),
      );

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
          setUser((prev) => ({
            ...prev,
            upvotes: prev.upvotes.filter((up) => up !== e),
          }));
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
      const hasDownvoted = (user.downvotes || []).some(
        (down) => down.toString() === e.toString(),
      );

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
          setUser((prev) => ({
            ...prev,
            downvotes: prev.downvotes.filter((down) => down !== e),
          }));
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
    updateIssueInState(reportId, (i) => ({
      ...i,
      shares: (i.shares || 0) + 1,
    }));
  };

  const handleCommentAdded = (reportId, comment) => {
    updateIssueInState(reportId, (issue) => ({
      ...issue,
      comments: [...(issue.comments || []), comment],
    }));
  };

  const handleCommentLiked = (reportId, updatedComment) => {
    updateIssueInState(reportId, (issue) => ({
      ...issue,
      comments: (issue.comments || []).map((c) =>
        c._id === updatedComment._id ? updatedComment : c,
      ),
    }));
  };

  const statusBadge = (status) => {
    const map = {
      Pending: "x-badge-pending",
      Progress: "x-badge-progress",
      Resolved: "x-badge-resolved",
    };
    return map[status] || "x-badge-pending";
  };

  const feedProps = {
    user,
    feedTab,
    feedTabs: FEED_TABS,
    expanded,
    onToggleDescription: toggleDescription,
    timeAgo,
    statusBadge,
    ...(feedTab === FEED_TABS.PUBLIC
      ? {
          onUpvote: handleUpvote,
          onDownvote: handleDownvote,
          onComment: setCommentReport,
          onShare: setShareReport,
          onInsights: setInsightsReport,
          ...(user && user.role === "gov" ? { onChangeStatus: handleStatusChange } : {}),
        }
      : {}),
  };

  const showEmpty =
    !loading &&
    !pinnedReport &&
    (sharedReportId ? otherReports.length === 0 : issues.length === 0);

  const showFeed =
    !loading && (pinnedReport || issues.length > 0 || otherReports.length > 0);

  return (
    <div className="x-feed-column">
      <div className="x-page-header">
        <h1>Home</h1>
      </div>

      <div className="x-feed-tabs">
        <FeedTab
          active={feedTab === FEED_TABS.PUBLIC}
          label="Public"
          onClick={() => setFeedTab(FEED_TABS.PUBLIC)}
        />
        <FeedTab
          active={feedTab === FEED_TABS.AUTHORITY}
          label="Authority"
          onClick={() => setFeedTab(FEED_TABS.AUTHORITY)}
        />
      </div>

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

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-x-accent" size={28} />
        </div>
      ) : showEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <MessageCircle
            size={48}
            className="text-x-text-secondary mb-4"
            strokeWidth={1.25}
          />
          <h3 className="text-xl font-bold mb-2">
            {sharedReportId && !pinnedReport
              ? "Shared report not found"
              : feedTab === FEED_TABS.PUBLIC
                ? "No issues reported yet"
                : "No authority updates yet"}
          </h3>
          <p className="text-x-text-secondary text-sm mb-6 max-w-xs">
            {sharedReportId && !pinnedReport
              ? "This link may be invalid or the report was removed."
              : feedTab === FEED_TABS.PUBLIC
                ? "Be the first to report a civic issue in your community."
                : "Issues handled or updated by authorities will appear here."}
          </p>
          {feedTab === FEED_TABS.PUBLIC && !sharedReportId && (
            <Link to="/create" className="x-btn x-btn-primary">
              Report an Issue
            </Link>
          )}
        </div>
      ) : showFeed ? (
        <>
          {pinnedReport && sharedReportId && (
            <ReportFeedItem
              {...feedProps}
              issue={pinnedReport}
              featured
              innerRef={sharedRef}
            />
          )}

          {sharedReportId && pinnedReport && otherReports.length > 0 && (
            <div className="x-feed-divider">
              <span>More reports</span>
            </div>
          )}

          {(sharedReportId ? otherReports : issues).map((issue) => (
            <ReportFeedItem key={issue._id} {...feedProps} issue={issue} />
          ))}
        </>
      ) : null}

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
    </div>
  );
};

export default Home;
