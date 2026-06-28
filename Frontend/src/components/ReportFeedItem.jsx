import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageCircle,
  BarChart2,
  Share2,
  Link2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import EngagePill from "./EngagePill";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import { useTranslation, translateText, getCachedTranslation, setCachedTranslation } from "../utils/translations";

function hasId(list, id) {
  if (!list || !id) return false;
  const normalizedId = String(id);
  return list.some((item) => String(item ?? "") === normalizedId);
}

export default function ReportFeedItem({
  issue,
  user,
  feedTab,
  feedTabs,
  expanded,
  featured,
  onToggleDescription,
  onUpvote,
  onDownvote,
  onComment,
  onShare,
  onInsights,
  onChangeStatus,
  timeAgo,
  statusBadge,
  innerRef,
}) {
  const upvotes = issue.upvotes || [];
  const downvotes = issue.downvotes || [];
  const upvoteCount = Array.isArray(issue.upvotes) ? upvotes.length : issue.upvotesCount || 0;
  const downvoteCount = Array.isArray(issue.downvotes) ? downvotes.length : issue.downvotesCount || 0;
  const userReports = user?.reports || [];
  const author = issue?.user || issue?.author || issue?.userId || issue?.authorId || {};
  const authorName = (author?.name || issue?.user?.name || issue?.author?.name || issue?.userId?.name || issue?.authorId?.name || user?.name || "User").trim() || "User";
  const authorRole = author?.role || issue?.user?.role || issue?.author?.role || user?.role;
  const [voteState, setVoteState] = useState(() => ({
    up: hasId(upvotes, user?._id) || hasId(user?.upvotes || [], issue?._id),
    down: hasId(downvotes, user?._id) || hasId(user?.downvotes || [], issue?._id),
  }));
  const { language } = useContext(AppContext);
  const t = useTranslation();
  const [translatedTitle, setTranslatedTitle] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const newState = {
      up: hasId(issue.upvotes || [], user?._id) || hasId(user?.upvotes || [], issue?._id),
      down: hasId(issue.downvotes || [], user?._id) || hasId(user?.downvotes || [], issue?._id),
    };
    setVoteState((prev) => (prev.up === newState.up && prev.down === newState.down ? prev : newState));
  }, [issue._id, user?._id, user?.upvotes, user?.downvotes, upvoteCount, downvoteCount]);

  const hasUpvoted = Boolean(voteState.up);
  const hasDownvoted = Boolean(voteState.down);
  const ownerId = issue?.authorId?._id || issue?.authorId?.id || issue?.authorId || issue?.userId?._id || issue?.userId?.id || issue?.userId || issue?.author?._id || issue?.user?._id;
  const isMine = Boolean(user?._id && (ownerId?.toString() === user._id?.toString() || hasId(userReports, issue._id)));
  const isExpanded = expanded[issue._id];
  const commentCount = Array.isArray(issue.comments) ? issue.comments.length : issue.commentsCount || 0;
  const showStatusControl = Boolean(onChangeStatus && issue?.status);
  const badgeClass = typeof statusBadge === "function"
    ? statusBadge(issue.status)
    : (typeof statusBadge === "string" ? statusBadge : "x-badge-pending");

  return (
    <article
      ref={innerRef}
      id={`report-${issue._id}`}
      className={`x-feed-item ${featured ? "x-feed-item-featured" : ""}`}
    >
      <div className="x-feed-card">
        {featured && (
          <div className="x-shared-banner">
            <Link2 size={14} />
            <span>Shared report</span>
          </div>
        )}

        <div className="x-feed-card-header">
          <div className="x-avatar">
            {(authorName?.trim()?.charAt(0)?.toUpperCase()) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[0.9375rem] truncate">
              {authorName}
            </p>
            <p className="text-x-text-secondary text-xs mt-0.5">
              {issue.ward_number ? `Ward ${issue.ward_number}` : "Government update"} · {timeAgo(issue.createdAt)}
            </p>
          </div>
        </div>

        <div className="x-feed-card-body">
          <div className="flex flex-wrap items-center gap-2">
            {issue?.status && (
              <span className={`x-badge ${badgeClass}`}>
                {issue.status}
              </span>
            )}
            {issue?.category && (
              <span className="text-x-text-secondary text-xs">{issue.category}</span>
            )}
            {isMine && (
              <span className="text-x-accent text-xs font-semibold">Your report</span>
            )}
            {issue.changer && (
              <span className="text-x-text-secondary text-xs">
                · in {issue.status} by {issue.changer.name}
              </span>
            )}
          </div>

          {/* <div className="flex items-center gap-2">
            <h4 className="font-bold text-base mt-2 leading-snug">{showTranslated && translatedTitle ? translatedTitle : issue.title}</h4>
            <button
              className="x-link text-xs"
              onClick={async () => {
                // toggle/show translation
                if (showTranslated) return setShowTranslated(false);
                const cached = getCachedTranslation(issue._id);
                if (cached && cached.title) {
                  setTranslatedTitle(cached.title);
                  setTranslatedDesc(cached.description || null);
                  setShowTranslated(true);
                  return;
                }
                setTranslating(true);
                try {
                    // Try backend translate API first
                    let tt = null;
                    let td = null;
                    try {
                      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
                      const res = await axios.post(`${backend}/api/translate`, { text: issue.title || '', target: 'ne' });
                      if (res.data?.success && res.data.translated) tt = res.data.translated;
                    } catch (e) {
                      tt = null;
                    }

                    try {
                      const res2 = await axios.post(`${backend}/api/translate`, { text: issue.description || '', target: 'ne' });
                      if (res2.data?.success && res2.data.translated) td = res2.data.translated;
                    } catch (e) {
                      td = null;
                    }

                    // fallback to local translator for any missing translations
                    if (!tt) tt = translateText(issue.title || '', 'ne');
                    if (!td) td = translateText(issue.description || '', 'ne');

                    setTranslatedTitle(tt);
                    setTranslatedDesc(td);
                    setCachedTranslation(issue._id, { title: tt, description: td });
                    setShowTranslated(true);
                } finally {
                  setTranslating(false);
                }
              }}
              title={t("translate")}
            >
              {translating ? "..." : showTranslated ? t("showOriginal") : t("translate")}
            </button>
          </div> */}
          <p
            className={`text-x-text text-[0.9375rem] mt-1.5 leading-relaxed whitespace-pre-wrap ${
              !isExpanded && !featured ? "line-clamp-3" : ""
            }`}
          >
            {showTranslated && translatedDesc ? translatedDesc : (issue.description || issue.body || "")}
          </p>
          {(issue.description || issue.body)?.length > 120 && !featured && (
            <button
              onClick={() => onToggleDescription(issue._id)}
              className="x-link text-sm mt-1 cursor-pointer"
            >
                {isExpanded ? t("showLess") : t("showMore")}
            </button>
          )}

          {issue.media?.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-x-border">
              <Swiper
                pagination={{ dynamicBullets: true }}
                modules={[Pagination]}
                className="mySwiper"
              >
                {issue.media.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={img}
                      alt="issue"
                      className="w-full max-h-80 object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {issue.changer && (
            <p className="text-x-text-secondary text-sm mt-2">
              Status updated to <strong>{issue.status}</strong> by {issue.changer.name}
            </p>
          )}

          {onUpvote || onDownvote || onComment || onShare || onInsights ? (
            <div className="x-action-bar">
              {onUpvote && (
                <EngagePill
                  icon={ArrowBigUp}
                  count={upvoteCount}
                  active={hasUpvoted}
                  variant="up"
                  label="Upvote"
                  onClick={() => onUpvote(issue._id, authorRole)}
                  disabled={isMine}
                />
              )}
              {onDownvote && (
                <EngagePill
                  icon={ArrowBigDown}
                  count={downvoteCount}
                  active={hasDownvoted}
                  variant="down"
                  label="Downvote"
                  onClick={() => onDownvote(issue._id, authorRole)}
                  disabled={isMine}
                />
              )}
              {onComment && (
                <EngagePill
                  icon={MessageCircle}
                  count={commentCount}
                  variant="comment"
                  label="Comments"
                  onClick={() => onComment(issue)}
                />
              )}
              {onShare && (
                <EngagePill
                  icon={Share2}
                  count={issue.shares || 0}
                  variant="share"
                  label="Share"
                  onClick={() => onShare(issue)}
                />
              )}
              {onInsights && (
                <EngagePill
                  icon={BarChart2}
                  count={0}
                  variant="insight"
                  label="Insights"
                  onClick={() => onInsights(issue)}
                />
              )}
            </div>
          ) : null}
          {showStatusControl && (
            <select
              value={issue.status}
              onChange={(e) => onChangeStatus(issue, e.target.value)}
              className="x-select mt-3 text-sm py-2 cursor-pointer"
            >
              <option value={issue.status}>{issue.status}</option>
              {["Pending", "Progress", "Resolved"].filter(s => s !== issue.status).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </article>
  );
}
