import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Send, X, Heart, ChevronDown } from "lucide-react";
import EngagePill from "./EngagePill";

function timeAgo(date) {
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
}

function hasLiked(likes, userId) {
  return likes?.some((id) => id?.toString() === userId?.toString());
}

export default function CommentSheet({
  report,
  open,
  onClose,
  onCommentAdded,
  onCommentLiked,
  user,
  resourceType = "report",
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likingId, setLikingId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loadingRepliesFor, setLoadingRepliesFor] = useState(null);
  const [replyCache, setReplyCache] = useState({});

  useEffect(() => {
    if (!open || !report?._id) return;

    setVisible(true);
    document.body.style.overflow = "hidden";

    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/comments/${report._id}?resourceType=${resourceType}&includeReplies=false`,
        );
        if (res.data.success) setComments(res.data.comments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open, report?._id]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/comment`,
        { reportId: report._id, text: text.trim(), token, resourceType },
      );

      if (res.data.success) {
        const newComment = { ...res.data.comment, likes: res.data.comment.likes || [] };
        setComments((prev) => [...prev, newComment]);
        setText("");
        onCommentAdded?.(report._id, newComment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (comment) => {
    if (likingId) return;

    const liked = hasLiked(comment.likes, user._id);
    setLikingId(comment._id);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/comment/like`,
        {
          reportId: report._id,
          commentId: comment._id,
          token,
          method: liked ? "pull" : "push",
          resourceType,
        },
      );

      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === comment._id ? res.data.comment : c)),
        );
        onCommentLiked?.(report._id, res.data.comment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLikingId(null);
    }
  };

  const handleReply = async (comment) => {
    if (!replyText?.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/comment/reply`,
        { reportId: report._id, commentId: comment._id, text: replyText.trim(), token, resourceType },
      );
      if (res.data.success) {
        setComments((prev) => prev.map((c) => (c._id === comment._id ? res.data.comment : c)));
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadReplies = async (comment) => {
    if (replyCache[comment._id]) return;
    setLoadingRepliesFor(comment._id);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/comments/${report._id}/replies/${comment._id}?resourceType=${resourceType}`,
      );
      if (res.data.success) {
        setReplyCache((prev) => ({ ...prev, [comment._id]: res.data.replies || [] }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRepliesFor(null);
    }
  };

  if (!visible && !open) return null;

  return (
    <div className={`x-sheet-root ${open ? "x-sheet-open" : "x-sheet-closing"}`}>
      <div className="x-sheet-backdrop" onClick={onClose} />

      <div className="x-sheet">
        <div className="x-sheet-handle" />

        <div className="x-sheet-header">
          <div>
            <h2 className="font-bold text-lg">Comments</h2>
            <p className="text-x-text-secondary text-sm truncate max-w-[260px]">
              {report?.title}
            </p>
          </div>
          <button onClick={onClose} className="x-btn-ghost text-x-text-secondary">
            <X size={20} />
          </button>
        </div>

        <div className="x-sheet-body">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-x-accent" size={24} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-x-text-secondary text-sm">
                No comments yet. Start the conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => {
                const liked = hasLiked(comment.likes, user?._id);
                const likeCount = comment.likes?.length || 0;

                return (
                  <div key={comment._id} className="flex gap-3">
                    <div className="x-avatar w-9 h-9 text-sm shrink-0">
                      {comment.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="x-panel !p-3 !rounded-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {comment.userId?.name || "User"}
                          </span>
                          <span className="text-x-text-secondary text-xs">
                            · {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed break-words">
                          {comment.text}
                        </p>
                      </div>
                      <div className="x-comment-like-row flex items-center gap-3">
                        <EngagePill
                          icon={Heart}
                          count={likeCount}
                          active={liked}
                          variant="like"
                          label={liked ? "Unlike comment" : "Like comment"}
                          onClick={() => handleLike(comment)}
                          disabled={likingId === comment._id}
                        />
                        <button
                          className="x-link text-sm"
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        >
                          Reply
                        </button>
                      </div>

                      {comment.replyCount > 0 && !replyCache[comment._id] && (
                        <button
                          className="x-link text-sm mt-3 inline-flex items-center gap-1"
                          onClick={() => loadReplies(comment)}
                        >
                          {loadingRepliesFor === comment._id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                          View replies
                        </button>
                      )}

                      {replyCache[comment._id] && (
                        <div className="mt-3 space-y-3">
                          {replyCache[comment._id].map((r) => (
                            <div key={r._id} className="flex gap-3 items-start">
                              <div className="x-avatar w-8 h-8 text-xs shrink-0">{r.userId?.name?.charAt(0)?.toUpperCase() || "?"}</div>
                              <div className="flex-1 min-w-0">
                                <div className="x-panel !p-3 !rounded-2xl">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">{r.userId?.name || "User"}</span>
                                    <span className="text-x-text-secondary text-xs">· {timeAgo(r.createdAt)}</span>
                                  </div>
                                  <p className="text-sm mt-1 leading-relaxed break-words">{r.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyingTo === comment._id && (
                        <div className="mt-3 flex gap-2 items-center">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="x-input flex-1 py-2 text-sm"
                          />
                          <button onClick={() => handleReply(comment)} className="x-btn x-btn-accent x-btn-sm">Reply</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="x-sheet-footer">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            className="x-input flex-1 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="x-btn x-btn-accent x-btn-sm shrink-0 !px-4"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
