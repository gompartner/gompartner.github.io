"use client";

// 11-25 메인 랜딩 "이런 일을 맡기세요" 카드의 신청 버튼. 신청서로 올라가며 문의 내용에 일 이름을 채운다(ContactForm의 gp:prefill)
export function JobApply({ job }: { job: string }) {
  return (
    <a
      href="#apply"
      data-gtm-cta="classic_job_apply"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("gp:prefill", { detail: job }));
        setTimeout(() => document.getElementById("cc-message")?.focus({ preventScroll: true }), 400);
      }}
      className="inline-flex min-h-11 items-center rounded-md border-2 border-[#15171c] px-4 text-[15px] font-bold text-[#15171c] hover:bg-[#15171c] hover:text-white"
    >
      이 일로 신청
    </a>
  );
}
