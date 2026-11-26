// 11-22 한국 웹 연표(/knowledge/history). 그때그때 쓴 문서를 시대 한 줄기로 엮는다.
// 연표 줄은 각 문서의 연표(timelines.ts)에서 자동으로, 연표가 없는 문서의 날짜는 그 문서 본문과 출처에 있는 것만 손으로 더한다(지어내지 않기).
import { aiHomeRows, aiWebRows, companyRows, personalRows, publicHomeRows, searchOptRows } from "@/data/classic/timelines";
import type { TimelineRow } from "@/components/classic/archive/Timeline";

export const historyTopics = ["홈페이지", "화면", "기술", "보안과 사고", "검색과 AI", "법과 공공"] as const;
export type HistoryTopic = (typeof historyTopics)[number];
/** href는 우리 문서, 우리 문서가 없는 사건은 src(원 출처)로 잇는다 */
export type HistoryEvent = { year: number; when: string; text: string; topic: HistoryTopic; region?: string; href?: string; src?: { label: string; url: string } };

const yearOf = (w: string) => Number(w.match(/(19|20)\d\d/)?.[0] ?? 0);

function from(rows: TimelineRow[], href: string, pick: (text: string, col: "a" | "b") => { topic: HistoryTopic; region?: string } | null): HistoryEvent[] {
  return rows.flatMap((r) =>
    (["a", "b"] as const).flatMap((c) => {
      const text = c === "a" ? r.a : r.b;
      if (!text) return [];
      const p = pick(text, c);
      return p ? [{ year: yearOf(r.when), when: r.when, text, href, ...p }] : [];
    }),
  );
}

const law = /법|접근성|주민등록번호|인증서 제도|KRDS|지침/;
const auto: HistoryEvent[] = [
  ...from(personalRows, "/knowledge/personal-homepage", (_, c) => ({ topic: "홈페이지", region: c === "b" ? "일본" : undefined })),
  ...from(publicHomeRows, "/knowledge/public-homepage", (t) => ({ topic: /화재/.test(t) ? "보안과 사고" : "법과 공공" })),
  // 기업 홈페이지의 법 줄은 공공기관 연표와 겹치는 것(개인정보 보호법, 주민번호)은 빼고 웹 접근성 확대만 남긴다
  ...from(companyRows, "/knowledge/company-homepage", (t) => (/개인정보 보호법|주민등록번호/.test(t) ? null : { topic: law.test(t) ? "법과 공공" : /플래시|모바일/.test(t) ? "화면" : "홈페이지" })),
  ...from(searchOptRows, "/knowledge/search-optimization", (t, c) => (/네이버 블로그 공개/.test(t) ? null : { topic: "검색과 AI", region: c === "a" ? "세계" : undefined })),
  // AI가 쓰는 웹사이트 연표는 검색 최적화와 겹치는 줄(GEO 논문, AI 브리핑, AI 모드)을 뺀다
  ...from(aiWebRows, "/knowledge/ai-readable-web", (t) => (/^GEO|AI 브리핑|^구글 AI 모드/.test(t) ? null : { topic: "검색과 AI", region: "세계" })),
  ...from(aiHomeRows, "/knowledge/ai-and-homepage", (t, c) => ({ topic: c === "b" ? (law.test(t) ? "법과 공공" : "보안과 사고") : "홈페이지", region: /쿠팡|SK텔레콤|개인정보|개인정보보호위원회/.test(t) ? undefined : "세계" })),
];

