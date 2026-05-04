import React from "react";
import { StaffCardSkeleton } from "./StaffCardSkeleton";

export function StaffGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <StaffCardSkeleton key={index} />
      ))}
    </div>
  );
}
