import {useThemeStore} from "../../../../infrastructure/theme/themeStore";

export class ToggleThemeUseCase {
  static execute(): void {
    useThemeStore.getState().toggleTheme();
  }
}
