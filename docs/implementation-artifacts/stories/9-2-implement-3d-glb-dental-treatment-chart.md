---
story_id: 9-2-implement-3d-glb-dental-treatment-chart
epic: Epic 9 - Clinical Treatment Chart
title: Implement Interactive 3D GLB Dental Treatment Chart (Real Model)
status: ready-for-dev
assignee: TBD
estimate: 13 pts
priority: High
depends_on: []
---

## Story

As a dentist,
I want an interactive, professional-grade 3D dental treatment page where I can drag dental acts from a palette and drop them directly onto individual teeth of a real 3D model,
so that I can visually document, review, and manage treatments per tooth with the precision and aesthetics expected from a professional dental SaaS platform.

---

## Acceptance Criteria

1. **Given** the dentist navigates to `/[locale]/admin/(dashboard)/patients/[id]/treatment`,
   **When** the page loads,
   **Then** a three-panel layout renders — left palette (`320 px`) | center 3D canvas (flex) | right popup drawer (`380 px`, hidden until a tooth is selected) — and the GLB model from `/models/teeth.glb` loads inside the canvas with smooth, high-quality rendering.

2. **Given** the GLB is loading,
   **When** `useGLTF` has not resolved,
   **Then** a centered spinner with the label "Loading dental model…" is displayed inside the dark canvas area using `<Html center>` from `@react-three/drei`.

3. **Given** the model is loaded,
   **When** rendered at any time,
   **Then** teeth appear white and glossy, with smooth shading (no flat faces), soft studio-preset environment reflections, directional lighting, and ambient fill — resembling professional dental imaging software, not a basic Three.js demo.

4. **Given** the 3D scene is visible,
   **When** the dentist interacts with the canvas (not dragging an act),
   **Then** `OrbitControls` allow free rotate, zoom, and pan of the entire model.

5. **Given** the 3D model is rendered,
   **When** the dentist moves the pointer over any tooth mesh (mesh name starts with `tooth_`),
   **Then** that tooth receives a subtle soft-blue emissive glow, the cursor changes to `pointer`, and a tooltip or label shows the FDI identifier (e.g., "Tooth 16 — Upper Left First Molar").

6. **Given** the dentist clicks a tooth,
   **When** the `onClick` event fires,
   **Then** the tooth receives a blue-outline/blue-glow selected state, and the right `ToothPopup` drawer slides in from the right with the tooth's FDI number, anatomical name, and all treatments assigned to it.

7. **Given** the act palette on the left,
   **When** the dentist starts dragging an act card (e.g., "Crown"),
   **Then** a drag preview ghost appears under the pointer, `OrbitControls` are disabled for the duration of the drag, and the canvas overlay activates as a valid drop zone.

8. **Given** the dentist is dragging an act and releases the pointer **over a tooth** in the canvas,
   **When** the drop event fires,
   **Then** raycasting resolves the tooth beneath the pointer, `intersection.object.name` yields the tooth ID (e.g., `tooth_16`), `intersection.point` yields the world-space 3D position, a new `ToothTreatment` with `status: "planned"` is added to the Zustand store, and `OrbitControls` are re-enabled.

9. **Given** the dentist is dragging an act and releases the pointer **outside any tooth** (empty canvas, sidebar, or popup),
   **When** the drag ends,
   **Then** no treatment is added, and `OrbitControls` are re-enabled.

10. **Given** a tooth has one or more treatments with `status !== "completed"`,
    **When** the model renders,
    **Then** the tooth receives a subtle amber/orange emissive tint (`#FEF3C7` region) — not a heavy color replace — while preserving smooth normals and the glossy physical appearance.

11. **Given** all treatments on a tooth are `"completed"`,
    **When** the model renders,
    **Then** the tooth returns to its default white glossy state; no tint is applied; treatment icon markers remain visible as historical record.

12. **Given** treatments exist on a tooth,
    **When** rendering inside the Canvas,
    **Then** each treatment renders a `<Html>` marker icon (from `@react-three/drei`) positioned at the stored `intersection.point` in world space, so the icon rotates and zooms with the model during `OrbitControls` use.

13. **Given** multiple treatments exist on the same tooth,
    **When** rendering markers,
    **Then** each marker is offset by a small computed delta (distributed in a ring around the tooth center) so no two markers overlap; a small numeric badge on the tooth shows the total count.

14. **Given** the `ToothPopup` is open,
    **When** the dentist clicks "Mark Complete" on a treatment,
    **Then** the store updates `status → "completed"`, the tooth tint clears in the 3D view, and the popup reflects the new status immediately — no page reload.

