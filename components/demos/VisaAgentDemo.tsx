"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarCheck, Check, Clock, FileCheck2, Languages, MapPin, MessageCircle, RotateCcw, Stamp } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 행정사사무소(외국인 비자) 홈페이지 샘플: 가상의 곰파트너 행정사사무소. 체류기간 연장, 체류자격 변경, 결혼이민, 영주, 귀화를 대행한다.
   상호, 주소, 손님 이름은 모두 가상이다. 체류자격 설명과 서류는 하이코리아 안내를 줄인 일반 안내다.

   국내 출입국 행정사 사이트 공통 구성(참고): 메뉴는 사무소 소개, 업무 안내(체류기간 연장, 체류자격 변경, 사증발급인정서,
   외국인등록, 영주권 F-5, 귀화), 비자 종류, 상담신청, 오시는 길. 첫 화면에 한국어와 English 전환 버튼, 카카오톡 채널 상담.
   관용 문구는 "체류기간 만료 4개월 전부터 신청 가능", "관할 출입국에 따라 추가 서류가 요구될 수 있습니다", "하이코리아 방문 예약",
   "출입국 방문 대행". 체류기간 연장 수수료는 60,000원, 결혼이민(F-6)은 30,000원(출입국관리법 시행규칙 제72조).
   1회 체류기간 상한은 같은 규칙 별표 1(D-2 2년, D-10 1년, E-7 3년, F-4 3년, F-6 3년).
   행정사도 결과 보장, 허가율, 100% 같은 표현은 쓰지 않는다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 체류자격 안내: F-4, F-6, E-7, D-2, D-10의 대상, 취업 범위, 1회 체류기간 상한, 연장 수수료 표.
   2. 체류기간 연장 안내: 신청 시기, 신청 방법, 수수료, 기한을 넘겼을 때.
   3. 필요 서류: 체류자격 탭을 고르면 연장 서류 목록이 바뀐다.
   4. 한국어와 English 전환: 포스터 문장부터 상담 폼까지 전부 바뀐다.
   5. 상담신청: 이름, 연락처, 국적, 현재 체류자격, 상담 내용, 상담 방법. 완료 화면은 접수 번호와 회신 예정일이 찍힌 사증 모양.

   사진 출처: Pexels 사진 32081456
   첫 화면(va-poster): 맨 위 언어 줄(한국어, English)을 크게 두고, 상단 메뉴 아래 왼쪽 1/3 은 사무소 사진, 오른쪽 2/3 은 체류자격 코드판.
   코드 칸을 고르면 아래에 대상, 취업, 체류기간 상한, 연장 수수료가 바뀌고, 고른 코드가 필요 서류 탭에도 그대로 선택된다.
   휴대폰에서는 언어 버튼 두 개를 균등 폭으로, 메뉴는 가로로 밀고, 사진은 코드판 아래 16:9 한 장. */

const IMG = "/images/demo-visa-agent";

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
// 11-08 English 화면에서도 한국어로 나오던 연락 창구를 언어별로
const kakao = (lang: Lang) => tx(lang, "카카오톡 채널 비자 행정사사무소", "KakaoTalk channel: Visa Administrative Agency Office");

/** 본문 색 */
const C = {
  paper: "#ffffff",
  soft: "#f7f7f5",
  card: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  /** 입력칸 테두리 */
  field: "#c4c4c4",
  /** 강조색. 버튼, 선택된 칩, 작은 표시에만 쓴다(흰 글자 대비 7.5) */
  accent: "#8c2f39",
  /** 신청 가능 구간 막대 */
  accentSoft: "#ead6d8",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 본문 전환 */
const DUR = 0.25;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];
const DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Lang = "ko" | "en";
type Tx = { ko: string; en: string };
const tx = (lang: Lang, ko: string, en: string) => (lang === "ko" ? ko : en);

