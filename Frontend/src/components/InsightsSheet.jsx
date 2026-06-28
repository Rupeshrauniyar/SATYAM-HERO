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
          <div className="mb-4">
            <p className="text-sm font-semibold">{report?.title || "Issue activity"}</p>
            <p className="text-sm text-x-text-secondary mt-1">
              {report?.ward_number ? `Ward ${report?.ward_number}` : "Community issue"} · {report?.category || "General"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="x-panel py-3">
                <div className="flex items-center gap-2">
                  <Icon size={15} className={color} />
                  <p className="text-xs text-x-text-secondary">{label}</p>
                </div>
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="x-panel">
            <p className="text-sm font-semibold mb-2">Approval</p>
            <div className="h-2 rounded-full bg-x-border overflow-hidden">
              <div className="h-full rounded-full bg-x-accent" style={{ width: `${approval}%` }} />
            </div>
            <p className="text-xs text-x-text-secondary mt-2">{approval}% positive based on votes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
