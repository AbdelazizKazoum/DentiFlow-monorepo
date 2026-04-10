import React from "react";
import {render} from "@testing-library/react";
import {ThemeRegistry} from "./ThemeRegistry";

describe("ThemeRegistry", () => {
  it("renders children correctly in LTR mode", () => {
    const {getByText} = render(
      <ThemeRegistry direction="ltr">
        <div>Child Content LTR</div>
      </ThemeRegistry>,
    );

    expect(getByText("Child Content LTR")).toBeInTheDocument();
  });

  it("renders children correctly in RTL mode", () => {
    const {getByText} = render(
      <ThemeRegistry direction="rtl">
        <div>Child Content RTL</div>
      </ThemeRegistry>,
    );

    expect(getByText("Child Content RTL")).toBeInTheDocument();
  });
});
