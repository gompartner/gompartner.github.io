"use client";

import { IBM_Plex_Sans_KR } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Baby,
  Briefcase,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  Pause,
  Phone,
  Plane,
  Play,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

// ○○구청 대표 홈페이지 데모. 가상 자치구, 가상 데이터.
// 대표색은 저녁 하천빛 남색(#13233f)과 노을 주황(#e8562a). 주황은 그래픽·배경에만 쓰고
// 흰 바탕 글자에는 대비 4.5:1 이상인 #b53d14를 쓴다.

const plex = IBM_Plex_Sans_KR({ preload: false, weight: ["400", "700"], subsets: ["latin"], display: "swap" });

const NAVY = "#13233f";
const SUNSET = "#e8562a";
const SUNSET_TEXT = "#b53d14";

const MENU: { title: string; items: string[] }[] = [
  { title: "종합민원", items: ["민원실안내", "민원발급·열람안내", "무인민원발급안내", "민원서식", "여권민원", "대형생활폐기물"] },
  { title: "소통·참여", items: ["구청장에게 바란다", "구민 제안", "주민참여예산", "자유게시판", "교육·강좌", "대여·대관"] },
  { title: "열린행정", items: ["공지사항", "고시공고", "채용공고", "보도자료", "정보공개", "예산·재정"] },
  { title: "분야별 정보", items: ["복지", "보건·건강", "교통·주차", "환경·청소", "일자리·경제", "문화·체육"] },
  { title: "○○구 소개", items: ["구청장", "일반현황", "조직도", "담당자 찾기", "청사안내", "찾아오시는 길"] },
];

// 알림판: 실제 구청 배너처럼 기간·대상·문의까지 적는다
const SLIDES = [
  {
    tag: "행사",
    title: "△△천 가을 등불 축제",
    rows: [
      ["기간", "2026. 10. 10.(토) ~ 10. 19.(월)"],
      ["장소", "△△천 산책로 일대"],
      ["문의", "문화체육과 02-000-2101"],
    ],
  },
  {
    tag: "공모",
    title: "2027년 주민참여예산 사업 제안 접수",
    rows: [
      ["기간", "2026. 9. 21.(월) ~ 10. 31.(토)"],
      ["대상", "○○구 거주·직장·학교 구민"],
      ["문의", "기획예산과 02-000-2201"],
    ],
  },
  {
    tag: "보건",
    title: "어르신 독감 예방접종",
    rows: [
      ["기간", "2026. 10. 13.(화) ~ 11. 30.(월)"],
      ["대상", "만 65세 이상 ○○구민"],
      ["문의", "보건소 02-000-1401"],
    ],
  },
];

// 자주 찾는 서비스: 누르면 담당자 찾기에 해당 업무를 넣어 담당 부서를 바로 보여 준다
const FREQUENT = [
  { label: "여권민원", keyword: "여권", icon: Plane },
  { label: "전입신고", keyword: "전입", icon: Truck },
  { label: "주정차 과태료", keyword: "주정차", icon: Car },
  { label: "대형폐기물", keyword: "대형폐기물", icon: Trash2 },
  { label: "예방접종", keyword: "예방접종", icon: Stethoscope },
  { label: "일자리 상담", keyword: "일자리", icon: Briefcase },
  { label: "민원서식", keyword: "민원서식", icon: FileText },
  { label: "출산·육아 지원", keyword: "출산", icon: Baby },
];

