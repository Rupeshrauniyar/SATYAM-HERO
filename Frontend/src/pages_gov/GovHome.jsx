import { Loader2, MessageCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles.css";

const GovHome = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [confirmIssue, setConfirmIssue] = useState(null);

  const statuses = ["Pending", "Progress", "Resolved"];

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
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/get`,
        );
        if (response.status === 200 && response.data.Reports)
          setIssues(response.data.Reports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getReport();
  }, []);

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
      setIssues((prev) =>
        prev.map((i) =>
          i._id === confirmIssue._id ? { ...i, status: selectedStatus } : i,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setConfirmIssue(null);
      setSelectedStatus(null);
    }
  };

  const statusBadge = (status) => {
    const map = { Pending: "x-badge-pending", Progress: "x-badge-progress", Resolved: "x-badge-resolved" };
    return map[status] || "x-badge-pending";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-x-accent" size={28} />
      </div>
    );

  return (
    <div>
      <div className="x-page-header">
        <h1>Government Feed</h1>
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

      {issues.length < 1 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <MessageCircle size={48} className="text-x-text-secondary mb-4" strokeWidth={1.25} />
          <h3 className="text-xl font-bold mb-2">No issues reported</h3>
          <p className="text-x-text-secondary text-sm">Check back again later.</p>
        </div>
      ) : (
        issues.map((issue) => {
          const isExpanded = expanded[issue._id];
          const availableStatuses = statuses.filter((s) => s !== issue.status);

          return (
            <article key={issue._id} className="x-feed-item">
              <div className="flex gap-3">
                <div className="x-avatar">{issue.userId.name?.charAt(0)?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-bold text-sm">{issue.userId.name}</span>
                    <span className="text-x-text-secondary text-sm">· Ward {issue.ward_number}</span>
                    <span className="text-x-text-secondary text-sm">· {timeAgo(issue.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`x-badge ${statusBadge(issue.status)}`}>{issue.status}</span>
                    <span className="text-x-text-secondary text-xs">{issue.category}</span>
                  </div>
                  <h4 className="font-bold text-sm mt-2">{issue.title}</h4>
                  <p className={`text-sm mt-1 ${!isExpanded ? "line-clamp-2" : ""}`}>{issue.description}</p>
                  {issue.description?.length > 100 && (
                    <button onClick={() => toggleDescription(issue._id)} className="x-link text-sm mt-1">
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                  {issue.media?.length > 0 && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-x-border">
                      <Swiper pagination={{ dynamicBullets: true }} modules={[Pagination]} className="mySwiper">
                        {issue.media.map((img, i) => (
                          <SwiperSlide key={i}>
                            <img src={img} alt="issue" className="w-full max-h-60 object-cover" />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  )}
                  <p className="text-x-text-secondary text-sm mt-2">
                    {issue.upvotes.length} upvotes · {issue.downvotes.length} downvotes
                  </p>
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue, e.target.value)}
                    className="x-select mt-3 text-sm py-2"
                  >
                    <option value={issue.status}>{issue.status}</option>
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
};

export default GovHome;
