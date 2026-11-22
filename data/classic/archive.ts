// 곰파트너 웹 지식(/knowledge, 11-21 아카이브에서 이름과 주소를 바꿈). 11-21 사용자: 컨플루언스처럼 정돈된 문서 공간, 실적 대신 쌓인 기록을 보여 준다.
// 틀은 문서 사이트형(왼쪽 분류 트리, 본문, 오른쪽 목차). 우리 색깔은 "인수 시 확인 사항", "이렇게 요청하세요", 같은 그림체 와이어프레임, 확인일.
// 원래 주소가 있는 자료(인사이트 /insight, 무료 도구 /tools, 점검표 /jaryo/<id>)는 주소를 그대로 두고 트리에서 잇는다.
// 문서가 없는 분류(시안 작업 등)는 첫 문서가 생길 때 sections에 더한다. 빈 칸, 준비 중 표시는 두지 않는다.

import { termGroups, type TermGroup } from "@/data/classic/glossary";
import { insights } from "@/data/classic/insights";
import { jaryo } from "@/data/classic/jaryo";
import { tools } from "@/data/classic/tools";
import { datasets } from "@/data/classic/trendData";

/** 트렌드 문서(만든 것만). 새 장을 쓰면 여기에 더한다 */
export type TrendDoc = { href: string; title: string; desc: string };
/** 디자인 트렌드: 새 기기(휴대폰, 태블릿, 큰 모니터)가 생길 때마다 화면 크기, 배치, 모양이 어떻게 바뀌었나. 문서마다 독립(번호, 연재 없음) */
export const designDocs: TrendDoc[] = [
  { href: "/knowledge/web-award", title: "웹어워드 수상작으로 본 한국 웹 디자인 22년", desc: "웹어워드코리아 2004~2025 최고대상과 새로 생긴 부문. 브랜드 프로모션에서 모바일웹, 웹표준, 반응형, 소셜, AI 서비스로 옮겨 간 심사 축." },
  { href: "/knowledge/design-styles", title: "디자인 흐름: 입체, 플랫, 카드, 벤토", desc: "웹 디자인 흐름을 바꾼 날짜(Bootstrap, iOS 7, Material Design, CSS Grid)와 시대별 첫 화면, 실제 사례." },
  { href: "/knowledge/mobile-screen", title: "한국이 모바일 화면으로 먼저 넘어간 길", desc: "전체 접속 중 모바일 비율, 한국 일본 미국 2009~2025. m. 전용 사이트, PC 화면 그대로, 반응형으로 갈린 길." },
  { href: "/knowledge/screen-size", title: "화면 크기와 해상도", desc: "PC 화면 해상도 비율, 한국 일본 미국 2009~2025. 고정 폭 980px이 사라진 이유." },
];
/** 기술 트렌드: 브라우저, 보안, 언어, 도구, 무게처럼 화면 뒤에서 바뀐 것. 문서마다 독립 */
export const techDocs: TrendDoc[] = [
  { href: "/knowledge/history", title: "한국 웹 30년: 무료 계정에서 AI 빌더까지", desc: "한국 웹 변천사를 시대 네 장(무료 계정과 게시판, 포털과 플래시, 휴대폰과 법, 클라우드와 AI)으로 엮은 연표와 이야기." },
  { href: "/knowledge/browser", title: "브라우저 호환", desc: "PC 브라우저 중 IE 비율, 한국 일본 미국 2009~2025. 공인인증서, ActiveX, 2020년 전자서명법 개정, 2022년 IE 지원 종료." },
  { href: "/knowledge/https", title: "https와 인증서", desc: "크롬에서 https로 열린 페이지 비율, 일본 미국 2015~2026. 2018년 크롬 68 주의 요함 표시." },
  { href: "/knowledge/flash-jquery", title: "플래시와 jQuery", desc: "Flash, jQuery 사용 비율 2015~2025. 2020년 말 지원 종료, 2019년 국내 500대 사이트 28.4%가 플래시 사용." },
  { href: "/knowledge/cms", title: "만드는 도구(CMS) 비교: 카페24, WordPress, 아임웹", desc: "CMS란 무엇인지, 설치형과 임대형의 차이, 한국어, 일본어, 영어 사이트의 만드는 도구 점유율 상위 3." },
  { href: "/knowledge/page-weight", title: "페이지 무게와 속도", desc: "페이지 한 장 용량 중앙값, PC 2011~2026 6배, 모바일 9배." },
  { href: "/knowledge/app", title: "앱: 안드로이드와 아이폰", desc: "휴대폰 OS 중 아이폰 비율, 한국 일본 미국 2012~2025. 앱 인수 시 계정, 서명 키, 스토어 요구." },
  { href: "/knowledge/search-optimization", title: "검색 최적화의 역사: 디렉터리 등록에서 SEO, GEO까지", desc: "야후 디렉터리, 메타 키워드, PageRank, 판다와 펭귄, 모바일, 네이버 C-Rank, AI 개요와 AI 브리핑. 시대마다 검색엔진이 본 것과 꼼수." },
  { href: "/knowledge/ai-readable-web", title: "AI가 쓰는 웹사이트: UX 다음의 AX, SEO 다음의 GEO", desc: "AX, GEO, 제로 클릭, llms.txt, MCP, NLWeb, 에이전트 커머스. AI 요약이 뜨면 링크 클릭 15%에서 8%로, 홈페이지가 준비할 것." },
  { href: "/knowledge/ai-and-homepage", title: "AI 도구와 홈페이지: 산업 변화, 보안, 유출 사례, 앞으로", desc: "AI 빌더의 성장, AI가 만든 코드의 보안, Tea, Moltbook, 쿠팡, SK텔레콤 유출 사례, 개정 개인정보 보호법, 구글 2027 보안 전망." },
  { href: "/knowledge/company-homepage", title: "기업 홈페이지: 회사 소개서 화면에서 플래시, 모바일, 빌더까지", desc: "\"홈페이지 제작\" 검색 관심도 2004~2026, 한국 기업 홈페이지 연표. 플래시, m. 사이트, 개인정보 보호법, 웹 접근성, 빌더." },
  { href: "/knowledge/public-homepage", title: "공공기관 홈페이지: 전자정부법에서 KRDS, 국정자원 화재까지", desc: "공공기관 홈페이지 연표 1996~2025. 전자정부법, 웹 접근성 의무, 표준프레임워크, 공인인증서 폐지, KRDS, 국정자원 화재." },
  { href: "/knowledge/personal-homepage", title: "개인 홈페이지: 무료 계정과 CGI 게시판에서 미니홈피, 블로그까지", desc: "한국과 일본 연표 1997~2019. 무료 계정, 나모 웹에디터, 테크노트와 제로보드, KENT WEB 무료 CGI, 미니홈피, 블로그, 지오시티즈 종료." },
  { href: "/knowledge/server-language", title: "개발 언어: Perl CGI에서 Next.js까지", desc: "서버 언어 비율 2015~2026(PHP, ASP.NET, Java, Node.js). Perl CGI 게시판, PHP 공유 호스팅, 공공의 Java, 화면과 서버를 함께 쓰는 Next.js." },
  { href: "/knowledge/php", title: "PHP 버전과 유지보수", desc: "PHP 사이트 중 버전 비율 2015~2026, 공식 지원 종료일, 서버 앞단 CDN의 확산." },
  { href: "/knowledge/infra-cloud", title: "서버 인프라: 온프레미스에서 클라우드, 프라이빗 클라우드까지", desc: "사이트 앞단 CDN 비율 2016~2026. 전산실과 웹호스팅, 2006년 AWS, 국내 리전, 공공 클라우드 전환 2030년 연기, 국정자원 화재, 클라우드 탈출과 하이브리드." },
];
export const trendDocs: TrendDoc[] = [...designDocs, ...techDocs];


