import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassicPrivacy } from "@/components/classic/support/ClassicPrivacy";
import { LdScript } from "@/components/seo/JsonLd";
import { privacyVersions } from "@/data/classic/privacyPolicy";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

// 지난 버전 개인정보처리방침. 현재 버전은 /privacy 에서 보여 준다.
export function generateStaticParams() {
  return privacyVersions.slice(1).map((v) => ({ version: v.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  const v = privacyVersions.find((x) => x.id === version);
  const title = `개인정보처리방침 ${v?.id ?? ""}번째 버전`;
  // 지난 버전은 검색에서 빼고(noindex) 대표 주소를 두지 않는다. 공유 미리보기는 이 버전 주소와 제목으로.
  const meta = pageMeta({ title, description: `${v?.date ?? ""} 시행 ${title}. ${v?.note ?? ""}`, path: `/privacy/${version}` });
  return { ...meta, alternates: {}, robots: { index: false, follow: true } };
}

export default async function ClassicPrivacyVersionPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const v = privacyVersions.find((x) => x.id === version);
  if (!v || v.id === privacyVersions[0].id) notFound();
  return (
    <>
      <LdScript
        data={breadcrumbLd([
          { name: "개인정보처리방침", path: "/privacy" },
          { name: `${v.id}번째 버전`, path: `/privacy/${v.id}` },
        ])}
      />
      <ClassicPrivacy version={v} />
    </>
  );
}
