import type { Metadata } from "next";
import { ToolBoard } from "@/components/tools/ToolBoard";

export const metadata: Metadata = {
  title: "자료실",
  description: "개인정보처리방침·이용약관 생성기, 웹접근성 점검표, 검색 결과 미리보기, QR코드, 이미지 용량 줄이기와 JWT, 유닉스 시간, cron 개발 도구를 무료로 쓸 수 있습니다.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">자료실</h1>
      <ToolBoard />
    </div>
  );
}
