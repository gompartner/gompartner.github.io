"use client";

import { IBM_Plex_Sans_KR } from "next/font/google";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Baby,
  Briefcase,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Menu,
  Pause,
  Phone,
  Plane,
  Play,
  Search,
  Stethoscope,
  Trash2,
  Truck,
  X,
} from "lucide-react";

// 샘플구청 홈페이지 데모. 가상 자치구, 가상 데이터.
// 대표색은 저녁 하천빛 남색(#13233f)과 노을 주황(#e8562a). 주황은 그래픽·배경에만 쓰고
// 흰 바탕 글자에는 대비 4.5:1 이상인 #b53d14를 쓴다.

const plex = IBM_Plex_Sans_KR({ preload: false, weight: ["400", "700"], subsets: ["latin"], display: "swap" });

const NAVY = "#13233f";
const SUNSET = "#e8562a";
const SUNSET_TEXT = "#b53d14";

const MENU: { title: string; items: string[] }[] = [
  { title: "민원·참여", items: ["민원 안내", "민원서식", "여권 발급", "구민 제안", "구청장에게 바란다", "주민 참여 예산"] },
  { title: "분야별 정보", items: ["복지", "보건·건강", "교통·주차", "환경·청소", "일자리·경제", "문화·체육"] },
  { title: "구정 소식", items: ["새소식", "고시공고", "보도자료", "채용", "행사 일정", "구보"] },
  { title: "구청 안내", items: ["구청장실", "조직도", "부서 전화번호", "동 주민센터", "오시는 길", "청사 안내"] },
];

const SLIDES = [
  { tag: "행사", title: "△△천 가을 등불 축제", body: "10월 10일부터 19일까지 △△천 산책로 일대에서 열립니다.", date: "2026.10.10 ~ 10.19" },
  { tag: "공모", title: "2027년 주민 참여 예산 제안 접수", body: "우리 동네에 필요한 사업을 구민이 직접 제안합니다.", date: "2026.09.21 ~ 10.31" },
  { tag: "안내", title: "추석 연휴 쓰레기 배출 일정", body: "연휴 기간 생활폐기물 수거 일정이 바뀝니다. 동별 일정을 확인하세요.", date: "2026.10.03 ~ 10.09" },
];

const FREQUENT = [
  { label: "여권 발급", icon: Plane },
  { label: "전입 신고", icon: Truck },
  { label: "주정차 과태료", icon: Car },
  { label: "대형폐기물 배출", icon: Trash2 },
  { label: "보건소 예약", icon: Stethoscope },
  { label: "일자리 찾기", icon: Briefcase },
  { label: "민원서식", icon: FileText },
  { label: "출산·육아 지원", icon: Baby },
];

const BOARD: Record<string, { title: string; date: string; dept: string }[]> = {
  새소식: [
    { title: "○○구, 공공 와이파이 설치 구역 12곳 확대", date: "2026.09.26", dept: "정보통신과" },
    { title: "어르신 독감 예방접종 10월 13일부터 시작", date: "2026.09.24", dept: "보건소" },
    { title: "△△천 산책로 야간 조명 교체 공사 안내", date: "2026.09.22", dept: "치수과" },
    { title: "청년 월세 지원 2차 신청 접수", date: "2026.09.18", dept: "청년정책과" },
    { title: "구립 작은도서관 3곳 주말 운영 시간 연장", date: "2026.09.15", dept: "문화체육과" },
  ],
  고시공고: [
    { title: "○○구 도시계획시설(도로) 결정 열람 공고", date: "2026.09.25", dept: "도시계획과" },
    { title: "2026년 하반기 공유재산 대부 입찰 공고", date: "2026.09.23", dept: "재산관리과" },
    { title: "○○동 일대 지구단위계획 주민 의견 청취", date: "2026.09.19", dept: "도시계획과" },
    { title: "옥외광고물 표시 제한 구역 지정 고시", date: "2026.09.12", dept: "건축과" },
  ],
  채용: [
    { title: "2026년 하반기 기간제 근로자 채용 (행정 보조)", date: "2026.09.27", dept: "총무과" },
    { title: "구립 어린이집 보육교사 채용", date: "2026.09.20", dept: "보육지원과" },
    { title: "방문 건강관리 간호사 채용", date: "2026.09.16", dept: "보건소" },
  ],
  행사: [
    { title: "△△천 가을 등불 축제", date: "2026.10.10", dept: "문화체육과" },
    { title: "구민 건강 걷기 대회", date: "2026.10.18", dept: "보건소" },
    { title: "작은 음악회: 구청 광장 저녁 공연", date: "2026.10.24", dept: "문화체육과" },
    { title: "청소년 진로 박람회", date: "2026.11.07", dept: "교육지원과" },
  ],
};

