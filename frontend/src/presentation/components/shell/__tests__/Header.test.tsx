import {render, screen, fireEvent} from "@testing-library/react";
import Header from "../../../landing/Header";

// Mock the next-intl hooks
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `mock_${key}`,
}));

describe("Header component", () => {
  it("renders the persistent header with logo, navigation, language selector, and theme toggle", () => {
    render(<Header />);
    // Check for logo
    expect(screen.getByRole("banner")).toBeInTheDocument();

    // Desktop navigation links should be rendered
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    // Language dropdown should be present
    expect(
      screen.getByRole("combobox", {name: /language/i}),
    ).toBeInTheDocument();

    // Theme toggle should be present
    expect(screen.getByRole("button", {name: /theme/i})).toBeInTheDocument();
  });

  it("toggles mobile menu when hamburger is clicked", () => {
    // Note: To test mobile navigation, we might need to mock window size or just test the click handler opens a dialog/menu.
    // For MUI Drawer/Menu, it usually renders a button to toggle it.
    render(<Header />);

    const menuButton = screen.getByRole("button", {name: /menu/i});
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);
    // After click, the mobile drawer or menu should be visible.
    // We check for a dialog or the navigation block.
    expect(screen.getByRole("dialog")).toBeVisible();
  });
});
