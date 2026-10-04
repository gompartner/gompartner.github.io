import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { privacyVersions } from "@/data/privacyPolicy";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${profile.name} 사이트의 개인정보처리방침입니다.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyPolicy version={privacyVersions[0]} />;
}
