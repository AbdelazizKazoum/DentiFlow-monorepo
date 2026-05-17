"use client";

import {useCallback} from "react";
import type {DragEndEvent} from "@dnd-kit/core";
import * as THREE from "three";
import type {DentalSceneHandle} from "../components/DentalScene/SceneExposer";

interface DropResult {
  toothId: string;
  point: [number, number, number];
}

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

function getClientPoint(event: DragEndEvent): {clientX: number; clientY: number} | null {
  const activator = event.activatorEvent;

  if (!("clientX" in activator) || !("clientY" in activator)) {
    return null;
  }

  const pointer = activator as MouseEvent | PointerEvent | TouchEvent;

  if (!("clientX" in pointer) || !("clientY" in pointer)) {
    return null;
  }

  return {
    clientX: pointer.clientX + event.delta.x,
    clientY: pointer.clientY + event.delta.y,
  };
}

export function useDentalDrop(
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>,
  sceneRef: React.RefObject<DentalSceneHandle | null>,
) {
  const resolveDrop = useCallback(
    (event: DragEndEvent): DropResult | null => {
      const canvasWrapper = canvasWrapperRef.current;
      const sceneHandle = sceneRef.current;
      const point = getClientPoint(event);

      if (!canvasWrapper || !sceneHandle || !point) {
        return null;
      }

      const rect = canvasWrapper.getBoundingClientRect();

      if (
        point.clientX < rect.left ||
        point.clientX > rect.right ||
        point.clientY < rect.top ||
        point.clientY > rect.bottom
      ) {
        return null;
      }

      const ndc = new THREE.Vector2(
        ((point.clientX - rect.left) / rect.width) * 2 - 1,
        -((point.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      const toothMeshes: THREE.Mesh[] = [];

      raycaster.setFromCamera(ndc, sceneHandle.camera);
      sceneHandle.scene.traverse((object) => {
        if (object instanceof THREE.Mesh && findToothId(object)) {
          toothMeshes.push(object);
        }
      });

      const intersections = raycaster.intersectObjects(toothMeshes, false);
      const hit = intersections[0];

      if (!hit) {
        return null;
      }

      return {
        toothId: findToothId(hit.object) ?? hit.object.name,
        point: hit.point.toArray() as [number, number, number],
      };
    },
    [canvasWrapperRef, sceneRef],
  );

  return {resolveDrop};
}
