import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { phpVersions } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/archive/tech/php";
export const metadata: Metadata = pageMeta({
  title: "PHP 5에서 8까지, 유지보수가 바뀐 10년 | 아카이브",
  description: "PHP를 쓰는 사이트 중 PHP 5는 2015년 98.2%에서 2026년 9.3%로 줄었고 PHP 8은 54.8%가 됐습니다. 버전마다 공식 지원 종료일이 있어 유지보수가 '고칠 때 부르는 일'에서 '정해진 날짜에 맞춰 올리는 일'로 바뀌었습니다.",
  path: HREF,
  article: true,
});

export default function TrendPhp() {
  return (
    <TrendArticle
      href={HREF}
      crumb="PHP와 유지보수"
      title="PHP 5에서 8까지, 유지보수가 바뀐 10년"
      meta={[["범위", "전 세계, .kr 참고"], ["기간", "2015~2026"], ["데이터", "W3Techs, php.net"]]}
      lead="2015년에는 PHP로 만든 사이트의 98%가 PHP 5였습니다. 2026년 1월에는 PHP 8이 54.8%이고, PHP 5는 9.3% 남았습니다. 그 사이 PHP 5.6, 7.4, 8.0, 8.1이 차례로 공식 지원을 끝냈습니다."
      chartTitle="PHP 버전 비율"
      chart={
        <LineChart
          title="PHP를 쓰는 사이트 중 주 버전 비율"
          sub="단위 %, 해마다 1월 1일, 전 세계"
          series={phpVersions}
          labelYear={2020}
          source={{ label: "W3Techs, PHP 버전 연도별 추이", href: "https://w3techs.com/technologies/history_details/pl-php/all/y", note: "W3Techs 조사 표본 기준, 버전을 숨긴 사이트는 빠짐" }}
        />
      }
      storyTitle="고칠 때 부르던 일에서, 날짜에 맞추는 일로"
      story={[
        "예전 유지보수는 고장 나면 부르는 일이었습니다. 지금은 언어와 프로그램마다 지원 종료일이 정해져 있어, 그 날짜 전에 버전을 올리는 일이 유지보수의 중심이 됐습니다. PHP 5.6은 2018년 12월 31일, 7.4는 2022년 11월 28일, 8.0은 2023년 11월 26일, 8.1은 2025년 12월 31일에 지원이 끝났고, 8.2는 2026년 12월 31일에 보안 지원이 끝납니다.",
        "한국 사이트는 PHP 비중이 큽니다. 서버 언어를 알 수 있는 .kr 사이트 중 74.6%가 PHP입니다(.jp 83.1%, .us 50.2%). 버전 올리기가 늦으면 지원이 끝난 버전 위에서 그대로 운영되는 사이트가 많아집니다.",
        "서버 앞단도 바뀌었습니다. Cloudflare 같은 프록시를 앞에 두는 사이트가 2016년 3.9%에서 2026년 1월 20.9%로 늘었습니다. 인증서, 캐시, 공격 차단을 서버가 아니라 앞단 서비스에서 처리하는 경우가 많아졌다는 뜻입니다.",
      ]}
      takeSub="PHP로 만든 사이트를 인수했다면"
      take={[
        { b: "지금 PHP 버전과 지원 종료일", t: "관리자 화면, 호스팅 관리 페이지, 서버 응답 헤더에서 버전을 확인하고 php.net의 지원 종료일과 대조합니다." },
        { b: "호스팅에서 버전을 바꿀 수 있는지", t: "공유 호스팅은 상품에 따라 PHP 버전을 고를 수 없거나 상품을 바꿔야 할 수 있습니다. 바꾸기 전에 시험 서버에서 먼저 돌려 봅니다." },
        { b: "버전을 올리면 깨지는 부분", t: "옛 그누보드, 워드프레스 플러그인, 직접 만든 함수가 새 버전에서 오류를 냅니다. 오류 로그를 켜고 주요 화면을 하나씩 열어 봅니다." },
        { b: "앞단 서비스의 계정", t: "Cloudflare 같은 앞단 서비스를 쓰고 있다면 그 계정과 DNS를 누가 관리하는지 확인합니다. 서버만 넘겨받으면 인증서와 캐시를 바꿀 수 없습니다." },
      ]}
      sources={[
        { label: "W3Techs, PHP 버전 연도별 추이", href: "https://w3techs.com/technologies/history_details/pl-php/all/y", note: "확인 2026-11-21" },
        { label: "php.net, Unsupported Branches", href: "https://www.php.net/eol.php", note: "5.6, 7.4, 8.0, 8.1 지원 종료일" },
        { label: "php.net, Supported Versions", href: "https://www.php.net/supported-versions.php", note: "8.2 보안 지원 2026년 12월 31일까지" },
        { label: "W3Techs, .kr 사이트 서버 언어", href: "https://w3techs.com/technologies/segmentation/tld-kr-/programming_language", note: "PHP 74.6%(.jp 83.1%, .us 50.2%)" },
        { label: "W3Techs, 리버스 프록시 연도별 추이", href: "https://w3techs.com/technologies/history_overview/proxy/all/y", note: "2016년 3.9%, 2026년 1월 20.9%" },
      ]}
    />
  );
}
