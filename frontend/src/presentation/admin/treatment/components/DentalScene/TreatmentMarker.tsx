"use client";

import React, {useRef} from "react";
import {Line} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";

interface TreatmentMarkerProps {
  treatment: ToothTreatment;
  position: [number, number, number];
  radius?: number;
}

export const TreatmentMarker = React.memo(function TreatmentMarker({
  treatment,
  position,
  radius = 0.16,
}: TreatmentMarkerProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const {camera} = useThree();

  useFrame(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const center = new THREE.Vector3(position[0], position[1], position[2]);
    const cameraDirection = new THREE.Vector3()
      .subVectors(camera.position, center)
      .normalize();

    group.position.copy(
      center.addScaledVector(cameraDirection, Math.max(radius, 0.08)),
    );
    group.quaternion.copy(camera.quaternion);
  });

  if (treatment.status === "completed" || treatment.actId !== "extraction") {
    return null;
  }

  return (
    <group ref={groupRef}>
      <Line
        points={[
          [-0.038, -0.038, 0],
          [0.038, 0.038, 0],
        ]}
        color="#111827"
        lineWidth={2}
        transparent
        opacity={0.92}
        depthTest
      />
      <Line
        points={[
          [-0.038, 0.038, 0],
          [0.038, -0.038, 0],
        ]}
        color="#111827"
        lineWidth={2}
        transparent
        opacity={0.92}
        depthTest
      />
    </group>
  );
});
