import type { Metadata } from "next";
import { ClassicPrivacy } from "@/components/classic/support/ClassicPrivacy";
import { privacyVersions } from "@/data/classic/privacyPolicy";
import { profile } from "@/data/classic/profile";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: fitDescription(`${profile.name}가 제작 문의와 상담에서 처리하는 개인정보의 항목, 목적, 보유 기간, 파기 절차를 안내합니다.`),
  alternates: { canonical: "/classic/privacy" },
};

export default function ClassicPrivacyPage() {
  return <ClassicPrivacy version={privacyVersions[0]} />;
}
