import React from "react";
import Header from "./Header";

interface PatientShellProps {
  children: React.ReactNode;
}

export default function PatientShell({children}: PatientShellProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
