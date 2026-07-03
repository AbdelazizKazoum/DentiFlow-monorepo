import type {
  DentitionMode,
  SurfaceCode,
  TreatmentLocation,
} from "../entities";

export const MOUTH_REGION_LABELS: Record<string, string> = {
  whole_mouth: "Whole Mouth",
  upper_arch: "Upper Arch",
  lower_arch: "Lower Arch",
  upper_right: "Upper Right",
  upper_left: "Upper Left",
  lower_left: "Lower Left",
  lower_right: "Lower Right",
};

export interface BuildTreatmentLocationInput {
  selectedTeeth: number[];
  mouthRegionId?: string;
  surfacesByTooth: Record<number, SurfaceCode[]>;
  dentition: DentitionMode;
}

export function buildTreatmentLocation({
  selectedTeeth,
  mouthRegionId,
  surfacesByTooth,
  dentition,
}: BuildTreatmentLocationInput): TreatmentLocation {
  if (mouthRegionId || selectedTeeth.length === 0) {
    const regionId = mouthRegionId ?? "whole_mouth";
    return {
      mouthRegionId: regionId,
      label: MOUTH_REGION_LABELS[regionId] ?? regionId,
      surfaces: [],
      dentition,
    };
  }

  if (selectedTeeth.length === 1) {
    const tooth = selectedTeeth[0];
    return {
      tooth,
      label: String(tooth),
      surfaces: surfacesByTooth[tooth] ?? [],
      dentition,
    };
  }

  return {
    toothIds: selectedTeeth,
    label: `Teeth ${selectedTeeth.join(", ")}`,
    surfaces: [],
    surfacesByTooth: selectedTeeth.reduce<Record<number, SurfaceCode[]>>(
      (acc, tooth) => {
        acc[tooth] = surfacesByTooth[tooth] ?? [];
        return acc;
      },
      {},
    ),
    dentition,
  };
}

export function getLocationToothIds(location: TreatmentLocation): number[] {
  if (location.toothIds?.length) return location.toothIds;
  return typeof location.tooth === "number" ? [location.tooth] : [];
}
