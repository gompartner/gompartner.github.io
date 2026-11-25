import type { Metadata } from "next";
import { SourceFold } from "@/components/classic/archive/SourceFold";
import Link from "next/link";
import { ArchiveShell, DocHead, TakeoverBox, docH2 } from "@/components/classic/archive/ArchiveShell";
import { LineChart } from "@/components/classic/archive/LineChart";
import { MobileWireframes2012 } from "@/components/classic/archive/MobileWireframes2012";
import { TrendNav } from "@/components/classic/archive/TrendNav";
import { TREND_CHECKED, examplesMobile2012, mobileShare } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

// 트렌드 2장(11-21). 숫자는 StatCounter, 스마트폰 가입자 시점과 구글, 반응형 사례는 아래 출처.
const HREF = "/knowledge/mobile-screen";
export const metadata: Metadata = pageMeta({
  title: "모바일 화면: 한국이 모바일로 먼저 넘어간 길, 한국 일본 미국 2009~2025 | 위키",
  description: "2012년 전체 접속 중 모바일 비율은 한국 24%, 미국 10%, 일본 8%였습니다. m. 전용 사이트, PC 화면 그대로, 반응형으로 갈린 세 나라의 길을 차트와 실제 사례로 비교합니다.",
  path: HREF,
  article: true,
});

const p = "mt-4 max-w-[760px] text-[16.5px] leading-[1.8] text-[#2b313b]";
const a = "underline underline-offset-2 hover:text-[#256ef4]";

