import type { Metadata } from "next";
import { ToolBoard } from "@/components/tools/ToolBoard";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "자료실",
  description: fitDescription("개인정보처리방침·이용약관 생성기, 웹접근성 점검표, QR코드, 이미지 용량 줄이기 같은 무료 도구입니다."),
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
