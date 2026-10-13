import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { estimateFor, formatWon, landingPlans, manwon, planCommon, plans } from "@/data/pricing";
import { projects } from "@/data/projects";

/** 샘플 하나의 예상 견적과 비교할 기본 패키지, 상담창 주소 */
export function planInfo(projectId: string) {
  const est = estimateFor(projectId);
  const title = projects.find((p) => p.id === projectId)?.title ?? "샘플";
  // 랜딩 샘플이면 랜딩 패키지 중 가장 싼 것과 견준다
  const basic = (est?.plan.id.startsWith("landing") ? landingPlans : plans)[0];
  // 상담창 입력칸에 어떤 샘플을 보고 왔는지 미리 채운다
  const chatHref = `/?chat=1&msg=${encodeURIComponent(`${title} 샘플${est ? `(${manwon(est.total)})` : ""} 보고 문의합니다.`)}`;
  return { est, basic, chatHref };
}

/** 데모 오른쪽 아래에 "비슷하게 만들면 얼마"를 띄운다. 누르면 패키지와 추가 기능 내역이 펼쳐진다. 휴대폰에서는 DemoDock의 아래 시트가 대신한다. */
export function PlanBar({ projectId }: { projectId: string }) {
  const { est } = planInfo(projectId);

  return (
    <details className="group fixed bottom-5 right-5 z-50 hidden md:block print:hidden">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/80 [&::-webkit-details-marker]:hidden">
        {est ? `비슷하게 만들면 ${manwon(est.total)}` : "비슷하게 만들기 견적"}
        <ChevronUp size={15} className="transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute bottom-full right-0 mb-2 w-[min(340px,calc(100vw-40px))] rounded-[12px] border border-black/10 bg-white p-5 text-[15px] leading-[1.6] text-[#1d2327] shadow-xl">
        <PlanDetail projectId={projectId} />
      </div>
    </details>
  );
}

/** 제작비 내역과 상담 버튼. PC 펼침 창과 휴대폰 아래 시트가 같이 쓴다. */
export function PlanDetail({ projectId }: { projectId: string }) {
  const { est, basic, chatHref } = planInfo(projectId);
  return (
    <>
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
          {est.plan.id !== basic.id && (
            <p className="mt-2 text-[#5a6670]">
              예약·계산 같은 기능 없이 소개만 하면 {basic.title} {manwon(basic.price)}({basic.days}일)부터입니다.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="font-bold">업무 프로그램은 별도 견적입니다</p>
          <p className="mt-1 text-[#5a6670]">필요한 기능과 화면 수를 듣고 금액과 기간을 안내합니다.</p>
        </>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={chatHref}
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
    </>
  );
}
