import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { privacyVersions } from "@/data/privacyPolicy";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${profile.name} 홈페이지 제작 문의와 상담 과정에서 처리하는 개인정보의 항목, 처리 목적, 보유 기간, 제3자 제공과 처리 위탁, 파기 절차, 정보주체의 권리를 안내하는 개인정보처리방침입니다.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyPolicy version={privacyVersions[0]} />;
}
