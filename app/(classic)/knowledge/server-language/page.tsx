import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { serverLanguages } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/server-language";
export const metadata: Metadata = pageMeta({
  title: "개발 언어: Perl CGI에서 Next.js까지 | 웹 지식",
  description: "서버 언어를 알 수 있는 사이트 중 PHP는 2015년 80.6%에서 2026년 11월 68.0%로 줄었고, 서버에서 JavaScript(Node.js)를 쓰는 사이트는 0.1%에서 9.0%로 늘었습니다. 한국 .kr 사이트는 Java 비율이 8.0%로 전 세계 평균보다 높습니다.",
  path: HREF,
  article: true,
});

// 언어와 도구가 나온 때. 날짜는 출처에서 확인한 것만 적는다
const eras: [string, string, string][] = [
  ["Perl CGI", "1990년대 중반", "요청이 올 때마다 서버가 스크립트(.cgi, .pl)를 하나씩 띄우는 방식. 게시판, 방명록, 폼 메일, 방문자 카운터가 파일 하나씩이었습니다."],
  ["PHP", "1995년 6월 8일", "Rasmus Lerdorf가 Personal Home Page Tools 1.0을 공개. HTML 안에 코드를 섞어 쓰고 값싼 공유 호스팅에서 바로 돌아갔습니다."],
  ["ASP, ASP.NET", "1990년대 후반~2000년대", "Windows 서버(IIS) 위의 방식. 회사 내부 시스템과 함께 쓰던 홈페이지에 많았습니다."],
  ["Java(JSP, Spring)", "2009년 6월(전자정부 표준프레임워크 1.0)", "공공과 대기업 시스템의 기본. 행정안전부의 전자정부 표준프레임워크가 Java와 Spring 위에 만들어졌습니다."],
  ["Node.js", "2009년 11월 8일(JSConf EU 발표)", "브라우저의 언어인 JavaScript를 서버에서도 쓰게 됐습니다."],
  ["Next.js", "2016년 10월 25일", "ZEIT(지금의 Vercel)가 공개. 화면(React)과 서버 처리를 한 프로젝트에서 같이 만듭니다."],
];