15. **Given** the `ToothPopup` is open,
    **When** the dentist types a note in the inline textarea and clicks "Save Note",
    **Then** the `notes` field on the `ToothTreatment` updates in the store and the saved note renders in the popup.

16. **Given** the `ToothPopup` is open,
    **When** the dentist clicks "Remove" on a treatment,
    **Then** the treatment is removed from the store, the marker disappears from the 3D scene, and the tooth tint recalculates.

17. **Given** any viewport ≥ 1280 px,
    **When** the page renders,
    **Then** the full three-panel layout is visible. At ≥ 768 px, the popup becomes a bottom sheet. Below 768 px, the palette collapses to a bottom drawer toggled by a FAB button.

---

## Technical Requirements

### Dependencies to Install

```bash
pnpm --filter frontend add @react-three/fiber @react-three/drei three @types/three
```

> `@dnd-kit/core`, `framer-motion`, and `zustand` are already installed in `frontend/package.json`.

---

### New Route

**File:** `frontend/src/app/[locale]/admin/(dashboard)/patients/[id]/treatment/page.tsx`

```tsx
// Thin shell — same pattern as patients/page.tsx
import TreatmentPage from "@/presentation/admin/treatment/TreatmentPage";

export default function Page() {
  return <TreatmentPage />;
}
```

---

## Domain Layer

### `frontend/src/domain/treatment/entities/dentalAct.ts`

```ts
export type TreatmentStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface DentalAct {
  id: string;
  label: string;
  /** Lucide icon component name as a string, e.g. "Crown" */
  icon: string;
  category: string;
  defaultStatus: TreatmentStatus;
  /** CSS hex color for act category badge and tooth tint */
  colorHex: string;
}
```

### `frontend/src/domain/treatment/entities/toothTreatment.ts`

```ts
import type {TreatmentStatus} from "./dentalAct";

/** FDI mesh name string — e.g. "tooth_16" */
export type ToothId = string;

export interface ToothTreatment {
  id: string;
  toothId: ToothId;
  actId: string;
  actLabel: string;
  /** Lucide icon component name string */
  actIcon: string;
  actColor: string;
  status: TreatmentStatus;
  /** World-space raycasted hit point [x, y, z] */
  position: [number, number, number];
  notes?: string;
  createdAt: string; // ISO string
}
```

### `frontend/src/domain/treatment/repositories/ITreatmentRepository.ts`

```ts
import type {ToothTreatment} from "../entities/toothTreatment";

export interface ITreatmentRepository {
  getTreatmentsByPatient(patientId: string): Promise<ToothTreatment[]>;
  saveTreatment(treatment: ToothTreatment): Promise<ToothTreatment>;
  updateTreatment(
    id: string,
    patch: Partial<ToothTreatment>,
  ): Promise<ToothTreatment>;
  deleteTreatment(id: string): Promise<void>;
}
```

> **MVP:** Implement as `LocalTreatmentRepository` in `infrastructure/treatment/` that wraps the Zustand store. Swap for an HTTP repository when the treatment-service API is ready.

---

## Application Layer

### `frontend/src/application/useCases/admin/treatment/`

Each use case receives store action functions as constructor parameters — consistent with the existing pattern (`loadDashboardData`, `toggleTheme`).

| File                              | Responsibility                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `addTreatmentUseCase.ts`          | Validate act + toothId, generate UUID (`crypto.randomUUID()`), build `ToothTreatment`, dispatch `store.addTreatment` |
| `updateTreatmentStatusUseCase.ts` | Validate status value, dispatch `store.updateTreatment`                                                              |
| `removeTreatmentUseCase.ts`       | Dispatch `store.removeTreatment`                                                                                     |
| `saveTreatmentNoteUseCase.ts`     | Trim note, dispatch `store.updateTreatment({ notes })`                                                               |

**Example — `addTreatmentUseCase.ts`:**

```ts
import {v4 as uuid} from "uuid"; // or crypto.randomUUID()
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothTreatment,
  ToothId,
} from "@/domain/treatment/entities/toothTreatment";

type AddFn = (t: ToothTreatment) => void;

export class AddTreatmentUseCase {
  constructor(private readonly addTreatment: AddFn) {}

  execute(
    act: DentalAct,
    toothId: ToothId,
    position: [number, number, number],
  ): ToothTreatment {
    const treatment: ToothTreatment = {
      id: crypto.randomUUID(),
      toothId,
      actId: act.id,
      actLabel: act.label,
      actIcon: act.icon,
      actColor: act.colorHex,
      status: act.defaultStatus,
      position,
      createdAt: new Date().toISOString(),
    };
    this.addTreatment(treatment);
    return treatment;
  }
}
```

---

