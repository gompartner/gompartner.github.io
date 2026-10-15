import type { Metadata } from "next";
import { UnixTimeConverter } from "@/components/classic/tools/UnixTimeConverter";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "유닉스 시간 변환기 (타임스탬프, 한국 시간, 무료)",
  description: fitDescription("유닉스 타임스탬프를 한국 시간과 UTC, ISO 8601로 바꾸고, 날짜를 유닉스 시간으로 바꿉니다. 초, 밀리초, 마이크로초, 나노초를 자릿수로 알아서 구분합니다."),
  alternates: { canonical: "/tools/unix-time" },
};

export default function ClassicUnixTimePage() {
  return (
    <ToolFrame href="/classic/tools/unix-time">
      <UnixTimeConverter />
    </ToolFrame>
  );
}
