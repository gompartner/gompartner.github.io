// 곰파트너 아카이브(/archive). 11-21 사용자: 컨플루언스처럼 정돈된 문서 공간, 실적 대신 쌓인 기록을 보여 준다.
// 틀은 문서 사이트형(왼쪽 분류 트리, 본문, 오른쪽 목차). 우리 색깔은 "이어받을 때 볼 것", "이렇게 요청하세요", 같은 그림체 와이어프레임, 확인일.
// 원래 주소가 있는 자료(인사이트 /insight, 무료 도구 /tools, 점검표 /jaryo/<id>)는 주소를 그대로 두고 트리에서 잇는다.
// 문서가 없는 분류(트렌드, 시안 작업)는 첫 문서가 생길 때 sections에 더한다. 빈 칸, 준비 중 표시는 두지 않는다.

import { termGroups, type TermGroup } from "@/data/classic/glossary";
import { insights } from "@/data/classic/insights";
import { jaryo } from "@/data/classic/jaryo";
import { tools } from "@/data/classic/tools";

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

export const termHref = (g: TermGroup) => `/archive/terms/${termSlugs[g.id]}`;
export const groupBySlug = (slug: string) => termGroups.find((g) => termSlugs[g.id] === slug);

/** 묶음 제목에서 "종류 6가지" 같은 꼬리를 빼고 짧게(트리, 목록용) */
export const shortTitle = (g: TermGroup) => g.title.replace(/ ?(UI )?(종류 )?\d+가지$/, (m) => (m.includes("UI") ? " UI" : "")).trim();

/** 이어받을 때 볼 것. 남이 만든 사이트에서 그 부품을 넘겨받았을 때 먼저 확인할 것. 확인한 묶음만 적는다 */
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
};

/** 아카이브 분류(위 탭과 첫 화면 칸). 문서가 있는 분류만 둔다 */
export type ArchiveSection = { id: string; label: string; href: string; desc: string };
export const sections: ArchiveSection[] = [
  { id: "terms", label: "용어", href: "/archive/terms", desc: "화면 부품, 디자인 용어, 운영 용어를 그림과 요청 문장으로" },
  { id: "notes", label: "운영 노트", href: "/archive/notes", desc: "인수, 운영, 보안, 비용을 실제 순서대로 정리한 글" },
  { id: "checklists", label: "점검표와 도구", href: "/archive/checklists", desc: "넘겨받은 날 기록표, 매달 점검표, 무료 도구" },
];

export const counts = {
  terms: termGroups.reduce((a, g) => a + g.terms.length, 0),
  groups: termGroups.length,
  notes: insights.length,
  sheets: jaryo.length,
  tools: tools.length,
};

/** 왼쪽 트리. 분류마다 소제목과 링크 */
export type TreeNode = { label: string; href?: string; count?: number; children?: TreeNode[] };
export function archiveTree(): { section: ArchiveSection; groups: { title: string; items: TreeNode[] }[] }[] {
  const secOrder = ["화면 부품", "디자인 용어", "운영과 유지보수"] as const;
  const terms = secOrder.map((sec) => {
    const gs = termGroups.filter((g) => g.sec === sec);
    if (sec !== "화면 부품") return { title: sec, items: gs.map((g) => ({ label: shortTitle(g), href: termHref(g) })) };
    const cats = [...new Set(gs.map((g) => g.cat))];
    return { title: sec, items: cats.map((c) => ({ label: c, count: gs.filter((g) => g.cat === c).length, children: gs.filter((g) => g.cat === c).map((g) => ({ label: shortTitle(g), href: termHref(g) })) })) };
  });
  const seriesNames = [...new Set(insights.map((n) => n.series))];
  const notes = [{ title: "묶음", items: seriesNames.map((s) => ({ label: s, href: `/archive/notes#${encodeURIComponent(s)}`, count: insights.filter((n) => n.series === s).length })) }];
  const checks = [
    { title: "점검표와 기록표", items: jaryo.map((j) => ({ label: j.title, href: `/jaryo/${j.id}` })) },
    { title: "무료 도구", items: [{ label: "도구 전체", href: "/archive/checklists#tools", count: tools.length }] },
  ];
  return [
    { section: sections[0], groups: terms },
    { section: sections[1], groups: notes },
    { section: sections[2], groups: checks },
  ];
}

/** 최근 쌓인 기록. 인사이트는 글 날짜에서 자동으로, 나머지는 더한 날 직접 적는다(지어내지 않기) */
const manualLog: { date: string; kind: string; title: string; href: string }[] = [
  { date: "2026-11-21", kind: "용어", title: "화면 부품, 디자인 용어 와이어프레임 225장", href: "/archive/terms" },
  { date: "2026-11-21", kind: "용어", title: "이어받을 때 볼 것 24묶음(화면 부품 20, 운영과 유지보수 4)", href: "/archive/terms" },
];
export function recentLog(limit = 8) {
  const fromNotes = insights.map((n) => ({ date: n.date, kind: "운영 노트", title: n.title, href: `/insight/${n.slug}` }));
  return [...manualLog, ...fromNotes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