/** 용어 묶음 주소 이름. 묶음 id(g01...)는 바꾸지 않고 주소만 읽기 쉽게 둔다 */
export const termSlugs: Record<string, string> = {
  g01: "calendar", g02: "time-picker", g03: "date-range", g04: "popup", g05: "notification", g06: "tooltip",
  g07: "menu", g08: "tabs", g09: "pagination", g10: "select", g11: "input", g12: "button",
  g13: "accordion-carousel", g14: "list", g15: "loading", g16: "page-structure", g17: "floating", g18: "layout",
  g19: "photo-view", g20: "photo-video", g21: "product-detail", g22: "cart-checkout", g23: "login", g24: "signup",
  g25: "search-results", g26: "dashboard", g27: "board", g28: "editor", g29: "map-address", g30: "booking-schedule",
  g31: "ui-states", g32: "comment-share", g33: "spacing", g34: "responsive", g35: "typography", g36: "image-ratio",
  g37: "public-home", g38: "public-required", g39: "accessibility", g40: "online-application", g41: "company-about", g42: "trust",
  g43: "careers", go1: "domain-server", go2: "admin-edit", go3: "contract-handover", go4: "search-records",
};

export const termHref = (g: TermGroup) => `/knowledge/terms/${termSlugs[g.id]}`;
export const groupBySlug = (slug: string) => termGroups.find((g) => termSlugs[g.id] === slug);

/** 묶음 제목에서 "종류 6가지" 같은 꼬리를 빼고 짧게(트리, 목록용) */
export const shortTitle = (g: TermGroup) => g.title.replace(/ ?(UI )?(종류 )?\d+가지$/, (m) => (m.includes("UI") ? " UI" : "")).trim();

