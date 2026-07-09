"use client";

import React, {useState} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Globe2, Menu, ShieldCheck, X} from "lucide-react";

const navLinks = [
  {href: "#home", key: "home"},
  {href: "#center", key: "center"},
  {href: "#services", key: "services"},
  {href: "#appointment", key: "appointment"},
  {href: "#contact", key: "contact"},
] as const;

const locales = [
  {id: "en", label: "EN"},
  {id: "fr", label: "FR"},
  {id: "ar", label: "AR"},
] as const;

export function LandingNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("landing.navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) return;

    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const query = searchParams.toString();
    router.replace(`${segments.join("/")}${query ? `?${query}` : ""}`);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0c332f]/92 text-white backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex min-w-0 items-center gap-3" aria-label={t("brand")}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#d7b56d]/40 bg-[#d7b56d] text-[#102f2a]">
            <ShieldCheck size={22} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5 text-white">
              {t("brand")}
            </span>
            <span className="hidden text-xs leading-5 text-emerald-100 sm:block">
              {t("agency")}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-emerald-50 lg:flex">
          {navLinks.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="transition hover:text-[#d7b56d]"
            >
              {t(`links.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-emerald-50">
            <Globe2 size={16} />
            <span className="sr-only">{t("language")}</span>
            <select
              value={locale}
              onChange={(event) => switchLocale(event.target.value)}
              className="bg-transparent text-sm font-semibold text-white outline-none"
              title={t("language")}
            >
              {locales.map((item) => (
                <option key={item.id} value={item.id} className="text-zinc-900">
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            href={`/${locale}/admin/login`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#d7b56d]/60 px-4 text-sm font-semibold text-[#f2db9b] transition hover:bg-[#d7b56d] hover:text-[#102f2a]"
          >
            {t("portal")}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/10 lg:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#0c332f] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium text-emerald-50">
            {navLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={closeMenu}
                className="rounded-md px-3 py-3 transition hover:bg-white/10 hover:text-[#d7b56d]"
              >
                {t(`links.${item.key}`)}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
            <label className="flex h-10 flex-1 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-emerald-50">
              <Globe2 size={16} />
              <span className="sr-only">{t("language")}</span>
              <select
                value={locale}
                onChange={(event) => switchLocale(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                title={t("language")}
              >
                {locales.map((item) => (
                  <option key={item.id} value={item.id} className="text-zinc-900">
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <Link
              href={`/${locale}/admin/login`}
              onClick={closeMenu}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#d7b56d] px-4 text-sm font-semibold text-[#102f2a]"
            >
              {t("portal")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
