# Story 9.1: Build Dental Treatment Chart Page (Procedural 3D Schema)

Status: ready-for-dev

---

## Story

As a doctor,
I want an interactive dental treatment chart page with a procedural 3D tooth schema,
so that I can visually assign acts and treatments to specific patient teeth in a professional, intuitive interface — without requiring external 3D model assets.

---

## Acceptance Criteria

1. **Given** the doctor navigates to `/dashboard/patients/[id]/treatment`,
   **When** the page loads,
   **Then** a full-mouth procedural 3D dental chart is displayed using React Three Fiber with all 32 teeth rendered as stylized geometries (upper arch + lower arch), each labeled with its FDI tooth number.

2. **Given** the 3D chart is rendered,
   **When** the doctor hovers over a tooth,
   **Then** the tooth emits a soft blue glow/outline and a tooltip shows the tooth name (e.g., "Tooth 14 — Upper Left Premolar").

3. **Given** the acts sidebar is visible,
   **When** the doctor drags an act card from the sidebar and drops it onto a tooth,
   **Then** the tooth changes color/overlay according to the act type and a confirmation popup appears to confirm act details (tooth number, act name, status: Planned).

4. **Given** an act has been applied to a tooth,
   **When** the doctor clicks on that tooth,
   **Then** a floating detail panel appears anchored near the tooth listing all applied acts with their status (Planned / In Progress / Completed / Cancelled), assigned doctor, and date — with Edit and Remove actions per act.

5. **Given** the detail panel is open,
   **When** the doctor clicks "+ Add Act",
   **Then** a search-and-select dropdown of all available acts appears, and selecting one applies it immediately to the tooth.

6. **Given** acts of different categories are applied,
   **When** viewing the chart,
   **Then** each tooth is color-coded by its primary act category (see color map in Technical Requirements) and a color legend is always visible at the bottom of the chart area.

7. **Given** the page layout,
   **When** rendered on a desktop viewport (≥1280px),
   **Then** the layout is: left sidebar (acts panel) | center (3D chart, full height) | (optional) right panel for selected tooth details — fully responsive down to tablet (≥768px).

8. **Given** the acts panel,
   **When** the doctor types in the search bar,
   **Then** acts are filtered in real time with fuzzy matching on act name and category.

---

## Technical Requirements

### 3D Rendering — Procedural (No External Models)

Build teeth entirely from Three.js / React Three Fiber geometries:

```
Crown  → CylinderGeometry (radiusTop slightly smaller than radiusBottom, 8 segments)
Root   → ConeGeometry (tapered, pointing downward)
Merge  → using THREE.BufferGeometryUtils.mergeGeometries()
```

- **32 teeth** positioned on two elliptical arcs (upper and lower jaw)
- Upper arch: semi-ellipse, teeth rotated to face inward
- Lower arch: mirrored semi-ellipse below
- Left-side teeth: `scale.x = -1` to mirror right-side geometry
- Shared geometry instances per tooth type (Incisor, Canine, Premolar, Molar) — only material differs per tooth
- Gum line: `TubeGeometry` following the same elliptical arc, soft pink material
- Camera: `PerspectiveCamera`, default angle = front view, `OrbitControls` enabled (zoom + rotate, no pan by default)
- Toggle buttons above the chart: **UPPER** | **BOTH** | **LOWER** to isolate arches

### Tooth Type Geometry Variants

| Type | Teeth (FDI) | Crown Shape | Root Count |
|---|---|---|---|
| Central Incisor | 11,12,21,22,31,32,41,42 | Flat chisel | 1 |
| Canine | 13,23,33,43 | Pointed cusp | 1 long |
| Premolar | 14,15,24,25,34,35,44,45 | Bicuspid top | 1–2 |
| Molar | 16,17,18,26,27,28,36,37,38,46,47,48 | Wide flat | 2–3 |

### Act Color Map (Tooth Material Tint)

| Category | Color Token | Hex |
|---|---|---|
| Restorative (Filling) | `act-restorative` | `#3B82F6` — blue |
| Crown / Bridge | `act-crown` | `#F59E0B` — amber |
| Root Canal | `act-endodontic` | `#DC2626` — red |
| Extraction | `act-surgical` | `#374151` — dark gray |
| Implant | `act-implant` | `#8B5CF6` — violet |
| Periodontic | `act-perio` | `#22C55E` — green |
| Orthodontic | `act-ortho` | `#FCD34D` — yellow |
| Cosmetic | `act-cosmetic` | `#E0F2FE` — light blue |
| Completed | `act-done` | `#16A34A` — strong green |
| Missing Tooth | `act-missing` | `#1F2937` — ghost dark |
| Healthy (default) | `act-healthy` | `#E8D5C4` — ivory |

When a tooth has **multiple acts**, show a **multi-color split material** (divide the crown mesh into segments per act).

### Acts Sidebar Panel

- Grouped by category with collapsible sections (`<Accordion>`)
- Each act = draggable card (`dnd-kit`) with:
  - Icon (Lucide icon or custom SVG — see icon map below)
  - Act name
  - Short description on hover
- Search bar at top with real-time fuzzy filter (`fuse.js`)
- Fixed width: `320px` on desktop, bottom sheet on mobile

### Act Icon Map

