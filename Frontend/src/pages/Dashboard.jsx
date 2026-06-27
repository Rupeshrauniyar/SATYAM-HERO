import { Loader2, Trash, LayoutDashboard } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "../styles.css";
import { Pagination } from "swiper/modules";

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const token = localStorage.getItem("token");

  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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
          `${import.meta.env.VITE_BACKEND_URL}/api/report/getMy`,
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

  const handleDelete = async (reportId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/delete`,
        { reportId, token },
      );
      if (response.status === 200) {
        setIssues((prev) => prev.filter((r) => r._id !== reportId));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const totalReports = issues.length || 1;
  const totalUpvotes = issues.reduce((sum, i) => sum + i.upvotes.length, 0);
  const totalDownvotes = issues.reduce((sum, i) => sum + i.downvotes.length, 0);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-x-accent" size={28} />
      </div>
    );

  return (
    <div>
      <div className="x-page-header">
        <h1>Dashboard</h1>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-x-bg rounded-2xl border border-x-border w-full max-w-sm p-6 animate-fadeIn">
            <h3 className="text-lg font-bold mb-2">Delete report?</h3>
            <p className="text-sm text-x-text-secondary mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="x-btn x-btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => { handleDelete(deleteTarget); setDeleteTarget(null); }}
                className="x-btn x-btn-primary flex-1 !bg-red-500 hover:!bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 grid grid-cols-3 gap-2 border-b border-x-border">
        <div className="x-panel text-center py-3">
          <p className="text-xl font-bold">{issues.length}</p>
          <p className="text-xs text-x-text-secondary">Reports</p>
        </div>
        <div className="x-panel text-center py-3">
          <p className="text-xl font-bold text-x-accent">{totalUpvotes}</p>
          <p className="text-xs text-x-text-secondary">Upvotes</p>
        </div>
        <div className="x-panel text-center py-3">
          <p className="text-xl font-bold">{totalDownvotes}</p>
          <p className="text-xs text-x-text-secondary">Downvotes</p>
        </div>
      </div>

      {issues.length < 1 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <LayoutDashboard size={48} className="text-x-text-secondary mb-4" strokeWidth={1.25} />
          <h3 className="text-xl font-bold mb-2">No reports yet</h3>
          <p className="text-x-text-secondary text-sm mb-6">
            Your submitted issues will appear here.
          </p>
          <Link to="/create" className="x-btn x-btn-primary">Report an Issue</Link>
        </div>
      ) : (
        issues.map((issue) => {
          const isExpanded = expanded[issue._id];
          return (
            <article key={issue._id} className="x-feed-item">
              <div className="flex gap-3">
                <div className="x-avatar">{issue.userId.name?.charAt(0)?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-sm">{issue.userId.name}</span>
                      <span className="text-x-text-secondary text-sm">· {timeAgo(issue.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(issue._id)}
                      className="x-btn-ghost text-red-500"
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                  <p className="text-x-text-secondary text-xs mt-0.5">
                    Ward {issue.ward_number} · {issue.category} · {issue.status}
                  </p>
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
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
};

export default Dashboard;
