import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 11-03 메인 시작 금액 띠(사용자 요청). 제작은 크몽 소개 홈페이지와 같은 금액, 유지보수는 월 운영 시작 금액.
// 정확한 금액은 상담 후 견적서로. 포함 내용은 서비스 기준 문서(03_Resource/곰파트너-서비스-정리.md)와 같게.
const prices = [
  { label: "홈페이지 제작", amount: "29.9만 원", note: "기본 5쪽, 반응형, 검색엔진 등록", href: "/homepage", cta: "price_homepage" },
  { label: "유지보수", amount: "월 9만 원", note: "월 1회 점검 보고서, 24시간 이내 회신", href: "/maintenance", cta: "price_maintenance" },
];

/** 표 한 줄. 배경 없이 굵은 선 사이에 금액만 크게(11-03 시안 A 채택, 남색 띠와 문장형은 뺌) */
function RuleRow() {
  return (
    <section aria-labelledby="c-price" className="mx-auto w-full max-w-[1248px] px-4 pb-20 md:px-6 md:pb-28">
      <h2 id="c-price" className="sr-only">시작 금액</h2>
      <ul className="grid border-y-2 border-[#15171c] md:grid-cols-2" role="list">
        {prices.map((p, i) => (
          <li key={p.label} className={i ? "border-t border-[#e1e5eb] md:border-l md:border-t-0" : ""}>
            <Link href={p.href} data-gtm-cta={p.cta} className="group flex items-end justify-between gap-4 px-1 py-7 md:px-8 md:py-9">
              <span>
                <span className="block text-[16px] font-bold text-[#5b6370]">{p.label}</span>
                <span className="mt-2 block text-[36px] font-[800] leading-none tracking-[-0.04em] tabular-nums md:text-[48px]">
                  {p.amount}
                  <span className="ml-1.5 text-[20px] font-bold tracking-[-0.02em] text-[#15171c]">부터</span>
                </span>
                <span className="mt-3 block text-[15px] text-[#5b6370]">{p.note}</span>
              </span>
              <ArrowRight size={24} aria-hidden className="mb-1 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-[#256ef4] motion-reduce:transition-none" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right text-[14px] text-[#5b6370]">부가세 별도</p>
    </section>
  );
}

export function PriceBand() {
  return <RuleRow />;
}
