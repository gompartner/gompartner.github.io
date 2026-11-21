import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { pageWeight } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/page-weight";
export const metadata: Metadata = pageMeta({
  title: "페이지 무게와 속도: 홈페이지는 얼마나 무거워졌나, 페이지 무게 2011~2026 | 웹 지식",
  description: "웹 페이지 한 장의 용량 중앙값은 PC 기준 2011년 484KB에서 2026년 2,950KB로 6배, 모바일은 2012년 294KB에서 2,593KB로 9배 늘었습니다.",
  path: HREF,
  article: true,
});

export default function TrendPageWeight() {
  return (
    <TrendArticle
      href={HREF}
      crumb="페이지 무게"
      title="페이지 무게와 속도"
      meta={[["범위", "전 세계"], ["기간", "2011~2026"], ["데이터", "HTTP Archive"]]}
      lead="페이지 한 장을 여는 데 받는 용량의 중앙값은 PC 기준 2011년 484KB에서 2026년 2,950KB로 약 6배가 됐습니다. 모바일은 2012년 294KB에서 2,593KB로 약 9배입니다."
      chartTitle="페이지 무게 중앙값"
      chart={
        <LineChart
          title="웹 페이지 한 장의 전체 용량 중앙값"
          sub="단위 KB, 해마다 1월 첫 수집"
          series={pageWeight}
          unit="KB"
          max={3000}
          labelYear={2026}
          source={{ label: "HTTP Archive, Page Weight", href: "https://httparchive.org/reports/page-weight", note: "2016, 2018, 2022년에 수집 방식이 바뀌어 해마다 엄밀히 같은 조건은 아닙니다. PC 2017년 1월은 수집 없음" }}
        />
      }
      storyTitle="무거워진 이유"
      story={[
        "사진이 커지고, 글꼴 파일을 내려받고, 움직임과 분석 도구 스크립트가 늘었습니다. 휴대폰 화면은 작아도 받아 가는 용량은 PC와 거의 같아졌습니다.",
        "용량이 크다고 무조건 느린 것은 아니지만, 휴대폰 데이터로 처음 들어온 방문자는 첫 화면이 뜨기 전에 나가기 쉽습니다. 인수한 사이트의 첫 화면 용량은 이 중앙값과 비교해 보면 위치가 보입니다.",
      ]}
      takeSub="인수한 사이트가 느리다면"
      take={[
        { b: "가장 큰 파일 다섯 개", t: "브라우저 개발자 도구의 네트워크 탭에서 크기순으로 정렬합니다. 대개 원본 사진, 배경 동영상, 쓰지 않는 스크립트가 위에 있습니다." },
        { b: "사진을 원본 그대로 올렸는지", t: "카메라 원본(장당 수 MB)이 첫 화면에 있으면 WebP로 바꾸고 화면 폭에 맞게 줄이는 것만으로 크게 줄어듭니다." },
        { b: "쌓인 추적, 광고 스크립트", t: "예전 마케팅 대행사가 넣은 분석, 광고 스크립트가 여러 개 겹쳐 있는 경우가 많습니다. 지금 쓰는 것만 남깁니다." },
      ]}
      sources={[
        { label: "HTTP Archive, Page Weight", href: "https://httparchive.org/reports/page-weight", note: "PC, 모바일 중앙값(확인 2026-11-21)" },
      ]}
    />
  );
}