const hand: HistoryEvent[] = [
  { year: 2004, when: "2004년", text: "제1회 웹어워드코리아. 최고대상은 네이버. 평가 항목은 디자인과 인터랙티비티, 내비게이션 등 7개", topic: "화면", href: "/knowledge/web-award" },
  { year: 2009, when: "2009년", text: "웹어워드에 모바일웹 부문이 생김. 이듬해 모바일앱 최고대상(네이버 웹툰 앱)", topic: "화면", href: "/knowledge/web-award" },
  { year: 2011, when: "2011년", text: "웹어워드 주최 측 화두: 모바일 확산에 따른 웹호환성과 웹표준. 웹표준 이노베이션 대상과 UI/UX 이노베이션 대상 신설", topic: "기술", href: "/knowledge/web-award" },
  { year: 2012, when: "2012년", text: "웹어워드 모바일웹 최고대상이 반응형 웹 디자인 모바일 홈페이지(삼성증권 MPOP)", topic: "화면", href: "/knowledge/web-award" },
  { year: 2024, when: "2024년", text: "웹어워드와 별도로 AI서비스어워드 첫 시상. 이노베이션대상은 혁신대상으로", topic: "검색과 AI", href: "/knowledge/web-award" },
  { year: 1995, when: "1995년 6월", text: "PHP 1.0 공개(Personal Home Page Tools). 값싼 공유 호스팅에서 바로 돌아가는 서버 언어", topic: "기술", region: "세계", href: "/knowledge/server-language" },
  { year: 2006, when: "2006년", text: "AWS S3(3월)와 EC2(8월) 시작. 서버를 쓴 만큼 돈 내고 빌리는 방식", topic: "기술", region: "세계", href: "/knowledge/infra-cloud" },
  { year: 2009, when: "2009년", text: "한국과 일본, 미국 모두 PC 브라우저의 절반 넘게 인터넷 익스플로러(IE)", topic: "기술", href: "/knowledge/browser" },
  { year: 2009, when: "2009년", text: "PC 화면의 30% 안팎이 1024x768. 본문 폭 980px 고정 화면이 흔함", topic: "화면", href: "/knowledge/screen-size" },
  { year: 2009, when: "2009년 11월", text: "Node.js 발표(JSConf EU). 서버에서도 JavaScript", topic: "기술", region: "세계", href: "/knowledge/server-language" },
  { year: 2011, when: "2011년", text: "Bootstrap 공개. 정해진 부품 틀로 화면을 짜는 방식이 퍼짐", topic: "화면", region: "세계", href: "/knowledge/design-styles" },
  { year: 2012, when: "2012년", text: "전체 접속 중 휴대폰 비율 한국 24%(미국 10%, 일본 8%)", topic: "화면", href: "/knowledge/mobile-screen" },
  { year: 2013, when: "2013년", text: "iOS 7과 이듬해 Material Design. 광택과 입체에서 평평한 화면으로", topic: "화면", region: "세계", href: "/knowledge/design-styles" },
  { year: 2015, when: "2015년", text: "PC 브라우저 중 IE 비율 한국 68%, 미국 28%. 공인인증서와 ActiveX 때문에 한국만 오래 남음", topic: "기술", href: "/knowledge/browser" },
  { year: 2015, when: "2015년", text: "한국 PC 화면 1920x1080이 54%(일본 24%, 미국 15%). 와이드 배너가 일찍 자리 잡음", topic: "화면", href: "/knowledge/screen-size" },
  { year: 2016, when: "2016년 1월", text: "AWS 서울 리전. 국내에 데이터센터를 둔 첫 해외 대형 클라우드", topic: "기술", href: "/knowledge/infra-cloud" },
  { year: 2016, when: "2016년 10월", text: "Next.js 공개. 화면과 서버 처리를 한 프로젝트에서", topic: "기술", region: "세계", href: "/knowledge/server-language" },
  { year: 2017, when: "2017년 7월", text: "Adobe가 2020년 말 Flash Player 업데이트와 배포 중단 발표", topic: "화면", region: "세계", href: "/knowledge/flash-jquery" },
  { year: 2018, when: "2018년 7월", text: "크롬 68부터 https가 아닌 모든 페이지에 주의 요함 표시", topic: "보안과 사고", region: "세계", href: "/knowledge/https" },
  { year: 2018, when: "2018년 12월", text: "PHP 5.6 공식 지원 종료(12월 31일). 이후 7.4, 8.0, 8.1이 차례로 종료", topic: "보안과 사고", region: "세계", href: "/knowledge/php" },
  { year: 2021, when: "2021년 7월", text: "행정기관과 공공기관 정보시스템 1만 19개를 2025년까지 클라우드로 옮기는 계획", topic: "법과 공공", href: "/knowledge/infra-cloud" },
  { year: 2022, when: "2022년", text: "인터넷 익스플로러 지원 종료", topic: "기술", region: "세계", href: "/knowledge/browser" },
];


