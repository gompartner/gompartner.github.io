import type { Metadata } from "next";
import Image from "next/image";
import { Check, ChevronDown, X } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { fitDescription } from "@/lib/seo";
import {
  maintenanceServices,
  maintenanceSteps,
  responseTime,
} from "@/data/maintenance";

export const metadata: Metadata = {
  title: "홈페이지 유지보수 비용 (월 관리, 오류 수정)",
  description: fitDescription("월 유지보수 5만 원, 오류 수정 건당 5만 원부터, 다른 업체가 만든 홈페이지 인계 점검 10만 원. 하는 일과 맡지 않는 일을 적었습니다."),
  alternates: { canonical: "/maintenance" },
};

const h1 = "text-[32px] leading-[1.25] md:text-[44px]";

// 상황을 고르면 맞는 서비스 카드로 내려간다(첫 화면 웹툰의 답 말풍선과 같은 모양).
const asks: Record<string, string> = {
  monthly: "문구나 사진을 자주 바꿔요",
  fix: "갑자기 화면이 깨졌어요",
  handover: "만든 업체와 연락이 안 돼요",
  search: "검색에 안 나와요",
};

export default function MaintenancePage() {
  return (
    <>
      <div className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-10 md:px-6 md:pt-14">
        <h1 className={h1}>홈페이지 유지보수</h1>

        {/* 곰 컷 + 상황 고르기 */}
        <div className="mt-8 grid items-center gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
          <figure className="relative overflow-hidden border-[3px] border-[#1d1d1f] bg-[#fffdf8] shadow-[5px_5px_0_#1d1d1f]">
            <Image src="/images/webtoon/bear-work.jpg" alt="노트북으로 일하는 곰파트너 곰" width={900} height={900} priority sizes="(min-width: 768px) 520px, 100vw" className="aspect-[4/3] h-auto w-full object-cover object-[50%_40%]" />
            <figcaption className="absolute left-3 top-3 max-w-[85%] rounded-[22px] rounded-bl-[6px] border-[3px] border-[#1d1d1f] bg-accent px-4 py-2.5 text-[16px] font-bold text-white md:text-[18px]">
              어떤 일로 오셨어요?
            </figcaption>
          </figure>
          <div>
            <ul className="flex flex-col items-end gap-3" aria-label="상황 고르기">
              {maintenanceServices.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-3 rounded-[26px] rounded-br-[6px] border-[3px] border-[#1d1d1f] bg-white py-3 pl-5 pr-3 shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fff3b0] hover:shadow-[6px_6px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <span>
                      <span className="block text-[17px] font-bold md:text-[19px]">{asks[s.id]}</span>
                      <span className="block text-[13px] font-bold text-foreground-tertiary md:text-[14px]">
                        {s.title}, {s.price.split(", ")[0]}
                      </span>
                    </span>
                    <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-[2.5px] border-[#1d1d1f] bg-accent text-white">
                      <ChevronDown size={18} strokeWidth={3} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 w-fit border-[3px] border-[#1d1d1f] bg-[#fff3b0] px-3.5 py-1.5 text-[15px] font-bold md:text-[16px]">{responseTime}</p>
          </div>
        </div>

        <div className="mt-16 space-y-8">
          {maintenanceServices.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24 border-[3px] border-[#1d1d1f] bg-white shadow-[5px_5px_0_#1d1d1f]">
              <div className="flex flex-col gap-2 border-b-[3px] border-[#1d1d1f] bg-[#fff3b0] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
                <div>
                  <p className="text-[14px] font-bold text-foreground-secondary">{asks[s.id]}</p>
                  <h2 id={`${s.id}-title`} className="text-[22px] font-bold leading-[1.4] md:text-[26px]">
                    {s.title}
                  </h2>
                </div>
                <div className="md:text-right">
                  <p className="text-[20px] font-bold tabular-nums text-accent md:text-[24px]">{s.price}</p>
                  <p className="text-[14px] font-bold text-foreground-secondary md:text-[15px]">{s.term}</p>
                </div>
              </div>

              <div className="p-5 md:p-8">
                {s.target && (
                  <p className="text-[16px] leading-[1.6] md:text-[17px]">
                    <span className="mr-2 inline-block border-[2px] border-[#1d1d1f] px-1.5 text-[14px] font-bold">대상</span>
                    {s.target}
                  </p>
                )}

                <div className={`grid gap-6 md:grid-cols-3 ${s.target ? "mt-6" : ""}`}>
                  {[s.unit, s.does].filter(Boolean).map((block) => (
                    <div key={block!.label}>
                      <h3 className="text-[17px] font-bold">{block!.label}</h3>
                      <ul className="mt-2 space-y-1.5 text-[16px] leading-[1.6]">
                        {block!.items.map((item) => (
                          <li key={item} className="flex gap-2">
                            <Check size={18} strokeWidth={3} className="mt-[3px] shrink-0 text-accent" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="rounded-[6px] border-[2.5px] border-dashed border-[#1d1d1f]/50 p-4">
                    <h3 className="text-[17px] font-bold">맡지 않는 일</h3>
                    <ul className="mt-2 space-y-1.5 text-[16px] leading-[1.6] text-foreground-secondary">
                      {s.excludes.map((item) => (
                        <li key={item} className="flex gap-2">
                          <X size={18} strokeWidth={3} className="mt-[3px] shrink-0 text-[#de3412]" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t-2 border-dotted border-[#1d1d1f]/40 pt-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 text-[15px] leading-[1.6] text-foreground-secondary md:text-[16px]">
                    {s.notes.map((n) => (
                      <p key={n}>{n}</p>
                    ))}
                  </div>
                  <ChannelTalkButton
                    cta={`maintenance_chat_${s.id}`}
                    message={`${s.title} 상담받고 싶어요.`}
                    className="inline-flex h-12 shrink-0 items-center justify-center rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-accent px-6 text-[17px] font-bold text-white shadow-[3px_3px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-accent-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                  >
                    {s.title} 상담
                  </ChannelTalkButton>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
      <ProcessSteps steps={maintenanceSteps} title="유지보수 진행 절차" id="maintenance-process" />
    </>
  );
}
