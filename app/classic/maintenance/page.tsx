import type { Metadata } from "next";
import { Check, Clock, X } from "lucide-react";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, h3, wrap } from "@/components/classic/ui";
import { maintenanceServices, maintenanceSteps, responseTime } from "@/data/classic/maintenance";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 유지보수 (월 관리, 오류 수정, 인계)",
  description: "월 유지보수, 오류 수정, 다른 업체가 만든 홈페이지 인계 점검, 검색 노출 세팅. 서비스별 업무 범위와 기준을 안내합니다.",
  path: "/classic/maintenance",
});

const cellTh = "px-4 py-3.5 text-left text-[15px] font-bold text-[#3d4450] md:px-5";
const cell = "px-4 py-3.5 text-[16px] md:px-5";
const dt = "pt-5 text-[15px] font-bold text-[#3d4450] md:py-5";
const dd = "pb-5 pt-2 text-[16px] leading-[1.6] md:py-5";

// 해킹 피해 복구는 이 페이지에서 언급하지 않는다.
const shown = (items: string[]) => items.filter((i) => !i.includes("해킹"));

export default function ClassicMaintenancePage() {
  return (
    <>
      <PageHead
        title="유지보수"
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: "/classic/maintenance", label: "유지보수" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/classic/maintenance" />

      <section aria-labelledby="m-overview" className={`${wrap} py-12 md:py-16`}>
        <h2 id="m-overview" className="sr-only">
          서비스 목록
        </h2>
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[480px] border-collapse border-t-2 border-[#15171c]">
            <caption className="sr-only">유지보수 서비스와 기준</caption>
            <thead>
              <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9]">
                <th scope="col" className={cellTh}>
                  서비스
                </th>
                <th scope="col" className={cellTh}>
                  기준
                </th>
              </tr>
            </thead>
            <tbody>
              {maintenanceServices.map((s) => (
                <tr key={s.id} className="border-b border-[#e6e9ee]">
                  <th scope="row" className={`${cell} text-left`}>
                    <a href={`#${s.id}`} className="font-bold underline-offset-4 hover:text-[#256ef4] hover:underline">
                      {s.title}
                    </a>
                  </th>
                  <td className={`${cell} text-[#5b6370]`}>{s.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 flex gap-2.5 text-[16px] leading-[1.6] md:text-[17px]">
          <Clock size={20} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
          {responseTime}
        </p>
      </section>

      {maintenanceServices.map((s) => {
        const rows = [
          s.target ? { label: "대상", body: <p>{s.target}</p> } : null,
          ...[s.unit, s.does].filter((b) => !!b).map((b) => ({
            label: b!.label,
            body: (
              <ul className="space-y-1.5">
                {b!.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check size={18} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ),
          })),
          {
            label: "별도 범위",
            body: (
              <ul className="space-y-1.5 text-[#5b6370]">
                {shown(s.excludes).map((item) => (
                  <li key={item} className="flex gap-2">
                    <X size={18} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#6b7280]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ),
          },
          {
            label: "참고",
            body: (
              <div className="space-y-1 text-[#5b6370]">
                {s.notes.map((n) => (
                  <p key={n}>{n}</p>
                ))}
              </div>
            ),
          },
        ].filter((r) => r !== null);

        return (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24">
            <div className={`${wrap} py-14 md:py-20`}>
              <div className="flex flex-col gap-3 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
                <h2 id={`${s.id}-title`} className={h3}>
                  {s.title}
                </h2>
                <div className="md:text-right">
                  <p className="text-[15px] text-[#5b6370] md:text-[16px]">{s.term}</p>
                </div>
              </div>
              <dl className="md:grid md:grid-cols-[200px_1fr]">
                {rows.map((r) => (
                  <div key={r.label} className="border-b border-[#e6e9ee] md:col-span-2 md:grid md:grid-cols-subgrid">
                    <dt className={dt}>{r.label}</dt>
                    <dd className={dd}>{r.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        );
      })}

      <StepList steps={maintenanceSteps} title="유지보수 진행 절차" id="maintenance-process" />

    </>
  );
}