## State Layer — Zustand Store

### `frontend/src/presentation/stores/dentalChartStore.ts`

```ts
import {create} from "zustand";
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothTreatment,
  ToothId,
} from "@/domain/treatment/entities/toothTreatment";

interface DentalChartState {
  // ── 3D interaction ──────────────────────────────────────────────────────
  selectedToothId: ToothId | null;
  hoveredToothId: ToothId | null;
  draggingAct: DentalAct | null;
  orbitEnabled: boolean;

  // ── Data ────────────────────────────────────────────────────────────────
  treatments: ToothTreatment[];

  // ── UI ──────────────────────────────────────────────────────────────────
  popupOpen: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────
  setSelectedTooth: (id: ToothId | null) => void;
  setHoveredTooth: (id: ToothId | null) => void;
  setDraggingAct: (act: DentalAct | null) => void;
  setOrbitEnabled: (enabled: boolean) => void;
  setPopupOpen: (open: boolean) => void;
  addTreatment: (treatment: ToothTreatment) => void;
  updateTreatment: (id: string, patch: Partial<ToothTreatment>) => void;
  removeTreatment: (id: string) => void;
}

export const useDentalChartStore = create<DentalChartState>((set) => ({
  selectedToothId: null,
  hoveredToothId: null,
  draggingAct: null,
  orbitEnabled: true,
  treatments: [],
  popupOpen: false,

  setSelectedTooth: (id) => set({selectedToothId: id, popupOpen: id !== null}),
  setHoveredTooth: (id) => set({hoveredToothId: id}),
  setDraggingAct: (act) => set({draggingAct: act}),
  setOrbitEnabled: (enabled) => set({orbitEnabled: enabled}),
  setPopupOpen: (open) => set({popupOpen: open}),

  addTreatment: (t) => set((s) => ({treatments: [...s.treatments, t]})),
  updateTreatment: (id, patch) =>
    set((s) => ({
      treatments: s.treatments.map((t) => (t.id === id ? {...t, ...patch} : t)),
    })),
  removeTreatment: (id) =>
    set((s) => ({treatments: s.treatments.filter((t) => t.id !== id)})),
}));
```

---

## Static Seed Data

### `frontend/src/presentation/admin/treatment/data/dentalActs.data.ts`

```ts
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";

export const DENTAL_ACTS: DentalAct[] = [
  {
    id: "caries",
    label: "Caries",
    icon: "AlertCircle",
    category: "Diagnostic",
    defaultStatus: "planned",
    colorHex: "#EF4444",
  },
  {
    id: "filling",
    label: "Filling",
    icon: "CircleDot",
    category: "Restorative",
    defaultStatus: "planned",
    colorHex: "#3B82F6",
  },
  {
    id: "crown",
    label: "Crown",
    icon: "Crown",
    category: "Prosthetic",
    defaultStatus: "planned",
    colorHex: "#F59E0B",
  },
  {
    id: "implant",
    label: "Implant",
    icon: "Anchor",
    category: "Surgical",
    defaultStatus: "planned",
    colorHex: "#8B5CF6",
  },
  {
    id: "extraction",
    label: "Extraction",
    icon: "X",
    category: "Surgical",
    defaultStatus: "planned",
    colorHex: "#374151",
  },
  {
    id: "root_canal",
    label: "Root Canal",
    icon: "Zap",
    category: "Endodontic",
    defaultStatus: "planned",
    colorHex: "#DC2626",
  },
  {
    id: "whitening",
    label: "Whitening",
    icon: "Sun",
    category: "Cosmetic",
    defaultStatus: "planned",
    colorHex: "#60A5FA",
  },
  {
    id: "orthodontics",
    label: "Orthodontics",
    icon: "GitCommitHorizontal",
    category: "Orthodontic",
    defaultStatus: "planned",
    colorHex: "#FCD34D",
  },
];
```

### `frontend/src/presentation/admin/treatment/data/toothNames.data.ts`

