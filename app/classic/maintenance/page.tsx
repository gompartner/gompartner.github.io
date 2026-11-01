import type { Metadata } from "next";
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
        <ul className="border-t-2 border-[#15171c]" role="list">
          {maintenanceServices.map((s) => (
            <li key={s.id} className="border-b border-[#d9dee5]">
              <Link href={`/classic/maintenance/${s.id}`} data-gtm-cta={`maintenance_${s.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,440px)_1fr_auto] md:py-8">
                <h3 className="col-start-1 row-start-1 text-[22px] font-[800] tracking-[-0.04em] transition-colors group-hover:text-[#256ef4] md:text-[30px]">{s.h1}</h3>
                <p className="col-start-1 row-start-2 text-[16px] text-[#5b6370] md:col-start-2 md:row-start-1 md:text-[17px]">{s.term}</p>
                <ArrowUpRight size={26} aria-hidden className="col-start-2 row-span-2 row-start-1 self-center text-[#6b7280] group-hover:text-[#256ef4] md:col-start-3 md:row-span-1" />
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

