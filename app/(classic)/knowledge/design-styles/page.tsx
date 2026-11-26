import type { Metadata } from "next";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { DesignEras } from "@/components/classic/archive/DesignEras";
import { ExampleCard } from "@/components/classic/archive/ExampleCard";
import { examplesDesign } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/design-styles";
export const metadata: Metadata = pageMeta({
  title: "디자인 흐름: 입체에서 플랫, 카드, 벤토까지, 웹 디자인 흐름 | 위키",
  description: "웹 디자인이 입체에서 플랫, 카드, 벤토로 바뀐 흐름을 Bootstrap, iOS 7, Material Design 날짜와 사례로 정리했습니다.",
  path: HREF,
  article: true,
});

const timeline: [string, string, string, string][] = [
  ["2010-02-15", "Microsoft, Windows Phone 7 Series 공개", "글자와 단색 면 위주의 화면. 2011년 9월 Windows 8에서 'Metro style'로 이름 붙임", "https://news.microsoft.com/source/2010/02/15/microsoft-unveils-windows-phone-7-series/"],
  ["2011-08-19", "Bootstrap 공개", "버튼, 표, 격자를 미리 만들어 둔 틀. Twitter에서 만들어 공개", "https://getbootstrap.com/docs/4.0/about/history/"],
  ["2013-06-10", "Apple, iOS 7 공개", "광택과 질감을 걷어 낸 평평한 화면으로 전환", "https://www.apple.com/newsroom/2013/06/10Apple-Unveils-iOS-7/"],
  ["2014-06-25", "Google, Material Design 발표", "종이 같은 카드와 옅은 그림자로 층을 나누는 규칙", "https://developers.googleblog.com/this-is-material-design/"],
  ["2017-03", "CSS Grid, 주요 브라우저 지원", "Firefox 52(3월 7일), Chrome 57(3월 9일), Safari 10.1(3월 27일). 크기가 다른 칸 배치가 쉬워짐", "https://web-platform-dx.github.io/web-features-explorer/features/grid/"],
  ["2020~2025", "웹폰트가 기본", "웹폰트를 쓰는 페이지 2020년 PC 82%, 모바일 80%에서 2025년 약 88%", "https://almanac.httparchive.org/en/2025/fonts"],
];

export default function TrendDesign() {
  return (
    <TrendArticle
      href={HREF}
      crumb="디자인 흐름"
      title="디자인 흐름: 입체, 플랫, 카드, 벤토"
      meta={[["범위", "전 세계, 한국 사례"], ["기간", "2008~2025"], ["데이터", "공식 발표, HTTP Archive"]]}
      lead="2008년 홈페이지는 광택 나는 메뉴와 반사되는 사진이 많았습니다. 2013년 iOS 7과 2014년 Material Design 전후로 화면이 평평해졌고, 지금은 크기가 다른 칸을 한 판에 섞는 배치가 흔합니다."
      chartTitle="디자인 흐름을 바꾼 날짜"
      chart={
        <ol className="mt-5 border-l border-[#e6e9ee] pl-5">
          {/* 11-26 줄마다 붙던 출처 링크는 맨 아래 참고 자료로 모았다(sources에 같은 주소가 있다) */}
          {timeline.map(([d, t, desc]) => (
            <li key={t} className="relative pb-5 last:pb-0">
              <span aria-hidden className="absolute -left-[26px] top-2 h-2.5 w-2.5 rounded-full bg-[#9aa3b0]" />
              <p className="text-[13.5px] font-bold tabular-nums text-[#5b6370]">{d}</p>
              <p className="text-[17px] font-[800]">{t}</p>
              <p className="mt-0.5 text-[15.5px] leading-[1.65] text-[#3d4450]">{desc}</p>
            </li>
          ))}
        </ol>
      }
      storyTitle="왜 바뀌었나"
      story={[
        "휴대폰 화면이 커지고 해상도가 높아지면서, 질감과 광택을 흉내 내던 장식은 작은 화면에서 오히려 거추장스러워졌습니다. 평평한 면과 큰 글씨, 넉넉한 여백이 여러 화면 크기에 맞추기 쉬웠습니다.",
        "Bootstrap 같은 미리 만든 틀과 CSS Grid 같은 배치 기능이 퍼지면서, 디자인의 차이는 장식보다 배치와 사진, 글꼴에서 나게 됐습니다. 웹폰트를 쓰는 페이지가 열에 아홉에 가까워진 것도 같은 흐름입니다.",
        "크기가 다른 칸을 섞는 배치(벤토)는 2020년대에 흔해졌지만, 언제 누가 시작했는지 분명한 공식 기록은 찾지 못했습니다. 그래서 날짜 없이 흐름으로만 적습니다.",
      ]}
      extraTitle="시대별 첫 화면과 실제 사례"
      extra={
        <>
          <DesignEras />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {examplesDesign.map((ex) => <ExampleCard key={ex.url} ex={ex} />)}
          </div>
          <p className="mt-2 text-[12.5px] text-[#6b7380]">실제 사례 문구는 인터넷 아카이브 보관본에서 직접 확인했습니다.</p>
        </>
      }
      takeSub="오래된 디자인의 사이트를 인수했다면"
      take={[
        { b: "글자를 이미지로 만든 부분", t: "광택 메뉴, 버튼, 제목을 이미지로 만든 사이트가 많습니다. 문구 하나 바꿀 때 원본 디자인 파일(PSD 등)이 있는지 먼저 찾습니다." },
        { b: "디자인 원본 파일", t: "로고, 배너, 아이콘의 원본 파일과 글꼴을 함께 받았는지 확인합니다. 없으면 수정 비용이 크게 늘어납니다." },
        { b: "부분 수정과 새 틀의 경계", t: "고정 폭, 이미지 버튼 위주의 화면은 한 곳씩 고치다 보면 옛 모양과 새 모양이 섞입니다. 어디까지 고치고 어디부터 새로 짤지 먼저 정합니다." },
      ]}
      sources={[
        ...timeline.map(([d, t, , href]) => ({ label: `${t}(${d})`, href })),
        { label: "Microsoft, Windows 8 Developer Preview(2011-09-13)", href: "https://news.microsoft.com/source/2011/09/13/microsoft-reimagines-windows-presents-windows-8-developer-preview/", note: "Metro style 표기" },
        ...examplesDesign.map((ex) => ({ label: `인터넷 아카이브, ${ex.site} ${ex.date} 보관본`, href: ex.url, note: `실제 사례(확인 ${ex.checked})` })),
      ]}
    />
  );
}
