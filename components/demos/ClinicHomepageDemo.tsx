"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Noto_Serif_KR } from "next/font/google";
import { Bus, Car, ChevronRight, Menu, Phone, TrainFront, X } from "lucide-react";

/* 병원 홈페이지 데모: 가상의 샘플피부과의원.
   /demo/clinic-report(원내 결과지 프로그램)와 같은 병원으로 설정했다.
   병원명, 의료진, 주소, 전화번호, 사업자 정보는 모두 가상이다.

   디자인: 도자기처럼 맑은 바탕(#fbf9f8)과 살결빛 블러시(#f1e7e3), 짙은 자두빛 잉크(#2a2326),
   절제된 모브(#7a4b56) 한 가지 강조색. 제목은 명조(Noto Serif KR), 본문은 사이트 기본 고딕. */

const serif = Noto_Serif_KR({ weight: ["400", "700"], subsets: ["latin"], display: "swap", preload: false });

const CLINIC = "샘플피부과의원";
const TEL = "02-000-0000";

const C = {
  paper: "#fbf9f8",
  blush: "#f1e7e3",
  ink: "#2a2326",
  muted: "#5b5357",
  accent: "#7a4b56",
  line: "#e3d8d4",
  onInk: "#f3ecea",
  onInkMuted: "#c9b8b4",
  rose: "#e7c9c1",
};

const NAV = [
  { id: "about", label: "병원 소개" },
  { id: "treatments", label: "진료 안내" },
  { id: "doctors", label: "의료진" },
  { id: "fees", label: "비급여 안내" },
  { id: "location", label: "오시는 길" },
];

const TREATMENTS = [
  { title: "여드름", body: "염증성 여드름과 흉터를 피부 상태에 맞춰 약물, 압출, 레이저로 치료합니다." },
  { title: "기미·색소", body: "기미, 주근깨, 잡티의 깊이를 확인한 뒤 레이저와 약물 치료를 함께 진행합니다." },
  { title: "피부 탄력", body: "처진 피부와 잔주름을 고주파, 초음파 장비로 개선합니다." },
  { title: "모공", body: "넓어진 모공과 피지 분비를 관리하고 피부결을 정돈합니다." },
  { title: "제모", body: "얼굴, 겨드랑이, 팔다리 등 부위별로 레이저 제모를 진행합니다." },
  { title: "피부 질환 일반", body: "아토피, 습진, 두드러기, 사마귀 등 피부 질환을 진료합니다. 건강보험이 적용됩니다." },
];

const DOCTORS = [
  {
    name: "김샘플",
    role: "대표원장",
    field: "여드름, 색소 질환",
    career: ["피부과 전문의", "샘플대학교병원 피부과 전공의 수료", "대한피부과학회 정회원"],
    tone: ["#efdcd6", "#d9b9b0"],
  },
  {
    name: "이샘플",
    role: "원장",
    field: "피부 탄력, 레이저 시술",
    career: ["피부과 전문의", "샘플의료원 피부과 임상강사", "대한피부레이저학회 정회원"],
    tone: ["#e9e0dc", "#c9b3ad"],
  },
];

// 0=일요일 ~ 6=토요일
const HOURS = [
  { label: "월요일", day: 1, time: "09:30 ~ 19:00", open: [570, 1140] },
  { label: "화요일", day: 2, time: "09:30 ~ 19:00", open: [570, 1140] },
  { label: "수요일", day: 3, time: "09:30 ~ 19:00", open: [570, 1140] },
  { label: "목요일", day: 4, time: "09:30 ~ 19:00", open: [570, 1140] },
  { label: "금요일", day: 5, time: "09:30 ~ 19:00", open: [570, 1140] },
  { label: "토요일", day: 6, time: "09:30 ~ 14:00", open: [570, 840] },
  { label: "일요일·공휴일", day: 0, time: "휴진", open: null },
] as const;
const LUNCH = [780, 840]; // 평일 13:00 ~ 14:00

