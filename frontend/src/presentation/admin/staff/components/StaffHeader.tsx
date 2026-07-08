import {Plus} from "lucide-react";
import {useTranslations} from "next-intl";

interface StaffHeaderProps {
  onAddNew: () => void;
}

export function StaffHeader({onAddNew}: StaffHeaderProps) {
  const t = useTranslations("admin.staff");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("header.title")}</h1>
        <p className="text-sm" style={{color: "var(--text-muted)"}}>
          {t("header.subtitle")}
        </p>
      </div>
      <button
        onClick={onAddNew}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
          shadow-sm transition-all duration-150"
        style={{backgroundColor: "var(--brand-primary)"}}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--brand-primary-dark)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--brand-primary)")
        }
      >
        <Plus size={16} />
        {t("header.addStaff")}
      </button>
    </div>
  );
}
