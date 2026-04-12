// Theme domain entity

export interface Theme {
  mode: "light" | "dark";
}

export interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}
