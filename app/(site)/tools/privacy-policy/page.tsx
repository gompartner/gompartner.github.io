import type { Metadata } from "next";
import { PrivacyPolicyGenerator } from "@/components/tools/PrivacyPolicyGenerator";

export const metadata: Metadata = {
  title: "개인정보처리방침 생성기 (무료)",
  description:
    "쇼핑몰, 회원제 홈페이지, 예약 서비스에 필요한 개인정보처리방침을 사이트 유형과 수집 항목만 골라 바로 만듭니다. 글자·HTML 복사와 파일 내려받기를 지원합니다.",
  alternates: { canonical: "/tools/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">개인정보처리방침 생성기</h1>
      <PrivacyPolicyGenerator />
    </div>
  );
}
