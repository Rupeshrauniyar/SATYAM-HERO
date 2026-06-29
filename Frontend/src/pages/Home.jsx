import { Loader2, MessageCircle, Search as SearchIcon, X } from "lucide-react";
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import { applyOptimisticVote } from "../utils/voteHelpers";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors rounded-full cursor-pointer ${
        active
          ? "bg-x-accent text-x-text-on-accent"
          : "text-x-text-secondary hover:text-x-text hover:bg-x-bg-hover"
      }`}
    >
      {label}
    </button>
  );
}

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sharedReportId = searchParams.get("report");

  const [feedTab, setFeedTab] = useState(FEED_TABS.PUBLIC);
  const [issues, setIssues] = useState([]);
  const [pinnedReport, setPinnedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [confirmIssue, setConfirmIssue] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, setUser } = useContext(AppContext);
  const sharedRef = useRef(null);
  const hasScrolled = useRef(false);
  const navigate = useNavigate();

  const commentReportId = searchParams.get("comments");
  const shareReportId = searchParams.get("share");
  const insightsReportId = searchParams.get("insights");

  const commentReport = commentReportId ? issues.find((i) => i._id === commentReportId) || pinnedReport : null;
  const shareReport = shareReportId ? issues.find((i) => i._id === shareReportId) || pinnedReport : null;
  const insightsReport = insightsReportId ? issues.find((i) => i._id === insightsReportId) || pinnedReport : null;

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

  const mergeUniqueItems = (existingItems = [], incomingItems = []) => {
    const seenIds = new Set(existingItems.map((item) => item?._id).filter(Boolean));
    const deduped = incomingItems.filter((item) => item?._id && !seenIds.has(item._id));
    return [...existingItems, ...deduped];
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
      setPage(1);
      setHasMore(true);
      try {
        const endpoint =
          feedTab === FEED_TABS.PUBLIC
            ? "/api/report/get"
            : "/api/gov/post/updates";

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}${endpoint}?page=1&limit=3`,
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
        setIssues(mergeUniqueItems([], reports));
        setHasMore(Boolean(response.data.hasMore));
      } catch (err) {
        console.error(err);
        setIssues([]);
        setPinnedReport(null);
        setHasMore(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 320;
      if (nearBottom) loadMoreReports();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, page, feedTab, sharedReportId]);

  const loadMoreReports = async () => {
    if (loadingMore || !hasMore || sharedReportId) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const endpoint =
        feedTab === FEED_TABS.PUBLIC ? "/api/report/get" : "/api/gov/post/updates";
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}?page=${nextPage}&limit=3`,
      );
      const moreReports = response.data.Reports || [];
      setIssues((prev) => mergeUniqueItems(prev, moreReports));
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
    setIssues((prev) => prev.map((issue) => (issue._id === reportId ? updater(issue) : issue)));
    setPinnedReport((prev) => (prev?._id === reportId ? updater(prev) : prev));
  };

  const handleUpvote = async (e, role) => {
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
        resourceType: role === "gov" ? "govPost" : "report",
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

  const handleDownvote = async (e, role) => {
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
        resourceType: role === "gov" ? "govPost" : "report",
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

  const statusBadge = (status) => {
    const map = { Pending: "x-badge-pending", Progress: "x-badge-progress", Resolved: "x-badge-resolved" };
    return map[status] || "x-badge-pending";
  };

  const feedProps = {
    user, feedTab, feedTabs: FEED_TABS, expanded,
    onToggleDescription: toggleDescription,
    timeAgo, statusBadge,
    onUpvote: handleUpvote, onDownvote: handleDownvote,
    onComment: setCommentReport, onShare: setShareReport, onInsights: setInsightsReport,
    ...(user && user.role === "gov" ? { onChangeStatus: handleStatusChange } : {}),
  };

  const showEmpty =
    !loading && !pinnedReport &&
    (sharedReportId ? otherReports.length === 0 : issues.length === 0);

  const showFeed =
    !loading && (pinnedReport || issues.length > 0 || otherReports.length > 0);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="x-feed-column">
      {/* ── Header ── */}
      <div className="sticky top-[-10px] z-10 bg-x-bg/90 backdrop-blur-md border-b border-x-border">
        {/* Title + tabs row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <h1 className="text-base font-semibold text-x-text">Home</h1>
          <div className="flex items-center gap-1 bg-x-bg-secondary rounded-full p-0.5 border border-x-border">
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
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="px-4 pb-3 pt-2">
          <div className={`flex items-center gap-2 rounded-full border bg-x-bg-secondary px-3 py-2 transition-colors ${searchFocused ? "border-x-accent" : "border-x-border"}`}>
            <SearchIcon size={15} className="text-x-text-secondary shrink-0" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search reports, wards, categories..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-x-text-secondary"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="text-x-text-secondary hover:text-x-text transition-colors"
              >
                <X size={14} />
              </button>
            )}
            {searchInput && (
              <button type="submit" className="x-btn x-btn-primary x-btn-sm text-xs py-1 px-3 shrink-0">
                Go
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Status change confirm modal ── */}
      {confirmIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmIssue(null)} />
          <div className="relative bg-x-bg-elevated rounded-2xl border border-x-border w-full max-w-sm p-5 animate-fadeIn">
            <h3 className="text-sm font-semibold mb-1">Confirm status change</h3>
            <p className="text-xs text-x-text-secondary mb-5">
              Set &ldquo;{confirmIssue.title}&rdquo; to <strong>{selectedStatus}</strong>?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmIssue(null)} className="x-btn x-btn-secondary x-btn-sm flex-1 text-xs">Cancel</button>
              <button onClick={saveStatusChange} className="x-btn x-btn-accent x-btn-sm flex-1 text-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feed body ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-x-accent" size={24} />
        </div>
      ) : showEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <MessageCircle size={36} className="text-x-text-secondary mb-3 opacity-40" strokeWidth={1.5} />
          <p className="text-sm font-medium text-x-text mb-1">
            {sharedReportId && !pinnedReport
              ? "Report not found"
              : feedTab === FEED_TABS.PUBLIC
                ? "No issues yet"
                : "No authority updates yet"}
          </p>
          <p className="text-xs text-x-text-secondary max-w-xs mb-5">
            {sharedReportId && !pinnedReport
              ? "This link may be invalid or the report was removed."
              : feedTab === FEED_TABS.PUBLIC
                ? "Be the first to report a civic issue in your community."
                : "Issues handled or updated by authorities will appear here."}
          </p>
          {feedTab === FEED_TABS.PUBLIC && !sharedReportId && (
            <Link to="/create" className="x-btn x-btn-primary x-btn-sm text-sm">
              Report an issue
            </Link>
          )}
        </div>
      ) : showFeed ? (
        <div className="divide-y divide-x-border">
          {pinnedReport && sharedReportId && (
            <ReportFeedItem {...feedProps} issue={pinnedReport} featured innerRef={sharedRef} />
          )}

          {sharedReportId && pinnedReport && otherReports.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="h-px flex-1 bg-x-border" />
              <span className="text-[11px] text-x-text-secondary font-medium">More reports</span>
              <div className="h-px flex-1 bg-x-border" />
            </div>
          )}

          {(sharedReportId ? otherReports : issues).map((issue) => (
            <ReportFeedItem key={issue._id} {...feedProps} issue={issue} />
          ))}

          {loadingMore && (
            <div className="flex justify-center py-5">
              <Loader2 className="animate-spin text-x-accent" size={20} />
            </div>
          )}

          {!hasMore && !loadingMore && issues.length > 0 && (
            <p className="text-center text-xs text-x-text-secondary py-5">
              You're all caught up
            </p>
          )}
        </div>
      ) : null}

      <CommentSheet
        report={commentReport}
        open={!!commentReport}
        onClose={() => setCommentReport(null)}
        onCommentAdded={handleCommentAdded}
        onCommentLiked={handleCommentLiked}
        user={user}
        resourceType={feedTab === FEED_TABS.AUTHORITY ? "govPost" : "report"}
      />
      <InsightsSheet report={insightsReport} open={!!insightsReport} onClose={() => setInsightsReport(null)} />
      <ShareSheet report={shareReport} open={!!shareReport} onClose={() => setShareReport(null)} onShared={handleShared} />
    </div>
  );
};

export default Home;