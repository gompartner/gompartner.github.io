import type { Metadata } from "next";
import { ClassicPrivacy } from "@/components/classic/support/ClassicPrivacy";
import { privacyVersions } from "@/data/classic/privacyPolicy";
import { profile } from "@/data/classic/profile";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "개인정보처리방침",
  description: `${profile.name}가 홈페이지 제작과 유지보수 상담에서 처리하는 개인정보의 항목, 목적, 보유 기간, 파기 절차를 안내합니다.`,
  path: "/privacy",
});

export default function ClassicPrivacyPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "개인정보처리방침", path: "/privacy" }])} />
      <ClassicPrivacy version={privacyVersions[0]} />
    </>
  );
}
