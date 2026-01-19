import React, { useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import {
  CheckCircleIcon,
  XCircleIcon,
  ThumbsUp,
  ThumbsDown,
  User,
} from "lucide-react";

export default function GovProfile() {
  const { user } = useContext(AppContext);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
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
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 pb-20 py-2">
      <div className="w-full max-w-4xl">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
            {user.name?.charAt(0) || <User />}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold text-gray-900">
              {user.name}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              {user.verified ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm text-gray-500">
                {user.verified ? "Verified Account" : "Unverified Account"}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Phone: {user.phone_number}
            </p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail
              label="Account Created"
              value={formattedDate(user.createdAt)}
            />
            <Detail
              label="Last Updated"
              value={formattedDate(user.updatedAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-gray-400">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
