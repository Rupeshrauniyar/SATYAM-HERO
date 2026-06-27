import React, { useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown, FileText } from "lucide-react";

export default function Profile() {
  const { user } = useContext(AppContext);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32 text-x-text-secondary">
        Loading profile...
      </div>
    );
  }

  const formattedDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div>
      {/* Banner */}
      <div className="h-32 bg-x-bg-secondary border-b border-x-border" />

      <div className="px-4 pb-6">
        <div className="flex justify-between items-end -mt-12 mb-4">
          <div className="x-avatar x-avatar-lg w-24 h-24 text-3xl border-4 border-x-bg">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>

        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-x-text-secondary text-sm">+977 {user.phone_number}</p>

        <div className="flex items-center gap-2 mt-2">
          {user.verified ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-x-text-secondary">
            {user.verified ? "Verified account" : "Unverified account"}
          </span>
        </div>

        {/* Stats row — X style */}
        <div className="flex gap-5 mt-4 text-sm">
          <StatInline label="Reports" value={user.reports?.length || 0} />
          <StatInline label="Upvotes" value={user.upvotes.length} />
          <StatInline label="Downvotes" value={user.downvotes.length} />
        </div>

        <div className="mt-6 space-y-3">
          <div className="x-panel">
            <h2 className="font-bold mb-3">Account Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Detail label="Joined" value={formattedDate(user.createdAt)} />
              <Detail label="Last updated" value={formattedDate(user.updatedAt)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={<ThumbsUp size={18} />} label="Upvotes" value={user.upvotes.length} />
            <StatCard icon={<ThumbsDown size={18} />} label="Downvotes" value={user.downvotes.length} />
            <StatCard icon={<FileText size={18} />} label="Reports" value={user.reports?.length || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatInline({ label, value }) {
  return (
    <span>
      <strong className="text-x-text">{value}</strong>{" "}
      <span className="text-x-text-secondary">{label}</span>
    </span>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="x-panel text-center py-4">
      <div className="flex justify-center text-x-text-secondary mb-1">{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-x-text-secondary">{label}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-x-text-secondary text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
