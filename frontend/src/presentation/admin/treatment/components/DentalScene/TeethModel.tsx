"use client";

import React, {useEffect, useMemo, useState} from "react";
import {Html, useGLTF} from "@react-three/drei";
import type {ThreeEvent} from "@react-three/fiber";
import * as THREE from "three";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {getToothLabel} from "../../data/toothNames.data";
import {useToothMaterials} from "../../hooks/useToothMaterials";

const MODEL_PATH = "/models/Teeth.glb";

function findToothId(object: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (current.name.startsWith("tooth_")) {
      return current.name;
    }

    current = current.parent;
  }

  return null;
}

function getObjectCenter(object: THREE.Object3D): [number, number, number] {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());

  return [center.x, center.y + 0.12, center.z];
}

function getObjectRadius(object: THREE.Object3D): number {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());

  return Math.max(size.x, size.y, size.z) * 0.42;
}

export const TeethModel = React.memo(function TeethModel() {
  const gltf = useGLTF(MODEL_PATH);
  const scene = gltf.scene;
  const hoveredToothId = useDentalChartStore((state) => state.hoveredToothId);
  const selectedToothId = useDentalChartStore((state) => state.selectedToothId);
  const treatments = useDentalChartStore((state) => state.treatments);
  const setHoveredTooth = useDentalChartStore((state) => state.setHoveredTooth);
  const setSelectedTooth = useDentalChartStore(
    (state) => state.setSelectedTooth,
  );
  const setToothSurfacePosition = useDentalChartStore(
    (state) => state.setToothSurfacePosition,
  );
  const setToothSurfaceRotation = useDentalChartStore(
    (state) => state.setToothSurfaceRotation,
  );
  const setToothSurfaceRadius = useDentalChartStore(
    (state) => state.setToothSurfaceRadius,
  );
  const [tooltipPosition, setTooltipPosition] = useState<
    [number, number, number] | null
  >(null);

  useToothMaterials({scene, hoveredToothId, selectedToothId, treatments});

  const normalizedScene = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 7.4 / maxAxis;

    scene.scale.setScalar(scale);
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return scene;
  }, [scene]);

  useEffect(() => {
    normalizedScene.updateMatrixWorld(true);
    const quaternion = new THREE.Quaternion();

    normalizedScene.traverse((object) => {
      if (object.name.startsWith("tooth_")) {
        object.getWorldQuaternion(quaternion);
        setToothSurfacePosition(object.name, getObjectCenter(object));
        setToothSurfaceRotation(object.name, [
          quaternion.x,
          quaternion.y,
          quaternion.z,
          quaternion.w,
        ]);
        setToothSurfaceRadius(object.name, getObjectRadius(object));
      }
    });
  }, [
    normalizedScene,
    setToothSurfacePosition,
    setToothSurfaceRadius,
    setToothSurfaceRotation,
  ]);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    const toothId = findToothId(event.object);

    if (!toothId) {
      return;
    }

    event.stopPropagation();
    document.body.style.cursor = "pointer";
    setHoveredTooth(toothId);
    setTooltipPosition(getObjectCenter(event.object));
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    const toothId = findToothId(event.object);

    if (!toothId) {
      return;
    }

    document.body.style.cursor = "";
    setHoveredTooth(null);
    setTooltipPosition(null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const toothId = findToothId(event.object);

    if (!toothId) {
      return;
    }

    event.stopPropagation();
    setSelectedTooth(toothId);
  };

  return (
    <>
      <primitive
        object={normalizedScene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {hoveredToothId && tooltipPosition && (
        <Html position={tooltipPosition} center distanceFactor={4}>
          <div className="pointer-events-none whitespace-nowrap rounded border border-sky-200/80 bg-white/90 px-1 py-px text-[0.5rem] font-medium leading-none text-slate-700 shadow-sm dark:border-sky-900/70 dark:bg-slate-950/90 dark:text-slate-100">
            {getToothLabel(hoveredToothId)}
          </div>
        </Html>
      )}
    </>
  );
});

useGLTF.preload(MODEL_PATH);
