import type { Metadata } from "next";
import { TermsGenerator } from "@/components/tools/TermsGenerator";

export const metadata: Metadata = {
  title: "이용약관 생성기 (표준약관 기준, 무료)",
  description:
    "홈페이지, 회원제 서비스, 쇼핑몰에 필요한 이용약관을 공정거래위원회 전자상거래 표준약관 구성에 맞춰 바로 만듭니다. 회원가입, 결제, 청약철회, 게시물 조항을 골라 넣고 글자·HTML로 복사합니다.",
  alternates: { canonical: "/tools/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <p className="text-[15px] font-bold text-accent">무료 도구</p>
      <h1 className="mt-1 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">이용약관 생성기</h1>
      <p className="mt-2 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary">
        사이트 유형과 회원가입, 결제, 게시판 여부를 고르면 공정거래위원회 전자상거래 표준약관 구성에 맞춰 필요한 조항만 담은 이용약관을 만들어 드립니다.
      </p>
      <TermsGenerator />
    </div>
  );
}
