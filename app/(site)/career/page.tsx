import type { Metadata } from "next";
import { HistoryTimeline } from "@/components/landing/HistoryTimeline";
import { historyGroups } from "@/lib/history";

export const metadata: Metadata = {
  title: "주요 경력",
  description: "공공기관, 대학, 금융, 기업·병원 홈페이지와 업무 시스템을 구축·운영한 경력입니다. 발주처와 소속은 공개하지 않습니다.",
  alternates: { canonical: "/career" },
};

export default function CareerPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">주요 경력</h1>
      <HistoryTimeline groups={historyGroups} />
    </div>
  );
}
