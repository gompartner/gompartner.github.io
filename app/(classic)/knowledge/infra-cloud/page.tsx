import type { Metadata } from "next";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { proxyShares } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/infra-cloud";
export const metadata: Metadata = pageMeta({
  title: "서버 인프라: 온프레미스에서 클라우드, 프라이빗 클라우드까지 | 위키",
  description: "회사 전산실과 웹호스팅에서 2006년 AWS 이후 클라우드로, 2020년대 프라이빗 클라우드로 일부를 되가져오는 흐름까지 정리했습니다.",
  path: HREF,
  article: true,
});

// 바뀐 때. 날짜는 출처에서 확인한 것만 적는다
const eras: [string, string, string][] = [
  ["AWS S3, EC2", "2006년 3월 14일, 8월 24일", "저장 공간과 서버를 쓴 만큼 돈 내고 빌리는 방식이 시작됐습니다."],
  ["Windows Azure", "2010년 2월 1일", "마이크로소프트 클라우드 정식 서비스."],
  ["AWS 서울 리전", "2016년 1월", "국내에 데이터센터를 둔 첫 해외 대형 클라우드."],
  ["Azure 한국 리전, 네이버 클라우드 플랫폼", "2017년 2월 21일, 4월 17일", "서울과 부산 리전, 국내 사업자의 퍼블릭 클라우드."],
  ["Cloudflare Workers", "2018년 3월 13일", "서버 없이 전 세계 데이터센터 앞단에서 코드를 실행(엣지)."],
  ["구글 클라우드 서울 리전", "2020년 2월 18일", "국내 첫 구글 클라우드 리전."],
  ["공공 클라우드 전환 계획", "2021년 7월 26일", "행정기관과 공공기관 정보시스템 1만 19개를 2025년까지 클라우드로."],
  ["KT클라우드 분사", "2022년 4월 1일", "통신사 클라우드 사업이 별도 회사로."],
  ["브로드컴의 VMware 인수", "2023년 11월 22일", "영구 라이선스가 끝나고 코어당 구독으로 바뀌어 프라이빗 클라우드 비용이 올랐습니다."],
  ["국정자원 대전센터 화재", "2025년 9월 26일", "센터 안 709개 시스템이 멈추고 12월 30일에 모두 복구."],
];

