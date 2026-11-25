import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { Timeline } from "@/components/classic/archive/Timeline";
import { companyRows } from "@/data/classic/timelines";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { searchDemand } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/company-homepage";
export const metadata: Metadata = pageMeta({
  title: "기업 홈페이지: 회사 소개서 화면에서 플래시, 모바일, 빌더까지 | 위키",
  description: "기업 홈페이지는 회사 소개서를 옮긴 화면에서 플래시 첫 화면, 휴대폰용 m. 사이트, 반응형을 거쳐 빌더와 CMS로 만드는 일이 많아졌습니다. 그 사이 개인정보 보호법, 웹 접근성 의무가 생겨 만들고 끝나는 일이 관리하는 일로 바뀌었습니다.",
  path: HREF,
  article: true,
});

// 한국 기업 홈페이지에 영향을 준 일. 날짜는 출처에서 확인한 것만 적는다
const rows = companyRows;

export default function TrendCompanyHomepage() {
  return (
    <TrendArticle
      href={HREF}
      crumb="기업 홈페이지"
      title="기업 홈페이지"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "한국"], ["기간", "2000년대~2026"], ["데이터", "Google Trends, StatCounter, W3Techs, 법령"]]}
      lead="기업 홈페이지는 회사 소개서를 옮긴 화면에서 시작해 플래시 첫 화면, 휴대폰용 m. 사이트, 반응형을 거쳐 지금은 빌더와 CMS로 만드는 일이 많아졌습니다. 그 사이 개인정보 보호법과 웹 접근성 의무가 생겨, 만들고 끝나던 홈페이지가 계속 관리해야 하는 것이 됐습니다."
      chartTitle={"\"홈페이지 제작\" 검색 관심도"}
      chart={
        <LineChart
          title={"구글에서 \"홈페이지 제작\"을 찾는 정도"}
          sub="연평균, 최고점(2004년 2월) = 100, 대한민국"
          series={searchDemand}
          labelYear={2004}
          unit=""
          max={60}
          source={{ label: "Google Trends(대한민국, 2004~2026)", href: "https://trends.google.com/trends/explore?date=all&geo=KR&q=%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80%20%EC%A0%9C%EC%9E%91", note: "구글 안의 상대값. 국내 검색은 네이버 비중이 커서 전체 수요는 아님" }}
        />
      }
      storyTitle="만드는 일은 쉬워지고, 지킬 일은 늘었다"
      story={[
        "2000년대 기업 홈페이지는 종이 회사 소개서를 화면으로 옮긴 것에 가까웠습니다. 메뉴도 인사말, 연혁, 조직도, 사업 영역, 오시는 길 순서였습니다. 첫 화면은 플래시로 움직이는 인트로를 넣는 경우가 많았고, 화려할수록 잘 만든 홈페이지로 여겨졌습니다.",
        "2009년 11월 아이폰이 들어온 뒤 휴대폰으로 홈페이지를 여는 사람이 빠르게 늘었습니다. 처음에는 PC 홈페이지와 따로 m. 사이트를 만들었고, 두 곳을 같이 고치는 일이 부담이 되자 한 화면이 폭에 맞춰 바뀌는 반응형으로 넘어갔습니다. 2025년 한국 전체 접속 중 모바일은 57%입니다.",
        "법이 홈페이지에 들어왔습니다. 2011년 개인정보 보호법 시행으로 문의 폼 하나만 있어도 개인정보처리방침이 필요해졌고, 2014년부터는 주민등록번호를 받을 수 없게 됐습니다. 2013년 4월부터는 모든 기업에 웹 접근성 의무가 적용됩니다.",
        "플래시는 2020년 말 지원이 끝났지만, 2019년 조사에서 국내 민간 500대 사이트 중 28.4%가 여전히 플래시를 쓰고 있었습니다. 만든 뒤 손대지 않은 홈페이지가 그만큼 많았다는 뜻입니다.",
        "지금은 카페24, 아임웹 같은 빌더와 WordPress로 직접 만드는 회사가 많습니다. 구글에서 \"홈페이지 제작\"을 찾는 정도는 2004년 44에서 2014년 8.5로 내려온 뒤 6~8 사이에 머물러 있습니다. 만드는 일은 쉬워졌고, 남은 일은 계정, 결제, 개인정보, 접근성처럼 만든 뒤에 지켜야 하는 것들입니다.",
      ]}
      extraTitle="한국 기업 홈페이지 연표"
      extra={<Timeline rows={rows} colA="일어난 일" />}
      now={[
        "구글에서 \"홈페이지 제작\"을 찾는 정도는 2025년 8.0, 2026년(11월까지) 8.2로 2016년 이후 가장 높습니다. 숫자는 작지만 10년 가까이 이어진 내림세가 멈췄습니다.",
        "만드는 도구가 있는 한국어 사이트 중 카페24(39.6%)와 아임웹(16.7%)이 합쳐 절반을 넘습니다. 서버를 따로 두지 않는 임대형이라 계정 명의와 결제가 곧 사이트 소유권입니다.",
        "법은 더 무거워졌습니다. 2023년 9월 15일 전면 개정된 개인정보 보호법이 시행돼 과징금 상한의 기준이 위반 관련 매출액에서 전체 매출액으로 바뀌었고, 온라인과 오프라인의 처리 기준이 하나로 합쳐졌습니다.",
      ]}
      takeSub="오래된 회사 홈페이지를 넘겨받았다면"
      take={[
        { b: "남아 있는 플래시와 m. 사이트", t: "플래시 영역은 빈칸으로 보이고, 따로 만든 m. 사이트는 PC 쪽과 내용이 어긋나 있는 경우가 많습니다. 두 주소를 모두 열어 보고 하나로 합칠 계획을 세웁니다." },
        { b: "처리방침과 실제로 받는 항목", t: "문의 폼, 회원가입에서 받는 항목과 개인정보처리방침에 적힌 항목이 같은지 봅니다. 옛 회원 DB에 주민등록번호가 남아 있으면 파기 대상입니다." },
        { b: "웹 접근성", t: "기업 홈페이지도 웹 접근성 의무 대상입니다. 이미지 대체 텍스트, 키보드 이동, 글자 대비부터 점검합니다." },
        { b: "빌더, 호스팅 계정의 명의와 결제", t: "카페24, 아임웹 같은 빌더는 계정 주인이 곧 사이트 주인입니다. 이전 업체나 퇴사자 명의, 개인 카드 결제로 되어 있는지 확인합니다." },
      ]}
      sources={[
        { label: "Google Trends(대한민국, 2004~2026)", href: "https://trends.google.com/trends/explore?date=all&geo=KR&q=%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80%20%EC%A0%9C%EC%9E%91", note: "\"홈페이지 제작\" 검색 관심도 연평균, 확인 2026-11-21" },
        { label: "전자신문, 뒤늦은 아이폰 열풍(2012년)", href: "https://m.etnews.com/201209110631", note: "2009년 11월 28일 KT 아이폰 3GS 출시" },
        { label: "법무법인 지평, 개인정보 보호법 시행 안내(2011년 9월)", href: "https://jipyong.com/newsletter/real_estate/17_201109/data/issue.html", note: "법률 제10465호, 2011년 9월 30일 시행" },
        { label: "서울신문, 8월부터 주민번호 수집 못한다(2014년 1월 21일)", href: "https://m.go.seoul.co.kr/news/2014/01/21/20140121012001", note: "2014년 8월 7일부터 주민등록번호 수집 원칙 금지" },
        { label: "ZDNet Korea, 웹 접근성 의무 확대(2011년 12월 30일)", href: "https://zdnet.co.kr/view/?no=20111230095801", note: "2009년 공공기관부터, 2013년 4월 모든 기업" },
        { label: "ZDNet Korea(2020-08-13)", href: "https://zdnet.co.kr/view/?no=20200813103008", note: "2019년 조사, 민간 500대 사이트 중 142곳(28.4%) 플래시 사용" },
        { label: "Adobe, Flash Player End of Life", href: "https://www.adobe.com/products/flashplayer/end-of-life.html", note: "2020년 12월 31일 지원 종료" },
        { label: "StatCounter, Desktop vs Mobile vs Tablet(대한민국)", href: "https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet", note: "2025년 모바일 57%" },
        { label: "W3Techs, 한국어 사이트 CMS", href: "https://w3techs.com/technologies/segmentation/cl-ko-/content_management", note: "Cafe24 39.6%, WordPress 24.1%, 아임웹 16.7%" },
        { label: "보안뉴스, 전면 개정된 개인정보 보호법 9월 15일 시행(2023년 9월 5일)", href: "https://www.boannews.com/news/articleView.html?idxno=121647", note: "과징금 상한 기준을 전체 매출액으로, 온오프라인 기준 일원화" },
      ]}
    />
  );
}