const FEES = [
  { item: "초진 진찰료(비급여 시술 상담)", unit: "1회", price: 10000, note: "" },
  { item: "여드름 압출", unit: "1회", price: 30000, note: "얼굴 전체" },
  { item: "색소 레이저", unit: "1회", price: 50000, note: "얼굴 전체" },
  { item: "점 제거", unit: "1개", price: 10000, note: "지름 2mm 이하" },
  { item: "고주파 탄력 시술", unit: "1회", price: 250000, note: "얼굴 전체" },
  { item: "초음파 탄력 시술", unit: "300샷", price: 300000, note: "" },
  { item: "모공 레이저", unit: "1회", price: 80000, note: "얼굴 전체" },
  { item: "겨드랑이 제모", unit: "1회", price: 20000, note: "양쪽" },
  { item: "진단서", unit: "1통", price: 20000, note: "" },
  { item: "진료기록 사본", unit: "1매", price: 1000, note: "6매부터 1매당 100원" },
];

const NOTICES = [
  { date: "2026.09.24", title: "추석 연휴 휴진 안내" },
  { date: "2026.09.02", title: "9월 토요일 진료 시간 안내" },
  { date: "2026.08.18", title: "주차장 이용 안내 변경" },
  { date: "2026.07.30", title: "여름철 자외선 차단제 사용 안내" },
];

const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const heading = `${serif.className} text-[28px] font-bold leading-[1.4] tracking-[-0.02em] md:text-[40px]`;

