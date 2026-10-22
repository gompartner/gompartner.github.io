"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { BookOpen, CalendarCheck, Check, CircleAlert, Clock, FileCheck2, Languages, MapPin, MessageCircle, RotateCcw, Search, Stamp } from "lucide-react";
import { JetBrains_Mono, Noto_Serif_KR } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 행정사사무소(외국인 비자) 홈페이지 샘플: 가상의 곰파트너행정사사무소. 체류기간 연장, 체류자격 변경, 결혼이민, 영주, 귀화를 대행한다.
   상호, 주소, 손님 이름은 모두 가상이다. 체류자격 설명과 서류는 하이코리아 안내를 줄인 일반 안내다.

   국내 출입국 행정사 사이트 공통 구성(참고): 메뉴는 사무소 소개, 업무 안내(체류기간 연장, 체류자격 변경, 사증발급인정서,
   외국인등록, 영주권 F-5, 귀화), 비자 종류, 상담신청, 오시는 길. 첫 화면에 한국어와 English 전환 버튼, 카카오톡 채널 상담.
   관용 문구는 "체류기간 만료 4개월 전부터 신청 가능", "관할 출입국에 따라 추가 서류가 요구될 수 있습니다", "하이코리아 방문 예약",
   "출입국 방문 대행". 체류기간 연장 수수료는 60,000원, 결혼이민(F-6)은 30,000원(출입국관리법 시행규칙 제72조).
   1회 체류기간 상한은 같은 규칙 별표 1(D-2 2년, D-10 1년, E-7 3년, F-4 3년, F-6 3년).
   행정사도 결과 보장, 허가율, 100% 같은 표현은 쓰지 않는다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 체류자격 찾기: 질문 3개(동포 여부, 한국인 배우자, 하려는 일)에 답하면 F-4, F-6, E-7, D-2, D-10 중 하나와 취업 범위, 1회 체류기간 상한.
   2. 연장 신청일 계산: 만료일을 넣으면 4개월 전 신청 시작일, 남은 날, 오늘이 신청 구간 안인지 막대 위에 표시.
   3. 필요 서류: 체류자격 탭을 고르면 연장 서류 목록. 준비한 서류를 체크하면 몇 개 남았는지 보인다.
   4. 한국어와 English 전환: 포스터 문장부터 상담 폼까지 전부 바뀐다.
   5. 상담신청: 이름, 연락처, 국적, 현재 체류자격, 상담 내용, 상담 방법. 완료 화면은 접수 번호와 회신 예정일이 찍힌 사증 모양.

   포스터 첫 화면(va-poster): 여권 남색 바탕에 금색으로 큰 문장 "체류 기간 연장, 만료 4개월 전부터 돼요" 하나만 둔다.
   오른쪽(휴대폰은 아래)에 닫힌 여권이 놓여 있다가 표지가 3D로 열리고, 사증 면 두 장이 넘어간 뒤 출입국 도장이 색깔별로 쾅쾅 찍힌다.
   마지막 도장은 빨간 "체류기간 연장허가". 등장 뒤에는 여권이 8초 주기로 아주 조금 떠오른다.
   스크롤하면 넘어간 면과 표지가 거꾸로 닫히고 여권이 아래로 떨어지며 문장은 위로 빠진다.
   동작 줄이기면 펼친 여권과 찍힌 도장으로 고정하고, 스크롤 퇴장도 없다. */

const serifF = { fontFamily: `${Noto_Serif_KR.style.fontFamily}, serif` } as const;
const monoF = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

const BRAND = "곰파트너행정사사무소";
const BRAND_EN = "Gompartner Visa Office";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const KAKAO = "카카오톡 채널 곰파트너";

/** 포스터 색 */
const P = {
  bg: "#14213d",
  bgDeep: "#0b1428",
  cream: "#f4ecd8",
  gold: "#d4ae5c",
  sub: "#b9c1d3",
  leather: "#1c2f58",
  leatherDark: "#0e1932",
};

/** 본문 색 */
const C = {
  paper: "#f7f3e8",
  paperDeep: "#efe8d6",
  card: "#fffdf7",
  ink: "#14213d",
  muted: "#545b6b",
  line: "#dcd3bf",
  gold: "#c9a24a",
  goldText: "#7d6118",
  red: "#b3402a",
  blue: "#2b5fa8",
  green: "#2f7a5b",
  purple: "#5b4a9b",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 표지와 면이 넘어갈 때. 처음엔 천천히 들리고 끝에서 내려앉는다 */
const EASE_FLIP = [0.45, 0.05, 0.25, 1] as const;
/** 도장이 종이에 내리찍힐 때. 끝으로 갈수록 빨라진다 */
const EASE_SLAM = [0.55, 0, 0.9, 0.4] as const;
/** 표지가 열리기 시작하는 시각과 걸리는 시간 */
const COVER_AT = 0.2;
const COVER_DUR = 0.6;
/** 사증 면 두 장 */
const PAGE1_AT = 0.55;
const PAGE2_AT = 0.78;
const PAGE_DUR = 0.48;
/** 도장 네 개. 첫 도장 시각과 간격, 한 번 찍는 시간. 마지막 도장이 1.92초에 끝난다 */
const STAMP_AT = 1.28;
const STAMP_GAP = 0.14;
const STAMP_DUR = 0.22;
/** 등장 뒤 여권이 떠오르는 주기 */
const FLOAT_LOOP = 8;
/** 포스터 래퍼 스크롤 진행도. 고정이 풀리는 0.45 지점에서 퇴장이 끝난다(래퍼 180svh 중 80svh) */
const EXIT_END = 0.45;
/** 본문 전환 */
const DUR = 0.25;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const c01 = (v: number) => Math.min(1, Math.max(0, v));
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];
const DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Lang = "ko" | "en";
type Tx = { ko: string; en: string };
const tx = (lang: Lang, ko: string, en: string) => (lang === "ko" ? ko : en);

const fmtDay = (d: Date, lang: Lang) => `${fmtDot(d)}(${lang === "ko" ? DOW_KO[d.getDay()] : DOW_EN[d.getDay()]})`;
const toInput = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const fromInput = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
const dayDiff = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);
/** n개월 전 같은 날. 그 달에 같은 날이 없으면 그 달 마지막 날 */
const monthsBefore = (d: Date, n: number) => {
  const last = new Date(d.getFullYear(), d.getMonth() - n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() - n, Math.min(d.getDate(), last));
};
/** 다음 영업일(주말 제외) */
const nextWorkday = (d: Date) => {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0 || n.getDay() === 6) n = daysAgo(n, -1);
  return n;
};

/* ---------- 체류자격 ---------- */

type Code = "F-4" | "F-6" | "E-7" | "D-2" | "D-10";
const CODES: Code[] = ["F-4", "F-6", "E-7", "D-2", "D-10"];

