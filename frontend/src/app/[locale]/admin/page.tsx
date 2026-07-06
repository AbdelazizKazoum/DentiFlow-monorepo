import {redirect} from "next/navigation";

export default async function AdminIndexRoute({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  redirect(`/${locale}/admin/dashboard`);
}
