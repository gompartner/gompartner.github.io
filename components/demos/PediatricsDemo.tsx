"use client";

import { useEffect } from "react";
import { Baby, Car, ClipboardCheck, Clock, MapPin, MessageCircle, Moon, Phone, Stethoscope, Syringe } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 소아청소년과 홈페이지 샘플: 가상의 소아청소년과 의원 곰파트너.
   병원명, 의료진, 주소, 전화번호, 진료비는 모두 가상이다. 첫 화면 사진 출처: Pexels 사진 39192342, 직원 사진은 AI 생성(Z-Image-Turbo)
   의료법 광고 규칙에 맞춰 치료 효과, 후기, 할인 문구는 넣지 않는다.

   국내 동네 소아청소년과 사이트 공통 구성(참고): 메뉴는 병원소개, 진료안내(진료시간, 의료진), 진료과목, 예방접종,
   영유아검진, 비급여 진료비 안내, 오시는 길. 첫 화면에는 진료시간(점심시간, 토요일, 야간진료 요일)과 접수 안내를 둔다.
   관용 문구는 "접수 마감은 진료 종료 30분 전", "일요일, 공휴일 휴진", "국가예방접종", "영유아 건강검진 지정 의료기관", "주차 가능".

   구성
   1. 진료 접수 안내: 현장 접수와 모바일 접수, 접수 마감, 준비물.
   2. 진료 시간표: 요일별 진료와 접수 마감, 오늘 요일과 야간진료 요일 강조.
   3. 예방접종 표준 일정 표(질병관리청 국가예방접종 일부).
   4. 영유아 건강검진 차수별 시기 표.

   포스터 첫 화면(pd-poster): 위에 메뉴(진료시간표, 예방접종, 영유아검진, 진료접수, 비급여항목, 오시는길, 휴대폰은 3칸 2줄).
   왼쪽 2/3은 제목과 진료시간 요약판, 오른쪽 1/3은 세로 사진 한 장. 휴대폰은 사진이 판 위 120px 띠로 줄어든다.
   본문은 흰색과 #f7f7f5 바탕, 강조색은 짙은 초록 하나. */

const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const KAKAO = "카카오톡 채널 소아청소년과";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>소아청소년과</span>
      </span>
    </span>
  );
}
const IMG = "/images/demo-pediatrics";

