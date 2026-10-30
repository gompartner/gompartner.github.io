import Link from "next/link";
import { Check } from "lucide-react";
import { planCommon, samplesForPlan, type Plan } from "@/data/classic/pricing";
import { projects } from "@/data/classic/projects";

const th = "sticky left-0 z-[1] w-[112px] bg-[#f6f7f9] px-4 py-4 text-left align-top text-[15px] font-bold text-[#3d4450] md:w-[180px] md:px-5";
const td = "px-4 py-4 align-top text-[16px] leading-[1.6] md:px-6";

/** 패키지 비교표. 열은 패키지, 행은 수정 횟수, 구성, 포함 항목. 금액과 기간은 상담 뒤에 안내한다(10-30). 휴대폰에서는 표만 가로로 밀어 본다. */
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
    <div tabIndex={0} className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[720px] border-collapse border-t-2 border-[#15171c]">
        <caption className="sr-only">{product} 패키지 비교</caption>
        <thead>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="col" className={th}>
              구분
            </th>
            {plans.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-5 text-left align-top md:px-6">
                <span className="block text-[19px] font-extrabold tracking-[-0.03em] md:text-[22px]">{p.title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
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
                카탈로그
              </th>
              {samples.map((list, i) => (
                <td key={plans[i].id} className={td}>
                  {list.length ? (
                    <ul className="space-y-1.5">
                      {list.map((s) => (
                        <li key={s.id}>
                          <Link href={`/classic/sample/${s.project!.demoUrl.replace("/demo/", "")}`} className="underline-offset-4 hover:text-[#256ef4] hover:underline">
                            {s.project!.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[#6b7280]">없음</span>
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
                <Link href="/classic/contact" data-gtm-cta={`${ctaPrefix}_${p.id}`} className="inline-flex h-11 w-full items-center justify-center rounded-md border border-[#c9cfd8] bg-white px-4 text-[15px] font-bold text-[#15171c] transition-colors hover:border-[#256ef4] hover:text-[#256ef4]">
                  이 패키지로 상담
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