| Act | Lucide Icon |
|---|---|
| Composite Filling | `CircleDot` |
| Amalgam Filling | `Circle` |
| Crown | `Crown` |
| Bridge | `Link` |
| Veneer | `Sparkles` |
| Root Canal | `Drill` (custom SVG) |
| Extraction | `X` |
| Implant | `Anchor` |
| Scaling | `Eraser` |
| Deep Cleaning | `Wind` |
| Whitening | `Sun` |
| Bracket / Aligner | `GitCommitHorizontal` |

### Tooth Click — Floating Detail Panel

- Anchored to tooth screen position using `drei`'s `<Html>` component (so it moves with the 3D object)
- Shows:
  - Tooth number + anatomical name
  - Surfaces affected (Mesial / Distal / Occlusal / Buccal / Lingual) as a small 2D tooth diagram (SVG)
  - List of acts with status badge + doctor + date
  - "Edit", "Remove", "+ Add Act" actions
- Animated open/close with Framer Motion (`spring` transition)
- Closes on outside click or `Esc`

### State Management

Use a **Zustand** store slice: `useDentalChartStore`

```ts
interface ToothState {
  toothNumber: number        // FDI notation
  acts: AppliedAct[]
  status: 'healthy' | 'treated' | 'missing' | 'urgent'
}

interface AppliedAct {
  id: string
  actId: string
  actName: string
  category: ActCategory
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  surfaces: ToothSurface[]
  doctorId: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

---

## File Structure

```
frontend/src/
├── app/
│   └── dashboard/
│       └── patients/
│           └── [id]/
│               └── treatment/
│                   └── page.tsx                  # Route page
├── features/
│   └── treatment-chart/
│       ├── components/
│       │   ├── TreatmentChartPage.tsx            # Main layout shell
│       │   ├── DentalChart3D.tsx                 # R3F Canvas + scene
│       │   ├── ToothMesh.tsx                     # Single procedural tooth mesh
│       │   ├── DentalArch.tsx                    # Positions 16 teeth on an arc
│       │   ├── GumLine.tsx                       # TubeGeometry gum arc
│       │   ├── ToothLabel.tsx                    # FDI number floating label (drei Html)
│       │   ├── ToothDetailPanel.tsx              # Floating act detail popup
│       │   ├── ActsSidebar.tsx                   # Sidebar with draggable act cards
│       │   ├── ActCard.tsx                       # Individual draggable act card
│       │   ├── ActsSearchBar.tsx                 # Fuzzy search input
│       │   ├── ColorLegend.tsx                   # Bottom color legend bar
│       │   └── ArchToggle.tsx                    # Upper / Both / Lower buttons
│       ├── hooks/
│       │   ├── useDentalChart.ts                 # Chart interaction logic
│       │   └── useActDragDrop.ts                 # dnd-kit drag-drop wiring
│       ├── store/
│       │   └── dentalChartStore.ts               # Zustand store
│       ├── data/
│       │   ├── acts.data.ts                      # All available dental acts
│       │   ├── teeth.data.ts                     # FDI teeth metadata + positions
│       │   └── toothGeometry.ts                  # Procedural geometry builders
│       └── types/
│           └── treatment.types.ts                # All TS types/interfaces
```

---

## Dependencies to Install

```bash
# 3D
@react-three/fiber
@react-three/drei
three
@types/three

# Drag & Drop
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities

# Fuzzy search
fuse.js

# State
zustand   # likely already installed

# Animations
framer-motion   # likely already installed
```

---

## Implementation Notes

- Use `useRef` + `useFrame` (R3F) for hover glow animation — avoid re-renders on every frame
- Use `meshStandardMaterial` with `emissive` + `emissiveIntensity` for the glow effect on hover
- Use `drei`'s `<ContactShadows>` for a soft ground shadow under the arch
- Use `drei`'s `<Environment preset="studio">` for professional lighting
- Keep the Three.js scene background transparent — the CSS page background shows through
- All mock data lives in `acts.data.ts` and `teeth.data.ts` — no API calls in this story
- API integration (treatment service backend) is deferred to a future story

---

## Clean Architecture Alignment

- **Presentation Layer:** All components under `features/treatment-chart/components/`
- **Application Layer:** `useDentalChart` hook, `useActDragDrop` hook — orchestrate UI logic
- **Domain Layer:** `treatment.types.ts` — `ToothState`, `AppliedAct`, `ActCategory` entities
- **Infrastructure Layer:** `dentalChartStore.ts` (Zustand) — state persistence; future: API adapter

---

## Definition of Done

- [ ] Procedural 3D dental arch renders all 32 teeth with correct FDI labels
- [ ] Upper / Both / Lower arch toggle works
- [ ] Hover glow effect on teeth
- [ ] Acts sidebar renders all acts grouped by category with icons
- [ ] Fuzzy search filters acts in real time
- [ ] Drag and drop act onto tooth — tooth color changes, act is stored in Zustand
- [ ] Click tooth → floating detail panel shows all applied acts with status
- [ ] "+ Add Act" from detail panel works
- [ ] Edit / Remove act from detail panel works
- [ ] Color legend visible at bottom of chart
- [ ] Fully responsive down to 768px (bottom sheet sidebar on mobile)
- [ ] No TypeScript errors
- [ ] Framer Motion animations on panel open/close
- [ ] All mock data in `acts.data.ts` and `teeth.data.ts`
