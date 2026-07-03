"use client";

import {useMemo} from "react";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {TreatmentMarker} from "./TreatmentMarker";

export function TreatmentMarkers() {
  const treatments = useDentalChartStore((state) => state.treatments);
  const toothSurfacePositions = useDentalChartStore(
    (state) => state.toothSurfacePositions,
  );
  const toothSurfaceRadii = useDentalChartStore(
    (state) => state.toothSurfaceRadii,
  );

  const extractionTreatments = useMemo(
    () =>
      treatments.filter(
        (treatment) =>
          treatment.actId === "extraction" && treatment.status !== "completed",
      ),
    [treatments],
  );

  return (
    <>
      {extractionTreatments.map((treatment) => {
        const toothCenter = toothSurfacePositions[treatment.toothId];
        const position: [number, number, number] = toothCenter
          ? [toothCenter[0], toothCenter[1] - 0.12, toothCenter[2]]
          : treatment.position;

        return (
          <TreatmentMarker
            key={treatment.id}
            treatment={treatment}
            position={position}
            radius={toothSurfaceRadii[treatment.toothId]}
          />
        );
      })}
    </>
  );
}
