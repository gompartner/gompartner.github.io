import type { Metadata } from "next";
import { CronExplainer } from "@/components/classic/tools/CronExplainer";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "cron 표현식 한국어 풀이 (다음 실행 시각 계산, 무료)", description: "cron 표현식을 \"평일 오전 9시 30분에 실행\"처럼 한국어로 풀고 다음 실행 시각을 한국 시간으로 보여 줍니다.", path: "/tools/cron" });

export default function ClassicCronPage() {
  return (
    <ToolFrame href="/tools/cron">
      <CronExplainer />
    </ToolFrame>
  );
}