```ts
export const TOOTH_NAMES: Record<string, string> = {
  // Upper right
  tooth_11: "11 — Upper Right Central Incisor",
  tooth_12: "12 — Upper Right Lateral Incisor",
  tooth_13: "13 — Upper Right Canine",
  tooth_14: "14 — Upper Right First Premolar",
  tooth_15: "15 — Upper Right Second Premolar",
  tooth_16: "16 — Upper Right First Molar",
  tooth_17: "17 — Upper Right Second Molar",
  tooth_18: "18 — Upper Right Third Molar",
  // Upper left
  tooth_21: "21 — Upper Left Central Incisor",
  tooth_22: "22 — Upper Left Lateral Incisor",
  tooth_23: "23 — Upper Left Canine",
  tooth_24: "24 — Upper Left First Premolar",
  tooth_25: "25 — Upper Left Second Premolar",
  tooth_26: "26 — Upper Left First Molar",
  tooth_27: "27 — Upper Left Second Molar",
  tooth_28: "28 — Upper Left Third Molar",
  // Lower left
  tooth_31: "31 — Lower Left Central Incisor",
  tooth_32: "32 — Lower Left Lateral Incisor",
  tooth_33: "33 — Lower Left Canine",
  tooth_34: "34 — Lower Left First Premolar",
  tooth_35: "35 — Lower Left Second Premolar",
  tooth_36: "36 — Lower Left First Molar",
  tooth_37: "37 — Lower Left Second Molar",
  tooth_38: "38 — Lower Left Third Molar",
  // Lower right
  tooth_41: "41 — Lower Right Central Incisor",
  tooth_42: "42 — Lower Right Lateral Incisor",
  tooth_43: "43 — Lower Right Canine",
  tooth_44: "44 — Lower Right First Premolar",
  tooth_45: "45 — Lower Right Second Premolar",
  tooth_46: "46 — Lower Right First Molar",
  tooth_47: "47 — Lower Right Second Molar",
  tooth_48: "48 — Lower Right Third Molar",
};
```

---

## Presentation Layer — Component Specifications

### Folder Structure

```
frontend/src/presentation/admin/treatment/
├── TreatmentPage.tsx
├── data/
│   ├── dentalActs.data.ts
│   └── toothNames.data.ts
├── components/
│   ├── DentalScene/
│   │   ├── DentalScene.tsx
│   │   ├── TeethModel.tsx
│   │   ├── TreatmentMarkers.tsx
│   │   └── TreatmentMarker.tsx
│   ├── TreatmentPalette/
│   │   ├── TreatmentPalette.tsx
│   │   └── ActCard.tsx
│   └── ToothPopup/
│       ├── ToothPopup.tsx
│       └── TreatmentListItem.tsx
└── hooks/
    ├── useDentalDrop.ts
    └── useToothMaterials.ts
```

---

### `TreatmentPage.tsx` — Three-Panel Shell

```tsx
"use client";
// Responsibilities:
// 1. Wraps DndContext (onDragStart / onDragEnd).
// 2. Reads orbitEnabled, draggingAct, popupOpen from store.
// 3. Holds canvasWrapperRef for raycasting coordinate transforms.
// 4. Renders <TreatmentPalette /> | <DentalScene /> | <ToothPopup /> (AnimatePresence).
// 5. onDragStart → setDraggingAct(act) + setOrbitEnabled(false).
// 6. onDragEnd   → resolveDrop() → if hit: AddTreatmentUseCase.execute()
//                → setDraggingAct(null) + setOrbitEnabled(true).

import {useRef} from "react";
import {DndContext, DragOverlay, type DragEndEvent} from "@dnd-kit/core";
import {AnimatePresence} from "framer-motion";
import {useDentalChartStore} from "@/presentation/stores/dentalChartStore";
import {DentalScene} from "./components/DentalScene/DentalScene";
import {TreatmentPalette} from "./components/TreatmentPalette/TreatmentPalette";
import {ToothPopup} from "./components/ToothPopup/ToothPopup";
import {ActCard} from "./components/TreatmentPalette/ActCard";
import {useDentalDrop} from "./hooks/useDentalDrop";
import {AddTreatmentUseCase} from "@/application/useCases/admin/treatment/addTreatmentUseCase";
import type {DentalAct} from "@/domain/treatment/entities/dentalAct";

export default function TreatmentPage() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{camera: THREE.Camera; scene: THREE.Scene} | null>(
    null,
  );

  const {
    draggingAct,
    popupOpen,
    setDraggingAct,
    setOrbitEnabled,
    addTreatment,
  } = useDentalChartStore();

  const {resolveDrop} = useDentalDrop(canvasWrapperRef, sceneRef);
  const addUseCase = new AddTreatmentUseCase(addTreatment);

  function handleDragStart(event: DragStartEvent) {
    const act = event.active.data.current?.act as DentalAct;
    setDraggingAct(act);
    setOrbitEnabled(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const act = event.active.data.current?.act as DentalAct;
    const hit = resolveDrop(event);
    if (hit && act) {
      addUseCase.execute(act, hit.toothId, hit.point);
    }
    setDraggingAct(null);
    setOrbitEnabled(true);
  }

  function handleDragCancel() {
    setDraggingAct(null);
    setOrbitEnabled(true);
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full overflow-hidden bg-page text-foreground">
        {/* Left — Act Palette */}
        <TreatmentPalette />

        {/* Center — 3D Canvas */}
        <div ref={canvasWrapperRef} className="flex-1 relative overflow-hidden">
          <DentalScene sceneRef={sceneRef} />
        </div>

        {/* Right — Tooth Popup */}
        <AnimatePresence>{popupOpen && <ToothPopup />}</AnimatePresence>
      </div>

      {/* Drag ghost overlay */}
      <DragOverlay>
        {draggingAct && <ActCard act={draggingAct} isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
```

