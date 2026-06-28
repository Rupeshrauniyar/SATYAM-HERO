import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { AppContext } from "../contexts/AppContext";
import ReportFeedItem from "../components/ReportFeedItem";
import CommentSheet from "../components/CommentSheet";
import InsightsSheet from "../components/InsightsSheet";
import ShareSheet from "../components/ShareSheet";

const FEED_TABS = {
  AUTHORITY: "authority",
  ALERTS: "alerts",
};

function FeedTab({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
        active ? "bg-x-accent text-x-text-on-accent" : "bg-x-bg-secondary text-x-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export default function GovProfile() {
  const { user, setUser } = useContext(AppContext);
  const [feedTab, setFeedTab] = useState(user?.role === "gov" ? FEED_TABS.AUTHORITY : FEED_TABS.ALERTS);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [commentReport, setCommentReport] = useState(null);
  const [insightsReport, setInsightsReport] = useState(null);
  const [shareReport, setShareReport] = useState(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32 text-x-text-secondary">
        Loading profile...
      </div>
    );
  }

  const formattedDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filterByAuthor = (items = []) => {
    const currentId = user?._id?.toString();
    return items.filter((item) => {
      const authorId = item.authorId?._id || item.authorId || item.userId?._id || item.userId;
      return !currentId || authorId?.toString() === currentId;
    });
  };

  useEffect(() => {
    if (!user) return;
    setFeedTab(user.role === "gov" ? FEED_TABS.AUTHORITY : FEED_TABS.ALERTS);
  }, [user?.role]);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      try {
        const endpoint = feedTab === FEED_TABS.AUTHORITY ? "/api/gov/post/updates" : "/api/gov/post/alerts";
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}?page=1&limit=3`);
        const items = feedTab === FEED_TABS.AUTHORITY ? response.data.Reports || [] : response.data.reports || [];
        setPosts(items);
        setHasMore(Boolean(response.data.hasMore));
      } catch (err) {
        console.error(err);
        setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [feedTab, user?._id]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 320;
      if (nearBottom) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, page, feedTab, user?._id]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const endpoint = feedTab === FEED_TABS.AUTHORITY ? "/api/gov/post/updates" : "/api/gov/post/alerts";
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}?page=${nextPage}&limit=3`);
      const items = feedTab === FEED_TABS.AUTHORITY ? response.data.Reports || [] : response.data.reports || [];
      setPosts((prev) => [...prev, ...filterByAuthor(items)]);
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

  const updatePostInState = (postId, updater) => {
    setPosts((prev) => prev.map((post) => (post._id === postId ? updater(post) : post)));
  };

  const handleUpvote = async (id) => {
    if (!user) return;

    const resourceId = id;
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const previousUserState = {
      upvotes: user?.upvotes || [],
      downvotes: user?.downvotes || [],
    };
    const previousPost = posts.find((post) => post._id === resourceId);

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

    updatePostInState(resourceId, (post) => {
      const currentUserId = user?._id;
      const normalizedUserId = currentUserId?.toString();
      const nextUpvotes = [...(post.upvotes || [])];
      const nextDownvotes = [...(post.downvotes || [])];

      if (hasUpvoted) {
        return {
          ...post,
          upvotes: nextUpvotes.filter((item) => String(item) !== normalizedUserId),
          downvotes: nextDownvotes.filter((item) => String(item) !== normalizedUserId),
        };
      }

      return {
        ...post,
        upvotes: [...nextUpvotes.filter((item) => String(item) !== normalizedUserId), currentUserId],
        downvotes: nextDownvotes.filter((item) => String(item) !== normalizedUserId),
      };
    });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`, {
        reportId: resourceId,
        token,
        method: hasUpvoted ? "pull" : "push",
        resourceType: "govPost",
      });
      if (res.status === 200 && res.data.success) {
        const nextResource = res.data.resource || null;
        if (nextResource) {
          updatePostInState(resourceId, (post) => ({
            ...post,
            upvotes: nextResource.upvotes || [],
            downvotes: nextResource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, upvotes: previousUserState.upvotes, downvotes: previousUserState.downvotes } : prev));
      if (previousPost) {
        updatePostInState(resourceId, (post) => ({
          ...post,
          upvotes: previousPost.upvotes || [],
          downvotes: previousPost.downvotes || [],
        }));
      }
      console.error(err);
    }
  };

  const handleDownvote = async (id) => {
    if (!user) return;

    const resourceId = id;
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const previousUserState = {
      upvotes: user?.upvotes || [],
      downvotes: user?.downvotes || [],
    };
    const previousPost = posts.find((post) => post._id === resourceId);

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

    updatePostInState(resourceId, (post) => {
      const currentUserId = user?._id;
      const normalizedUserId = currentUserId?.toString();
      const nextUpvotes = [...(post.upvotes || [])];
      const nextDownvotes = [...(post.downvotes || [])];

      if (hasDownvoted) {
        return {
          ...post,
          upvotes: nextUpvotes.filter((item) => String(item) !== normalizedUserId),
          downvotes: nextDownvotes.filter((item) => String(item) !== normalizedUserId),
        };
      }

      return {
        ...post,
        upvotes: nextUpvotes.filter((item) => String(item) !== normalizedUserId),
        downvotes: [...nextDownvotes.filter((item) => String(item) !== normalizedUserId), currentUserId],
      };
    });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`, {
        reportId: resourceId,
        token,
        method: hasDownvoted ? "pull" : "push",
        resourceType: "govPost",
      });
      if (res.status === 200 && res.data.success) {
        const nextResource = res.data.resource || null;
        if (nextResource) {
          updatePostInState(resourceId, (post) => ({
            ...post,
            upvotes: nextResource.upvotes || [],
            downvotes: nextResource.downvotes || [],
          }));
        }
      }
    } catch (err) {
      setUser((prev) => (prev ? { ...prev, upvotes: previousUserState.upvotes, downvotes: previousUserState.downvotes } : prev));
      if (previousPost) {
        updatePostInState(resourceId, (post) => ({
          ...post,
          upvotes: previousPost.upvotes || [],
          downvotes: previousPost.downvotes || [],
        }));
      }
      console.error(err);
    }
  };

  const handleCommentAdded = (postId, comment) => {
    updatePostInState(postId, (post) => ({
      ...post,
      comments: [...(post.comments || []), comment],
    }));
  };

  const handleCommentLiked = (postId, updatedComment) => {
    updatePostInState(postId, (post) => ({
      ...post,
      comments: (post.comments || []).map((comment) => (comment._id === updatedComment._id ? updatedComment : comment)),
    }));
  };

  const handleShared = (postId) => {
    updatePostInState(postId, (post) => ({
      ...post,
      shares: (post.shares || 0) + 1,
    }));
  };

  const handleDelete = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/report/delete`, {
        reportId: postId,
        token,
        resourceType: "govPost",
      });
      if (response.status === 200) {
        setPosts((prev) => prev.filter((post) => post._id !== postId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
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

  return (
    <div>
      <div className="h-32 bg-x-bg-secondary border-b border-x-border" />
      <div className="px-4 pb-6">
        <div className="x-avatar x-avatar-lg w-24 h-24 text-3xl border-4 border-x-bg -mt-12 mb-4">
          {((user.name || "").trim().charAt(0) || "U").toUpperCase()}
        </div>
        <h1 className="text-xl font-bold">{(user.name || "").trim() || (user.phone_number ? `User ${user.phone_number.slice(-4)}` : "User")}</h1>
        <p className="text-x-text-secondary text-sm">{user.phone_number ? `+977 ${user.phone_number}` : "No phone number"}</p>
        <span className="inline-block mt-2 x-badge x-badge-progress">Government Official</span>
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
        <div className="x-panel mt-6">
          <h2 className="font-bold mb-3">Account Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-x-text-secondary text-xs">Joined</p>
              <p className="font-semibold">{formattedDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-x-text-secondary text-xs">Last updated</p>
              <p className="font-semibold">{formattedDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2 rounded-2xl border border-x-border bg-x-bg-secondary p-1">
          <FeedTab active={feedTab === FEED_TABS.AUTHORITY} label="Authority" onClick={() => setFeedTab(FEED_TABS.AUTHORITY)} />
          <FeedTab active={feedTab === FEED_TABS.ALERTS} label="Alerts" onClick={() => setFeedTab(FEED_TABS.ALERTS)} />
        </div>

        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <div className="relative bg-x-bg rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
              <h3 className="text-lg font-bold mb-2">Delete post?</h3>
              <p className="text-sm text-x-text-secondary mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="x-btn x-btn-secondary flex-1">Cancel</button>
                <button onClick={() => handleDelete(deleteTarget)} className="x-btn x-btn-primary flex-1 !bg-red-500 hover:!bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-x-accent" size={28} />
            </div>
          ) : posts.length === 0 ? (
            <div className="x-panel text-center py-12 text-x-text-secondary">No posts from this account yet.</div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="relative">
                <ReportFeedItem
                  issue={post}
                  user={user}
                  feedTab={feedTab}
                  feedTabs={FEED_TABS}
                  expanded={expanded}
                  onToggleDescription={toggleDescription}
                  onUpvote={handleUpvote}
                  onDownvote={handleDownvote}
                  onComment={setCommentReport}
                  onShare={setShareReport}
                  onInsights={setInsightsReport}
                  timeAgo={timeAgo}
                />
                <button
                  onClick={() => setDeleteTarget(post._id)}
                  className="absolute top-3 right-3 x-btn-ghost text-red-500"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                </button>
              </div>
            ))
          )}

          {loadingMore && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-x-accent" size={24} />
            </div>
          )}
        </div>
      </div>

      <CommentSheet report={commentReport} open={!!commentReport} onClose={() => setCommentReport(null)} onCommentAdded={handleCommentAdded} onCommentLiked={handleCommentLiked} user={user} resourceType="govPost" />
      <InsightsSheet report={insightsReport} open={!!insightsReport} onClose={() => setInsightsReport(null)} />
      <ShareSheet report={shareReport} open={!!shareReport} onClose={() => setShareReport(null)} onShared={handleShared} />
    </div>
  );
}
