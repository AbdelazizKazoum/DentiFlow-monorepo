import React from "react";

export function StaffCardSkeleton() {
  return (
    <div
      className="bg-card border rounded-xl p-5 flex flex-col gap-4 animate-pulse"
      style={{ borderColor: "var(--border-ui)" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0"></div>
          <div className="min-w-0 flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
      </div>

      {/* Contact */}
      <div
        className="space-y-1.5 border-t pt-3"
        style={{ borderColor: "var(--border-ui)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>

      {/* Join date */}
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
    </div>
  );
}
