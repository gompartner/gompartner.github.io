"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { Armchair, CalendarCheck, Clock, Coffee, MapPin, Menu as MenuIcon, MessageCircle, Phone, ShieldCheck, SquareParking, TrainFront, Truck, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 자동차 디테일링 샵 홈페이지 샘플: 가상의 곰파트너 디테일링 샵. 상호, 주소, 가격은 모두 가상이다.
   차종별 차 사진은 AI 생성(Z-Image-Turbo), 시공 전 사진(-before)은 같은 사진을 가공

   국내 디테일링 샵 홈페이지는 대개 이렇게 짜여 있다.
   메뉴: 시공 메뉴(유리막 코팅, 광택, 실내 클리닉, 썬팅, 언더코팅), 시공 사례(전후 사진), 시공 과정, 예약, 오시는 길, 보증 안내.
   첫 화면은 차 사진 한 장과 전화, 카카오톡 채널, 예약 버튼. 가격은 차종(경차, 준중형, 중형, SUV, 대형)별 표.
   관용 문구: 당일 예약 가능, 픽업 서비스, 보증서 발급, 입고 전날 확인 문자, 시공 중 차량 보관.

   화면 구성(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 첫 화면(cd-poster): 고정 차 사진, 한 줄 소개, 오늘 영업시간, 전화와 예약 버튼. 휴대폰은 첫 화면이 보이는 동안 하단에 전화, 예약 버튼.
   2. 시공 메뉴: 시공별 차종 5칸 가격표.
   3. 시공 사례: 차종, 시공 전 상태, 작업 내용과 전후 사진 두 장.
   4. 예약과 픽업: 차종, 시공, 날짜, 입고 시간, 픽업 서비스, 이름, 휴대폰, 차량 번호. 접수 완료 화면.
   5. 시공 과정 다섯 단계, 오시는 길, 영업시간(오늘 요일이 진하다), 보증 안내. */

const IMG = "/images/demo-car-detailing";

const BRAND = "디테일링 샵";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 디테일링 샵";
const TEL = "02-000-0000";
/* 바닥글 사업자 정보와 처리방침 버튼: 개인정보 보호법 제30조(처리방침 수립, 공개). 예약 폼이 차량 번호, 픽업 장소까지 받는다. 온라인 판매가 없어 통신판매업 신고는 두지 않는다 */
const BIZ: [string, string][] = [
  ["상호", BRAND],
  ["대표자", "ㅇㅇㅇ"],
  ["주소", ADDRESS],
  ["전화", TEL],
  ["메일", "help@example.com"],
  ["사업자등록번호", "000-00-00000"],
];

const C = {
  bg: "#141414",
  panel: "#1b1b1b",
  panel2: "#232323",
  line: "#2e2e2e",
  text: "#f2f2f2",
  muted: "#a3a3a3",
  accent: "#6fa8a2",
  accentInk: "#141414",
  error: "#f0a39a",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const CAR_TYPES = ["경차", "준중형", "중형", "SUV", "대형"] as const;
type CarType = (typeof CAR_TYPES)[number];
/** 차종별 옆모습 사진 파일 이름. 시공 전 사진은 뒤에 -before */
const CAR_FILE: Record<CarType, string> = { 경차: "light", 준중형: "compact", 중형: "mid", SUV: "suv", 대형: "large" };

/* ---------- 시공 메뉴와 가격 ---------- */

type Svc = {
  id: string;
  group?: "coat" | "polish";
  name: string;
  desc: string;
  /** 경차, 준중형, 중형, SUV, 대형 순 */
  price: [number, number, number, number, number];
  hours: number;
  overnight?: boolean;
};

const SERVICES: Svc[] = [
  { id: "coat1", group: "coat", name: "유리막 코팅 1년", desc: "1단계 광택 포함, 보증 1년", price: [300000, 350000, 400000, 450000, 500000], hours: 6 },
  { id: "coat3", group: "coat", name: "유리막 코팅 3년", desc: "2단계 광택 포함, 하루 경화, 보증 3년", price: [600000, 680000, 750000, 850000, 950000], hours: 10, overnight: true },
  { id: "pol1", group: "polish", name: "광택 1단계", desc: "잔기스, 워터스팟 제거", price: [180000, 200000, 220000, 260000, 280000], hours: 3 },
  { id: "pol2", group: "polish", name: "광택 2단계", desc: "깊은 기스까지 두 번 작업", price: [300000, 330000, 360000, 400000, 450000], hours: 5 },
  { id: "interior", name: "실내 클리닉", desc: "시트, 매트, 천장 스팀 세척", price: [120000, 140000, 150000, 180000, 200000], hours: 3 },
  { id: "tintF", name: "썬팅 앞유리", desc: "열차단 필름, 농도 선택", price: [180000, 200000, 220000, 250000, 280000], hours: 1.5 },
  { id: "tintS", name: "썬팅 측후면", desc: "측면 4장, 뒷유리 1장", price: [220000, 250000, 280000, 320000, 350000], hours: 2 },
  { id: "under", name: "언더코팅", desc: "하부 방청, 겨울 전 추천", price: [250000, 280000, 300000, 350000, 400000], hours: 3 },
];

/* ---------- 시공 과정, 영업시간 ---------- */

const STEPS = [
  { name: "세차", time: "30분", text: "고압수와 폼으로 모래부터 털어내요. 미트 세차는 두 통으로 해요." },
  { name: "철분 제거", time: "40분", text: "철분 제거제와 클레이로 도장에 박힌 쇳가루를 빼요. 이게 남으면 코팅이 안 붙어요." },
  { name: "폴리싱", time: "3시간", text: "도막 두께를 재고 잔기스를 갈아내요. 2단계는 컴파운드와 피니시로 두 번 돌려요." },
  { name: "코팅", time: "1시간", text: "유리막을 패널 하나씩 바르고 닦아내요. 실내는 적외선 조명 아래서 해요." },
  { name: "경화", time: "12시간", text: "실내에서 하루 말려요. 3년 코팅은 이 시간이 꼭 필요해서 1박 2일이에요." },
];

/** [요일 0~6, 영업 시간 글] 월~금, 토, 일 */
const HOURS: { days: number[]; label: string; open: string }[] = [
  { days: [1, 2, 3, 4, 5], label: "월 ~ 금", open: "09:00 ~ 19:00" },
  { days: [6], label: "토요일", open: "09:00 ~ 17:00" },
  { days: [0], label: "일요일", open: "휴무" },
];

const SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
const BOOK_DAYS = 10;

/** 날짜와 입고 시간별로 이미 찬 자리. 실제로는 예약 시트에서 읽는다. 하루 입고 2대 기준. */
function slotFull(dayIdx: number, slot: number) {
  let h = (dayIdx + 5) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 97;
  return h % 4 === 0;
}

/** 차량 번호 뒷자리 두 개를 가린다. 12가 3456 -> 12가 34**, 123가 4567 -> 123가 45** */
function maskPlate(raw: string) {
  const s = raw.replace(/\s+/g, "");
  const m = s.match(/^(\d{2,3}[가-힣])(\d{2})(\d{2})$/);
  if (!m) return raw;
  return `${m[1]} ${m[2]}**`;
}

/** 시공 사례. 사진은 같은 차의 시공 전과 뒤 */
const CASES: { type: CarType; title: string; before: string; work: string; days: string }[] = [
  { type: "SUV", title: "아파트 지상 주차 5년", before: "바랜 클리어, 물때, 문 손잡이 주변 잔기스", work: "광택 2단계, 유리막 코팅 3년", days: "1박 2일" },
  { type: "준중형", title: "출고 3년, 첫 코팅", before: "세차 기스, 보닛 새똥 자국", work: "광택 1단계, 유리막 코팅 1년", days: "당일" },
  { type: "대형", title: "장거리 출퇴근 차량", before: "앞범퍼 벌레 자국, 하부 녹 시작", work: "유리막 코팅 1년, 언더코팅", days: "당일" },
];

/* ---------- 페이지 ---------- */

export function CarDetailingDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const todayHours = HOURS.find((h) => h.days.includes(today.getDay()))!;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.text }}>
      <Poster todayHours={todayHours} go={go} />

      {/* 시공 메뉴: 차종별 가격표 */}
      <section id="cd-menu" aria-labelledby="cd-menu-title" className="mx-auto mt-8 max-w-[1200px] scroll-mt-4 px-4 md:mt-12 md:px-6">
        <SectionTitle id="cd-menu-title" title="시공 메뉴" side="차종별 요금, 부가세 포함" />
        {/* 휴대폰: 시공마다 차종별 요금을 2칸 격자로 */}
        <ul className="mt-5 divide-y rounded-[8px] border md:hidden" style={{ borderColor: C.line, background: C.panel }}>
          {SERVICES.map((s) => (
            <li key={`m${s.id}`} className="px-4 py-3" style={{ borderColor: C.line }}>
              <p className="font-bold">{s.name}</p>
              <p className="text-[13px]" style={{ color: C.muted }}>
                {s.desc}
                {s.overnight ? ", 1박 2일" : ""}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-1.5 tabular-nums">
                {s.price.map((p, i) => (
                  <div key={i} className="rounded-[4px] px-2 py-1.5" style={{ background: C.panel2 }}>
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {CAR_TYPES[i]}
                    </dt>
                    <dd className="whitespace-nowrap text-[15px] font-bold">{won(p)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <div className="mt-5 hidden overflow-x-auto rounded-[8px] border md:block" style={{ borderColor: C.line, background: C.panel }}>
          <table className="w-full min-w-[720px] text-[15px]">
            <thead style={{ background: C.panel2 }}>
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-bold">
                  시공
                </th>
                {CAR_TYPES.map((t) => (
                  <th key={t} scope="col" className="px-3 py-3 text-right font-bold">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: C.line }}>
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <span className="block font-bold">{s.name}</span>
                    <span className="block text-[13px]" style={{ color: C.muted }}>
                      {s.desc}
                      {s.overnight ? ", 1박 2일" : ""}
                    </span>
                  </th>
                  {s.price.map((p, i) => (
                    <td key={i} className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                      {won(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          유리막 코팅에는 광택 작업이 들어 있어요. 도장 상태에 따라 현장에서 조정될 수 있어요. 견적은 전화나 {KAKAO}로 사진을 보내 주시면 바로 알려 드려요.
        </p>
      </section>

      {/* 시공 사례 */}
      <section id="cd-cases" aria-labelledby="cd-cases-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-cases-title" title="시공 사례" />
        <ul className="mt-5 grid gap-6">
          {CASES.map((c) => (
            <li key={c.type} className="rounded-[8px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.panel }}>
              <div className="grid gap-2 sm:grid-cols-2">
                <CarPhoto type={c.type} before label="시공 전" />
                <CarPhoto type={c.type} label="시공 후" />
              </div>
              <p className="mt-4 text-[18px] font-bold">
                {c.type}, {c.title}
              </p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px]">
                <dt style={{ color: C.muted }}>시공 전</dt>
                <dd>{c.before}</dd>
                <dt style={{ color: C.muted }}>작업</dt>
                <dd>
                  {c.work}, {c.days}
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      {/* 예약 */}
      <section id="cd-book" aria-labelledby="cd-book-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-book-title" title="예약하기" side="당일 예약 가능" />
        <BookingForm today={today} reduce={reduce} />
      </section>

      {/* 시공 과정 */}
      <section id="cd-process" aria-labelledby="cd-process-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-process-title" title="시공 과정" side="유리막 코팅 기준" />
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.name} className="rounded-[8px] border p-4" style={{ borderColor: C.line, background: C.panel }}>
              <p className="flex items-baseline justify-between gap-2">
                <b className="text-[16px]">
                  {i + 1}. {s.name}
                </b>
                <span className="text-[13px] tabular-nums" style={{ color: C.accent }}>
                  {s.time}
                </span>
              </p>
              <p className="mt-2 text-[14px] leading-[1.65]" style={{ color: C.muted }}>
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </section>


      {/* 오시는 길, 보증 */}
      <section id="cd-way" aria-labelledby="cd-way-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-way-title" title="오시는 길" side={ADDRESS} />
        <WayAndHours today={today} />
      </section>

      <section id="cd-warranty" aria-labelledby="cd-warranty-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-warranty-title" title="보증 안내" />
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["보증서 발급", "유리막 코팅은 시공 당일 1년 또는 3년 보증서를 드려요."],
            ["6개월 무상 점검", "코팅 뒤 6개월마다 광택 상태를 보고 메인터넌스를 해 드려요."],
            ["무상 재시공", "보증 기간 안에 코팅이 벗겨지면 해당 패널을 다시 시공해요."],
          ].map(([h, d]) => (
            <li key={h} className="flex gap-3 rounded-[8px] border p-4" style={{ borderColor: C.line, background: C.panel }}>
              <ShieldCheck size={22} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
              <div>
                <p className="text-[16px] font-bold">{h}</p>
                <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                  {d}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo light />
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5">
          {BIZ.map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <dt>{k}</dt>
              <dd className="tabular-nums" style={{ color: C.text }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-1">월 ~ 금 09:00 ~ 19:00, 토 09:00 ~ 17:00, 일요일 휴무. {KAKAO}.</p>
        <p className="mt-2 flex gap-4">
          <button type="button" className={`font-bold hover:underline ${focusRing}`} style={{ color: C.text, outlineColor: C.accent }}>
            이용약관
          </button>
          <button type="button" className={`font-bold hover:underline ${focusRing}`} style={{ color: C.text, outlineColor: C.accent }}>
            개인정보처리방침
          </button>
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

function SectionTitle({ id, title, side }: { id: string; title: string; side?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-3" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
        {title}
      </h2>
      {side && (
        <p className="text-[14px] font-bold" style={{ color: C.accent }}>
          {side}
        </p>
      )}
    </div>
  );
}

/* ---------- 0. 첫 화면 ---------- */

const CD_MENU: [string, string][] = [
  ["cd-menu", "시공 메뉴"],
  ["cd-cases", "시공 사례"],
  ["cd-process", "시공 과정"],
  ["cd-warranty", "보증 안내"],
  ["cd-way", "오시는 길"],
];

function Poster({ todayHours, go }: { todayHours: { open: string }; go: (id: string) => void }) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const nav = (id: string) => {
    setMenu(false);
    go(id);
  };
  const tel = `tel:${TEL.replace(/-/g, "")}`;

  return (
    <section ref={ref} id="cd-poster" aria-labelledby="cd-poster-title" style={{ background: C.bg }}>
      <header className="relative z-20 border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <SampleLogo light small />
          <nav aria-label="주요 메뉴" className="hidden items-center gap-1 text-[15px] font-bold md:flex" style={{ color: C.muted }}>
            {CD_MENU.map(([id, label]) => (
              <button key={id} type="button" onClick={() => nav(id)} className={`min-h-11 rounded-[4px] px-3 hover:text-[#f2f2f2] ${focusRing}`} style={{ outlineColor: C.accent }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={`tel:${TEL.replace(/-/g, "")}`} aria-label={`전화 ${TEL}`} className={`hidden min-h-11 items-center gap-1.5 rounded-[6px] border px-3 text-[15px] font-bold sm:inline-flex ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }}>
              <Phone size={16} aria-hidden /> {TEL}
            </a>
            <button type="button" onClick={() => go("cd-book")} data-gtm-cta="car-detailing_poster_cta" className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
              <CalendarCheck size={17} aria-hidden />
              예약
            </button>
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="cd-menu-list"
              aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenu((v) => !v)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-[6px] border md:hidden ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.accent }}
            >
              {menu ? <X size={20} aria-hidden /> : <MenuIcon size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="cd-menu-list" aria-label="메뉴 펼침" className="absolute inset-x-0 top-full border-b px-4 pb-4 pt-2 md:hidden" style={{ background: C.panel, borderColor: C.line }}>
            <ul className="grid gap-1">
              {CD_MENU.map(([id, label]) => (
                <li key={id}>
                  <button type="button" onClick={() => nav(id)} className={`flex min-h-11 w-full items-center rounded-[4px] px-3 text-left text-[16px] font-bold ${focusRing}`} style={{ outlineColor: C.accent }}>
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL.replace(/-/g, "")}`} className={`flex min-h-11 w-full items-center gap-2 rounded-[4px] px-3 text-[16px] font-bold ${focusRing}`} style={{ outlineColor: C.accent }}>
                  <Phone size={16} aria-hidden /> 전화 {TEL}
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-[1200px] px-4 pt-4 md:px-6 md:pt-6">
        <div className="overflow-hidden rounded-[8px]" style={{ background: C.panel }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img src={`${IMG}/car-mid.jpg`} alt="광택과 유리막 코팅을 마친 중형 세단 옆모습" width={1344} height={576} fetchPriority="high" className="aspect-[16/10] w-full object-cover sm:aspect-[1344/576]" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-8 pt-5 md:pb-10">
          <div>
            <h1 id="cd-poster-title" className="text-[26px] font-bold leading-[1.3] tracking-[-0.02em] md:text-[34px]" style={{ wordBreak: "keep-all" }}>
              유리막 코팅부터 실내 세차까지
            </h1>
            <p className="mt-1.5 inline-flex items-center gap-1 text-[15px]" style={{ color: C.muted }}>
              <Clock size={15} aria-hidden />
              오늘 {todayHours.open === "휴무" ? "휴무" : `${todayHours.open} 영업`}, 당일 예약 가능, ㅇㅇ구 무료 픽업
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={tel} className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }}>
              <Phone size={16} aria-hidden /> 전화 견적
            </a>
            <button type="button" data-gtm-cta="car-detailing_poster_kakao" className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }}>
              <MessageCircle size={16} aria-hidden /> 카톡 견적
            </button>
            <button type="button" onClick={() => go("cd-book")} data-gtm-cta="car-detailing_hero_book" className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
              <CalendarCheck size={17} aria-hidden /> 예약하기
            </button>
          </div>
        </div>
      </div>

      {/* 휴대폰 하단 고정 바: 첫 화면이 보일 때만 */}
      {inView && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t px-4 pt-3 md:hidden" style={{ background: C.panel, borderColor: C.line, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
          <a href={tel} className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[6px] border text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }}>
            <Phone size={16} aria-hidden /> 전화
          </a>
          <button type="button" onClick={() => go("cd-book")} className={`inline-flex min-h-11 items-center justify-center rounded-[6px] text-[15px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
            예약하기
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- 차 사진 ---------- */

function CarPhoto({ type, before, label }: { type: CarType; before?: boolean; label: string }) {
  return (
    <figure className="relative overflow-hidden rounded-[6px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
      <img
        src={`${IMG}/car-${CAR_FILE[type]}${before ? "-before" : ""}.jpg`}
        alt={`${type} 차량 ${before ? "시공 전, 바랜 도장과 물때" : "시공 뒤, 광택이 살아난 도장"}`}
        width={1344}
        height={576}
        loading="lazy"
        className="aspect-[1344/576] w-full object-cover"
      />
      <figcaption className="absolute left-2 top-2 rounded-[4px] px-2 py-0.5 text-[13px] font-semibold" style={before ? { background: "rgba(21,23,26,0.8)", color: C.text } : { background: C.accent, color: C.accentInk }}>
        {label}
      </figcaption>
    </figure>
  );
}

/* ---------- 4. 예약과 픽업 ---------- */

type Booked = {
  no: string;
  date: Date;
  slot: string;
  pickup: boolean;
  place: string;
  name: string;
  phone: string;
  plate: string;
};

function BookingForm({ today, reduce }: { today: Date; reduce: boolean }) {
  const [type, setType] = useState<CarType>("중형");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const items = SERVICES.filter((s) => picked.has(s.id));
  const overnight = items.some((s) => s.overnight);
  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const days = Array.from({ length: BOOK_DAYS }, (_, i) => daysAgo(today, -i));
  const firstOpen = days.findIndex((d, i) => i > 0 && d.getDay() !== 0);
  const [dayIdx, setDayIdx] = useState(firstOpen < 0 ? 1 : firstOpen);
  const [slot, setSlot] = useState<number | null>(null);
  const [pickup, setPickup] = useState(false);
  const [place, setPlace] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Booked | null>(null);

  const day = days[dayIdx];
  const closed = day.getDay() === 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (closed) er.day = "일요일은 휴무예요. 다른 날을 골라 주세요.";
    if (slot === null) er.slot = "입고 시간을 골라 주세요.";
    if (name.trim().length < 2) er.name = "이름을 두 글자 이상 적어 주세요.";
    if (phone.replace(/\D/g, "").length < 10) er.phone = "휴대폰 번호를 확인해 주세요.";
    if (!/^\d{2,3}[가-힣]\s?\d{4}$/.test(plate.trim())) er.plate = "차량 번호를 12가 3456 처럼 적어 주세요.";
    if (pickup && place.trim().length < 2) er.place = "픽업 장소를 적어 주세요.";
    if (!agree) er.agree = "개인정보 수집, 이용에 동의해 주세요.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const digits = phone.replace(/\D/g, "");
    const seed = (digits.split("").reduce((a, c) => a + Number(c), 0) * 7 + dayIdx * 13 + (slot ?? 0)) % 900;
    const no = `CD-${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(100 + seed).padStart(3, "0")}`;
    setDone({ no, date: day, slot: SLOTS[slot ?? 0], pickup, place: place.trim(), name: name.trim(), phone, plate: plate.trim() });
  };

  const inputCls = `w-full rounded-[6px] border px-3 py-2.5 text-[16px] ${focusRing}`;
  const inputStyle = { borderColor: C.line, background: C.bg, color: C.text, outlineColor: C.accent } as const;
  const label = "block text-[14px] font-bold";

  // 확인 연락: 접수한 날 영업시간 안, 일요일이면 월요일
  const reply = today.getDay() === 0 ? daysAgo(today, -1) : today;

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mt-5 rounded-[8px] border p-5 md:p-7"
        style={{ borderColor: C.accent, background: C.panel }}
        role="status"
      >
        <p className="text-[14px] font-bold" style={{ color: C.accent }}>
          예약 접수 완료
        </p>
        <p className="mt-1 text-[30px] font-bold leading-none tabular-nums md:text-[34px]">
          {done.no}
        </p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[15px] md:grid-cols-[auto_1fr_auto_1fr]">
          <dt style={{ color: C.muted }}>입고</dt>
          <dd className="font-bold">
            {fmtKo(done.date)} {done.slot}
          </dd>
          <dt style={{ color: C.muted }}>차량</dt>
          <dd className="font-bold">
            {type}, {maskPlate(done.plate)}
          </dd>
          <dt style={{ color: C.muted }}>예약자</dt>
          <dd>
            {maskName(done.name)}, {maskPhone(done.phone)}
          </dd>
          <dt style={{ color: C.muted }}>픽업</dt>
          <dd>{done.pickup ? `${done.place}에서 입고 시간에 가져가요` : "직접 입고"}</dd>
          <dt style={{ color: C.muted }}>시공</dt>
          <dd className="md:col-span-3">
            {items.length ? items.map((s) => s.name).join(", ") : "현장 상담 뒤 결정"}
          </dd>
        </dl>
        <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-2" style={{ borderColor: C.line }}>
          <div>
            <p className="text-[14px] font-bold" style={{ color: C.muted }}>
              담당 창구
            </p>
            <p className="mt-1 text-[15px] leading-[1.7]">
              전화 {TEL}
              <br />
              {KAKAO}
            </p>
            <p className="mt-2 text-[15px]">
              확인 연락 <b>{fmtKo(reply)} 영업시간 안</b>
            </p>
          </div>
          <ul className="grid gap-1.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
            <li>입고 전날 확인 문자를 드려요.</li>
            <li>차 안 귀중품은 미리 챙겨 주세요.</li>
            <li>{overnight ? "1박 2일 시공은 실내 보관하고 다음 날 출고예요." : "당일 시공은 출고 30분 전에 연락드려요."}</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setSlot(null);
            setAgree(false);
          }}
          className={`mt-5 rounded-[6px] border px-4 py-2 text-[15px] font-bold ${focusRing}`}
          style={{ borderColor: C.line, outlineColor: C.accent }}
        >
          다른 날로 다시 예약
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="grid gap-5">
        <fieldset>
          <legend className={label}>차종</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CAR_TYPES.map((t) => {
              const on = t === type;
              return (
                <button key={t} type="button" aria-pressed={on} onClick={() => setType(t)} className={`min-h-11 rounded-[6px] border px-3.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.panel, color: on ? C.accentInk : C.text, outlineColor: C.accent }}>
                  {t}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label}>
            시공 <span style={{ color: C.muted }}>여러 개 고를 수 있어요</span>
          </legend>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <label key={s.id} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[6px] border px-3 py-2 text-[15px]" style={{ borderColor: picked.has(s.id) ? C.accent : C.line, background: C.panel }}>
                <input type="checkbox" checked={picked.has(s.id)} onChange={() => togglePick(s.id)} className={`h-5 w-5 flex-none accent-[#6fa8a2] ${focusRing}`} style={{ outlineColor: C.accent }} />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label}>입고 날짜</legend>
          <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
            {days.map((d, i) => {
              const on = i === dayIdx;
              const sun = d.getDay() === 0;
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setDayIdx(i);
                    setSlot(null);
                  }}
                  className={`flex flex-col items-center rounded-[6px] border py-2 text-[14px] leading-tight ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.panel, color: on ? C.accentInk : sun ? C.muted : C.text, outlineColor: C.accent }}
                >
                  <span className="text-[12px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                  <span className="mt-0.5 text-[16px] font-bold tabular-nums">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
          {errors.day && <Err>{errors.day}</Err>}
        </fieldset>

        <fieldset>
          <legend className={label}>
            입고 시간 <span style={{ color: C.muted }}>{fmtKo(day)}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SLOTS.map((s, i) => {
              const full = closed || slotFull(dayIdx, i);
              const on = slot === i;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={full}
                  aria-pressed={on}
                  onClick={() => setSlot(i)}
                  className={`rounded-[6px] border px-3.5 py-2 text-[15px] font-bold tabular-nums disabled:cursor-not-allowed disabled:line-through ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.panel, color: on ? C.accentInk : full ? C.muted : C.text, outlineColor: C.accent }}
                >
                  {s}
                  {full && !closed ? " 마감" : ""}
                </button>
              );
            })}
          </div>
          {closed && (
            <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
              일요일 휴무
            </p>
          )}
          {errors.slot && <Err>{errors.slot}</Err>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cd-name" className={label}>
              이름
            </label>
            <input id="cd-name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1.5`} style={inputStyle} autoComplete="name" />
            {errors.name && <Err>{errors.name}</Err>}
          </div>
          <div>
            <label htmlFor="cd-phone" className={label}>
              휴대폰
            </label>
            <input id="cd-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-0000-0000" className={`${inputCls} mt-1.5`} style={inputStyle} autoComplete="tel" />
            {errors.phone && <Err>{errors.phone}</Err>}
          </div>
          <div>
            <label htmlFor="cd-plate" className={label}>
              차량 번호
            </label>
            <input id="cd-plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="12가 3456" className={`${inputCls} mt-1.5`} style={inputStyle} />
            {errors.plate && <Err>{errors.plate}</Err>}
          </div>
          <div>
            <span className={label}>픽업 서비스</span>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2.5 rounded-[6px] border px-3 py-2.5 text-[15px]" style={{ borderColor: pickup ? C.accent : C.line, background: C.panel }}>
              <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className={`h-5 w-5 accent-[#6fa8a2] ${focusRing}`} style={{ outlineColor: C.accent }} />
              <Truck size={18} aria-hidden style={{ color: C.accent }} />
              ㅇㅇ구 안 무료 픽업
            </label>
          </div>
          {pickup && (
            <div className="sm:col-span-2">
              <label htmlFor="cd-place" className={label}>
                픽업 장소
              </label>
              <input id="cd-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="아파트 이름, 동, 주차 위치" className={`${inputCls} mt-1.5`} style={inputStyle} />
              {errors.place && <Err>{errors.place}</Err>}
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.panel2 }}>
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          예약 내용
        </p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
          <dt style={{ color: C.muted }}>차종</dt>
          <dd className="font-bold">{type}</dd>
          <dt style={{ color: C.muted }}>시공</dt>
          <dd>{items.length ? items.map((s) => s.name).join(", ") : "현장 상담"}</dd>
          <dt style={{ color: C.muted }}>입고</dt>
          <dd>
            {fmtKo(day)} {slot !== null ? SLOTS[slot] : ""}
          </dd>
        </dl>
        {/* 개인정보 보호법 제15조 제2항: 목적, 항목, 보유 기간, 거부권과 불이익 */}
        <label className="mt-5 flex cursor-pointer items-start gap-2.5 border-t pt-4 text-[15px] leading-[1.5]" style={{ borderColor: C.line }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-0.5 h-5 w-5 flex-none accent-[#6fa8a2] ${focusRing}`} style={{ outlineColor: C.accent }} />
          <span>
            개인정보 수집, 이용 동의 (필수)
            <span className="mt-0.5 block text-[13px] leading-[1.6]" style={{ color: C.muted }}>
              이름, 휴대폰, 차량 번호{pickup ? ", 픽업 장소" : ""}를 입고 확인과 {pickup ? "픽업, " : ""}출고 연락에만 쓰고 출고일로부터 1년 뒤 파기해요. 동의하지 않을 수 있고, 동의하지 않으면 예약을 받을 수 없어요.
            </span>
          </span>
        </label>
        {errors.agree && <Err>{errors.agree}</Err>}
        <button type="submit" data-gtm-cta="car-detailing_reserve" className={`mt-4 inline-flex w-full items-center justify-center rounded-[6px] px-4 py-3 text-[16px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
          예약 접수
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          예약금 없이 접수해요. 금액은 입고 때 도장 상태를 보고 확정해요. 입고 전날까지 {KAKAO}로 바꿀 수 있어요.
        </p>
      </aside>
    </form>
  );
}

function Err({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
      {children}
    </p>
  );
}

/* ---------- 오시는 길과 영업시간 ---------- */

function WayAndHours({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* 약도: 큰길, 역, 매장 */}
      <div className="overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: C.panel }}>
        <svg viewBox="0 0 640 300" className="h-auto w-full" role="img" aria-label="약도. ㅇㅇ역 3번 출구에서 큰길을 따라 걸어오면 왼쪽에 매장이 있다.">
          <rect width="640" height="300" fill={C.panel} />
          <path d="M0 200 L640 160" stroke={C.line} strokeWidth="34" />
          <path d="M0 200 L640 160" stroke={C.panel2} strokeWidth="2" strokeDasharray="14 12" />
          <path d="M420 0 L380 300" stroke={C.line} strokeWidth="22" />
          <path d="M120 0 L150 300" stroke={C.line} strokeWidth="14" />
          <text x="24" y="238" fill={C.muted} fontSize="14" fontWeight="700">
            ㅇㅇ로
          </text>
          <rect x="520" y="110" width="78" height="28" rx="4" fill={C.panel2} />
          <text x="559" y="129" fill={C.text} fontSize="14" fontWeight="700" textAnchor="middle">
            ㅇㅇ역
          </text>
          <text x="559" y="100" fill={C.muted} fontSize="12" textAnchor="middle">
            3번 출구
          </text>
          <rect x="190" y="112" width="120" height="56" rx="6" fill={C.accent} />
          <text x="250" y="137" fill={C.accentInk} fontSize="15" fontWeight="700" textAnchor="middle">
            {BRAND}
          </text>
          <text x="250" y="156" fill={C.accentInk} fontSize="12" fontWeight="700" textAnchor="middle">
            1층, 매장 앞 주차 2대
          </text>
          <rect x="230" y="216" width="80" height="40" rx="4" fill={C.panel2} stroke={C.line} />
          <text x="270" y="241" fill={C.muted} fontSize="12" fontWeight="700" textAnchor="middle">
            건물 지하 주차
          </text>
          <text x="470" y="152" fill={C.muted} fontSize="12">
            도보 5분
          </text>
        </svg>
        <ul className="grid gap-2 border-t p-4 text-[15px] sm:grid-cols-2" style={{ borderColor: C.line }}>
          <li className="flex items-start gap-2">
            <MapPin size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            {ADDRESS}
          </li>
          <li className="flex items-start gap-2">
            <TrainFront size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            ㅇㅇ역 3번 출구 도보 5분
          </li>
          <li className="flex items-start gap-2">
            <SquareParking size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            매장 앞 2대, 건물 지하 주차 가능
          </li>
          <li className="flex items-start gap-2">
            <Armchair size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            대기실 이용 가능 <Coffee size={16} aria-hidden className="ml-1 inline" /> 커피, 와이파이
          </li>
        </ul>
      </div>

      <div className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.panel2 }}>
        <p className="inline-flex items-center gap-1.5 text-[16px] font-bold">
          <Clock size={18} aria-hidden style={{ color: C.accent }} /> 영업시간
        </p>
        <table className="mt-3 w-full text-[16px]">
          <tbody>
            {HOURS.map((h) => {
              const isToday = h.days.includes(dow);
              return (
                <tr key={h.label} className="border-t" style={{ borderColor: C.line, color: isToday ? C.text : C.muted, fontWeight: isToday ? 700 : 400 }}>
                  <th scope="row" className="py-2.5 text-left font-[inherit]">
                    {h.label}
                    {isToday && (
                      <span className="ml-2 rounded-[4px] px-1.5 py-0.5 text-[12px] font-semibold" style={{ background: C.accent, color: C.accentInk }}>
                        오늘
                      </span>
                    )}
                  </th>
                  <td className="py-2.5 text-right tabular-nums">{h.open}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: C.muted }}>
          마지막 입고 15:00. 공휴일은 {KAKAO}에 공지해요.
        </p>
        <div className="mt-4 grid gap-2">
          <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }}>
            <Phone size={16} aria-hidden /> {TEL}
          </a>
          <button type="button" data-gtm-cta="car-detailing_kakao_way" className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] px-4 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
            <MessageCircle size={16} aria-hidden /> {KAKAO}
          </button>
        </div>
      </div>
    </div>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>디테일링 샵</span>
      </span>
    </span>
  );
}