const VISAS: Record<Code, { name: Tx; who: Tx; work: Tx; max: Tx }> = {
  "F-4": {
    name: { ko: "재외동포", en: "Overseas Korean" },
    who: { ko: "본인이나 부모, 조부모가 한국 국적이었던 외국 국적 동포", en: "Foreign nationals who, or whose parent or grandparent, held Korean nationality" },
    work: { ko: "단순노무를 뺀 취업과 사업 가능", en: "Work and business allowed, except simple labor" },
    max: { ko: "3년", en: "3 years" },
  },
  "F-6": {
    name: { ko: "결혼이민", en: "Marriage Migrant" },
    who: { ko: "한국 국민과 혼인 신고를 한 배우자", en: "Spouse of a Korean national with a registered marriage" },
    work: { ko: "취업 제한 없음", en: "No work restrictions" },
    max: { ko: "3년", en: "3 years" },
  },
  "E-7": {
    name: { ko: "특정활동", en: "Special Occupation" },
    who: { ko: "한국 기업이 고용하는 전문 인력", en: "Professionals hired by a Korean company" },
    work: { ko: "허가받은 회사와 직종에서만 근무", en: "Only at the approved company and job" },
    max: { ko: "3년", en: "3 years" },
  },
  "D-2": {
    name: { ko: "유학", en: "Student" },
    who: { ko: "대학, 대학원 학위 과정 학생", en: "Degree students at a university or graduate school" },
    work: { ko: "시간제 취업은 따로 허가", en: "Part-time work needs a separate permit" },
    max: { ko: "2년", en: "2 years" },
  },
  "D-10": {
    name: { ko: "구직", en: "Job Seeker" },
    who: { ko: "국내 대학 졸업생, 전문 분야 구직자", en: "Graduates of Korean universities and professional job seekers" },
    work: { ko: "구직 활동, 인턴은 허가 후 가능", en: "Job hunting, internships with a permit" },
    max: { ko: "1년", en: "1 year" },
  },
};

const Q3_OPTIONS: { code: Code; label: Tx }[] = [
  { code: "D-2", label: { ko: "대학, 대학원에서 공부", en: "Study at a university or graduate school" } },
  { code: "E-7", label: { ko: "한국 회사에서 전문직으로 근무", en: "Work as a professional at a Korean company" } },
  { code: "D-10", label: { ko: "졸업 후 일자리 찾기", en: "Look for a job after graduation" } },
];

/* ---------- 연장 서류 ---------- */

const COMMON_DOCS: Tx[] = [
  { ko: "통합신청서", en: "Integrated application form" },
  { ko: "여권 원본", en: "Original passport" },
  { ko: "외국인등록증", en: "Residence card" },
  { ko: "수수료 60,000원(결혼이민 F-6은 30,000원)", en: "Fee 60,000 won (F-6: 30,000 won)" },
  { ko: "체류지 입증 서류(임대차계약서 등)", en: "Proof of address (lease contract etc.)" },
];
const EXTRA_DOCS: Record<Code, Tx[]> = {
  "F-4": [{ ko: "국내거소신고증(외국인등록증 대신 가진 경우)", en: "Domestic residence report card (if you hold one instead)" }],
  "F-6": [
    { ko: "혼인관계증명서", en: "Marriage certificate (Korean)" },
    { ko: "배우자 가족관계증명서, 주민등록등본", en: "Spouse's family relation certificate and resident register" },
    { ko: "배우자 신원보증서", en: "Letter of guarantee from spouse" },
    { ko: "소득 입증 서류(소득금액증명 등)", en: "Proof of income" },
  ],
  "E-7": [
    { ko: "고용계약서 원본과 사본", en: "Employment contract, original and copy" },
    { ko: "회사 사업자등록증 사본", en: "Copy of company business registration" },
    { ko: "근로소득 원천징수영수증", en: "Withholding tax receipt for wages" },
  ],
  "D-2": [
    { ko: "재학증명서", en: "Certificate of enrollment" },
    { ko: "직전 학기 성적증명서", en: "Transcript of last semester" },
    { ko: "등록금 납부 영수증", en: "Tuition payment receipt" },
    { ko: "재정능력 입증 서류(잔고증명 등)", en: "Proof of funds (bank balance etc.)" },
  ],
  "D-10": [
    { ko: "구직활동계획서", en: "Job search plan" },
    { ko: "구직활동 입증 서류", en: "Proof of job search activity" },
    { ko: "재정능력 입증 서류", en: "Proof of funds" },
  ],
};
const docsFor = (code: Code) => [...COMMON_DOCS.map((d, i) => (code === "F-4" && i === 2 ? { ko: "외국인등록증 또는 거소신고증", en: "Residence card or residence report card" } : d)), ...EXTRA_DOCS[code]];

/* ---------- 상담 ---------- */

const NATIONS: Tx[] = [
  { ko: "중국", en: "China" },
  { ko: "베트남", en: "Vietnam" },
  { ko: "필리핀", en: "Philippines" },
  { ko: "우즈베키스탄", en: "Uzbekistan" },
  { ko: "네팔", en: "Nepal" },
  { ko: "미국", en: "USA" },
  { ko: "기타", en: "Other" },
];
const TOPICS: Tx[] = [
  { ko: "체류기간 연장", en: "Extension of stay" },
  { ko: "체류자격 변경", en: "Change of status" },
  { ko: "결혼이민 초청", en: "Marriage visa invitation" },
  { ko: "영주권 F-5", en: "Permanent residence F-5" },
  { ko: "귀화 허가", en: "Naturalization" },
  { ko: "기타", en: "Other" },
];
type Method = "visit" | "phone" | "kakao";
const METHODS: { id: Method; label: Tx }[] = [
  { id: "visit", label: { ko: "방문 상담", en: "Visit office" } },
  { id: "phone", label: { ko: "전화 상담", en: "Phone call" } },
  { id: "kakao", label: { ko: "카카오톡 상담", en: "KakaoTalk" } },
];

const SERVICES: { code: string; label: Tx }[] = [
  { code: "EXT", label: { ko: "체류기간 연장", en: "Extension of stay" } },
  { code: "CHG", label: { ko: "체류자격 변경", en: "Change of status" } },
  { code: "CCVI", label: { ko: "사증발급인정서", en: "Visa issuance certificate" } },
  { code: "ARC", label: { ko: "외국인등록", en: "Alien registration" } },
  { code: "F-5", label: { ko: "영주권", en: "Permanent residence" } },
  { code: "NAT", label: { ko: "귀화 허가", en: "Naturalization" } },
];

const HOURS: { dows: number[]; label: Tx; time: Tx }[] = [
  { dows: [1, 2, 3, 4, 5], label: { ko: "평일", en: "Mon ~ Fri" }, time: { ko: "09:00 ~ 18:00", en: "09:00 ~ 18:00" } },
  { dows: [6], label: { ko: "토요일", en: "Saturday" }, time: { ko: "10:00 ~ 14:00 (예약 상담)", en: "10:00 ~ 14:00 (booking only)" } },
  { dows: [0], label: { ko: "일요일, 공휴일", en: "Sunday, holidays" }, time: { ko: "휴무", en: "Closed" } },
];

