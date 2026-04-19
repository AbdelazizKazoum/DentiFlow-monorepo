import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {AdminRegisterPage} from "@/presentation/admin/auth/AdminRegisterPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await getTranslations({locale, namespace: "admin.auth" as any});
  return {
    title: `DentiFlow — ${t("register.title")}`,
    description: t("register.subtitle"),
  };
}

export default function AdminRegisterRoute() {
  return <AdminRegisterPage />;
}