export default function TrendServerLanguage() {
  return (
    <TrendArticle
      href={HREF}
      crumb="개발 언어"
      title="개발 언어"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "전 세계, .kr .jp .us 참고"], ["기간", "2015~2026"], ["데이터", "W3Techs"]]}
      lead="1990년대 게시판은 Perl CGI, 2000년대 홈페이지는 PHP와 ASP, 공공과 대기업은 Java였습니다. 2010년대 후반부터는 JavaScript(Node.js, Next.js)가 서버로 들어왔습니다. 2026년 11월에도 PHP가 68.0%로 가장 많고, 서버에서 JavaScript를 쓰는 사이트는 2015년 0.1%에서 9.0%가 됐습니다."
      chartTitle="서버 언어 비율"
      chart={
        <LineChart
          title="서버 언어를 알 수 있는 사이트 중 언어별 비율"
          sub="단위 %, 해마다 1월 1일, 전 세계"
          series={serverLanguages}
          source={{ label: "W3Techs, 서버 언어 연도별 추이", href: "https://w3techs.com/technologies/history_overview/programming_language/ms/y", note: "W3Techs 조사 표본 기준, 한 사이트가 여러 언어를 쓰면 각각 셈" }}
        />
      }
      storyTitle="언어가 바뀌어도 옛 사이트는 그대로 남는다"
      story={[
        "처음 웹에서 동적인 화면을 만드는 방법은 CGI였습니다. 요청이 올 때마다 서버가 Perl 스크립트를 새로 띄웠고, 방문이 몰리면 서버가 버티지 못했습니다. 지금 Perl을 쓰는 사이트는 0.1%지만, 오래된 서버의 cgi-bin 폴더에는 그때 넣은 폼 메일과 카운터가 아직 남아 있는 경우가 있습니다.",
        "PHP는 HTML 사이에 코드를 바로 넣을 수 있고, 값싼 공유 호스팅에서 설정 없이 돌아갔습니다. 그래서 작은 회사 홈페이지, 쇼핑몰, 게시판이 거의 PHP로 만들어졌습니다. 서버 언어를 알 수 있는 .kr 사이트 중 74.6%가 PHP이고(.jp 83.1%, .us 50.2%), 그누보드, 워드프레스, 카페24 같은 도구도 PHP 위에서 돕니다.",
        "공공과 대기업은 Java였습니다. 2009년 행정안전부가 Java와 Spring 기반의 전자정부 표준프레임워크를 내놓은 뒤 공공 시스템은 대부분 이 틀로 만들어졌습니다. .kr 사이트의 Java 비율이 8.0%로 전 세계(5.5%)보다 높은 이유입니다. 주소가 .do, .jsp로 끝나면 대개 이 계열입니다.",
        "Windows 서버의 ASP.NET은 2015년 16.7%에서 2026년 1월 4.6%로 줄었습니다. 그 자리를 JavaScript가 채웠습니다. Node.js로 화면과 서버를 같은 언어로 쓰게 됐고, Next.js는 화면(React)과 서버 처리를 한 프로젝트에 묶었습니다. AI 도구로 만든 서비스도 Next.js로 나오는 경우가 많습니다.",
        "언어가 바뀌어도 이미 만든 사이트는 그대로 남습니다. 인수할 때는 어떤 언어인지보다, 그 언어와 도구의 버전이 아직 지원을 받는지가 먼저입니다. PHP는 버전마다 지원 종료일이 있고, Node.js도 짝수 버전(LTS)마다 끝나는 날이 정해져 있습니다. Node.js 20은 2026년 4월 30일에 지원이 끝났습니다.",
      ]}
      extraTitle="언어와 도구가 나온 때"
      extra={
        <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
          <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
            <thead>
              <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
                <th scope="col" className="px-3 py-2 font-bold">언어, 도구</th>
                <th scope="col" className="px-3 py-2 font-bold">나온 때</th>
                <th scope="col" className="hidden px-3 py-2 font-bold md:table-cell">특징</th>
              </tr>
            </thead>
            <tbody>
              {eras.map(([n, d, t]) => (
                <tr key={n} className="border-b border-[#eef0f3] align-top last:border-0">
                  <th scope="row" className="whitespace-nowrap px-3 py-2.5 font-bold">{n}</th>
                  <td className="px-3 py-2.5">
                    {d}
                    <span className="mt-1 block text-[13.5px] text-[#5b6370] md:hidden">{t}</span>
                  </td>
                  <td className="hidden px-3 py-2.5 text-[#3d4450] md:table-cell">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      takeSub="넘겨받은 사이트의 언어를 모를 때"
      take={[
        { b: "서버 언어와 버전", t: "응답 헤더(X-Powered-By, Server), 주소 끝(.php, .jsp, .do, .aspx), 호스팅 관리 화면에서 언어와 버전을 확인하고 지원 종료일과 대조합니다." },
        { b: "남아 있는 CGI 스크립트", t: "cgi-bin 폴더의 옛 폼 메일, 카운터 스크립트는 스팸 발송에 악용되기 쉽습니다. 쓰지 않으면 지우고, 쓰고 있다면 바꿀 계획을 세웁니다." },
        { b: "Java 사이트의 빌드 환경", t: "소스만 받고 JDK 버전, 빌드 도구(Maven, Gradle), 전자정부 표준프레임워크 버전을 모르면 한 줄 고쳐도 다시 올릴 수 없습니다. 빌드해서 올리는 순서를 받았는지 봅니다." },
        { b: "Node.js, Next.js 사이트의 배포 계정", t: "Node.js 버전, package-lock.json 같은 잠금 파일, 배포한 곳(Vercel 같은 서비스)의 계정 명의를 확인합니다. 계정이 이전 업체에 있으면 고쳐도 반영할 수 없습니다." },
      ]}
      sources={[
        { label: "W3Techs, 서버 언어 연도별 추이", href: "https://w3techs.com/technologies/history_overview/programming_language/ms/y", note: "2015~2026년 1월 1일 값, 2026년 11월 21일 PHP 68.0%, JavaScript 9.0%, Java 5.5%" },
        { label: "W3Techs, .kr 사이트 서버 언어", href: "https://w3techs.com/technologies/segmentation/tld-kr-/programming_language", note: "PHP 74.6%, JavaScript 8.7%, Java 8.0%" },
        { label: "W3Techs, .jp 사이트 서버 언어", href: "https://w3techs.com/technologies/segmentation/tld-jp-/programming_language", note: "PHP 83.1%" },
        { label: "W3Techs, .us 사이트 서버 언어", href: "https://w3techs.com/technologies/segmentation/tld-us-/programming_language", note: "PHP 50.2%, Ruby 21.3%" },
        { label: "php.net, History of PHP", href: "https://www.php.net/manual/en/history.php.php", note: "1995년 6월 Personal Home Page Tools 공개" },
        { label: "행정안전부, 전자정부 표준프레임워크", href: "https://mois.go.kr/frt/sub/a06/b04/egovInfra/screen.do", note: "1단계 개발 2008년 11월~2009년 5월" },
        { label: "World Bank, Introduction of eGovFrame", href: "https://thedocs.worldbank.org/en/doc/9d59e160de31e68a93635e025d7b6c8c-0460012022/original/03-Introduction-of-eGovFrame.pdf", note: "Ver. 1.0 2009년 6월" },
        { label: "Wikipedia, Node.js", href: "https://en.wikipedia.org/wiki/Node.js", note: "2009년 첫 공개, 11월 8일 JSConf EU 발표" },
        { label: "Vercel, Next.js 공개 글", href: "https://vercel.com/blog/next", note: "2016년 10월 25일" },
        { label: "Node.js, 지난 버전과 지원 종료", href: "https://nodejs.org/en/about/previous-releases", note: "LTS 버전별 지원 종료일" },
      ]}
    />
  );
}
