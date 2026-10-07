"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight, Menu, Phone, X } from "lucide-react";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";

/* 피부과 홈페이지 데모: 가상의 곰파트너피부과의원.
   병원명, 의료진, 주소, 전화번호, 사업자 정보, 진료비는 모두 가상이다.

   구성: 실제 동네 피부과에서 흔한 두 갈래형.
   첫 화면을 "피부질환 진료"(건강보험)와 "피부미용 시술"(비급여) 두 판으로 나누고,
   메뉴와 문의 전화도 일반진료 / 시술상담 둘로 나눈다. 갈래마다 색을 따로 쓴다.
   메인은 첫 화면 사진, 두 갈래 진료 안내, 요일별 진료시간 띠(오늘 강조), 장비소개 탭, 의료진, 공지사항 · 오시는 길 순서.
   하위 페이지는 라우트를 늘리지 않고 상태로 화면을 바꾼다(기본 패키지 5쪽 구성).

   사진 출처(Unsplash 무료 라이선스, public/images/demo-clinic-homepage):
   hero AI 생성(Z-Image-Turbo, Apache 2.0), acne karelys Ruiz(PqyzuzFiQfY), pigment Reece van der Merwe(4p6XsMzkTsE),
   lifting Look Studio(HtXyytr9304), pores Look Studio(TQSPgNqeCo8), hair Farhad Ibrahimzade(szpFxaqS658),
   lobby Ishan Sharma(0EWVvxSyDE0), doctor-a·doctor-b AI 생성(Z-Image-Turbo, Apache 2.0) */

const IMG = "/images/demo-clinic-homepage";
const CLINIC = "곰파트너피부과의원";
const TEL_MED = "02-000-0000";
const TEL_COS = "02-000-0001";
const ADDRESS = "□□시 □□로 123 □□빌딩 4층";

const C = {
  paper: "#fbf9f8",
  ink: "#2a2326",
  muted: "#5b5357",
  line: "#e3d8d4",
  onInk: "#f3ecea",
  onInkMuted: "#c9b8b4",
};

/** 두 갈래 색: 피부질환 진료는 차분한 청회색, 피부미용 시술은 모브 */
const TRACK = {
  medical: { accent: "#2f5469", tint: "#e8eff2", soft: "#cddbe2" },
  beauty: { accent: "#7a4b56", tint: "#f1e7e3", soft: "#e7c9c1" },
} as const;
type Track = keyof typeof TRACK;

type Page = "home" | "about" | "medical" | "beauty" | "fees" | "notice";

const NAV: { id: Exclude<Page, "home">; label: string; track?: Track }[] = [
  { id: "about", label: "병원소개" },
  { id: "medical", label: "피부질환 진료", track: "medical" },
  { id: "beauty", label: "피부미용 시술", track: "beauty" },
  { id: "fees", label: "비용 안내" },
  { id: "notice", label: "공지사항" },
];

/* ---------- 피부질환 진료 ---------- */

const DISEASES = [
  { title: "습진 · 알레르기", items: "아토피 피부염, 접촉성 피부염, 두드러기, 건선", body: "원인과 악화 요인을 확인한 뒤 바르는 약, 먹는 약, 광선치료를 병행합니다." },
  { title: "바이러스 질환", items: "사마귀, 대상포진, 단순포진", body: "대상포진은 발진 후 72시간 안에 항바이러스제를 시작해야 신경통을 줄일 수 있습니다." },
  { title: "손발 · 손발톱", items: "티눈, 굳은살, 내성발톱, 손발톱진균증, 무좀", body: "진균 검사로 무좀과 습진을 구분해 치료합니다. 내성발톱은 당일 교정 가능합니다." },
  { title: "기타 피부질환", items: "지루성 피부염, 백반증, 화상, 피부 양성종양", body: "백반증, 건선은 엑시머 레이저 광선치료를 시행합니다. 혹과 점은 조직 검사 후 제거합니다." },
];

/* ---------- 피부미용 시술 ---------- */

type Cat = "pigment" | "lifting" | "botox" | "hair";
const CATS: { id: Cat; label: string; img: string; intro: string }[] = [
  { id: "pigment", label: "색소 · 여드름 · 미백", img: "pigment", intro: "기미, 잡티, 여드름, 흉터를 피부 상태에 맞는 레이저와 관리로 치료합니다." },
  { id: "lifting", label: "주름 · 탄력 리프팅", img: "lifting", intro: "고주파, 초음파 장비와 스킨부스터로 처진 피부와 잔주름을 개선합니다." },
  { id: "botox", label: "보톡스 · 필러", img: "pores", intro: "표정 주름, 사각턱, 꺼진 부위를 진료 후 꼭 필요한 만큼만 시술합니다." },
  { id: "hair", label: "탈모 · 제모", img: "hair", intro: "부위별 레이저 제모, 탈모 진단 및 두피 주사 치료를 시행합니다." },
];

interface Procedure {
  cat: Cat | "disease";
  name: string;
  once: number;
  pack?: string;
  note?: string;
}

