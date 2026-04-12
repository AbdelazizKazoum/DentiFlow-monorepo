import {useSidebarStore} from "../../../../infrastructure/theme/sidebarStore";

export class ToggleSidebarUseCase {
  static execute(): void {
    useSidebarStore.getState().toggleSidebar();
  }
}