const BOARD: Record<string, { title: string; date: string }[]> = {
  공지사항: [
    { title: "○○구 공공 와이파이 설치 구역 12곳 확대", date: "2026.10.06" },
    { title: "어르신 독감 예방접종 10월 13일부터 시작", date: "2026.10.02" },
    { title: "△△천 산책로 야간 조명 교체 공사 안내", date: "2026.09.29" },
    { title: "청년 월세 지원 2차 신청 접수", date: "2026.09.25" },
    { title: "구립 작은도서관 3곳 주말 운영시간 연장", date: "2026.09.22" },
  ],
  고시공고: [
    { title: "○○구 도시계획시설(도로) 결정 열람 공고", date: "2026.10.05" },
    { title: "2026년 하반기 공유재산 대부 입찰 공고", date: "2026.09.30" },
    { title: "○○동 일대 지구단위계획 주민 의견 청취 공고", date: "2026.09.24" },
    { title: "옥외광고물 표시 제한 구역 지정 고시", date: "2026.09.18" },
  ],
  채용공고: [
    { title: "2026년 하반기 기간제 근로자 채용 공고(행정 보조)", date: "2026.10.05" },
    { title: "구립 어린이집 보육교사 채용 공고", date: "2026.09.28" },
    { title: "방문 건강관리 간호사 채용 공고", date: "2026.09.21" },
  ],
  보도자료: [
    { title: "○○구, 지역 소상공인 온라인 판로 지원 사업 추진", date: "2026.10.06" },
    { title: "○○구 공공도서관 이용자 만족도 조사 결과 발표", date: "2026.10.01" },
    { title: "○○구, 노후 놀이터 7곳 새 단장 마쳐", date: "2026.09.26" },
    { title: "추석 연휴 종합상황실 운영", date: "2026.09.23" },
  ],
};
type BoardTab = keyof typeof BOARD;

const DEPTS = [
  { dept: "민원여권과", work: "여권 신청, 여권 수령", phone: "02-000-1101" },
  { dept: "민원여권과", work: "가족관계등록, 인감 증명", phone: "02-000-1102" },
  { dept: "민원여권과", work: "전입신고, 주민등록 등·초본", phone: "02-000-1103" },
  { dept: "민원여권과", work: "민원서식, 무인민원발급기", phone: "02-000-1104" },
  { dept: "주차관리과", work: "주정차 과태료, 거주자 우선 주차", phone: "02-000-1201" },
  { dept: "청소행정과", work: "대형폐기물 배출, 음식물 쓰레기", phone: "02-000-1301" },
  { dept: "보건소", work: "예방접종, 건강검진 예약", phone: "02-000-1401" },
  { dept: "일자리정책과", work: "일자리 상담, 구인 구직 연결", phone: "02-000-1501" },
  { dept: "복지정책과", work: "기초생활보장, 긴급 복지 지원", phone: "02-000-1601" },
  { dept: "보육지원과", work: "어린이집 입소, 출산 지원금", phone: "02-000-1701" },
  { dept: "세무과", work: "지방세 납부, 재산세 문의", phone: "02-000-1801" },
  { dept: "건축과", work: "건축 허가, 옥외광고물 신고", phone: "02-000-1901" },
  { dept: "청년정책과", work: "청년 월세 지원, 청년 공간 대관", phone: "02-000-2001" },
  { dept: "문화체육과", work: "축제, 구립 체육시설 대관", phone: "02-000-2101" },
];

const STAFF_SUGGEST = ["여권", "주정차", "예방접종", "재산세"];

const QUICK = ["구보", "통합예약", "재난안전", "구민 제안", "주민참여예산", "구립도서관"];

const LINK_GROUPS: { title: string; items: string[] }[] = [
  { title: "부서안내", items: ["기획예산과", "총무과", "민원여권과", "복지정책과", "보건소", "도시계획과", "청소행정과", "주차관리과"] },
  { title: "동주민센터", items: ["○○1동", "○○2동", "가람동", "누리동", "한울동", "새터동"] },
  { title: "유관기관", items: ["○○구의회", "○○구 시설관리공단", "○○구 문화재단", "○○구 자원봉사센터"] },
  { title: "관련 사이트", items: ["정부24", "국민신문고", "△△시청", "고용24"] },
];

const FONT_STEPS = [
  { label: "작게", zoom: 0.9 },
  { label: "보통", zoom: 1 },
  { label: "조금 크게", zoom: 1.1 },
  { label: "크게", zoom: 1.2 },
  { label: "가장 크게", zoom: 1.3 },
];