export default function TrendMobile() {
  return (
    <ArchiveShell
      section="design"
      active={HREF}
      crumbs={[{ href: "/knowledge", label: "위키" }, { href: "/knowledge/design", label: "디자인 트렌드" }, { href: HREF, label: "모바일" }]}
      toc={[{ id: "chart", label: "모바일 접속 비율" }, { id: "why", label: "세 나라가 갈린 길" }, { id: "wf", label: "2012년 휴대폰으로 연 화면" }, { id: "take", label: "인수 시 확인 사항" }, { id: "src", label: "출처" }]}
      article={{ title: "모바일 화면: m. 사이트에서 반응형으로", description: "2012년 전체 접속 중 모바일 비율은 한국 24%, 미국 10%, 일본 8%였습니다. 한국은 세 나라 중 가장 먼저 휴대폰 화면을 따로 챙겨야 했습니다.", modified: TREND_CHECKED }}
    >
      <DocHead
        title="모바일 화면: m. 사이트에서 반응형으로"
        meta={[["비교", "한국, 일본, 미국"], ["기간", "2009~2025"], ["데이터", "StatCounter"], ["최종 수정일", TREND_CHECKED]]}
        lead="2012년 전체 접속 중 모바일 비율은 한국 24%, 미국 10%, 일본 8%였습니다. 한국은 세 나라 중 가장 먼저 휴대폰 화면을 따로 챙겨야 했습니다."
      />

      <h2 id="chart" className={docH2}>전체 접속 중 모바일 비율</h2>
      <LineChart
        title="전체 접속 중 모바일 비율, 연도별"
        sub="단위 %, PC, 모바일, 태블릿 합계 중 모바일"
        series={mobileShare}
        labelYear={2012}
        source={{ label: "StatCounter Global Stats, Desktop vs Mobile vs Tablet(연간)", href: "https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet", note: "방문 표본 기반이라 해마다 튀는 값이 있습니다(예: 미국 2023년)" }}
      />
      <p className="mt-2 text-[13.5px]">
        <Link href="/knowledge/data#mobile-share" className="font-bold text-[#256ef4] hover:underline underline-offset-4">원본 데이터(CSV) 받기</Link>
      </p>

      <h2 id="why" className={docH2}>세 나라가 갈린 길</h2>
      <p className={p}>
        한국은 스마트폰이 아주 빠르게 퍼졌습니다. 가입자가 2011년 3월 말 1천만 명을 넘었고, 2011년 10월 2천만 명, 2012년 8월 3천만 명을 넘었습니다. 기업들은 PC 사이트를 고치기보다 m. 으로 시작하는 모바일 전용 주소를 따로 만드는 경우가 많았습니다.
      </p>
      <p className={p}>
        미국에서는 같은 주소가 화면 폭에 맞춰 바뀌는 반응형 디자인이 퍼졌습니다. 2011년 9월 문을 연 Boston Globe 사이트가 대형 반응형 사이트의 초기 사례로 자주 꼽힙니다. 일본은 2014년까지도 PC 접속이 70%를 넘었고, 2012년 무렵 큰 사이트도 휴대폰으로 열면 PC 화면이 그대로 나왔습니다.
      </p>
      <p className={p}>
        2015년 4월 21일 구글이 모바일 검색 순위에 모바일 친화 여부를 반영하기 시작하면서, 따로 만든 m. 사이트도 반응형으로 합치는 흐름이 커졌습니다. 2025년 모바일 비율은 한국 57%, 일본 46%, 미국 46%입니다.
      </p>

      <h2 id="wf" className={docH2}>2012년 무렵, 휴대폰으로 연 화면</h2>
      <MobileWireframes2012 examples={examplesMobile2012} />

      <TakeoverBox
        sub="m. 주소가 따로 있는 사이트를 인수했다면"
        items={[
          { b: "m. 사이트가 따로 남아 있는지", t: "PC 사이트만 고치고 m. 사이트는 몇 년 전 내용 그대로인 경우가 많습니다. 두 주소의 연락처, 가격, 공지를 대조합니다." },
          { b: "휴대폰이면 m. 으로 보내는 자동 이동", t: "기기 종류로 m. 주소로 보내는 스크립트가 새 휴대폰이나 태블릿에서 잘못 동작해 빈 화면이나 무한 이동이 생깁니다." },
          { b: "화면 폭 설정(viewport) 태그", t: "머리말에 viewport 태그가 없으면 휴대폰에서 PC 화면이 작게 줄어 보입니다. 반응형 전환의 첫 확인 항목입니다." },
          { b: "검색에 두 주소가 같이 나오는지", t: "PC 주소와 m. 주소가 따로 색인되면 검색 점수가 나뉩니다. 서로를 가리키는 태그(canonical, alternate)나 301 이동이 있는지 봅니다." },
        ]}
      />

      <h2 id="src" className={docH2}>출처</h2>
      <SourceFold>
        <li><a href="https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet" target="_blank" rel="noopener noreferrer" className={a}>StatCounter Global Stats, Desktop vs Mobile vs Tablet Market Share</a>: 한국, 일본, 미국 연간 값(확인 {TREND_CHECKED})</li>
        <li><a href="https://m.seoul.co.kr/news/2011/10/30/20111030800026" target="_blank" rel="noopener noreferrer" className={a}>서울신문, 스마트폰 2천만 시대(2011-10-30)</a>: 방송통신위원회 발표, 2011년 10월 28일 2천만 명</li>
        <li><a href="https://www.khan.co.kr/article/201208212210115" target="_blank" rel="noopener noreferrer" className={a}>경향신문(2012-08-21)</a>: 스마트폰 가입자 3천만 명, 1천만 명은 2011년 3월 말</li>
        <li><a href="https://zeldman.com/2011/09/15/boston-globes-responsive-redesign-discuss/" target="_blank" rel="noopener noreferrer" className={a}>Jeffrey Zeldman, Boston Globe&apos;s responsive redesign(2011-09-15)</a></li>
        <li><a href="https://developers.google.com/search/blog/2015/04/rolling-out-mobile-friendly-update" target="_blank" rel="noopener noreferrer" className={a}>Google Search Central Blog, Rolling out the mobile-friendly update(2015-04-21)</a></li>
        {examplesMobile2012.map((ex) => (
          <li key={ex.url}><a href={ex.url} target="_blank" rel="noopener noreferrer" className={a}>인터넷 아카이브, {ex.site} {ex.date} 보관본</a>: 실제 사례(확인 {ex.checked})</li>
        ))}
      </SourceFold>
      <TrendNav current={HREF} />
    </ArchiveShell>
  );
}
