import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import {
  maintenanceServices,
  maintenanceSteps,
  responseTime,
} from "@/data/maintenance";

export const metadata: Metadata = {
  title: "홈페이지 유지보수 비용 (월 관리, 오류 수정, 업체 변경 인계)",
  description:
    "홈페이지 월 유지보수 5만 원부터, 오류 수정 건당 5만 원부터, 다른 업체가 만든 홈페이지 유지보수 인계 점검 10만 원, 검색 노출 세팅 5만 원. 1건 기준과 하는 일, 맡지 않는 일을 나눠 적었습니다.",
  alternates: { canonical: "/maintenance" },
};

const h1 =
  "text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]";

export default function MaintenancePage() {
  return (
    <>
      <div className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-14 md:px-6 md:py-14">
        <h1 className={h1}>홈페이지 유지보수</h1>
        <p className="mt-3 text-[17px] leading-[1.6] text-foreground-secondary">
          {responseTime}
        </p>

        <nav aria-label="서비스 바로가기" className="mt-6 flex flex-wrap gap-2">
          {maintenanceServices.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex h-10 items-center rounded-full border border-border px-4 text-[15px] font-bold hover:border-accent hover:text-accent"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-6">
          {maintenanceServices.map((s) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-title`}
              className="wt-card scroll-mt-20 rounded-[10px] border border-border bg-white p-5 md:p-8"
            >
              <div className="flex flex-col gap-1 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2
                    id={`${s.id}-title`}
                    className="text-[22px] font-bold leading-[1.4] md:text-[26px]"
                  >
                    {s.title}
                  </h2>
                  <p className="mt-1 text-[15px] text-foreground-secondary md:text-[17px]">
                    {s.term}
                  </p>
                </div>
                <p className="text-[20px] font-bold tabular-nums md:text-[24px]">
                  {s.price}
                </p>
              </div>

              {s.target && (
                <p className="mt-5 text-[17px] leading-[1.6]">
                  <span className="font-bold">대상</span> {s.target}
                </p>
              )}

              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {[s.unit, s.does].filter(Boolean).map((block) => (
                  <div key={block!.label}>
                    <h3 className="text-[17px] font-bold">{block!.label}</h3>
                    <ul className="mt-2 space-y-1.5 text-[16px] leading-[1.6]">
                      {block!.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <Check
                            size={18}
                            strokeWidth={2.5}
                            className="mt-[3px] shrink-0 text-accent"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <h3 className="text-[17px] font-bold">맡지 않는 일</h3>
                  <ul className="mt-2 space-y-1.5 text-[16px] leading-[1.6] text-foreground-secondary">
                    {s.excludes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Minus
                          size={18}
                          strokeWidth={2.5}
                          className="mt-[3px] shrink-0"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 text-[15px] leading-[1.6] text-foreground-secondary md:text-[16px]">
                  {s.notes.map((n) => (
                    <p key={n}>{n}</p>
                  ))}
                </div>
                <ChannelTalkButton
                  cta={`maintenance_chat_${s.id}`}
                  message={`${s.title} 상담받고 싶어요.`}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-[6px] border border-accent px-6 text-[17px] font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {s.title} 상담
                </ChannelTalkButton>
              </div>
            </section>
          ))}
        </div>
      </div>
      <ProcessSteps
        steps={maintenanceSteps}
        title="유지보수 진행 절차"
        id="maintenance-process"
      />
    </>
  );
}