/** 인수 시 확인 사항. 남이 만든 사이트에서 그 부품을 넘겨받았을 때 먼저 확인할 것. 확인한 묶음만 적는다 */
export const takeover: Record<string, { b: string; t: string }[]> = {
  g01: [
    { b: "달력 부품의 버전", t: "오래된 jQuery UI 달력은 보안 경고가 남은 버전이 많습니다. 소스에서 jquery-ui 파일 이름의 버전 숫자를 먼저 봅니다." },
    { b: "공휴일과 휴무일이 적힌 곳", t: "코드 안에 날짜를 직접 적어 두었다면 해마다 누군가 고쳐야 합니다. 내년 공휴일이 들어가 있는지 확인합니다." },
    { b: "마감 시간 기준", t: "\"당일 18시 마감\"이 서버 시간 기준인지 휴대폰 시간 기준인지에 따라 마감 뒤 예약이 들어올 수 있습니다." },
    { b: "휴대폰에서 달력이 잘리는지", t: "PC용 팝오버 달력을 그대로 쓰면 작은 화면에서 오른쪽이 잘립니다. 휴대폰은 바텀시트로 바꾸는 경우가 많습니다." },
  ],
  g04: [
    { b: "\"오늘 하루 보지 않기\"가 동작하는지", t: "쿠키 이름이 팝업마다 같으면 새 팝업도 함께 숨겨집니다. 팝업을 바꿀 때 쿠키 이름도 바뀌는지 봅니다." },
    { b: "휴대폰에서 닫기 버튼이 보이는지", t: "PC 크기로 만든 팝업은 휴대폰 화면 밖으로 넘쳐 닫기 버튼이 가려집니다. 휴대폰으로 직접 열어 닫아 봅니다." },
    { b: "글자를 이미지로만 넣었는지", t: "공지 내용이 이미지에만 있으면 화면 낭독기가 읽지 못합니다. 대체 텍스트에 같은 내용이 들어 있는지 확인합니다." },
    { b: "새 창 팝업을 쓰는지", t: "브라우저가 새 창 팝업을 막는 경우가 많아 공지가 아예 안 보일 수 있습니다. 레이어 팝업으로 바꾸는 것이 보통입니다." },
  ],
  g07: [
    { b: "메뉴를 어디서 바꾸는지", t: "관리자 화면에서 바꾸는지, 코드에 직접 적혀 있는지 확인합니다. 코드에 있으면 메뉴 하나 바꿀 때도 개발자가 필요합니다." },
    { b: "휴대폰에서 하위 메뉴가 열리는지", t: "마우스를 올려야 열리는 메가 메뉴는 터치 화면에서 안 열리는 경우가 있습니다." },
    { b: "끊긴 메뉴 링크", t: "페이지를 지우고 메뉴만 남겨 404로 가는 링크가 흔합니다. 메뉴 링크를 하나씩 눌러 봅니다." },
  ],
  g22: [
    { b: "PG 계약 명의와 상점 아이디", t: "결제 대행사(PG) 계약이 고객 사업자 명의인지, 이전 업체 명의인지 먼저 확인합니다. 정산 계좌도 함께 봅니다." },
    { b: "테스트 모드로 남아 있는지", t: "개발 때 쓴 테스트 키가 그대로 있으면 결제창은 뜨지만 실제로 돈이 들어오지 않습니다." },
    { b: "결제 모듈 버전", t: "PG사가 지원을 끝낸 옛 결제 모듈이면 어느 날 결제창이 열리지 않습니다. PG사 관리자 공지와 모듈 버전을 대조합니다." },
    { b: "결제 뒤 주문 상태가 바뀌는지", t: "결제는 됐는데 주문이 \"입금 대기\"로 남는다면 결제 완료 알림(웹훅) 주소가 옛 도메인을 가리키는 경우가 많습니다." },
  ],
  g23: [
    { b: "소셜 로그인 앱의 소유 계정", t: "카카오, 네이버 개발자 센터의 앱이 이전 업체 계정에 있으면 키를 바꿀 수 없습니다. 고객 계정으로 옮기거나 새로 만듭니다." },
    { b: "등록된 주소(Redirect URI)", t: "도메인이나 https를 바꾸면 소셜 로그인이 바로 멈춥니다. 개발자 센터에 등록된 주소를 같이 바꿉니다." },
    { b: "비밀번호 저장 방식", t: "비밀번호가 평문이나 MD5로 저장돼 있으면 유출 때 그대로 노출됩니다. 회원 테이블의 비밀번호 칸 길이와 형식을 봅니다." },
    { b: "로그인 시도 제한", t: "틀린 비밀번호를 무한히 넣을 수 있으면 대입 공격에 약합니다. 몇 번 틀리면 막히는지 확인합니다." },
  ],
  g24: [
    { b: "본인 인증 계약", t: "휴대폰 본인 인증 서비스 계약이 누구 명의인지, 만료일이 언제인지 확인합니다. 만료되면 가입이 막힙니다." },
    { b: "수집 항목과 처리방침", t: "가입 화면에서 받는 항목이 개인정보처리방침에 적힌 항목과 같은지 대조합니다. 다르면 방침을 고쳐야 합니다." },
    { b: "약관 동의 기록", t: "누가 언제 어떤 약관에 동의했는지 저장되는지 봅니다. 선택 동의(마케팅 수신)는 따로 기록돼야 합니다." },
  ],
  g27: [
    { b: "비밀글이 주소로 열리는지", t: "목록에서는 자물쇠가 보여도 글 주소를 직접 넣으면 열리는 게시판이 있습니다. 로그아웃 상태로 비밀글 주소를 열어 봅니다." },
    { b: "첨부파일 확장자 제한", t: "php 같은 실행 파일을 올릴 수 있으면 서버가 장악됩니다. 허용 확장자 목록과 업로드 폴더 실행 권한을 확인합니다." },
    { b: "스팸 방지", t: "자동 등록 방지가 꺼져 있으면 광고 글이 하루 수백 건씩 쌓입니다. 최근 글 목록과 설정을 봅니다." },
  ],
  g29: [
    { b: "지도 API 키의 소유 계정", t: "카카오맵, 네이버 지도 키가 이전 업체 계정에 있으면 사용량이 넘거나 계정이 정리될 때 지도가 사라집니다." },
    { b: "키에 등록된 도메인", t: "도메인을 바꾸면 지도가 회색 칸으로 나옵니다. 키 설정에 새 도메인을 더합니다." },
    { b: "우편번호 검색 스크립트 주소", t: "옛 주소의 우편번호 스크립트를 쓰면 주소 검색 창이 뜨지 않습니다. 현재 안내된 스크립트 주소와 비교합니다." },
  ],
  g03: [
    { b: "종료일이 조회에 포함되는지", t: "종료일을 그날 0시로 처리하면 마지막 날 기록이 빠집니다. 종료일 하루짜리로 조회해 결과가 나오는지 봅니다." },
    { b: "최대 기간 제한", t: "기간 제한이 없으면 몇 년치를 한 번에 조회해 화면이 멈추거나 서버가 느려집니다. 최대 조회 기간이 정해져 있는지 확인합니다." },
  ],
  g05: [
    { b: "푸시 알림 발송 방식", t: "앱 푸시를 Firebase 옛 방식(레거시 API)으로 보내고 있다면 이미 막혀 있을 수 있습니다. 2024년부터 새 방식(HTTP v1)만 받습니다." },
    { b: "아이폰 푸시 인증서 만료일", t: "인증서(p12) 방식은 1년마다 만료돼 그날부터 아이폰에 알림이 가지 않습니다. 만료일과 발급 계정을 적어 둡니다." },
  ],
  g09: [
    { b: "페이지 번호가 주소에 남는지", t: "3페이지에서 글을 보고 뒤로 가면 1페이지로 돌아가는 게시판이 많습니다. 주소에 page 값이 남는지 확인합니다." },
    { b: "무한 스크롤 아래 바닥글", t: "무한 스크롤 목록 아래에 바닥글을 두면 사업자 정보와 약관 링크에 닿을 수 없습니다." },
  ],
  g11: [
    { b: "입력값이 그대로 화면에 나오는지", t: "검색어나 이름을 걸러 내지 않고 다시 보여 주면 스크립트가 실행되는 공격(XSS)에 열립니다. 검색창에 <b>시험</b>을 넣어 굵게 나오는지 봅니다." },
    { b: "자동완성 호출 비용", t: "글자 하나마다 외부 검색 API를 부르면 사용량 요금이 쌓입니다. 어떤 API를 누구 계정으로 쓰는지 확인합니다." },
  ],
  g16: [
    { b: "바닥글 사업자 정보", t: "온라인으로 판매한다면 상호, 대표자, 주소, 전화, 사업자등록번호, 통신판매업 신고번호, 호스팅 제공자를 바닥글에 표시해야 합니다. 바뀐 정보가 그대로인지 봅니다." },
    { b: "저작권 연도와 옛 연락처", t: "바닥글 연도가 몇 해 전으로 멈춰 있거나 이전 담당자 전화번호가 남아 있는 경우가 많습니다." },
  ],
  g17: [
    { b: "채팅 상담 버튼의 계정", t: "채팅 상담 서비스가 이전 업체나 퇴사한 직원 계정에 연결돼 있으면 문의가 아무에게도 가지 않습니다." },
    { b: "앱 설치 배너 링크", t: "앱을 내렸거나 이름을 바꿨는데 배너가 옛 스토어 주소로 가는 경우가 있습니다. 눌러서 끝까지 가 봅니다." },
  ],
  g19: [
    { b: "원본 사진 용량", t: "카메라 원본(장당 수 MB)을 그대로 올려 두면 갤러리 첫 화면이 몇 초씩 걸립니다. 가장 큰 사진 몇 장의 용량을 봅니다." },
    { b: "확대 보기 부품의 버전", t: "오래된 라이트박스 플러그인은 jQuery 옛 버전을 함께 쓰는 경우가 많습니다. 부품을 바꿀 때 같이 정리합니다." },
  ],
  g20: [
    { b: "업로드 용량 제한", t: "올릴 수 있는 파일 크기는 서버 설정(PHP는 upload_max_filesize)이 정합니다. 화면 안내 문구와 실제 제한이 같은지 올려 봅니다." },
    { b: "배경 동영상 용량", t: "첫 화면 배경 동영상이 수십 MB면 휴대폰 데이터로 들어온 방문자는 화면을 보기 전에 나갑니다." },
  ],
  g25: [
    { b: "검색이 어떻게 동작하는지", t: "글 전체를 매번 처음부터 훑는 방식이면 글이 쌓일수록 검색이 느려집니다. 검색 한 번에 몇 초 걸리는지 재 봅니다." },
    { b: "검색어 기록", t: "인기 검색어를 보여 준다면 검색어가 어디에 쌓이고 개인정보가 섞이지 않는지 확인합니다." },
  ],
  g28: [
    { b: "에디터 버전", t: "CKEditor 4는 2023년 6월에 무료 지원이 끝났습니다. 다른 에디터도 버전과 지원 상태를 확인합니다." },
    { b: "본문 이미지 저장 위치", t: "에디터로 올린 이미지가 서버 어느 폴더에 쌓이는지 알아야 이전, 백업 때 빠지지 않습니다." },
  ],
  g38: [
    { b: "개인정보처리방침 이력", t: "바뀐 방침만 남기고 이전 방침을 지운 경우가 많습니다. 이전 버전과 바뀐 날짜를 함께 볼 수 있어야 합니다." },
    { b: "담당자 정보", t: "페이지마다 적힌 담당 부서와 전화번호가 조직 개편 뒤에도 그대로인지 봅니다." },
  ],
  g39: [
    { b: "웹 접근성 인증 만료일", t: "웹 접근성 품질 인증은 유효기간이 1년입니다. 인증 마크가 붙어 있어도 기간이 지났을 수 있습니다." },
    { b: "새로 올린 이미지의 대체 텍스트", t: "처음 만들 때는 지켰어도 운영하며 올린 배너와 팝업에서 대체 텍스트가 빠지는 경우가 많습니다." },
  ],
  go1: [
    { b: "도메인 등록 명의와 만료일", t: "도메인이 이전 업체나 퇴사자 명의면 연장도 이전도 막힙니다. 등록 업체, 명의, 만료일을 먼저 적습니다." },
    { b: "DNS를 어디서 관리하는지", t: "도메인을 산 곳과 DNS를 관리하는 곳이 다를 수 있습니다. 메일 기록(MX)까지 함께 확인해야 이전 때 메일이 끊기지 않습니다." },
    { b: "호스팅 결제수단과 SSL 갱신", t: "호스팅 요금이 이전 업체 카드로 나가고 있거나 인증서 자동 갱신이 꺼져 있으면 어느 날 사이트가 멈춥니다." },
  ],
  go2: [
    { b: "관리자 계정을 몇 명이 같이 쓰는지", t: "아이디 하나를 여럿이 쓰면 누가 무엇을 고쳤는지 알 수 없습니다. 사람마다 계정을 나누고 퇴사자 계정을 지웁니다." },
    { b: "관리자 주소와 프로그램 버전", t: "관리자 주소가 잘 알려진 그대로이고 프로그램이 옛 버전이면 공격을 가장 먼저 받습니다." },
  ],
  go3: [
    { b: "원본 소스와 데이터를 받았는지", t: "화면만 넘겨받고 원본 소스, 데이터베이스, 관리자 계정을 못 받은 경우가 많습니다. 받은 것과 못 받은 것을 목록으로 적습니다." },
    { b: "무상 수정 기간이 남았는지", t: "계약서에 하자 보수 기간이 남아 있다면 이전 업체에 먼저 요청할 수 있습니다. 끝나는 날짜를 확인합니다." },
  ],
  go4: [
    { b: "검색 등록 계정의 주인", t: "구글 서치 콘솔, 네이버 서치어드바이저가 이전 업체 계정에만 있으면 검색 문제를 볼 수 없습니다. 고객 계정을 소유자로 더합니다." },
    { b: "개발 때 막아 둔 검색 차단", t: "robots.txt에 Disallow: / 가 남아 있으면 검색에 아예 나오지 않습니다. 오픈 뒤에도 그대로인 경우가 있습니다." },
  ],
  g02: [
    { b: "영업시간이 코드에 적혀 있는지", t: "예약 가능 시간, 점심시간이 코드에 직접 적혀 있으면 시간이 바뀔 때마다 개발자가 필요합니다. 관리자에서 바꿀 수 있는지 봅니다." },
    { b: "서버 시간대", t: "서버가 해외 시간대(UTC)로 돌면 예약 시간이 9시간 어긋나 저장될 수 있습니다. 예약 하나를 넣고 관리자 화면의 시간을 대조합니다." },
  ],
  g06: [
    { b: "휴대폰에서 도움말이 보이는지", t: "마우스를 올려야만 뜨는 툴팁은 휴대폰에서 보이지 않습니다. 눌러서 열리는지 확인합니다." },
    { b: "중요한 안내가 툴팁 안에만 있는지", t: "환불 조건, 개인정보 안내처럼 꼭 보여야 할 내용이 툴팁 안에만 있으면 본문으로 꺼냅니다." },
  ],
  g08: [
    { b: "탭이 주소에 남는지", t: "두 번째 탭을 보다가 링크를 공유하거나 뒤로 가면 첫 탭으로 돌아가는 경우가 많습니다. 탭마다 주소(#)가 바뀌는지 봅니다." },
    { b: "탭 안 내용이 검색에 잡히는지", t: "탭을 눌러야 스크립트로 불러오는 내용은 검색엔진이 못 읽을 수 있습니다. 페이지 소스에 내용이 들어 있는지 확인합니다." },
  ],
  g10: [
    { b: "선택 목록이 코드에 고정돼 있는지", t: "지점, 상품, 상담 분야 목록이 코드에 적혀 있으면 하나 바꿀 때도 개발자가 필요합니다. 관리자에서 바꾸는지 봅니다." },
    { b: "미리 체크된 동의 항목", t: "마케팅 수신 같은 선택 동의가 미리 체크돼 있으면 고쳐야 합니다. 이용자가 직접 체크하게 둡니다." },
  ],
  g12: [
    { b: "버튼이 가는 곳", t: "예약, 결제, 상담 버튼이 없어진 페이지나 옛 외부 서비스로 가는 경우가 많습니다. 주요 버튼을 하나씩 끝까지 눌러 봅니다." },
    { b: "글자를 이미지로 만든 버튼", t: "버튼 글자가 이미지면 문구 하나 바꿀 때마다 디자인 파일이 필요하고, 대체 텍스트가 없으면 화면 낭독기가 읽지 못합니다." },
  ],
  g13: [
    { b: "자동으로 넘어가는 배너의 멈춤 버튼", t: "저절로 넘어가는 배너에 멈춤 수단이 없으면 웹 접근성 지침에 걸립니다. 멈춤, 이전, 다음 버튼이 있는지 봅니다." },
    { b: "슬라이더 부품", t: "배너 슬라이더가 jQuery 옛 버전 위의 플러그인이면 버전을 올릴 때 같이 깨집니다. 어떤 플러그인인지 먼저 적어 둡니다." },
  ],
  g14: [
    { b: "목록이 한 번에 전부 불러오는지", t: "글과 상품을 한꺼번에 불러오는 목록은 쌓일수록 느려집니다. 페이지 나눔이나 더보기가 서버에서 동작하는지 확인합니다." },
    { b: "목록 썸네일", t: "작은 썸네일 자리에 원본 사진을 그대로 쓰면 목록 하나가 수십 MB가 됩니다. 썸네일을 따로 만드는지 봅니다." },
  ],
  g15: [
    { b: "끝나지 않는 로딩", t: "불러오기가 실패해도 스피너만 계속 도는 화면이 많습니다. 인터넷을 끊고 열어 오류 안내가 나오는지 봅니다." },
    { b: "에러 페이지", t: "없는 주소에 서버 기본 404, 500 화면이 뜨면 서버 종류와 버전이 드러나기도 합니다. 사이트 모양의 안내 페이지로 바꿉니다." },
  ],
  g18: [
    { b: "고정 폭 레이아웃", t: "화면 폭이 980px 같은 숫자로 고정돼 있으면 휴대폰에서 가로 스크롤이 생깁니다. 반응형 전환의 시작점입니다." },
    { b: "표로 짠 화면 배치", t: "오래된 사이트는 화면 배치를 table 태그로 짠 경우가 있습니다. 부분 수정보다 그 구역을 새로 짜는 편이 빠를 때가 많습니다." },
  ],
  g21: [
    { b: "상품 정보 고시가 이미지로만 있는지", t: "상품 상세의 필수 표시 정보가 통이미지 안에만 있으면 검색도, 수정도 어렵습니다. 글로 된 표가 있는지 봅니다." },
    { b: "옵션 재고와 실제 재고", t: "옵션별 재고가 외부 재고 프로그램과 연동되는지, 손으로 맞추는지 확인합니다. 품절 표시가 늦으면 취소가 쌓입니다." },
  ],
  g26: [
    { b: "숫자가 무엇을 세는지", t: "관리자 대시보드의 방문수, 전환수가 어떤 기준으로 세는지 적어 둡니다. 도구를 바꾸면 숫자가 갑자기 달라져 보입니다." },
    { b: "대시보드 접근 권한", t: "관리 통계 화면이 로그인 없이 주소만으로 열리는 경우가 있습니다. 로그아웃 상태로 열어 봅니다." },
  ],
  g30: [
    { b: "같은 시간에 두 명이 예약할 때", t: "마지막 한 자리를 동시에 누르면 둘 다 예약되는 경우가 있습니다. 중복 예약을 서버에서 막는지 확인합니다." },
    { b: "예약 알림 문자", t: "문자 발송 서비스의 충전 잔액, 발신번호 등록, 계정 명의를 확인합니다. 잔액이 떨어지면 알림이 조용히 멈춥니다." },
  ],
  g31: [
    { b: "포커스 표시를 지웠는지", t: "키보드로 이동할 때 보이는 테두리를 디자인상 지운 사이트가 많습니다. Tab 키로 이동해 지금 위치가 보이는지 봅니다." },
    { b: "비활성 버튼의 이유", t: "버튼이 흐리게 막혀 있는데 이유가 안 보이면 이용자는 오류로 압니다. 무엇을 채워야 하는지 안내가 있는지 봅니다." },
  ],
  g32: [
    { b: "공유 미리보기", t: "카카오톡, 페이스북에 주소를 붙이면 옛 로고, 옛 사진이 뜨는 경우가 많습니다. og 태그의 제목과 이미지를 확인합니다." },
    { b: "외부 댓글 서비스", t: "댓글을 외부 서비스로 붙였다면 그 서비스가 끝나거나 계정이 정리될 때 댓글이 함께 사라집니다. 계정 명의와 내보내기 방법을 봅니다." },
  ],
  g33: [
    { b: "여백 값이 제각각인지", t: "페이지마다 여백을 직접 숫자로 넣어 두면 한 곳을 고칠 때 다른 곳이 어긋납니다. 공통 값으로 묶여 있는지 봅니다." },
  ],
  g34: [
    { b: "화면 폭 설정 태그", t: "viewport 태그가 없으면 휴대폰에서 PC 화면이 작게 줄어 보입니다. 머리말부터 확인합니다." },
    { b: "옛 기기 기준의 구간", t: "반응형 구간이 몇 년 전 기기 크기에 맞춰져 있으면 요즘 큰 휴대폰, 태블릿에서 어색하게 보입니다. 여러 폭으로 열어 봅니다." },
  ],
  g35: [
    { b: "글꼴 라이선스", t: "유료 글꼴을 웹폰트로 쓰고 있다면 웹 사용 라이선스가 있는지, 누구 명의인지 확인합니다. 이전 업체 라이선스는 넘어오지 않을 수 있습니다." },
    { b: "글꼴 파일 용량", t: "한글 글꼴은 파일이 커서 그대로 내려받으면 첫 화면이 늦게 뜹니다. 필요한 글자만 줄인 파일을 쓰는지 봅니다." },
  ],
  g36: [
    { b: "사진 비율이 제각각인지", t: "올린 사진 비율이 다 달라 목록이 들쭉날쭉하면 화면에서 비율을 고정하고 자르는 설정으로 정리합니다." },
    { b: "사진 사용권", t: "이전 업체가 넣은 유료 사진, 스톡 이미지의 사용권이 고객에게 넘어왔는지 확인합니다." },
  ],
  g37: [
    { b: "기간 지난 팝업과 배너", t: "팝업존, 배너존에 행사가 끝난 공지가 남아 있는 경우가 많습니다. 게시 기간이 자동으로 끝나는지 봅니다." },
    { b: "배너 링크", t: "기관 배너, 패밀리 사이트 링크가 없어진 주소로 가는지 하나씩 눌러 봅니다." },
  ],
  g40: [
    { b: "접수 내역 보관 기간", t: "온라인 접수로 받은 개인정보를 언제 지우는지 정해져 있는지 봅니다. 처리방침의 보유 기간과 실제 데이터가 맞아야 합니다." },
    { b: "첨부파일 저장 위치", t: "신청서 첨부파일이 주소만 알면 누구나 열 수 있는 폴더에 쌓이는 경우가 있습니다. 로그아웃 상태로 파일 주소를 열어 봅니다." },
  ],
  g41: [
    { b: "지난 정보", t: "대표자, 주소, 연혁, 조직도가 몇 년 전 그대로인 경우가 많습니다. 사업자 정보와 대조합니다." },
    { b: "인증서 유효기간", t: "회사 소개에 올린 인증서, 특허의 유효기간이 지났으면 내리거나 갱신본으로 바꿉니다." },
  ],
  g42: [
    { b: "고객사 로고 사용 허락", t: "고객사 로고 띠에 올린 회사들이 사용을 허락했는지, 지금도 거래 중인지 확인합니다." },
    { b: "숫자의 기준일", t: "\"누적 고객 1,000곳\" 같은 숫자는 언제 기준인지 적거나 갱신합니다. 몇 년째 같은 숫자면 오히려 신뢰를 깎습니다." },
  ],
  g43: [
    { b: "마감된 공고", t: "마감일이 지난 공고가 모집 중으로 남아 있지 않은지 봅니다. 자동 마감이 되는지도 확인합니다." },
    { b: "지원서 개인정보", t: "지원서와 이력서 파일을 언제 지우는지, 어디에 쌓이는지 확인합니다. 채용이 끝난 지원서는 정해진 기간 뒤 파기해야 합니다." },
  ],
};

