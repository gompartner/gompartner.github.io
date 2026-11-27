import Link from "next/link";
import { Check } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { CompareTable, GuideSection, gCard, gH3, gNote } from "@/components/classic/board/guide";
import { faqFor } from "@/data/classic/faq";
import { maintenanceFaq, maintenanceServices, replyTerm } from "@/data/classic/maintenance";

// 11-26 유지보수 판 아래 안내(구글 "홈페이지 유지보수", "홈페이지 유지보수 업체" 검색과 AI 개요용). 3D 판의 h2 순서를 따른다:
// 비용(인용하기 쉬운 한 문장), 유형 비교, 맡을 수 있는 일, 자주 묻는 질문.
// 시장 가격은 인사이트 글(maintenance-vendor-types-cost-2026)에 출처와 함께 실린 숫자만 쓴다(각 업체 공개 가격표, 2026년 11월 8일 확인).
// 곰파트너 금액은 건별 30,000원부터와 월 유지관리(월 60만 원부터, 1년 계약)만. 옛 월 고정가는 쓰지 않는다.

const INSIGHT = { href: "/insight/maintenance-vendor-types-cost-2026", title: "홈페이지 유지보수, 유지관리 업체 추천 전에, 유형별 공개 비용과 맞는 곳 (2026)" };

const plansCare = [
  {
    name: "건별 유지보수",
    price: "30,000원부터",
    items: ["문구 수정과 이미지 교체 건별 30,000원부터", "오류 수정은 원인 확인 후 견적", "월 계약 없이 한 건씩 의뢰", "콘텐츠 수정은 2영업일 이내 반영"],
  },
  {
    name: "월 유지관리",
    price: "월 60만 원부터",
    items: ["월 방문자 수와 회원 수, 사이트 수 기준 견적", "최소 1년 단위 계약", "월 1회 정기 점검과 월간 점검 보고서", "도메인과 SSL, 호스팅 만료 30일 전 알림"],
  },
];

const compare = {
  cols: ["곰파트너", "건별 의뢰", "월정액 관리", "웹에이전시 월 관리"],
  rows: [
    ["비용 기준", "건별 수정, 월 유지관리는 사이트 규모", "수정 1건마다", "월 수정 횟수", "월 요청 횟수나 작업 시간"],
    ["공개 가격 예", "건별 30,000원부터(부가세 별도)", "프리랜서 플랫폼 건별 수정 5천 원부터", "호스팅사 연 33만~132만 원(부가세 포함), 프리랜서 플랫폼 월 3만 3천~49만 원", "월 5만~55만 원"],
    ["맞는 곳", "만든 업체와 연락이 끊긴 곳, 다른 업체가 만든 사이트를 이어 맡길 곳", "가끔 단순 수정만 필요한 곳", "그 호스팅사에서 운영하는 사이트, 정기 문구와 이미지 수정이 중심인 곳", "그 업체가 만든 사이트를 계속 맡기는 곳, 디자인 수정과 기능 추가가 잦은 곳"],
  ],
};

/** 맡을 수 있는 일마다 금액(판의 상황별 금액과 같은 말) */
const priceOf: Record<string, string> = {
  takeover: "인수 점검 후 견적",
  "ai-site": "범위 확인 후 견적",
  fix: "건별 30,000원부터",
  perf: "진단 후 견적",
  update: "적용 범위 확인 후 견적",
  monthly: "월 60만 원부터, 1년 계약",
};

// 자주 묻는 질문: 유지보수 공통 문답에 금액 문답 하나와 세부 서비스 문답 셋을 더한다
const faqs = [
  { q: "홈페이지 유지보수 비용은 얼마입니까?", a: "문구 수정과 이미지 교체는 건별 30,000원부터입니다. 오류 수정은 원인을 확인한 뒤 금액을 먼저 안내합니다. 월 유지관리는 월 60만 원부터이고 1년 단위로 계약합니다. 금액은 부가세 별도입니다." },
  ...faqFor("care"),
  maintenanceFaq.fix[0],
  maintenanceFaq.fix[4],
  maintenanceFaq.update[0],
];

