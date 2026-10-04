import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { privacyVersions } from "@/data/privacyPolicy";

// 지난 버전 개인정보처리방침. 현재 버전은 /privacy 에서 보여 준다.
export function generateStaticParams() {
  return privacyVersions.slice(1).map((v) => ({ version: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;
  const v = privacyVersions.find((x) => x.id === version);
  return {
    title: `개인정보처리방침 ${v?.id ?? ""}번째 버전`,
    alternates: { canonical: `/privacy/${version}` },
    robots: { index: false },
  };
}

export default async function PrivacyVersionPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const v = privacyVersions.find((x) => x.id === version);
  if (!v || v.id === privacyVersions[0].id) notFound();
  return <PrivacyPolicy version={v} />;
}
