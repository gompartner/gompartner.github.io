import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, FileBarChart, MessageSquareReply, Wrench } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, wrap } from "@/components/classic/ui";
import { faqFor } from "@/data/classic/faq";
import { maintenanceServices, maintenanceSteps } from "@/data/classic/maintenance";
import { pageMeta } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 유지보수 (오류 수정, 업체 이관, 보안 업데이트, 월 관리)",
  description: "홈페이지 유지보수. 접속 불가, 화면 깨짐 오류 수정, 기존 업체 연락 두절 시 업체 이관, 워드프레스, 그누보드, PHP 보안 업데이트, 월 관리.",
  path: "/classic/maintenance",
});

// 11-01 보편 구성: 서비스 목록(세부 페이지로), 응대 기준, 진행 절차, 자주 묻는 질문. 상담 띠는 공통 틀에 있다.
const PROMISES = [
  { icon: MessageSquareReply, num: "24시간", label: "이내 회신(영업일 기준)" },
  { icon: Wrench, num: "전체 백업", label: "작업 전 파일, DB 백업" },
  { icon: CalendarClock, num: "30일 전", label: "도메인, SSL 만료 알림" },
  { icon: FileBarChart, num: "월 1회", label: "월간 점검 보고서" },
];

const ld = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "홈페이지 유지보수",
    serviceType: "홈페이지 유지보수",
    description: "홈페이지 오류 수정, 유지보수 업체 변경, 워드프레스 보안 업데이트, 월 유지보수.",
    areaServed: "KR",
    url: `${siteUrl}/classic/maintenance`,
    provider: { "@id": `${siteUrl}/#org` },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "홈페이지 유지보수", item: `${siteUrl}/classic/maintenance` },
    ],
  },
];

export default function ClassicMaintenancePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead
        title="홈페이지 유지보수"
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: "/classic/maintenance", label: "유지보수" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/classic/maintenance" />

      <section aria-labelledby="m-list" className={`${wrap} py-12 md:py-16`}>
        <h2 id="m-list" className="sr-only">
          유지보수 서비스
        </h2>
        {/* 11-01 글자 목록만 있어 밋밋함: 서비스마다 납품 문서 미리보기 카드 */}
        <ul className="grid gap-5 md:grid-cols-2" role="list">
          {maintenanceServices.map((s) => (
            <li key={s.id}>
              <Link href={`/classic/maintenance/${s.id}`} data-gtm-cta={`maintenance_${s.id}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#d9dee5] bg-white transition-colors hover:border-[#256ef4]">
                <div className="relative h-[180px] overflow-hidden bg-[#0f1b3d] px-8 pt-8 md:h-[220px] md:px-12 md:pt-10">
                  <div aria-hidden className="absolute inset-x-12 bottom-0 top-6 rotate-[3deg] rounded-t-md bg-white/20 md:inset-x-16" />
                  <Image
                    src={`/images/site/hero-${s.id}-doc.jpg`}
                    alt=""
                    width={1060}
                    height={760}
                    sizes="(min-width: 768px) 520px, 90vw"
                    className="relative h-auto w-full rounded-t-md shadow-[0_18px_40px_rgba(0,0,0,.4)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-4 border-t border-[#d9dee5] p-6 md:p-7">
                  <div>
                    <h3 className="text-[20px] font-[800] tracking-[-0.04em] transition-colors group-hover:text-[#256ef4] md:text-[24px]">{s.h1}</h3>
                    <p className="mt-1.5 text-[16px] text-[#5b6370]">{s.term}</p>
                    <p className="mt-3 text-[14px] font-bold text-[#256ef4]">{s.report.name}</p>
                  </div>
                  <ArrowUpRight size={24} aria-hidden className="mt-1 shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="m-promise" className="bg-[#0f1b3d] text-white">
        <div className={`${wrap} py-14 md:py-20`}>
          <h2 id="m-promise" className="text-[26px] font-[800] tracking-[-0.04em] md:text-[34px]">
            응대 기준
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {PROMISES.map((p) => (
              <li key={p.label} className="rounded-md border border-white/15 bg-white/5 p-6">
                <p.icon size={24} aria-hidden className="text-[#8fb4ff]" />
                <p className="mt-4 text-[34px] font-[800] tabular-nums tracking-[-0.04em] md:text-[40px]">{p.num}</p>
                <p className="mt-1 text-[16px] font-bold text-[#c9d3e6]">{p.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepList steps={maintenanceSteps} title="진행 절차" id="maintenance-process" />

      <FaqBlock items={faqFor("care")} id="m-faq" />
    </>
  );
}

