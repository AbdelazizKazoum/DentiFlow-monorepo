import type {DentalAct} from "../entities";

export type TreatmentVisualState = "planned" | "progress" | "completed";

export interface ActVisualStyle {
  affectsTooth: boolean;
  colors?: Partial<Record<TreatmentVisualState, string>>;
}

const STYLE_BY_ACT: Record<string, ActVisualStyle> = {
  Consultation: {affectsTooth: false},
  "Panoramic X-Ray": {affectsTooth: false},
  "Scaling and Polishing": {affectsTooth: false},
  "Fluoride Treatment": {affectsTooth: false},
  "Teeth Whitening (In-Office)": {affectsTooth: false},
  "Orthodontic Consultation": {affectsTooth: false},
  "Bone Grafting": {
    affectsTooth: true,
    colors: {planned: "#c084fc", progress: "#a855f7", completed: "#7e22ce"},
  },
  "Composite Filling (1 Surface)": {
    affectsTooth: true,
    colors: {planned: "#22c55e", progress: "#16a34a", completed: "#15803d"},
  },
  "Composite Filling (2 Surfaces)": {
    affectsTooth: true,
    colors: {planned: "#14b8a6", progress: "#0d9488", completed: "#0f766e"},
  },
  "Composite Filling (3+ Surfaces)": {
    affectsTooth: true,
    colors: {planned: "#06b6d4", progress: "#0891b2", completed: "#0e7490"},
  },
  "Root Canal Treatment (Anterior)": {
    affectsTooth: true,
    colors: {planned: "#f59e0b", progress: "#d97706", completed: "#b45309"},
  },
  "Root Canal Treatment (Premolar)": {
    affectsTooth: true,
    colors: {planned: "#f97316", progress: "#ea580c", completed: "#c2410c"},
  },
  "Root Canal Treatment (Molar)": {
    affectsTooth: true,
    colors: {planned: "#fb7185", progress: "#e11d48", completed: "#be123c"},
  },
  "Simple Extraction": {
    affectsTooth: true,
    colors: {planned: "#ef4444", progress: "#dc2626", completed: "#991b1b"},
  },
  "Surgical Extraction": {
    affectsTooth: true,
    colors: {planned: "#f43f5e", progress: "#e11d48", completed: "#9f1239"},
  },
  "Wisdom Tooth Extraction": {
    affectsTooth: true,
    colors: {planned: "#d946ef", progress: "#c026d3", completed: "#86198f"},
  },
  "Ceramic Crown": {
    affectsTooth: true,
    colors: {planned: "#eab308", progress: "#ca8a04", completed: "#a16207"},
  },
  "Zirconia Crown": {
    affectsTooth: true,
    colors: {planned: "#84cc16", progress: "#65a30d", completed: "#4d7c0f"},
  },
  "Temporary Crown": {
    affectsTooth: true,
    colors: {planned: "#facc15", progress: "#eab308", completed: "#a16207"},
  },
  "Dental Implant Placement": {
    affectsTooth: true,
    colors: {planned: "#38bdf8", progress: "#0284c7", completed: "#0369a1"},
  },
};

export function getActVisualStyle(actName: string): ActVisualStyle {
  return STYLE_BY_ACT[actName] ?? {affectsTooth: true};
}

export function getActVisualColor(
  actName: string | undefined,
  state: TreatmentVisualState,
): string | null {
  if (!actName) return null;
  const visualStyle = getActVisualStyle(actName);
  if (!visualStyle.affectsTooth) return null;

  return (
    visualStyle.colors?.[state] ??
    {planned: "#64748b", progress: "#475569", completed: "#334155"}[state]
  );
}

export function getActByName(acts: DentalAct[], name: string) {
  return acts.find((act) => act.name === name);
}
