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

function hasId(list, id) {
  if (!list || !id) return false;
  return list.some((item) => item?.toString() === id?.toString());
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
  timeAgo,
  statusBadge,
  innerRef,
}) {
  const upvotes = issue.upvotes || [];
  const downvotes = issue.downvotes || [];
  const userUpvotes = user?.upvotes || [];
  const userDownvotes = user?.downvotes || [];
  const userReports = user?.reports || [];

  const hasUpvoted = hasId(userUpvotes, issue._id);
  const hasDownvoted = hasId(userDownvotes, issue._id);
  const isMine = hasId(userReports, issue._id);
  const isExpanded = expanded[issue._id];
  const commentCount = issue.comments?.length || 0;

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
            {issue.userId?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[0.9375rem] truncate">
              {issue.userId?.name || "User"}
            </p>
            <p className="text-x-text-secondary text-xs mt-0.5">
              Ward {issue.ward_number} · {timeAgo(issue.createdAt)}
            </p>
          </div>
        </div>

        <div className="x-feed-card-body">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`x-badge ${statusBadge(issue.status)}`}>
              {issue.status}
            </span>
            <span className="text-x-text-secondary text-xs">{issue.category}</span>
            {isMine && (
              <span className="text-x-accent text-xs font-semibold">Your report</span>
            )}
            {feedTab === feedTabs.AUTHORITY && issue.changer && (
              <span className="text-x-text-secondary text-xs">
                · Updated by {issue.changer.name}
              </span>
            )}
          </div>

          <h4 className="font-bold text-base mt-2 leading-snug">{issue.title}</h4>
          <p
            className={`text-x-text text-[0.9375rem] mt-1.5 leading-relaxed whitespace-pre-wrap ${
              !isExpanded && !featured ? "line-clamp-3" : ""
            }`}
          >
            {issue.description}
          </p>
          {issue.description?.length > 120 && !featured && (
            <button
              onClick={() => onToggleDescription(issue._id)}
              className="x-link text-sm mt-1"
            >
              {isExpanded ? "Show less" : "Show more"}
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

          <div className="x-action-bar">
            <EngagePill
              icon={ArrowBigUp}
              count={upvotes.length}
              active={hasUpvoted}
              variant="up"
              label="Upvote"
              onClick={() => onUpvote(issue._id)}
              disabled={isMine}
            />
            <EngagePill
              icon={ArrowBigDown}
              count={downvotes.length}
              active={hasDownvoted}
              variant="down"
              label="Downvote"
              onClick={() => onDownvote(issue._id)}
              disabled={isMine}
            />
            <EngagePill
              icon={MessageCircle}
              count={commentCount}
              variant="comment"
              label="Comments"
              onClick={() => onComment(issue)}
            />
            <EngagePill
              icon={Share2}
              count={issue.shares || 0}
              variant="share"
              label="Share"
              onClick={() => onShare(issue)}
            />
            <EngagePill
              icon={BarChart2}
              count={0}
              variant="insight"
              label="Insights"
              onClick={() => onInsights(issue)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