function Skyline({ className }: { className?: string }) {
  // 하천 위로 겹겹이 선 건물과 다리. ○○구 대표 그래픽
  return (
    <svg viewBox="0 0 600 260" className={className} aria-hidden preserveAspectRatio="xMidYMax slice">
      <circle cx="470" cy="92" r="46" fill={SUNSET} opacity="0.9" />
      <g fill="#2b3f63">
        <rect x="20" y="120" width="44" height="100" />
        <rect x="70" y="90" width="30" height="130" />
        <rect x="106" y="138" width="52" height="82" />
        <rect x="164" y="70" width="36" height="150" />
        <rect x="206" y="112" width="48" height="108" />
        <rect x="380" y="104" width="40" height="116" />
        <rect x="426" y="140" width="56" height="80" />
        <rect x="488" y="84" width="34" height="136" />
        <rect x="528" y="126" width="60" height="94" />
      </g>
      <g fill="#3c5582">
        <rect x="260" y="150" width="40" height="70" />
        <rect x="306" y="128" width="30" height="92" />
        <rect x="340" y="160" width="36" height="60" />
      </g>
      <path d="M0 196 Q150 184 300 196 T600 196 L600 206 L0 206 Z" fill="#1d3152" />
      <path d="M160 196 Q300 150 440 196" fill="none" stroke="#9fb3d6" strokeWidth="4" />
      {[190, 230, 270, 310, 350, 390, 420].map((x) => (
        <line key={x} x1={x} y1="196" x2={x} y2={Math.round(196 - Math.max(8, 44 - Math.abs(300 - x) / 3.2))} stroke="#9fb3d6" strokeWidth="2" />
      ))}
      <rect x="0" y="206" width="600" height="54" fill="#0f1c33" />
      <path d="M0 222 Q90 216 180 222 T360 222 T540 222 T720 222" fill="none" stroke={SUNSET} strokeOpacity="0.55" strokeWidth="2" />
      <path d="M0 240 Q90 234 180 240 T360 240 T540 240 T720 240" fill="none" stroke="#9fb3d6" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}

/** 태극 문양을 단순화한 정부 누리집 표시 */
function GovMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="#cd2e3a" />
      <path d="M1 10a9 9 0 0 0 18 0a4.5 4.5 0 0 0-9 0a4.5 4.5 0 0 1-9 0Z" fill="#0047a0" />
    </svg>
  );
}

