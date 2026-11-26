import { FaqBlock } from "@/components/classic/FaqBlock";
import { CheckLine, CompareTable, GuideSection, gCard, gH3, gNote } from "@/components/classic/board/guide";
import { kinds } from "@/components/classic/make/kinds";
import { faqFor } from "@/data/classic/faq";
import { manwon, planCommon, plans } from "@/data/classic/pricing";

// 11-26 제작 판 아래 안내(구글 "홈페이지 제작", "홈페이지 제작 업체" 검색과 AI 개요용). 3D 판의 h2 순서를 따른다:
// 무엇을 만드는지, 종류별 패키지와 기간, 제작 방식 비교, 업체 고를 때 확인할 것, 자주 묻는 질문.
// 금액과 기간은 비용 데이터(data/classic/pricing, three)에서 읽는다. 호스팅과 구독료 범위는 runningCostNote(국내 업체 공개 요금 조사)와 같은 값만 쓴다.

/** 종류마다 한 줄. 탭의 한 줄(line)은 짧은 표어라 여기서는 무엇을 만드는지 사실로 적는다 */
const what: Record<string, string> = {
  homepage: "사업장 소개와 문의, 예약 접수를 갖춘 반응형 사이트입니다.",
  landing: "광고로 들어온 방문자의 신청을 받는 한 페이지입니다. 접수 내역은 메일과 구글 시트로 받습니다.",
  program: "엑셀로 하던 정산과 재고, 접수 업무를 웹 화면으로 옮깁니다.",
  app: "휴대폰 홈 화면에 설치하는 웹앱과 앱스토어, 플레이스토어 출시 앱을 만듭니다.",
  kiosk: "병원 접수와 학원 출결, 시설 안내에 쓰는 터치 화면입니다.",
  "3d": "고객이 제품과 공간을 3D로 구성하고 견적까지 접수하는 화면입니다.",
};

const [basic, , premium] = plans;
const revisions = plans.map((p) => `${p.name} ${p.revisions}회`).join(", ");

/** 업체 고를 때 확인할 것. 곰파트너 답은 비용, 자주 묻는 질문 데이터에 있는 기준만 */
const checks: { t: string; why: string; we: string }[] = [
  { t: "도메인과 호스팅 명의", why: "업체 명의로 계약하면 업체를 바꿀 때 명의 변경부터 해야 합니다.", we: "곰파트너는 처음부터 고객 명의로 계약하고 관리 권한만 공유받습니다." },
  { t: "원본 소스 제공", why: "소스를 받지 못하면 다른 업체에 수정을 맡기기 어렵습니다.", we: "곰파트너는 모든 패키지에 원본 소스를 납품합니다." },
  { t: "작업 중 수정 횟수", why: "몇 번까지 고칠 수 있는지와 1회로 계산하는 범위를 계약 전에 확인합니다.", we: `곰파트너는 ${revisions} 수정합니다. 작업 과정의 하자는 횟수와 관계없이 수정합니다.` },
  { t: "하자보수 기간", why: "오픈 뒤 발견한 오류를 무상으로 고치는 기간입니다.", we: "곰파트너는 오픈 후 1개월 무상 하자보수를 제공합니다." },
  { t: "업종별 법정 고지", why: "의료기관의 비급여 진료비나 학원의 교습비처럼 게시 의무가 있는 항목이 있습니다.", we: "곰파트너는 제작 전에 업종별 법정 고지 항목을 검토해 반영합니다." },
  { t: "별도 비용", why: "도메인과 호스팅, 기능 추가 비용이 견적에 따로 적혀 있는지 확인합니다.", we: "곰파트너는 표시한 금액 외 별도 비용은 없으며, 기능 추가 시에만 추가 비용이 발생합니다." },
];

const compare = {
  cols: ["맞춤 제작(곰파트너)", "사이트 빌더(아임웹 등)", "워드프레스"],
  rows: [
    ["만드는 방식", "요구사항에 맞춰 화면과 기능을 설계하고 개발", "제공 템플릿을 편집기에서 수정", "테마를 고르고 플러그인으로 기능 추가"],
    ["디자인", "업종과 브랜드에 맞춰 새로 디자인", "템플릿 구성 안에서 수정", "테마 구성 안에서 수정"],
    ["기능 추가", "필요한 기능을 개발해 추가", "플랫폼이 제공하는 기능 안에서 사용", "플러그인으로 추가하고 없으면 개발"],
    ["직접 수정", "관리자 페이지에서 공지와 사진 게시(문의와 예약 홈페이지부터)", "편집기에서 직접 수정", "관리자 화면에서 글과 페이지 수정"],
    ["운영 비용", "고객 명의 호스팅 비용(공유 웹호스팅 연 3~4만 원 정도)", "플랫폼 구독료(연 18~21만 원 정도)", "호스팅 비용과 유료 테마나 플러그인 비용"],
    ["업데이트와 보안", "제작사나 유지보수 업체가 관리", "플랫폼이 서버와 보안을 관리", "코어와 테마, 플러그인 업데이트를 직접 관리"],
    ["소스와 이전", "원본 소스를 고객에게 납품", "플랫폼 안에서 운영", "파일과 DB를 옮겨 다른 호스팅으로 이전"],
    ["맞는 곳", "예약이나 관리자 화면처럼 업종 맞춤 기능이 필요한 곳", "구성이 단순하고 직접 자주 고치는 곳", "글과 게시물 중심으로 운영하는 곳"],
  ],
};

