import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingPage } from "@/presentation/components/landing/LandingPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await getTranslations({ locale, namespace: "landing.hero" as any });

  return {
    title: `DentiFlow — ${t("headline")}`,
    description: t("subheadline"),
    openGraph: {
      title: `DentiFlow — ${t("headline")}`,
      description: t("subheadline"),
      type: "website",
      siteName: "DentiFlow",
    },
    twitter: {
      card: "summary_large_image",
      title: `DentiFlow — ${t("headline")}`,
      description: t("subheadline"),
    },
  };
}

export default function HomePage() {
  return <LandingPage />;
}