/** 화면 예시: 페이지 종류별로 용어 묶음의 와이어프레임을 모은다(11-21) */
export const screenTypes: { id: string; title: string; desc: string; groups: string[] }[] = [
  { id: "home", title: "첫 화면과 전체 구성", desc: "머리글, 첫 화면, 바닥글, 단 나누기, 공공기관 첫 화면", groups: ["g16", "g18", "g37", "g17"] },
  { id: "company", title: "회사 소개", desc: "인사말, 연혁, 조직도, 신뢰를 주는 장치", groups: ["g41", "g42"] },
  { id: "board", title: "게시판과 글쓰기", desc: "목록, 공지 고정, 비밀글, 에디터, 첨부", groups: ["g27", "g28", "g32"] },
  { id: "member", title: "로그인과 회원가입", desc: "소셜 로그인, 인증, 약관 동의, 단계 표시", groups: ["g23", "g24"] },
  { id: "shop", title: "상품과 결제", desc: "상품 상세, 장바구니, 결제 단계", groups: ["g21", "g22"] },
  { id: "booking", title: "예약", desc: "달력, 시간 선택, 기간 선택, 예약 일정", groups: ["g01", "g02", "g03", "g30"] },
  { id: "apply", title: "온라인 접수와 채용", desc: "접수 상태, 신청 내역, 채용 공고와 지원", groups: ["g40", "g43"] },
  { id: "search", title: "검색과 목록", desc: "검색 결과, 필터, 목록 모양, 페이지 이동", groups: ["g25", "g14", "g09"] },
  { id: "admin", title: "관리자와 대시보드", desc: "통계 카드, 차트, 상태 표시", groups: ["g26", "g31"] },
];

