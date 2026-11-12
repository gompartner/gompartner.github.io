import type { Metadata } from "next";
import { NavLink } from "@/components/classic/NavLink";
import { ArrowRight } from "lucide-react";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { AddonList } from "@/components/classic/pricing/AddonList";
import { PageHead, h2, wrap } from "@/components/classic/ui";
import { appCommon, appPlans, kioskCommon, kioskPlans, landingPlans, plans, runningCostNote } from "@/data/classic/pricing";
import { threeCommon, threePlans } from "@/data/classic/three";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { LdScript } from "@/components/seo/JsonLd";

// 11-12 리뉴얼: 상단 메뉴 "비용". 다른 업체(포크나인 "제작비용")처럼 금액을 한 페이지에 모은다.
// 금액은 각 서비스 페이지와 같은 데이터(data/classic/pricing, three)를 쓰고, 유지보수 시작 금액은 PriceBand, 유지보수 페이지와 같게 맞춘다.

export const metadata: Metadata = pageMeta({
  title: "비용",
  description: "홈페이지 유지보수 월 9만 원부터, 홈페이지 제작 29.9만 원부터. 랜딩페이지, 앱, 키오스크 화면, 3D 웹 패키지 금액과 작업 기간(부가세 별도).",
  path: "/pricing",
});

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

// 유지보수는 패키지 대신 시작 금액과 견적 방식
const care = [
  { href: "/maintenance/monthly", name: "월 유지보수", amount: "월 9만 원부터", note: "3개월 단위 계약, 월간 점검 보고서" },
  { href: "/maintenance/fix", name: "오류 수정", amount: "원인 확인 뒤 견적", note: "금액을 먼저 안내하고, 동의 후 작업" },
  { href: "/maintenance/update", name: "보안 업데이트", amount: "범위 확인 뒤 견적", note: "적용 범위와 금액, 작업 시간 안내" },
  { href: "/maintenance/takeover", name: "업체 변경", amount: "범위 확인 뒤 견적", note: "계정과 서버 확인 뒤 인수 범위 안내" },
];

const make = [
  { id: "homepage", title: "홈페이지 제작", href: "/homepage", plans, common: undefined },
  { id: "landing", title: "랜딩페이지 제작", href: "/landing-page", plans: landingPlans, common: undefined },
  { id: "app", title: "앱 제작", href: "/app", plans: appPlans, common: appCommon },
  { id: "kiosk", title: "키오스크 화면 제작", href: "/kiosk", plans: kioskPlans, common: kioskCommon },
  { id: "3d", title: "3D 웹 제작", href: "/3d", plans: threePlans, common: threeCommon },
];

const jump = [
  { href: "#care", label: "유지보수" },
  ...make.map((m) => ({ href: `#${m.id}`, label: m.title })),
  { href: "#program", label: "업무 프로그램 제작" },
];

export default function PricingPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "비용", path: "/pricing" }])} />
      <PageHead title="비용" trail={[{ href: "/pricing", label: "비용" }]} />

      <nav aria-label="서비스별 금액" className={`${wrap} py-8 md:py-10`}>
        <ul className="flex flex-wrap gap-2" role="list">
          {jump.map((j) => (
            <li key={j.href}>
              <a href={j.href} className="inline-flex h-10 items-center rounded-md border border-[#d9dee5] px-4 text-[15px] font-bold text-[#3d4450] hover:border-[#15171c] hover:text-[#15171c]">
                {j.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="care" aria-labelledby="pr-care" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="pr-care" className={h2}>
            유지보수
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {care.map((c) => (
              <li key={c.name} className="border-b border-[#e6e9ee]">
                <NavLink href={c.href} className="group grid gap-1 px-1 py-6 md:grid-cols-[220px_260px_1fr_24px] md:items-center md:gap-6 md:px-4">
                  <span className="text-[18px] font-[800] tracking-[-0.03em] md:text-[20px]">{c.name}</span>
                  <span className="text-[20px] font-extrabold tabular-nums tracking-[-0.03em] text-[#256ef4] md:text-[22px]">{c.amount}</span>
                  <span className="text-[15px] text-[#5b6370] md:text-[16px]">{c.note}</span>
                  <ArrowRight size={20} aria-hidden className="hidden shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none md:block" />
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-[14px] text-[#5b6370]">부가세 별도</p>
        </div>
      </section>

      {make.map((m) => (
        <section key={m.id} id={m.id} aria-labelledby={`pr-${m.id}`} className={section}>
          <div className={`${wrap} py-16 md:py-24`}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id={`pr-${m.id}`} className={h2}>
                {m.title}
              </h2>
              <NavLink href={m.href} className="inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]">
                서비스 안내 <ArrowRight size={16} aria-hidden />
              </NavLink>
            </div>
            <PlanTable plans={m.plans} product={m.title} common={m.common} />
            {m.id === "homepage" && (
              <>
                <AddonList id="pr-addons" />
                <p className="mt-6 text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">{runningCostNote}</p>
              </>
            )}
          </div>
        </section>
      ))}

      <section id="program" aria-labelledby="pr-program" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="pr-program" className={h2}>
            업무 프로그램 제작
          </h2>
          <p className="mt-4 max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450]">
            필요한 화면과 사용자 권한을 목록으로 확정한 뒤, 그 범위로 견적과 일정을 드립니다.
          </p>
          <NavLink href="/program" className="mt-6 inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]">
            서비스 안내 <ArrowRight size={16} aria-hidden />
          </NavLink>
        </div>
      </section>
    </>
  );
}
