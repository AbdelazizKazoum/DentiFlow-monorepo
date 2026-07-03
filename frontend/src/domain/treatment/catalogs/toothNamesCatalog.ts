export const TOOTH_NAMES: Record<string, string> = {
  tooth_11: "11 - Upper Right Central Incisor",
  tooth_12: "12 - Upper Right Lateral Incisor",
  tooth_13: "13 - Upper Right Canine",
  tooth_14: "14 - Upper Right First Premolar",
  tooth_15: "15 - Upper Right Second Premolar",
  tooth_16: "16 - Upper Right First Molar",
  tooth_17: "17 - Upper Right Second Molar",
  tooth_18: "18 - Upper Right Third Molar",
  tooth_21: "21 - Upper Left Central Incisor",
  tooth_22: "22 - Upper Left Lateral Incisor",
  tooth_23: "23 - Upper Left Canine",
  tooth_24: "24 - Upper Left First Premolar",
  tooth_25: "25 - Upper Left Second Premolar",
  tooth_26: "26 - Upper Left First Molar",
  tooth_27: "27 - Upper Left Second Molar",
  tooth_28: "28 - Upper Left Third Molar",
  tooth_31: "31 - Lower Left Central Incisor",
  tooth_32: "32 - Lower Left Lateral Incisor",
  tooth_33: "33 - Lower Left Canine",
  tooth_34: "34 - Lower Left First Premolar",
  tooth_35: "35 - Lower Left Second Premolar",
  tooth_36: "36 - Lower Left First Molar",
  tooth_37: "37 - Lower Left Second Molar",
  tooth_38: "38 - Lower Left Third Molar",
  tooth_41: "41 - Lower Right Central Incisor",
  tooth_42: "42 - Lower Right Lateral Incisor",
  tooth_43: "43 - Lower Right Canine",
  tooth_44: "44 - Lower Right First Premolar",
  tooth_45: "45 - Lower Right Second Premolar",
  tooth_46: "46 - Lower Right First Molar",
  tooth_47: "47 - Lower Right Second Molar",
  tooth_48: "48 - Lower Right Third Molar",
};

export function getToothLabel(toothId: string): string {
  return TOOTH_NAMES[toothId] ?? toothId.replace("tooth_", "Tooth ");
}

export function getToothFdi(toothId: string): string {
  return toothId.replace("tooth_", "");
}
