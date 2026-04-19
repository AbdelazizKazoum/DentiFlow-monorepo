"use client";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {motion, AnimatePresence} from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import type {
  AdminRegisterCredentials,
  UserRole,
} from "@/domain/auth/entities/AdminUser";
import {AdminAuthRepositoryImpl} from "@/infrastructure/repositories/AdminAuthRepositoryImpl";
import {AdminRegister} from "@/application/auth/useCases/AdminRegister";

const ROLES: {value: Exclude<UserRole, "patient">; labelKey: string}[] = [
  {value: "admin", labelKey: "register.role_admin"},
  {value: "doctor", labelKey: "register.role_doctor"},
  {value: "secretariat", labelKey: "register.role_secretariat"},
  {value: "dental_assistant", labelKey: "register.role_dental_assistant"},
];

export function AdminRegisterForm() {
  const t = useTranslations("admin.auth");
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "conflict"
  >("idle");

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<AdminRegisterCredentials>({
    defaultValues: {role: "doctor"},
  });

  const password = watch("password");

  const onSubmit = async (data: AdminRegisterCredentials) => {
    setStatus("loading");
    try {
      const repo = new AdminAuthRepositoryImpl();
      const useCase = new AdminRegister(repo);
      const user = await useCase.execute(data);
      if (!user) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setTimeout(() => router.push(`/${locale}/admin/login`), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message === "EMAIL_ALREADY_REGISTERED") {
        setStatus("conflict");
      } else {
        setStatus("error");
      }
    }
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white/85 backdrop-blur-xl overflow-y-auto">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          {t("register.title")}
        </h2>
        <p className="text-slate-500 text-sm">{t("register.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {t("register.name_label")}
          </label>
          <div className="relative">
            <span className="absolute start-4 top-3.5 text-slate-400 pointer-events-none">
              <User size={18} />
            </span>
            <input
              id="fullName"
              type="text"
              placeholder={t("register.name_placeholder")}
              className={`w-full ps-12 pe-4 py-3 bg-white/50 border rounded-xl
                focus:outline-none focus:border-blue-600 focus:bg-white transition-all
                focus:ring-4 focus:ring-blue-600/20 text-slate-800 placeholder-slate-400
                ${errors.fullName ? "border-red-400" : "border-slate-200"}`}
              {...register("fullName", {
                required: t("validation.name_required"),
                minLength: {value: 2, message: t("validation.name_min")},
              })}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {t("register.email_label")}
          </label>
          <div className="relative">
            <span className="absolute start-4 top-3.5 text-slate-400 pointer-events-none">
              <Mail size={18} />
            </span>
            <input
              id="email"
              type="email"
              placeholder={t("register.email_placeholder")}
              className={`w-full ps-12 pe-4 py-3 bg-white/50 border rounded-xl
                focus:outline-none focus:border-blue-600 focus:bg-white transition-all
                focus:ring-4 focus:ring-blue-600/20 text-slate-800 placeholder-slate-400
                ${errors.email ? "border-red-400" : "border-slate-200"}`}
              {...register("email", {
                required: t("validation.email_required"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("validation.email_invalid"),
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {t("register.role_label")}
          </label>
          <div className="relative">
            <span className="absolute start-4 top-3.5 text-slate-400 pointer-events-none">
              <ShieldCheck size={18} />
            </span>
            <select
              id="role"
              className="w-full ps-12 pe-4 py-3 bg-white/50 border border-slate-200 rounded-xl
                focus:outline-none focus:border-blue-600 focus:bg-white transition-all
                focus:ring-4 focus:ring-blue-600/20 text-slate-800 appearance-none"
              {...register("role", {required: true})}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.labelKey as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {t("register.password_label")}
          </label>
          <div className="relative">
            <span className="absolute start-4 top-3.5 text-slate-400 pointer-events-none">
              <Lock size={18} />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`w-full ps-12 pe-12 py-3 bg-white/50 border rounded-xl
                focus:outline-none focus:border-blue-600 focus:bg-white transition-all
                focus:ring-4 focus:ring-blue-600/20 text-slate-800 placeholder-slate-400
                ${errors.password ? "border-red-400" : "border-slate-200"}`}
              {...register("password", {
                required: t("validation.password_required"),
                minLength: {value: 8, message: t("validation.password_min")},
              })}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {t("register.confirm_label")}
          </label>
          <div className="relative">
            <span className="absolute start-4 top-3.5 text-slate-400 pointer-events-none">
              <Lock size={18} />
            </span>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              className={`w-full ps-12 pe-12 py-3 bg-white/50 border rounded-xl
                focus:outline-none focus:border-blue-600 focus:bg-white transition-all
                focus:ring-4 focus:ring-blue-600/20 text-slate-800 placeholder-slate-400
                ${errors.confirmPassword ? "border-red-400" : "border-slate-200"}`}
              {...register("confirmPassword", {
                required: t("validation.confirm_required"),
                validate: (v) =>
                  v === password || t("validation.passwords_mismatch"),
              })}
            />
            <button
              type="button"
              aria-label="Toggle confirm password visibility"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute end-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Status banners */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              key="success"
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm"
            >
              {t("register.success")}
            </motion.div>
          )}
          {status === "conflict" && (
            <motion.div
              key="conflict"
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm"
            >
              {t("register.error_conflict")}
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {t("register.error")}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2
            disabled:opacity-70 disabled:cursor-not-allowed
            transition-all focus:outline-none focus:ring-4 focus:ring-blue-600/30"
          style={{background: "#1e56d0"}}
        >
          {status === "loading" ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("register.submitting")}
            </>
          ) : (
            <>
              {t("register.submit")}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer — link to login */}
      <p className="mt-6 text-center text-sm text-slate-500">
        {t("register.have_account")}{" "}
        <a
          href={`/${locale}/admin/login`}
          className="text-blue-600 hover:underline font-medium"
        >
          {t("register.sign_in")}
        </a>
      </p>
    </div>
  );
}
