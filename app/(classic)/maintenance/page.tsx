import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, FileBarChart, MessageSquareReply, Wrench } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { RequestFlow } from "@/components/classic/RequestFlow";
import { ReviewRequest } from "@/components/classic/ReviewRequest";
import { StepList } from "@/components/classic/pricing/StepList";
import { maintenanceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, wrap } from "@/components/classic/ui";
import { faqFor } from "@/data/classic/faq";
import { dataTerms, maintenanceSteps } from "@/data/classic/maintenance";
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
  { icon: Wrench, num: "작업 전 백업", label: "변경 대상 파일과 DB" },
  { icon: CalendarClock, num: "30일 전", label: "도메인과 SSL 만료 알림" },
  { icon: FileBarChart, num: "월 1회", label: "월간 점검 보고서" },
];

// 장애 처리 절차. 판정은 세 가지: 바로 조치, 임시 조치 뒤 수정, 외부 요인(호스팅사, 도메인, 외부 서비스)
const INCIDENT: { title: string; body: string; cases?: [string, string][] }[] = [
  { title: "접수", body: "주소와 증상, 발생 시점을 받습니다." },
  { title: "원인 확인", body: "접속 상태, 오류 기록, 최근 변경 내역을 확인합니다." },
  {
    title: "판정과 안내",
    body: "확인 결과와 조치 방법을 회신합니다.",
    cases: [
      ["조치 가능", "원인과 처리 기간, 금액을 안내하고 수정합니다"],
      ["임시 조치", "백업본 복구나 안내 화면으로 먼저 정상화하고 수정 일정을 안내합니다"],
      ["외부 요인", "호스팅사, 도메인, 외부 서비스 장애는 해당 업체에 접수하고 진행 상황을 안내합니다"],
    ],
  },
  { title: "결과 보고", body: "원인, 조치 내용, 재발 방지 설정을 작업 내역서로 드립니다." },
];

const KINDS: { id?: string; name: string; who: string; what: string; rows: [string, string][]; links: [string, string][] }[] = [
  {
    name: "유지보수",
    who: "소규모 홈페이지",
    what: "수정 요청을 건별로 처리합니다.",
    rows: [["작업", "문구, 이미지, 메뉴 수정, 오류 수정"], ["계약", "건별 계약"], ["비용", "건별 10,000원부터"]],
    links: [["/maintenance/fix", "유지보수"], ["/contact", "수정 요청"]],
  },
  {
    name: "유지관리",
    who: "기업과 기관 홈페이지",
    what: "월 1회 정기 점검과 수정 요청 처리를 월 단위로 수행합니다.",
    rows: [["작업", "정기 점검 월 1회, 수정 요청 처리, 만료 관리, 월간 보고서"], ["계약", "월 계약, 영업일 기준 대응"], ["비용", "월 방문자 수, 회원 수, 사이트 수 기준 견적"]],
    links: [["/maintenance/monthly", "유지관리"], ["/maintenance/update", "보안 업데이트"]],
  },
  {
    id: "perf",
    name: "성능 개선",
    who: "속도가 느려진 서비스",
    what: "원인을 진단하고 개선합니다.",
    rows: [["작업", "성능 진단, 쿼리 튜닝, 캐시, 서버 설정"], ["산출물", "진단 보고서와 개선 전후 측정값"], ["비용", "진단 후 견적"]],
    links: [["/maintenance/perf", "성능 개선"], ["/contact", "진단 문의"]],
  },
  {
    name: "고도화",
    who: "MVP, 시제품, 인수한 서비스",
    what: "운영 가능한 수준으로 기능과 구조를 보완합니다.",
    rows: [["작업", "현황 분석, 아키텍처 설계, 개발, 이관"], ["산출물", "시스템 구성도, 원본 소스, 인계 문서"], ["비용", "프로젝트 견적"]],
    links: [["/maintenance/ai-site", "고도화"], ["/maintenance/takeover", "업체 변경과 인수"]],
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

      {/* 11-25 첫 화면: 수정 요청이 처리되는 과정(메인의 제작 과정과 같은 창). 이어서 사전 검토 신청 */}
      <section aria-label="수정 요청 처리 과정" className={`${wrap} pt-10 md:pt-14`}>
        <RequestFlow />
      </section>

      <section aria-label="사전 검토 신청" className={`${wrap} pt-10 md:pt-14`}>
        <ReviewRequest />
      </section>

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

      {/* 11-25 장애 처리 절차(사용자): 접수하면 먼저 확인하고, 조치 가능 여부를 판정해 안내한다. 긴급 조치를 시간으로 약속하지 않고 절차를 보여 준다 */}
      <section aria-labelledby="m-incident" className={`${wrap} pt-14 md:pt-20`}>
        <h2 id="m-incident" className="text-[22px] font-[800] tracking-[-0.03em] md:text-[26px]">
          장애 처리 절차
        </h2>
        <ol className="mt-5 grid border-t-2 border-[#15171c] md:grid-cols-[1fr_1fr_1.9fr_1fr] md:border-l md:border-t-0 md:border-[#15171c]" role="list">
          {INCIDENT.map((st, i) => (
            <li key={st.title} className="border-b border-[#d9dee5] py-5 md:border-b-0 md:border-r md:border-t-2 md:border-[#15171c] md:px-5 md:py-6">
              <p className="text-[15px] font-[800] tabular-nums text-[#1552cc]">{i + 1}</p>
              <h3 className="mt-0.5 text-[20px] font-[800] tracking-[-0.04em] md:text-[22px]">{st.title}</h3>
              <p className="mt-1.5 break-keep text-[15.5px] leading-[1.6] text-[#3b4250] md:text-[16px]">{st.body}</p>
              {st.cases ? (
                <dl className="mt-3 border-t border-[#d9dee5] text-[15px] md:text-[15.5px]">
                  {st.cases.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[92px_1fr] gap-3 border-b border-[#e1e5eb] py-2.5">
                      <dt className="font-[800]">{k}</dt>
                      <dd className="break-keep text-[#3b4250]">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-4 break-keep text-[16px] leading-[1.6] text-[#3b4250]">접속 불가, 접수 불가 같은 장애는 다른 요청보다 먼저 확인합니다. 회신은 영업일 기준 24시간 이내입니다.</p>
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