export default function TrendInfraCloud() {
  return (
    <TrendArticle
      href={HREF}
      crumb="서버 인프라"
      title="서버 인프라: 온프레미스에서 클라우드, 프라이빗 클라우드까지"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "전 세계와 한국"], ["기간", "2006~2026"], ["데이터", "W3Techs"]]}
      lead="2000년대 홈페이지는 회사 전산실 서버나 IDC에 맡긴 서버, 웹호스팅에 올렸습니다. 2006년 AWS 이후 서버를 빌려 쓰는 클라우드로 옮겨 갔습니다. 2020년대에는 비용과 규제 때문에 일부를 다시 자체 서버나 프라이빗 클라우드로 가져오는 흐름이 함께 나타납니다. 사이트 앞단에 Cloudflare를 두는 비율은 2016년 3.9%에서 2026년 11월 30.1%가 됐습니다."
      introTitle="먼저 알아 둘 말"
      intro={
        <dl className="mt-4 grid gap-3 text-[15.5px] leading-[1.7] text-[#2b313b] md:grid-cols-2">
          {[
            ["온프레미스", "회사 전산실이나 IDC(인터넷 데이터센터)에 우리 서버를 직접 두는 방식. 장비를 사고 관리도 직접 합니다."],
            ["웹호스팅", "호스팅 회사 서버 한 대를 여러 고객이 나눠 쓰는 방식. 작은 회사 홈페이지의 기본이었습니다."],
            ["퍼블릭 클라우드", "AWS와 애저, 구글 클라우드, 네이버 클라우드처럼 서버를 쓴 만큼 빌려 쓰는 방식."],
            ["프라이빗 클라우드", "클라우드 방식(가상화, 자동화)을 한 회사나 기관 전용 장비 위에 꾸린 것."],
            ["하이브리드", "자체 서버와 퍼블릭 클라우드를 함께 쓰는 방식. 공공과 금융에 많습니다."],
            ["엣지와 CDN", "전 세계에 흩어진 데이터센터가 방문자 가까이에서 화면을 대신 내주는 앞단. Cloudflare가 대표적입니다."],
          ].map(([b, t]) => (
            <div key={b} className="rounded-[10px] border border-[#e6e9ee] p-4">
              <dt className="font-bold text-[#15171c]">{b}</dt>
              <dd className="mt-1">{t}</dd>
            </div>
          ))}
        </dl>
      }
      chartTitle="사이트 앞단 CDN 비율"
      chart={
        <LineChart
          title="사이트 앞단에 리버스 프록시(CDN)를 둔 비율"
          sub="단위 %, 해마다 1월 1일, 전 세계"
          series={proxyShares}
          max={40}
          source={{ label: "W3Techs, 리버스 프록시 연도별 추이", href: "https://w3techs.com/technologies/history_overview/proxy/all/y", note: "W3Techs 조사 표본 기준, 2026년 11월 22일 Cloudflare 30.1%" }}
        />
      }
      storyTitle="서버를 사던 시대에서 빌리는 시대로, 그리고 다시 나누는 시대로"
      story={[
        "2000년대 회사 홈페이지는 세 군데 중 하나에 있었습니다. 회사 전산실의 서버, IDC에 자리(상면)를 빌려 넣은 우리 서버, 아니면 호스팅 회사 서버를 나눠 쓰는 웹호스팅입니다. 서버는 사는 물건이었습니다. 방문이 몰릴 때를 대비해 처음부터 넉넉한 장비를 사 두었습니다.",
        "2006년 아마존이 S3(3월 14일)와 EC2(8월 24일)를 내놓으면서 서버를 쓴 만큼 돈 내고 빌리는 방식이 시작됐습니다. 국내에는 2016년 1월 AWS 서울 리전이 먼저 열렸습니다. 이어 2017년 2월 애저 한국 리전과 4월 네이버 클라우드 플랫폼, 2020년 2월 구글 클라우드 서울 리전이 차례로 열렸습니다. 데이터를 국내에 둬야 하는 회사도 클라우드를 쓸 수 있게 된 시점입니다.",
        "공공은 계획을 크게 세웠습니다. 행정안전부는 2021년 7월 26일 행정기관과 공공기관 정보시스템 1만 19개를 2025년까지 모두 클라우드로 옮기고 그중 46%는 민간 클라우드를 쓸 것으로 내다봤습니다. 실제로는 2026년 3월 기준 대상 1만 820개 중 42.4%만 전환을 마쳤고 민간 클라우드를 쓰는 시스템은 17.8%였습니다. 목표 시점은 2030년으로 미뤄졌습니다.",
        "2025년 9월 26일 대전 국가정보자원관리원 화재는 한곳에 모아 둔 위험을 보여 줬습니다. 센터 안 709개 시스템이 멈췄고 모두 복구된 것은 95일 뒤인 12월 30일이었습니다. 정부는 2026년 10월 전체 정보시스템 1만 5천여 개를 A1~A4 등급으로 다시 나눴습니다. 가장 중요한 A1은 1시간 안에 복구하도록 다른 센터에 대기 시스템을 두기로 했습니다. 2026년에 50개 시스템을 민간 클라우드로 옮기고 대전센터는 2030년까지 닫습니다.",
        "한편 클라우드에서 다시 나오는 회사도 생겼습니다. 37시그널스(베이스캠프, HEY)는 2023년 클라우드에서 자체 서버로 옮겨 연 320만 달러이던 클라우드 비용을 2024년 130만 달러로 줄였습니다. 5년간 1천만 달러 넘게 아낄 것으로 봤습니다. 반대로 프라이빗 클라우드의 기본 소프트웨어였던 VMware는 2023년 11월 브로드컴에 인수된 뒤 구독 방식으로 바뀌어 비용이 올랐습니다. 어느 한쪽이 정답이라기보다 시스템마다 놓을 곳을 나눠 정하는 하이브리드가 늘고 있습니다.",
        "작은 회사 홈페이지는 또 다른 길로 갔습니다. 서버를 직접 관리하지 않고 화면은 Cloudflare 같은 엣지에서 내주고 필요한 처리만 서버리스 함수로 돌립니다. Cloudflare는 2018년 3월 서버 없이 코드를 돌리는 Workers를 정식으로 열었습니다. 사이트 앞단에 Cloudflare를 둔 비율은 2016년 3.9%에서 2026년 11월 30.1%가 됐습니다. 곰파트너 사이트도 Cloudflare 위에서 돕니다.",
      ]}
      extraTitle="바뀐 때"
      extra={
        <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
          <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
            <thead>
              <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
                <th scope="col" className="px-3 py-2 font-bold">일</th>
                <th scope="col" className="px-3 py-2 font-bold">때</th>
                <th scope="col" className="hidden px-3 py-2 font-bold md:table-cell">무엇이 바뀌었나</th>
              </tr>
            </thead>
            <tbody>
              {eras.map(([n, d, t]) => (
                <tr key={n} className="border-b border-[#eef0f3] align-top last:border-0">
                  <th scope="row" className="px-3 py-2.5 font-bold">{n}</th>
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
      now={[
        "플렉세라의 2025년 클라우드 현황 조사(750여 곳 응답)에서 응답 기업들은 클라우드 작업의 21%를 다시 자체 환경으로 옮겼다고 답했습니다. 클라우드를 떠나는 것이 아니라 비용이 큰 일부를 옮기는 경우가 많습니다.",
        "국내 클라우드 시장은 2024년 매출 9조 2,609억 원으로 한 해 25.2% 늘었습니다(과학기술정보통신부, 2025년 클라우드 산업 실태조사). 같은 조사에서 SaaS 개발사들이 쓰는 서버(IaaS) 비용의 74.4%는 해외 클라우드로 나갔습니다.",
        "공공 시장은 클라우드 보안인증(CSAP)이 기준입니다. 2023년 하 등급이 생겨 논리적 망분리만으로도 공공 시장에 들어올 수 있게 됐습니다. 다만 데이터와 백업, 운영 인력은 국내에 둬야 합니다.",
      ]}
      takeSub="넘겨받은 사이트의 서버가 어디 있는지 모를 때"
      take={[
        { b: "서버 위치와 계정 명의", t: "서버가 웹호스팅과 IDC, 클라우드 중 어디에 있는지 봅니다. 계정과 결제 수단이 누구 명의인지도 확인합니다. 클라우드 계정이 이전 업체 개인 카드로 결제되고 있으면 결제가 끊기는 날 사이트도 멈춥니다." },
        { b: "앞단 서비스(DNS, CDN)", t: "도메인 DNS가 Cloudflare 같은 앞단으로 가 있으면 서버만 넘겨받아서는 인증서와 캐시, 차단 규칙을 바꿀 수 없습니다. 앞단 계정도 같이 받습니다." },
        { b: "백업과 다른 위치의 복구", t: "백업이 같은 서버나 같은 데이터센터에만 있으면 그 센터가 멈출 때 같이 잃습니다. 다른 위치에 사본이 있는지, 실제로 복구해 본 적이 있는지 봅니다." },
        { b: "월 비용 내역", t: "클라우드는 쓴 만큼 나옵니다. 쓰지 않는 서버와 남은 스냅샷, 데이터 전송료가 쌓여 있지 않은지 최근 3개월 청구서를 봅니다." },
      ]}
      sources={[
        { label: "W3Techs, 리버스 프록시 연도별 추이", href: "https://w3techs.com/technologies/history_overview/proxy/all/y", note: "2016~2026년 1월 1일 값, 2026년 11월 22일 Cloudflare 30.1%" },
        { label: "아마존, Amazon Web Services Launches(S3)", href: "https://press.aboutamazon.com/2006/3/amazon-web-services-launches", note: "2006년 3월 14일" },
        { label: "AWS, Amazon EC2 베타 발표", href: "https://aws.amazon.com/about-aws/whats-new/2006/08/24/announcing-amazon-elastic-compute-cloud-amazon-ec2---beta/", note: "2006년 8월 24일" },
        { label: "마이크로소프트, Windows Azure 정식 출시", href: "https://blogs.microsoft.com/blog/2010/02/01/windows-azure-general-availability/", note: "2010년 2월 1일" },
        { label: "AWS, 아시아 태평양(서울) 리전 발표", href: "https://aws.amazon.com/about-aws/whats-new/2016/01/announcing-asia-pacific-seoul-region", note: "2016년 1월" },
        { label: "마이크로소프트, 애저 한국 리전", href: "https://news.microsoft.com/apac/2017/02/21/microsoft-cloud-expands-in-asia-with-microsoft-azure-available-from-korea/", note: "2017년 2월 21일" },
        { label: "머니투데이방송, 네이버 클라우드 플랫폼 출시", href: "https://news.mtn.co.kr/news-detail/2017041716270193167", note: "2017년 4월 17일" },
        { label: "구글 클라우드, 서울 리전 개설", href: "https://cloud.google.com/blog/products/infrastructure/new-gcp-region-in-seoul", note: "2020년 2월 18일" },
        { label: "바이라인네트워크, KT클라우드 출범", href: "https://byline.network/2022/04/1-1164", note: "2022년 4월 1일" },
        { label: "Cloudflare, Workers 정식 출시", href: "https://www.cloudflare.com/press-releases/2018/cloudflare-workers-opens-edge-computing-to-everyone", note: "2018년 3월 13일" },
        { label: "정책브리핑, 행정/공공기관 정보자원 클라우드 전환/통합 추진계획", href: "https://m.korea.kr/news/policyNewsView.do?newsId=148890709", note: "2021년 7월 26일, 1만 19개, 2025년까지, 민간 클라우드 46%" },
        { label: "디지털데일리, 공공 클라우드 전환 2030년으로", href: "https://www.ddaily.co.kr/page/view/2026031117583162282", note: "2026년 3월 11일, 1만 820개 중 42.4%, 민간 17.8%" },
        { label: "경향신문, 국정자원 시스템 전부 복구", href: "https://www.khan.co.kr/article/202512301118001", note: "2025년 12월 30일, 709개 시스템" },
        { label: "지디넷코리아, 국정자원 화재 1년 대책", href: "https://zdnet.co.kr/view/?no=20261002104418", note: "2026년 10월 2일, A1~A4 등급, 민간 클라우드 50개, 2030년 대전센터 폐쇄" },
        { label: "바이라인네트워크, CSAP 하 등급 시행", href: "https://byline.network/2023/01/0131_01/", note: "2023년 1월 31일" },
        { label: "아이뉴스24, 2025년 클라우드 산업 실태조사", href: "https://www.inews24.com/view/1954864", note: "2024년 매출 9조 2,609억 원, IaaS 해외 74.4%" },
        { label: "37시그널스 DHH, 클라우드 탈출 절감액", href: "https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd", note: "2024년 10월 17일, 320만 달러에서 130만 달러" },
        { label: "브로드컴, VMware 인수 완료", href: "https://www.securityinfowatch.com/cybersecurity/information-security/cloud-security-solutions/press-release/53078969/broadcom-completes-acquisition-of-vmware", note: "2023년 11월 22일" },
        { label: "플렉세라, 2025 State of the Cloud", href: "https://www.flexera.com/about-us/press-center/new-flexera-report-finds-84-percent-of-organizations-struggle-to-manage-cloud-spend", note: "2025년 3월 19일, 작업 21% 되가져옴" },
      ]}
    />
  );
}
