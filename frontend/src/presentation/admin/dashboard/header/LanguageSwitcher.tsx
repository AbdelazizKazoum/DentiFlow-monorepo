"use client";

import {Globe2} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

const LOCALES = [
  {id: "en", label: "EN"},
  {id: "fr", label: "FR"},
  {id: "ar", label: "AR"},
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("admin.language");

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) return;

    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const query = searchParams.toString();
    router.replace(`${segments.join("/")}${query ? `?${query}` : ""}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-ui-border bg-page/80 px-2 py-1 text-text-muted">
      <Globe2 size={16} className="shrink-0" />
      <label htmlFor="admin-language" className="sr-only">
        {t("label")}
      </label>
      <select
        id="admin-language"
        value={locale}
        onChange={(event) => switchLocale(event.target.value)}
        className="bg-transparent text-xs font-bold text-foreground outline-none"
        title={t("label")}
      >
        {LOCALES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
