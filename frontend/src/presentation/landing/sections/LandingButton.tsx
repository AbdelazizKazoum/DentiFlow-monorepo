import React from "react";

export const LandingButton = ({
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variants: Record<string, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200",
    secondary:
      "bg-white text-blue-600 border border-gray-100 hover:bg-gray-50 shadow-sm",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
  };
  return (
    <button
      className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
