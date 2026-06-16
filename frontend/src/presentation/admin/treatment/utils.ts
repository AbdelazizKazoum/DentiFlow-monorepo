import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothId,
  ToothTreatment,
} from "@/domain/treatment/entities/toothTreatment";
import {ACT_META} from "./treatmentConfig";
import type {ActCatalogMeta, GroupedTreatmentActs, TreatmentTotals} from "./types";
import {getToothFdi} from "./data/toothNames.data";

export function getActMeta(actId: string): ActCatalogMeta {
  return ACT_META[actId] ?? {
    code: "ACT",
    price: 0,
    duration: "TBD",
    surface: "Clinical",
  };
}

export function groupTreatmentActs(acts: DentalAct[]): GroupedTreatmentActs {
  return acts.reduce<GroupedTreatmentActs>((acc, act) => {
    acc[act.category] = [...(acc[act.category] ?? []), act];
    return acc;
  }, {});
}

export function filterTreatmentActs(
  acts: DentalAct[],
  query: string,
): DentalAct[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return acts;

  return acts.filter((act) =>
    `${act.label} ${act.category} ${getActMeta(act.id).code}`
      .toLowerCase()
      .includes(normalized),
  );
}

export function calculateTreatmentTotals(
  treatments: ToothTreatment[],
): TreatmentTotals {
  const planned = treatments.filter(
    (treatment) => treatment.status !== "completed",
  );

  return {
    teeth: new Set(treatments.map((treatment) => treatment.toothId)).size,
    planned: planned.length,
    completed: treatments.filter((treatment) => treatment.status === "completed")
      .length,
    amount: planned.reduce(
      (sum, treatment) => sum + getActMeta(treatment.actId).price,
      0,
    ),
  };
}

export function getAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();

  if (
    today.getMonth() < dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() &&
      today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function getToothKind(toothId: ToothId) {
  const number = Number(getToothFdi(toothId).slice(1));

  if (number <= 2) return "incisor";
  if (number === 3) return "canine";
  if (number <= 5) return "premolar";
  return "molar";
}

export function getToothPath(kind: string, isUpper: boolean) {
  if (kind === "molar") {
    return isUpper
      ? "M18 18 C14 23 13 34 15 50 C17 66 23 78 32 78 C39 78 42 68 43 58 C44 68 47 78 54 78 C63 78 69 66 71 50 C73 34 72 23 68 18 C62 10 54 13 48 18 C45 21 42 21 39 18 C32 13 24 10 18 18 Z"
      : "M18 62 C14 57 13 46 15 30 C17 14 23 2 32 2 C39 2 42 12 43 22 C44 12 47 2 54 2 C63 2 69 14 71 30 C73 46 72 57 68 62 C62 70 54 67 48 62 C45 59 42 59 39 62 C32 67 24 70 18 62 Z";
  }

  if (kind === "premolar") {
    return isUpper
      ? "M24 17 C19 23 18 34 20 50 C22 66 28 78 40 78 C52 78 58 66 60 50 C62 34 61 23 56 17 C51 11 46 14 42 19 C41 20 39 20 38 19 C34 14 29 11 24 17 Z"
      : "M24 63 C19 57 18 46 20 30 C22 14 28 2 40 2 C52 2 58 14 60 30 C62 46 61 57 56 63 C51 69 46 66 42 61 C41 60 39 60 38 61 C34 66 29 69 24 63 Z";
  }

  if (kind === "canine") {
    return isUpper
      ? "M31 13 C22 24 20 42 24 59 C27 72 33 79 40 79 C47 79 53 72 56 59 C60 42 58 24 49 13 C45 8 43 15 40 24 C37 15 35 8 31 13 Z"
      : "M31 67 C22 56 20 38 24 21 C27 8 33 1 40 1 C47 1 53 8 56 21 C60 38 58 56 49 67 C45 72 43 65 40 56 C37 65 35 72 31 67 Z";
  }

  return isUpper
    ? "M29 15 C23 24 22 40 25 57 C28 72 33 79 40 79 C47 79 52 72 55 57 C58 40 57 24 51 15 C47 9 43 16 40 24 C37 16 33 9 29 15 Z"
    : "M29 65 C23 56 22 40 25 23 C28 8 33 1 40 1 C47 1 52 8 55 23 C58 40 57 56 51 65 C47 71 43 64 40 56 C37 64 33 71 29 65 Z";
}
