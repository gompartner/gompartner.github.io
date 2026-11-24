import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, FileBarChart, MessageSquareReply, Wrench } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { StepList } from "@/components/classic/pricing/StepList";
import { maintenanceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, wrap } from "@/components/classic/ui";
import { faqFor } from "@/data/classic/faq";
import { dataTerms, maintenanceSteps, severityNote, severityTerms } from "@/data/classic/maintenance";
import { pageMeta } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 유지보수, 유지관리, 성능 개선, 고도화",
  description: "홈페이지 유지보수, 유지관리 업체 곰파트너. 다른 업체가 만든 사이트의 긴급 오류 수정, 연락 두절 업체 인수, 워드프레스, 그누보드, PHP 보안 업데이트, 유지보수, 유지관리, 성능 개선, 고도화로 나눠 수행합니다.",
  path: "/maintenance",
});

// 11-01 보편 구성: 서비스 목록(세부 페이지로), 응대 기준, 진행 절차, 자주 묻는 질문. 상담 띠는 공통 틀에 있다.
const PROMISES = [
  { icon: MessageSquareReply, num: "24시간", label: "이내 회신(영업일 기준)" },
  { icon: Wrench, num: "작업 전 백업", label: "변경 대상 파일, DB" },
  { icon: CalendarClock, num: "30일 전", label: "도메인, SSL 만료 알림" },
  { icon: FileBarChart, num: "월 1회", label: "월간 점검 보고서" },
];

const KINDS: { id?: string; name: string; who: string; what: string; rows: [string, string][]; links: [string, string][] }[] = [
  {
    name: "유지보수",
    who: "소규모 홈페이지",
    what: "수정 요청을 건별로 처리합니다.",
    rows: [["작업", "문구, 이미지, 메뉴 수정, 오류 수정"], ["계약", "건별, 월 계약 없음"], ["비용", "건별 10,000원부터"]],
    links: [["/maintenance/fix", "유지보수"], ["/contact", "수정 요청"]],
  },
  {
    name: "유지관리",
    who: "기관, 기업 홈페이지",
    what: "수정 요청 처리와 정기 점검을 월 단위로 수행합니다.",
    rows: [["작업", "요청 처리, 백업, 보안 업데이트, 만료 관리, 월간 보고서"], ["계약", "월 계약"], ["비용", "월 방문자 수, 회원 수, 사이트 수 기준 견적"]],
    links: [["/maintenance/monthly", "유지관리"], ["/maintenance/update", "보안 업데이트"], ["/maintenance/standard", "운영 기준"]],
  },
  {
    id: "perf",
    name: "성능 개선",
    who: "속도가 느려진 서비스",
    what: "원인을 진단하고 개선합니다.",
    rows: [["작업", "성능 진단, 쿼리 튜닝, 캐시, 서버 설정"], ["산출물", "진단 보고서, 개선 전후 측정값"], ["비용", "진단 후 견적"]],
    links: [["/maintenance/perf", "성능 개선"], ["/contact", "진단 문의"]],
  },
  {
    name: "고도화",
    who: "MVP, 시제품, 인수한 서비스",
    what: "운영 가능한 수준으로 기능과 구조를 보완합니다.",
    rows: [["작업", "현황 분석, 아키텍처 설계, 개발, 이관"], ["산출물", "시스템 구성도, 원본 소스, 인계 문서"], ["비용", "프로젝트 견적"]],
    links: [["/maintenance/ai-site", "고도화"], ["/maintenance/takeover", "업체 변경, 인수"]],
  },
];