export function MakeGuide() {
  const priced = kinds.filter((k) => k.plans.length > 0);
  return (
    <>
      {/* 1. 무엇을 만드는지 */}
      <GuideSection
        id="mk-what"
        title="곰파트너가 제작하는 것"
        lead="곰파트너는 홈페이지와 랜딩페이지를 중심으로 앱과 키오스크 화면, 업무 시스템과 3D 웹을 제작합니다. 재위탁 없이 곰파트너가 직접 제작하고 원본 소스를 납품합니다."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {kinds.map((k) => {
            const from = k.plans[0];
            return (
              <li key={k.id} className={`${gCard} flex flex-col p-6 md:p-7`}>
                <p className="text-[13px] font-bold tracking-[0.1em] text-[#7aa7ff]">{k.en.toUpperCase()}</p>
                <h3 className={`mt-2 ${gH3}`}>{k.name} 제작</h3>
                <p className="mt-2 break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">{what[k.id]}</p>
                <p className="mt-auto pt-5 text-[15px] font-bold text-white">{from ? `${manwon(from.price)}부터, 제작 기간 ${from.period ?? `${from.days}일`}부터` : "요구사항 확인 후 견적"}</p>
              </li>
            );
          })}
        </ul>
      </GuideSection>

      {/* 2. 종류별 패키지와 기간 */}
      <GuideSection
        id="mk-plans"
        title="종류별 패키지와 제작 기간"
        lead={`홈페이지 제작 비용은 ${basic.name} ${manwon(basic.price)}(제작 기간 ${basic.days}일)부터 ${premium.name} ${manwon(premium.price)}(${premium.days}일)까지입니다. 금액은 부가세 별도이며 도메인과 호스팅은 고객 명의로 따로 계약합니다.`}
      >
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
            <p className="mt-2 break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">업무마다 화면과 계산 방식이 달라 정해진 패키지가 없습니다. 지금 쓰는 엑셀이나 양식을 기준으로 범위와 금액, 일정을 견적서로 드립니다.</p>
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
        <p className={gNote}>제작 기간은 로고와 사진 같은 자료를 받은 날부터 계산합니다. 금액은 부가세 별도입니다.</p>
      </GuideSection>

      {/* 3. 제작 방식 비교 */}
      <GuideSection
        id="mk-compare"
        title="제작 방식 비교"
        lead="홈페이지는 사이트 빌더로 직접 만들거나 워드프레스로 만들 수 있고, 제작사에 맞춤 제작을 맡길 수도 있습니다. 방식마다 디자인과 기능을 바꿀 수 있는 범위와 운영 비용이 다릅니다."
      >
        <CompareTable caption="홈페이지 제작 방식 비교" cols={compare.cols} rows={compare.rows} />
        <p className={`${gNote} lg:text-right`}>호스팅과 구독료는 국내 업체 공개 요금을 조사한 범위입니다.</p>
      </GuideSection>

      {/* 4. 업체 고를 때 확인할 것 */}
      <GuideSection id="mk-check" title="제작 업체를 고를 때 확인할 것" lead="견적 금액이 비슷해도 계약 조건에 따라 오픈 뒤 드는 비용과 수고가 달라집니다. 계약 전에 아래 여섯 가지를 확인합니다.">
        <ul className={`${gCard} grid px-6 md:grid-cols-2 md:gap-x-12 md:px-9`} role="list">
          {checks.map((c) => (
            <li key={c.t} className="border-b border-white/12 py-6 last:border-b-0 md:py-7 md:[&:nth-last-child(2)]:border-b-0">
              <h3 className="break-keep text-[19px] font-[800] leading-[1.4] tracking-[-0.035em] md:text-[22px]">{c.t}</h3>
              <p className="mt-2 break-keep text-[16px] leading-[1.65] text-[#aab2bf]">{c.why}</p>
              <CheckLine>{c.we}</CheckLine>
            </li>
          ))}
        </ul>
      </GuideSection>

      {/* 5. 자주 묻는 질문(FAQPage 구조화 데이터는 FaqBlock이 낸다) */}
      <GuideSection id="mk-faq" title="자주 묻는 질문">
        <FaqBlock items={faqFor("make", "common")} bare />
      </GuideSection>
    </>
  );
}
