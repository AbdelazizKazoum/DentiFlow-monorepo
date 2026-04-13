import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {AdminLoginPage} from "@/presentation/admin/auth/AdminLoginPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await getTranslations({locale, namespace: "admin.auth" as any});
  return {
    title: `DentiFlow — ${t("login.title")}`,
    description: t("login.subtitle"),
  };
}

export default function AdminLoginRoute() {
  return <AdminLoginPage />;
}