---

### `DentalScene.tsx` — Canvas Container

```tsx
"use client";
// Responsibilities:
// 1. Renders the R3F <Canvas> with high-quality settings.
// 2. Exposes camera + scene via sceneRef using SceneExposer helper.
// 3. Suspense with Html spinner fallback.
// 4. Environment preset + lighting.
// 5. OrbitControls toggled by store flag.

// Canvas props:
// - gl={{ antialias: true, powerPreference: "high-performance" }}
// - shadows
// - dpr={[1, 2]}   ← cap to 2x for performance
// - camera={{ position: [0, 2, 8], fov: 40, near: 0.1, far: 100 }}

// Scene contents:
// - <ambientLight intensity={0.4} />
// - <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
// - <directionalLight position={[-5, 5, -5]} intensity={0.5} />
// - <Environment preset="studio" />
// - <Suspense fallback={<Html center>...spinner...</Html>}>
//     <TeethModel />
//     <TreatmentMarkers />
//   </Suspense>
// - <OrbitControls enabled={orbitEnabled} enablePan minDistance={2} maxDistance={20} />
// - <SceneExposer sceneRef={sceneRef} />
```

**Critical canvas settings for rendering quality:**

| Setting              | Value                | Reason                                              |
| -------------------- | -------------------- | --------------------------------------------------- |
| `gl.antialias`       | `true`               | Smooth edges                                        |
| `gl.powerPreference` | `"high-performance"` | GPU priority                                        |
| `dpr`                | `[1, 2]`             | Retina-aware, capped at 2×                          |
| `shadows`            | `true`               | Realistic depth                                     |
| `camera.fov`         | `40`                 | Telephoto — reduces perspective distortion on teeth |
| `Environment preset` | `"studio"`           | Neutral professional reflections                    |

---

### `TeethModel.tsx` — GLB Loader + Per-Tooth Material Management

This is the most critical component. Implement carefully.

**Loading:**

```ts
const {scene} = useGLTF("/models/teeth.glb");
```

**Material isolation and enhancement — run once on mount:**

```ts
useEffect(() => {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.name.startsWith("tooth_")) {
      // Step 1: Compute smooth normals to preserve Blender export quality
      obj.geometry.computeVertexNormals();

      // Step 2: Clone material — CRITICAL to isolate per tooth
      const original = obj.material as THREE.MeshStandardMaterial;

      // Step 3: Replace with MeshPhysicalMaterial for realistic dental look
      const dental = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#F5F0EB"), // warm ivory white
        roughness: 0.15, // glossy enamel
        metalness: 0.0,
        reflectivity: 0.8,
        clearcoat: 0.6, // enamel clearcoat
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.2,
        flatShading: false, // NEVER true — preserves smooth normals
      });

      obj.material = dental;
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}, [scene]);
```

**Hover / selected / treatment tint — update emissive color reactively:**

```ts
useFrame(() => {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.name.startsWith("tooth_")) {
      const mat = obj.material as THREE.MeshPhysicalMaterial;
      const toothId = obj.name;
      const isHovered = hoveredToothId === toothId;
      const isSelected = selectedToothId === toothId;
      const activeCount = treatments.filter(
        (t) => t.toothId === toothId && t.status !== "completed",
      ).length;

      if (isSelected) {
        mat.emissive.set("#1E40AF"); // deep blue selected
        mat.emissiveIntensity = 0.18;
      } else if (isHovered) {
        mat.emissive.set("#BFDBFE"); // soft blue hover
        mat.emissiveIntensity = 0.12;
      } else if (activeCount > 0) {
        mat.emissive.set("#FEF3C7"); // subtle amber — active treatment
        mat.emissiveIntensity = 0.1;
      } else {
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
      }
    }
  });
});
```

**Event handlers on the primitive:**

- `onPointerOver`: `(e) => { e.stopPropagation(); setHoveredTooth(e.object.name); }`
- `onPointerOut`: `(e) => { setHoveredTooth(null); }`
- `onClick`: `(e) => { e.stopPropagation(); setSelectedTooth(e.object.name); }`

**Performance notes:**

