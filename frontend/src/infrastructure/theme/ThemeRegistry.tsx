"use client";

import * as React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

interface ThemeRegistryProps {
  children: React.ReactNode;
  direction?: "ltr" | "rtl";
}

const themeOptions = {
  typography: {
    fontFamily:
      "var(--font-public-sans), 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeightLight: 400,
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
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#444050",
      secondary: "#6d6b77",
      disabled: "#acaab1",
    },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#444050",
          fontWeight: 300,
        },
        input: {
          "&::placeholder": {
            color: "#acaab1",
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d0d0d0",
            borderWidth: "1px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1e56d0",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1e56d0",
            borderWidth: "1px",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#6d6b77",
          fontWeight: 300,
        },
      },
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

const darkThemeOptions = {
  ...themeOptions,
  palette: {
    ...themeOptions.palette,
    background: {
      default: "#1a2035",
      paper: "#2f3349",
    },
    text: {
      primary: "#cdd0dd",
      secondary: "#9e9caa",
      disabled: "#5c5a67",
    },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#cdd0dd",
          fontWeight: 300,
        },
        input: {
          "&::placeholder": {
            color: "#5c5a67",
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#374151",
            borderWidth: "1px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1e56d0",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1e56d0",
            borderWidth: "1px",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#9e9caa",
          fontWeight: 300,
        },
      },
    },
  },
};

const darkLtrTheme = createTheme({
  ...darkThemeOptions,
  direction: "ltr",
});

const darkRtlTheme = createTheme({
  ...darkThemeOptions,
  direction: "rtl",
});

export function ThemeRegistry({
  children,
  direction = "ltr",
}: ThemeRegistryProps) {
  // This is a placeholder for a real theme switching logic
  const isDarkMode = false;

  let theme;
  if (isDarkMode) {
    theme = direction === "rtl" ? darkRtlTheme : darkLtrTheme;
  } else {
    theme = direction === "rtl" ? rtlTheme : ltrTheme;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