const fmtDay = (d: Date, lang: Lang) => `${fmtDot(d)}(${lang === "ko" ? DOW_KO[d.getDay()] : DOW_EN[d.getDay()]})`;
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

  return (
    <div lang={lang} className="min-h-screen overflow-x-clip pb-16" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} lang={lang} setLang={setLang} code={docCode} setCode={setDocCode} go={go} />

      {/* 업무 안내 */}
      <section id="va-services" aria-labelledby="va-hero-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-4 md:px-6 md:pt-8">
        <div className="grid gap-8 border-y py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12 md:py-12" style={{ borderColor: C.line }}>
          <div>
            <h2 id="va-hero-title" className="text-[26px] font-bold leading-tight md:text-[32px]" style={{ wordBreak: "keep-all" }}>
              {tx(lang, "업무 분야", "Services")}
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
              <li key={s.code} className="flex min-h-[72px] items-center p-4" style={{ background: C.card }}>
                <span className="text-[16px] font-bold leading-[1.35]" style={{ wordBreak: "keep-all" }}>
                  {s.label[lang]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section id="va-types" icon={<BookOpen size={22} aria-hidden />} title={tx(lang, "체류자격 안내", "Visa types")}>
        <VisaTable
          lang={lang}
          onDocs={(code) => {
            setDocCode(code);
            go("va-docs");
          }}
        />
      </Section>

      <Section id="va-extend" icon={<CalendarCheck size={22} aria-hidden />} title={tx(lang, "체류기간 연장 안내", "Extending your stay")}>
        <ExtendGuide lang={lang} onConsult={() => go("va-consult")} />
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
          <SampleLogo size={18} />
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
      <h2 id={`${id}-title`} className="mb-6 inline-flex items-center gap-2.5 text-[26px] font-bold leading-tight md:text-[32px]" style={{ wordBreak: "keep-all" }}>
        <span style={{ color: C.accent }}>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** 카드 바탕 */
const paperBg = { backgroundColor: C.soft } as const;

/* ---------- 1. 체류자격 안내 ---------- */

function VisaTable({ lang, onDocs }: { lang: Lang; onDocs: (c: Code) => void }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {CODES.map((c) => {
        const v = VISAS[c];
        return (
          <li key={c} className="flex flex-col rounded-[8px] border p-5" style={{ ...paperBg, borderColor: C.line }}>
            <p className="flex items-baseline gap-2">
              <span className="text-[24px] font-bold tabular-nums">{c}</span>
              <span className="text-[16px] font-semibold" style={{ color: C.body }}>
                {v.name[lang]}
              </span>
            </p>
            <dl className="mt-3 grid gap-1.5 text-[15px]">
              {[
                [tx(lang, "대상", "Who"), v.who[lang]],
                [tx(lang, "취업", "Work"), v.work[lang]],
                [tx(lang, "1회 체류기간", "Max stay per grant"), v.max[lang]],
                [tx(lang, "연장 수수료", "Extension fee"), feeOf(c, lang)],
              ].map(([k, val]) => (
                <div key={k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-2">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => onDocs(c)}
              className={`mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-3 text-[15px] font-semibold underline underline-offset-4 ${focusRing}`}
              style={{ outlineColor: C.ink }}
            >
              {tx(lang, "연장 서류 보기", "See documents")}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- 2. 체류기간 연장 안내 ---------- */

function ExtendGuide({ lang, onConsult }: { lang: Lang; onConsult: () => void }) {
  const rows: [string, string][] = [
    [tx(lang, "신청 시기", "When"), tx(lang, "체류기간 만료 4개월 전부터 만료일까지", "From 4 months before your expiry date until the expiry date")],
    [tx(lang, "확인하는 곳", "Where to check"), tx(lang, "외국인등록증 뒷면의 체류기간", "The stay period on the back of your residence card")],
    [tx(lang, "신청 방법", "How"), tx(lang, "하이코리아 방문 예약 또는 전자민원", "Hi Korea visit booking or e-application")],
    [tx(lang, "수수료", "Fee"), tx(lang, "60,000원 (결혼이민 F-6은 30,000원)", "60,000 won (F-6: 30,000 won)")],
    [tx(lang, "기한을 넘기면", "If you miss it"), tx(lang, "범칙금이 부과되고 다음 심사에 불리할 수 있습니다", "A fine applies and it may count against future applications")],
  ];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[8px] border p-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-10 md:p-8" style={{ ...paperBg, borderColor: C.line }}>
      <dl className="border-t" style={{ borderColor: C.ink }}>
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 border-b py-3 text-[16px] md:grid-cols-[150px_minmax(0,1fr)]" style={{ borderColor: C.line }}>
            <dt className="font-bold">{k}</dt>
            <dd style={{ color: C.body }}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="self-start rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
        <p className="text-[16px] leading-[1.7]">
          {tx(lang, "서류 준비부터 출입국 방문까지 대신 처리합니다. 만료일이 가까우면 먼저 전화 주세요.", "We prepare the documents and visit immigration for you. Call us first if your expiry date is close.")}
        </p>
        <button
          type="button"
          onClick={onConsult}
          className={`mt-4 inline-flex min-h-11 items-center rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
          style={{ background: C.accent, outlineColor: C.ink }}
        >
          {tx(lang, "연장 대행 상담신청", "Ask us to file it")}
        </button>
      </div>
    </div>
  );
}

/* ---------- 3. 필요 서류 ---------- */

function Docs({ lang, code, setCode }: { lang: Lang; code: Code; setCode: (c: Code) => void }) {
  const docs = docsFor(code);

  return (
    <div className="rounded-[8px] border" style={{ ...paperBg, borderColor: C.line }}>
      <div role="tablist" aria-label={tx(lang, "체류자격", "Visa type")} className="flex flex-wrap gap-1 border-b p-2" style={{ borderColor: C.line }}>
        {CODES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={c === code}
            onClick={() => setCode(c)}
            className={`rounded-[6px] px-3.5 py-2 text-[15px] font-semibold tabular-nums ${focusRing}`}
            style={{ background: c === code ? C.accent : "transparent", color: c === code ? "#fff" : C.ink, outlineColor: C.ink }}
          >
            {c}
            <span className="ml-1.5 text-[13px] font-medium opacity-80">{VISAS[c].name[lang]}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="grid grid-cols-[minmax(0,1fr)] gap-6 p-5 md:grid-cols-[minmax(0,1fr)_240px] md:p-8">
        <ol className="grid list-decimal gap-1.5 pl-6 text-[16px] leading-[1.6]">
          {docs.map((d) => (
            <li key={d.ko}>{d[lang]}</li>
          ))}
        </ol>
        <div className="self-start rounded-[8px] border p-4" style={{ borderColor: C.line, background: C.paper }}>
          <p className="text-[15px] font-semibold">
            {tx(lang, `${VISAS[code].name.ko} 연장 서류 ${docs.length}가지`, `${docs.length} documents for ${VISAS[code].name.en}`)}
          </p>
          <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
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
    const desk = done.method === "kakao" ? kakao(lang) : done.method === "phone" ? tx(lang, "전화로 연락드려요", "We will call you") : tx(lang, "방문 시간을 전화로 잡아 드려요", "We will call to set a visit time");
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
        className="mx-auto max-w-[640px] rounded-[8px] border bg-white"
        style={{ borderColor: C.line }}
        role="status"
      >
        <div className="grid gap-3 px-5 py-6 md:px-7">
          <p className="inline-flex items-center gap-2 text-[24px] font-bold">
            <Check size={24} aria-hidden style={{ color: C.accent }} />
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
                <dd className="font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <button type="button" onClick={() => setDone(null)} className={`mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.field, outlineColor: C.ink }}>
              <RotateCcw size={16} aria-hidden />
              {tx(lang, "새로 신청", "New request")}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-[8px] border p-5 md:grid-cols-2 md:gap-x-8 md:p-8" style={{ ...paperBg, borderColor: C.line }}>
      <div>
        <label htmlFor="va-name" className="text-[15px] font-bold">
          {tx(lang, "이름", "Name")}
        </label>
        <input id="va-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.field, outlineColor: C.ink }} />
        {err(tried && !nameOk, tx(lang, "이름을 두 글자 이상 적어 주세요", "Please enter your name"))}
      </div>
      <div>
        <label htmlFor="va-phone" className="text-[15px] font-bold">
          {tx(lang, "연락처", "Phone")}
        </label>
        <input id="va-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" autoComplete="tel" className={`${field} tabular-nums`} style={{ borderColor: C.field, outlineColor: C.ink }} />
        {err(tried && !phoneOk, tx(lang, "연락처를 확인해 주세요", "Please check your phone number"))}
      </div>
      <div>
        <label htmlFor="va-nation" className="text-[15px] font-bold">
          {tx(lang, "국적", "Nationality")}
        </label>
        <select id="va-nation" value={nation} onChange={(e) => setNation(Number(e.target.value))} className={field} style={{ borderColor: C.field, outlineColor: C.ink }}>
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
        <select id="va-visa" value={visa} onChange={(e) => setVisa(e.target.value)} className={field} style={{ borderColor: C.field, outlineColor: C.ink }}>
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
        <select id="va-topic" value={topic} onChange={(e) => setTopic(Number(e.target.value))} className={`${field} md:max-w-[420px]`} style={{ borderColor: C.field, outlineColor: C.ink }}>
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
              style={{ borderColor: method === m.id ? C.accent : C.field, background: method === m.id ? C.accent : C.paper, color: method === m.id ? "#fff" : C.ink, outlineColor: C.ink }}
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
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 accent-[#8c2f39] ${focusRing}`} style={{ outlineColor: C.ink }} />
          {tx(lang, "개인정보 수집, 이용에 동의합니다(상담 회신에만 사용)", "I agree to the use of my personal data (for reply only)")}
        </label>
        {err(tried && !agree, tx(lang, "개인정보 수집에 동의해 주세요", "Please agree to continue"))}
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          data-gtm-cta="visa-agent_consult_submit"
          className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[6px] px-6 text-[17px] font-semibold md:w-auto ${focusRing}`}
          style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
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
      <div className="rounded-[8px] border p-5 md:p-6" style={{ ...paperBg, borderColor: C.line }}>
        <p className="text-[18px] font-bold">{ADDRESS}</p>
        <ul className="mt-3 grid gap-1.5 text-[16px]" style={{ color: C.muted }}>
          <li>{tx(lang, "ㅇㅇ출입국외국인사무소에서 걸어서 5분", "5 minutes walk from the ㅇㅇ immigration office")}</li>
          <li>{tx(lang, "지하철 ㅇㅇ역 2번 출구", "Subway ㅇㅇ station exit 2")}</li>
          <li>{tx(lang, "건물 주차 가능(1시간)", "Parking in the building (1 hour)")}</li>
          <li>{kakao(lang)}</li>
        </ul>
      </div>
      <div className="rounded-[8px] border p-5 md:p-6" style={{ ...paperBg, borderColor: C.line }}>
        <p className="inline-flex items-center gap-2 text-[18px] font-bold">
          <Clock size={20} aria-hidden />
          {tx(lang, "상담 시간", "Office hours")}
        </p>
        <dl className="mt-3 grid gap-1.5 text-[16px]">
          {HOURS.map((h) => {
            const on = h.dows.includes(dow);
            return (
              <div key={h.label.en} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 md:grid-cols-[150px_minmax(0,1fr)]" style={{ fontWeight: on ? 700 : 400 }}>
                <dt>
                  {h.label[lang]}
                  {on && <span className="ml-1.5 rounded-[3px] px-1.5 text-[12px]" style={{ background: C.accent, color: "#fff" }}>{tx(lang, "오늘", "Today")}</span>}
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

/* ---------- 첫 화면 ---------- */

/** 상단 메뉴. 출입국 행정사 사이트 표준 메뉴 이름을 기존 구간에 잇는다 */
const MENU: { id: string; label: Tx }[] = [
  { id: "va-services", label: { ko: "업무 분야", en: "Services" } },
  { id: "va-types", label: { ko: "비자 종류", en: "Visa types" } },
  { id: "va-extend", label: { ko: "연장 신청", en: "Extension" } },
  { id: "va-docs", label: { ko: "필요 서류", en: "Documents" } },
  { id: "va-visit", label: { ko: "오시는 길", en: "Location" } },
];

/** 연장 수수료(출입국관리법 시행규칙 제72조) */
const feeOf = (code: Code, lang: Lang) => (code === "F-6" ? tx(lang, "30,000원", "30,000 won") : tx(lang, "60,000원", "60,000 won"));

function Poster({
  reduce,
  lang,
  setLang,
  code,
  setCode,
  go,
}: {
  reduce: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  code: Code;
  setCode: (c: Code) => void;
  go: (id: string) => void;
}) {
  const v = VISAS[code];
  const docCount = docsFor(code).length;
  const tile = `flex min-h-[96px] flex-col items-start justify-between rounded-[6px] border p-3.5 text-left transition-colors duration-150 md:min-h-[108px] md:p-4 ${focusRing}`;

  return (
    <section id="va-poster" aria-labelledby="va-poster-title" style={{ background: C.paper, color: C.ink }}>
      {/* 언어 줄. 다른 업종보다 크게 둔다 */}
      <div className="border-b" style={{ background: C.soft, borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-2.5 md:px-6">
          <p className="hidden items-center gap-2 text-[15px] font-semibold md:inline-flex" style={{ color: C.body }}>
            <Languages size={18} aria-hidden />
            언어 Language
          </p>
          <div id="va-lang" role="group" aria-label="언어 Language" className="grid flex-1 grid-cols-2 gap-2 md:flex md:flex-none">
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
                className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[6px] border px-5 text-[16px] font-semibold transition-colors duration-150 md:min-w-[132px] ${focusRing}`}
                style={{ background: lang === l ? C.accent : C.paper, borderColor: lang === l ? C.accent : C.field, color: lang === l ? "#fff" : C.ink, outlineColor: C.ink }}
              >
                {lang === l && <Check size={17} aria-hidden />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 상단 메뉴. 휴대폰에서는 아래 줄에서 가로로 민다 */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 pt-3 md:flex-nowrap md:px-6 md:py-3">
          <p className="inline-flex items-center gap-2 text-[20px] font-bold leading-none">
            <SampleLogo />
          </p>
          <nav aria-label={tx(lang, "주요 메뉴", "Main menu")} className="order-3 -mx-4 w-[calc(100%+32px)] overflow-x-auto md:order-none md:mx-0 md:w-auto md:flex-1 md:overflow-visible">
            <ul className="flex whitespace-nowrap px-2 md:justify-center md:px-0">
              {MENU.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => go(m.id)}
                    className={`inline-flex min-h-11 items-center rounded-[4px] px-2.5 text-[15px] font-semibold underline-offset-[6px] hover:underline md:px-3 md:text-[16px] ${focusRing}`}
                    style={{ outlineColor: C.ink }}
                  >
                    {m.label[lang]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={() => go("va-consult")}
            data-gtm-cta="visa-agent_poster_cta"
            className={`inline-flex min-h-11 flex-none items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
            style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
          >
            <CalendarCheck size={17} aria-hidden />
            {tx(lang, "상담신청", "Consultation")}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pb-10 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10 md:px-6 md:pb-14 md:pt-10">
        {/* 사진. 휴대폰에서는 코드판 아래로. 위치 줄은 왼쪽 아래 고정 버튼과 겹치지 않게 사진 위에 */}
        <figure className="order-2 flex min-w-0 flex-col md:order-none">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[6px] md:aspect-auto md:min-h-[420px] md:flex-1" style={{ background: C.soft }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/office.jpg`}
              width={900}
              height={1200}
              alt={tx(lang, "흰 접수대 위에 모니터 두 대와 호출 벨, 안내판이 놓인 사무소 접수 창구", "Office reception counter with two monitors, a desk bell and a notice stand")}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "58% 52%" }}
            />
          </div>
          <figcaption className="order-first mb-3 inline-flex items-start gap-1.5 text-[15px] leading-[1.5]" style={{ color: C.body, wordBreak: "keep-all" }}>
            <MapPin size={17} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            {tx(lang, "ㅇㅇ출입국외국인사무소에서 걸어서 5분", "5 minutes walk from the ㅇㅇ immigration office")}
          </figcaption>
        </figure>

        <div className="min-w-0">
          <h1 id="va-poster-title" className="text-[28px] font-bold md:text-[40px]" style={{ letterSpacing: "-0.03em", lineHeight: 1.25, wordBreak: "keep-all" }}>
            {(lang === "ko" ? ["체류 연장, 자격 변경, 영주권", "출입국 업무 대행"] : ["Visa extension, status change,", "permanent residency"]).map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h1>

          <p className="mt-6 text-[15px] font-bold md:mt-8" style={{ color: C.muted }}>
            {tx(lang, "체류자격", "Visa type")}
          </p>
          <div className="mt-2 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))]">
            {CODES.map((c) => {
              const on = c === code;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCode(c)}
                  data-gtm-cta={`visa-agent_poster_code_${c}`}
                  className={tile}
                  style={{ background: on ? C.accent : C.paper, borderColor: on ? C.accent : C.field, color: on ? "#fff" : C.ink, outlineColor: C.ink }}
                >
                  <span className="text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums md:text-[34px]">{c}</span>
                  <span className="mt-2 text-[15px] font-semibold leading-tight" style={{ color: on ? "#fff" : C.body }}>
                    {VISAS[c].name[lang]}
                  </span>
                </button>
              );
            })}
            <button type="button" onClick={() => go("va-types")} className={tile} style={{ background: C.soft, borderColor: C.line, color: C.ink, outlineColor: C.ink }}>
              <BookOpen size={26} aria-hidden style={{ color: C.accent }} />
              <span className="mt-2 text-[15px] font-semibold leading-tight">{tx(lang, "체류자격 전체", "All visa types")}</span>
            </button>
          </div>

          {/* 고른 체류자격 */}
          <motion.div
            key={`${code}-${lang}`}
            aria-live="polite"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            className="mt-4 rounded-[6px] border p-4 md:p-5"
            style={{ borderColor: C.line, background: C.soft }}
          >
            <p className="text-[18px] font-bold">
              <span className="tabular-nums">{code}</span> {v.name[lang]}
            </p>
            <dl className="mt-3 grid gap-1.5 text-[15px] leading-[1.5]">
              {[
                [tx(lang, "대상", "Who"), v.who[lang]],
                [tx(lang, "취업", "Work"), v.work[lang]],
                [tx(lang, "1회 체류기간 상한", "Max stay per grant"), v.max[lang]],
                [tx(lang, "연장 수수료", "Extension fee"), feeOf(code, lang)],
                [tx(lang, "상담 언어", "Languages"), tx(lang, "한국어, English", "Korean, English")],
              ].map(([k, val]) => (
                <div key={k} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="font-medium" style={{ wordBreak: "keep-all" }}>
                    {val}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => go("va-docs")}
                data-gtm-cta="visa-agent_poster_docs"
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`}
                style={{ background: C.paper, borderColor: C.field, outlineColor: C.ink }}
              >
                <FileCheck2 size={17} aria-hidden />
                {tx(lang, `연장 서류 ${docCount}종`, `${docCount} documents`)}
              </button>
              <button
                type="button"
                onClick={() => go("va-consult")}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
                style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
              >
                <MessageCircle size={17} aria-hidden />
                {tx(lang, "상담신청", "Consultation")}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          비자 행정사사무소
        </span>
      </span>
    </span>
  );
}