const ld = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "홈페이지 유지보수",
    serviceType: "홈페이지 유지보수",
    description: "홈페이지 유지보수(건별 수정), 유지관리(월 계약), 성능 개선, 고도화, 유지보수 업체 변경, 보안 업데이트.",
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

      {/* 11-25 일의 성격대로 네 가지로 나눔(사용자 결정): 유지보수(요청 처리), 유지관리(정기 운영), 성능 개선, 고도화. 하자보수는 제작 상품의 조건 */}
      <section aria-labelledby="m-kinds" className={`${wrap} py-12 md:py-16`}>
        <h2 id="m-kinds" className="sr-only">
          유지보수 서비스 구분
        </h2>
        <ul className="grid border-l border-t border-[#15171c] md:grid-cols-2" role="list">
          {KINDS.map((k) => (
            <li key={k.name} id={k.id} className="scroll-mt-24 border-b border-r border-[#15171c] px-5 py-7 md:px-8 md:py-9">
              <p className="text-[15px] font-bold text-[#1552cc]">{k.who}</p>
              <h3 className="mt-1 text-[26px] font-[800] tracking-[-0.05em] md:text-[32px]">{k.name}</h3>
              <p className="mt-1.5 break-keep text-[16px] text-[#3d4450] md:text-[17px]">{k.what}</p>
              <dl className="mt-5 border-t border-[#d9dee5] text-[15.5px] md:text-[16px]">
                {k.rows.map(([a, b]) => (
                  <div key={a} className="grid grid-cols-[84px_1fr] gap-3 border-b border-[#e1e5eb] py-2.5">
                    <dt className="text-[#5b6370]">{a}</dt>
                    <dd className="break-keep font-bold">{b}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1" role="list">
                {k.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-[15.5px] font-bold text-[#1552cc] hover:underline">
                      {label} <ArrowUpRight size={16} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-4 break-keep text-[15px] text-[#5b6370]">곰파트너가 제작한 결과물의 결함은 상품별 하자보수 기간 동안 무상으로 수정합니다. 부가세 별도.</p>
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

      {/* 11-10 ChatGPT 신뢰도 점검 지적: 회신과 처리를 장애 등급별로 나누고, 계정과 데이터 관리 기준을 보인다 */}
      <section aria-labelledby="m-severity" className={`${wrap} pt-14 md:pt-20`}>
        <h2 id="m-severity" className="text-[22px] font-[800] tracking-[-0.03em] md:text-[26px]">
          장애 등급별 처리 순서
        </h2>
        {/* 휴대폰은 등급마다 묶어 세로로, PC는 네 칸 표 */}
        <div role="table" aria-label="장애 등급별 처리 순서" className="mt-5 border-t-2 border-[#15171c] text-[16px] leading-[1.6]">
          <div role="row" className="hidden border-b border-[#d9dee5] bg-[#f4f6f9] font-bold md:grid md:grid-cols-[140px_1.3fr_1.2fr]">
            <span role="columnheader" className="px-4 py-3">구분</span>
            <span role="columnheader" className="px-4 py-3">해당 증상</span>
            <span role="columnheader" className="px-4 py-3">처리</span>
          </div>
          {severityTerms.map((t) => (
            <div key={t.level} role="row" className="grid border-b border-[#e1e5eb] py-4 md:grid-cols-[140px_1.3fr_1.2fr] md:py-0">
              <span role="rowheader" className="font-bold md:px-4 md:py-4">{t.level}</span>
              <span role="cell" className="mt-1 text-[#3b4250] md:mt-0 md:px-4 md:py-4">{t.examples}</span>
              <span role="cell" className="mt-2 text-[#3b4250] md:mt-0 md:px-4 md:py-4"><b className="mr-2 text-[#15171c] md:hidden">처리</b>{t.handle}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[16px] leading-[1.6] text-[#3b4250]">{severityNote}</p>
      </section>

      <section aria-labelledby="m-data" className={`${wrap} pt-12 md:pt-16`}>
        <h2 id="m-data" className="text-[22px] font-[800] tracking-[-0.03em] md:text-[26px]">
          계정과 데이터 관리
        </h2>
        <dl className="mt-5 grid border-t-2 border-[#15171c] text-[16px] leading-[1.6] md:grid-cols-[160px_1fr]">
          {dataTerms.map((t) => (
            <div key={t.label} className="contents">
              <dt className="border-b border-[#e1e5eb] pt-4 font-bold md:py-4">{t.label}</dt>
              <dd className="border-b border-[#e1e5eb] pb-4 pt-1 text-[#3b4250] md:py-4">{t.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <StepList steps={maintenanceSteps} title="진행 절차" id="maintenance-process" />

      <FaqBlock items={faqFor("care")} id="m-faq" />
    </>
  );
}

