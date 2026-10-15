import type { Metadata } from "next";
import { CronExplainer } from "@/components/tools/CronExplainer";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "cron 표현식 한국어 풀이 (다음 실행 시각 계산, 무료)",
  description: fitDescription("cron 표현식을 \"평일 오전 9시 30분에 실행\"처럼 한국어로 풀고 다음 실행 시각을 한국 시간으로 보여 줍니다."),
  alternates: { canonical: "/tools/cron" },
};

export default function ClassicCronPage() {
  return (
    <ToolFrame href="/classic/tools/cron">
      <CronExplainer />
    </ToolFrame>
  );
}
