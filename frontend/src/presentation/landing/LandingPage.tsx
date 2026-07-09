"use client";

import React from "react";
import {motion} from "framer-motion";
import type {Variants} from "framer-motion";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  IdCard,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import {LandingNavigation} from "./sections/LandingNavigation";

const serviceKeys = ["consultation", "care", "radiology", "emergency"] as const;
const processKeys = ["identify", "triage", "confirm"] as const;
const heroItem: Variants = {
  hidden: {opacity: 0, y: 18},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.7, ease: "easeOut"},
  },
};
const heroList: Variants = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.1, delayChildren: 0.35}},
};

export function LandingPage() {
  const t = useTranslations("landing");

  const handleAppointmentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    toast.success(t("appointment.toast"));
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      <LandingNavigation />

      <main>
        <motion.section
          id="home"
          className="relative min-h-[720px] overflow-hidden bg-[#0c332f] pt-24 text-white"
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center opacity-[0.32]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=85&w=1800')",
            }}
            initial={{scale: 1.06}}
            animate={{scale: 1}}
            transition={{duration: 1.8, ease: [0.16, 1, 0.3, 1]}}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,51,47,0.96)_0%,rgba(12,51,47,0.88)_43%,rgba(12,51,47,0.66)_100%)]"
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-[#d7b56d]/60"
            initial={{scaleX: 0, transformOrigin: "left"}}
            animate={{scaleX: 1}}
            transition={{duration: 1.1, delay: 0.35, ease: "easeOut"}}
            aria-hidden="true"
          />

          <div className="relative mx-auto grid min-h-[640px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-emerald-50"
                variants={heroItem}
              >
                <ShieldCheck size={16} />
                {t("hero.badge")}
              </motion.div>
              <motion.h1
                className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
                variants={heroItem}
              >
                {t("hero.headline")}
              </motion.h1>
              <motion.p
                className="mt-6 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg"
                variants={heroItem}
              >
                {t("hero.subheadline")}
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col gap-3 sm:flex-row"
                variants={heroItem}
              >
                <motion.a
                  href="#appointment"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[#d7b56d] px-5 text-sm font-semibold text-[#102f2a] transition hover:bg-[#e1c782]"
                  whileHover={{y: -2}}
                  whileTap={{scale: 0.98}}
                >
                  {t("hero.primaryCta")}
                </motion.a>
                <motion.a
                  href="#services"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                  whileHover={{y: -2}}
                  whileTap={{scale: 0.98}}
                >
                  {t("hero.secondaryCta")}
                </motion.a>
              </motion.div>

              <motion.dl
                className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
                variants={heroList}
              >
                <motion.div
                  className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  variants={heroItem}
                >
                  <dt className="text-sm text-emerald-100">{t("hero.stats.access.label")}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">
                    {t("hero.stats.access.value")}
                  </dd>
                </motion.div>
                <motion.div
                  className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  variants={heroItem}
                >
                  <dt className="text-sm text-emerald-100">{t("hero.stats.pathway.label")}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">
                    {t("hero.stats.pathway.value")}
                  </dd>
                </motion.div>
                <motion.div
                  className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  variants={heroItem}
                >
                  <dt className="text-sm text-emerald-100">{t("hero.stats.records.label")}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">
                    {t("hero.stats.records.value")}
                  </dd>
                </motion.div>
              </motion.dl>
            </div>

            <motion.aside
              className="hidden rounded-lg border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-black/20 backdrop-blur-md lg:block"
              initial={{opacity: 0, x: 28}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1]}}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold text-[#d7b56d]">
                    {t("hero.panel.kicker")}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    {t("hero.panel.title")}
                  </h2>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#d7b56d] text-[#102f2a]">
                  <CalendarCheck size={20} />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {processKeys.map((key, index) => (
                  <motion.div
                    key={key}
                    className="flex items-start gap-3 rounded-md border border-white/10 bg-white/10 p-3"
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.45, delay: 0.7 + index * 0.12}}
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-emerald-50 text-xs font-semibold text-emerald-900">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {t(`appointment.process.${key}.title`)}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-emerald-50">
                        {t(`appointment.process.${key}.description`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.aside>
          </div>
        </motion.section>

        <section id="center" className="border-b border-emerald-900/10 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold text-emerald-700">{t("center.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                {t("center.title")}
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-zinc-600">
                {t("center.description")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-900/10 bg-[#f4f8f5] p-5">
                <HeartPulse className="text-emerald-700" size={24} />
                <h3 className="mt-4 font-semibold text-zinc-950">
                  {t("center.cards.continuity.title")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {t("center.cards.continuity.description")}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-900/10 bg-[#f4f8f5] p-5">
                <FileText className="text-emerald-700" size={24} />
                <h3 className="mt-4 font-semibold text-zinc-950">
                  {t("center.cards.records.title")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {t("center.cards.records.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-[#f7faf8] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-emerald-700">{t("services.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                {t("services.title")}
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {serviceKeys.map((key) => (
                <article
                  key={key}
                  className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm"
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    {key === "consultation" && <Stethoscope size={20} />}
                    {key === "care" && <HeartPulse size={20} />}
                    {key === "radiology" && <FileText size={20} />}
                    {key === "emergency" && <CalendarCheck size={20} />}
                  </div>
                  <h3 className="font-semibold text-zinc-950">
                    {t(`services.items.${key}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {t(`services.items.${key}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="appointment" className="bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                {t("appointment.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                {t("appointment.title")}
              </h2>
              <p className="mt-5 leading-8 text-zinc-600">
                {t("appointment.description")}
              </p>

              <div className="mt-8 space-y-3">
                {processKeys.map((key, index) => (
                  <div
                    key={key}
                    className="flex gap-3 rounded-lg border border-emerald-900/10 bg-[#f4f8f5] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-zinc-950">
                        {t(`appointment.process.${key}.title`)}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {t(`appointment.process.${key}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleAppointmentSubmit}
              className="rounded-lg border border-emerald-900/10 bg-[#f7faf8] p-5 shadow-sm sm:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  icon={<UserRound size={18} />}
                  label={t("appointment.form.fullName")}
                  name="fullName"
                  placeholder={t("appointment.form.fullNamePlaceholder")}
                  required
                />
                <Field
                  icon={<IdCard size={18} />}
                  label={t("appointment.form.registration")}
                  name="registration"
                  placeholder={t("appointment.form.registrationPlaceholder")}
                  required
                />
                <Field
                  icon={<Phone size={18} />}
                  label={t("appointment.form.phone")}
                  name="phone"
                  placeholder={t("appointment.form.phonePlaceholder")}
                  required
                  type="tel"
                />
                <Field
                  icon={<CalendarCheck size={18} />}
                  label={t("appointment.form.date")}
                  name="date"
                  required
                  type="date"
                />
                <label className="flex flex-col gap-2 text-sm font-medium text-zinc-800">
                  {t("appointment.form.reason")}
                  <select
                    name="reason"
                    required
                    className="h-11 rounded-md border border-emerald-900/10 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  >
                    <option value="">{t("appointment.form.reasonPlaceholder")}</option>
                    <option>{t("appointment.form.reasons.consultation")}</option>
                    <option>{t("appointment.form.reasons.followUp")}</option>
                    <option>{t("appointment.form.reasons.urgentCare")}</option>
                    <option>{t("appointment.form.reasons.document")}</option>
                  </select>
                </label>
                <Field
                  icon={<Clock3 size={18} />}
                  label={t("appointment.form.time")}
                  name="time"
                  type="time"
                />
                <label className="flex flex-col gap-2 text-sm font-medium text-zinc-800 sm:col-span-2">
                  {t("appointment.form.notes")}
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder={t("appointment.form.notesPlaceholder")}
                    className="rounded-md border border-emerald-900/10 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-emerald-900/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-zinc-600">
                  {t("appointment.form.privacy")}
                </p>
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900"
                >
                  {t("appointment.form.submit")}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section id="contact" className="bg-[#102f2a] py-14 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            <div className="flex gap-3">
              <MapPin className="shrink-0 text-[#d7b56d]" size={22} />
              <div>
                <h3 className="font-semibold">{t("contact.location.title")}</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50">
                  {t("contact.location.value")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="shrink-0 text-[#d7b56d]" size={22} />
              <div>
                <h3 className="font-semibold">{t("contact.phone.title")}</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50">
                  {t("contact.phone.value")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="shrink-0 text-[#d7b56d]" size={22} />
              <div>
                <h3 className="font-semibold">{t("contact.hours.title")}</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50">
                  {t("contact.hours.value")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  icon,
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-zinc-800">
      {label}
      <span className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
          {icon}
        </span>
        <input
          name={name}
          required={required}
          type={type}
          placeholder={placeholder}
          className="h-11 w-full rounded-md border border-emerald-900/10 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
        />
      </span>
    </label>
  );
}
