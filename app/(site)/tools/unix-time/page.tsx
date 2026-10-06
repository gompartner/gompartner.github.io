import type { Metadata } from "next";
import { UnixTimeConverter } from "@/components/tools/UnixTimeConverter";

export const metadata: Metadata = {
  title: "유닉스 시간 변환기 (타임스탬프, 한국 시간, 무료)",
  description:
    "유닉스 타임스탬프를 한국 시간과 UTC, ISO 8601로 바꾸고, 날짜를 유닉스 시간으로 바꿉니다. 초, 밀리초, 마이크로초, 나노초를 자릿수로 알아서 구분합니다.",
  alternates: { canonical: "/tools/unix-time" },
};

export default function UnixTimePage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">유닉스 시간 변환기</h1>
      <p className="mt-2 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary">
        유닉스 시간을 한국 시간으로, 날짜를 유닉스 시간으로 바꿉니다. 초와 밀리초는 자릿수로 알아서 구분합니다.
      </p>
      <UnixTimeConverter />
    </div>
  );
}
