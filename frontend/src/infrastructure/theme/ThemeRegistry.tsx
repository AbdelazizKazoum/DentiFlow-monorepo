"use client";

import * as React from "react";
import {ThemeProvider, createTheme, CssBaseline} from "@mui/material";
import {useThemeStore} from "./themeStore";

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
    fontSize: 16,
  },
  shape: {
    borderRadius: 8,
  },
  palette: {
    primary: {
      main: "#0f8aa3",
      light: "#31c6d4",
      dark: "#0b6f85",
    },
    background: {
      default: "#f5f8fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#25333a",
      secondary: "#64747c",
      disabled: "#98a6ad",
    },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#25333a",
          fontWeight: 400,
        },
        input: {
          "&::placeholder": {
            color: "#98a6ad",
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#dbe7ec",
            borderWidth: "1px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0f8aa3",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0f8aa3",
            borderWidth: "1px",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#64747c",
          fontWeight: 500,
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
      default: "#111b22",
      paper: "#18262e",
    },
    text: {
      primary: "#dbe7ec",
      secondary: "#9eb0b8",
      disabled: "#687b84",
    },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#dbe7ec",
          fontWeight: 400,
        },
        input: {
          "&::placeholder": {
            color: "#687b84",
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#263943",
            borderWidth: "1px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#31c6d4",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#31c6d4",
            borderWidth: "1px",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#9eb0b8",
          fontWeight: 500,
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
  const { theme } = useThemeStore();
  const isDarkMode = theme.mode === "dark";

  let themeMui;
  if (isDarkMode) {
    themeMui = direction === "rtl" ? darkRtlTheme : darkLtrTheme;
  } else {
    themeMui = direction === "rtl" ? rtlTheme : ltrTheme;
  }

  return (
    <ThemeProvider theme={themeMui}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
