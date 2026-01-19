import { Loader2, User2 } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
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
  const [confirmIssue, setConfirmIssue] = useState(null); // issue for confirmation

  const statuses = ["Pending", "Progress", "Resolved"];

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
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
        {
          status: selectedStatus,
          reportId: confirmIssue._id,
          token,
        },
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

  const cancelStatusChange = () => {
    setConfirmIssue(null);
    setSelectedStatus(null);
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );

  if (issues.length < 1)
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-3xl font-bold">No issues reported.</h3>
          <p className="mt-2 text-gray-500">check back again later.</p>
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-screen py-4 flex flex-col items-center gap-4">
      {confirmIssue && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 text-center shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Status Change</h3>
            <p className="mb-6">
              Change status of "
              <span className="font-semibold">{confirmIssue.title}</span>" to{" "}
              <span className="font-semibold">{selectedStatus}</span>?
            </p>
            <div className="flex justify-around gap-4">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveStatusChange}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {issues.map((issue) => {
        const isExpanded = expanded[issue._id];

        // Only show other statuses in select
        const availableStatuses = statuses.filter((s) => s !== issue.status);

        return (
          <div
            key={issue._id}
            className="bg-white w-full max-w-xl rounded-2xl shadow-md overflow-hidden flex flex-col last-of-type:mb-16"
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
                    Ward {issue.ward_number} · {issue.category} · {issue.status}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {timeAgo(issue.createdAt)}
              </span>
            </div>

            {/* Title & Description */}
            <div className="px-4 pb-4">
              <h4 className="text-gray-900 font-semibold">{issue.title}</h4>
              <p
                className={`text-gray-700 text-sm ${!isExpanded ? "max-h-5 overflow-hidden" : ""}`}
              >
                {issue.description}
              </p>
              {issue.description.length > 100 && (
                <p
                  onClick={() => toggleDescription(issue._id)}
                  className="text-blue-500 text-sm cursor-pointer select-none"
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </p>
              )}
            </div>

            {/* Image */}
            {issue.media?.length > 0 && (
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
                      className="w-full max-h-60 object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {/* Upvotes / Downvotes */}
            <div className="flex justify-between px-4 py-3 items-center text-gray-500 text-sm border-t border-gray-200">
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

            {/* Status select */}
            <div className="w-full flex gap-2 p-2">
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(issue, e.target.value)}
                className="w-full border border-2 py-2 px-1 rounded-md"
              >
                <option value={issue.status}>{issue.status}</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}

      {/* Confirmation Modal */}
    </div>
  );
};

export default GovHome;