- Wrap the component with `React.memo`.
- Store the cloned material references in a `useRef<Map<string, THREE.MeshPhysicalMaterial>>` to avoid re-traversal inside `useFrame` — only update the stored references.
- `useFrame` runs every RAF tick; keep the logic O(n) over the 32 tooth materials map only.

---

### `TreatmentMarkers.tsx` — Marker Orchestrator

```tsx
// - Reads treatments[] from store.
// - Groups by toothId.
// - Computes offset positions so multiple markers on the same tooth don't overlap:
//
//   function offsetPositions(
//     base: [number, number, number],
//     count: number,
//     index: number
//   ): [number, number, number] {
//     const angle = (index / count) * Math.PI * 2;
//     const radius = count > 1 ? 0.12 : 0;
//     return [
//       base[0] + Math.cos(angle) * radius,
//       base[1] + 0.15,               // lift marker slightly above tooth surface
//       base[2] + Math.sin(angle) * radius,
//     ];
//   }
//
// - Renders one <TreatmentMarker key={t.id} treatment={t} position={offsetPos} />.
// - Memoize with useMemo on treatments array.
```

---

### `TreatmentMarker.tsx` — Single 3D Icon Marker

```tsx
// Uses <Html position={position} center distanceFactor={6} occlude>
// from @react-three/drei.
//
// Renders a small pill/badge div:
// - Icon (Lucide, 12px) in act color
// - Status dot (color-coded)
// - Completed → muted with green dot; active → act.colorHex + amber dot
//
// The Html component inherits the Canvas transform stack, so
// the marker moves with the model during OrbitControls rotation.
//
// occlude prop hides the marker when another mesh is in front of it.
```

---

### `useDentalDrop.ts` — Raycasting Drop Resolver

This hook bridges dnd-kit's DOM drag with Three.js raycasting.

```ts
// Signature:
// export function useDentalDrop(
//   canvasWrapperRef: RefObject<HTMLDivElement>,
//   sceneRef: RefObject<{ camera: THREE.Camera; scene: THREE.Scene } | null>
// ): { resolveDrop: (event: DragEndEvent) => { toothId: string; point: [number, number, number] } | null }

// Implementation steps on dragEnd:
// 1. Read the final PointerEvent from event.activatorEvent.
// 2. Get canvas bounding rect from canvasWrapperRef.current.getBoundingClientRect().
// 3. Compute NDC coordinates:
//    ndcX = ((clientX - rect.left) / rect.width)  * 2 - 1
//    ndcY = -((clientY - rect.top)  / rect.height) * 2 + 1
// 4. Create THREE.Raycaster, set from camera:
//    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera)
// 5. Collect all tooth meshes from scene:
//    const toothMeshes: THREE.Mesh[] = [];
//    scene.traverse(obj => {
//      if (obj instanceof THREE.Mesh && obj.name.startsWith("tooth_"))
//        toothMeshes.push(obj);
//    });
// 6. const intersects = raycaster.intersectObjects(toothMeshes, false);
// 7. If intersects.length > 0:
//    return { toothId: intersects[0].object.name, point: intersects[0].point.toArray() as [number,number,number] }
// 8. Return null otherwise.
```

---

### `SceneExposer` — R3F Scene/Camera Bridge

An internal helper component rendered **inside the `<Canvas>`** that captures the R3F camera and scene and writes them to `sceneRef`:

```tsx
// Placed inside <Canvas> as a sibling to TeethModel.
// Uses useThree() to read { camera, scene }.
// Runs useEffect once to assign sceneRef.current = { camera, scene }.
// Renders null.
```

This is necessary because `useThree()` can only be called inside the R3F Canvas context, while `TreatmentPage` (outside the Canvas) needs those references for raycasting on drop.

---

### `TreatmentPalette.tsx` — Left Sidebar

```tsx
// - Fixed width: w-80 (320px).
// - Header: "Treatment Acts" title.
// - List of <ActCard> components, grouped by category with a small label.
// - Each category section rendered as a collapsible group.
// - Scrollable overflow-y-auto.
// - Styling: bg-surface-card border-r border-border-ui h-full flex flex-col.
```

### `ActCard.tsx` — Draggable Act Card

```tsx
// Uses useDraggable({ id: act.id, data: { act } }) from @dnd-kit/core.
// - isDragging → reduced opacity on the original card.
// - Renders: icon (Lucide, 18px, colored with act.colorHex) + label + category pill.
// - isDragOverlay prop → adds shadow-2xl ring for the floating ghost.
// - aria-label: `Drag ${act.label} onto a tooth`.
// - cursor: grab / grabbing.
```

---

### `ToothPopup.tsx` — Right Drawer

