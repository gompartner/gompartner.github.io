import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { httpsShare } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/https";
export const metadata: Metadata = pageMeta({
  title: "https와 인증서: 주소창 자물쇠가 기본이 되기까지, https 2015~2026 | 위키",
  description: "크롬에서 https로 열린 페이지는 2015년 일본 25%, 미국 46%에서 2026년 95%, 98%가 됐습니다. 2018년 7월 크롬 68의 '주의 요함' 표시 전후를 차트로 봅니다.",
  path: HREF,
  article: true,
});

export default function TrendHttps() {
  return (
    <TrendArticle
      href={HREF}
      crumb="https"
      title="https와 인증서"
      meta={[["비교", "일본, 미국(한국은 자료 없음)"], ["기간", "2015~2026"], ["데이터", "Google 투명성 보고서"]]}
      lead="2015년 7월, 크롬에서 https로 열린 페이지는 일본 25%, 미국 46%였습니다. 2026년에는 95%, 98%입니다. 이제 자물쇠가 없는 주소는 예외입니다."
      chartTitle="https로 열린 페이지 비율"
      chart={
        <LineChart
          title="크롬(Windows)에서 https로 열린 페이지 비율"
          sub="단위 %, 해마다 7월 첫 주"
          series={httpsShare}
          labelYear={2018}
          source={{ label: "Google 투명성 보고서, HTTPS encryption on the web", href: "https://transparencyreport.google.com/https/overview", note: "크롬 사용 통계 제공에 동의한 사용자 기준. 한국은 이 보고서의 나라 목록에 없습니다" }}
        />
      }
      storyTitle="자물쇠를 기본으로 만든 것"
      story={[
        "https는 주소창과 사이트 사이를 암호화합니다. 예전에는 로그인, 결제 화면에만 쓰는 경우가 많았고, 회사 소개 사이트는 http로 두는 일이 흔했습니다.",
        "2018년 7월 크롬 68부터 https가 아닌 모든 페이지에 \"주의 요함\" 표시가 붙었습니다. 차트에서 2017~2019년에 두 나라 선이 가파르게 오르는 구간입니다.",
        "한국 수치는 이 보고서에 없어 넣지 않았습니다. 다만 국내 사이트를 인수할 때도 http로 남은 페이지, 만료된 인증서는 자주 나오는 항목입니다.",
      ]}
      takeSub="https 설정이 된 사이트를 인수했어도"
      take={[
        { b: "인증서 만료일과 자동 갱신", t: "무료 인증서는 90일마다 갱신해야 합니다. 자동 갱신이 꺼져 있거나 서버를 옮기며 멈춘 경우가 많습니다." },
        { b: "http 주소가 https로 넘어가는지", t: "http로 들어와도 https로 301 이동하는지 봅니다. 두 주소가 다 열리면 검색 점수가 나뉩니다." },
        { b: "섞인 콘텐츠", t: "https 페이지 안에 http 이미지나 스크립트가 남아 있으면 자물쇠가 깨지거나 일부가 막힙니다. 옛 게시글 본문에 특히 많습니다." },
        { b: "인증서가 걸린 주소", t: "www가 있는 주소와 없는 주소, 서브도메인까지 인증서가 덮는지 확인합니다." },
      ]}
      sources={[
        { label: "Google 투명성 보고서, HTTPS encryption on the web", href: "https://transparencyreport.google.com/https/overview", note: "일본, 미국 Windows 값(확인 2026-11-21)" },
        { label: "Chromium Blog, A secure web is here to stay(2018-02-08)", href: "https://blog.chromium.org/2018/02/a-secure-web-is-here-to-stay.html", note: "2018년 7월 크롬 68부터 http 페이지에 주의 요함 표시" },
      ]}
    />
  );
}
