"use client";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {motion, AnimatePresence} from "framer-motion";
import {Mail, Lock, Eye, EyeOff, ArrowRight} from "lucide-react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {signIn} from "next-auth/react";
import type {AdminLoginCredentials} from "@/domain/auth/entities/AdminUser";

export function AdminLoginForm() {
  const t = useTranslations("admin.auth");
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<AdminLoginCredentials>();

  const onSubmit = async (data: AdminLoginCredentials) => {
    setStatus("loading");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.ok && !result.error) {
      setStatus("success");
      setTimeout(() => router.push(`/${locale}/admin/dashboard`), 1000);
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white/85 backdrop-blur-xl">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          {t("login.title")}
        </h2>
        <p className="text-slate-500 text-sm">{t("login.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {t("login.email_label")}
          </label>
          <div className="relative">
            <span className="absolute start-4 top-3.5 text-slate-400 pointer-events-none">
              <Mail size={18} />
            </span>
            <input
              id="email"
              type="email"
              placeholder={t("login.email_placeholder")}
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

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              {t("login.password_label")}
            </label>
            <a href="#" className="text-xs text-blue-600 hover:underline">
              {t("login.forgot")}
            </a>
          </div>
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
                minLength: {
                  value: 6,
                  message: t("validation.password_min"),
                },
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

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded border-slate-300 accent-blue-600"
            {...register("rememberMe")}
          />
          <label
            htmlFor="rememberMe"
            className="text-sm text-slate-600 cursor-pointer"
          >
            {t("login.remember")}
          </label>
        </div>

        {/* Status banner */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              key="success"
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm"
            >
              {t("login.success")}
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
              {t("login.error")}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2
            bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed
            transition-all focus:outline-none focus:ring-4 focus:ring-blue-600/30"
          style={{
            background:
              status === "loading" || status === "success"
                ? undefined
                : "#1e56d0",
          }}
        >
          {status === "loading" ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("login.authenticating")}
            </>
          ) : (
            <>
              {t("login.submit")}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-slate-500">
        {t("login.support_text")}{" "}
        <a href="#" className="text-blue-600 hover:underline font-medium">
          {t("login.support_link")}
        </a>
      </p>
      <p className="mt-3 text-center text-sm text-slate-500">
        {t("login.no_account")}{" "}
        <a
          href={`/${locale}/admin/register`}
          className="text-blue-600 hover:underline font-medium"
        >
          {t("login.create_account")}
        </a>
      </p>
    </div>
  );
}
