import type {ActCatalog} from "@/domain/treatment/entities/ActCatalog";
import type {TreatmentAct} from "@/domain/treatment/entities/TreatmentAct";
import type {Visit} from "@/domain/treatment/entities/Visit";

const clinicId =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID ??
  "00000000-0000-4000-8000-000000000001";

const now = () => new Date();

export const treatmentMemoryStore: {
  actCatalog: ActCatalog[];
  treatmentActs: TreatmentAct[];
  visits: Visit[];
} = {
  actCatalog: [
    {
      id: "caries",
      clinicId,
      code: "DIA-01",
      nameAr: "تسوس",
      nameFr: "Carie",
      nameEn: "Caries",
      defaultPrice: 180,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "filling",
      clinicId,
      code: "RES-12",
      nameAr: "حشوة",
      nameFr: "Obturation",
      nameEn: "Filling",
      defaultPrice: 520,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "crown",
      clinicId,
      code: "PRO-40",
      nameAr: "تاج",
      nameFr: "Couronne",
      nameEn: "Crown",
      defaultPrice: 2400,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "implant",
      clinicId,
      code: "SUR-90",
      nameAr: "زرعة",
      nameFr: "Implant",
      nameEn: "Implant",
      defaultPrice: 7800,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "extraction",
      clinicId,
      code: "SUR-20",
      nameAr: "خلع",
      nameFr: "Extraction",
      nameEn: "Extraction",
      defaultPrice: 650,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "root_canal",
      clinicId,
      code: "END-31",
      nameAr: "علاج الجذور",
      nameFr: "Traitement canalaire",
      nameEn: "Root Canal",
      defaultPrice: 1800,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "whitening",
      clinicId,
      code: "COS-10",
      nameAr: "تبييض",
      nameFr: "Blanchiment",
      nameEn: "Whitening",
      defaultPrice: 1200,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "orthodontics",
      clinicId,
      code: "ORT-70",
      nameAr: "تقويم",
      nameFr: "Orthodontie",
      nameEn: "Orthodontics",
      defaultPrice: 3200,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  treatmentActs: [],
  visits: [],
};
