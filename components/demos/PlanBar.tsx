import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { estimateFor, formatWon, manwon, planCommon } from "@/data/pricing";

/** 데모 오른쪽 아래에 "비슷하게 만들면 얼마"를 띄운다. 누르면 패키지와 추가 기능 내역이 펼쳐진다. */
export function PlanBar({ projectId }: { projectId: string }) {
  const est = estimateFor(projectId);

  return (
    <details className="group fixed bottom-5 right-5 z-50 print:hidden">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/80 [&::-webkit-details-marker]:hidden">
        <span className="sm:hidden">{est ? manwon(est.total) : "견적"}</span>
        <span className="hidden sm:inline">{est ? `비슷하게 만들면 ${manwon(est.total)}` : "비슷하게 만들기 견적"}</span>
        <ChevronUp size={15} className="transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute bottom-full right-0 mb-2 w-[min(340px,calc(100vw-40px))] rounded-[12px] border border-black/10 bg-white p-5 text-[15px] leading-[1.6] text-[#1d2327] shadow-xl">
        {est ? (
          <>
            <p className="font-bold">
              예상 금액 <span className="font-normal text-[#5a6670]">· 작업 {est.days}일</span>
            </p>
            <p className="mt-0.5 text-[22px] font-bold tabular-nums">{formatWon(est.total)}</p>
            <dl className="mt-3 divide-y divide-black/10 border-y border-black/10">
              <div className="flex justify-between gap-3 py-2">
                <dt>
                  {est.plan.name} 패키지 <span className="text-[#5a6670]">({est.plan.title})</span>
                </dt>
                <dd className="shrink-0 tabular-nums">{manwon(est.plan.price)}</dd>
              </div>
              {est.lines.map((l) => (
                <div key={l.name} className="flex justify-between gap-3 py-2">
                  <dt>{l.name}</dt>
                  <dd className="shrink-0 tabular-nums">{manwon(l.amount)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[#5a6670]">{planCommon.join(", ")} 포함</p>
          </>
        ) : (
          <>
            <p className="font-bold">업무 프로그램은 별도 견적입니다</p>
            <p className="mt-1 text-[#5a6670]">필요한 기능과 화면 수를 듣고 금액과 기간을 알려 드립니다.</p>
          </>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/?chat=1"
            className="flex h-11 items-center justify-center rounded-md bg-[#256ef4] font-bold text-white transition-colors hover:bg-[#0b50d0]"
          >
            채팅 상담
          </Link>
          <Link
            href="/pricing"
            className="flex h-11 items-center justify-center rounded-md border border-black/15 font-bold transition-colors hover:bg-black/5"
          >
            가격표 보기
          </Link>
        </div>
      </div>
    </details>
  );
}
