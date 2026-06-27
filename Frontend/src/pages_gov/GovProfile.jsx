import React, { useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { CheckCircle, XCircle } from "lucide-react";

export default function GovProfile() {
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
      <div className="h-32 bg-x-bg-secondary border-b border-x-border" />
      <div className="px-4 pb-6">
        <div className="x-avatar x-avatar-lg w-24 h-24 text-3xl border-4 border-x-bg -mt-12 mb-4">
          {user.name?.charAt(0)?.toUpperCase()}
        </div>
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-x-text-secondary text-sm">+977 {user.phone_number}</p>
        <span className="inline-block mt-2 x-badge x-badge-progress">Government Official</span>
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
        <div className="x-panel mt-6">
          <h2 className="font-bold mb-3">Account Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-x-text-secondary text-xs">Joined</p>
              <p className="font-semibold">{formattedDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-x-text-secondary text-xs">Last updated</p>
              <p className="font-semibold">{formattedDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