const DEPTS = [
  { dept: "민원여권과", work: "여권 신청, 여권 수령", phone: "02-000-1101" },
  { dept: "민원여권과", work: "가족관계등록, 인감 증명", phone: "02-000-1102" },
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

const CENTERS = [
  { name: "○○1동 주민센터", address: "○○로 21", phone: "02-000-3101" },
  { name: "○○2동 주민센터", address: "△△천로 8", phone: "02-000-3201" },
  { name: "가람동 주민센터", address: "가람길 45", phone: "02-000-3301" },
  { name: "누리동 주민센터", address: "누리로 112", phone: "02-000-3401" },
  { name: "한울동 주민센터", address: "한울로 7", phone: "02-000-3501" },
  { name: "새터동 주민센터", address: "새터길 30", phone: "02-000-3601" },
];

const QUICK = ["구보 보기", "구민 제안", "주민 참여 예산", "구립 도서관", "공공시설 예약", "재난 안전 정보"];

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

function Skyline({ className }: { className?: string }) {
  // 하천 위로 겹겹이 선 건물과 다리. 샘플구 대표 그래픽
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
      <g fill="#f6c7a8" opacity="0.8">
        {[
          [78, 104], [88, 124], [172, 90], [184, 118], [172, 150], [214, 130], [496, 100], [506, 132], [390, 120], [540, 144],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="8" />
        ))}
      </g>
      <path d="M0 196 Q150 184 300 196 T600 196 L600 206 L0 206 Z" fill="#1d3152" />
      <path d="M160 196 Q300 150 440 196" fill="none" stroke="#9fb3d6" strokeWidth="4" />
      {[190, 230, 270, 310, 350, 390, 420].map((x) => (
        <line key={x} x1={x} y1="196" x2={x} y2={196 - Math.max(8, 44 - Math.abs(300 - x) / 3.2)} stroke="#9fb3d6" strokeWidth="2" />
      ))}
      <rect x="0" y="206" width="600" height="54" fill="#0f1c33" />
      <path d="M0 222 Q90 216 180 222 T360 222 T540 222 T720 222" fill="none" stroke={SUNSET} strokeOpacity="0.55" strokeWidth="2" />
      <path d="M0 240 Q90 234 180 240 T360 240 T540 240 T720 240" fill="none" stroke="#9fb3d6" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}