```tsx
// Framer Motion motion.div:
// initial={{ x: "100%", opacity: 0 }}
// animate={{ x: 0,      opacity: 1 }}
// exit={{   x: "100%", opacity: 0 }}
// transition={{ type: "spring", stiffness: 320, damping: 30 }}
//
// Fixed width: w-96 (384px). Full height. Overflow-y-auto.
// Styling: bg-surface-card border-l border-border-ui shadow-2xl
//
// Header:
//   - Tooth FDI number (large, bold)
//   - Anatomical name from TOOTH_NAMES[selectedToothId]
//   - Close button (X) → setSelectedTooth(null)
//
// Body:
//   - Treatment count summary badge
//   - List of <TreatmentListItem> for each treatment on selectedToothId
//   - Empty state if no treatments: "No treatments recorded for this tooth."
//
// Footer:
//   - "+ Add Act" dropdown → opens an inline select of DENTAL_ACTS
//     (acts added via AddTreatmentUseCase with a center-of-tooth position fallback)
```

### `TreatmentListItem.tsx` — Individual Treatment Row

```tsx
// Renders:
// 1. Act icon (Lucide, colored)
// 2. Act label + category
// 3. Status badge pill:
//    planned     → bg-amber-100   text-amber-700
//    in_progress → bg-blue-100    text-blue-700
//    completed   → bg-green-100   text-green-700
//    cancelled   → bg-gray-100    text-gray-500
// 4. Created date (formatted with Intl.DateTimeFormat)
// 5. Inline note textarea (collapsed by default, expands on click)
// 6. Actions row:
//    - "Mark Complete" button (hidden if already completed/cancelled)
//    - "Remove" button (always visible, red destructive style)
//    - "Save Note" button (visible only when textarea has unsaved content)
```

---

## 3D Rendering Quality Checklist

The following requirements define the minimum bar for the rendered result to feel like **professional dental SaaS** and not a basic Three.js demo:

| Requirement           | Implementation                                                                     |
| --------------------- | ---------------------------------------------------------------------------------- |
| Anti-aliasing         | `<Canvas gl={{ antialias: true }}>`                                                |
| Smooth normals        | `geometry.computeVertexNormals()` on every tooth mesh at load                      |
| No flat shading       | `flatShading: false` on all materials (never set to `true`)                        |
| Physical material     | `THREE.MeshPhysicalMaterial` with `clearcoat`, `roughness: 0.15`                   |
| Environment lighting  | `<Environment preset="studio" />` from `@react-three/drei`                         |
| Directional key light | `position={[5, 10, 5]}` intensity 1.2                                              |
| Fill light            | `position={[-5, 5, -5]}` intensity 0.5                                             |
| Ambient light         | `intensity={0.4}`                                                                  |
| Shadow casting        | `castShadow` + `receiveShadow` on tooth meshes                                     |
| Hover feedback        | Emissive `#BFDBFE` intensity 0.12                                                  |
| Selected feedback     | Emissive `#1E40AF` intensity 0.18                                                  |
| Active treatment tint | Emissive `#FEF3C7` intensity 0.10 (never heavy color replacement)                  |
| Retina display        | `dpr={[1, 2]}`                                                                     |
| Telephoto lens        | `fov: 40` (reduces distortion on close model view)                                 |
| Material isolation    | `obj.material = new THREE.MeshPhysicalMaterial(...)` per tooth mesh (never shared) |

---

## Performance Requirements

| Area                         | Strategy                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Material refs                | Store cloned material references in `useRef<Map<string, THREE.MeshPhysicalMaterial>>` — avoid re-traversing the scene graph on every frame |
| `useFrame` logic             | O(32) loop over a flat material map — no traversal inside the RAF tick                                                                     |
| Marker rendering             | `useMemo` on `treatments` array inside `TreatmentMarkers` to prevent re-render on unrelated store changes                                  |
| `TeethModel`                 | Wrap with `React.memo` — only re-renders when `scene` ref changes                                                                          |
| `TreatmentMarker`            | Wrap with `React.memo(({ treatment, position }) => ...)`                                                                                   |
| `useGLTF.preload`            | Call `useGLTF.preload("/models/teeth.glb")` at module level in `DentalScene.tsx`                                                           |
| Canvas DPR cap               | `dpr={[1, 2]}` prevents 3× render on high-DPI devices                                                                                      |
| Selective store subscription | Each component subscribes to only the slice of the store it needs using selector functions                                                 |

---

## RTL / Locale Support

