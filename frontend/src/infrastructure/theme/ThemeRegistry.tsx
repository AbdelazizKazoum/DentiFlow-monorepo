"use client";

import * as React from "react";
import {ThemeProvider, createTheme, CssBaseline} from "@mui/material";

interface ThemeRegistryProps {
  children: React.ReactNode;
  direction?: "ltr" | "rtl";
}

const themeOptions = {
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
  },
  palette: {
    primary: {
      main: "#0a66c2",
      light: "#3b82f6",
      dark: "#1d4ed8",
    },
    background: {
      default: "var(--background)",
      paper: "var(--background)",
    },
  },
};

const ltrTheme = createTheme({
  ...themeOptions,
  direction: "ltr",
});

const rtlTheme = createTheme({
  ...themeOptions,
  direction: "rtl",
});

export function ThemeRegistry({
  children,
  direction = "ltr",
}: ThemeRegistryProps) {
  const theme = direction === "rtl" ? rtlTheme : ltrTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
