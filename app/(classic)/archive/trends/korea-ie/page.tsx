import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, DocHead, TakeoverBox, docH2 } from "@/components/classic/archive/ArchiveShell";
import { LineChart } from "@/components/classic/archive/LineChart";
import { Wireframes2012 } from "@/components/classic/archive/Wireframes2012";
import { TREND_CHECKED, ieShare } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

// 트렌드 "같은 20년, 세 나라의 홈페이지" 1장(11-21). 숫자는 data/classic/trendData.ts(StatCounter), 법과 지원 종료일은 아래 출처.
export const metadata: Metadata = pageMeta({
  title: "한국만 IE를 오래 못 떠난 이유, 한국 일본 미국 2009~2025 | 아카이브",
  description: "PC 브라우저 중 IE 비율은 2015년 미국 28%, 일본 41%, 한국 68%였습니다. 공인인증서와 ActiveX, 2020년 전자서명법 개정, 2022년 IE 지원 종료까지 차트와 함께 정리했습니다.",
  path: "/archive/trends/korea-ie",
  article: true,
});

const p = "mt-4 max-w-[760px] text-[16.5px] leading-[1.8] text-[#2b313b]";

export default function TrendKoreaIe() {
  return (
    <ArchiveShell
      section="trends"
      active="/archive/trends/korea-ie"
      crumbs={[{ href: "/archive", label: "아카이브" }, { href: "/archive/trends", label: "트렌드" }, { href: "/archive/trends/korea-ie", label: "브라우저" }]}
      toc={[{ id: "chart", label: "PC 브라우저 중 IE 비율" }, { id: "why", label: "한국에만 있던 이유" }, { id: "wf", label: "2012년 무렵 첫 화면" }, { id: "take", label: "이어받을 때 볼 것" }, { id: "src", label: "출처" }]}
    >
      <DocHead
        title="한국만 IE를 오래 못 떠난 이유"
        meta={[["비교", "한국, 일본, 미국"], ["기간", "2009~2025"], ["데이터", "StatCounter"], ["확인일", TREND_CHECKED]]}
        lead="2009년에는 세 나라 모두 인터넷 익스플로러(IE)가 PC 브라우저의 절반이 넘었습니다. 미국은 2015년에 28%까지 내려왔지만, 한국은 같은 해에도 68%였습니다."
      />

      <h2 id="chart" className={docH2}>PC 브라우저 중 IE 비율</h2>
      <LineChart
        title="PC 브라우저 중 IE 비율, 연도별"
        sub="단위 %, PC 접속만"
        series={ieShare}
        labelYear={2015}
        source={{ label: "StatCounter Global Stats, Desktop Browser Market Share(연간)", href: "https://gs.statcounter.com/browser-market-share/desktop", note: "방문 표본 기반이라 해마다 튀는 값이 있습니다" }}
      />
      <p className="mt-2 text-[13.5px]">
        <Link href="/archive/data#ie-share" className="font-bold text-[#256ef4] hover:underline underline-offset-4">원본 데이터(CSV) 받기</Link>
      </p>

      <h2 id="why" className={docH2}>한국에만 있던 이유</h2>
      <p className={p}>
        한국은 은행, 쇼핑, 공공 서비스가 공인인증서로 본인을 확인했습니다. 인증서와 보안 프로그램이 IE 전용 플러그인(ActiveX)으로 돌아가는 곳이 많아, 다른 브라우저를 쓰다가도 결제와 민원은 IE로 돌아와야 했습니다.
      </p>
      <p className={p}>
        흐름이 바뀐 것은 두 번입니다. 2020년 12월 10일 전자서명법 전부개정법이 시행되면서 공인인증서의 독점적 지위가 없어졌고, 2022년 6월 15일 마이크로소프트가 Windows 10 대부분 버전에서 IE 11 지원을 끝냈습니다. 차트에서 한국 선이 2018년 이후 빠르게 내려오는 구간입니다.
      </p>

      <h2 id="wf" className={docH2}>2012년 무렵 첫 화면, 나란히 보기</h2>
      <Wireframes2012 />

      <TakeoverBox
        sub="2010년대 초에 만든 한국 사이트를 넘겨받았다면"
        items={[
          { b: "호환성 보기 태그", t: "머리말에 X-UA-Compatible 태그가 IE 옛 모드를 강제하고 있으면 지금 브라우저에서 화면이 어긋날 수 있습니다." },
          { b: "IE 전용 조건문과 스크립트", t: "\"if IE\" 조건 주석이나 IE 전용 스크립트가 남아 있으면 지워도 되는지 확인합니다. 지금 PC 방문 중 IE 비율은 1% 아래입니다." },
          { b: "보안 프로그램 설치 안내 페이지", t: "결제, 본인 확인용 플러그인 설치 안내가 남아 있으면 방문자가 아무것도 못 하고 나갑니다." },
          { b: "jQuery 1.x", t: "IE 지원 때문에 jQuery 1 버전을 그대로 둔 경우가 많습니다. 알려진 보안 경고가 있는 버전입니다." },
        ]}
      />

      <h2 id="src" className={docH2}>출처</h2>
      <ul role="list" className="mt-3 space-y-2 text-[14.5px] leading-[1.6]">
        <li>
          <a href="https://gs.statcounter.com/browser-market-share/desktop" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#256ef4]">StatCounter Global Stats, Desktop Browser Market Share</a>: 한국, 일본, 미국 연간 값(확인 {TREND_CHECKED})
        </li>
        <li>
          <a href="https://m.boannews.com/html/detail.html?idx=93269" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#256ef4]">보안뉴스, 10일부터 공인인증서 폐지(2020-12)</a>: 전자서명법 전부개정법 2020년 12월 10일 시행
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/lifecycle/announcements/internet-explorer-11-end-of-support-windows-10" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#256ef4]">Microsoft Learn, Internet Explorer 11 desktop app support ended for certain versions of Windows 10</a>: 2022년 6월 15일 지원 종료(LTSC, Windows Server 제외)
        </li>
      </ul>

      <nav aria-label="이전, 다음 문서" className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link href="/archive/trends" className="rounded-lg border border-[#d9dee5] px-4 py-3.5 hover:border-[#256ef4]">
          <span className="block text-[13px] text-[#5b6370]">목록</span>
          <span className="text-[15.5px] font-bold">트렌드 전체</span>
        </Link>
      </nav>
    </ArchiveShell>
  );
}
