"use client";

import {useEffect, useRef} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";

interface UseToothMaterialsParams {
  scene: THREE.Group;
  hoveredToothId: string | null;
  selectedToothId: string | null;
  treatments: ToothTreatment[];
}

interface TreatmentShader {
  uniforms: Record<string, {value: unknown}> & {
    treatmentCount: {value: number};
    treatmentColors: {value: THREE.Color[]};
    treatmentMinY: {value: number};
    treatmentMaxY: {value: number};
  };
  vertexShader: string;
  fragmentShader: string;
}

interface TreatmentMaterialUserData {
  treatmentShader?: TreatmentShader;
}

const MAX_TREATMENT_BANDS = 8;
const TOOTH_BASE_COLOR = new THREE.Color("#E8E1D8");

export function useToothMaterials({
  scene,
  hoveredToothId,
  selectedToothId,
  treatments,
}: UseToothMaterialsParams) {
  const materialsRef = useRef<Map<string, THREE.MeshPhysicalMaterial[]>>(
    new Map(),
  );
  const activeCountsRef = useRef<Map<string, number>>(new Map());
  const activeColorsRef = useRef<Map<string, string[]>>(new Map());

  useEffect(() => {
    const activeCounts = new Map<string, number>();
    const activeColors = new Map<string, string[]>();

    treatments.forEach((treatment) => {
      if (treatment.status !== "completed") {
        activeCounts.set(
          treatment.toothId,
          (activeCounts.get(treatment.toothId) ?? 0) + 1,
        );
        activeColors.set(treatment.toothId, [
          ...(activeColors.get(treatment.toothId) ?? []),
          treatment.actColor,
        ]);
      }
    });

    activeCountsRef.current = activeCounts;
    activeColorsRef.current = activeColors;
  }, [treatments]);

  const getBlendedTreatmentColor = (colors: string[] | undefined) => {
    if (!colors?.length) {
      return null;
    }

    const blended = colors.reduce((acc, color) => {
      acc.add(new THREE.Color(color));
      return acc;
    }, new THREE.Color("#000000"));

    blended.multiplyScalar(1 / colors.length);
    return blended;
  };

  const configureTreatmentShader = (
    material: THREE.MeshPhysicalMaterial,
    minY: number,
    maxY: number,
  ) => {
    material.onBeforeCompile = (shader) => {
      const treatmentShader = shader as unknown as TreatmentShader;

      treatmentShader.uniforms.treatmentCount = {value: 0};
      treatmentShader.uniforms.treatmentColors = {
        value: Array.from(
          {length: MAX_TREATMENT_BANDS},
          () => TOOTH_BASE_COLOR.clone(),
        ),
      };
      treatmentShader.uniforms.treatmentMinY = {value: minY};
      treatmentShader.uniforms.treatmentMaxY = {value: maxY};

      treatmentShader.vertexShader = treatmentShader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
varying float vTreatmentY;`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
vTreatmentY = position.y;`,
        );

      treatmentShader.fragmentShader = treatmentShader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
uniform int treatmentCount;
uniform vec3 treatmentColors[${MAX_TREATMENT_BANDS}];
uniform float treatmentMinY;
uniform float treatmentMaxY;
varying float vTreatmentY;`,
        )
        .replace(
          "#include <color_fragment>",
          `vec3 treatmentBaseColor = vec3(${TOOTH_BASE_COLOR.r.toFixed(6)}, ${TOOTH_BASE_COLOR.g.toFixed(6)}, ${TOOTH_BASE_COLOR.b.toFixed(6)});
if (treatmentCount > 0) {
  float treatmentHeight = max(treatmentMaxY - treatmentMinY, 0.0001);
  float treatmentFromTop = clamp((treatmentMaxY - vTreatmentY) / treatmentHeight, 0.0, 0.9999);
  int treatmentBand = int(floor(treatmentFromTop * float(treatmentCount)));
  vec3 treatmentBandColor = treatmentColors[0];

  for (int i = 0; i < ${MAX_TREATMENT_BANDS}; i++) {
    if (i == treatmentBand) {
      treatmentBandColor = treatmentColors[i];
    }
  }

  diffuseColor.rgb = mix(treatmentBaseColor, treatmentBandColor, 0.92);
} else {
  diffuseColor.rgb = treatmentBaseColor;
}`,
        );

      (material.userData as TreatmentMaterialUserData).treatmentShader =
        treatmentShader;
    };

    material.customProgramCacheKey = () => "dentiflow-treatment-bands-v2";
  };

  const updateTreatmentShader = (
    material: THREE.MeshPhysicalMaterial,
    colors: string[],
  ) => {
    const shader = (material.userData as TreatmentMaterialUserData)
      .treatmentShader;

    if (!shader) {
      return;
    }

    const limitedColors = colors.slice(0, MAX_TREATMENT_BANDS);
    shader.uniforms.treatmentCount.value = limitedColors.length;

    for (let index = 0; index < MAX_TREATMENT_BANDS; index += 1) {
      shader.uniforms.treatmentColors.value[index].copy(
        limitedColors[index]
          ? new THREE.Color(limitedColors[index])
          : TOOTH_BASE_COLOR,
      );
    }
  };

  const clearVertexColors = (mesh: THREE.Mesh) => {
    const geometry = mesh.geometry;

    if (geometry.getAttribute("color")) {
      geometry.deleteAttribute("color");
    }
  };

  const findToothId = (object: THREE.Object3D): string | null => {
    let current: THREE.Object3D | null = object;

    while (current) {
      if (current.name.startsWith("tooth_")) {
        return current.name;
      }

      current = current.parent;
    }

    return null;
  };

  useEffect(() => {
    const materials = materialsRef.current;
    materials.clear();

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      const toothId = findToothId(object);

      if (!toothId) {
        return;
      }

      object.geometry.computeVertexNormals();
      object.geometry = object.geometry.clone();
      object.geometry.computeBoundingBox();
      clearVertexColors(object);

      const bbox = object.geometry.boundingBox;
      const minY = bbox?.min.y ?? -1;
      const maxY = bbox?.max.y ?? 1;
      const sourceMaterial = Array.isArray(object.material)
        ? object.material[0]
        : object.material;
      const original =
        sourceMaterial instanceof THREE.MeshStandardMaterial ||
        sourceMaterial instanceof THREE.MeshPhysicalMaterial
          ? sourceMaterial
          : null;

      const material = new THREE.MeshPhysicalMaterial({
        color: TOOTH_BASE_COLOR.clone(),
        map: original?.map ?? null,
        normalMap: original?.normalMap ?? null,
        roughnessMap: original?.roughnessMap ?? null,
        aoMap: original?.aoMap ?? null,
        bumpMap: original?.bumpMap ?? null,
        displacementMap: original?.displacementMap ?? null,
        roughness: original?.roughness ?? 0.34,
        metalness: original?.metalness ?? 0,
        reflectivity: 0.36,
        clearcoat: 0.28,
        clearcoatRoughness: 0.24,
        envMapIntensity: 0.45,
        flatShading: false,
      });

      configureTreatmentShader(material, minY, maxY);
      object.material = material;
      object.castShadow = true;
      object.receiveShadow = true;
      materials.set(toothId, [...(materials.get(toothId) ?? []), material]);
    });

    return () => {
      materials.forEach((toothMaterials) =>
        toothMaterials.forEach((material) => material.dispose()),
      );
      materials.clear();
    };
  }, [scene]);

  useFrame(() => {
    materialsRef.current.forEach((toothMaterials, toothId) => {
      let emissive = "#000000";
      let emissiveIntensity = 0;
      const activeColors = activeColorsRef.current.get(toothId) ?? [];
      const activeColor = getBlendedTreatmentColor(activeColors);

      if (selectedToothId === toothId) {
        emissive = "#2563EB";
        emissiveIntensity = 0.28;
      } else if (hoveredToothId === toothId) {
        emissive = "#BFDBFE";
        emissiveIntensity = 0.16;
      } else if ((activeCountsRef.current.get(toothId) ?? 0) > 0) {
        emissive = activeColor?.getStyle() ?? "#FEF3C7";
        emissiveIntensity = 0.12;
      }

      toothMaterials.forEach((material) => {
        updateTreatmentShader(material, activeColors);
        material.color.set(TOOTH_BASE_COLOR);
        material.emissive.set(emissive);
        material.emissiveIntensity = emissiveIntensity;
      });
    });
  });
}