export function DistrictPortalDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState<BoardTab>("공지사항");
  const [searchTab, setSearchTab] = useState<"all" | "staff">("all");
  const [query, setQuery] = useState("");
  const [staffQuery, setStaffQuery] = useState("");
  const [linkGroup, setLinkGroup] = useState<string | null>(null);
  const [fontStep, setFontStep] = useState(1);
  const reduced = useReducedMotionSafe();
  const autoplay = !paused && !reduced;
  const staffInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(id);
  }, [autoplay]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const results = useMemo(() => {
    const q = staffQuery.trim().replace(/\s/g, "");
    if (!q) return [];
    return DEPTS.filter((d) => (d.dept + d.work).replace(/\s/g, "").includes(q));
  }, [staffQuery]);

  // 자주 찾는 서비스나 바닥글에서 담당자 찾기로 넘어온다
  const openStaff = (keyword = "") => {
    setSearchTab("staff");
    setStaffQuery(keyword);
    window.setTimeout(() => {
      document.getElementById("staff-search")?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
      staffInput.current?.focus({ preventScroll: true });
    }, 0);
  };

  const current = SLIDES[slide];
  const container = "mx-auto w-full max-w-[1200px] px-4 md:px-6";
  const boardKeys = Object.keys(BOARD) as BoardTab[];

  return (
    <div className={`${plex.className} min-h-screen bg-[#f3f5f8] text-[17px] leading-[1.5] text-[#17212b]`}>
      {/* 건너뛰기 링크 */}
      <nav aria-label="건너뛰기 링크">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded-[4px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:outline focus:outline-2" style={{ outlineColor: NAVY }}>
          본문 바로가기
        </a>
        <a href="#gnb" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded-[4px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:outline focus:outline-2" style={{ outlineColor: NAVY }}>
          주메뉴 바로가기
        </a>
      </nav>

      {/* 공식 누리집 표시 */}
      <div className="bg-[#eef1f5] text-[14px] text-[#3a4453]">
        <p className={`${container} flex min-h-8 items-center gap-2 py-1`}>
          <GovMark />
          이 누리집은 대한민국 공식 전자정부 누리집입니다.
        </p>
      </div>

      <div style={{ zoom: FONT_STEPS[fontStep].zoom }}>
        {/* 상단 유틸 */}
        <div className="hidden border-b border-[#dfe3ea] bg-white md:block">
          <div className={`${container} flex h-10 items-center justify-end gap-5 text-[14px] text-[#3a4453]`}>
            <a href="#footer" className="hover:text-[#17212b] hover:underline">사이트맵</a>
            <button type="button" onClick={() => setLinkGroup("동주민센터")} className="hover:text-[#17212b] hover:underline">
              동주민센터
            </button>
            <a href="#footer" className="hover:text-[#17212b] hover:underline">보건소</a>
            <a href="#footer" className="hover:text-[#17212b] hover:underline">로그인</a>
            <label className="flex items-center gap-1.5">
              <span>글자 크기</span>
              <select
                value={fontStep}
                onChange={(e) => setFontStep(Number(e.target.value))}
                className="h-7 rounded-[4px] border border-[#b9c0cc] bg-white px-1 text-[14px]"
              >
                {FONT_STEPS.map((f, i) => (
                  <option key={f.label} value={i}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* 헤더 */}
        <header className="relative z-30 bg-white shadow-[0_1px_0_#dfe3ea]">
          <div className={`${container} flex h-[72px] items-center gap-4`}>
            <a href="#main" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: NAVY }} aria-hidden>
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <circle cx="16" cy="9" r="4" fill={SUNSET} />
                  <path d="M3 17 Q8 13 12 17 T21 17" stroke="#fff" strokeWidth="2" fill="none" />
                </svg>
              </span>
              <span className="text-[21px] font-bold tracking-[-0.02em]">○○구청</span>
            </a>

            <nav id="gnb" aria-label="주메뉴" className="ml-auto hidden lg:block">
              <ul className="flex">
                {MENU.map((m) => (
                  <li key={m.title}>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(true)}
                      aria-expanded={menuOpen}
                      aria-controls="mega-menu"
                      className="h-[72px] px-4 text-[18px] font-bold hover:text-[#b53d14] xl:px-5"
                    >
                      {m.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mega-menu"
              aria-label={menuOpen ? "전체메뉴 닫기" : "전체메뉴"}
              className="ml-auto flex h-11 w-11 items-center justify-center rounded-[6px] text-white lg:ml-2"
              style={{ background: NAVY }}
            >
              {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
          </div>

          {menuOpen && (
            <div id="mega-menu" className="absolute inset-x-0 top-full border-t border-[#dfe3ea] bg-white shadow-[0_20px_40px_-20px_rgba(19,35,63,0.35)]">
              <div className={`${container} grid max-h-[70vh] gap-8 overflow-y-auto py-8 sm:grid-cols-2 lg:grid-cols-5`}>
                {MENU.map((m) => (
                  <div key={m.title}>
                    <p className="border-b-2 pb-2 text-[18px] font-bold" style={{ borderColor: SUNSET }}>
                      {m.title}
                    </p>
                    <ul className="mt-3 space-y-1">
                      {m.items.map((it) => (
                        <li key={it}>
                          {it === "담당자 찾기" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpen(false);
                                openStaff();
                              }}
                              className="block rounded px-1 py-1.5 text-left text-[16px] text-[#3a4453] hover:text-[#17212b] hover:underline"
                            >
                              {it}
                            </button>
                          ) : (
                            <a href="#main" onClick={() => setMenuOpen(false)} className="block rounded px-1 py-1.5 text-[16px] text-[#3a4453] hover:text-[#17212b] hover:underline">
                              {it}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <main id="main">
          {/* 첫 화면: 알림판 + 자주 찾는 서비스 */}
          <div className={`${container} grid gap-4 pt-5 md:pt-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]`}>
            <section aria-labelledby="notice-board-title" aria-roledescription="배너 슬라이드" className="relative flex min-h-[320px] flex-col overflow-hidden rounded-[12px] text-white" style={{ background: NAVY }}>
              <Skyline className="absolute inset-x-0 bottom-0 h-[55%] w-full opacity-60" />
              <div className="relative flex items-center gap-2 border-b border-white/15 px-5 py-3">
                <h2 id="notice-board-title" className="text-[17px] font-bold">
                  알림판
                </h2>
                <span className="ml-auto text-[15px] tabular-nums" aria-hidden>
                  {slide + 1} / {SLIDES.length}
                </span>
                <button type="button" aria-label="이전 알림" onClick={() => setSlide((s) => (s + SLIDES.length - 1) % SLIDES.length)} className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-white/40 hover:bg-white/10">
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={paused ? "자동 넘김 재생" : "자동 넘김 정지"}
                  aria-pressed={paused}
                  onClick={() => setPaused((p) => !p)}
                  className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-white/40 hover:bg-white/10"
                >
                  {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
                </button>
                <button type="button" aria-label="다음 알림" onClick={() => setSlide((s) => (s + 1) % SLIDES.length)} className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-white/40 hover:bg-white/10">
                  <ChevronRight size={18} aria-hidden />
                </button>
              </div>
              <div className="relative px-5 pb-28 pt-5 md:px-7 md:pt-6" aria-live={autoplay ? "off" : "polite"} aria-label={`${SLIDES.length}개 중 ${slide + 1}번째`}>
                <span className="inline-block rounded-[4px] px-2 py-0.5 text-[14px] font-bold text-[#13233f]" style={{ background: "#f6c7a8" }}>
                  {current.tag}
                </span>
                <p className="mt-3 text-[26px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[34px]">{current.title}</p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[16px] text-[#e3e8f1]">
                  {current.rows.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="font-bold text-[#f6c7a8]">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <a href="#main" className="mt-5 inline-flex h-10 items-center rounded-[4px] bg-white px-4 text-[15px] font-bold" style={{ color: NAVY }}>
                  자세히보기
                </a>
              </div>
            </section>

            <section aria-labelledby="frequent-title" className="rounded-[12px] bg-white p-5">
              <h2 id="frequent-title" className="text-[19px] font-bold">
                자주 찾는 서비스
              </h2>
              <ul className="mt-3 grid grid-cols-4 gap-1">
                {FREQUENT.map(({ label, keyword, icon: Icon }) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => openStaff(keyword)}
                      className="flex w-full flex-col items-center gap-2 rounded-[6px] px-1 py-3 text-center hover:bg-[#fdf0ea]"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f2d3c5] bg-[#fdf0ea]" style={{ color: SUNSET_TEXT }}>
                        <Icon size={22} aria-hidden />
                      </span>
                      <span className="text-[14px] font-bold leading-[1.35] break-keep">{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 통합검색 / 담당자 찾기 */}
          <section id="staff-search" aria-label="검색" className={`${container} scroll-mt-4 pt-4`}>
            <div className="rounded-[12px] border-2 bg-white p-4 md:p-6" style={{ borderColor: NAVY }}>
              <div role="tablist" aria-label="검색 구분" className="flex gap-1 border-b border-[#dfe3ea]">
                {(
                  [
                    ["all", "통합검색"],
                    ["staff", "담당자 찾기"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`search-tab-${id}`}
                    aria-selected={searchTab === id}
                    aria-controls={`search-panel-${id}`}
                    onClick={() => setSearchTab(id)}
                    className={`-mb-px h-11 border-b-[3px] px-4 text-[17px] font-bold ${searchTab === id ? "" : "border-transparent text-[#5a6473] hover:text-[#17212b]"}`}
                    style={searchTab === id ? { borderColor: SUNSET_TEXT, color: "#17212b" } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {searchTab === "all" ? (
                <div id="search-panel-all" role="tabpanel" aria-labelledby="search-tab-all" className="pt-4">
                  <form role="search" onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <label htmlFor="site-search" className="sr-only">
                      통합검색어
                    </label>
                    <input
                      id="site-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="검색어를 입력하세요"
                      className="h-12 min-w-0 flex-1 rounded-[6px] border border-[#8a93a3] px-3 text-[17px] outline-none focus:outline focus:outline-2 focus:outline-[#13233f]"
                    />
                    <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-[6px] px-5 text-[16px] font-bold text-white" style={{ background: NAVY }}>
                      <Search size={18} aria-hidden />
                      검색
                    </button>
                  </form>
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#3a4453]">
                    <span className="font-bold">인기검색어</span>
                    {["청년 월세", "대형폐기물", "주민참여예산", "등불 축제"].map((w) => (
                      <button key={w} type="button" onClick={() => setQuery(w)} className="underline-offset-2 hover:underline">
                        {w}
                      </button>
                    ))}
                  </p>
                </div>
              ) : (
                <div id="search-panel-staff" role="tabpanel" aria-labelledby="search-tab-staff" className="pt-4">
                  <label htmlFor="dept-search" className="block text-[15px] font-bold text-[#3a4453]">
                    업무명 또는 부서명
                  </label>
                  <div className="mt-1 flex items-center rounded-[6px] border border-[#8a93a3] px-3 focus-within:outline focus-within:outline-2 focus-within:outline-[#13233f]">
                    <Search size={18} aria-hidden className="text-[#5a6473]" />
                    <input
                      id="dept-search"
                      ref={staffInput}
                      value={staffQuery}
                      onChange={(e) => setStaffQuery(e.target.value)}
                      placeholder="예: 여권, 주차, 보건소"
                      className="h-12 w-full bg-transparent px-2 text-[17px] outline-none"
                    />
                  </div>
                  {!staffQuery.trim() ? (
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#3a4453]">
                      <span className="font-bold">자주 찾는 업무</span>
                      {STAFF_SUGGEST.map((w) => (
                        <button key={w} type="button" onClick={() => setStaffQuery(w)} className="underline-offset-2 hover:underline">
                          {w}
                        </button>
                      ))}
                    </p>
                  ) : (
                    <div className="mt-4" aria-live="polite">
                      <p className="text-[15px] text-[#3a4453]">
                        검색 결과 <b className="text-[#17212b]">{results.length}</b>건
                      </p>
                      {results.length === 0 ? (
                        <p className="mt-2 rounded-[6px] bg-[#f3f5f8] py-6 text-center text-[16px] text-[#5a6473]">검색 결과가 없습니다.</p>
                      ) : (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full min-w-[420px] text-[15px]">
                            <caption className="sr-only">담당자 찾기 결과</caption>
                            <thead>
                              <tr className="border-y-2 bg-[#f7f8fa] text-left" style={{ borderTopColor: NAVY, borderBottomColor: "#dfe3ea" }}>
                                <th scope="col" className="px-2 py-2 font-bold">부서</th>
                                <th scope="col" className="px-2 py-2 font-bold">담당업무</th>
                                <th scope="col" className="px-2 py-2 text-right font-bold">전화번호</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.map((d) => (
                                <tr key={d.phone} className="border-b border-[#e6e9ef]">
                                  <td className="px-2 py-2.5 font-bold">{d.dept}</td>
                                  <td className="px-2 py-2.5 text-[#3a4453]">{d.work}</td>
                                  <td className="px-2 py-2.5 text-right tabular-nums">
                                    <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                                      <Phone size={14} aria-hidden />
                                      {d.phone}
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className={`${container} grid gap-4 py-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]`}>
            {/* 구정소식 게시판 */}
            <section aria-labelledby="news-title" className="min-w-0 rounded-[12px] bg-white p-5 md:p-6">
              <h2 id="news-title" className="text-[21px] font-bold">
                구정소식
              </h2>
              <div className="mt-3 flex items-end border-b-2" style={{ borderColor: NAVY }}>
                <div role="tablist" aria-label="게시판 구분" className="flex flex-1 overflow-x-auto">
                  {boardKeys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      id={`board-tab-${k}`}
                      aria-selected={tab === k}
                      aria-controls="board-panel"
                      onClick={() => setTab(k)}
                      className={`h-11 shrink-0 rounded-t-[6px] px-3 text-[16px] font-bold sm:px-4 ${tab === k ? "text-white" : "text-[#3a4453] hover:text-[#17212b]"}`}
                      style={tab === k ? { background: NAVY } : undefined}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <a href="#main" aria-label={`${tab} 더보기`} className="mb-2 ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#b9c0cc] hover:bg-[#f3f5f8]">
                  <Plus size={16} aria-hidden />
                </a>
              </div>
              <ul id="board-panel" role="tabpanel" aria-labelledby={`board-tab-${tab}`} className="divide-y divide-[#e6e9ef]">
                {BOARD[tab].map((b) => (
                  <li key={b.title}>
                    <a href="#main" className="flex items-baseline gap-4 py-3 hover:underline">
                      <span className="min-w-0 flex-1 truncate text-[16px]">{b.title}</span>
                      <span className="shrink-0 text-[14px] text-[#5a6473] tabular-nums">{b.date}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid content-start gap-4">
              {/* 구청장 */}
              <section aria-labelledby="mayor-title" className="relative overflow-hidden rounded-[12px] p-5 text-white md:p-6" style={{ background: SUNSET_TEXT }}>
                <svg viewBox="0 0 200 200" className="absolute -right-10 -top-10 h-48 w-48 opacity-20" aria-hidden>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" strokeWidth="2" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#fff" strokeWidth="2" />
                  <circle cx="100" cy="100" r="30" fill="#fff" />
                </svg>
                <h2 id="mayor-title" className="relative text-[20px] font-bold">
                  ○○구청장 홍ㄱ동입니다.
                </h2>
                <ul className="relative mt-4 grid gap-1.5 text-[16px]">
                  {["구청장에게 바란다", "민선9기 공약", "인사말"].map((l) => (
                    <li key={l}>
                      <a href="#main" className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">
                        {l}
                        <ChevronRight size={16} aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 바로가기 */}
              <nav aria-labelledby="quick-title" className="rounded-[12px] bg-white p-5">
                <h2 id="quick-title" className="text-[19px] font-bold">
                  바로가기
                </h2>
                <ul className="mt-3 grid grid-cols-3 gap-2">
                  {QUICK.map((q) => (
                    <li key={q}>
                      <a href="#main" className="flex h-11 items-center justify-center rounded-[6px] bg-[#f3f5f8] px-1 text-center text-[15px] font-bold text-[#3a4453] hover:bg-[#e8ecf2] hover:text-[#17212b]">
                        {q}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* 바로가기 모음 */}
          <section aria-label="바로가기 모음" className="border-t border-[#dfe3ea] bg-white">
            <div className={`${container} py-4`}>
              <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {LINK_GROUPS.map((g) => {
                  const open = linkGroup === g.title;
                  return (
                    <li key={g.title}>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls="link-group-panel"
                        onClick={() => setLinkGroup(open ? null : g.title)}
                        className={`flex h-12 w-full items-center justify-between rounded-[6px] border px-4 text-[16px] font-bold ${open ? "text-white" : "border-[#b9c0cc] hover:bg-[#f3f5f8]"}`}
                        style={open ? { background: NAVY, borderColor: NAVY } : undefined}
                      >
                        {g.title}
                        <ChevronDown size={18} aria-hidden className={open ? "rotate-180" : ""} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {linkGroup && (
                <ul id="link-group-panel" aria-label={linkGroup} className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-[6px] bg-[#f3f5f8] p-4 sm:grid-cols-3 md:grid-cols-4">
                  {LINK_GROUPS.find((g) => g.title === linkGroup)!.items.map((it) => (
                    <li key={it}>
                      <a href="#main" className="block py-1 text-[15px] text-[#3a4453] hover:text-[#17212b] hover:underline">
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>

        {/* 바닥글 */}
        <footer id="footer" className="text-[#c9d2e0]" style={{ background: "#0f1c33" }}>
          <div className={`${container} py-10 pb-28`}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              <li>
                <a href="#footer" className="font-bold" style={{ color: "#ffb48f" }}>
                  개인정보처리방침
                </a>
              </li>
              <li><a href="#footer" className="hover:text-white">홈페이지 이용안내</a></li>
              <li><a href="#footer" className="hover:text-white">저작권 정책</a></li>
              <li><a href="#footer" className="hover:text-white">찾아오시는 길</a></li>
              <li>
                <button type="button" onClick={() => openStaff()} className="hover:text-white">
                  담당자 찾기
                </button>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <address className="text-[15px] not-italic leading-[1.7]">
                (00000) □□시 ○○구 ○○로 100 ○○구청
                <br />
                대표전화 02-000-0000 (평일 09:00 ~ 18:00)
                <br />
                당직실(야간·공휴일) 02-000-0119
                <br />
                ○○구청 홈페이지의 모든 콘텐츠는 저작권법의 보호를 받습니다.
              </address>
              <div className="flex h-14 w-32 items-center justify-center rounded-[6px] border border-[#3a4c6d] text-center text-[13px] leading-[1.3]">
                웹 접근성
                <br />
                품질인증 마크
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
