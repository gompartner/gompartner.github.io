import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { formatWon, planByProject, planCommon, plans } from "@/data/pricing";

const manwon = (n: number) => `${Math.round(n / 10_000)}만 원`;

/** 데모 오른쪽 아래에 "비슷하게 만들면 얼마"를 띄운다. 누르면 패키지 내용이 펼쳐진다. */
export function PlanBar({ projectId }: { projectId: string }) {
  const plan = plans.find((p) => p.id === planByProject[projectId]);

  return (
    <details className="group fixed bottom-5 right-5 z-50 print:hidden">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 [&::-webkit-details-marker]:hidden">
        {plan ? `비슷하게 만들면 ${manwon(plan.price)}` : "비슷하게 만들기 견적"}
        <ChevronUp size={15} className="transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute bottom-full right-0 mb-2 w-[min(320px,calc(100vw-40px))] rounded-[12px] border border-black/10 bg-white p-5 text-[15px] leading-[1.6] text-[#1d2327] shadow-xl">
        {plan ? (
          <>
            <p className="font-bold">
              {plan.name} 패키지 <span className="text-[#5a6670]">· {plan.days}일</span>
            </p>
            <p className="mt-0.5 text-[22px] font-bold tabular-nums">{formatWon(plan.price)}</p>
            <p className="text-[#5a6670]">{plan.summary}</p>
            <ul className="mt-3 space-y-1">
              {[...plan.includes, ...planCommon].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#256ef4]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="font-bold">업무 프로그램은 별도 견적입니다</p>
            <p className="mt-1 text-[#5a6670]">필요한 기능과 화면 수를 듣고 금액과 기간을 알려 드립니다.</p>
          </>
        )}
        <Link
          href="/#pricing"
          className="mt-4 flex h-11 items-center justify-center rounded-md bg-[#256ef4] font-bold text-white transition-colors hover:bg-[#0b50d0]"
        >
          패키지 비교, 상담하기
        </Link>
      </div>
    </details>
  );
}
