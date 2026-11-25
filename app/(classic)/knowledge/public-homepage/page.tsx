import type { Metadata } from "next";
import { Timeline } from "@/components/classic/archive/Timeline";
import { publicHomeRows } from "@/data/classic/timelines";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/public-homepage";
export const metadata: Metadata = pageMeta({
  title: "공공기관 홈페이지: 전자정부법에서 KRDS, 국정자원 화재까지 | 위키",
  description: "공공기관 홈페이지는 법과 지침을 따라 바뀌었습니다. 2001년 전자정부법, 2009년 웹 접근성 의무와 전자정부 표준프레임워크, 2020년 공인인증서 제도 폐지, 2024년 범정부 디자인 시스템(KRDS). 2025년 9월 국정자원 화재로 시스템 647개가 멈췄습니다.",
  path: HREF,
  article: true,
});

// 공공기관 홈페이지를 바꾼 법, 지침, 사건. 날짜는 출처에서 확인한 것만 적는다
const rows = publicHomeRows;

export default function TrendPublicHomepage() {
  return (
    <TrendArticle
      href={HREF}
      crumb="공공기관 홈페이지"
      title="공공기관 홈페이지"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "한국 공공기관"], ["기간", "1996~2026"], ["데이터", "법령, 정부 발표, 기사"]]}
      lead="공공기관 홈페이지는 유행보다 법과 지침을 따라 바뀌었습니다. 2001년 전자정부법, 2009년 웹 접근성 의무와 전자정부 표준프레임워크, 2020년 공인인증서 제도 폐지, 2024년 범정부 디자인 시스템(KRDS)이 차례로 화면과 구조를 바꿨습니다. 2025년 9월에는 국가정보자원관리원 화재로 정부 업무시스템 647개가 한꺼번에 멈췄습니다."
      chartTitle="공공기관 홈페이지 연표"
      chart={<Timeline rows={rows} colA="법, 지침, 사건" />}
      storyTitle="법이 먼저 바뀌고, 화면이 따라갔다"
      story={[
        "공공기관 홈페이지는 민간보다 법과 지침의 영향을 크게 받습니다. 2001년 전자정부법이 만들어지고 2002년 전자정부 출범이 발표된 뒤 민원과 행정 업무가 온라인으로 옮겨 왔고, 기관마다 홈페이지와 민원 시스템을 갖추게 됐습니다.",
        "1999년 전자서명법으로 생긴 공인인증서는 공공 웹사이트 로그인의 기본이었습니다. 인증서를 쓰려면 보안 프로그램을 설치해야 했고, 이것이 한국 공공 사이트가 IE와 ActiveX를 오래 떠나지 못한 이유 중 하나였습니다. 2020년 12월 공인인증서 제도가 폐지되면서 민간 인증서와 간편 인증으로 바뀌었습니다.",
        "2009년부터 공공기관에 웹 접근성 의무가 적용됐습니다. 같은 해 전자정부 표준프레임워크가 나와 공공 시스템은 대부분 Java, Spring 위의 같은 틀로 만들어졌습니다. 개인정보 보호법(2011년)과 주민등록번호 수집 금지(2014년)는 회원가입과 민원 신청 화면을 바꿨습니다.",
        "2024년 4월 행정안전부가 범정부 UI/UX 디자인 시스템(KRDS)을 내놓으면서, 이제는 글자 크기, 색 대비, 버튼과 입력 칸 모양까지 정부 기준이 생겼습니다. 기관마다 따로 만들던 화면이 같은 부품으로 모이고 있습니다.",
        "2025년 9월 26일 대전 국가정보자원관리원 화재로 정부 업무시스템 647개가 멈췄고, 정부24, 국민신문고, 우체국 같은 서비스가 차질을 빚었습니다. 한곳에 모아 둔 시스템이 다른 곳에서 바로 이어받지 못했다는 점이 드러나면서, 이중화와 백업, 복구 순서가 공공 사이트 운영의 과제로 다시 올라왔습니다.",
      ]}
      now={[
        "2025년 1월 KRDS가 범정부 UI/UX 디자인 시스템으로 서비스를 시작했습니다. 새로 만들거나 고치는 공공 사이트는 이 부품과 기준을 따르는 쪽으로 가고 있습니다.",
        "화재 1년이 지난 2026년 10월, 행정안전부는 공공 정보시스템 약 1만 5천 개를 국민에게 미치는 영향에 따라 네 등급으로 다시 나누고, 핵심 시스템 13개의 재해복구 체계를 2027년 상반기까지 갖추기로 했습니다. 대전센터는 2030년까지 닫고, 시설을 고치기 어려운 곳은 민간 클라우드로 옮기도록 지원합니다.",
      ]}
      takeSub="공공기관 홈페이지 유지보수를 맡았다면"
      take={[
        { b: "접근성 지침 버전과 인증 기간", t: "지금 기준은 한국형 웹 콘텐츠 접근성 지침 2.2입니다. 웹 접근성 품질 인증 마크가 붙어 있다면 유효기간이 지났는지 함께 봅니다." },
        { b: "표준프레임워크와 Java 버전", t: "전자정부 표준프레임워크 버전과 JDK 버전, 빌드 방법을 문서로 받았는지 확인합니다. 옛 버전은 보안 패치를 받기 어렵습니다." },
        { b: "남아 있는 설치형 보안 프로그램", t: "로그인, 민원 신청, 파일 내려받기에서 실행파일 설치를 요구하는 곳이 남아 있는지 봅니다. 공인인증서 폐지 뒤에도 그대로인 화면이 있습니다." },
        { b: "백업 위치와 복구 순서", t: "서버와 백업이 같은 건물, 같은 장비에 있지 않은지, 복구 순서가 문서로 있는지, 실제로 복구해 본 적이 있는지 확인합니다." },
      ]}
      sources={[
        { label: "국가기록원, 전자정부 정책 기록", href: "https://theme.archives.go.kr/next/govpo/detail.do?policySeq=110", note: "1996년 6월 정보화촉진기본계획, 2001년 3월 전자정부법 제정, 2002년 11월 13일 전자정부 출범" },
        { label: "보안뉴스, 10일부터 공인인증서 폐지(2020년 12월 9일)", href: "https://www.boannews.com/news/articleView.html?idxno=93269", note: "12월 10일부터 21년간 이어진 공인전자서명 제도 폐지" },
        { label: "ZDNet Korea, 웹 접근성 의무 확대(2011년 12월 30일)", href: "https://zdnet.co.kr/view/?no=20111230095801", note: "2009년 공공기관부터 단계 적용" },
        { label: "행정안전부, 전자정부 표준프레임워크", href: "https://mois.go.kr/frt/sub/a06/b04/egovInfra/screen.do", note: "공공 정보시스템 개발 표준" },
        { label: "World Bank, Introduction of eGovFrame", href: "https://thedocs.worldbank.org/en/doc/9d59e160de31e68a93635e025d7b6c8c-0460012022/original/03-Introduction-of-eGovFrame.pdf", note: "Ver. 1.0 2009년 6월" },
        { label: "법무법인 지평, 개인정보 보호법 시행 안내(2011년 9월)", href: "https://jipyong.com/newsletter/real_estate/17_201109/data/issue.html", note: "2011년 9월 30일 시행" },
        { label: "서울신문, 8월부터 주민번호 수집 못한다(2014년 1월 21일)", href: "https://m.go.seoul.co.kr/news/2014/01/21/20140121012001", note: "8월 7일부터 원칙 금지" },
        { label: "서울특별시, 행정분야 누리집 접근성 기준", href: "https://news.seoul.go.kr/gov/archives/47485", note: "한국형 웹 콘텐츠 접근성 지침 2.2(방송통신표준심의회, 2022년 12월 28일)" },
        { label: "디자인 나침반, KRDS: 대한민국 정부 디자인 시스템(2024년 4월 17일)", href: "https://designcompass.org/2024/04/17/krds/", note: "행정안전부 디지털 정부서비스 UI/UX 가이드라인 배포" },
        { label: "KRDS 공식 누리집", href: "https://www.krds.go.kr/html/site/index.html", note: "범정부 UI/UX 디자인 시스템" },
        { label: "뉴시스, 국정자원 화재(2025년 9월 27일)", href: "https://mobile.newsis.com/view/NISX20250927_0003346588", note: "9월 26일 화재, 대전 국정자원 정부 업무시스템 647개 중단" },
        { label: "뉴시스, 한 곳의 화재로 정부서비스 다 멈췄다(2025년 9월 27일)", href: "https://www.newsis.com/view/NISX20250927_0003346515", note: "국민신문고 등 이용 제한, 우체국 금융과 우편 우선 복구" },
        { label: "바이라인네트워크, 국정자원 화재로 정부 서비스 마비(2025년 9월 27일)", href: "https://byline.network/2025/09/26-501/", note: "정부24, 우체국, 온나라시스템 등 중단" },
        { label: "디자인 나침반, 정부 UI/UX 디자인 시스템 개시(2025년 1월 22일)", href: "https://designcompass.org/2025/01/22/krds-start/", note: "2024년 4월 공개된 KRDS가 서비스 개시" },
        { label: "ZDNet Korea, 국정자원 화재 1년(2026년 10월 2일)", href: "https://zdnet.co.kr/view/?no=20261002104418", note: "시스템 약 1만 5천 개 재분류, 핵심 13개 재해복구, 대전센터 2030년까지 폐쇄" },
      ]}
    />
  );
}
