"use client";

import Link from "next/link";

// 메인 서비스 칸의 문의 버튼. 신청서로 내려가며 문의 내용에 일 이름을 채운다(ContactForm의 gp:prefill)
// tone: 어두운 칸이나 파란 칸 위에서는 light(흰 알약), 흰 칸이나 노란 칸 위에서는 dark(검은 알약)
export function JobApply({ job, tone = "light" }: { job: string; tone?: "light" | "dark" }) {
  return (
    // next/link: 그냥 a 태그의 # 이동은 뒤로 가기에서 화면이 안 바뀌는 문제가 있다
    <Link
      href="#apply"
      data-gtm-cta="classic_job_apply"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("gp:prefill", { detail: job }));
        setTimeout(() => document.getElementById("cc-message")?.focus({ preventScroll: true }), 400);
      }}
      className={`inline-flex min-h-11 items-center rounded-full px-5 text-[15px] font-bold transition-colors ${
        tone === "light" ? "bg-white text-[#0b0d12] hover:bg-[#dfe9ff]" : "bg-[#0b0d12] text-white hover:bg-[#256ef4]"
      }`}
    >
      문의하기
    </Link>
  );
}
