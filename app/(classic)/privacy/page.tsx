import type { Metadata } from "next";
import { ClassicPrivacy } from "@/components/classic/support/ClassicPrivacy";
import { privacyVersions } from "@/data/classic/privacyPolicy";
import { profile } from "@/data/classic/profile";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "개인정보처리방침",
  description: `${profile.name}가 운영하는 홈페이지 상담과 사이트 지킴이, 거래장부에서 처리하는 개인정보의 항목과 목적, 보유 기간을 서비스별로 안내합니다.`,
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