function useToday() {
  const [now, setNow] = useState<{ day: number; minutes: number } | null>(null);
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow({ day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() });
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function openStatus(now: { day: number; minutes: number } | null) {
  if (!now) return null;
  const row = HOURS.find((h) => h.day === now.day);
  if (!row || !row.open) return { text: "오늘은 휴진입니다", open: false };
  const [start, end] = row.open;
  if (now.minutes < start) return { text: "진료 시작 전입니다", open: false };
  if (now.minutes >= end) return { text: "오늘 진료가 끝났습니다", open: false };
  if (now.day >= 1 && now.day <= 5 && now.minutes >= LUNCH[0] && now.minutes < LUNCH[1])
    return { text: "점심시간입니다", open: false };
  return { text: "지금 진료 중입니다", open: true };
}

export function ClinicHomepageDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const now = useToday();
  const status = openStatus(now);

  return (
    <div className="min-h-screen text-[17px] leading-[1.5]" style={{ backgroundColor: C.paper, color: C.ink }}>
      <style>{`
        @keyframes clinic-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14px,10px) scale(1.04); } }
        .clinic-drift { animation: clinic-drift 18s ease-in-out infinite; transform-origin: center; }
        .clinic-drift-slow { animation: clinic-drift 26s ease-in-out infinite reverse; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) { .clinic-drift, .clinic-drift-slow { animation: none; } }
      `}</style>

      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: C.line, backgroundColor: "rgba(251,249,248,0.94)" }}>
        <div className={`${container} flex h-16 items-center justify-between gap-4`}>
          <a href="#top" className={`${serif.className} text-[20px] font-bold tracking-[-0.02em]`}>
            {CLINIC}
          </a>
          <nav className="hidden lg:block" aria-label="주 메뉴">
            <ul className="flex gap-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className="inline-flex h-10 items-center px-3 text-[16px] transition-colors hover:text-[#7a4b56]"
                    style={{ color: C.muted }}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${TEL}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: C.ink }}
            >
              <Phone size={15} aria-hidden />
              <span className="hidden sm:inline">전화 예약</span>
              <span className="sm:hidden">예약</span>
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden"
              style={{ borderColor: C.line }}
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-menu" className="border-t lg:hidden" style={{ borderColor: C.line, backgroundColor: C.paper }} aria-label="모바일 메뉴">
            <ul className={`${container} py-2`}>
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex h-12 items-center justify-between border-b text-[17px] last:border-b-0"
                    style={{ borderColor: C.line }}
                  >
                    {n.label}
                    <ChevronRight size={18} style={{ color: C.muted }} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="top">
        {/* 첫 화면: 큰 명조 병원명 + 살결 질감 그러데이션 */}
        <section id="about" className="relative scroll-mt-16 overflow-hidden">
          <SkinTexture />
          <div className={`${container} relative grid gap-10 pb-14 pt-14 md:pb-24 md:pt-24 lg:grid-cols-12 lg:items-end`}>
            <div className="lg:col-span-7">
              <p className="text-[17px] font-bold" style={{ color: C.accent }}>
                피부과 전문의 진료
              </p>
              <h1
                className={`${serif.className} mt-4 text-[44px] font-bold leading-[1.18] tracking-[-0.04em] sm:text-[60px] md:text-[84px]`}
              >
                샘플
                <br />
                피부과의원
              </h1>
              <p className="mt-6 max-w-[30rem] text-[19px]" style={{ color: C.muted }}>
                여드름, 기미·색소, 피부 탄력부터 피부 질환 일반 진료까지 봅니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`tel:${TEL}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[17px] font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: C.ink }}
                >
                  <Phone size={17} aria-hidden />
                  {TEL}
                </a>
                <a
                  href="#location"
                  className="inline-flex h-12 items-center rounded-full border px-6 text-[17px] font-bold transition-colors hover:bg-white"
                  style={{ borderColor: C.ink }}
                >
                  오시는 길
                </a>
              </div>
            </div>

            <aside
              className="rounded-[20px] p-6 md:p-7 lg:col-span-5"
              style={{ backgroundColor: "rgba(255,255,255,0.72)", boxShadow: `inset 0 0 0 1px ${C.line}` }}
              aria-label="진료시간 요약"
            >
              <p className={`${serif.className} text-[19px] font-bold`}>진료시간</p>
              <dl className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>평일</dt>
                  <dd className={`${serif.className} text-[24px] tabular-nums`}>09:30 ~ 19:00</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>토요일</dt>
                  <dd className={`${serif.className} text-[24px] tabular-nums`}>09:30 ~ 14:00</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt style={{ color: C.muted }}>점심시간</dt>
                  <dd className="tabular-nums">13:00 ~ 14:00</dd>
                </div>
              </dl>
              <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
                일요일, 공휴일 휴진
              </p>
              {status && (
                <p className="mt-4 inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.accent }}>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: status.open ? C.accent : C.onInkMuted }}
                    aria-hidden
                  />
                  {status.text}
                </p>
              )}
            </aside>
          </div>
        </section>

        {/* 진료 안내: 카드 대신 두 줄 목록 */}
        <section id="treatments" className="scroll-mt-16" style={{ backgroundColor: "#ffffff" }}>
          <div className={`${container} grid gap-10 py-16 md:py-24 lg:grid-cols-12`}>
            <h2 className={`${heading} lg:col-span-4`}>진료 안내</h2>
            <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
              {TREATMENTS.map((t) => (
                <li key={t.title} className="border-t py-6" style={{ borderColor: C.ink }}>
                  <h3 className={`${serif.className} text-[22px] font-bold`}>{t.title}</h3>
                  <p className="mt-2" style={{ color: C.muted }}>
                    {t.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 의료진 */}
        <section id="doctors" className="scroll-mt-16" style={{ backgroundColor: C.blush }}>
          <div className={`${container} py-16 md:py-24`}>
            <h2 className={heading}>의료진</h2>
            <ul className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8">
              {DOCTORS.map((d) => (
                <li key={d.name} className="grid grid-cols-[112px_1fr] gap-6 sm:grid-cols-[150px_1fr]">
                  <Portrait from={d.tone[0]} to={d.tone[1]} initial={d.name[0]} />
                  <div className="min-w-0 self-end">
                    <p className="text-[15px] font-bold" style={{ color: C.accent }}>
                      {d.role}
                    </p>
                    <h3 className={`${serif.className} text-[28px] font-bold leading-[1.3]`}>{d.name}</h3>
                    <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                      진료 분야 {d.field}
                    </p>
                    <ul className="mt-4 space-y-1 border-t pt-4" style={{ borderColor: "#d9c8c3" }}>
                      {d.career.map((c) => (
                        <li key={c} style={{ color: C.muted }}>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 진료시간: 짙은 판 위 큰 숫자 */}
        <section id="hours" className="scroll-mt-16" style={{ backgroundColor: C.ink, color: C.onInk }}>
          <div className={`${container} grid gap-10 py-16 md:py-24 lg:grid-cols-12`}>
            <div className="lg:col-span-4">
              <h2 className={heading}>진료시간</h2>
              <p className="mt-4" style={{ color: C.onInkMuted }}>
                접수는 진료 종료 30분 전까지 받습니다. 토요일은 점심시간 없이 진료합니다.
              </p>
              {status && (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-bold" style={{ backgroundColor: "rgba(243,236,234,0.1)", color: C.rose }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.open ? C.rose : C.onInkMuted }} aria-hidden />
                  {status.text}
                </p>
              )}
            </div>
            <table className="w-full lg:col-span-8">
              <caption className="sr-only">요일별 진료시간</caption>
              <tbody>
                {HOURS.map((h) => {
                  const isToday = now?.day === h.day;
                  return (
                    <tr key={h.label} className="border-b" style={{ borderColor: "rgba(243,236,234,0.16)" }}>
                      <th scope="row" className="py-4 pr-3 text-left font-normal" style={{ color: isToday ? C.onInk : C.onInkMuted }}>
                        <span className={isToday ? "font-bold" : ""}>{h.label}</span>
                        {isToday && (
                          <span className="ml-2 rounded-full px-2.5 py-0.5 text-[15px] font-bold" style={{ backgroundColor: C.rose, color: C.ink }}>
                            오늘
                          </span>
                        )}
                      </th>
                      <td
                        className={`${serif.className} py-4 text-right text-[22px] tabular-nums md:text-[28px] ${isToday ? "font-bold" : ""}`}
                        style={{ color: h.open ? C.onInk : C.rose }}
                      >
                        {h.time}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <th scope="row" className="py-4 pr-3 text-left font-normal" style={{ color: C.onInkMuted }}>
                    점심시간
                  </th>
                  <td className="py-4 text-right tabular-nums" style={{ color: C.onInkMuted }}>
                    13:00 ~ 14:00 (평일)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 비급여 진료비 */}
        <section id="fees" className="scroll-mt-16">
          <div className={`${container} py-16 md:py-24`}>
            <h2 className={heading}>비급여 진료비 안내</h2>
            <p className="mt-3" style={{ color: C.muted }}>
              「의료법」 제45조에 따라 비급여 진료비용을 안내합니다. 표시된 금액은 부가가치세를 포함한 금액입니다.
            </p>
            <div className="mt-8 overflow-x-auto border-t-2" style={{ borderColor: C.ink }}>
              <table className="w-full min-w-[560px]">
                <caption className="sr-only">비급여 진료비 목록</caption>
                <thead>
                  <tr className="border-b" style={{ borderColor: C.line }}>
                    <th scope="col" className="px-3 py-3 text-left font-bold">항목</th>
                    <th scope="col" className="px-3 py-3 text-left font-bold">단위</th>
                    <th scope="col" className="px-3 py-3 text-right font-bold">금액(원)</th>
                    <th scope="col" className="px-3 py-3 text-left font-bold">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {FEES.map((f) => (
                    <tr key={f.item} className="border-b transition-colors hover:bg-white" style={{ borderColor: C.line }}>
                      <td className="px-3 py-3.5">{f.item}</td>
                      <td className="px-3 py-3.5" style={{ color: C.muted }}>{f.unit}</td>
                      <td className="px-3 py-3.5 text-right font-bold tabular-nums">{f.price.toLocaleString()}</td>
                      <td className="px-3 py-3.5 text-[15px]" style={{ color: C.muted }}>{f.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
              최종 수정일 2026.09.01
            </p>
          </div>
        </section>

        {/* 공지사항 + 결과지 프로그램 */}
        <section id="notice" className="scroll-mt-16" style={{ backgroundColor: "#ffffff" }}>
          <div className={`${container} grid gap-10 py-16 md:py-24 lg:grid-cols-12`}>
            <div className="lg:col-span-7">
              <h2 className={heading}>공지사항</h2>
              <ul className="mt-8 border-t" style={{ borderColor: C.ink }}>
                {NOTICES.map((n) => (
                  <li key={n.title} className="border-b" style={{ borderColor: C.line }}>
                    <a href="#notice" className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-[#7a4b56]">
                      <span className="min-w-0 truncate">{n.title}</span>
                      <span className="shrink-0 text-[15px] tabular-nums" style={{ color: C.muted }}>
                        {n.date}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5 lg:pt-[76px]">
              <Link
                href="/demo/clinic-report"
                className="group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-[20px] p-6 md:p-7"
                style={{ backgroundColor: C.blush }}
              >
                <span className="relative">
                  <span className={`${serif.className} block text-[22px] font-bold`}>원내 결과지 프로그램</span>
                  <span className="mt-2 block" style={{ color: C.muted }}>
                    같은 병원에서 쓰는 피부 진단 결과지 출력 프로그램입니다.
                  </span>
                </span>
                <span className="relative mt-6 inline-flex items-center gap-1 font-bold" style={{ color: C.accent }}>
                  원내 결과지 프로그램 데모 보기
                  <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 오시는 길 */}
        <section id="location" className="scroll-mt-16">
          <div className={`${container} grid gap-8 py-16 md:py-24 lg:grid-cols-12`}>
            <div className="lg:col-span-7">
              <h2 className={heading}>오시는 길</h2>
              <div className="mt-8 overflow-hidden rounded-[20px]" style={{ boxShadow: `inset 0 0 0 1px ${C.line}` }}>
                <MapIllustration />
              </div>
            </div>
            <div className="lg:col-span-5 lg:pt-[76px]">
              <p className={`${serif.className} text-[22px] font-bold`}>샘플시 샘플로 123 샘플빌딩 4층</p>
              <p className="mt-1" style={{ color: C.muted }}>
                대표전화 {TEL}
              </p>
              <ul className="mt-6 border-t" style={{ borderColor: C.line }}>
                {[
                  { icon: TrainFront, title: "지하철", body: "샘플역 2번 출구에서 150m, 도보 2분" },
                  { icon: Bus, title: "버스", body: "샘플역 정류장 하차 (간선 100, 지선 1234)" },
                  { icon: Car, title: "주차", body: "건물 지하 주차장 이용, 진료 시 1시간 무료" },
                ].map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-3 border-b py-4" style={{ borderColor: C.line }}>
                    <Icon size={20} className="mt-0.5 shrink-0" style={{ color: C.accent }} aria-hidden />
                    <span>
                      <b className="block">{title}</b>
                      <span style={{ color: C.muted }}>{body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: C.ink, color: C.onInkMuted }}>
        <div className={`${container} py-10 pb-24`}>
          <p className={`${serif.className} text-[20px] font-bold`} style={{ color: C.onInk }}>
            {CLINIC}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
            {[
              ["상호", CLINIC],
              ["대표자", "김샘플"],
              ["주소", "샘플시 샘플로 123 샘플빌딩 4층"],
              ["전화", TEL],
              ["사업자등록번호", "000-00-00000"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt>{k}</dt>
                <dd style={{ color: C.onInk }}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[15px]">© {CLINIC}</p>
        </div>
      </footer>
    </div>
  );
}

/** 첫 화면 배경: 살결빛 그러데이션이 천천히 움직이고, 미세한 결 질감을 얹는다 */
function SkinTexture() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 800" aria-hidden>
      <defs>
        <radialGradient id="skin-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ecd3cb" />
          <stop offset="100%" stopColor="#ecd3cb" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="skin-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f3e4de" />
          <stop offset="100%" stopColor="#f3e4de" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="skin-c" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dcc1bb" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#dcc1bb" stopOpacity="0" />
        </radialGradient>
        <filter id="skin-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.25  0 0 0 0.05 0" />
        </filter>
      </defs>
      <rect width="1440" height="800" fill="#fbf9f8" />
      <g className="clinic-drift">
        <ellipse cx="1080" cy="260" rx="520" ry="380" fill="url(#skin-a)" />
      </g>
      <g className="clinic-drift-slow">
        <ellipse cx="760" cy="620" rx="560" ry="300" fill="url(#skin-b)" />
        <ellipse cx="1320" cy="640" rx="300" ry="260" fill="url(#skin-c)" />
      </g>
      <rect width="1440" height="800" filter="url(#skin-grain)" />
    </svg>
  );
}

/** 의료진 사진 자리: 아치형 틀 안에 살결빛 그러데이션 */
function Portrait({ from, to, initial }: { from: string; to: string; initial: string }) {
  return (
    <span
      className={`${serif.className} flex aspect-[3/4] w-full items-end justify-center rounded-t-full pb-5 text-[40px] font-bold`}
      style={{ background: `linear-gradient(170deg, ${from} 0%, ${to} 100%)`, color: "rgba(42,35,38,0.55)" }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function MapIllustration() {
  return (
    <svg viewBox="0 0 640 380" className="h-auto w-full" role="img" aria-label="샘플역 2번 출구와 병원 위치 약도">
      <rect width="640" height="380" fill="#f6f0ee" />
      {[
        [30, 30, 180, 120],
        [250, 30, 150, 120],
        [440, 30, 170, 120],
        [30, 210, 180, 140],
        [440, 210, 170, 140],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="14" fill="#ebe0dc" />
      ))}
      <rect x="250" y="210" width="150" height="140" rx="14" fill="#e2c9c2" />
      <rect x="0" y="160" width="640" height="40" fill="#fbf9f8" />
      <rect x="215" y="0" width="30" height="380" fill="#fbf9f8" />
      <rect x="405" y="0" width="30" height="380" fill="#fbf9f8" />
      <line x1="0" y1="180" x2="640" y2="180" stroke="#d9c8c3" strokeWidth="2" strokeDasharray="12 10" />
      <text x="20" y="152" fontSize="15" fill="#5b5357">샘플로</text>
      <g transform="translate(150 186)">
        <rect x="-44" y="18" width="88" height="30" rx="15" fill="#2a2326" />
        <text x="0" y="39" fontSize="15" fontWeight="700" fill="#f3ecea" textAnchor="middle">
          2번 출구
        </text>
      </g>
      <text x="36" y="250" fontSize="15" fill="#5b5357">샘플역</text>
      <path d="M194 204 L300 204 L318 226" fill="none" stroke="#7a4b56" strokeWidth="3" strokeDasharray="6 6" />
      <g transform="translate(325 268)">
        <path d="M0 -44 C-22 -44 -30 -26 -30 -16 C-30 6 0 30 0 30 C0 30 30 6 30 -16 C30 -26 22 -44 0 -44 Z" fill="#7a4b56" />
        <circle cx="0" cy="-16" r="11" fill="#fbf9f8" />
      </g>
      <text x="325" y="326" fontSize="15" fontWeight="700" fill="#2a2326" textAnchor="middle">
        샘플빌딩 4층
      </text>
    </svg>
  );
}