export function CareGuide() {
  return (
    <>
      {/* 1. 비용: 인용하기 쉬운 한 문장 */}
      <GuideSection
        id="cr-cost"
        title="홈페이지 유지보수 비용"
        lead="곰파트너의 홈페이지 유지보수는 건별 30,000원부터이고, 월 유지관리는 월 60만 원부터이고 1년 단위로 계약합니다(부가세 별도). 월 계약 없이 필요한 수정만 한 건씩 맡길 수 있습니다."
      >
        <ul className="grid gap-4 md:grid-cols-2" role="list">
          {plansCare.map((p) => (
            <li key={p.name} className={`${gCard} flex flex-col p-6 md:p-8`}>
              <h3 className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{p.name}</h3>
              <p className="mt-4 text-[34px] font-[800] leading-none tracking-[-0.05em] md:text-[40px]">{p.price}</p>
              <ul className="mt-6 space-y-2.5 border-t border-white/12 pt-5" role="list">
                {p.items.map((t) => (
                  <li key={t} className="flex items-start gap-2 break-keep text-[15px] leading-[1.5] md:text-[16px]">
                    <Check aria-hidden size={16} strokeWidth={3} className="mt-[3px] shrink-0 text-[#7aa7ff]" />
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className={gNote}>금액은 부가세 별도입니다. {replyTerm}합니다.</p>
      </GuideSection>

      {/* 2. 유형 비교(월정액, 건별, 에이전시) */}
      <GuideSection
        id="cr-types"
        title="유지보수 유형 비교"
        lead="홈페이지 유지보수는 크게 건별 의뢰와 월정액 관리, 웹에이전시 월 관리로 나뉩니다. 월 금액이 같아도 수정 횟수나 작업 시간, 백업과 보안 업데이트 포함 여부에 따라 실제 범위가 다릅니다."
      >
        <CompareTable caption="홈페이지 유지보수 유형 비교" cols={compare.cols} rows={compare.rows} />
        <p className={gNote}>출처: 각 업체 공개 가격표(2026년 11월 8일 확인). 가격은 바뀔 수 있습니다.</p>
        <p className="mt-1 break-keep text-[14px] leading-[1.6] text-[#8a94a6]">
          업체별 금액:{" "}
          <Link href={INSIGHT.href} className="font-bold text-[#c9ced6] underline underline-offset-4 hover:text-white">
            {INSIGHT.title}
          </Link>
        </p>
      </GuideSection>

      {/* 3. 맡을 수 있는 일 */}
      <GuideSection
        id="cr-scope"
        title="맡을 수 있는 일"
        lead="운영 중인 홈페이지의 수정과 오류 수정부터 업체 변경과 보안 업데이트까지 맡습니다. 워드프레스와 그누보드, PHP 홈페이지와 AI 도구로 만든 웹서비스를 다룹니다."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {maintenanceServices.map((s) => (
            <li key={s.id} className={`${gCard} flex flex-col p-6 md:p-7`}>
              <p className="text-[14px] font-bold text-[#7aa7ff]">{s.title}</p>
              <h3 className={`mt-2 ${gH3}`}>{s.h1}</h3>
              <p className="mt-2 break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">{s.term}</p>
              <ul className="mt-5 flex flex-wrap gap-2" role="list">
                {s.cases.map((c) => (
                  <li key={c.title} className="rounded-full border border-white/20 px-3 py-1 text-[14px] text-[#e3e7ee]">
                    {c.title}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
              <dl className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-white/12 pt-4 text-[15px]">
                <dt className="font-bold text-[#8a94a6]">금액</dt>
                <dd className="break-keep font-bold text-white">{priceOf[s.id]}</dd>
                <dt className="font-bold text-[#8a94a6]">받는 문서</dt>
                <dd className="break-keep text-[#c9ced6]">{s.report.name}</dd>
              </dl>
              </div>
            </li>
          ))}
        </ul>
      </GuideSection>

      {/* 4. 자주 묻는 질문(FAQPage 구조화 데이터는 FaqBlock이 낸다) */}
      <GuideSection id="cr-faq" title="자주 묻는 질문">
        <FaqBlock items={faqs} bare />
      </GuideSection>
    </>
  );
}
