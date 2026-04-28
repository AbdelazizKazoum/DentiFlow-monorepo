"use client";

import * as React from "react";
import {ThemeProvider, createTheme, CssBaseline} from "@mui/material";

interface ThemeRegistryProps {
  children: React.ReactNode;
  direction?: "ltr" | "rtl";
}

const themeOptions = {
  typography: {
    fontFamily: "var(--font-public-sans), 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  palette: {
    primary: {
      main: "#1e56d0",
      light: "#3b82f6",
      dark: "#1847b0",
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
