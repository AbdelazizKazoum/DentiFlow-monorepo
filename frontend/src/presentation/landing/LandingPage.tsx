"use client";

import React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type {MotionStyle, Variants} from "framer-motion";
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
const heroDots = [
  {left: "12%", top: "20%", size: 5, delay: 0, duration: 9},
  {left: "22%", top: "72%", size: 3, delay: 1.4, duration: 10},
  {left: "42%", top: "18%", size: 4, delay: 0.8, duration: 12},
  {left: "58%", top: "66%", size: 3, delay: 2.1, duration: 9},
  {left: "74%", top: "28%", size: 5, delay: 1.1, duration: 11},
  {left: "88%", top: "76%", size: 4, delay: 0.4, duration: 10},
] as const;
const pageDots = [
  {left: "8%", top: "18%", size: 4, delay: 0.2, duration: 12},
  {left: "28%", top: "48%", size: 3, delay: 1.6, duration: 13},
  {left: "64%", top: "20%", size: 4, delay: 0.9, duration: 11},
  {left: "86%", top: "62%", size: 3, delay: 2.2, duration: 12},
] as const;
const MAP_URL =
  "https://www.google.com/maps/place/Centre+d'Odontologie+de+la+Gendarmerie+Royale/@33.9952861,-6.854134,17z/data=!3m1!4b1!4m6!3m5!1s0xda76c9204cee22f:0x6aff777785d8fa43!8m2!3d33.9952861!4d-6.8515591!16s%2Fg%2F12ll10tgs";
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
const sectionIntro: Variants = {
  hidden: {opacity: 0, y: 24},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.65, ease: "easeOut"},
  },
};
const sectionList: Variants = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.1, delayChildren: 0.15}},
};
const sectionCard: Variants = {
  hidden: {opacity: 0, y: 18},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.5, ease: "easeOut"},
  },
};
const sectionViewport = {once: true, amount: 0.25};