/** 시안 작업(11-21): 업종마다 방향이 다른 시안 두 장. 첫 화면 사진은 public/images/archive/drafts/<slug>-<id>.jpg, 시안은 /work/<slug>?v=<id> */
export const draftSets: { slug: string; name: string; a: { id: string; label: string; desc: string }; b: { id: string; label: string; desc: string } }[] = [
  { slug: "company", name: "정밀가공 제조사", a: { id: "brand", label: "브랜드형", desc: "가공 장면 사진 한 장과 한 문장. 회사의 기술력을 먼저 느끼게 하는 첫 화면" }, b: { id: "info", label: "정보형", desc: "가공 분야, 장비 사양 숫자, 견적 문의를 첫 화면에. 구매 담당자가 바로 비교할 수 있게" } },
  { slug: "law-firm", name: "법률사무소", a: { id: "a", label: "프리미엄", desc: "도시 야경 사진과 \"판결까지 맡는다\"는 약속. 기업, 큰 사건 의뢰인 대상" }, b: { id: "b", label: "상담형", desc: "\"혼자 판단하기 전에 먼저 물어보세요\", 상담 시간 칸. 처음 상담하는 개인 대상" } },
  { slug: "tax-office", name: "세무회계 사무소", a: { id: "a", label: "법인형", desc: "숫자와 경영 판단을 앞세우고 연혁, 누적 신고 건수를 첫 화면에. 법인 대상" }, b: { id: "b", label: "사장님형", desc: "\"세금은 맡기고 장사에 집중\", 밝은 사진과 기장료 문의. 개인사업자 대상" } },
  { slug: "dental-homepage", name: "치과", a: { id: "a", label: "미니멀", desc: "조용한 사진과 짧은 문구, 넓은 여백. 진료 철학을 보여 주는 첫 화면" }, b: { id: "b", label: "가족형", desc: "진료실 사진과 \"아이도 부모님도\", 진료 시간과 위치 칸. 동네 가족 환자 대상" } },
  { slug: "clinic-homepage", name: "피부과", a: { id: "a", label: "미니멀", desc: "제품 사진과 \"진단이 먼저\"라는 한 문장. 시술보다 상담을 앞세우는 병원" }, b: { id: "b", label: "진료 안내형", desc: "진료 시간, 진료 항목, 위치를 첫 화면 바로 아래에. 처음 오는 환자가 바로 찾게" } },
  { slug: "academy", name: "수학, 영어 학원", a: { id: "a", label: "입시형", desc: "큰 문구와 성과 숫자, 수강료 안내 칸. 고등 입시 학부모 대상" }, b: { id: "b", label: "초중등형", desc: "\"매주 문자로 진도 확인\", 교실 사진. 초중등 학부모가 안심하게" } },
  { slug: "interior", name: "인테리어 시공", a: { id: "a", label: "갤러리형", desc: "시공 사진을 화면 가득. 결과물로 설득하는 첫 화면" }, b: { id: "b", label: "비용 안심형", desc: "\"견적서 금액이 공사 끝까지 그대로\", 공사 전후 사진. 추가 비용을 걱정하는 고객 대상" } },
];

