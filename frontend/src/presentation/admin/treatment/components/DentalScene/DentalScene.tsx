"use client";

import {Suspense} from "react";
import {Canvas} from "@react-three/fiber";
import {ContactShadows, Environment, Html, OrbitControls} from "@react-three/drei";
import * as THREE from "three";
import type {DentalSceneHandle} from "./SceneExposer";
import {SceneExposer} from "./SceneExposer";
import {TeethModel} from "./TeethModel";
import {TreatmentMarkers} from "./TreatmentMarkers";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";

interface DentalSceneProps {
  sceneRef: React.MutableRefObject<DentalSceneHandle | null>;
}

function LoadingDentalModel() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-slate-700">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-400/25 border-t-primary" />
        <span className="text-sm font-medium">Loading dental model...</span>
      </div>
    </Html>
  );
}

export function DentalScene({sceneRef}: DentalSceneProps) {
  const orbitEnabled = useDentalChartStore((state) => state.orbitEnabled);
  const draggingAct = useDentalChartStore((state) => state.draggingAct);

  return (
    <div className="relative h-full min-h-[34rem] flex-1 overflow-hidden bg-[#d8e3e6]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{position: [0, 0, 3.8], fov: 28, near: 0.03, far: 100}}
        gl={{antialias: true}}
        onCreated={({gl}) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.92;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        className="h-full w-full"
      >
        <color attach="background" args={["#d8e3e6"]} />
        <ambientLight intensity={0.22} />
        <hemisphereLight args={["#F8FAFC", "#8EA2A8", 0.34]} />
        <directionalLight
          castShadow
          position={[3.5, 6, 4]}
          intensity={1.15}
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-camera-near={0.2}
          shadow-camera-far={18}
          shadow-bias={-0.00008}
          shadow-normalBias={0.018}
        />
        <directionalLight position={[-4, 3, -4]} intensity={0.18} />
        <spotLight
          castShadow
          position={[-2.6, 4.5, 3.2]}
          angle={0.42}
          penumbra={0.78}
          intensity={0.45}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.00005}
          shadow-normalBias={0.02}
        />
        <Suspense fallback={<LoadingDentalModel />}>
          <SceneExposer sceneRef={sceneRef} />
          <TeethModel />
          <TreatmentMarkers />
          <ContactShadows
            position={[0, -3.62, 0]}
            opacity={0.22}
            scale={8}
            blur={2.4}
            far={4}
            resolution={1024}
            color="#647478"
          />
          <Environment preset="studio" environmentIntensity={0.32} />
        </Suspense>
        <OrbitControls
          enabled={orbitEnabled}
          enableDamping
          dampingFactor={0.1}
          target={[0, 0, 0]}
          minDistance={0.72}
          maxDistance={5.2}
          rotateSpeed={0.5}
          zoomSpeed={0.5}
          panSpeed={0.45}
          screenSpacePanning
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          makeDefault
        />
      </Canvas>

      {draggingAct && (
        <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-primary/70 bg-primary/10">
          <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-primary/30 bg-white/95 px-3 py-1 text-xs font-medium text-primary shadow-lg dark:bg-slate-950/95">
            Drop on a tooth
          </div>
        </div>
      )}
    </div>
  );
}
