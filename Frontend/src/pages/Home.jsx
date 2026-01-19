import { Loader2, MoveDown, MoveUp, User2 } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../contexts/AppContext";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "../styles.css";

// import required modules
import { Pagination } from "swiper/modules";
const Home = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // track expanded description per issue
  const { user, setUser } = useContext(AppContext);

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

  const handleUpvote = async (e) => {
    try {
      const token = localStorage.getItem("token");

      const hasUpvoted = user.upvotes.some(
        (up) => up.toString() === e.toString(),
      );

      if (!hasUpvoted) {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
          { reportId: e, token, method: "push" },
        );

        if (res.status === 200 && res.data.success) {
          setUser((prevUser) => ({
            ...prevUser,
            upvotes: [...prevUser.upvotes, e],
            downvotes: prevUser.downvotes.filter((down) => down !== e),
          }));

          setIssues((prevIssues) =>
            prevIssues.map((issue) => {
              if (issue._id === e && !issue.upvotes.includes(user._id)) {
                return {
                  ...issue,
                  upvotes: [...issue.upvotes, user._id],
                  downvotes: issue.downvotes.filter(
                    (down) => down !== user._id,
                  ),
                };
              }
              return issue;
            }),
          );
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/upvote`,
          { reportId: e, token, method: "pull" },
        );

        if (res.status === 200 && res.data.success) {
          setUser((prevUser) => ({
            ...prevUser,
            upvotes: prevUser.upvotes.filter((up) => up !== e),
          }));

          setIssues((prevIssues) =>
            prevIssues.map((issue) => {
              if (issue._id === e && issue.upvotes.includes(user._id)) {
                return {
                  ...issue,
                  upvotes: issue.upvotes.filter((id) => id !== user._id),
                };
              }
              return issue;
            }),
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleDownvote = async (e) => {
    try {
      const token = localStorage.getItem("token");

      const hasDownvoted = user.downvotes.some(
        (down) => down.toString() === e.toString(),
      );

      if (!hasDownvoted) {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`,
          { reportId: e, token, method: "push" },
        );

        setUser((prevUser) => ({
          ...prevUser,
          downvotes: [...prevUser.downvotes, e],
          upvotes: prevUser.upvotes.filter((up) => up !== e),
        }));

        setIssues((prevIssues) =>
          prevIssues.map((issue) => {
            if (issue._id === e && !issue.downvotes.includes(user._id)) {
              return {
                ...issue,
                downvotes: [...issue.downvotes, user._id],
                upvotes: issue.upvotes.filter((up) => up !== user._id),
              };
            }
            return issue;
          }),
        );
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/downvote`,
          { reportId: e, token, method: "pull" },
        );

        if (res.status === 200 && res.data.success) {
          setUser((prevUser) => ({
            ...prevUser,
            downvotes: prevUser.downvotes.filter((down) => down !== e),
          }));

          setIssues((prevIssues) =>
            prevIssues.map((issue) => {
              if (issue._id === e && issue.downvotes.includes(user._id)) {
                return {
                  ...issue,
                  downvotes: issue.downvotes.filter((id) => id !== user._id),
                };
              }
              return issue;
            }),
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center ">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );

  if (issues.length < 1)
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-3xl font-bold">No issues reported.</h3>
          <p className="mt-2 text-gray-500">
            If you have an issue,{" "}
            <Link to="/create" className="text-blue-500 border-b-2">
              report here
            </Link>
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full  min-h-screen py-4 flex flex-col items-center gap-4  ">
      {issues.map((issue) => {
        const hasUpvoted = user.upvotes.includes(issue._id);
        const hasDownvoted = user.downvotes.includes(issue._id);
        const isMine = user.reports.includes(issue._id);

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
              <h4 className="text-gray-900 font-semibold ">{issue.title}</h4>
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
                {isMine && (
                  <span className="text-gray-700 font-medium">Your Report</span>
                )}
              </div>
            </div>
            {issue.changer ? (
              <p className="px-4">
                Status updated to {issue.status} by {issue.changer.name}
              </p>
            ) : !isMine ? (
              <div className="flex gap-2 p-2">
                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvote(issue._id)}
                  className={`flex items-center gap-1 px-3 py-3 rounded-full transition cursor-pointer ${
                    hasUpvoted
                      ? "bg-pink-100 text-pink-600"
                      : "bg-black text-zinc-300 hover:bg-zinc-600"
                  }`}
                >
                  <MoveUp size={18} />
                  <span className="text-sm">
                    {hasUpvoted ? "Upvoted" : "Upvote"}
                  </span>
                </button>

                {/* Downvote Button */}
                <button
                  onClick={() => handleDownvote(issue._id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full transition cursor-pointer ${
                    hasDownvoted
                      ? "bg-pink-100 text-pink-600"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <MoveDown size={18} />
                  <span className="text-sm">
                    {hasDownvoted ? "Downvoted" : "Downvote"}
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default Home;
