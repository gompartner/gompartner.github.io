import type { Metadata } from "next";
import { UnixTimeConverter } from "@/components/classic/tools/UnixTimeConverter";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "유닉스 시간 변환기 (타임스탬프, 한국 시간, 무료)", description: "유닉스 타임스탬프를 한국 시간과 UTC, ISO 8601로 바꾸고, 날짜를 유닉스 시간으로 바꿉니다. 초, 밀리초, 마이크로초, 나노초를 자릿수로 알아서 구분합니다.", path: "/tools/unix-time" });

export default function ClassicUnixTimePage() {
  return (
    <ToolFrame href="/tools/unix-time">
      <UnixTimeConverter />
    </ToolFrame>
  );
}