// 11-22 조사 보강: 우리 문서가 아직 없는 시대의 빈 곳. 1차 자료나 언론 기사로 날짜를 확인한 것만(엇갈리는 것은 뺌)
const ev = (year: number, when: string, text: string, topic: HistoryTopic, label: string, url: string, region?: string): HistoryEvent => ({ year, when, text, topic, region, src: { label, url } });
const sourced: HistoryEvent[] = [
  ev(1997, "1997년 5월", "다음, 무료 전자우편 한메일넷 시작", "홈페이지", "다음 사례 연구(KoreaScience)", "https://koreascience.kr/article/JAKO200463369808920.pdf"),
  ev(1998, "1998년 4월", "옥션, 인터넷 경매 서비스 시작", "홈페이지", "전자신문", "https://m.etnews.com/199909110033"),
  ev(1999, "1999년", "다음 카페(카페한메일) 오픈. 2주 만에 동호회 2,200개", "홈페이지", "다음커뮤니케이션 보도자료", "https://www.kakaocorp.com/page/detail/5247"),
  ev(2000, "2000년 11월", "세이클럽, 유료 아바타 서비스 시작(11월 7일)", "홈페이지", "디지털타임스", "https://www.dt.co.kr/article/10143777"),
  ev(2002, "2002년 3월", "전자상거래소비자보호법 제정(법률 제6687호)", "법과 공공", "국가법령정보센터", "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=140566"),
  ev(2002, "2002년 10월", "네이버 지식iN 출시(10월 7일). 검색과 묻고 답하기를 결합", "검색과 AI", "네이버 보도자료", "https://navercorp.com/media/pressReleasesDetail?seq=30903"),
  ev(2002, "2002년 11월", "프리챌, 커뮤니티 전면 유료화(11월 14일). 회원 이탈로 2003년 6월 다시 무료화", "홈페이지", "프리챌 유료화 전략 연구(KoreaScience)", "https://koreascience.kr/article/JAKO200416637999092.page"),
  ev(2003, "2003년 8월", "한글.kr 도입(8월 19일). 상표권자 우선 등록부터", "법과 공공", "KISA 발표자료", "https://new.icann.org/en/news/presentations/ahngu-idn-kl-21jul04-en.pdf"),
  ev(2003, "2003년 10월", "인터파크 구스닥, 이름을 G마켓으로 변경", "홈페이지", "아이뉴스24", "https://www.inews24.com/view/100310"),
  ev(2006, "2006년 9월", "2단계 .kr 도메인 개방, 정부기관부터 등록", "법과 공공", "전자신문", "https://m.etnews.com/200611100034"),
  ev(2008, "2008년 6월", "CSS Design Korea, 제1회 웹표준 경진대회 시상", "기술", "전자신문", "https://m.etnews.com/200806190202"),
  ev(2008, "2008년 10월", "네이버, 한글날에 나눔고딕과 나눔명조 무료 배포. 무료 한글 웹 글꼴의 시작", "화면", "NHN 보도자료", "https://navercorp.com/media/pressReleasesDetail?seq=27958"),
  ev(2011, "2011년 10월", ".한국 도메인 일반 등록 시작(10월 6일)", "법과 공공", "YTN", "https://www.ytn.co.kr/_ln/0102_201109250604242580"),
  ev(2012, "2012년 12월", "야후코리아, 15년 만에 국내 서비스 종료(12월 31일)", "검색과 AI", "보안뉴스", "https://m.boannews.com/html/detail.html?idx=34275"),
  ev(2013, "2013년 2월", "프리챌 커뮤니티 서비스 종료(2월 18일)", "홈페이지", "경향 위클리", "https://weekly.khan.co.kr/article/201302251623051"),
  ev(2014, "2014년 5월", "30만 원 이상 카드 결제의 공인인증서 의무 폐지(5월 20일)", "법과 공공", "오마이뉴스", "https://m.ohmynews.com/NWS_Web/Mobile/at_pg.aspx?CNTN_CD=A0001993271"),
  ev(2014, "2014년 7월", "구글과 어도비, 본고딕(Noto Sans CJK) 공개(7월 15일)", "화면", "구글 개발자 블로그", "https://developers-kr.googleblog.com/2014/07/cjkfont.html", "세계"),
  ev(2014, "2014년 9월", "카카오페이 출시(9월 5일). 간편결제의 시작", "기술", "카카오 보도자료", "https://www.kakaocorp.com/page/detail/7577"),
  ev(2014, "2014년 10월", "W3C, HTML5를 정식 권고안으로 발표(10월 28일)", "기술", "W3C", "https://www.w3.org/2014/10/html5-rec.html", "세계"),
  ev(2015, "2015년 3월", "금융위원회, 전자금융 공인인증서 의무 사용 폐지 의결(3월 18일)", "법과 공공", "법률신문", "https://www.lawtimes.co.kr/news/articleView.html?idxno=91892"),
  ev(2015, "2015년 6월", "네이버페이 정식 출시(2009년 체크아웃 기반)", "기술", "한국경제", "https://www.hankyung.com/amp/201606291558g"),
  ev(2017, "2017년 4월", "본명조(Source Han Serif) 공개(4월 3일)", "화면", "어도비 Typekit 블로그", "https://blog.typekit.com/2017/04/03/introducing-source-han-serif", "세계"),
  ev(2025, "2025년 6월", "네이버 모두(modoo) 무료 홈페이지 서비스 종료", "홈페이지", "전자신문", "https://m.etnews.com/20241226000326"),
];

