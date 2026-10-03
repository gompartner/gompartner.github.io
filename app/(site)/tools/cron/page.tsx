import type { Metadata } from "next";
import { CronExplainer } from "@/components/tools/CronExplainer";

export const metadata: Metadata = {
  title: "cron 표현식 한국어 풀이 (다음 실행 시각 계산, 무료)",
  description:
    "cron 표현식을 넣으면 \"평일 오전 9시 30분에 실행\"처럼 한국어 문장으로 풀고, 칸별 뜻과 다음 실행 시각 10개를 한국 시간으로 보여 줍니다. 초를 포함한 Spring, Quartz 식도 읽습니다.",
  alternates: { canonical: "/tools/cron" },
};

export default function CronPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <p className="text-[15px] font-bold text-accent">무료 도구</p>
      <h1 className="mt-1 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">cron 표현식 한국어 풀이</h1>
      <p className="mt-2 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary">
        cron 식을 넣으면 언제 실행되는지 한국어 문장으로 풀고, 다음 실행 시각을 한국 시간으로 계산해 드립니다.
      </p>
      <CronExplainer />
    </div>
  );
}
