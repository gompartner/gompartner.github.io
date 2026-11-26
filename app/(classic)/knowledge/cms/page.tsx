import type { Metadata } from "next";
import { BarGroups } from "@/components/classic/archive/BarGroups";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { cmsByLanguage } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/cms";
export const metadata: Metadata = pageMeta({
  title: "만드는 도구(CMS) 비교: 한국은 카페24, 일본은 WordPress | 위키",
  description: "CMS는 개발자 없이 관리자 화면에서 글과 사진, 메뉴와 상품을 고치게 해 주는 홈페이지 관리 프로그램입니다. 만든 도구를 알아낸 사이트 중 한국어 사이트는 Cafe24 39.6%와 WordPress 24.1%, 아임웹 16.7% 순입니다. 일본어 사이트는 WordPress가 82.8%입니다. 나라마다 다른 도구가 인수할 때 무엇을 남기는지 정리했습니다.",
  path: HREF,
  article: true,
});

// 설치형과 임대형(사이트 빌더) 비교
const cmsKinds: [string, string, string][] = [
  ["예", "WordPress와 그누보드, 라이믹스", "카페24와 아임웹, Wix, Shopify"],
  ["서버", "호스팅이나 서버를 따로 빌려 설치", "빌더 회사가 서버까지 운영"],
  ["비용", "호스팅비, 유료 테마와 플러그인", "월 또는 연 이용료와 유료 앱, 스킨"],
  ["고칠 수 있는 범위", "소스 코드까지 고칠 수 있음", "빌더가 열어 둔 만큼만"],
  ["옮기기", "파일과 DB를 통째로 옮길 수 있음", "디자인은 못 가져가고 데이터만 내보냄"],
  ["관리할 것", "본체와 플러그인, PHP 버전 업데이트", "계정 명의와 결제, 요금제"],
];

export default function TrendCms() {
  return (
    <TrendArticle
      href={HREF}
      crumb="만드는 도구"
      title="만드는 도구(CMS) 비교: 카페24, WordPress, 아임웹"
      updated="2026-11-22"
      meta={[["비교", "한국어와 일본어, 영어 사이트"], ["기준", "2026-11"], ["데이터", "W3Techs"]]}
      lead="사이트를 만든 도구를 알아낸 곳만 놓고 보면 한국어 사이트는 Cafe24가 39.6%로 가장 많고 일본어 사이트는 WordPress가 82.8%입니다. 같은 홈페이지라도 넘겨받을 때 받아야 할 것이 나라마다 다릅니다."
      introTitle="CMS란"
      intro={
        <>
          <p className="mt-4 max-w-[760px] text-[17px] leading-[1.8] text-[#2b313b]">
            CMS(Content Management System, 콘텐츠 관리 시스템)는 개발자 없이 관리자 화면에서 글과 사진, 메뉴와 상품을 올리고 고치게 해 주는 홈페이지 관리 프로그램입니다. 게시판에 글을 쓰듯 홈페이지 내용을 바꿀 수 있습니다. CMS가 없으면 문구 하나를 바꿀 때도 개발자가 코드를 고쳐야 합니다.
          </p>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
            <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
                  <th scope="col" className="w-[130px] px-3 py-2 font-bold">구분</th>
                  <th scope="col" className="px-3 py-2 font-bold">설치형</th>
                  <th scope="col" className="px-3 py-2 font-bold">임대형(사이트 빌더)</th>
                </tr>
              </thead>
              <tbody>
                {cmsKinds.map(([k, a, b]) => (
                  <tr key={k} className="block border-b border-[#eef0f3] px-3 py-2.5 last:border-0 md:table-row md:p-0">
                    <th scope="row" className="block pb-1 font-bold md:table-cell md:px-3 md:py-2.5 md:align-top">{k}</th>
                    <td className="block text-[#2b313b] md:table-cell md:px-3 md:py-2.5 md:align-top">
                      <b className="mr-1.5 font-bold text-[#5b6370] md:hidden">설치형</b>
                      {a}
                    </td>
                    <td className="block text-[#2b313b] md:table-cell md:px-3 md:py-2.5 md:align-top">
                      <b className="mr-1.5 font-bold text-[#5b6370] md:hidden">임대형</b>
                      {b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
      chartTitle="만드는 도구 점유율 상위 3"
      chart={
        <BarGroups
          title="CMS와 사이트 빌더 점유율 상위 3(콘텐츠 언어 기준)"
          sub="단위 %, W3Techs가 도구를 알아낸 사이트 중 비율"
          groups={cmsByLanguage}
          source={{ label: "W3Techs, Content management systems 언어별 분류", href: "https://w3techs.com/technologies/segmentation/cl-ko-/content_management", note: "확인 2026-11-21. 무료 페이지는 상위 3까지만 공개" }}
        />
      }
      storyTitle="나라마다 다른 도구"
      story={[
        "도구를 알아낸 한국어 사이트 중 쇼핑몰 빌더 Cafe24와 국내 빌더 아임웹이 함께 절반을 넘습니다(56.3%). 계정 하나로 만들고 운영까지 하는 임대형이라 서버를 따로 두지 않는 곳이 많습니다.",
        "일본어 사이트는 WordPress가 82.8%로 거의 하나로 모였습니다. 영어 사이트는 WordPress 50.7%에 Shopify 11.8%와 Wix 11.0%가 뒤를 잇습니다.",
        "국내에서 많이 쓰는 그누보드는 W3Techs가 따로 세지 않아 이 표에 나오지 않습니다. 공공기관과 학교, 오래된 회사 사이트를 인수하면 여전히 자주 만납니다.",
      ]}
      takeSub="빌더나 CMS로 만든 사이트를 인수했다면"
      take={[
        { b: "빌더 계정의 명의", t: "카페24나 아임웹 같은 임대형은 사이트가 곧 계정입니다. 운영자 계정이 고객 명의인지, 이전 업체 명의인지 가장 먼저 확인합니다." },
        { b: "유료 앱과 스킨 결제", t: "스킨과 앱을 이전 업체 계정으로 샀다면 옮길 때 다시 사야 할 수 있습니다. 결제 내역과 라이선스를 함께 받습니다." },
        { b: "빌더 밖으로 옮길 수 있는지", t: "임대형 빌더는 디자인과 기능을 그대로 내보내기 어렵습니다. 상품과 회원, 게시글 데이터만 내보낼 수 있는지 확인합니다." },
        { b: "WordPress와 그누보드 버전", t: "설치형은 본체와 플러그인 버전이 곧 보안입니다. 마지막 업데이트 날짜와 PHP 버전을 함께 봅니다." },
      ]}
      sources={[
        { label: "W3Techs, 한국어 사이트 CMS", href: "https://w3techs.com/technologies/segmentation/cl-ko-/content_management", note: "Cafe24 39.6%, WordPress 24.1%, 아임웹 16.7%" },
        { label: "W3Techs, 일본어 사이트 CMS", href: "https://w3techs.com/technologies/segmentation/cl-ja-/content_management", note: "WordPress 82.8%, Shopify 3.1%, Adobe 2.2%" },
        { label: "W3Techs, 영어 사이트 CMS", href: "https://w3techs.com/technologies/segmentation/cl-en-/content_management", note: "WordPress 50.7%, Shopify 11.8%, Wix 11.0%" },
      ]}
    />
  );
}
