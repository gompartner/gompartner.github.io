import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { ExampleCard } from "@/components/classic/archive/ExampleCard";
import { exampleFlash2009, flashJquery } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/flash-jquery";
export const metadata: Metadata = pageMeta({
  title: "플래시와 jQuery: 플래시가 사라진 자리, Flash와 jQuery 2015~2025 | 위키",
  description: "Flash를 쓰는 웹사이트는 2015년 12.1%에서 2025년 1.0%로 줄었고 2020년 말 지원이 끝났습니다. 2019년 국내 민간 500대 사이트 중 142곳이 아직 플래시를 썼습니다. 그 빈자리를 jQuery가 채운 흐름을 봅니다.",
  path: HREF,
  article: true,
});

export default function TrendFlash() {
  return (
    <TrendArticle
      href={HREF}
      crumb="플래시"
      title="플래시와 jQuery"
      meta={[["범위", "전 세계와 한국 조사 1건"], ["기간", "2015~2025"], ["데이터", "W3Techs"]]}
      lead="2015년에는 웹사이트 열 곳 중 한 곳 넘게 Flash를 썼습니다. 2020년 12월 31일 지원이 끝났습니다. 그 전해인 2019년에도 국내 민간 500대 사이트 중 142곳(28.4%)이 아직 플래시를 쓰고 있었습니다."
      chartTitle="Flash와 jQuery 사용 비율"
      chart={
        <LineChart
          title="웹사이트 중 Flash와 jQuery 사용 비율(전 세계)"
          sub="단위 %, 해마다 1월 1일"
          series={flashJquery}
          labelYear={2019}
          source={{ label: "W3Techs, 연도별 기술 사용 추이", href: "https://w3techs.com/technologies/history_overview/client_side_language/all/y", note: "W3Techs 조사 표본 기준, 2026년 값은 설명 없는 급변이라 뺐습니다" }}
        />
      }
      storyTitle="움직이던 첫 화면은 어디로 갔나"
      story={[
        "2000년대 한국 회사 홈페이지는 첫 화면을 플래시로 만드는 경우가 많았습니다. 큰 배너가 움직이고 메뉴에 소리가 나는 화면입니다. 2017년 7월 Adobe가 2020년 말에 Flash Player 업데이트와 배포를 멈춘다고 밝혔고 2020년 12월 31일 지원이 끝났습니다.",
        "그 자리는 jQuery 같은 자바스크립트와 HTML5가 채웠습니다. 움직이는 배너는 jQuery 슬라이더로 바뀌었고 jQuery를 쓰는 사이트는 2022년 78.5%까지 늘었습니다. 지금도 jQuery를 쓰는 사이트의 16.8%는 오래된 1 버전입니다.",
      ]}
      extraTitle="실제 사례: 지금 열면 빈 칸"
      extra={
        <div className="max-w-[420px]">
          {exampleFlash2009.map((ex) => <ExampleCard key={ex.url} ex={ex} />)}
          <p className="mt-2 text-[12.5px] text-[#6b7380]">문구는 인터넷 아카이브 보관본에서 직접 확인했습니다.</p>
        </div>
      }
      takeSub="2010년대 이전에 만든 사이트를 인수했다면"
      take={[
        { b: "swf 파일과 빈 영역", t: "object, embed 태그로 넣은 swf가 남아 있으면 그 자리는 지금 빈 칸입니다. 첫 화면 배너와 메뉴, 지도에 많습니다." },
        { b: "플래시로만 있던 내용", t: "회사 소개와 연혁, 제품 설명이 플래시 안에만 있었다면 글로 다시 옮겨야 합니다. 원본 fla 파일이 남아 있는지 먼저 찾습니다." },
        { b: "jQuery 1 버전", t: "플래시 대신 넣은 슬라이더가 jQuery 1 버전 위에서 돌아가는 경우가 많습니다. 알려진 보안 경고가 있어 버전을 올리며 함께 정리합니다." },
      ]}
      sources={[
        { label: "W3Techs, 연도별 기술 사용 추이(Flash)", href: "https://w3techs.com/technologies/history_overview/client_side_language/all/y", note: "확인 2026-11-21" },
        { label: "W3Techs, jQuery 사용 현황과 버전", href: "https://w3techs.com/technologies/details/js-jquery", note: "jQuery 사이트 중 1 버전 16.8%(확인 2026-11-21)" },
        { label: "Adobe Blog, Flash & The Future of Interactive Content(2017-07-25)", href: "https://blog.adobe.com/en/publish/2017/07/25/adobe-flash-update", note: "2020년 말 Flash Player 업데이트와 배포 중단 발표" },
        { label: "Adobe, Flash Player End of Life", href: "https://www.adobe.com/products/flashplayer/end-of-life.html", note: "2020년 12월 31일 지원 종료" },
        { label: "ZDNet Korea(2020-08-13)", href: "https://zdnet.co.kr/view/?no=20200813103008", note: "과기정통부 2019년 조사, 민간 500대 사이트 중 142곳(28.4%) 플래시 사용" },
        ...exampleFlash2009.map((ex) => ({ label: `인터넷 아카이브, ${ex.site} ${ex.date} 보관본`, href: ex.url, note: `실제 사례(확인 ${ex.checked})` })),
      ]}
    />
  );
}
