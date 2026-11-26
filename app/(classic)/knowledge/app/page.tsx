import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { iosShare } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/app";
export const metadata: Metadata = pageMeta({
  title: "앱: 한국은 안드로이드, 일본과 미국은 아이폰, 앱 2012~2025 | 위키",
  description: "2025년 휴대폰 OS 중 아이폰 비율은 한국 23%, 일본 61%, 미국 58%입니다. 앱 인수 시 확인할 계정, 서명 키, 스토어 요건.",
  path: HREF,
  article: true,
});

export default function TrendApp() {
  return (
    <TrendArticle
      href={HREF}
      crumb="앱"
      title="앱: 안드로이드와 아이폰"
      meta={[["비교", "한국, 일본, 미국"], ["기간", "2012~2025"], ["데이터", "StatCounter"]]}
      lead="2025년 휴대폰 접속 중 아이폰(iOS) 비율은 한국 23%, 미국 58%, 일본 61%입니다. 한국은 열 명 중 일곱 명 넘게 안드로이드를 쓰고, 일본과 미국은 반대입니다."
      chartTitle="휴대폰 OS 중 아이폰 비율"
      chart={
        <LineChart
          title="휴대폰 접속 중 아이폰(iOS) 비율"
          sub="단위 %, 나머지는 대부분 안드로이드"
          series={iosShare}
          labelYear={2025}
          source={{ label: "StatCounter Global Stats, Mobile Operating System Market Share(연간)", href: "https://gs.statcounter.com/os-market-share/mobile", note: "방문 표본 기반이라 해마다 튀는 값이 있습니다" }}
        />
      }
      storyTitle="휴대폰 구성이 앱을 바꾼다"
      story={[
        "한국에서 아이폰 비율은 2012년 10%에서 2018년 29%까지 올랐다가 2025년 23%입니다. 일본은 2015년부터 60%대, 미국은 2020년부터 56~60% 사이입니다.",
        "그래서 한국 앱은 안드로이드 기기 여러 종류에서 먼저 확인하는 경우가 많고, 일본과 미국 서비스는 아이폰 화면을 기준으로 디자인하는 경우가 많습니다. 같은 앱이라도 어느 나라 고객을 보느냐에 따라 시험할 기기 목록이 달라집니다.",
        "앱을 따로 만들지 않고 홈페이지를 앱처럼 쓰는 방식(웹앱, 홈 화면 추가)도 늘었지만, 알림과 결제가 필요한 서비스는 여전히 스토어 앱을 함께 둡니다.",
      ]}
      takeSub="다른 업체가 만든 앱을 인수했다면"
      take={[
        { b: "개발자 계정의 명의", t: "애플 개발자 프로그램과 구글 플레이 콘솔이 이전 업체 계정에 있으면 업데이트를 올릴 수 없습니다. 앱 이전(트랜스퍼)이나 권한 추가를 먼저 받습니다." },
        { b: "앱 서명 키", t: "안드로이드 앱 서명 키나 업로드 키가 이전 업체 컴퓨터에만 있는 경우가 많습니다. 키 파일과 비밀번호를 함께 받았는지 확인합니다." },
        { b: "스토어가 요구하는 최소 버전", t: "구글 플레이는 해마다 목표 API 수준 요구를 올리고, 애플도 새 SDK로 빌드하도록 요구합니다. 오래 손대지 않은 앱은 업데이트 자체가 막혀 있을 수 있습니다." },
        { b: "푸시 알림 설정", t: "아이폰 푸시 인증서 만료일과 Firebase 발송 방식(옛 방식은 막힘)을 함께 확인합니다." },
      ]}
      sources={[
        { label: "StatCounter Global Stats, Mobile Operating System Market Share", href: "https://gs.statcounter.com/os-market-share/mobile", note: "한국, 일본, 미국 연간 값(확인 2026-11-21)" },
      ]}
    />
  );
}
