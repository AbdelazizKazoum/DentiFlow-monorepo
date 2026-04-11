import {render, screen} from "@testing-library/react";
import PatientShell from "../PatientShell";

// Mock Header to isolate PatientShell testing
jest.mock("../Header", () => {
  const MockHeader = () => <div data-testid="mock-header" />;
  MockHeader.displayName = "MockHeader";
  return MockHeader;
});

describe("PatientShell component", () => {
  it("renders Header and children", () => {
    render(
      <PatientShell>
        <div data-testid="child-content">Child Content</div>
      </PatientShell>,
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });
});
