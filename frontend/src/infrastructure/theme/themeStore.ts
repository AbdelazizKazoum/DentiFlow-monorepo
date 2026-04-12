import {create} from "zustand";
import {persist} from "zustand/middleware";
import {Theme, ThemeState} from "../../domain/dashboard/theme";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: {mode: "light"},
      toggleTheme: () =>
        set((state) => ({
          theme: {
            mode: state.theme.mode === "light" ? "dark" : "light",
          },
        })),
    }),
    {
      name: "theme-storage",
    },
  ),
);