export const counts = {
  terms: termGroups.reduce((a, g) => a + g.terms.length, 0),
  groups: termGroups.length,
  notes: insights.length,
  sheets: jaryo.length,
  tools: tools.length,
};

/** 왼쪽 트리 마디 */
export type TreeNode = { label: string; href?: string; count?: number; children?: TreeNode[] };

/** 웹 지식 주제(11-21, 컨플루언스식 공간의 페이지 트리). 번호 없이, 문서마다 독립. 주제 페이지는 /knowledge/<id> */
export type Topic = { id: string; label: string; desc: string; groups: { title: string; items: TreeNode[] }[] };

const tool = (href: string) => {
  const t = tools.find((x) => x.href === href)!;
  return { label: t.title, href: t.href };
};
const series = (name: string) => insights.filter((n) => n.series === name).sort((a, b) => b.date.localeCompare(a.date) || a.no - b.no).map((n) => ({ label: n.title, href: `/insight/${n.slug}` }));
const term = (id: string) => {
  const g = termGroups.find((x) => x.id === id)!;
  return { label: shortTitle(g), href: termHref(g) };
};
const note = (slug: string) => {
  const n = insights.find((x) => x.slug === slug)!;
  return { label: n.title, href: `/insight/${n.slug}` };
};
const doc = (href: string) => {
  const d = trendDocs.find((x) => x.href === href)!;
  return { label: d.title, href: d.href };
};

