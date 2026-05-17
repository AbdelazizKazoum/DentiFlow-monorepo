"use client";

import {useEffect} from "react";
import {useThree} from "@react-three/fiber";
import type * as THREE from "three";

export interface DentalSceneHandle {
  camera: THREE.Camera;
  scene: THREE.Scene;
}

interface SceneExposerProps {
  sceneRef: React.MutableRefObject<DentalSceneHandle | null>;
}

export function SceneExposer({sceneRef}: SceneExposerProps) {
  const {camera, scene} = useThree();

  useEffect(() => {
    sceneRef.current = {camera, scene};

    return () => {
      sceneRef.current = null;
    };
  }, [camera, scene, sceneRef]);

  return null;
}
