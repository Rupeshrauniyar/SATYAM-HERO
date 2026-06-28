import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import { Loader2, MessageCircle, Search as SearchIcon } from "lucide-react";
import ReportFeedItem from "../components/ReportFeedItem";
import { applyOptimisticVote } from "../utils/voteHelpers";
import { useTranslation } from "../utils/translations";

const Search = ({ basePath = "/search", heading = null, intro = null, action = null }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { user } = useContext(AppContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [searchInput, setSearchInput] = useState(query);
  const t = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchReports = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/search?q=${encodeURIComponent(query)}`
        );

        if (response.data.success) {
          setResults(response.data.reports || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchReports();
  }, [query]);

  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpvote = async (e) => {
    if (!user) return;

    const resourceId = e;
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const previousResults = results;

    setResults((prev) =>
      prev.map((report) =>
        report._id === resourceId
          ? applyOptimisticVote({
              issue: report,
              userId: user._id,
              voteType: "up",
              hasCurrentVote: hasUpvoted,
              hasOppositeVote: hasDownvoted,
            })
          : report
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
        { reportId: resourceId, token, method: hasUpvoted ? "pull" : "push" }
      );

      if (res.status === 200 && res.data.success) {
        const nextResource = res.data.resource || null;
        if (nextResource) {
          setResults((prev) =>
            prev.map((report) =>
              report._id === resourceId
                ? {
                    ...report,
                    upvotes: nextResource.upvotes || [],
                    downvotes: nextResource.downvotes || [],
                    upvotesCount: Array.isArray(nextResource.upvotes)
                      ? nextResource.upvotes.length
                      : nextResource.upvotesCount ?? report.upvotesCount,
                    downvotesCount: Array.isArray(nextResource.downvotes)
                      ? nextResource.downvotes.length
                      : nextResource.downvotesCount ?? report.downvotesCount,
                  }
                : report
            )
          );
        }
      }
    } catch (err) {
      setResults(previousResults);
      console.log(err);
    }
  };

  const handleDownvote = async (e) => {
    if (!user) return;

    const resourceId = e;
    const hasDownvoted = (user.downvotes || []).some((down) => down.toString() === resourceId.toString());
    const hasUpvoted = (user.upvotes || []).some((up) => up.toString() === resourceId.toString());
    const previousResults = results;

    setResults((prev) =>
      prev.map((report) =>
        report._id === resourceId
          ? applyOptimisticVote({
              issue: report,
              userId: user._id,
              voteType: "down",
              hasCurrentVote: hasDownvoted,
              hasOppositeVote: hasUpvoted,
            })
          : report
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`,
        { reportId: resourceId, token, method: hasDownvoted ? "pull" : "push" }
      );

      if (res.status === 200 && res.data.success) {
        const nextResource = res.data.resource || null;
        if (nextResource) {
          setResults((prev) =>
            prev.map((report) =>
              report._id === resourceId
                ? {
                    ...report,
                    upvotes: nextResource.upvotes || [],
                    downvotes: nextResource.downvotes || [],
                    upvotesCount: Array.isArray(nextResource.upvotes)
                      ? nextResource.upvotes.length
                      : nextResource.upvotesCount ?? report.upvotesCount,
                    downvotesCount: Array.isArray(nextResource.downvotes)
                      ? nextResource.downvotes.length
                      : nextResource.downvotesCount ?? report.downvotesCount,
                  }
                : report
            )
          );
        }
      }
    } catch (err) {
      setResults(previousResults);
      console.log(err);
    }
  };

  const statusBadge = (status) => {
    const map = {
      Pending: "x-badge-pending",
      Progress: "x-badge-progress",
      Resolved: "x-badge-resolved",
    };
    return map[status] || "x-badge-pending";
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`${basePath}?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const feedProps = {
    user,
    feedTab: "public",
    feedTabs: { PUBLIC: "public", AUTHORITY: "authority" },
    expanded,
    onToggleDescription: toggleDescription,
    onUpvote: handleUpvote,
    onDownvote: handleDownvote,
    onComment: () => {},
    onShare: () => {},
    onInsights: () => {},
    timeAgo,
    statusBadge,
  };

  return (
    <div className="x-feed-column">
      <div className="x-page-header space-y-4">
        <div className="flex-1">
          <h1>{heading || t("searchResults")}</h1>
          <p className="text-sm text-x-text-secondary mt-1">
            {query
              ? intro || t("showingResults", { query })
              : t("enterSearchTerm")}
          </p>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-x-text-muted" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("search")}
            className="w-full rounded-full border border-x-border bg-x-bg py-3 pl-10 pr-4 outline-none focus:border-x-accent"
          />
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-x-accent" size={28} />
        </div>
      ) : results.length === 0 && query ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <MessageCircle
            size={48}
            className="text-x-text-secondary mb-4"
            strokeWidth={1.25}
          />
          <h3 className="text-xl font-bold mb-2">No results found</h3>
          <p className="text-x-text-secondary text-sm mb-6 max-w-xs">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      ) : results.length > 0 ? (
        results.map((issue) => (
          <ReportFeedItem key={issue._id} {...feedProps} issue={issue} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <MessageCircle
            size={48}
            className="text-x-text-secondary mb-4"
            strokeWidth={1.25}
          />
          <h3 className="text-xl font-bold mb-2">{t("startSearching")}</h3>
          <p className="text-x-text-secondary text-sm mb-6 max-w-xs">
            {t("enterSearchTerm")}
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
