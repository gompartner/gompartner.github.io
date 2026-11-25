import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { fullHdShare, tabletShare, xgaShare } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/screen-size";
export const metadata: Metadata = pageMeta({
  title: "화면 크기와 해상도: 1024에서 1920으로, 모니터가 커진 만큼 바뀐 화면 | 위키",
  description: "2009년 PC 화면의 30% 안팎이 1024x768이었고, 한국은 2015년 1920x1080이 54%로 일본(24%), 미국(15%)보다 훨씬 빨리 넘어갔습니다. 고정 폭 980px 화면이 사라진 이유와 태블릿이 남긴 것을 정리했습니다.",
  path: HREF,
  article: true,
});

export default function DesignScreenSize() {
  return (
    <TrendArticle
      href={HREF}
      crumb="화면 크기"
      title="화면 크기와 해상도"
      meta={[["비교", "한국, 일본, 미국"], ["기간", "2009~2025"], ["데이터", "StatCounter"]]}
      lead="2009년에는 PC 화면의 30% 안팎이 1024x768이었습니다. 한국은 2015년 1920x1080이 54%가 됐고, 같은 해 일본은 24%, 미국은 15%였습니다. 한국 사이트가 큰 화면을 기준으로 가장 먼저 바뀐 셈입니다."
      chartTitle="PC 화면 해상도 비율"
      chart={
        <>
          <LineChart
            title="PC 화면 해상도 중 1920x1080 비율"
            sub="단위 %, 연간"
            series={fullHdShare}
            labelYear={2015}
            source={{ label: "StatCounter Global Stats, Desktop Screen Resolution(연간)", href: "https://gs.statcounter.com/screen-resolution-stats/desktop", note: "방문 표본 기반" }}
          />
          <LineChart
            title="PC 화면 해상도 중 1024x768 비율"
            sub="단위 %, 연간"
            series={xgaShare}
            labelYear={2009}
            source={{ label: "StatCounter Global Stats, Desktop Screen Resolution(연간)", href: "https://gs.statcounter.com/screen-resolution-stats/desktop", note: "방문 표본 기반" }}
          />
        </>
      }
      storyTitle="화면 폭이 디자인을 정했다"
      story={[
        "1024x768이 흔하던 때는 가로 스크롤 없이 보이도록 본문 폭을 980px 안팎으로 고정하는 사이트가 많았습니다. 2000년대 후반 회사 홈페이지가 가운데 좁게 모여 있고 양옆이 비어 있는 이유입니다.",
        "한국은 1920x1080 모니터로 빨리 넘어갔습니다. 2013년 34%, 2014년 47%, 2015년 54%입니다. 그래서 국내 사이트는 화면을 가로로 꽉 채우는 큰 배너, 와이드 사진을 일찍부터 썼습니다. 미국은 1366x768 노트북 화면이 오래 남아 2025년에도 1920x1080이 24%입니다.",
        "태블릿은 나라마다 달랐습니다. 전체 접속 중 태블릿 비율이 미국은 2014년 8.9%까지 올랐지만 한국은 가장 높을 때도 1.7%(2013년)였습니다. 국내 사이트가 태블릿 화면을 따로 챙기지 않은 경우가 많은 이유입니다.",
      ]}
      extraTitle="전체 접속 중 태블릿 비율"
      extra={
        <LineChart
          title="전체 접속 중 태블릿 비율"
          sub="단위 %, PC, 모바일, 태블릿 합계 중"
          series={tabletShare}
          max={10}
          labelYear={2014}
          source={{ label: "StatCounter Global Stats, Desktop vs Mobile vs Tablet(연간)", href: "https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet", note: "방문 표본 기반" }}
        />
      }
      takeSub="오래된 화면 기준의 사이트를 인수했다면"
      take={[
        { b: "고정 폭", t: "본문이 980px 같은 고정 폭이면 큰 모니터에서는 양옆이 비고 휴대폰에서는 가로 스크롤이 생깁니다. 최대 폭과 여백을 비율로 바꾸는 것이 첫 작업입니다." },
        { b: "작은 해상도로 만든 이미지", t: "1024 화면에 맞춰 만든 배너, 로고는 큰 모니터와 고해상도 휴대폰에서 흐리게 보입니다. 원본 크기를 확인합니다." },
        { b: "태블릿 폭", t: "PC와 휴대폰만 맞춘 사이트는 태블릿 폭(768~1024px)에서 메뉴가 겹치거나 두 줄로 깨지는 경우가 많습니다. 그 폭으로 따로 열어 봅니다." },
      ]}
      sources={[
        { label: "StatCounter Global Stats, Desktop Screen Resolution", href: "https://gs.statcounter.com/screen-resolution-stats/desktop", note: "한국, 일본, 미국 연간 값(확인 2026-11-21)" },
        { label: "StatCounter Global Stats, Desktop vs Mobile vs Tablet", href: "https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet", note: "태블릿 비율" },
      ]}
    />
  );
}
