import React, { useState } from "react";

export default function Avatar({ src, label = "User", className = "", ...props }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const normalizedSrc = typeof src === "string" ? src.trim() : src;
  const hasSrc = Boolean(normalizedSrc) && normalizedSrc !== "null" && normalizedSrc !== "undefined" && !loadFailed;
  const initials = (label || "").trim().charAt(0)?.toUpperCase() || "?";

  return hasSrc ? (
    <div className={`x-avatar overflow-hidden ${className}`} {...props}>
      <img
        src={normalizedSrc}
        alt={label || "avatar"}
        className="h-full w-full object-cover"
        onError={() => setLoadFailed(true)}
      />
    </div>
  ) : (
    <div className={`x-avatar ${className}`} {...props}>
      {initials}
    </div>
  );
}