const C = {
  paper: "#ffffff",
  paperDeep: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  green: "#2f5e46",
  greenDeep: "#2f5e46",
  greenTint: "#edf2ee",
  muted: "#6b6b6b",
  line: "#e5e5e5",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (min: number) => `${p2(Math.floor(min / 60))}:${p2(min % 60)}`;

/* ---------- 진료 시간 ---------- */

interface Hours {
  dow: number;
  label: string;
  /** 분 단위. closed면 휴진 */
  open?: number;
  close?: number;
  lunch?: boolean;
  night?: boolean;
}
const HOURS: Hours[] = [
  { dow: 1, label: "월", open: 540, close: 1140, lunch: true },
  { dow: 2, label: "화", open: 540, close: 1230, lunch: true, night: true },
  { dow: 3, label: "수", open: 540, close: 1140, lunch: true },
  { dow: 4, label: "목", open: 540, close: 1230, lunch: true, night: true },
  { dow: 5, label: "금", open: 540, close: 1140, lunch: true },
  { dow: 6, label: "토", open: 540, close: 780 },
  { dow: 0, label: "일" },
];
const LUNCH = [780, 840];
/** 접수 마감은 진료 종료 30분 전 */
const LAST_CALL = 30;
const hoursOf = (dow: number) => HOURS.find((h) => h.dow === dow) ?? HOURS[0];

/* ---------- 예방접종 (질병관리청 표준 일정 일부) ---------- */

const VISITS: { label: string; items: string[] }[] = [
  { label: "출생 직후", items: ["B형간염 1차"] },
  { label: "생후 4주 이내", items: ["BCG(결핵)"] },
  { label: "생후 1개월", items: ["B형간염 2차"] },
  { label: "생후 2개월", items: ["DTaP 1차", "IPV 1차", "Hib 1차", "폐렴구균 1차", "로타바이러스 1차"] },
  { label: "생후 4개월", items: ["DTaP 2차", "IPV 2차", "Hib 2차", "폐렴구균 2차", "로타바이러스 2차"] },
  { label: "생후 6개월", items: ["DTaP 3차", "IPV 3차", "Hib 3차", "폐렴구균 3차", "로타바이러스 3차(5가)", "B형간염 3차", "인플루엔자(매년)"] },
  { label: "생후 12~15개월", items: ["MMR 1차", "수두", "Hib 4차", "폐렴구균 4차"] },
  { label: "생후 12~23개월", items: ["A형간염 1~2차", "일본뇌염 1~2차"] },
  { label: "생후 15~18개월", items: ["DTaP 4차"] },
  { label: "생후 24~35개월", items: ["일본뇌염 3차"] },
  { label: "만 4~6세", items: ["DTaP 5차", "IPV 4차", "MMR 2차"] },
  { label: "만 6세", items: ["일본뇌염 4차(불활성화)"] },
  { label: "만 11~12세", items: ["Tdap 6차", "일본뇌염 5차(불활성화)", "HPV 1차(만 12세 여아)"] },
];

/* ---------- 영유아 건강검진 ---------- */

interface Checkup {
  n: number;
  /** [시작, 끝]. unit이 day면 일, 아니면 개월 */
  range: [number, number];
  unit?: "day";
  edu: string;
  dental?: boolean;
}

const CHECKUPS: Checkup[] = [
  { n: 1, range: [14, 35], unit: "day", edu: "영아 돌연사 예방, 수유, 안전한 잠자리" },
  { n: 2, range: [4, 6], edu: "이유식 시작, 수면, 안전사고 예방" },
  { n: 3, range: [9, 12], edu: "이유식, 안전사고 예방, 첫니 관리" },
  { n: 4, range: [18, 24], edu: "대소변 가리기, 전자미디어 노출, 영양", dental: true },
  { n: 5, range: [30, 36], edu: "정서와 사회성, 안전사고 예방, 영양", dental: true },
  { n: 6, range: [42, 48], edu: "개인위생, 정서와 사회성, 영양", dental: true },
  { n: 7, range: [54, 60], edu: "안전사고 예방, 취학 전 준비, 영양", dental: true },
  { n: 8, range: [66, 71], edu: "취학 전 준비, 시력, 영양" },
];
const checkupLabel = (c: Checkup) => (c.unit === "day" ? `생후 ${c.range[0]}~${c.range[1]}일` : `생후 ${c.range[0]}~${c.range[1]}개월`);

/* ---------- 비급여 진료비 ---------- */

const FEES: { name: string; kind: string; price: number }[] = [
  { name: "인플루엔자 예방접종(만 14세 이상, 보호자)", kind: "예방접종", price: 40000 },
  { name: "수막구균 예방접종(MenACWY) 1회", kind: "예방접종", price: 150000 },
  { name: "사람유두종바이러스(9가) 1회", kind: "예방접종", price: 220000 },
  { name: "일반진단서", kind: "제증명", price: 20000 },
  { name: "영문진단서", kind: "제증명", price: 20000 },
  { name: "진료확인서", kind: "제증명", price: 3000 },
];

const DEPTS: { name: string; desc: string }[] = [
  { name: "소아청소년 일반진료", desc: "감기, 장염, 중이염, 열, 기침" },
  { name: "예방접종", desc: "국가예방접종, 인플루엔자" },
  { name: "영유아 건강검진", desc: "1차~8차, 발달 확인" },
  { name: "알레르기 검사", desc: "혈액 검사, 아토피 상담" },
  { name: "성장 상담", desc: "키, 몸무게 측정과 성장 곡선" },
];

export function PediatricsDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster go={go} />

      {/* 접수 안내와 진료시간 */}
      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start md:gap-6 md:px-6">
        <ReceptionPanel />
        <HoursPanel today={today} />
      </div>

      <VaccineSection />
      <CheckupSection />

      {/* 진료과목 */}
      <section aria-labelledby="pd-dept-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-20 md:px-6">
        <SectionTitle id="pd-dept-title" icon={<Stethoscope size={22} aria-hidden />} title="진료과목" />
        <ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
          {DEPTS.map((d) => (
            <li key={d.name} className="border-t pt-3" style={{ borderColor: C.line }}>
              <p className="text-[17px] font-bold">{d.name}</p>
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                {d.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 비급여 진료비 */}
      <section id="pd-fees" aria-labelledby="pd-fees-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="pd-fees-title" icon={<ClipboardCheck size={22} aria-hidden />} title="비급여 진료비 안내" />
        <ul className="mt-6 overflow-hidden rounded-[6px] border md:hidden" style={{ borderColor: C.line, background: "#fff" }}>
          {FEES.map((f, i) => (
            <li key={`m${f.name}`} className={`px-4 py-3 ${i ? "border-t" : ""}`} style={{ borderColor: C.line }}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">{f.name}</span>
                <span className="whitespace-nowrap font-bold tabular-nums">{won(f.price)}</span>
              </div>
              <p className="mt-0.5 text-[14px]" style={{ color: C.muted }}>
                {f.kind}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6 hidden overflow-x-auto rounded-[6px] border md:block" style={{ borderColor: C.line, background: "#fff" }}>
          <table className="w-full min-w-[340px] border-collapse text-left text-[15px]">
            <caption className="sr-only">비급여 진료비</caption>
            <thead>
              <tr style={{ background: C.paperDeep }}>
                <th scope="col" className="px-4 py-3 font-bold">
                  항목
                </th>
                <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">
                  구분
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  비용
                </th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => (
                <tr key={f.name} className="border-t" style={{ borderColor: C.line }}>
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="hidden px-4 py-3 sm:table-cell" style={{ color: C.muted }}>
                    {f.kind}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">{won(f.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          국가예방접종 대상 백신은 무료로 접종합니다. 비용은 부가세 포함, 기준일 {fmtDot(daysAgo(today, 14))}.
        </p>
      </section>

      {/* 의료진과 오시는 길 */}
      <section id="pd-visit" aria-labelledby="pd-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="pd-visit-title" icon={<MapPin size={22} aria-hidden />} title="의료진, 오시는 길" />
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <ul className="grid content-start gap-3">
            {[
              ["대표원장", "김ㅎ늘", `${IMG}/staff-1.jpg`],
              ["원장", "박ㅅ윤", `${IMG}/staff-2.jpg`],
            ].map(([role, name, photo]) => (
              <li key={name} className="flex items-center gap-4 rounded-[6px] border px-4 py-4" style={{ borderColor: C.line, background: "#fff" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img
                  src={photo}
                  alt={`${role} ${name}`}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                  style={{ objectPosition: "50% 20%", background: C.greenTint }}
                />
                <span>
                  <span className="block text-[18px] font-bold">
                    {role} {name}
                  </span>
                  <span className="block text-[15px]" style={{ color: C.muted }}>
                    소아청소년과 전문의
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <MiniMap />
            <dl className="grid content-start gap-3 text-[15px]">
              {[
                [<MapPin key="i" size={18} aria-hidden />, "주소", ADDRESS],
                [<Car key="i" size={18} aria-hidden />, "주차", "건물 지하 주차장, 진료 시 1시간 무료"],
                [<Baby key="i" size={18} aria-hidden />, "유모차", "엘리베이터로 바로 올라와요. 수유실 있음"],
                [<Phone key="i" size={18} aria-hidden />, "전화", TEL],
              ].map(([icon, k, v]) => (
                <div key={k as string} className="flex gap-3">
                  <dt className="inline-flex w-[76px] shrink-0 items-center gap-1.5 font-bold" style={{ color: C.greenDeep }}>
                    {icon}
                    {k}
                  </dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <a
                href={`tel:${TEL.replace(/-/g, "")}`}
                data-gtm-cta="pediatrics_tel"
                className={`mt-2 inline-flex w-fit items-center gap-2 rounded-[6px] px-4 py-2.5 font-bold ${focusRing}`}
                style={{ background: C.green, color: "#fff", outlineColor: C.green }}
              >
                <Phone size={18} aria-hidden />
                전화 걸기
              </a>
            </dl>
          </div>
        </div>
      </section>

      <footer className="mt-20 border-t px-4 py-10 md:px-6" style={{ background: C.paperDeep, borderColor: C.line, color: C.body }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo />
          </p>
          <p className="mt-2 text-[15px] leading-[1.7]">
            {ADDRESS}, 전화 {TEL}
            <br />
            평일 09:00~19:00, 화, 목 야간 20:30까지, 토 09:00~13:00, 일요일 공휴일 휴진
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 공통 조각 ---------- */

function SectionTitle({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="inline-flex items-center gap-2.5 text-[26px] font-bold leading-tight md:text-[30px]" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
      <span style={{ color: C.green }}>{icon}</span>
      {title}
    </h2>
  );
}

/* ---------- 포스터 ---------- */

/** 위쪽 메뉴. 휴대폰은 3칸 2줄 */
const NAV: [string, string][] = [
  ["pd-hours", "진료시간표"],
  ["pd-vaccine", "예방접종"],
  ["pd-checkup", "영유아검진"],
  ["pd-reception", "진료접수"],
  ["pd-fees", "비급여항목"],
  ["pd-visit", "오시는길"],
];

/** 첫 화면 진료시간 요약 */
const POSTER_HOURS: [string, string, string][] = [
  ["평일", "09:00 ~ 19:00", "점심시간 13:00 ~ 14:00"],
  ["화, 목 야간", "19:00 ~ 20:30", "화 김ㅎ늘, 목 박ㅅ윤 원장"],
  ["토요일", "09:00 ~ 13:00", "점심시간 없이 진료"],
  ["일요일, 공휴일", "휴진", ""],
];

function Poster({ go }: { go: (id: string) => void }) {
  const navBtn = `min-h-11 rounded-[4px] px-2.5 text-[15px] font-semibold hover:underline underline-offset-4 ${focusRing}`;

  return (
    <section id="pd-poster" aria-labelledby="pd-poster-title" style={{ background: C.paper, color: C.ink }}>
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-3 md:px-6 md:py-3">
        <p className="leading-none">
          <SampleLogo small />
        </p>
        <nav aria-label="주요 메뉴" className="hidden items-center md:flex">
          {NAV.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.green }}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      {/* 휴대폰 메뉴: 3칸 2줄 */}
      <nav aria-label="주요 메뉴" className="mx-4 mt-3 grid grid-cols-3 overflow-hidden rounded-[6px] border md:hidden" style={{ borderColor: C.line }}>
        {NAV.map(([id, label], i) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            className={`min-h-11 px-1 text-[14px] font-semibold ${i % 3 !== 2 ? "border-r" : ""} ${i < 3 ? "border-b" : ""} ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.green, outlineOffset: -3 }}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 pb-10 pt-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-6 md:px-6 md:pt-6">
        <div className="order-2 flex flex-col justify-center md:order-1">
          <h1 id="pd-poster-title" className="text-[30px] font-bold md:text-[clamp(32px,3.4vw,46px)]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
            아이 진료, 예방접종,
            <br />
            영유아 건강검진
          </h1>
          <p className="mt-2 text-[16px]" style={{ color: C.body }}>
            소아청소년과 전문의 2인 진료, 화요일 목요일 야간진료
          </p>

          <div className="mt-5 rounded-[8px] border" style={{ borderColor: C.line }}>
            <p className="border-b px-4 py-3 text-[17px] font-bold md:px-5" style={{ borderColor: C.line, background: C.paperDeep }}>
              진료시간
            </p>
            <ul>
              {POSTER_HOURS.map(([label, time, note]) => (
                <li
                  key={label}
                  className="grid grid-cols-[6.5em_minmax(0,1fr)] items-center gap-x-3 border-b px-4 py-3.5 last:border-b-0 md:grid-cols-[8em_minmax(0,1fr)_minmax(0,1fr)] md:px-5"
                  style={{ borderColor: C.line }}
                >
                  <span className="text-[16px] font-bold md:text-[17px]">{label}</span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold tabular-nums">{time}</span>
                    {note && (
                      <span className="block text-[14px] md:hidden" style={{ color: C.muted }}>
                        {note}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-[15px] md:block" style={{ color: C.muted }}>
                    {note}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px]" style={{ color: C.body }}>
              접수 마감은 진료 종료 {LAST_CALL}분 전
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => go("pd-reception")}
                data-gtm-cta="pediatrics_poster_cta"
                className={`inline-flex min-h-11 items-center rounded-[6px] px-4 text-[16px] font-semibold ${focusRing}`}
                style={{ background: C.green, color: "#ffffff", outlineColor: C.green }}
              >
                진료 접수 안내
              </button>
              <a
                href={`tel:${TEL.replace(/-/g, "")}`}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border px-4 text-[16px] font-semibold ${focusRing}`}
                style={{ borderColor: C.green, color: C.green, background: "#fff", outlineColor: C.green }}
              >
                <Phone size={17} aria-hidden />
                접종, 검진 예약
              </a>
            </div>
          </div>
        </div>

        {/* 세로 사진 한 장, 막 없이 액자처럼 */}
        <div className="relative order-1 h-[120px] overflow-hidden rounded-[6px] md:order-2 md:h-auto md:min-h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="(min-width: 768px) 34vw, 100vw"
            alt="의사가 청진기로 아이의 가슴 소리를 듣는 모습"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "40% 45%" }}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- 1. 진료 접수 안내 ---------- */

const RECEPTION: [string, string][] = [
  ["현장 접수", "1층 데스크에서 아이 이름과 생년월일로 접수합니다."],
  ["모바일 접수", "진료 접수 앱에서 저희 소아청소년과를 찾아 접수합니다. 차례가 가까워지면 알림이 갑니다."],
  ["접수 마감", "진료 종료 30분 전. 야간진료는 20:00 마감."],
  ["준비물", "아이 건강보험 정보, 아기수첩(예방접종, 검진 시)"],
];

function ReceptionPanel() {
  return (
    <section id="pd-reception" aria-labelledby="pd-reception-title" className="scroll-mt-4 rounded-[8px] border p-5 md:p-7" style={{ background: C.paperDeep, borderColor: C.line, color: C.ink }}>
      <h2 id="pd-reception-title" className="inline-flex items-center gap-2 text-[24px] font-bold">
        <ClipboardCheck size={22} aria-hidden style={{ color: C.green }} />
        진료 접수 안내
      </h2>
      <dl className="mt-4 grid gap-3 text-[15px]">
        {RECEPTION.map(([k, v]) => (
          <div key={k} className="grid gap-1 border-t pt-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-3" style={{ borderColor: C.line }}>
            <dt className="font-bold">{k}</dt>
            <dd style={{ color: C.body }}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={`tel:${TEL.replace(/-/g, "")}`}
          data-gtm-cta="pediatrics_reception_tel"
          className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[17px] font-bold ${focusRing}`}
          style={{ background: C.greenDeep, color: "#fff", outlineColor: C.ink }}
        >
          <Phone size={19} aria-hidden />
          {TEL}
        </a>
        <span className="inline-flex items-center gap-1.5 text-[14px]" style={{ color: C.body }}>
          <MessageCircle size={15} aria-hidden />
          {KAKAO}
        </span>
      </div>
    </section>
  );
}

/* ---------- 2. 진료 시간표 ---------- */

function HoursPanel({ today }: { today: Date }) {
  const dow = today.getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <section id="pd-hours" aria-labelledby="pd-hours-title" className="scroll-mt-4 rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: "#fff" }}>
      <h2 id="pd-hours-title" className="inline-flex items-center gap-2 text-[24px] font-bold">
        <Clock size={22} aria-hidden style={{ color: C.green }} />
        진료시간
      </h2>
      <table className="mt-4 w-full border-collapse text-[15px]">
        <caption className="sr-only">요일별 진료시간과 접수 마감</caption>
        <thead>
          <tr className="text-left" style={{ color: C.muted }}>
            <th scope="col" className="py-2 pr-2 font-normal">
              요일
            </th>
            <th scope="col" className="py-2 pr-2 font-normal">
              진료
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              접수 마감
            </th>
          </tr>
        </thead>
        <tbody>
          {order.map((d) => {
            const h = hoursOf(d);
            const isToday = d === dow;
            const closed = h.open === undefined || h.close === undefined;
            return (
              <tr key={d} className="border-t" style={{ borderColor: C.line, background: isToday ? C.greenTint : undefined, fontWeight: isToday ? 700 : 400 }}>
                <th scope="row" className="py-2.5 pl-2 pr-2 text-left">
                  {h.label}
                  {isToday && <span className="ml-1.5 rounded-[3px] px-1.5 py-0.5 text-[12px]" style={{ background: C.green, color: "#ffffff" }}>오늘</span>}
                </th>
                <td className="py-2.5 pr-2">
                  {closed ? (
                    "휴진"
                  ) : (
                    <>
                      {hm(h.open!)}~{hm(h.close!)}
                      {h.night && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-[3px] px-1.5 py-0.5 align-middle text-[12px] font-bold" style={{ background: C.greenDeep, color: "#fff" }}>
                          <Moon size={11} aria-hidden />
                          야간
                        </span>
                      )}
                    </>
                  )}
                </td>
                <td className="py-2.5 pr-2 text-right tabular-nums">{closed ? "-" : hm(h.close! - LAST_CALL)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-[15px]">
        점심시간 {hm(LUNCH[0])}~{hm(LUNCH[1])}, 토요일은 점심시간 없이 진료합니다.
        <br />
        일요일, 공휴일 휴진.
      </p>
    </section>
  );
}

/* ---------- 3. 예방접종 일정 ---------- */

function VaccineSection() {
  return (
    <section id="pd-vaccine" aria-labelledby="pd-vaccine-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
      <SectionTitle id="pd-vaccine-title" icon={<Syringe size={22} aria-hidden />} title="예방접종 일정" />
      <div className="mt-6 overflow-hidden rounded-[6px] border" style={{ borderColor: C.line, background: "#fff" }}>
        <table className="w-full border-collapse text-left text-[15px]">
          <caption className="sr-only">국가예방접종 표준 일정</caption>
          <thead>
            <tr style={{ background: C.paperDeep }}>
              <th scope="col" className="w-[36%] px-4 py-3 font-bold sm:w-[200px]">
                접종 시기
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                백신
              </th>
            </tr>
          </thead>
          <tbody>
            {VISITS.map((v) => (
              <tr key={v.label + v.items[0]} className="border-t align-top" style={{ borderColor: C.line }}>
                <th scope="row" className="px-4 py-3 text-left font-bold">
                  {v.label}
                </th>
                <td className="px-4 py-3">{v.items.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        질병관리청 국가예방접종 표준 일정 일부 기준. 접종 예약은 데스크 {TEL}
      </p>
    </section>
  );
}

/* ---------- 4. 영유아 건강검진 시기 ---------- */

function CheckupSection() {
  return (
    <section id="pd-checkup" aria-labelledby="pd-checkup-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
      <SectionTitle id="pd-checkup-title" icon={<Baby size={22} aria-hidden />} title="영유아 건강검진" />
      <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
        영유아 건강검진 지정 의료기관. 검사는 문진과 진찰, 키, 몸무게, 머리둘레, 발달 확인이며 비용은 국민건강보험에서 부담합니다.
      </p>
      <div className="mt-6 overflow-hidden rounded-[6px] border" style={{ borderColor: C.line, background: "#fff" }}>
        <table className="w-full border-collapse text-left text-[15px]">
          <caption className="sr-only">영유아 건강검진 차수별 시기</caption>
          <thead>
            <tr style={{ background: C.paperDeep }}>
              <th scope="col" className="px-4 py-3 font-bold">
                차수
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                검진 시기
              </th>
              <th scope="col" className="hidden px-4 py-3 font-bold md:table-cell">
                건강교육
              </th>
              <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">
                구강검진
              </th>
            </tr>
          </thead>
          <tbody>
            {CHECKUPS.map((c) => (
              <tr key={c.n} className="border-t align-top" style={{ borderColor: C.line }}>
                <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-bold">
                  {c.n}차
                </th>
                <td className="px-4 py-3">
                  {checkupLabel(c)}
                  <span className="block text-[14px] md:hidden" style={{ color: C.muted }}>
                    {c.edu}
                  </span>
                </td>
                <td className="hidden px-4 py-3 md:table-cell" style={{ color: C.body }}>
                  {c.edu}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">{c.dental ? "같은 시기 치과" : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[14px]" style={{ color: C.muted }}>
        <MessageCircle size={15} aria-hidden />
        검진 예약은 데스크 {TEL}, {KAKAO}
      </p>
    </section>
  );
}

/* ---------- 오시는 길 약도 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 320 220" className="h-auto w-full rounded-[8px]" role="img" aria-label="ㅇㅇ역 2번 출구에서 도보 5분, 큰길 모퉁이 건물 3층 약도" style={{ background: "#f3f3f1" }}>
      <rect x="0" y="92" width="320" height="34" fill="#fff" />
      <rect x="196" y="0" width="30" height="220" fill="#fff" />
      <path d="M0 109 H320 M211 0 V220" stroke={C.line} strokeWidth="2" strokeDasharray="8 8" />
      <rect x="236" y="34" width="62" height="48" rx="4" fill={C.green} />
      <text x="267" y="63" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
        3층
      </text>
      <rect x="40" y="136" width="58" height="34" rx="4" fill={C.greenDeep} />
      <text x="69" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
        ㅇㅇ역
      </text>
      <path d="M98 150 C150 150 170 130 200 118 S236 96 248 84" fill="none" stroke={C.greenDeep} strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      <text x="120" y="190" fontSize="12" fill={C.muted}>
        2번 출구, 도보 5분
      </text>
    </svg>
  );
}
