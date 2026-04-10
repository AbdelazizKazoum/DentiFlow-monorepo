"use client";

import * as React from "react";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";
import {ThemeRegistry} from "./ThemeRegistry";
import rtlPlugin from "stylis-plugin-rtl";
import {prefixer} from "stylis";

interface AppThemeProviderProps {
  children: React.ReactNode;
  direction?: "ltr" | "rtl";
}

export function AppThemeProvider({
  children,
  direction = "ltr",
}: AppThemeProviderProps) {
  if (!["ltr", "rtl"].includes(direction)) {
    console.warn(`Invalid direction "${direction}". Defaulting to "ltr".`);
    direction = "ltr";
  }

  const options =
    direction === "rtl"
      ? {key: "muirtl", stylisPlugins: [prefixer, rtlPlugin]}
      : {key: "muiltr"};

  return (
    <AppRouterCacheProvider options={{...options, prepend: true}}>
      <ThemeRegistry direction={direction}>{children}</ThemeRegistry>
    </AppRouterCacheProvider>
  );
}