export function VisaAgentDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [lang, setLang] = useState<Lang>("ko");
  const [docCode, setDocCode] = useState<Code>("E-7");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div lang={lang} className="min-h-screen overflow-x-clip pb-16" style={{ background: C.paper, color: C.ink }}>
      <Poster key={reduce ? "still" : "move"} reduce={reduce} lang={lang} today={today} onCta={() => go("va-consult")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 md:px-6">
        <p className="inline-flex items-center gap-2 text-[20px] font-bold leading-none" style={serifF}>
          <Stamp size={22} aria-hidden style={{ color: C.red }} />
          {lang === "ko" ? BRAND : BRAND_EN}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <nav aria-label={tx(lang, "주요 메뉴", "Main menu")} className="-mx-2 flex flex-wrap items-center">
            {[
              ["va-finder", tx(lang, "체류자격 찾기", "Find your visa")],
              ["va-extend", tx(lang, "연장 신청일", "Extension date")],
              ["va-docs", tx(lang, "필요 서류", "Documents")],
              ["va-consult", tx(lang, "상담신청", "Consultation")],
              ["va-visit", tx(lang, "오시는 길", "Location")],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.ink }}>
                {label}
              </button>
            ))}
          </nav>
          <LangSwitch lang={lang} setLang={setLang} />
        </div>
      </header>

      {/* 업무 안내 */}
      <section aria-labelledby="va-hero-title" className="mx-auto max-w-[1200px] px-4 pt-4 md:px-6 md:pt-8">
        <div className="grid gap-8 border-y py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12 md:py-12" style={{ borderColor: C.ink }}>
          <div>
            <h2 id="va-hero-title" className="text-[34px] font-bold leading-[1.25] md:text-[46px]" style={{ ...serifF, wordBreak: "keep-all" }}>
              {tx(lang, "외국인 비자, 체류 업무 대행", "Visa and stay permits for foreigners")}
            </h2>
            <dl className="mt-6 grid gap-2 text-[16px]">
              {[
                [tx(lang, "상담 언어", "Languages"), tx(lang, "한국어, English", "Korean, English")],
                [tx(lang, "출입국 업무", "Immigration"), tx(lang, "방문 대행, 하이코리아 전자민원 대행", "Office visits and Hi Korea e-applications on your behalf")],
                [tx(lang, "첫 상담", "First consultation"), tx(lang, "비용 없음", "Free")],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 md:grid-cols-[150px_minmax(0,1fr)]">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ul className="grid grid-cols-2 gap-px self-start border md:grid-cols-3" style={{ background: C.line, borderColor: C.line }}>
            {SERVICES.map((s) => (
              <li key={s.code} className="flex min-h-[92px] flex-col justify-between gap-2 p-4" style={{ background: C.card }}>
                <span className="text-[13px] font-semibold tracking-[0.06em]" style={{ ...monoF, color: C.goldText }}>
                  {s.code}
                </span>
                <span className="text-[16px] font-bold leading-[1.35]" style={{ wordBreak: "keep-all" }}>
                  {s.label[lang]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section id="va-finder" icon={<Search size={22} aria-hidden />} title={tx(lang, "체류자격 찾기", "Find your visa type")}>
        <Finder
          lang={lang}
          reduce={reduce}
          onDocs={(code) => {
            setDocCode(code);
            go("va-docs");
          }}
        />
      </Section>

      <Section id="va-extend" icon={<CalendarCheck size={22} aria-hidden />} title={tx(lang, "체류기간 연장 신청일", "When to apply for extension")}>
        <ExtendCalc lang={lang} today={today} onConsult={() => go("va-consult")} />
      </Section>

      <Section id="va-docs" icon={<FileCheck2 size={22} aria-hidden />} title={tx(lang, "연장 필요 서류", "Documents for extension")}>
        <Docs lang={lang} code={docCode} setCode={setDocCode} />
      </Section>

      <Section id="va-consult" icon={<MessageCircle size={22} aria-hidden />} title={tx(lang, "상담신청", "Request a consultation")}>
        <Consult lang={lang} today={today} reduce={reduce} />
      </Section>

      <Section id="va-visit" icon={<MapPin size={22} aria-hidden />} title={tx(lang, "오시는 길", "Location")}>
        <Visit lang={lang} today={today} />
      </Section>

      <footer className="mx-auto mt-20 max-w-[1200px] border-t px-4 pt-8 md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p className="text-[16px] font-bold" style={{ color: C.ink }}>
          {lang === "ko" ? BRAND : BRAND_EN}
        </p>
        <p className="mt-1 text-[14px]">{ADDRESS}</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* ---------- 공용 조각 ---------- */

function Section({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <h2 id={`${id}-title`} className="mb-6 inline-flex items-center gap-2.5 text-[26px] font-bold leading-tight md:text-[32px]" style={{ ...serifF, wordBreak: "keep-all" }}>
        <span style={{ color: C.red }}>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** 사증 면처럼 가는 무늬가 깔린 종이 */
const paperBg = {
  backgroundColor: C.card,
  backgroundImage: `repeating-radial-gradient(circle at 100% 0%, transparent 0 9px, rgba(20,33,61,0.035) 9px 10px)`,
} as const;

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div id="va-lang" role="group" aria-label="언어 Language" className="inline-flex items-center rounded-full border p-1" style={{ borderColor: C.ink }}>
      <Languages size={18} aria-hidden className="mx-1.5" />
      {(
        [
          ["ko", "한국어"],
          ["en", "English"],
        ] as const
      ).map(([l, label]) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          data-gtm-cta={`visa-agent_lang_${l}`}
          className={`rounded-full px-3 py-1 text-[14px] font-bold transition-colors duration-150 ${focusRing}`}
          style={{ background: lang === l ? C.ink : "transparent", color: lang === l ? C.paper : C.ink, outlineColor: C.ink }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const choiceBtn = `min-h-[48px] rounded-[6px] border px-4 py-2.5 text-left text-[16px] font-semibold transition-colors duration-150 hover:bg-[#f1ead8] ${focusRing}`;

/* ---------- 1. 체류자격 찾기 ---------- */

type Ans = { q1: boolean | null; q2: boolean | null; q3: Code | null };
const EMPTY: Ans = { q1: null, q2: null, q3: null };

function Finder({ lang, reduce, onDocs }: { lang: Lang; reduce: boolean; onDocs: (c: Code) => void }) {
  const [a, setA] = useState<Ans>(EMPTY);
  const result: Code | null = a.q1 ? "F-4" : a.q2 ? "F-6" : a.q3;
  const step = a.q1 === null ? 0 : a.q1 ? 3 : a.q2 === null ? 1 : a.q2 ? 3 : a.q3 === null ? 2 : 3;

  const questions: { text: string; answer: string | null; reset: () => void }[] = [
    {
      text: tx(lang, "부모나 조부모가 한국 국적이었나요?", "Did you, a parent or a grandparent hold Korean nationality?"),
      answer: a.q1 === null ? null : a.q1 ? tx(lang, "예", "Yes") : tx(lang, "아니요", "No"),
      reset: () => setA(EMPTY),
    },
    {
      text: tx(lang, "한국 국적 배우자와 혼인 신고를 했나요?", "Are you married to a Korean national?"),
      answer: a.q2 === null ? null : a.q2 ? tx(lang, "예", "Yes") : tx(lang, "아니요", "No"),
      reset: () => setA({ ...EMPTY, q1: false }),
    },
    {
      text: tx(lang, "한국에서 무엇을 하려고 하나요?", "What will you do in Korea?"),
      answer: a.q3 ? (Q3_OPTIONS.find((o) => o.code === a.q3)?.label[lang] ?? null) : null,
      reset: () => setA({ ...EMPTY, q1: false, q2: false }),
    },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-10">
      <ol className="grid content-start gap-3">
        {questions.map((q, i) => {
          if (i > step) return null;
          const active = i === step;
          return (
            <li key={i} className="rounded-[8px] border p-4 md:p-5" style={{ ...paperBg, borderColor: active ? C.ink : C.line }}>
              <p className="text-[14px] font-semibold" style={{ ...monoF, color: C.goldText }}>
                Q{i + 1} / 3
              </p>
              <p className="mt-1 text-[18px] font-bold leading-[1.4] md:text-[20px]" style={{ wordBreak: "keep-all" }}>
                {q.text}
              </p>
              {active ? (
                <motion.div
                  key={`${i}-${lang}`}
                  className="mt-4 grid gap-2 sm:grid-cols-2"
                  initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                >
                  {i < 2 ? (
                    <>
                      <button type="button" className={choiceBtn} style={{ borderColor: C.ink, outlineColor: C.ink }} onClick={() => setA(i === 0 ? { ...EMPTY, q1: true } : { ...EMPTY, q1: false, q2: true })}>
                        {tx(lang, "예", "Yes")}
                      </button>
                      <button type="button" className={choiceBtn} style={{ borderColor: C.ink, outlineColor: C.ink }} onClick={() => setA(i === 0 ? { ...EMPTY, q1: false } : { ...EMPTY, q1: false, q2: false })}>
                        {tx(lang, "아니요", "No")}
                      </button>
                    </>
                  ) : (
                    Q3_OPTIONS.map((o) => (
                      <button key={o.code} type="button" className={`${choiceBtn} sm:col-span-2`} style={{ borderColor: C.ink, outlineColor: C.ink }} onClick={() => setA({ q1: false, q2: false, q3: o.code })}>
                        {o.label[lang]}
                      </button>
                    ))
                  )}
                </motion.div>
              ) : (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-1.5 text-[16px] font-semibold">
                    <Check size={18} aria-hidden style={{ color: C.green }} />
                    {q.answer}
                  </p>
                  <button type="button" onClick={q.reset} className={`rounded-[4px] px-2 py-1 text-[14px] underline underline-offset-4 ${focusRing}`} style={{ color: C.muted, outlineColor: C.ink }}>
                    {tx(lang, "다시 고르기", "Change")}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div aria-live="polite">
        {result ? (
          <motion.div
            key={result}
            initial={reduce ? false : { scale: 1.12, rotate: -1.5 }}
            animate={{ scale: 1, rotate: -1.5 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: EASE_SLAM }}
          >
            <VisaSticker code={result} lang={lang} onDocs={() => onDocs(result)} onReset={() => setA(EMPTY)} />
          </motion.div>
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed p-6 text-center" style={{ borderColor: C.line, color: C.muted }}>
            <BookOpen size={30} aria-hidden />
            <p className="text-[16px]">{tx(lang, "질문에 답하면 맞는 체류자격이 여기 나와요", "Your visa type appears here")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** 체류자격 결과. 여권에 붙는 사증 스티커 모양, 아래에 기계 판독 줄 */
function VisaSticker({ code, lang, onDocs, onReset }: { code: Code; lang: Lang; onDocs: () => void; onReset: () => void }) {
  const v = VISAS[code];
  const mrz = `V<KOR${code.replace("-", "")}<<GOMPARTNER<<VISA<<<<<<<<<<<<<<<<`.slice(0, 40);
  return (
    <div className="overflow-hidden rounded-[10px] border-2" style={{ borderColor: C.gold, background: `linear-gradient(135deg, #fbf6e6 0%, #f2e8cc 100%)` }}>
      <div className="flex items-center justify-between px-5 py-2.5 text-[13px] font-bold tracking-[0.08em]" style={{ background: C.ink, color: P.cream, ...monoF }}>
        <span>{tx(lang, "체류자격", "STATUS")}</span>
        <span>REPUBLIC OF KOREA</span>
      </div>
      <div className="grid gap-4 px-5 py-5">
        <div className="flex items-end gap-4">
          <p className="text-[64px] font-bold leading-none tracking-[-0.03em] md:text-[80px]" style={{ ...monoF, color: C.ink }}>
            {code}
          </p>
          <p className="pb-2 text-[22px] font-bold" style={serifF}>
            {v.name[lang]}
          </p>
        </div>
        <dl className="grid gap-2 text-[15px] leading-[1.55]">
          {[
            [tx(lang, "대상", "Who"), v.who[lang]],
            [tx(lang, "취업", "Work"), v.work[lang]],
            [tx(lang, "1회 체류기간 상한", "Max stay per grant"), v.max[lang]],
          ].map(([k, val]) => (
            <div key={k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
              <dt style={{ color: C.muted }}>{k}</dt>
              <dd className="font-semibold" style={{ wordBreak: "keep-all" }}>
                {val}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDocs}
            data-gtm-cta="visa-agent_finder_docs"
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-bold ${focusRing}`}
            style={{ background: C.ink, color: P.cream, outlineColor: C.ink }}
          >
            <FileCheck2 size={18} aria-hidden />
            {tx(lang, "이 자격 연장 서류 보기", "Documents for this visa")}
          </button>
          <button type="button" onClick={onReset} className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.ink }}>
            <RotateCcw size={16} aria-hidden />
            {tx(lang, "처음부터", "Start over")}
          </button>
        </div>
      </div>
      <p aria-hidden className="truncate border-t px-5 py-2 text-[13px] tracking-[0.14em]" style={{ ...monoF, borderColor: "rgba(20,33,61,0.2)", color: C.muted }}>
        {mrz}
      </p>
    </div>
  );
}

/* ---------- 2. 연장 신청일 계산 ---------- */

function ExtendCalc({ lang, today, onConsult }: { lang: Lang; today: Date; onConsult: () => void }) {
  const [raw, setRaw] = useState<string | null>(null);
  const value = raw ?? toInput(daysAgo(today, -100));
  const expiry = fromInput(value);
  const start = expiry ? monthsBefore(expiry, 4) : null;

  let status: "before" | "open" | "over" = "before";
  let pct = 0;
  let winL = 0;
  let winW = 0;
  if (expiry && start) {
    status = today < start ? "before" : today > expiry ? "over" : "open";
    // 막대는 신청 시작 두 달 전부터 만료 보름 뒤까지
    const from = daysAgo(start, 60);
    const to = daysAgo(expiry, -15);
    const span = Math.max(1, dayDiff(to, from));
    pct = c01(dayDiff(today, from) / span) * 100;
    winL = (dayDiff(start, from) / span) * 100;
    winW = (dayDiff(expiry, start) / span) * 100;
  }
  const toStart = start ? dayDiff(start, today) : 0;
  const toExpiry = expiry ? dayDiff(expiry, today) : 0;

  const msg =
    status === "before"
      ? tx(lang, `${toStart}일 뒤부터 신청할 수 있어요`, `You can apply in ${toStart} days`)
      : status === "open"
        ? tx(lang, `지금 신청할 수 있어요. 만료까지 ${toExpiry}일`, `You can apply now. ${toExpiry} days left`)
        : tx(lang, "만료일이 지났어요. 범칙금이 나올 수 있어 바로 상담하세요", "Your stay has expired. A fine may apply, contact us now");
  const tone = status === "open" ? C.green : status === "over" ? C.error : C.blue;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[10px] border p-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10 md:p-8" style={{ ...paperBg, borderColor: C.line }}>
      <div>
        <label htmlFor="va-expiry" className="block text-[16px] font-bold">
          {tx(lang, "지금 체류 만료일", "Current expiry date")}
        </label>
        <input
          id="va-expiry"
          type="date"
          value={value}
          onChange={(e) => setRaw(e.target.value)}
          className={`mt-2 h-12 w-full max-w-[260px] rounded-[6px] border bg-white px-3 text-[17px] ${focusRing}`}
          style={{ ...monoF, borderColor: C.ink, outlineColor: C.ink }}
        />
        <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
          {tx(lang, "외국인등록증 뒷면에 적혀 있어요", "Printed on the back of your residence card")}
        </p>
        <ul className="mt-6 grid gap-1.5 text-[15px]">
          <li>{tx(lang, "하이코리아 방문 예약 또는 전자민원으로 신청", "Apply by Hi Korea visit booking or e-application")}</li>
          <li>{tx(lang, "수수료 60,000원(결혼이민 F-6은 30,000원)", "Fee 60,000 won (F-6: 30,000 won)")}</li>
        </ul>
      </div>

      <div>
        {expiry && start ? (
          <>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[14px]" style={{ color: C.muted }}>
                  {tx(lang, "신청 시작일", "Apply from")}
                </dt>
                <dd className="mt-1 whitespace-nowrap text-[18px] font-bold sm:text-[22px] md:text-[26px]" style={monoF}>
                  {fmtDay(start, lang)}
                </dd>
              </div>
              <div>
                <dt className="text-[14px]" style={{ color: C.muted }}>
                  {tx(lang, "만료일", "Expiry")}
                </dt>
                <dd className="mt-1 whitespace-nowrap text-[18px] font-bold sm:text-[22px] md:text-[26px]" style={monoF}>
                  {fmtDay(expiry, lang)}
                </dd>
              </div>
            </dl>

            {/* 신청 구간 막대. 금색 칸이 만료 4개월 전부터 만료일까지 */}
            <div className="relative mt-7 h-14" aria-hidden>
              <div className="absolute inset-x-0 top-6 h-2 rounded-full" style={{ background: C.line }} />
              <div className="absolute top-5 h-4 rounded-[3px]" style={{ left: `${winL}%`, width: `${winW}%`, background: C.gold }} />
              <motion.div className="absolute inset-x-0 top-0 h-full" initial={false} animate={{ x: `${pct}%` }} transition={{ duration: DUR * 1.6, ease: EASE }}>
                <div className="absolute left-0 top-0 h-full w-[3px] -translate-x-1/2" style={{ background: C.ink }} />
                <span className="absolute -top-6 left-0 -translate-x-1/2 whitespace-nowrap rounded-[3px] px-1.5 text-[12px] font-bold" style={{ background: C.ink, color: P.cream }}>
                  {tx(lang, "오늘", "Today")}
                </span>
              </motion.div>
            </div>

            <p className="mt-4 inline-flex items-start gap-2 text-[18px] font-bold leading-[1.45]" style={{ color: tone, wordBreak: "keep-all" }}>
              {status === "open" ? <Check size={22} aria-hidden className="mt-0.5 flex-none" /> : status === "over" ? <CircleAlert size={22} aria-hidden className="mt-0.5 flex-none" /> : <Clock size={22} aria-hidden className="mt-0.5 flex-none" />}
              <span aria-live="polite">{msg}</span>
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={onConsult}
                data-gtm-cta="visa-agent_extend_consult"
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-bold ${focusRing}`}
                style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
              >
                {tx(lang, "연장 대행 상담신청", "Ask us to file it")}
              </button>
            </div>
          </>
        ) : (
          <p className="text-[16px]" style={{ color: C.error }}>
            {tx(lang, "만료일을 골라 주세요", "Pick your expiry date")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- 3. 필요 서류 ---------- */

function Docs({ lang, code, setCode }: { lang: Lang; code: Code; setCode: (c: Code) => void }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const docs = docsFor(code);
  const keyOf = (i: number) => `${code}-${i}`;
  const count = docs.filter((_, i) => done[keyOf(i)]).length;
  const left = docs.length - count;

  return (
    <div className="rounded-[10px] border" style={{ ...paperBg, borderColor: C.line }}>
      <div role="tablist" aria-label={tx(lang, "체류자격", "Visa type")} className="flex flex-wrap gap-1 border-b p-2" style={{ borderColor: C.line }}>
        {CODES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={c === code}
            onClick={() => setCode(c)}
            className={`rounded-[6px] px-3.5 py-2 text-[15px] font-bold ${focusRing}`}
            style={{ ...monoF, background: c === code ? C.ink : "transparent", color: c === code ? P.cream : C.ink, outlineColor: C.ink }}
          >
            {c}
            <span className="ml-1.5 font-sans text-[13px] font-semibold opacity-80">{VISAS[c].name[lang]}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="grid grid-cols-[minmax(0,1fr)] gap-6 p-5 md:grid-cols-[minmax(0,1fr)_240px] md:p-8">
        <ul className="grid gap-1">
          {docs.map((d, i) => {
            const on = !!done[keyOf(i)];
            return (
              <li key={keyOf(i)}>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[6px] px-2 py-1.5 hover:bg-[#f1ead8]">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setDone((m) => ({ ...m, [keyOf(i)]: !on }))}
                    className={`h-5 w-5 flex-none accent-[#14213d] ${focusRing}`}
                    style={{ outlineColor: C.ink }}
                  />
                  <span className="text-[16px]" style={{ textDecoration: on ? "line-through" : "none", color: on ? C.muted : C.ink }}>
                    {d[lang]}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="self-start rounded-[8px] border p-4" style={{ borderColor: C.line, background: C.paper }}>
          <p className="text-[15px] font-semibold" aria-live="polite">
            {left === 0 ? tx(lang, "서류를 다 챙겼어요", "All documents ready") : tx(lang, `${docs.length}개 중 ${left}개 남았어요`, `${left} of ${docs.length} left`)}
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: C.line }} aria-hidden>
            <motion.div className="h-full w-full origin-left" style={{ background: C.ink }} initial={false} animate={{ scaleX: docs.length ? count / docs.length : 0 }} transition={{ duration: DUR, ease: EASE }} />
          </div>
          <p className="mt-4 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
            {tx(lang, "관할 출입국에 따라 추가 서류가 요구될 수 있습니다.", "Your local immigration office may ask for more documents.")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 5. 상담신청 ---------- */

type Done = { no: string; name: string; phone: string; method: Method; topic: string; reply: Date };

function Consult({ lang, today, reduce }: { lang: Lang; today: Date; reduce: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nation, setNation] = useState(0);
  const [visa, setVisa] = useState<string>("E-7");
  const [topic, setTopic] = useState(0);
  const [method, setMethod] = useState<Method>("kakao");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const ok = nameOk && phoneOk && agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok) return;
    const no = `VA-${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setDone({ no, name, phone, method, topic: TOPICS[topic][lang], reply: nextWorkday(today) });
  };

  const field = `mt-1.5 block h-12 w-full rounded-[6px] border bg-white px-3 text-[16px] ${focusRing}`;
  const err = (show: boolean, text: string) =>
    show ? (
      <p className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
        {text}
      </p>
    ) : null;

  if (done) {
    const desk = done.method === "kakao" ? KAKAO : done.method === "phone" ? tx(lang, "전화로 연락드려요", "We will call you") : tx(lang, "방문 시간을 전화로 잡아 드려요", "We will call to set a visit time");
    const mrz = `${done.no.replace(/-/g, "<")}<<${done.method.toUpperCase()}<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 40);
    return (
      <motion.div
        initial={reduce ? false : { scale: 1.08, rotate: 0 }}
        animate={{ scale: 1, rotate: -0.8 }}
        transition={{ duration: reduce ? 0 : 0.2, ease: EASE_SLAM }}
        className="mx-auto max-w-[640px] overflow-hidden rounded-[10px] border-2"
        style={{ borderColor: C.gold, background: `linear-gradient(135deg, #fbf6e6 0%, #f2e8cc 100%)` }}
        role="status"
      >
        <div className="flex items-center justify-between px-5 py-2.5 text-[13px] font-bold tracking-[0.08em]" style={{ ...monoF, background: C.ink, color: P.cream }}>
          <span>{tx(lang, "상담 접수", "RECEIVED")}</span>
          <span>{done.no}</span>
        </div>
        <div className="grid gap-3 px-5 py-6">
          <p className="text-[24px] font-bold" style={serifF}>
            {tx(lang, "상담신청이 접수됐어요", "Your request is in")}
          </p>
          <dl className="grid gap-2 text-[15px]">
            {[
              [tx(lang, "접수 번호", "Request no."), done.no],
              [tx(lang, "신청인", "Name"), lang === "ko" ? maskName(done.name) : done.name.trim().slice(0, 1) + "***"],
              [tx(lang, "연락처", "Phone"), maskPhone(done.phone)],
              [tx(lang, "상담 내용", "Topic"), done.topic],
              [tx(lang, "담당 창구", "Contact"), desk],
              [tx(lang, "회신 예정일", "Reply by"), `${fmtDay(done.reply, lang)} ${tx(lang, "오전", "morning")}`],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[100px_minmax(0,1fr)] gap-3">
                <dt style={{ color: C.muted }}>{k}</dt>
                <dd className="font-semibold" style={k === tx(lang, "접수 번호", "Request no.") ? monoF : undefined}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <div>
            <button type="button" onClick={() => setDone(null)} className={`mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.ink }}>
              <RotateCcw size={16} aria-hidden />
              {tx(lang, "새로 신청", "New request")}
            </button>
          </div>
        </div>
        <p aria-hidden className="truncate border-t px-5 py-2 text-[13px] tracking-[0.14em]" style={{ ...monoF, borderColor: "rgba(20,33,61,0.2)", color: C.muted }}>
          {mrz}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-[10px] border p-5 md:grid-cols-2 md:gap-x-8 md:p-8" style={{ ...paperBg, borderColor: C.line }}>
      <div>
        <label htmlFor="va-name" className="text-[15px] font-bold">
          {tx(lang, "이름", "Name")}
        </label>
        <input id="va-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.ink, outlineColor: C.ink }} />
        {err(tried && !nameOk, tx(lang, "이름을 두 글자 이상 적어 주세요", "Please enter your name"))}
      </div>
      <div>
        <label htmlFor="va-phone" className="text-[15px] font-bold">
          {tx(lang, "연락처", "Phone")}
        </label>
        <input id="va-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" autoComplete="tel" className={field} style={{ ...monoF, borderColor: C.ink, outlineColor: C.ink }} />
        {err(tried && !phoneOk, tx(lang, "연락처를 확인해 주세요", "Please check your phone number"))}
      </div>
      <div>
        <label htmlFor="va-nation" className="text-[15px] font-bold">
          {tx(lang, "국적", "Nationality")}
        </label>
        <select id="va-nation" value={nation} onChange={(e) => setNation(Number(e.target.value))} className={field} style={{ borderColor: C.ink, outlineColor: C.ink }}>
          {NATIONS.map((n, i) => (
            <option key={n.en} value={i}>
              {n[lang]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="va-visa" className="text-[15px] font-bold">
          {tx(lang, "현재 체류자격", "Current visa")}
        </label>
        <select id="va-visa" value={visa} onChange={(e) => setVisa(e.target.value)} className={field} style={{ borderColor: C.ink, outlineColor: C.ink }}>
          {CODES.map((c) => (
            <option key={c} value={c}>
              {c} {VISAS[c].name[lang]}
            </option>
          ))}
          <option value="etc">{tx(lang, "기타, 아직 없음", "Other, none yet")}</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label htmlFor="va-topic" className="text-[15px] font-bold">
          {tx(lang, "상담 내용", "Topic")}
        </label>
        <select id="va-topic" value={topic} onChange={(e) => setTopic(Number(e.target.value))} className={`${field} md:max-w-[420px]`} style={{ borderColor: C.ink, outlineColor: C.ink }}>
          {TOPICS.map((t, i) => (
            <option key={t.en} value={i}>
              {t[lang]}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="md:col-span-2">
        <legend className="text-[15px] font-bold">{tx(lang, "상담 방법", "How to talk")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <label
              key={m.id}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[6px] border px-4 text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2"
              style={{ borderColor: C.ink, background: method === m.id ? C.ink : "transparent", color: method === m.id ? P.cream : C.ink, outlineColor: C.ink }}
            >
              <input type="radio" name="va-method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
              {method === m.id && <Check size={16} aria-hidden />}
              {m.label[lang]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="md:col-span-2">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[15px]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 accent-[#14213d] ${focusRing}`} style={{ outlineColor: C.ink }} />
          {tx(lang, "개인정보 수집, 이용에 동의합니다(상담 회신에만 사용)", "I agree to the use of my personal data (for reply only)")}
        </label>
        {err(tried && !agree, tx(lang, "개인정보 수집에 동의해 주세요", "Please agree to continue"))}
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          data-gtm-cta="visa-agent_consult_submit"
          className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[6px] px-6 text-[17px] font-bold md:w-auto ${focusRing}`}
          style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
        >
          <Stamp size={20} aria-hidden />
          {tx(lang, "상담신청", "Send request")}
        </button>
      </div>
    </form>
  );
}

/* ---------- 오시는 길 ---------- */

function Visit({ lang, today }: { lang: Lang; today: Date }) {
  const dow = today.getDay();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-[10px] border p-5 md:p-6" style={{ ...paperBg, borderColor: C.line }}>
        <p className="text-[18px] font-bold">{ADDRESS}</p>
        <ul className="mt-3 grid gap-1.5 text-[16px]" style={{ color: C.muted }}>
          <li>{tx(lang, "ㅇㅇ출입국외국인사무소에서 걸어서 5분", "5 minutes walk from the ㅇㅇ immigration office")}</li>
          <li>{tx(lang, "지하철 ㅇㅇ역 2번 출구", "Subway ㅇㅇ station exit 2")}</li>
          <li>{tx(lang, "건물 주차 가능(1시간)", "Parking in the building (1 hour)")}</li>
          <li>{KAKAO}</li>
        </ul>
      </div>
      <div className="rounded-[10px] border p-5 md:p-6" style={{ ...paperBg, borderColor: C.line }}>
        <p className="inline-flex items-center gap-2 text-[18px] font-bold">
          <Clock size={20} aria-hidden />
          {tx(lang, "상담 시간", "Office hours")}
        </p>
        <dl className="mt-3 grid gap-1.5 text-[16px]">
          {HOURS.map((h) => {
            const on = h.dows.includes(dow);
            return (
              <div key={h.label.en} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 md:grid-cols-[150px_minmax(0,1fr)]" style={{ fontWeight: on ? 800 : 400 }}>
                <dt>
                  {h.label[lang]}
                  {on && <span className="ml-1.5 rounded-[3px] px-1.5 text-[12px]" style={{ background: C.ink, color: P.cream }}>{tx(lang, "오늘", "Today")}</span>}
                </dt>
                <dd>{h.time[lang]}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, lang, today, onCta }: { reduce: boolean; lang: Lang; today: Date; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : c01(v / EXIT_END)));
  // 나중에 넘어간 면부터 거꾸로 닫히고, 표지가 마지막에 덮인다
  const close2 = useTransform(p, (v) => c01(v / 0.3) * 180);
  const close1 = useTransform(p, (v) => c01((v - 0.08) / 0.3) * 180);
  const closeCover = useTransform(p, (v) => c01((v - 0.16) / 0.3) * 180);
  const spreadX = useTransform(p, (v) => `${-25 * c01((v - 0.16) / 0.3)}%`);
  // 다 닫힌 뒤 아래로 떨어진다
  const dropY = useTransform(p, (v) => {
    const k = c01((v - 0.45) / 0.55);
    return `${k * k * 75}svh`;
  });
  const dropRot = useTransform(p, (v) => c01((v - 0.45) / 0.55) * -12);
  const textY = useTransform(p, (v) => `${-v * 42}svh`);
  const textO = useTransform(p, (v) => 1 - c01((v - 0.35) / 0.65));

  const lines = lang === "ko" ? ["체류 기간 연장,", "만료 4개월", "전부터 돼요"] : ["Visa extension", "opens 4 months", "before expiry"];

  return (
    <section id="va-poster" ref={ref} aria-labelledby="va-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: P.bg }}>
      <div
        className={`${reduce ? "relative h-svh min-h-[600px]" : "sticky top-0 h-svh"} overflow-hidden`}
        style={{ background: `radial-gradient(110% 80% at 80% 60%, #1f3260 0%, ${P.bg} 50%, ${P.bgDeep} 100%)`, color: P.cream }}
      >
        {/* 도장 잉크 번짐. 한 번만 계산되는 정지 필터 */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="va-ink" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.7" result="holes" />
            <feComposite in="d" in2="holes" operator="in" />
          </filter>
        </svg>

        {/* 여권 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[8svh] flex justify-center [--pw:min(41vw,26svh)] md:inset-y-0 md:left-auto md:right-[3vw] md:w-[40vw] md:items-center md:pt-[4svh] md:[--pw:min(16.5vw,36svh)]">
          <motion.div style={{ y: dropY, rotate: dropRot }}>
            <Passport reduce={reduce} today={today} spreadX={spreadX} close1={close1} close2={close2} closeCover={closeCover} />
          </motion.div>
        </div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none" style={serifF}>
            <Stamp size={20} aria-hidden style={{ color: P.gold }} />
            {lang === "ko" ? BRAND : BRAND_EN}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label={tx(lang, "상담신청", "Request a consultation")}
            title={tx(lang, "상담신청", "Request a consultation")}
            data-gtm-cta="visa-agent_poster_cta"
            className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: P.gold, color: P.bg, outlineColor: P.cream }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[1] flex h-full flex-col px-4 pt-[14svh] md:justify-center md:px-12 md:pb-[4svh] md:pt-0" style={{ y: textY, opacity: textO }}>
          <h1
            id="va-poster-title"
            className={`font-black tracking-[-0.035em] ${lang === "ko" ? "text-[clamp(50px,13.6vw,72px)] leading-[1.12] md:text-[clamp(96px,8.4vw,190px)] md:leading-[1.06]" : "text-[clamp(40px,11.4vw,60px)] leading-[1.08] md:text-[clamp(72px,7vw,150px)] md:leading-[1.02]"}`}
            style={{ ...serifF, wordBreak: "keep-all" }}
          >
            {lines.map((l, i) => (
              <span key={l} className="block" style={i === 1 ? { color: P.gold } : undefined}>
                {l}
              </span>
            ))}
          </h1>
          <p className="mt-5 text-[16px] md:mt-8 md:text-[19px]" style={{ color: P.sub }}>
            {tx(lang, "출입국 업무 대행, 한국어와 English 상담", "Immigration filings, in Korean and English")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const preserve = { transformStyle: "preserve-3d" } as const;
const hideBack = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;

/** 펼친 여권. 책 상자는 펼친 면의 오른쪽 절반이고, 넘어가는 면은 왼쪽 모서리(제본선)를 축으로 돈다 */
function Passport({
  reduce,
  today,
  spreadX,
  close1,
  close2,
  closeCover,
}: {
  reduce: boolean;
  today: Date;
  spreadX: MotionValue<string>;
  close1: MotionValue<number>;
  close2: MotionValue<number>;
  closeCover: MotionValue<number>;
}) {
  const entry = STAMP_AT + STAMP_GAP * 3 + STAMP_DUR;
  const d1 = fmtDot(daysAgo(today, 860));
  const d2 = fmtDot(daysAgo(today, 812));
  const d3 = fmtDot(daysAgo(today, 410));
  const d4a = fmtDot(daysAgo(today, -2));
  const d4b = fmtDot(daysAgo(today, -1097));

  return (
    <motion.div
      initial={false}
      animate={reduce ? { y: 0 } : { y: [0, -8, 0] }}
      transition={reduce ? { duration: 0 } : { duration: FLOAT_LOOP, delay: entry, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative" style={{ perspective: 1700 }} role="img" aria-label="표지가 열리고 사증 면이 넘어간 뒤 출입국 도장과 체류기간 연장허가 도장이 찍히는 여권">
        {/* 바닥 그림자 */}
        <div aria-hidden className="absolute left-1/2 top-[88%] h-[26%] w-[calc(var(--pw)*2.3)] -translate-x-1/2 rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))" }} />
        <div style={{ ...preserve, transform: "rotateX(16deg) rotateZ(-5deg)" }}>
          <motion.div className="w-[calc(var(--pw)*2)]" style={{ ...preserve, x: spreadX }}>
            <motion.div
              className="relative h-[calc(var(--pw)*1.42)] w-[calc(var(--pw)*2)]"
              style={preserve}
              initial={reduce ? false : { x: "-25%" }}
              animate={{ x: "0%" }}
              transition={{ duration: reduce ? 0 : COVER_DUR, delay: reduce ? 0 : COVER_AT, ease: EASE_FLIP }}
            >
              <div className="absolute left-1/2 top-0 h-full w-1/2" style={preserve}>
                {/* 맨 아래 면. 오른쪽 가장자리에 남은 종이 두께 */}
                <div className="absolute inset-0 overflow-hidden rounded-r-[8px]" style={{ ...pageFace("right"), boxShadow: "2px 1px 0 #e3d9c2, 4px 2px 0 #d2c6ab, 6px 3px 0 #1c2f58" }}>
                  <PageHead side="right" n="7" />
                  <InkStamp shape="oval" color={C.green} top="12%" left="8%" w="54%" rot={9} delay={STAMP_AT + STAMP_GAP * 2} reduce={reduce} big="입국" small="ARRIVAL" date={d3} />
                  <InkStamp shape="permit" color={C.red} top="47%" left="6%" w="88%" rot={-6} delay={STAMP_AT + STAMP_GAP * 3} reduce={reduce} big="체류기간 연장허가" small="EXTENSION OF STAY" date={`${d4a} ~ ${d4b}`} />
                </div>

                <Leaf z={1} close={close2} at={PAGE2_AT} dur={PAGE_DUR} reduce={reduce} front={<PageFront n="5" />}>
                  <div className="absolute inset-0 overflow-hidden rounded-l-[8px]" style={pageFace("left")}>
                    <PageHead side="left" n="6" />
                    <InkStamp shape="circle" color={C.purple} top="10%" left="10%" w="50%" rot={-12} delay={STAMP_AT} reduce={reduce} big="입국" small="ARRIVAL" date={d1} />
                    <InkStamp shape="rect" color={C.blue} top="54%" left="24%" w="64%" rot={7} delay={STAMP_AT + STAMP_GAP} reduce={reduce} big="출국" small="DEPARTURE" date={d2} />
                  </div>
                </Leaf>

                <Leaf z={2} close={close1} at={PAGE1_AT} dur={PAGE_DUR} reduce={reduce} front={<PageFront n="3" />}>
                  <div className="absolute inset-0 rounded-l-[8px]" style={pageFace("left")}>
                    <PageHead side="left" n="4" />
                  </div>
                </Leaf>

                <Leaf z={3} close={closeCover} at={COVER_AT} dur={COVER_DUR} reduce={reduce} front={<Cover />}>
                  <div className="absolute inset-0 rounded-l-[10px]" style={{ background: `linear-gradient(to left, rgba(0,0,0,0.25), transparent 14%), ${P.leatherDark}` }}>
                    <div className="absolute inset-[5%] rounded-l-[6px]" style={{ ...pageFace("left"), backgroundColor: "#e9e0c8" }} />
                  </div>
                </Leaf>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/** 넘어가는 한 장. 바깥 상자는 스크롤로 닫히는 각도, 안쪽은 등장 때 열리는 각도. 둘이 더해진다 */
function Leaf({ z, close, at, dur, reduce, front, children }: { z: number; close: MotionValue<number>; at: number; dur: number; reduce: boolean; front: ReactNode; children: ReactNode }) {
  return (
    <motion.div className="absolute inset-0" style={{ ...preserve, transformOrigin: "0% 50%", rotateY: close }}>
      <motion.div
        className="absolute inset-0"
        style={{ ...preserve, transformOrigin: "0% 50%" }}
        initial={reduce ? false : { rotateY: 0 }}
        animate={{ rotateY: -180 }}
        transition={{ duration: reduce ? 0 : dur, delay: reduce ? 0 : at, ease: EASE_FLIP }}
      >
        <div className="absolute inset-0" style={{ ...preserve, transform: `translateZ(${z}px)` }}>
          <div className="absolute inset-0" style={hideBack}>
            {front}
          </div>
          <div className="absolute inset-0" style={{ ...hideBack, transform: "rotateY(180deg)" }}>
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** 사증 면 종이. 제본선 쪽이 살짝 어둡다 */
function pageFace(side: "left" | "right") {
  const dir = side === "right" ? "to right" : "to left";
  return {
    backgroundColor: "#f3ecd9",
    backgroundImage: `linear-gradient(${dir}, rgba(60,40,10,0.22), rgba(60,40,10,0) 13%), repeating-radial-gradient(ellipse at 50% 110%, rgba(20,33,61,0) 0 7px, rgba(20,33,61,0.07) 7px 8px), linear-gradient(160deg, #f8f2e2, #eadfc4)`,
  } as const;
}

function PageHead({ side, n }: { side: "left" | "right"; n: string }) {
  return (
    <div className={`absolute inset-x-[7%] top-[4%] flex items-center justify-between text-[clamp(7px,0.7vw,10px)] font-semibold tracking-[0.12em] ${side === "left" ? "flex-row-reverse" : ""}`} style={{ ...monoF, color: "rgba(20,33,61,0.55)" }}>
      <span>사증 VISAS</span>
      <span>{n}</span>
    </div>
  );
}

function PageFront({ n }: { n: string }) {
  return (
    <div className="absolute inset-0 rounded-r-[8px]" style={pageFace("right")}>
      <PageHead side="right" n={n} />
    </div>
  );
}

/** 여권 표지. 가죽 결 그라디언트, 금박 문양, 위쪽 하이라이트 한 줄 */
function Cover() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-r-[10px]"
      style={{
        background: `radial-gradient(120% 90% at 30% 20%, #2a4176 0%, ${P.leather} 45%, ${P.leatherDark} 100%)`,
        boxShadow: "inset 6px 0 10px rgba(0,0,0,0.35), inset -1px -1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="absolute inset-x-[6%] top-[1.2%] h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)" }} />
      <svg viewBox="0 0 200 284" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="va-foil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3d98c" />
            <stop offset="0.45" stopColor="#c99d43" />
            <stop offset="0.7" stopColor="#f6e2a2" />
            <stop offset="1" stopColor="#a57c2c" />
          </linearGradient>
        </defs>
        <text x="100" y="56" textAnchor="middle" fontSize="15" fontWeight="700" letterSpacing="5" fill="url(#va-foil)">
          여권
        </text>
        <text x="100" y="74" textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="4" fill="url(#va-foil)">
          PASSPORT
        </text>
        {/* 지구본 문양 */}
        <g transform="translate(100 146)" fill="none" stroke="url(#va-foil)" strokeWidth="2.2">
          <circle r="36" />
          <ellipse rx="16" ry="36" />
          <path d="M-36 0 H36 M-31 -18 H31 M-31 18 H31 M0 -36 V36" strokeWidth="1.5" />
          <circle r="44" strokeWidth="1" strokeDasharray="2 4" />
        </g>
        {/* 전자여권 표시 */}
        <g transform="translate(100 238)" fill="none" stroke="url(#va-foil)" strokeWidth="2">
          <rect x="-14" y="-9" width="28" height="18" rx="2" />
          <circle r="4.5" />
          <path d="M-14 0 H-4.5 M4.5 0 H14" strokeWidth="1.4" />
        </g>
      </svg>
    </div>
  );
}

/** 출입국 도장. 찍힐 때 크게 들려 있다가 종이로 내리찍힌다 */
function InkStamp({
  shape,
  color,
  top,
  left,
  w,
  rot,
  delay,
  reduce,
  big,
  small,
  date,
}: {
  shape: "circle" | "rect" | "oval" | "permit";
  color: string;
  top: string;
  left: string;
  w: string;
  rot: number;
  delay: number;
  reduce: boolean;
  big: string;
  small: string;
  date: string;
}) {
  const vb = shape === "circle" ? "0 0 120 120" : shape === "rect" ? "0 0 150 84" : shape === "oval" ? "0 0 140 92" : "0 0 180 104";
  return (
    <motion.div
      className="absolute"
      style={{ top, left, width: w, rotate: rot, mixBlendMode: "multiply" }}
      initial={reduce ? false : { opacity: 0, scale: 1.8 }}
      animate={{ opacity: 0.9, scale: 1 }}
      transition={{ duration: reduce ? 0 : STAMP_DUR, delay: reduce ? 0 : delay, ease: EASE_SLAM }}
    >
      <svg viewBox={vb} className="block h-auto w-full" aria-hidden>
        <g filter="url(#va-ink)" fill="none" stroke={color} style={{ fontFamily: "inherit" }}>
          {shape === "circle" && (
            <>
              <circle cx="60" cy="60" r="55" strokeWidth="4" />
              <circle cx="60" cy="60" r="45" strokeWidth="1.6" />
              <text x="60" y="36" textAnchor="middle" fontSize="12" fontWeight="700" fill={color} stroke="none" letterSpacing="3">
                ICN
              </text>
              <text x="60" y="70" textAnchor="middle" fontSize="27" fontWeight="900" fill={color} stroke="none">
                {big}
              </text>
              <text x="60" y="86" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} stroke="none" letterSpacing="1.5">
                {small}
              </text>
              <text x="60" y="100" textAnchor="middle" fontSize="9" fontWeight="700" fill={color} stroke="none">
                {date}
              </text>
            </>
          )}
          {shape === "rect" && (
            <>
              <rect x="3" y="3" width="144" height="78" rx="6" strokeWidth="4" />
              <path d="M10 30 H140" strokeWidth="1.6" />
              <text x="75" y="23" textAnchor="middle" fontSize="12" fontWeight="700" fill={color} stroke="none" letterSpacing="3">
                ICN {small}
              </text>
              <text x="75" y="58" textAnchor="middle" fontSize="24" fontWeight="900" fill={color} stroke="none">
                {big}
              </text>
              <text x="75" y="74" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} stroke="none">
                {date}
              </text>
            </>
          )}
          {shape === "oval" && (
            <>
              <ellipse cx="70" cy="46" rx="66" ry="42" strokeWidth="4" />
              <text x="70" y="40" textAnchor="middle" fontSize="24" fontWeight="900" fill={color} stroke="none">
                {big}
              </text>
              <text x="70" y="56" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} stroke="none" letterSpacing="1.5">
                {small}
              </text>
              <text x="70" y="71" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} stroke="none">
                {date}
              </text>
            </>
          )}
          {shape === "permit" && (
            <>
              <rect x="3" y="3" width="174" height="98" rx="3" strokeWidth="4" />
              <rect x="10" y="10" width="160" height="84" rx="2" strokeWidth="1.4" />
              <text x="90" y="44" textAnchor="middle" fontSize="21" fontWeight="900" fill={color} stroke="none">
                {big}
              </text>
              <text x="90" y="60" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} stroke="none" letterSpacing="2">
                {small}
              </text>
              <text x="90" y="80" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={color} stroke="none">
                {date}
              </text>
            </>
          )}
        </g>
      </svg>
    </motion.div>
  );
}

