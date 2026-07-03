export const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
export const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

export const PRIMARY_UPPER_RIGHT = [55, 54, 53, 52, 51];
export const PRIMARY_UPPER_LEFT = [61, 62, 63, 64, 65];
export const PRIMARY_LOWER_RIGHT = [85, 84, 83, 82, 81];
export const PRIMARY_LOWER_LEFT = [71, 72, 73, 74, 75];

export const DENTITION_MODES = [
  {id: "adult", label: "Adult"},
  {id: "child", label: "Child"},
  {id: "mixed", label: "Mixed"},
] as const;

export const MOUTH_REGION_OPTIONS = [
  {id: "whole_mouth", label: "Whole Mouth", hint: "All teeth"},
  {id: "upper_arch", label: "Upper Arch", hint: "Top side"},
  {id: "lower_arch", label: "Lower Arch", hint: "Bottom side"},
  {id: "upper_right", label: "Upper Right", hint: "Quadrant 1"},
  {id: "upper_left", label: "Upper Left", hint: "Quadrant 2"},
  {id: "lower_left", label: "Lower Left", hint: "Quadrant 3"},
  {id: "lower_right", label: "Lower Right", hint: "Quadrant 4"},
] as const;
