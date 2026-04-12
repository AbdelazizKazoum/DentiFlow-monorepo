import React from "react";
import {render, screen, act} from "@testing-library/react";
import {AdminDashboard} from "./AdminDashboard";

// Mock the stores
jest.mock("../../../infrastructure/theme/themeStore", () => ({
  useThemeStore: () => ({theme: {mode: "light"}}),
}));

jest.mock("../../../infrastructure/theme/sidebarStore", () => ({
  useSidebarStore: () => ({isCollapsed: false}),
}));

// Mock the use cases
jest.mock(
  "../../../application/useCases/admin/dashboard/loadDashboardData",
  () => ({
    LoadDashboardDataUseCase: {
      execute: jest.fn().mockResolvedValue({
        stats: [],
        todayAppointments: [],
        appointmentRequests: [],
        patientDetails: {
          id: "1",
          name: "Test Patient",
          avatar: "",
          address: "",
          dob: "",
          sex: "",
          weight: "",
          height: "",
          lastAppointment: "",
          registerDate: "",
          conditions: [],
        },
        chartData: [],
      }),
    },
  }),
);

describe("AdminDashboard", () => {
  it("renders dashboard content after loading", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });
    // Wait for the component to load and render stats
    await screen.findByText("Test Patient");
    expect(screen.getByText("Test Patient")).toBeInTheDocument();
  });
});
