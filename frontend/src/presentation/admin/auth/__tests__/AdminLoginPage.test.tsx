import React from "react";
import {render, screen, fireEvent, waitFor, act} from "@testing-library/react";
import {AdminLoginForm} from "../components/AdminLoginForm";
import {BrandingPanel} from "../components/BrandingPanel";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    div: ({children, ...props}: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

jest.mock("@/presentation/stores/adminAuthStore", () => ({
  useAdminAuthStore: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({push: jest.fn()}),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

import {useAdminAuthStore} from "@/presentation/stores/adminAuthStore";

const mockLogin = jest.fn();

beforeEach(() => {
  (useAdminAuthStore as jest.Mock).mockImplementation(
    (selector: (s: {login: jest.Mock}) => unknown) =>
      selector({login: mockLogin}),
  );
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("AdminLoginForm", () => {
  it("renders email input, password input, and submit button", () => {
    render(<AdminLoginForm />);

    expect(screen.getByLabelText("login.email_label")).toBeInTheDocument();
    expect(screen.getByLabelText("login.password_label")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {name: /login.submit/i}),
    ).toBeInTheDocument();
  });

  it("shows validation error when submitted with empty email", async () => {
    render(<AdminLoginForm />);

    const form = screen.getByLabelText("login.email_label").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("validation.email_required")).toBeInTheDocument();
    });
  });

  it("shows validation error when submitted with empty password", async () => {
    render(<AdminLoginForm />);

    // Fill in email so only password triggers error
    fireEvent.change(screen.getByLabelText("login.email_label"), {
      target: {value: "admin@dentiflow.com"},
    });

    const form = screen.getByLabelText("login.email_label").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("validation.password_required"),
      ).toBeInTheDocument();
    });
  });

  it("toggles password visibility when eye button is clicked", () => {
    render(<AdminLoginForm />);

    // Password input should be type="password" initially
    const passwordInput = screen.getByLabelText(
      "login.password_label",
    ) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", {
      name: /toggle password visibility/i,
    });
    fireEvent.click(toggleBtn);

    // After toggle, should be type="text"
    expect(passwordInput.type).toBe("text");
  });

  it("calls store login with form data on submission", async () => {
    mockLogin.mockResolvedValue(true);

    render(<AdminLoginForm />);

    fireEvent.change(screen.getByLabelText("login.email_label"), {
      target: {value: "admin@dentiflow.com"},
    });

    fireEvent.change(screen.getByLabelText("login.password_label"), {
      target: {value: "admin123"},
    });

    const form = screen.getByLabelText("login.email_label").closest("form")!;
    fireEvent.submit(form);

    // Wait for loading state, then advance the 1500ms timer
    await waitFor(() =>
      expect(screen.getByText("login.authenticating")).toBeInTheDocument(),
    );

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "admin@dentiflow.com",
          password: "admin123",
        }),
      );
    });
  });

  it("shows error status message when credentials are wrong", async () => {
    mockLogin.mockResolvedValue(false);

    render(<AdminLoginForm />);

    fireEvent.change(screen.getByLabelText("login.email_label"), {
      target: {value: "wrong@dentiflow.com"},
    });

    fireEvent.change(screen.getByLabelText("login.password_label"), {
      target: {value: "wrongpass"},
    });

    const form = screen.getByLabelText("login.email_label").closest("form")!;
    fireEvent.submit(form);

    // Wait for loading state, then advance the 1500ms timer
    await waitFor(() =>
      expect(screen.getByText("login.authenticating")).toBeInTheDocument(),
    );

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByText("login.error")).toBeInTheDocument();
    });
  });
});

describe("BrandingPanel", () => {
  it("renders the company name and tagline", () => {
    render(<BrandingPanel />);

    // Company name contains "Denti" and "Flow" in separate spans
    expect(screen.getByText(/Denti/i)).toBeInTheDocument();
    // h1 heading contains both taglines (may span multiple text nodes)
    const heading = screen.getByRole("heading", {level: 1});
    expect(heading).toHaveTextContent("branding.tagline_1");
    expect(heading).toHaveTextContent("branding.tagline_2");
  });
});