- Outer `flex` container: add `rtl:flex-row-reverse` — palette moves to the right, popup to the left in Arabic locale.
- Popup Framer Motion variants: read `document.documentElement.dir` to invert the `x` slide direction.
- All text content uses `next-intl` translation keys (add to translation files under the `treatment` namespace).

---

## Accessibility

| Requirement                | Implementation                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Keyboard fallback for drag | "Tab to tooth" → `onClick` selects it → "+ Add Act" inside popup is keyboard-accessible                       |
| Act card ARIA              | `aria-label="Drag ${act.label} onto a tooth"`                                                                 |
| Popup close ARIA           | `aria-label="Close tooth detail panel"`                                                                       |
| Color not sole indicator   | Every tinted state is paired with an icon or text label                                                       |
| Focus management           | On popup open, focus moves to the popup header; on close, returns to the last selected tooth's DOM equivalent |

---

## Full File Map

```
frontend/
├── public/
│   └── models/
│       └── teeth.glb                                              ← already exists
└── src/
    ├── app/
    │   └── [locale]/
    │       └── admin/
    │           └── (dashboard)/
    │               └── patients/
    │                   └── [id]/
    │                       └── treatment/
    │                           └── page.tsx                       ← NEW
    ├── domain/
    │   └── treatment/
    │       ├── entities/
    │       │   ├── dentalAct.ts                                   ← NEW
    │       │   └── toothTreatment.ts                              ← NEW
    │       └── repositories/
    │           └── ITreatmentRepository.ts                        ← NEW
    ├── application/
    │   └── useCases/
    │       └── admin/
    │           └── treatment/
    │               ├── addTreatmentUseCase.ts                     ← NEW
    │               ├── updateTreatmentStatusUseCase.ts            ← NEW
    │               ├── removeTreatmentUseCase.ts                  ← NEW
    │               └── saveTreatmentNoteUseCase.ts                ← NEW
    ├── infrastructure/
    │   └── treatment/
    │       └── LocalTreatmentRepository.ts                        ← NEW (MVP store adapter)
    └── presentation/
        ├── stores/
        │   └── dentalChartStore.ts                                ← NEW
        └── admin/
            └── treatment/
                ├── TreatmentPage.tsx                              ← NEW
                ├── data/
                │   ├── dentalActs.data.ts                         ← NEW
                │   └── toothNames.data.ts                         ← NEW
                ├── components/
                │   ├── DentalScene/
                │   │   ├── DentalScene.tsx                        ← NEW
                │   │   ├── TeethModel.tsx                         ← NEW (critical)
                │   │   ├── TreatmentMarkers.tsx                   ← NEW
                │   │   ├── TreatmentMarker.tsx                    ← NEW
                │   │   └── SceneExposer.tsx                       ← NEW (internal bridge)
                │   ├── TreatmentPalette/
                │   │   ├── TreatmentPalette.tsx                   ← NEW
                │   │   └── ActCard.tsx                            ← NEW
                │   └── ToothPopup/
                │       ├── ToothPopup.tsx                         ← NEW
                │       └── TreatmentListItem.tsx                  ← NEW
                └── hooks/
                    ├── useDentalDrop.ts                           ← NEW
                    └── useToothMaterials.ts                       ← NEW
```

---

## Out of Scope for This Story

- Backend API integration (save to treatment-service).
- Surface-level charting (Mesial / Distal / Occlusal face overlays).
- Arch-isolation toggle (Upper / Both / Lower filter).
- Multi-patient comparison or treatment plan PDF export.
- Tooth-level search or filter.

---

## Definition of Done

- [ ] Route `/[locale]/admin/(dashboard)/patients/[id]/treatment` renders without errors.
- [ ] GLB model loads and all `tooth_*` meshes are individually selectable.
- [ ] Teeth render with smooth normals, glossy physical material, and studio lighting — no flat shading.
- [ ] Hover emissive glow works per tooth without affecting siblings.
- [ ] Drag act from palette → drop on tooth → treatment added to store → marker renders in 3D.
- [ ] Marker moves with model during `OrbitControls` rotation/zoom.
- [ ] Multiple markers on same tooth are offset (no overlap).
- [ ] Tooth amber tint appears on active treatment; clears on completion.
- [ ] `ToothPopup` opens on click, shows all treatments, supports mark-complete / remove / add-note.
- [ ] `OrbitControls` disabled during drag, re-enabled after drop or cancel.
- [ ] Dark mode: canvas dark background + light popup surface renders correctly.
- [ ] RTL (Arabic): palette and popup positions swap correctly.
- [ ] No TypeScript errors (`pnpm --filter frontend build` clean).
- [ ] `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three` present in `frontend/package.json`.
- [ ] `useGLTF.preload("/models/teeth.glb")` called at module level.
