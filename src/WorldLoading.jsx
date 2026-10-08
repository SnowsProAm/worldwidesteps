import React from "react";

export default function WorldLoading() {
  return (
    <div className="world-loading" role="status" aria-label="Loading World Wide Steps">
      <span className="world-loading-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" />
          <ellipse cx="24" cy="24" rx="8" ry="18" />
          <path d="M6 24h36M9 14h30M9 34h30" />
        </svg>
      </span>
    </div>
  );
}
