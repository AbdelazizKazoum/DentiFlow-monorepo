/** A clinical event recorded during one visit. Events are never moved to another visit. */
export enum TreatmentActionType {
  PLANNED = "PLANNED",
  PERFORMED = "PERFORMED",
  AMENDED = "AMENDED",
  CANCELLED = "CANCELLED",
}