export function topics(): Topic[] {
  const parts = termGroups.filter((g) => g.sec === "화면 부품");
  const cats = [...new Set(parts.map((g) => g.cat))];
  return [
    { id: "plan", label: "기획", desc: "만들기 전에 정할 것. 업체 고르기, 견적 질문, 유지비, 웹 변천사", groups: [
      { title: "웹 변천사", items: ["/knowledge/history", "/knowledge/company-homepage", "/knowledge/public-homepage", "/knowledge/personal-homepage", "/knowledge/ai-and-homepage"].map(doc) },
      { title: "업체와 견적", items: [...series("업체 선정"), { label: "홈페이지 견적 질문지(PDF)", href: "/jaryo/estimate" }, tool("/tools/estimate-questions"), tool("/tools/hosting-cost")] },
    ] },
    { id: "design", label: "디자인", desc: "화면 부품의 이름, 디자인 용어, 페이지 종류별 화면, 시안, 기기에 따라 바뀐 화면", groups: [
      { title: "화면 부품 용어", items: cats.map((c) => ({ label: c, count: parts.filter((g) => g.cat === c).length, children: parts.filter((g) => g.cat === c).map((g) => ({ label: shortTitle(g), href: termHref(g) })) })) },
      { title: "디자인 용어", items: ["g33", "g34", "g35", "g36"].map(term) },
      { title: "화면과 시안", items: [{ label: "화면 예시", href: "/knowledge/screens" }, { label: "시안 작업", href: "/knowledge/drafts" }] },
      { title: "디자인 흐름", items: designDocs.map((d) => ({ label: d.title, href: d.href })) },
      { title: "도구", items: [tool("/tools/accessibility-check"), tool("/tools/image-compress")] },
    ] },
    { id: "dev", label: "개발", desc: "만드는 도구(CMS), 서버 언어와 버전, 브라우저 호환, 화면 기술(플래시, jQuery), 페이지 무게, 앱, AI로 만든 서비스", groups: [
      { title: "문서", items: ["/knowledge/cms", "/knowledge/server-language", "/knowledge/browser", "/knowledge/flash-jquery", "/knowledge/page-weight", "/knowledge/php", "/knowledge/app"].map(doc) },
      { title: "AI로 만든 서비스 운영", items: series("AI로 만든 서비스 운영") },
      { title: "개발 도구", items: [tool("/tools/jwt-parser"), tool("/tools/unix-time"), tool("/tools/cron")] },
    ] },
    { id: "infra", label: "인프라", desc: "도메인, 서버, 호스팅, https와 인증서", groups: [
      { title: "문서", items: [doc("/knowledge/infra-cloud"), doc("/knowledge/https"), term("go1")] },
      { title: "운영 노트", items: [note("security-headers-check"), note("domain-server-ownership"), note("expiry-calendar"), note("backup-but-no-restore"), note("takeover-first-week-server")] },
    ] },
    { id: "security", label: "보안", desc: "PHP, 워드프레스, 그누보드, 인증서 보안 경보와 대응, 취약점 점검 도구", groups: [
      { title: "점검", items: [note("exposed-files-check"), note("security-headers-check")] },
      { title: "보안 경보", items: series("보안 경보") },
      { title: "도구", items: [tool("/tools/php-check"), tool("/tools/site-check")] },
    ] },
    { id: "search", label: "검색", desc: "검색 등록과 기록, 검색 결과에 보이는 모습, AI 검색과 인용", groups: [
      { title: "문서", items: [doc("/knowledge/search-optimization"), doc("/knowledge/ai-readable-web"), term("go4"), tool("/tools/search-preview")] },
      { title: "운영 노트", items: [note("homepage-seo-basic-settings"), note("ai-crawler-access-check"), note("ai-search-google-naver")] },
    ] },
    { id: "ops", label: "운영과 유지보수", desc: "인수인계, 월 점검, 장애 대응, 관리 비용, 점검표", groups: [
      { title: "운영과 유지보수", items: series("운영과 유지보수") },
      { title: "관리 비용", items: series("관리 비용") },
      { title: "운영 용어", items: [term("go2"), term("go3")] },
      { title: "점검표와 기록표", items: jaryo.filter((j) => j.id !== "estimate").map((j) => ({ label: j.title, href: `/jaryo/${j.id}` })) },
    ] },
    { id: "law", label: "법과 규정", desc: "개인정보처리방침, 이용약관처럼 사이트에 꼭 있어야 하는 문서", groups: [
      { title: "도구", items: [tool("/tools/privacy-policy"), tool("/tools/terms")] },
    ] },
    { id: "reference", label: "참고", desc: "차트 원본 데이터, 해외와 국내 동향, 전체 목록", groups: [
      { title: "자료", items: [{ label: "데이터", href: "/knowledge/data" }, { label: "용어 전체", href: "/knowledge/terms" }, { label: "운영 노트 전체", href: "/knowledge/notes" }, { label: "점검표와 도구 전체", href: "/knowledge/checklists" }, tool("/tools/qr-code")] },
      { title: "해외와 국내 동향", items: series("해외와 국내 동향") },
    ] },
  ];
}

