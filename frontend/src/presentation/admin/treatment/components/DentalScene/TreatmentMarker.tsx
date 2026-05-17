"use client";

import React from "react";
import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";

interface TreatmentMarkerProps {
  treatment: ToothTreatment;
  position: [number, number, number];
  index: number;
  count: number;
}

export const TreatmentMarker = React.memo(function TreatmentMarker({
  treatment,
  position,
  index,
  count,
}: TreatmentMarkerProps) {
  void treatment;
  void position;
  void index;
  void count;

  return null;
});