const monthOf = (w: string) => Number(w.match(/(\d{1,2})월/)?.[1] ?? 0);
export const historyEvents: HistoryEvent[] = [...auto, ...hand, ...sourced].sort((a, b) => a.year - b.year || monthOf(a.when) - monthOf(b.when));

/** 시대 네 장. 이야기는 연표와 각 문서에 출처가 있는 사실로만 쓰고, 해석은 "~고 봅니다, ~로 읽힙니다"처럼 문장 끝으로 밝힌다(11-22 "곰파트너가 보기에" 빼기) */
export const eras = [
  {
    id: "e1", from: 1994, to: 2002, title: "무료 계정과 게시판",
    story: [
      "인터넷 인구가 400만 명이던 1999년 무렵 개인 홈페이지는 포털과 PC통신 회사가 내준 무료 공간에 나모 웹에디터로 만든 화면을 FTP로 올리는 일이었습니다. 게시판은 Perl CGI 테크노트나 PHP 제로보드를 받아 달았습니다.",
      "포털이 이 판을 키웠습니다. 1997년 다음 한메일, 1999년 다음 카페가 열렸고 카페는 두 주 만에 동호회 2,200개가 생겼습니다. 1998년에는 옥션이 경매를 시작해 개인이 웹에서 물건을 사고팔기 시작했습니다.",
      "공공에서는 1999년 전자서명법으로 공인인증서가 시작됐습니다. 2001년 전자정부법과 2002년 전자정부 출범으로 민원이 온라인으로 옮겨 갔습니다. 검색은 사람이 사이트를 주제별로 분류해 올리는 디렉터리 등록이 먼저였습니다.",
      "이때 자리 잡은 게시판 중심 사이트와 공인인증서 로그인이 이후 10년 넘게 한국 웹의 모양을 정했다고 봅니다.",
    ],
    read: ["/knowledge/personal-homepage", "/knowledge/server-language", "/knowledge/public-homepage", "/knowledge/search-optimization"],
  },
  {
    id: "e2", from: 2003, to: 2009, title: "포털과 블로그, 플래시",
    story: [
      "2001년 미니홈피, 2003년 네이버 블로그가 열리면서 개인은 직접 만들기보다 서비스 안에 공간을 여는 쪽으로 옮겼습니다. 회사 홈페이지는 회사 소개서 순서의 메뉴에 플래시 인트로가 기본이었습니다. 1024x768 화면에 맞춰 본문 폭을 980px 안팎으로 고정했습니다.",
      "2002년 네이버 지식iN이 나오며 검색은 사람이 묻고 답한 글을 찾는 일이 됐습니다. 같은 해 프리챌이 커뮤니티를 유료로 바꿨다가 이듬해 되돌렸습니다. 2003년에는 G마켓과 한글.kr이 이어졌습니다. 2008년 네이버 나눔고딕이 무료로 풀리며 한글 웹 글꼴의 선택지가 처음 생겼습니다.",
      "2009년에는 PC 브라우저의 절반 넘게 인터넷 익스플로러였습니다. 같은 해 공공기관부터 웹 접근성 의무가 시작됐고 6월 전자정부 표준프레임워크가 나오며 공공 시스템은 Java로 된 같은 틀 위로 모였습니다.",
      "이 시기에 만든 사이트를 넘겨받으면 플래시와 IE 전용 코드, 오래된 게시판이 함께 남아 있는 경우가 많습니다.",
    ],
    read: ["/knowledge/company-homepage", "/knowledge/flash-jquery", "/knowledge/browser", "/knowledge/screen-size"],
  },
  {
    id: "e3", from: 2010, to: 2016, title: "휴대폰과 법",
    story: [
      "2009년 11월 아이폰이 들어오고 2012년에는 한국 전체 접속의 24%가 휴대폰이었습니다. 미국 10%, 일본 8%보다 빨라서 m. 전용 사이트를 따로 만드는 회사가 늘었습니다.",
      "2011년 개인정보 보호법과 2013년 모든 기업으로 넓어진 웹 접근성 의무, 2014년 주민등록번호 수집 금지가 이어지며 홈페이지에 법이 들어왔습니다. 화면은 2013년 iOS 7과 2014년 Material Design 전후로 평평해졌습니다. 한국은 2015년 1920x1080 모니터가 54%가 되며 와이드 화면으로 먼저 넘어갔습니다.",
      "결제도 이때 바뀌었습니다. 2014년 30만 원 이상 카드 결제의 공인인증서 의무가 풀리고 같은 해 카카오페이, 2015년 네이버페이가 나왔습니다. 2014년 W3C가 HTML5를 정식 권고하고 본고딕이 공개되면서 플래시와 이미지 글자를 대신할 도구가 갖춰졌습니다.",
      "검색에서는 2015년 네이버 C-Rank와 구글 모바일 친화 업데이트가 같은 해에 나왔습니다. 이때부터 홈페이지는 한 번 만들고 끝나는 것이 아니라 법과 기기에 맞춰 계속 고치는 것이 됐다고 봅니다.",
    ],
    read: ["/knowledge/mobile-screen", "/knowledge/web-award", "/knowledge/design-styles", "/knowledge/app", "/knowledge/page-weight"],
  },
  {
    id: "e4", from: 2017, to: 2026, title: "클라우드와 빌더, AI",
    story: [
      "2017년 Adobe가 플래시 종료를 예고했고 2020년 12월 31일 지원이 끝났습니다. 같은 달 공인인증서 제도도 폐지됐습니다. 2018년 크롬 68부터 http 페이지에 주의 요함이 붙었고 서버는 클라우드와 앞단 서비스로 옮겨 갔습니다.",
      "2024년 KRDS 공개와 2025년 국가정보자원관리원 화재가 공공 홈페이지를 다시 흔들었습니다. 2025년부터는 AI 빌더가 사이트를 대신 만들고 같은 시기 AI로 만든 서비스의 유출 사고와 대형 개인정보 유출 과징금이 이어졌습니다. 검색은 구글 AI 개요(2024년)와 네이버 AI 브리핑(2025년)으로 답을 바로 보여 주는 쪽으로 바뀌는 중입니다.",
      "지금 유지보수의 중심은 고장 수리보다 지원 종료일, 계정과 키, AI가 가져다 쓸 원본을 챙기는 일입니다.",
    ],
    read: ["/knowledge/https", "/knowledge/php", "/knowledge/infra-cloud", "/knowledge/cms", "/knowledge/ai-and-homepage", "/knowledge/ai-readable-web"],
  },
] as const;
