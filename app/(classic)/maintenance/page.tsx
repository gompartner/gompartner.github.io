import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, FileBarChart, MessageSquareReply, Wrench } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { StepList } from "@/components/classic/pricing/StepList";
import { maintenanceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, wrap } from "@/components/classic/ui";
import { faqFor } from "@/data/classic/faq";
import { maintenanceServices, maintenanceSteps } from "@/data/classic/maintenance";
import { pageMeta } from "@/lib/seo";
import { KAKAO_COUPON_URL, siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 유지보수, 유지관리 (오류 수정, 업체 이관, 보안 업데이트, 월 관리)",
  description: "홈페이지 유지보수, 유지관리 업체 곰파트너. 다른 업체가 만든 사이트의 긴급 오류 수정, 연락 두절 업체 인수, 워드프레스, 그누보드, PHP 보안 업데이트, 월 관리 월 9만 원부터(부가세 별도).",
  path: "/maintenance",
});

// 11-01 보편 구성: 서비스 목록(세부 페이지로), 응대 기준, 진행 절차, 자주 묻는 질문. 상담 띠는 공통 틀에 있다.
const PROMISES = [
  { icon: MessageSquareReply, num: "24시간", label: "이내 회신(영업일 기준)" },
  { icon: Wrench, num: "전체 백업", label: "작업 전 파일, DB 백업" },
  { icon: CalendarClock, num: "30일 전", label: "도메인, SSL 만료 알림" },
  { icon: FileBarChart, num: "월 1회", label: "월간 점검 보고서" },
];

const SUMMARY: [string, string][] = [
  ["특징", "다른 업체가 만든 PHP, 그누보드, 워드프레스, Next.js 사이트의 긴급 오류 수정과 업체 인수. 공공기관, 대학 홈페이지 유지관리를 맡았던 개발자가 직접 작업합니다."],
  ["비용", "월 유지보수 월 9만 원부터(부가세 별도). 오류 수정은 원인 확인 뒤 금액을 먼저 안내합니다."],
  ["응대", "영업일 기준 24시간 이내 회신, 작업 전 파일과 DB 전체 백업, 작업 뒤 내역서와 월간 점검 보고서."],
  ["맞는 곳", "만든 업체와 연락이 끊긴 곳, PHP 지원 종료 전에 업데이트가 필요한 곳, 큰 에이전시 계약 없이 매달 수정과 점검을 맡길 곳."],
];

const ld = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "홈페이지 유지보수",
    serviceType: "홈페이지 유지보수",
    description: "홈페이지 오류 수정, 유지보수 업체 변경, 워드프레스 보안 업데이트, 월 유지보수.",
    areaServed: "KR",
    url: `${siteUrl}/maintenance`,
    // 11-08 AI 검색 답변이 업체마다 특징, 비용, 추천 대상을 뽑아 쓴다. 공개 시작 금액(PriceBand와 같은 값)
    offers: {
      "@type": "Offer",
      priceSpecification: { "@type": "UnitPriceSpecification", price: 90000, priceCurrency: "KRW", unitText: "월", valueAddedTaxIncluded: false, minPrice: 90000 },
    },
    provider: { "@id": `${siteUrl}/#org` },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "홈페이지 유지보수", item: `${siteUrl}/maintenance` },
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
          { href: "/maintenance", label: "유지보수" },
        ]}
      />
      <SubTabs items={maintenanceTabs} current="/maintenance" />

      {/* 11-08 AI 검색(유지보수 업체 추천)이 뽑아 가는 업체 요약: 특징, 비용, 맞는 곳 */}
      <section aria-labelledby="m-sum" className={`${wrap} pt-12 md:pt-16`}>
        <h2 id="m-sum" className="text-[22px] font-[800] tracking-[-0.03em] md:text-[26px]">
          곰파트너 홈페이지 유지보수 한눈에
        </h2>
        <dl className="mt-5 grid border-t-2 border-[#15171c] text-[16px] leading-[1.6] md:grid-cols-[160px_1fr]">
          {SUMMARY.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="border-b border-[#e1e5eb] pt-4 font-bold md:py-4">{k}</dt>
              <dd className="border-b border-[#e1e5eb] pb-4 pt-1 text-[#3b4250] md:py-4">{v}</dd>
            </div>
          ))}
        </dl>
        {/* 11-08 카카오톡 채널 친구 쿠폰(사용자 승인): 월 유지보수 첫 달 50%, 12-31까지, 100장. 쿠폰 화면의 번호 등록은 /contact?promo=kakao&serial= 로 온다 */}
        <p className="mt-4 text-[16px] leading-[1.6] text-[#3b4250]">
          카카오톡 채널 친구는 월 유지보수 첫 달 관리비 50% 할인 쿠폰을 받을 수 있습니다(12월 31일까지).{" "}
          <a href={KAKAO_COUPON_URL} target="_blank" rel="noopener noreferrer" data-gtm-cta="maintenance_kakao_coupon" className="font-bold text-[#256ef4] underline underline-offset-4">
            쿠폰 받기
          </a>
        </p>
      </section>

      <section aria-labelledby="m-list" className={`${wrap} py-12 md:py-16`}>
        <h2 id="m-list" className="sr-only">
          유지보수 서비스
        </h2>
        {/* 11-01 서비스마다 작업 장면 사진 카드 */}
        <ul className="grid gap-5 md:grid-cols-2" role="list">
          {maintenanceServices.map((s) => (
            <li key={s.id}>
              <Link href={`/maintenance/${s.id}`} data-gtm-cta={`maintenance_${s.id}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#d9dee5] bg-white transition-colors hover:border-[#256ef4]">
                <div className="relative aspect-[16/9] overflow-hidden bg-[#0f1b3d]">
                  <Image
                    src={`/images/site/scene-${s.id}.jpg`}
                    alt={`${s.title} 작업 장면`}
                    fill
                    sizes="(min-width: 768px) 600px, 92vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
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

