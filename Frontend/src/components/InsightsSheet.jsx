import React, { useEffect, useState } from "react";
import { X, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, Share2 } from "lucide-react";

export default function InsightsSheet({ report, open, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = "auto";
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!visible && !open) return null;

  const upvotes = report?.upvotes?.length || 0;
  const downvotes = report?.downvotes?.length || 0;
  const comments = report?.comments?.length || 0;
  const shares = report?.shares || 0;
  const total = upvotes + downvotes || 1;
  const approval = Math.round((upvotes / total) * 100);

  const stats = [
    { icon: ThumbsUp, label: "Upvotes", value: upvotes, color: "text-x-accent" },
    { icon: ThumbsDown, label: "Downvotes", value: downvotes, color: "text-red-500" },
    { icon: MessageCircle, label: "Comments", value: comments, color: "text-x-text" },
    { icon: Share2, label: "Shares", value: shares, color: "text-x-text" },
  ];

  return (
    <div className={`x-sheet-root ${open ? "x-sheet-open" : "x-sheet-closing"}`}>
      <div className="x-sheet-backdrop" onClick={onClose} />

      <div className="x-sheet">
        <div className="x-sheet-handle" />

        <div className="x-sheet-header">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-x-accent" />
            <h2 className="font-bold text-lg">Insights</h2>
          </div>
          <button onClick={onClose} className="x-btn-ghost text-x-text-secondary">
            <X size={20} />
          </button>
        </div>

        <div className="x-sheet-body">
          <p className="font-bold text-base mb-1">{report?.title}</p>
          <p className="text-x-text-secondary text-sm mb-6">
            Ward {report?.ward_number} · {report?.category} · {report?.status}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="x-panel text-center py-4">
                <Icon size={20} className={`mx-auto mb-1 ${color}`} />
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-x-text-secondary">{label}</p>
              </div>
            ))}
          </div>

          <div className="x-panel">
            <p className="text-sm font-bold mb-2">Community approval</p>
            <div className="h-2.5 rounded-full bg-x-border overflow-hidden">
              <div
                className="h-full rounded-full bg-x-accent transition-all duration-500"
                style={{ width: `${approval}%` }}
              />
            </div>
            <p className="text-x-text-secondary text-xs mt-2">
              {approval}% positive based on votes
            </p>
          </div>

          <div className="x-panel mt-3">
            <p className="text-sm font-bold mb-1">Engagement score</p>
            <p className="text-2xl font-bold text-x-accent">
              {upvotes + comments + shares}
            </p>
            <p className="text-x-text-secondary text-xs">
              Combined upvotes, comments & shares
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