export function DistrictPortalDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState<keyof typeof BOARD>("새소식");
  const [query, setQuery] = useState("");
  const reduced = useReducedMotion();
  const autoplay = !paused && !reduced;

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
    const q = query.trim().replace(/\s/g, "");
    if (!q) return DEPTS.slice(0, 5);
    return DEPTS.filter((d) => (d.dept + d.work).replace(/\s/g, "").includes(q));
  }, [query]);

  const current = SLIDES[slide];
  const container = "mx-auto w-full max-w-[1280px] px-4 md:px-8";

  return (
    <div className={`${plex.className} min-h-screen bg-[#f3f5f8] text-[#17212b]`}>
      {/* 상단 안내 줄 */}
      <div className="hidden border-b border-[#dfe3ea] bg-white md:block">
        <div className={`${container} flex h-10 items-center justify-end gap-5 text-[14px] text-[#4a5463]`}>
          <a href="#footer" className="hover:text-[#17212b]">누리집 안내</a>
          <a href="#footer" className="hover:text-[#17212b]">전체 메뉴 보기</a>
          <a href="#footer" className="hover:text-[#17212b]">English</a>
          <a href="#footer" className="hover:text-[#17212b]">中文</a>
        </div>
      </div>

      {/* 헤더 */}
      <header className="relative z-30 bg-white shadow-[0_1px_0_#dfe3ea]">
        <div className={`${container} flex h-[72px] items-center gap-4`}>
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: NAVY }} aria-hidden>
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <circle cx="16" cy="9" r="4" fill={SUNSET} />
                <path d="M3 17 Q8 13 12 17 T21 17" stroke="#fff" strokeWidth="2" fill="none" />
              </svg>
            </span>
            <span className="text-[21px] font-bold tracking-[-0.02em]">○○구청</span>
          </a>

          <nav aria-label="주 메뉴" className="ml-6 hidden lg:block">
            <ul className="flex gap-1">
              {MENU.map((m) => (
                <li key={m.title}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="h-11 rounded-md px-4 text-[17px] font-bold hover:bg-[#f3f5f8]"
                  >
                    {m.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <form
            role="search"
            className="ml-auto hidden items-center rounded-full border-2 px-4 md:flex"
            style={{ borderColor: NAVY }}
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="site-search" className="sr-only">
              통합 검색
            </label>
            <input id="site-search" placeholder="검색어를 입력하세요" className="h-10 w-48 bg-transparent text-[16px] outline-none xl:w-64" />
            <button type="submit" aria-label="검색" className="p-1">
              <Search size={20} />
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mega-menu"
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-md px-3 text-[16px] font-bold text-white md:ml-0"
            style={{ background: NAVY }}
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            전체 메뉴
          </button>
        </div>

        {menuOpen && (
          <div id="mega-menu" className="absolute inset-x-0 top-full border-t border-[#dfe3ea] bg-white shadow-[0_20px_40px_-20px_rgba(19,35,63,0.35)]">
            <div className={`${container} grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4`}>
              {MENU.map((m) => (
                <div key={m.title}>
                  <p className="border-b-2 pb-2 text-[18px] font-bold" style={{ borderColor: SUNSET }}>
                    {m.title}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {m.items.map((it) => (
                      <li key={it}>
                        <a href="#top" onClick={() => setMenuOpen(false)} className="block rounded px-1 py-1.5 text-[16px] text-[#3a4453] hover:text-[#17212b] hover:underline">
                          {it}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* 첫 화면: 구정 소식 배너 + 자주 찾는 민원 */}
        <section className="relative overflow-hidden text-white" style={{ background: NAVY }}>
          <Skyline className="absolute inset-x-0 bottom-0 h-[62%] w-full opacity-90" />
          <div className={`${container} relative grid gap-8 pb-10 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pb-16 lg:pt-14`}>
            <div className="flex min-h-[300px] flex-col" aria-roledescription="배너" aria-label="구정 소식">
              <p className="text-[15px] font-bold text-[#f6c7a8]">구정 소식</p>
              <div className="mt-4" aria-live={autoplay ? "off" : "polite"}>
                <span className="inline-block rounded-full px-3 py-1 text-[14px] font-bold text-[#13233f]" style={{ background: "#f6c7a8" }}>
                  {current.tag}
                </span>
                <h1 className="mt-3 text-[30px] font-bold leading-[1.3] tracking-[-0.02em] md:text-[44px]">{current.title}</h1>
                <p className="mt-3 max-w-[30rem] text-[17px] leading-[1.6] text-[#d7deea]">{current.body}</p>
                <p className="mt-2 text-[15px] text-[#b9c4d6]">{current.date}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 lg:mt-auto">
                <button type="button" aria-label="이전 소식" onClick={() => setSlide((s) => (s + SLIDES.length - 1) % SLIDES.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 hover:bg-white/10">
                  <ChevronLeft size={20} />
                </button>
                <span className="min-w-[48px] text-center text-[15px] tabular-nums">
                  {slide + 1} / {SLIDES.length}
                </span>
                <button type="button" aria-label="다음 소식" onClick={() => setSlide((s) => (s + 1) % SLIDES.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 hover:bg-white/10">
                  <ChevronRight size={20} />
                </button>
                <button
                  type="button"
                  aria-label={paused ? "자동 넘김 시작" : "자동 넘김 멈춤"}
                  onClick={() => setPaused((p) => !p)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 hover:bg-white/10"
                >
                  {paused ? <Play size={18} /> : <Pause size={18} />}
                </button>
              </div>
            </div>

            <div className="rounded-[18px] bg-white p-5 text-[#17212b] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] md:p-6">
              <h2 className="text-[19px] font-bold">자주 찾는 민원</h2>
              <ul className="mt-4 grid grid-cols-4 gap-2">
                {FREQUENT.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <a href="#phone" className="flex flex-col items-center gap-2 rounded-xl px-1 py-3 text-center hover:bg-[#fdf0ea]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf0ea]" style={{ color: SUNSET_TEXT }}>
                        <Icon size={24} aria-hidden />
                      </span>
                      <span className="text-[14px] font-bold leading-[1.35] break-keep">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 빠른 바로가기 */}
        <nav aria-label="바로가기" className="border-b border-[#dfe3ea] bg-white">
          <ul className={`${container} flex flex-wrap gap-x-6 gap-y-2 py-4`}>
            {QUICK.map((q) => (
              <li key={q}>
                <a href="#top" className="text-[16px] font-bold text-[#3a4453] hover:text-[#17212b]">
                  {q}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`${container} grid gap-6 py-10 lg:grid-cols-[1.4fr_1fr] lg:py-14`}>
          {/* 알림판 */}
          <section aria-labelledby="board-title" className="min-w-0 rounded-[18px] bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="board-title" className="text-[21px] font-bold">
                알림판
              </h2>
              <div role="tablist" aria-label="알림판 구분" className="flex flex-wrap gap-1 sm:ml-auto">
                {(Object.keys(BOARD) as (keyof typeof BOARD)[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={tab === k}
                    onClick={() => setTab(k)}
                    className={`h-10 rounded-full px-4 text-[15px] font-bold ${tab === k ? "text-white" : "bg-[#f3f5f8] text-[#3a4453] hover:bg-[#e8ecf2]"}`}
                    style={tab === k ? { background: NAVY } : undefined}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <ul role="tabpanel" aria-label={tab} className="mt-5 divide-y divide-[#e6e9ef]">
              {BOARD[tab].map((b) => (
                <li key={b.title}>
                  <a href="#top" className="grid gap-1 py-3.5 hover:bg-[#fafbfc] sm:grid-cols-[1fr_auto] sm:gap-4">
                    <span className="text-[17px] leading-[1.5]">{b.title}</span>
                    <span className="text-[14px] text-[#5a6473] tabular-nums">
                      {b.dept} <span className="ml-2">{b.date}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* 구청장 인사말 */}
          <section aria-labelledby="mayor-title" className="relative overflow-hidden rounded-[18px] p-6 text-white md:p-7" style={{ background: SUNSET_TEXT }}>
            <svg viewBox="0 0 200 200" className="absolute -right-10 -top-10 h-56 w-56 opacity-25" aria-hidden>
              <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" strokeWidth="2" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#fff" strokeWidth="2" />
              <circle cx="100" cy="100" r="30" fill="#fff" />
            </svg>
            <p className="text-[15px] font-bold text-[#ffe1d2]">구청장실</p>
            <h2 id="mayor-title" className="relative mt-2 text-[24px] font-bold leading-[1.4]">
              구민과 함께 만드는
              <br />
              ○○구
            </h2>
            <p className="relative mt-3 text-[16px] leading-[1.6] text-[#ffe9df]">○○구청장 홍○○입니다. 구정 운영 방향과 약속을 소개합니다.</p>
            <a href="#top" className="relative mt-6 inline-flex h-11 items-center rounded-md bg-white px-5 text-[16px] font-bold" style={{ color: SUNSET_TEXT }}>
              인사말 보기
            </a>
          </section>

          {/* 부서 전화번호 찾기 */}
          <section id="phone" aria-labelledby="phone-title" className="min-w-0 scroll-mt-4 rounded-[18px] bg-white p-5 md:p-7">
            <h2 id="phone-title" className="flex items-center gap-2 text-[21px] font-bold">
              <Phone size={22} aria-hidden style={{ color: SUNSET_TEXT }} />
              부서 전화번호 찾기
            </h2>
            <label htmlFor="dept-search" className="mt-4 block text-[15px] font-bold text-[#3a4453]">
              부서명 또는 업무
            </label>
            <div className="mt-1 flex items-center rounded-md border border-[#8a93a3] px-3 focus-within:outline focus-within:outline-2 focus-within:outline-[#13233f]">
              <Search size={18} aria-hidden className="text-[#5a6473]" />
              <input
                id="dept-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 여권, 주차, 보건소"
                className="h-12 w-full bg-transparent px-2 text-[17px] outline-none"
              />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-[15px]">
                <caption className="sr-only">부서 전화번호 검색 결과</caption>
                <thead>
                  <tr className="border-b-2 text-left" style={{ borderColor: NAVY }}>
                    <th scope="col" className="py-2 font-bold">부서</th>
                    <th scope="col" className="py-2 font-bold">담당 업무</th>
                    <th scope="col" className="py-2 text-right font-bold">전화</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((d) => (
                    <tr key={d.phone} className="border-b border-[#e6e9ef]">
                      <td className="py-2.5 font-bold">{d.dept}</td>
                      <td className="py-2.5 text-[#3a4453]">{d.work}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        <a href={`tel:${d.phone}`} className="underline-offset-2 hover:underline">
                          {d.phone}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length === 0 && <p className="py-6 text-center text-[16px] text-[#5a6473]">검색 결과가 없습니다. 다른 단어로 찾아보세요.</p>}
            </div>
          </section>

          {/* 동 주민센터 */}
          <section aria-labelledby="center-title" className="min-w-0 rounded-[18px] bg-white p-5 md:p-7">
            <h2 id="center-title" className="flex items-center gap-2 text-[21px] font-bold">
              <Building2 size={22} aria-hidden style={{ color: SUNSET_TEXT }} />
              동 주민센터
            </h2>
            <ul className="mt-4 grid gap-2">
              {CENTERS.map((c) => (
                <li key={c.name} className="flex items-center gap-3 rounded-xl bg-[#f3f5f8] px-4 py-3">
                  <MapPin size={18} aria-hidden className="shrink-0 text-[#5a6473]" />
                  <span className="flex-1">
                    <span className="block text-[16px] font-bold">{c.name}</span>
                    <span className="block text-[14px] text-[#5a6473]">○○구 {c.address}</span>
                  </span>
                  <a href={`tel:${c.phone}`} className="text-[15px] tabular-nums hover:underline">
                    {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer id="footer" className="text-[#c9d2e0]" style={{ background: "#0f1c33" }}>
        <div className={`${container} py-10 pb-28`}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
            <li>
              <a href="#footer" className="font-bold" style={{ color: "#ffb48f" }}>
                개인정보처리방침
              </a>
            </li>
            <li><a href="#footer" className="hover:text-white">누리집 이용 안내</a></li>
            <li><a href="#footer" className="hover:text-white">저작권 정책</a></li>
            <li><a href="#footer" className="hover:text-white">찾아오시는 길</a></li>
          </ul>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <address className="text-[15px] not-italic leading-[1.7]">
              (00000) □□시 ○○구 ○○로 100 ○○구청
              <br />
              대표전화 02-000-0000 (평일 09:00 ~ 18:00)
              <br />
              ○○구청 누리집의 모든 콘텐츠는 저작권법의 보호를 받습니다.
            </address>
            <div className="flex h-14 w-32 items-center justify-center rounded-md border border-[#3a4c6d] text-center text-[13px] leading-[1.3]">
              웹 접근성
              <br />
              품질인증 마크
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