export function LandingPage() {
  const t = useTranslations("landing");
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, {stiffness: 70, damping: 24, mass: 0.5});
  const springY = useSpring(pointerY, {stiffness: 70, damping: 24, mass: 0.5});
  const dotsX = useTransform(springX, [-1, 1], [-18, 18]);
  const dotsY = useTransform(springY, [-1, 1], [-12, 12]);
  const ringX = useTransform(springX, [-1, 1], [14, -14]);
  const ringY = useTransform(springY, [-1, 1], [10, -10]);

  const handleHeroPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointerX.set(nextX);
    pointerY.set(nextY);
  };

  const resetHeroPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const handleAppointmentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    toast.success(t("appointment.toast"));
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      <LandingNavigation />

      <main className="relative overflow-hidden">
        <AmbientDots
          dots={pageDots}
          className="absolute inset-x-0 top-[100svh] bottom-0 z-0 text-emerald-700/25"
        />
        <motion.section
          id="home"
          className="relative h-[100svh] max-h-[100svh] overflow-hidden bg-[#0c332f] pt-20 text-white"
          initial="hidden"
          animate="visible"
          onPointerMove={handleHeroPointerMove}
          onPointerLeave={resetHeroPointer}
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
          <AmbientDots
            dots={heroDots}
            className="absolute inset-0 z-0 text-[#d7b56d]/55"
            style={{x: dotsX, y: dotsY}}
          />
          <motion.div
            className="absolute right-[8%] top-1/2 z-0 hidden h-72 w-72 -translate-y-1/2 rounded-full border border-[#d7b56d]/15 lg:block"
            animate={{rotate: 360}}
            transition={{duration: 38, repeat: Infinity, ease: "linear"}}
            style={{x: ringX, y: ringY}}
            aria-hidden="true"
          />
          <motion.div
            className="absolute right-[13%] top-1/2 z-0 hidden h-44 w-44 -translate-y-1/2 rounded-full border border-white/10 lg:block"
            animate={{rotate: -360}}
            transition={{duration: 32, repeat: Infinity, ease: "linear"}}
            style={{x: dotsX, y: dotsY}}
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-[#d7b56d]/60"
            initial={{scaleX: 0, transformOrigin: "left"}}
            animate={{scaleX: 1}}
            transition={{duration: 1.1, delay: 0.35, ease: "easeOut"}}
            aria-hidden="true"
          />

          <div className="relative mx-auto grid h-[calc(100svh-5rem)] max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-emerald-50 sm:text-sm"
                variants={heroItem}
              >
                <ShieldCheck size={16} />
                {t("hero.badge")}
              </motion.div>
              <motion.h1
                className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
                variants={heroItem}
              >
                {t("hero.headline")}
              </motion.h1>
              <motion.p
                className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base lg:text-lg"
                variants={heroItem}
              >
                {t("hero.subheadline")}
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col gap-3 sm:flex-row"
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
                className="mt-8 hidden max-w-2xl grid-cols-3 gap-3 sm:grid"
                variants={heroList}
              >
                <motion.div
                  className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                  variants={heroItem}
                >
                  <dt className="text-sm text-emerald-100">{t("hero.stats.access.label")}</dt>
                  <dd className="mt-1 text-xl font-semibold text-white">
                    {t("hero.stats.access.value")}
                  </dd>
                </motion.div>
                <motion.div
                  className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                  variants={heroItem}
                >
                  <dt className="text-sm text-emerald-100">{t("hero.stats.pathway.label")}</dt>
                  <dd className="mt-1 text-xl font-semibold text-white">
                    {t("hero.stats.pathway.value")}
                  </dd>
                </motion.div>
                <motion.div
                  className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                  variants={heroItem}
                >
                  <dt className="text-sm text-emerald-100">{t("hero.stats.records.label")}</dt>
                  <dd className="mt-1 text-xl font-semibold text-white">
                    {t("hero.stats.records.value")}
                  </dd>
                </motion.div>
              </motion.dl>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="center"
          className="relative z-10 scroll-mt-20 border-b border-emerald-900/10 bg-white py-20"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
            <motion.div variants={sectionIntro}>
              <p className="text-sm font-semibold text-emerald-700">{t("center.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                {t("center.title")}
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-zinc-600">
                {t("center.description")}
              </p>
            </motion.div>
            <motion.div
              className="grid gap-3 sm:grid-cols-2"
              variants={sectionList}
            >
              <motion.div
                className="rounded-lg border border-emerald-900/10 bg-[#f4f8f5] p-5"
                variants={sectionCard}
                whileHover={{y: -3}}
              >
                <HeartPulse className="text-emerald-700" size={24} />
                <h3 className="mt-4 font-semibold text-zinc-950">
                  {t("center.cards.continuity.title")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {t("center.cards.continuity.description")}
                </p>
              </motion.div>
              <motion.div
                className="rounded-lg border border-emerald-900/10 bg-[#f4f8f5] p-5"
                variants={sectionCard}
                whileHover={{y: -3}}
              >
                <FileText className="text-emerald-700" size={24} />
                <h3 className="mt-4 font-semibold text-zinc-950">
                  {t("center.cards.records.title")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {t("center.cards.records.description")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="services"
          className="relative z-10 scroll-mt-20 bg-[#f7faf8]/95 py-20"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div className="max-w-2xl" variants={sectionIntro}>
              <p className="text-sm font-semibold text-emerald-700">{t("services.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                {t("services.title")}
              </h2>
            </motion.div>

            <motion.div
              className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
              variants={sectionList}
            >
              {serviceKeys.map((key) => (
                <motion.article
                  key={key}
                  className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm"
                  variants={sectionCard}
                  whileHover={{y: -4}}
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
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="appointment"
          className="relative z-10 scroll-mt-20 bg-white py-20"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
            <motion.div variants={sectionIntro}>
              <p className="text-sm font-semibold text-emerald-700">
                {t("appointment.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                {t("appointment.title")}
              </h2>
              <p className="mt-5 leading-8 text-zinc-600">
                {t("appointment.description")}
              </p>

              <motion.div className="mt-8 space-y-3" variants={sectionList}>
                {processKeys.map((key, index) => (
                  <motion.div
                    key={key}
                    className="flex gap-3 rounded-lg border border-emerald-900/10 bg-[#f4f8f5] p-4"
                    variants={sectionCard}
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
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.form
              onSubmit={handleAppointmentSubmit}
              className="rounded-lg border border-emerald-900/10 bg-[#f7faf8] p-5 shadow-sm sm:p-6"
              variants={sectionIntro}
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
            </motion.form>
          </div>
        </motion.section>

        <motion.section
          id="contact"
          className="relative z-10 scroll-mt-20 bg-[#102f2a] py-14 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <motion.div
            className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8"
            variants={sectionList}
          >
            <motion.div className="flex gap-3" variants={sectionCard}>
              <MapPin className="shrink-0 text-[#d7b56d]" size={22} />
              <div>
                <h3 className="font-semibold">{t("contact.location.title")}</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50">
                  {t("contact.location.value")}
                </p>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-[#d7b56d] underline-offset-4 transition hover:text-[#f0d894] hover:underline"
                >
                  {t("contact.location.mapLink")}
                </a>
              </div>
            </motion.div>
            <motion.div className="flex gap-3" variants={sectionCard}>
              <Phone className="shrink-0 text-[#d7b56d]" size={22} />
              <div>
                <h3 className="font-semibold">{t("contact.phone.title")}</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50">
                  {t("contact.phone.value")}
                </p>
              </div>
            </motion.div>
            <motion.div className="flex gap-3" variants={sectionCard}>
              <CheckCircle2 className="shrink-0 text-[#d7b56d]" size={22} />
              <div>
                <h3 className="font-semibold">{t("contact.hours.title")}</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50">
                  {t("contact.hours.value")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
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

function AmbientDots({
  dots,
  className,
  style,
}: {
  dots: ReadonlyArray<{
    left: string;
    top: string;
    size: number;
    delay: number;
    duration: number;
  }>;
  className: string;
  style?: MotionStyle;
}) {
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      {dots.map((dot, index) => (
        <motion.span
          key={`${dot.left}-${dot.top}-${index}`}
          className="absolute rounded-full bg-current shadow-[0_0_24px_currentColor]"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            opacity: [0.18, 0.75, 0.18],
            x: [0, 18, -8, 0],
            y: [0, -16, 10, 0],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}