const PROCEDURES: Procedure[] = [
  { cat: "pigment", name: "레이저 토닝 (얼굴 전체)", once: 50000, pack: "10회 45만 원", note: "기미 · 잡티" },
  { cat: "pigment", name: "피코 레이저", once: 150000, pack: "3회 40만 원", note: "얼굴 전체" },
  { cat: "pigment", name: "여드름 압출 관리", once: 30000, pack: "5회 13만 원" },
  { cat: "pigment", name: "여드름 흉터 레이저", once: 150000, pack: "3회 40만 원", note: "흉터 범위에 따라 다름" },
  { cat: "pigment", name: "점 제거", once: 10000, note: "1개, 지름 2mm 이하" },
  { cat: "lifting", name: "고주파 리프팅 (300샷)", once: 250000, pack: "3회 69만 원", note: "얼굴 전체" },
  { cat: "lifting", name: "초음파 리프팅 (300샷)", once: 300000, pack: "3회 84만 원" },
  { cat: "lifting", name: "스킨부스터 주사", once: 200000, pack: "3회 54만 원" },
  { cat: "botox", name: "이마 보톡스 (국산)", once: 50000 },
  { cat: "botox", name: "사각턱 보톡스 (국산)", once: 70000, pack: "2회 13만 원" },
  { cat: "botox", name: "필러 (1cc)", once: 250000, note: "부위에 따라 용량 다름" },
  { cat: "hair", name: "겨드랑이 제모", once: 20000, pack: "5회 8만 원", note: "양쪽" },
  { cat: "hair", name: "인중 제모", once: 10000, pack: "5회 4만 원" },
  { cat: "hair", name: "두피 주사 (탈모)", once: 50000, pack: "4회 18만 원" },
  { cat: "disease", name: "사마귀 레이저", once: 50000, pack: "3회 13만 원", note: "실손보험 처리 가능" },
  { cat: "disease", name: "켈로이드 주사", once: 30000, note: "실손보험 처리 가능" },
  { cat: "disease", name: "액취증 레이저", once: 300000, note: "실손보험 처리 가능 (진단서 발급)" },
];

/* ---------- 장비 ---------- */

type EquipTab = "laser" | "lifting" | "care" | "photo";
const EQUIP: { id: EquipTab; label: string; items: { name: string; body: string }[] }[] = [
  {
    id: "laser",
    label: "레이저",
    items: [
      { name: "피코 레이저", body: "기미, 잡티, 문신 제거" },
      { name: "엔디야그 레이저", body: "레이저 토닝, 색소 치료" },
      { name: "프락셀 레이저", body: "여드름 흉터, 모공" },
    ],
  },
  {
    id: "lifting",
    label: "리프팅",
    items: [
      { name: "고주파 리프팅 장비", body: "피부 탄력, 잔주름" },
      { name: "집속 초음파 리프팅 장비", body: "처진 턱선, 이중턱" },
    ],
  },
  {
    id: "care",
    label: "스킨케어",
    items: [
      { name: "LED 관리기", body: "시술 후 진정, 여드름 염증 완화" },
      { name: "초음파 도포기", body: "앰플 흡수, 보습" },
    ],
  },
  {
    id: "photo",
    label: "백반증 · 건선",
    items: [
      { name: "엑시머 레이저", body: "백반증, 건선 부위 광선치료" },
      { name: "전신 자외선 치료기", body: "넓은 부위 건선, 아토피 피부염" },
    ],
  },
];

/* ---------- 의료진 ---------- */

const DOCTORS = [
  {
    name: "김ㅈ우",
    role: "대표원장",
    photo: "doctor-a.jpg",
    field: "피부질환, 여드름 · 색소",
    career: ["피부과 전문의", "△△대학교병원 피부과 전공의 수료", "대한피부과학회 정회원"],
  },
  {
    name: "이ㅅ연",
    role: "원장",
    photo: "doctor-b.jpg",
    field: "리프팅, 레이저 시술",
    career: ["피부과 전문의", "△△의료원 피부과 임상강사", "대한피부레이저학회 정회원"],
  },
];

/* ---------- 진료시간 ---------- */

// 0=일요일 ~ 6=토요일, 월요일부터 적는다
const HOURS = [
  { short: "월", label: "월요일", day: 1, start: "09:30", end: "19:00", open: [570, 1140] },
  { short: "화", label: "화요일", day: 2, start: "09:30", end: "19:00", open: [570, 1140] },
  { short: "수", label: "수요일", day: 3, start: "09:30", end: "19:00", open: [570, 1140] },
  { short: "목", label: "목요일", day: 4, start: "09:30", end: "19:00", open: [570, 1140] },
  { short: "금", label: "금요일", day: 5, start: "09:30", end: "19:00", open: [570, 1140] },
  { short: "토", label: "토요일", day: 6, start: "09:30", end: "14:00", open: [570, 840] },
  { short: "일", label: "일요일 · 공휴일", day: 0, start: "", end: "", open: null },
] as const;

type Now = { day: number; minutes: number };

