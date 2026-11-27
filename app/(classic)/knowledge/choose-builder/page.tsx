import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, docH2 } from "@/components/classic/archive/ArchiveShell";
import { CheckLine, CompareTable, gNote } from "@/components/classic/board/guide";
import { plans } from "@/data/classic/pricing";
import { pageMeta } from "@/lib/seo";

// 11-27 대표 "사이트 글이 너무 많다": /make 화면 아래에 있던 "제작 방식 비교"와 "제작 업체를 고를 때 확인할 것"을 이 문서로 옮겼다.
// 문구와 값은 옮기기 전 MakeGuide 그대로(호스팅과 구독료 범위는 국내 업체 공개 요금 조사, 곰파트너 기준은 비용과 자주 묻는 질문 데이터).

const HREF = "/knowledge/choose-builder";
const TITLE = "홈페이지 제작 업체 고르는 법";
const LEAD = "견적 금액이 비슷해도 계약 조건에 따라 오픈 뒤 드는 비용과 수고가 달라집니다. 제작 방식별 차이와 계약 전에 확인할 여섯 가지를 정리했습니다.";
const UPDATED = "2026-11-27";

export const metadata: Metadata = pageMeta({
  title: `${TITLE}: 제작 방식 비교와 계약 전 확인할 것 | 위키`,
  description: "맞춤 제작과 사이트 빌더, 워드프레스의 차이를 비교했습니다. 도메인 명의와 원본 소스 등 계약 전에 확인할 항목도 함께 정리했습니다.",
  path: HREF,
  article: true,
});

const p = "mt-3 break-keep text-[16px] leading-[1.75] text-[#c9ced6]";

const revisions = plans.map((x) => `${x.name} ${x.revisions}회`).join(", ");

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

const toc = [
  { id: "compare", label: "제작 방식 비교" },
  { id: "check", label: "계약 전에 확인할 것" },
];

export default function ChooseBuilderDoc() {
  return (
    <ArchiveShell
      section="plan"
      active={HREF}
      crumbs={[{ href: HREF, label: TITLE }]}
      toc={toc}
      head={{ title: TITLE, meta: [["갱신", UPDATED], ["화면", "곰파트너 홈페이지 제작(/make)"]], lead: LEAD }}
      article={{ title: TITLE, description: LEAD, published: UPDATED, modified: UPDATED }}
    >
      <section aria-labelledby="compare">
        <h2 id="compare" className={docH2}>제작 방식 비교</h2>
        <p className={p}>홈페이지는 사이트 빌더로 직접 만들거나 워드프레스로 만들 수 있고, 제작사에 맞춤 제작을 맡길 수도 있습니다. 방식마다 디자인과 기능을 바꿀 수 있는 범위와 운영 비용이 다릅니다.</p>
        <div className="mt-5">
          <CompareTable caption="홈페이지 제작 방식 비교" cols={compare.cols} rows={compare.rows} />
        </div>
        <p className={gNote}>호스팅과 구독료는 국내 업체 공개 요금을 조사한 범위입니다.</p>
      </section>

      <section aria-labelledby="check">
        <h2 id="check" className={docH2}>계약 전에 확인할 것</h2>
        <p className={p}>계약 전에 아래 여섯 가지를 확인합니다.</p>
        <ul role="list" className="mt-4 space-y-5">
          {checks.map((c) => (
            <li key={c.t} className="border-b border-white/12 pb-5 last:border-b-0">
              <h3 className="break-keep text-[17px] font-[800] text-white">{c.t}</h3>
              <p className={p}>{c.why}</p>
              <CheckLine>{c.we}</CheckLine>
            </li>
          ))}
        </ul>
        <p className={p}>
          종류별 금액과 제작 기간은 <Link href="/make" className="font-bold text-white underline underline-offset-4">홈페이지 제작</Link>에서 확인할 수 있습니다.
        </p>
      </section>
    </ArchiveShell>
  );
}