/** 11-22 종류 태그(문서, 운영 노트, 용어, 도구, 자료). 묶음 제목 대신 항목마다 붙인다 */
export const kinds = ["문서", "운영 노트", "용어", "도구", "자료"] as const;
export type Kind = (typeof kinds)[number];
export function kindOf(href?: string): Kind {
  if (!href) return "용어";
  if (href.startsWith("/knowledge/terms/")) return "용어";
  if (href.startsWith("/insight/")) return "운영 노트";
  if (href.startsWith("/tools/")) return "도구";
  if (href.startsWith("/jaryo/") || ["/knowledge/data", "/knowledge/terms", "/knowledge/notes", "/knowledge/checklists"].includes(href)) return "자료";
  return "문서";
}

/** 주소가 들어 있는 주제(왼쪽 트리 펼침, 위치 표시용) */
export function topicOf(href: string): Topic | undefined {
  const has = (n: TreeNode): boolean => n.href === href || !!n.children?.some(has);
  return topics().find((t) => t.groups.some((g) => g.items.some(has)));
}

/** 같은 주제의 다른 문서(관련 문서) */
export function relatedOf(href: string, limit = 6): TreeNode[] {
  const t = topicOf(href);
  if (!t) return [];
  const flat = (n: TreeNode): TreeNode[] => (n.children ? n.children.flatMap(flat) : n.href ? [n] : []);
  return t.groups.flatMap((g) => g.items.flatMap(flat)).filter((n) => n.href !== href).slice(0, limit);
}

/** 최근 수정된 문서. 인사이트는 글 날짜에서 자동으로, 나머지는 더한 날 직접 적는다(지어내지 않기) */
export const manualLog: { date: string; kind: string; title: string; href: string }[] = [
  { date: "2026-11-22", kind: "디자인", title: "웹어워드 수상작으로 본 한국 웹 디자인 22년", href: "/knowledge/web-award" },
  { date: "2026-11-22", kind: "기획", title: "한국 웹 30년: 무료 계정에서 AI 빌더까지", href: "/knowledge/history" },
  { date: "2026-11-22", kind: "개발", title: "만드는 도구(CMS) 비교: CMS란, 설치형과 임대형 추가", href: "/knowledge/cms" },
  { date: "2026-11-22", kind: "인프라", title: "서버 인프라: 온프레미스에서 클라우드, 프라이빗 클라우드까지", href: "/knowledge/infra-cloud" },
  { date: "2026-11-22", kind: "검색", title: "검색 최적화의 역사: 디렉터리 등록에서 SEO, GEO까지", href: "/knowledge/search-optimization" },
  { date: "2026-11-22", kind: "검색", title: "AI가 쓰는 웹사이트: UX 다음의 AX, SEO 다음의 GEO", href: "/knowledge/ai-readable-web" },
  { date: "2026-11-22", kind: "기획", title: "AI 도구와 홈페이지: 산업 변화, 보안, 유출 사례, 앞으로", href: "/knowledge/ai-and-homepage" },
  { date: "2026-11-22", kind: "기획", title: "기업 홈페이지: 회사 소개서 화면에서 플래시, 모바일, 빌더까지", href: "/knowledge/company-homepage" },
  { date: "2026-11-22", kind: "기획", title: "공공기관 홈페이지: 전자정부법에서 KRDS, 국정자원 화재까지", href: "/knowledge/public-homepage" },
  { date: "2026-11-22", kind: "기획", title: "개인 홈페이지: 무료 계정과 CGI 게시판에서 미니홈피, 블로그까지", href: "/knowledge/personal-homepage" },
  { date: "2026-11-22", kind: "개발", title: "개발 언어: Perl CGI에서 Next.js까지", href: "/knowledge/server-language" },
  { date: "2026-11-21", kind: "디자인", title: "화면 크기: 1024에서 1920으로", href: "/knowledge/screen-size" },
  { date: "2026-11-21", kind: "개발", title: "브라우저 호환: 한국만 IE를 오래 못 떠난 이유", href: "/knowledge/browser" },
  { date: "2026-11-21", kind: "개발", title: "만드는 도구(CMS) 비교: 한국은 카페24, 일본은 WordPress", href: "/knowledge/cms" },
  { date: "2026-11-21", kind: "디자인", title: "시안 작업: 업종 7곳, 시안 두 장씩", href: "/knowledge/drafts" },
  { date: "2026-11-21", kind: "디자인", title: "화면 예시: 페이지 종류별 와이어프레임", href: "/knowledge/screens" },
  { date: "2026-11-21", kind: "참고", title: "데이터 차트와 원본 CSV", href: "/knowledge/data" },
];
/** 11-22 문서 최종 수정일(읽은 뒤 바뀌었는지 비교). 인사이트는 글 날짜, 나머지는 manualLog에서 가장 늦은 날 */
export function docUpdated(href: string): string | undefined {
  const n = href.startsWith("/insight/") ? insights.find((x) => `/insight/${x.slug}` === href) : undefined;
  if (n) return n.updated ?? n.date;
  return manualLog.filter((l) => l.href === href).map((l) => l.date).sort().pop();
}

export function recentLog(limit = 8) {
  const fromNotes = insights.map((n) => ({ date: n.updated ?? n.date, kind: topicOf(`/insight/${n.slug}`)?.label ?? "운영 노트", title: n.title, href: `/insight/${n.slug}` }));
  return [...manualLog, ...fromNotes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