function useToday() {
  const [now, setNow] = useState<Now | null>(null);
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

/* ---------- 법정 비급여 진료비 ---------- */

const FEES = [
  { item: "초진 진찰료 (비급여 시술 상담)", unit: "1회", price: 10000, note: "" },
  { item: "여드름 압출", unit: "1회", price: 30000, note: "얼굴 전체" },
  { item: "색소 레이저", unit: "1회", price: 50000, note: "얼굴 전체" },
  { item: "점 제거", unit: "1개", price: 10000, note: "지름 2mm 이하" },
  { item: "사마귀 레이저", unit: "1회", price: 50000, note: "병변 5개 이하" },
  { item: "고주파 리프팅", unit: "300샷", price: 250000, note: "얼굴 전체" },
  { item: "초음파 리프팅", unit: "300샷", price: 300000, note: "" },
  { item: "겨드랑이 제모", unit: "1회", price: 20000, note: "양쪽" },
  { item: "진단서", unit: "1통", price: 20000, note: "" },
  { item: "진료기록 사본", unit: "1매", price: 1000, note: "6매부터 1매당 100원" },
];

const NOTICE_TOTAL = 214;
// ago: 오늘 기준 며칠 전 작성. 날짜가 필요한 본문은 오늘 기준으로 계산한다.
const nextWed = (t: Date) => {
  const d = daysAgo(t, -3);
  return daysAgo(d, -((3 - d.getDay() + 7) % 7));
};
const NOTICES: { no: number; ago: number; title: string; body: string | ((t: Date) => string) }[] = [
  { no: 214, ago: 5, title: "공휴일 휴진 안내", body: "공휴일은 휴진합니다. 토요일은 09:30~14:00 정상 진료합니다." },
  { no: 213, ago: 11, title: "대표원장 학회 참석으로 오후 휴진 안내", body: (t) => `대표원장 학회 참석으로 ${fmtKo(nextWed(t))}은 13:00까지 진료합니다. 해당일 오후 예약 환자분께는 개별 연락드렸습니다.` },
  { no: 212, ago: 23, title: "피코 레이저 장비 1대 추가 도입", body: "피코 레이저 1대를 추가 도입했습니다. 평일 저녁에도 시술 예약이 가능합니다." },
  { no: 211, ago: 39, title: "초음파 리프팅 비용 변경 안내", body: (t) => `${fmtKo(daysAgo(t, -25))}부터 초음파 리프팅 300샷 비용이 30만 원에서 33만 원으로 변경됩니다. 그 전날까지 결제하신 분은 기존 비용으로 진행합니다.` },
  { no: 210, ago: 50, title: "건물 주차장 무료 시간 2시간으로 변경", body: "진료 시 건물 주차장 2시간 무료입니다. 접수 시 차량 번호를 말씀해 주세요." },
  { no: 209, ago: 69, title: "대상포진, 발진 후 72시간 이내 진료가 중요합니다", body: "띠 모양 물집과 따끔거리는 통증이 있다면 빠른 진료를 권해 드립니다. 발진 후 72시간 이내 항바이러스제 치료를 시작해야 신경통을 줄일 수 있습니다." },
  { no: 208, ago: 88, title: "토요일 접수 마감 13:30으로 변경", body: "토요일은 점심시간 없이 진료합니다. (접수 마감 13:30)" },
];
const FEE_AGO = 36; // 비용표 기준일(오늘 기준 며칠 전)
const fmtYMD = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

const man = (n: number) => (n >= 10000 ? `${(n / 10000).toLocaleString("ko-KR")}만 원` : `${n.toLocaleString("ko-KR")}원`);
const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2 = "text-[26px] font-semibold leading-[1.3] tracking-[-0.03em] md:text-[34px]";

/* ================================================================ */

export function ClinicHomepageDemo() {
  const [page, setPage] = useState<Page>("home");
  const [feeTab, setFeeTab] = useState<"price" | "legal">("price");
  const [menuOpen, setMenuOpen] = useState(false);
  const now = useToday();
  useEffect(() => {
    const f = () => {
      setPage("home");
      setMenuOpen(false);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (p: Page, tab?: "price" | "legal") => {
    setPage(p);
    if (tab) setFeeTab(tab);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen text-[17px] leading-[1.5]" style={{ backgroundColor: C.paper, color: C.ink }}>
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: C.line, backgroundColor: C.paper }}>
        <div className={`${container} flex h-16 items-center justify-between gap-4 lg:h-[76px]`}>
          {page === "home" ? (
            <h1>
              <button type="button" onClick={() => go("home")} aria-label={CLINIC} className="flex">
                <BrandLogo />
              </button>
            </h1>
          ) : (
            <button type="button" onClick={() => go("home")} aria-label={CLINIC} className="flex">
              <BrandLogo />
            </button>
          )}

          <nav className="hidden lg:block" aria-label="주 메뉴">
            <ul className="flex items-center">
              {NAV.map((n, i) => {
                const on = page === n.id;
                const color = n.track ? TRACK[n.track].accent : C.ink;
                return (
                  <li key={n.id} className={`flex items-center ${i === 1 ? "ml-3 border-l pl-3" : ""} ${i === 3 ? "ml-3 border-l pl-3" : ""}`} style={{ borderColor: C.line }}>
                    <button
                      type="button"
                      onClick={() => go(n.id)}
                      aria-current={on ? "page" : undefined}
                      className="relative inline-flex h-10 items-center px-3 text-[16px] font-semibold"
                      style={{ color: on || n.track ? color : C.muted }}
                    >
                      {n.track && <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />}
                      {n.label}
                      {on && <span className="absolute inset-x-3 -bottom-[17px] h-[3px]" style={{ backgroundColor: color }} aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden gap-4 xl:flex">
              <PhoneLine label="일반진료" tel={TEL_MED} track="medical" />
              <PhoneLine label="시술상담" tel={TEL_COS} track="beauty" />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border lg:hidden"
              style={{ borderColor: C.line }}
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-menu" className="border-t lg:hidden" style={{ borderColor: C.line }} aria-label="전체 메뉴">
            <ul className={`${container} py-2`}>
              {NAV.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => go(n.id)}
                    aria-current={page === n.id ? "page" : undefined}
                    className="flex h-12 w-full items-center justify-between border-b text-[17px]"
                    style={{ borderColor: C.line, color: n.track ? TRACK[n.track].accent : C.ink, fontWeight: n.track ? 600 : 400 }}
                  >
                    {n.label}
                    <ChevronRight size={18} style={{ color: C.muted }} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <div className={`${container} grid grid-cols-2 gap-2 pb-4`}>
              <CallButton label="일반진료 문의" tel={TEL_MED} track="medical" />
              <CallButton label="미용시술 상담" tel={TEL_COS} track="beauty" />
            </div>
          </nav>
        )}
      </header>

      <main key={page} className="soft-in">
        {page === "home" && <Home now={now} go={go} />}
        {page === "medical" && <MedicalPage now={now} />}
        {page === "beauty" && <BeautyPage go={go} />}
        {page === "fees" && <FeesPage tab={feeTab} setTab={setFeeTab} />}
        {page === "about" && <AboutPage now={now} />}
        {page === "notice" && <NoticePage />}
      </main>

      <footer style={{ backgroundColor: C.ink, color: C.onInkMuted }}>
        <div className={`${container} grid gap-6 py-10 pb-28 md:grid-cols-2`}>
          <div>
            <p style={{ color: C.onInk }}>
              <BrandLogo />
            </p>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
              {[
                ["상호", "ㅅㅎ피부과의원"],
                ["대표자", "김ㅈ우"],
                ["주소", ADDRESS],
                ["사업자등록번호", "000-00-00000"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt>{k}</dt>
                  <dd style={{ color: C.onInk }}>{v}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-4 flex flex-wrap gap-x-5 text-[15px]">
              <li>
                <button type="button" className="font-semibold hover:underline" style={{ color: C.onInk }}>
                  개인정보처리방침
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go("fees", "legal")} className="hover:underline">
                  비급여 진료비 안내
                </button>
              </li>
            </ul>
          </div>
          <dl className="grid content-start gap-2 md:justify-end">
            <div className="flex items-baseline gap-3">
              <dt className="w-16 text-[15px]">일반진료</dt>
              <dd className="text-[22px] font-semibold tabular-nums" style={{ color: C.onInk }}>
                {TEL_MED}
              </dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="w-16 text-[15px]">시술상담</dt>
              <dd className="text-[22px] font-semibold tabular-nums" style={{ color: C.onInk }}>
                {TEL_COS}
              </dd>
            </div>
          </dl>
        </div>
      </footer>
    </div>
  );
}

/* ---------- 공용 조각 ---------- */

function PhoneLine({ label, tel, track }: { label: string; tel: string; track: Track }) {
  return (
    <a href={`tel:${tel}`} className="leading-tight hover:underline">
      <span className="block text-[13px] font-semibold" style={{ color: TRACK[track].accent }}>
        {label}
      </span>
      <span className="block text-[16px] font-semibold tabular-nums">{tel}</span>
    </a>
  );
}

function CallButton({ label, tel, track, light }: { label: string; tel: string; track: Track; light?: boolean }) {
  return (
    <a
      href={`tel:${tel}`}
      className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[6px] px-5 text-[16px] font-semibold transition-opacity hover:opacity-90"
      style={light ? { backgroundColor: "#fff", color: TRACK[track].accent } : { backgroundColor: TRACK[track].accent, color: "#fff" }}
    >
      <Phone size={16} aria-hidden />
      {label}
    </a>
  );
}

/** 탭: 화살표 키로 옮겨 다닌다 */
function Tabs<T extends string>({
  id,
  label,
  tabs,
  value,
  onChange,
  accent,
}: {
  id: string;
  label: string;
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  accent: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b" style={{ borderColor: C.line }}>
      {tabs.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${t.id}`}
            aria-selected={on}
            aria-controls={`${id}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (!dir) return;
              e.preventDefault();
              const next = (i + dir + tabs.length) % tabs.length;
              onChange(tabs[next].id);
              refs.current[next]?.focus();
            }}
            className="relative h-12 shrink-0 px-4 text-[16px]"
            style={{ color: on ? accent : C.muted, fontWeight: on ? 700 : 400 }}
          >
            {t.label}
            {on && <span className="absolute inset-x-2 bottom-0 h-[3px]" style={{ backgroundColor: accent }} aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

function PageBand({ title, sub, track, children }: { title: string; sub: string; track?: Track; children?: React.ReactNode }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const t = track ? TRACK[track] : null;
  return (
    <div style={{ backgroundColor: t ? t.tint : "#fff", borderBottom: `1px solid ${C.line}` }}>
      <div className={`${container} flex flex-wrap items-end justify-between gap-6 py-10 md:py-14`}>
        <div>
          <p className="text-[16px] font-semibold" style={{ color: t ? t.accent : C.muted }}>
            {sub}
          </p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-[36px] font-light leading-[1.2] tracking-[-0.05em] outline-none md:text-[52px]">
            {title}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- 메인 ---------- */

function Home({ now, go }: { now: Now | null; go: (p: Page) => void }) {
  const today = useDemoToday();
  return (
    <>
      {/* 첫 화면 */}
      <section className="relative isolate overflow-hidden" style={{ backgroundColor: TRACK.beauty.tint }} aria-labelledby="hero-title">
        <Image src={`${IMG}/hero.jpg`} alt="" fill priority sizes="100vw" className="-z-10 object-cover object-[70%_30%]" />
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(90deg, rgba(251,249,248,0.94) 0%, rgba(251,249,248,0.75) 45%, rgba(251,249,248,0) 75%)" }} aria-hidden />
        <div className={`${container} py-16 md:py-24`}>
          <p className="text-[16px] font-semibold" style={{ color: TRACK.beauty.accent }}>
            피부과 전문의 2인 진료
          </p>
          <h2 id="hero-title" className="mt-2 max-w-[520px] text-[36px] font-light leading-[1.2] tracking-[-0.05em] md:text-[52px]">
            피부질환 진료와
            <br />
            피부미용 시술
          </h2>
          <p className="mt-4 text-[17px] md:text-[18px]" style={{ color: C.muted }}>
            평일 19:00, 토요일 14:00까지 진료합니다.
          </p>
        </div>
      </section>

      {/* 두 갈래 진료 안내 */}
      <section id="two-ways" aria-label="진료 분야" className={`${container} grid gap-x-10 md:grid-cols-2`}>
        <WayPanel
          track="medical"
          badge="건강보험 진료"
          title="피부질환 진료"
          lines={DISEASES.map((d) => d.items)}
          phoneLabel="일반진료"
          tel={TEL_MED}
          callLabel="일반진료 문의"
          onMore={() => go("medical")}
        />
        <WayPanel
          track="beauty"
          badge="비급여 시술"
          title="피부미용 시술"
          lines={CATS.map((c) => c.label)}
          phoneLabel="시술상담"
          tel={TEL_COS}
          callLabel="미용시술 상담"
          onMore={() => go("beauty")}
        />
      </section>

      <WeekHours id="today-hours" now={now} />

      <EquipmentSection />

      {/* 의료진 */}
      <section className={`${container} py-14 md:py-20`} aria-labelledby="doctors-title">
        <h2 id="doctors-title" className={h2}>
          의료진 소개
        </h2>
        <DoctorRows />
      </section>

      {/* 공지사항 · 오시는 길 */}
      <section className="border-t bg-white" style={{ borderColor: C.line }}>
        <div className={`${container} grid gap-10 py-14 md:py-20 lg:grid-cols-2`}>
          <div className="min-w-0">
            <div className="flex items-end justify-between">
              <h2 className={h2}>공지사항</h2>
              <button type="button" onClick={() => go("notice")} className="inline-flex items-center text-[15px] font-semibold" style={{ color: C.muted }}>
                더보기
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
            <ul className="mt-6 border-t" style={{ borderColor: C.ink }}>
              {NOTICES.slice(0, 5).map((n) => (
                <li key={n.no} className="flex items-center justify-between gap-4 border-b py-3.5" style={{ borderColor: C.line }}>
                  <span className="min-w-0 truncate">{n.title}</span>
                  <span className="shrink-0 text-[15px] tabular-nums" style={{ color: C.muted }}>
                    {fmtDot(daysAgo(today, n.ago))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={h2}>오시는 길</h2>
            <Location />
          </div>
        </div>
      </section>
    </>
  );
}

function WayPanel({
  track,
  badge,
  title,
  lines,
  phoneLabel,
  tel,
  callLabel,
  onMore,
}: {
  track: Track;
  badge: string;
  title: string;
  lines: string[];
  phoneLabel: string;
  tel: string;
  callLabel: string;
  onMore: () => void;
}) {
  const t = TRACK[track];
  return (
    <article className="flex flex-col border-t-[3px] py-8 md:py-10" style={{ borderColor: t.accent }} aria-labelledby={`way-${track}`}>
      <p className="text-[15px] font-semibold" style={{ color: t.accent }}>
        {badge}
      </p>
      <h2 id={`way-${track}`} className="mt-1 text-[30px] font-light leading-[1.2] tracking-[-0.05em] md:text-[38px]">
        {title}
      </h2>
      <ul className="mt-4 space-y-1">
        {lines.map((l) => (
          <li key={l} style={{ color: C.muted }}>
            {l}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <p className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold" style={{ color: t.accent }}>
            {phoneLabel}
          </span>
          <a href={`tel:${tel}`} className="text-[24px] font-semibold tracking-[-0.02em] tabular-nums hover:underline">
            {tel}
          </a>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CallButton label={callLabel} tel={tel} track={track} />
          <button
            type="button"
            onClick={onMore}
            className="inline-flex h-12 items-center gap-0.5 rounded-[6px] border px-5 text-[16px] font-semibold transition-colors"
            style={{ borderColor: t.accent, color: t.accent, backgroundColor: "#fff" }}
          >
            자세히 보기
            <ChevronRight size={17} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

/** 요일별 진료시간 띠. 오늘 칸만 진하게 채우고 다른 실시간 표시는 두지 않는다 */
function WeekHours({ id, now }: { id: string; now: Now | null }) {
  return (
    <section id={id} className="border-b bg-white" style={{ borderColor: C.line }} aria-labelledby={`${id}-title`}>
      <div className={`${container} grid gap-6 py-8 md:py-10 lg:grid-cols-[220px_1fr] lg:items-center`}>
        <div>
          <h2 id={`${id}-title`} className="text-[24px] font-semibold tracking-[-0.03em]">
            진료시간
          </h2>
        </div>
        <div>
          <ol className="grid grid-cols-7 gap-1 sm:gap-2" aria-label="요일별 진료시간">
            {HOURS.map((h) => {
              const isToday = now?.day === h.day;
              return (
                <li
                  key={h.short}
                  className="flex flex-col items-center rounded-[6px] px-0.5 py-3 text-center"
                  style={{ backgroundColor: isToday ? C.ink : C.paper, color: isToday ? "#fff" : C.ink, border: `1px solid ${isToday ? C.ink : C.line}` }}
                  aria-current={isToday ? "date" : undefined}
                >
                  <span className="text-[15px] font-semibold" style={{ color: isToday ? "#fff" : h.open ? C.ink : "#b3261e" }}>
                    <span className="sr-only">{h.label}</span>
                    <span aria-hidden>{h.short}</span>
                  </span>
                  {h.open ? (
                    <span className="mt-1 text-[13px] leading-[1.35] tabular-nums sm:text-[15px]">
                      {h.start}
                      <span className="block" aria-hidden>
                        ~
                      </span>
                      <span className="sr-only">부터 </span>
                      {h.end}
                    </span>
                  ) : (
                    <span className="mt-1 text-[13px] font-semibold sm:text-[15px]" style={{ color: isToday ? "#fff" : "#b3261e" }}>
                      휴진
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
            점심시간 13:00 ~ 14:00 (평일). 토요일은 점심시간 없이 진료합니다. 접수 마감은 진료 종료 30분 전입니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function EquipmentSection() {
  const [tab, setTab] = useState<EquipTab>("laser");
  const current = EQUIP.find((e) => e.id === tab)!;
  return (
    <section id="equipment" className={`${container} py-14 md:py-20`} aria-labelledby="equipment-title">
      <h2 id="equipment-title" className={h2}>
        장비소개
      </h2>
      <div className="mt-6">
        <Tabs id="equip" label="장비 분류" tabs={EQUIP} value={tab} onChange={setTab} accent={TRACK.beauty.accent} />
        <ul key={tab} id="equip-panel" role="tabpanel" aria-labelledby={`equip-tab-${tab}`} className="soft-in grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {current.items.map((e) => (
            <li key={e.name} className="border-b py-5" style={{ borderColor: C.line }}>
              <p className="text-[20px] font-semibold tracking-[-0.02em]">{e.name}</p>
              <p className="mt-1" style={{ color: C.muted }}>
                {e.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DoctorRows() {
  return (
    <ul className="mt-8 border-t" style={{ borderColor: C.ink }}>
      {DOCTORS.map((d) => (
        <li key={d.name} className="flex gap-5 border-b py-6 md:items-center" style={{ borderColor: C.line }}>
          <div className="relative aspect-[4/5] w-[96px] shrink-0 overflow-hidden rounded-[8px] md:w-[128px]" style={{ backgroundColor: C.line }}>
            <Image src={`${IMG}/${d.photo}`} alt={`${d.role} ${d.name}`} fill sizes="128px" className="object-cover" style={{ objectPosition: "50% 22%" }} />
          </div>
          <div className="grid min-w-0 flex-1 gap-x-5 gap-y-3 md:grid-cols-[220px_1fr] md:items-center">
            <div>
              <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
                {d.role}
              </p>
              <h3 className="text-[26px] font-semibold tracking-[-0.03em]">{d.name}</h3>
            </div>
            <div>
              <p className="font-semibold">진료 분야 {d.field}</p>
              <ul className="mt-1 flex flex-wrap gap-x-4 text-[15px]" style={{ color: C.muted }}>
                {d.career.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Location() {
  return (
    <>
      <p className="mt-6 text-[20px] font-semibold tracking-[-0.02em]">{ADDRESS}</p>
      <dl className="mt-4 border-t" style={{ borderColor: C.line }}>
        {[
          ["대중교통", "□□역 2번 출구에서 도보 2분"],
          ["주차안내", "건물 주차장 2시간 무료, 접수에서 차량 번호 등록"],
          ["일반진료", TEL_MED],
          ["시술상담", TEL_COS],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[88px_1fr] gap-3 border-b py-3.5" style={{ borderColor: C.line }}>
            <dt className="font-semibold">{k}</dt>
            <dd className="tabular-nums" style={{ color: C.muted }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/* ---------- 피부질환 진료 ---------- */

function MedicalPage({ now }: { now: Now | null }) {
  const t = TRACK.medical;
  return (
    <>
      <PageBand title="피부질환 진료" sub="건강보험 진료" track="medical">
        <div className="flex flex-wrap items-center gap-3">
          <PhoneLine label="일반진료" tel={TEL_MED} track="medical" />
          <CallButton label="일반진료 문의" tel={TEL_MED} track="medical" />
        </div>
      </PageBand>

      <section className={`${container} py-12 md:py-16`} aria-labelledby="disease-title">
        <h2 id="disease-title" className={h2}>
          진료 질환
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {DISEASES.map((d) => (
            <li key={d.title} className="rounded-[16px] border bg-white p-6" style={{ borderColor: C.line }}>
              <h3 className="text-[20px] font-semibold" style={{ color: t.accent }}>
                {d.title}
              </h3>
              <p className="mt-1 font-semibold">{d.items}</p>
              <p className="mt-3" style={{ color: C.muted }}>
                {d.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white" aria-labelledby="reception-title">
        <div className={`${container} grid gap-8 py-12 md:py-16 lg:grid-cols-2`}>
          <div>
            <h2 id="reception-title" className={h2}>
              접수 안내
            </h2>
            <dl className="mt-6 border-t" style={{ borderColor: C.ink }}>
              {[
                ["준비물", "신분증 (만 19세 미만은 보호자 동반)"],
                ["접수 마감", "진료 종료 30분 전"],
                ["검사", "진균 검사 당일 결과 확인, 조직 검사는 1주 후 결과 안내"],
                ["서류 발급", "진료비 영수증, 세부내역서, 진단서 (실손보험 청구용)"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[96px_1fr] gap-3 border-b py-3.5" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{k}</dt>
                  <dd style={{ color: C.muted }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
              진료 상황에 따라 접수가 일찍 마감될 수 있습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]" style={{ backgroundColor: t.soft }}>
            <Image src={`${IMG}/lobby.jpg`} alt="" fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover object-[50%_75%]" />
          </div>
        </div>
      </section>

      <WeekHours id="medical-hours" now={now} />
    </>
  );
}

/* ---------- 피부미용 시술 ---------- */

function PriceTable({ rows, caption, accent }: { rows: Procedure[]; caption: string; accent: string }) {
  return (
    <div className="border-t-2" style={{ borderColor: accent }}>
      <table className="w-full">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b text-[15px]" style={{ borderColor: C.line, color: C.muted }}>
            <th scope="col" className="py-3 pr-2 text-left font-semibold">
              시술
            </th>
            <th scope="col" className="w-[88px] py-3 pr-2 text-right font-semibold sm:w-[110px]">
              1회
            </th>
            <th scope="col" className="w-[96px] py-3 pr-2 text-right font-semibold sm:w-[130px]">
              패키지
            </th>
            <th scope="col" className="hidden py-3 pl-4 text-left font-semibold md:table-cell">
              비고
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b" style={{ borderColor: C.line }}>
              <th scope="row" className="py-3.5 pr-2 text-left font-normal">
                {r.name}
                {r.note && (
                  <span className="mt-0.5 block text-[14px] md:hidden" style={{ color: r.note.startsWith("실손") ? accent : C.muted }}>
                    {r.note}
                  </span>
                )}
              </th>
              <td className="whitespace-nowrap py-3.5 pr-2 text-right font-semibold tabular-nums">{man(r.once)}</td>
              <td className="py-3.5 pr-2 text-right text-[15px] tabular-nums" style={{ color: r.pack ? C.ink : C.muted }}>
                {r.pack ?? "-"}
              </td>
              <td className="hidden py-3.5 pl-4 text-[15px] md:table-cell" style={{ color: r.note?.startsWith("실손") ? accent : C.muted, fontWeight: r.note?.startsWith("실손") ? 600 : 400 }}>
                {r.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BeautyPage({ go }: { go: (p: Page, tab?: "price" | "legal") => void }) {
  const [cat, setCat] = useState<Cat>("pigment");
  const t = TRACK.beauty;
  const current = CATS.find((c) => c.id === cat)!;
  return (
    <>
      <PageBand title="피부미용 시술" sub="비급여 시술" track="beauty">
        <div className="flex flex-wrap items-center gap-3">
          <PhoneLine label="시술상담" tel={TEL_COS} track="beauty" />
          <CallButton label="미용시술 상담" tel={TEL_COS} track="beauty" />
        </div>
      </PageBand>

      <section className={`${container} py-12 md:py-16`} aria-label="시술 분류">
        <Tabs id="cat" label="시술 분류" tabs={CATS} value={cat} onChange={setCat} accent={t.accent} />
        <div key={cat} id="cat-panel" role="tabpanel" aria-labelledby={`cat-tab-${cat}`} className="soft-in grid gap-8 pt-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]" style={{ backgroundColor: t.soft }}>
              <Image src={`${IMG}/${current.img}.jpg`} alt="" fill sizes="(min-width:1024px) 400px, 100vw" className="object-cover" />
            </div>
            <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.03em]">{current.label}</h2>
            <p className="mt-2" style={{ color: C.muted }}>
              {current.intro}
            </p>
          </div>
          <div className="min-w-0 lg:col-span-8">
            <PriceTable rows={PROCEDURES.filter((p) => p.cat === cat)} caption={`${current.label} 시술 비용`} accent={t.accent} />
            <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
              부가세 포함. 시술 범위와 횟수는 진료 후 정합니다.
            </p>
            <button type="button" onClick={() => go("fees", "price")} className="mt-4 inline-flex items-center font-semibold" style={{ color: t.accent }}>
              전체 시술 비용
              <ChevronRight size={17} aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <div className="border-t bg-white" style={{ borderColor: C.line }}>
        <EquipmentSection />
      </div>
    </>
  );
}

/* ---------- 비용 안내 ---------- */

function FeesPage({ tab, setTab }: { tab: "price" | "legal"; setTab: (t: "price" | "legal") => void }) {
  const today = useDemoToday();
  const feeDate = daysAgo(today, FEE_AGO);
  const groups: { id: Cat | "disease"; label: string; accent: string }[] = [
    ...CATS.map((c) => ({ id: c.id, label: c.label, accent: TRACK.beauty.accent })),
    { id: "disease", label: "피부질환 비급여", accent: TRACK.medical.accent },
  ];
  return (
    <>
      <PageBand title="비용 안내" sub={`부가세 포함, ${fmtYMD(feeDate)} 기준`} />
      <div className={`${container} py-10 md:py-14`}>
        <Tabs
          id="fee"
          label="비용 안내 구분"
          tabs={[
            { id: "price", label: "시술 비용" },
            { id: "legal", label: "비급여 진료비" },
          ]}
          value={tab}
          onChange={setTab}
          accent={C.ink}
        />
        <div key={tab} id="fee-panel" role="tabpanel" aria-labelledby={`fee-tab-${tab}`} className="soft-in pt-8">
          {tab === "price" ? (
            <div className="space-y-10">
              {groups.map((g) => (
                <section key={g.id} aria-labelledby={`fee-${g.id}`}>
                  <h2 id={`fee-${g.id}`} className="mb-3 text-[20px] font-semibold" style={{ color: g.accent }}>
                    {g.label}
                  </h2>
                  <PriceTable rows={PROCEDURES.filter((p) => p.cat === g.id)} caption={`${g.label} 비용`} accent={g.accent} />
                </section>
              ))}
            </div>
          ) : (
            <>
              <p style={{ color: C.muted }}>「의료법」 제45조에 따라 비급여 진료비용을 안내합니다.</p>
              <div className="mt-6 overflow-x-auto border-t-2" style={{ borderColor: C.ink }}>
                <table className="w-full min-w-[560px]">
                  <caption className="sr-only">비급여 진료비 목록</caption>
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.line }}>
                      <th scope="col" className="px-3 py-3 text-left font-semibold">
                        항목
                      </th>
                      <th scope="col" className="px-3 py-3 text-left font-semibold">
                        단위
                      </th>
                      <th scope="col" className="px-3 py-3 text-right font-semibold">
                        금액(원)
                      </th>
                      <th scope="col" className="px-3 py-3 text-left font-semibold">
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEES.map((f) => (
                      <tr key={f.item} className="border-b" style={{ borderColor: C.line }}>
                        <td className="px-3 py-3.5">{f.item}</td>
                        <td className="px-3 py-3.5" style={{ color: C.muted }}>
                          {f.unit}
                        </td>
                        <td className="px-3 py-3.5 text-right font-semibold tabular-nums">{f.price.toLocaleString("ko-KR")}</td>
                        <td className="px-3 py-3.5 text-[15px]" style={{ color: C.muted }}>
                          {f.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                최종 수정일 {fmtDot(feeDate)}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- 병원소개 ---------- */

function AboutPage({ now }: { now: Now | null }) {
  return (
    <>
      <PageBand title="병원소개" sub="피부과 전문의 2인 진료" />
      <section className={`${container} py-12 md:py-16`} aria-labelledby="about-doctors">
        <h2 id="about-doctors" className={h2}>
          의료진 소개
        </h2>
        <DoctorRows />
      </section>
      <section className="bg-white" aria-labelledby="about-tour">
        <div className={`${container} grid gap-8 py-12 md:py-16 lg:grid-cols-12 lg:items-center`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] lg:col-span-7" style={{ backgroundColor: TRACK.beauty.soft }}>
            <Image src={`${IMG}/lobby.jpg`} alt={`${CLINIC} 대기실`} fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" />
          </div>
          <div className="lg:col-span-5">
            <h2 id="about-tour" className={h2}>
              병원 둘러보기
            </h2>
            <ul className="mt-6 border-t" style={{ borderColor: C.line }}>
              {[
                ["대기실", "접수 · 수납, 서류 발급"],
                ["진료실", "원장 진료실 2곳"],
                ["레이저실", "레이저 · 리프팅 시술"],
                ["관리실", "스킨케어, 시술 후 진정"],
                ["광선치료실", "백반증 · 건선 광선치료"],
              ].map(([k, v]) => (
                <li key={k} className="grid grid-cols-[104px_1fr] gap-3 border-b py-3" style={{ borderColor: C.line }}>
                  <span className="font-semibold">{k}</span>
                  <span style={{ color: C.muted }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <WeekHours id="about-hours" now={now} />
      <section className={`${container} py-12 md:py-16`} aria-labelledby="about-location">
        <h2 id="about-location" className={h2}>
          오시는 길
        </h2>
        <div className="max-w-[640px]">
          <Location />
        </div>
      </section>
    </>
  );
}

/* ---------- 공지사항 ---------- */

function NoticePage() {
  const today = useDemoToday();
  const [open, setOpen] = useState<number | null>(null);
  const n = open ? NOTICES.find((x) => x.no === open) : null;
  return (
    <>
      <PageBand title="공지사항" sub={CLINIC} />
      <div className={`${container} py-10 md:py-14`}>
        {n ? (
          <article>
            <header className="border-b border-t-2 py-4" style={{ borderColor: C.ink }}>
              <h2 className="text-[22px] font-semibold">{n.title}</h2>
              <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
                등록일 {fmtDot(daysAgo(today, n.ago))}
              </p>
            </header>
            <p className="border-b py-8" style={{ borderColor: C.line }}>
              {typeof n.body === "function" ? n.body(today) : n.body}
            </p>
            <button type="button" onClick={() => setOpen(null)} className="mt-6 inline-flex h-11 items-center rounded-[6px] border px-6 font-semibold" style={{ borderColor: C.line }}>
              목록
            </button>
          </article>
        ) : (
          <>
          <p className="mb-2 text-[15px]" style={{ color: C.muted }}>
            총 <b style={{ color: C.ink }}>{NOTICE_TOTAL}</b>건
          </p>
          <ul className="border-t-2" style={{ borderColor: C.ink }}>
            {NOTICES.map((x) => (
              <li key={x.no} className="border-b" style={{ borderColor: C.line }}>
                <button type="button" onClick={() => setOpen(x.no)} className="flex w-full items-center justify-between gap-4 py-4 text-left hover:underline">
                  <span className="flex min-w-0 items-center gap-4">
                    <span className="hidden w-8 shrink-0 text-[15px] tabular-nums sm:inline" style={{ color: C.muted }}>
                      {x.no}
                    </span>
                    <span className="truncate">{x.title}</span>
                  </span>
                  <span className="shrink-0 text-[15px] tabular-nums" style={{ color: C.muted }}>
                    {fmtDot(daysAgo(today, x.ago))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex justify-center gap-1 text-[15px] tabular-nums" aria-label="쪽 번호">
            {[1, 2, 3, 4, 5].map((p) => (
              <span key={p} className="inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] px-2" style={p === 1 ? { backgroundColor: C.ink, color: "#fff", fontWeight: 600 } : { color: C.muted }}>
                {p}
              </span>
            ))}
            <span className="inline-flex h-9 items-center px-2" style={{ color: C.muted }}>
              … {Math.ceil(NOTICE_TOTAL / 10)}
            </span>
          </p>
          </>
        )}
      </div>
    </>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function BrandLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="text-[20px] font-semibold tracking-[-0.03em]">곰파트너</span>
        <span className="text-[12px] font-medium opacity-75">피부과의원</span>
      </span>
    </span>
  );
}
