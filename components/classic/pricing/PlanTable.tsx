import Link from "next/link";
import { Check } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { formatWon, manwon, planCommon, samplesForPlan, type Plan } from "@/data/classic/pricing";
import { projects } from "@/data/classic/projects";

const th = "sticky left-0 z-[1] w-[112px] bg-[#f6f7f9] px-4 py-4 text-left align-top text-[15px] font-bold text-[#3d4450] md:w-[180px] md:px-5";
const td = "px-4 py-4 align-top text-[16px] leading-[1.6] md:px-6";

/** 패키지 비교표. 열은 패키지, 행은 금액, 기간, 수정 횟수, 포함 항목. 휴대폰에서는 표만 가로로 밀어 본다. */
export function PlanTable({ plans, product, ctaPrefix }: { plans: Plan[]; product: string; ctaPrefix: string }) {
  const list = (items: string[]) => (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check size={18} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
  const samples = plans.map((p) =>
    samplesForPlan(p.id)
      .slice(0, 3)
      .map((s) => ({ ...s, project: projects.find((x) => x.id === s.id) }))
      .filter((s) => s.project?.demoUrl.startsWith("/demo/"))
  );

  return (
    <div className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[720px] border-collapse border-t-2 border-[#15171c]">
        <caption className="sr-only">{product} 패키지 비교</caption>
        <thead>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="col" className={th}>
              구분
            </th>
            {plans.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-5 text-left align-top md:px-6">
                <span className="block text-[14px] font-bold text-[#256ef4]">{p.name}</span>
                {p.title !== p.name && <span className="mt-1 block text-[19px] font-extrabold tracking-[-0.03em] md:text-[22px]">{p.title}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              금액
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                <span className="text-[24px] font-extrabold tabular-nums tracking-[-0.03em] md:text-[28px]">{formatWon(p.price)}</span>
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              작업 기간
            </th>
            {plans.map((p) => (
              <td key={p.id} className={`${td} tabular-nums`}>
                {p.days}일
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              수정 횟수
            </th>
            {plans.map((p) => (
              <td key={p.id} className={`${td} tabular-nums`}>
                {p.revisions}회
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              구성
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                {p.summary}
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              포함 항목
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                {list(p.includes)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              공통 포함
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                {list(planCommon)}
              </td>
            ))}
          </tr>
          {samples.some((s) => s.length > 0) && (
            <tr className="border-b border-[#e6e9ee]">
              <th scope="row" className={th}>
                샘플
              </th>
              {samples.map((list, i) => (
                <td key={plans[i].id} className={td}>
                  {list.length ? (
                    <ul className="space-y-1.5">
                      {list.map((s) => (
                        <li key={s.id}>
                          <Link href={`/classic/sample/${s.project!.demoUrl.replace("/demo/", "")}`} className="underline-offset-4 hover:text-[#256ef4] hover:underline">
                            {s.project!.title}
                          </Link>{" "}
                          <span className="tabular-nums text-[#5b6370]">{manwon(s.total)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[#8a929e]">없음</span>
                  )}
                </td>
              ))}
            </tr>
          )}
          <tr className="border-b border-[#15171c]">
            <th scope="row" className={th}>
              <span className="sr-only">상담</span>
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                <ChannelTalkButton
                  cta={`${ctaPrefix}_${p.id}`}
                  message={`${p.title === p.name ? `${product} ${p.name}` : p.title}(${manwon(p.price)}) 패키지로 상담받고 싶어요.`}
                  className="inline-flex h-11 w-full items-center justify-center rounded-md border border-[#c9cfd8] bg-white px-4 text-[15px] font-bold text-[#15171c] transition-colors hover:border-[#256ef4] hover:text-[#256ef4]"
                >
                  이 패키지로 상담
                </ChannelTalkButton>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
