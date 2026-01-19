import { Loader2, Trash, User2 } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "../styles.css";
import { Pagination } from "swiper/modules";

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // track expanded description per issue
  const [deleteTarget, setDeleteTarget] = useState(null); // reportId or null

  const token = localStorage.getItem("token");
  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "yr", seconds: 31536000 },
      { label: "mo", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hr", seconds: 3600 },
      { label: "m", seconds: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count}${interval.label} ago`;
    }
    return "Just now";
  };

  useEffect(() => {
    const getReport = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/getMy`,
          { token },
        );
        if (response.status === 200 && response.data.Reports) {
          console.log(response.data.Reports);
          setIssues(response.data.Reports);
        }
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

  // Calculate total upvotes/downvotes across all reports
  const totalReports = issues.length || 0; // avoid divide by zero
  const totalUpvotes = issues.reduce(
    (sum, issue) => sum + issue.upvotes.length,
    0,
  );
  const totalDownvotes = issues.reduce(
    (sum, issue) => sum + issue.downvotes.length,
    0,
  );

  const avgUpvotePercent = ((totalUpvotes / totalReports) * 100).toFixed(1);
  const avgDownvotePercent = ((totalDownvotes / totalReports) * 100).toFixed(1);

  return (
    <div className="w-full  min-h-screen py-4 flex flex-col items-center gap-4">
      {loading ? (
        <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <>
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setDeleteTarget(null)}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-2xl shadow-lg w-80 p-6 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete report?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(deleteTarget);
                      setDeleteTarget(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="w-full max-w-xl mb-4 p-4 bg-white rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Total Reports: {totalReports}
              </h3>
            </div>
            <div className="flex space-x-6">
              <div>
                <p className="text-sm text-gray-400">Average Upvotes</p>
                <p className="font-bold text-pink-500">{avgUpvotePercent}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Average Downvotes</p>
                <p className="font-bold text-pink-500">{avgDownvotePercent}%</p>
              </div>
            </div>
          </div>

          {/* Reports List */}
          {issues.length < 1 ? (
            <div className="w-full h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <h3 className="text-3xl font-bold">No issues reported.</h3>
                <span className="text-center flex gap-1">
                  <p>If you have an issue,</p>
                  <Link to="/create" className="text-blue-500 border-b-2">
                    Report Here
                  </Link>
                </span>
              </div>
            </div>
          ) : (
            issues.map((issue) => {
              // const isMine = user.reports.includes(issue._id);
              const isExpanded = expanded[issue._id];

              return (
                <div
                  key={issue._id}
                  className="bg-white w-full max-w-xl rounded-2xl shadow-md overflow-hidden flex flex-col last-of-type:mb-16 "
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-200 rounded-full p-2">
                        <User2 size={20} className="text-gray-700" />
                      </span>
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900">
                          {issue.userId.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ward {issue.ward_number} · {issue.category} ·{" "}
                          {issue.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {timeAgo(issue.createdAt)}
                      </span>

                      <button
                        onClick={() => setDeleteTarget(issue._id)}
                        className="p-2 rounded-full hover:bg-red-50 text-red-500 transition"
                        title="Delete report"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="px-4 pb-4">
                    <h4 className="text-gray-900 font-semibold ">
                      {issue.title}
                    </h4>
                    <p
                      className={`text-gray-700 text-sm ${
                        !isExpanded ? "max-h-5 overflow-hidden" : ""
                      }`}
                    >
                      {issue.description}
                    </p>
                    {issue.description.length > 100 && (
                      <p
                        onClick={() => toggleDescription(issue._id)}
                        className="text-blue-500 text-sm  cursor-pointer select-none"
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                      </p>
                    )}
                  </div>

                  {/* Image */}
                  {issue.media?.length > 0 && (
                    <Swiper
                      pagination={{
                        dynamicBullets: true,
                      }}
                      modules={[Pagination]}
                      className="mySwiper"
                    >
                      {issue.media.map((img, i) => (
                        <SwiperSlide key={i}>
                          <img
                            src={img}
                            alt="issue"
                            className="w-full max-h-60 object-cover"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}

                  {/* Upvotes / Downvotes */}
                  <div className="flex justify-between px-4 py-3 items-center text-gray-500 text-sm border-t border-gray-200 ">
                    <div className="flex gap-4">
                      <span>
                        <span className="text-pink-500 font-medium">
                          {issue.upvotes.length}
                        </span>{" "}
                        Upvotes
                      </span>
                      <span>
                        <span className="text-pink-500 font-medium">
                          {issue.downvotes.length}
                        </span>{" "}
                        Downvotes
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
