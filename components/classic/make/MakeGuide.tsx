import Link from "next/link";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { GuideSection, gCard, gH3, gNote } from "@/components/classic/board/guide";
import { kinds } from "@/components/classic/make/kinds";
import { faq } from "@/data/classic/faq";
import { manwon, planCommon } from "@/data/classic/pricing";

// 11-26 제작 판 아래 안내(구글 "홈페이지 제작" 검색과 AI 개요용). 금액과 기간은 비용 데이터(data/classic/pricing)에서 읽는다.
// 11-27 대표 "글이 너무 많다": "곰파트너가 제작하는 것"은 위 판과 겹쳐 뺐고, "제작 방식 비교"와 "제작 업체를 고를 때 확인할 것"은
// 위키 문서(app/(classic)/knowledge/choose-builder)로 옮겼다. 자주 묻는 질문은 셋만(원본 소스와 계정, 수정 횟수, 취소와 환불).

const pick = (q: string) => faq.find((f) => f.q === q)!;

/** 자주 묻는 질문 셋. 답은 data/classic/faq.ts 문장 그대로(원본 소스 답은 납품물, 도메인 답의 문장을 모았다) */
const makeFaq = [
  {
    q: "원본 소스와 계정은 누구 소유입니까?",
    a: "원본 소스를 납품합니다. 도메인과 호스팅은 처음부터 고객 명의로 계약하고 관리 권한만 공유받습니다.",
  },
  pick("수정은 몇 회까지 가능합니까?"),
  pick("취소와 환불 기준은 무엇입니까?"),
].map(({ q, a }) => ({ q, a }));

export function MakeGuide() {
  const priced = kinds.filter((k) => k.plans.length > 0);
  return (
    <>
      <GuideSection id="mk-plans" title="종류별 패키지와 제작 기간" lead="금액은 부가세 별도이며 도메인과 호스팅은 고객 명의로 따로 계약합니다.">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {priced.map((k) => (
            <li key={k.id} className={`${gCard} p-6 md:p-7`}>
              <h3 className={gH3}>{k.name}</h3>
              <ul className="mt-4 border-t border-white/12" role="list">
                {k.plans.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-4 border-b border-white/12 py-3.5 last:border-b-0">
                    <span className="min-w-0 break-keep text-[16px] font-bold leading-[1.45] text-[#e3e7ee]">{p.name}</span>
                    <span className="shrink-0 text-right">
                      <b className="block text-[18px] font-[800] tabular-nums tracking-[-0.03em] md:text-[19px]">{manwon(p.price)}</b>
                      <span className="block text-[14px] font-bold text-[#7aa7ff]">{p.period ?? `${p.days}일`}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
          <li className={`${gCard} flex flex-col p-6 md:p-7`}>
            <h3 className={gH3}>업무 시스템</h3>
            <p className="mt-4 border-t border-white/12 pt-4 text-[18px] font-[800] tracking-[-0.03em] md:text-[19px]">요구사항 확인 후 견적</p>
          </li>
        </ul>
        <div className={`${gCard} mt-4 flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-8 md:px-8`}>
          <h3 className="shrink-0 text-[16px] font-[800] tracking-[-0.02em] text-[#7aa7ff] md:text-[17px]">홈페이지 공통 포함</h3>
          <ul className="flex flex-wrap gap-2" role="list">
            {planCommon.map((t) => (
              <li key={t} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[15px] text-[#e3e7ee]">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className={gNote}>
          제작 기간은 자료를 받은 날부터 계산합니다. 업체를 비교할 때 확인할 것은{" "}
          <Link href="/knowledge/choose-builder" className="font-bold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
            홈페이지 제작 업체 고르는 법
          </Link>
          에 정리했습니다.
        </p>
      </GuideSection>

      {/* FAQPage 구조화 데이터는 FaqBlock이 낸다 */}
      <GuideSection id="mk-faq" title="자주 묻는 질문">
        <FaqBlock items={makeFaq} bare />
      </GuideSection>
    </>
  );
}
