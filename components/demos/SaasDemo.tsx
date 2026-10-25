"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Menu, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 식당 재고 관리 서비스 홈페이지 샘플: 가상의 IT 회사가 만드는 곰파트너 재고 앱.
   상호, 주소, 전화번호, 담당자 이름은 모두 가상이다. 고객사 로고, 투자, 매출, 이용 매장 수 같은 숫자는 넣지 않는다.
   첫 화면 사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   국내 외식업 SaaS 사이트 공통 구성(참고): 메뉴는 기능 소개, 요금 안내, 자주 묻는 질문, 도입 문의, 로그인.
   첫 화면 버튼은 "무료로 시작하기", "도입 문의". 요금제는 카드 세 장에 월 결제와 연 결제 전환, "연 결제 시 20% 할인",
   가격 옆 "부가세 별도". 카드 아래 기능 비교표가 길게 이어진다. 다매장은 "매장 수에 따라 별도 견적".
   도입 문의 폼은 상호, 담당자, 연락처, 매장 수, 관심 요금제, 개인정보 수집 동의. 무료 체험은 "카드 등록 없이 14일".

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 요금제 월 결제, 연 결제 전환: 연 결제면 20% 할인된 월 금액과 연 결제 금액이 같이 바뀐다.
   2. 기능 비교표: "다른 점만 보기"를 누르면 요금제마다 다른 줄만 남는다.
   3. 매장 수 계산: 매장 수와 요금제를 고르면 매장당 금액, 월 합계가 나온다. 5곳 이상 다매장 할인, 20곳 이상은 견적 안내.
   4. 도입 문의: 문의 유형, 상호, 담당자, 휴대폰, 매장 수. 접수하면 접수 번호, 담당 창구, 회신 예정일을 보여 준다.
   5. 자주 묻는 질문(접고 펴기).

   첫 화면(ss-poster): 흰 배경 위 메뉴, 제목과 버튼 두 갈래, 기능 탭 세 개와 넓은 제품 화면, 오른쪽 아래 현장 사진 한 장.
   핵심 모션: 현장 사진이 1.06배에서 1배로 1.6초 동안 다가오고, 탭을 바꾸면 화면 안 내용만 0.2초 겹쳐 바뀐다.
   숫자가 굴러 바뀌는 효과는 매장 수 계산 합계 한 곳에만 둔다.
   동작 줄이기면 모두 끈다. */

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 0층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const SLUG = "saas-startup";
const IMG = "/images/demo-saas-startup";

const C = {
  bg: "#ffffff",
  soft: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  accent: "#2f5d4a",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
/** 합계 숫자 전환 */
const DUR = 0.32;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 요금제 데이터 ---------- */

type PlanId = "starter" | "standard" | "pro";
type Billing = "month" | "year";

const PLANS: { id: PlanId; name: string; price: number; who: string; points: string[] }[] = [
  { id: "starter", name: "스타터", price: 19000, who: "매장 1곳, 사장님 혼자 셀 때", points: ["재고 세기, 바코드 스캔", "품목 300개", "유통기한 알림", "직원 계정 2명"] },
  { id: "standard", name: "스탠다드", price: 39000, who: "발주까지 앱으로 할 때", points: ["스타터 기능 전부", "품목 무제한", "적정 재고 알림, 거래처 발주서", "메뉴별 원가율", "직원 계정 10명"] },
  { id: "pro", name: "프로", price: 59000, who: "매장이 두 곳 이상일 때", points: ["스탠다드 기능 전부", "여러 매장 한 화면", "매장 간 재고 이동", "POS 매출 연동", "전담 매니저"] },
];
const planById = (id: PlanId) => PLANS.find((p) => p.id === id) ?? PLANS[1];

/** 연 결제 할인율 */
const YEAR_OFF = 0.2;
/** 다매장 할인: 5곳 이상 매장당 10% */
const MULTI_FROM = 5;
const MULTI_OFF = 0.1;
/** 이 매장 수부터는 계산 대신 견적 안내 */
const QUOTE_FROM = 20;
const STORE_MAX = 30;

/** 100원 단위로 내린다 */
const floor100 = (n: number) => Math.floor(n / 100) * 100;
const monthly = (price: number, billing: Billing) => floor100(billing === "year" ? price * (1 - YEAR_OFF) : price);

/* ---------- 기능 비교표 ---------- */

type Cell = boolean | string;
const COMPARE: { group: string; rows: [string, Cell, Cell, Cell][] }[] = [
  {
    group: "재고",
    rows: [
      ["휴대폰으로 재고 세기", true, true, true],
      ["바코드 스캔", true, true, true],
      ["등록 품목 수", "300개", "무제한", "무제한"],
      ["유통기한 알림", true, true, true],
    ],
  },
  {
    group: "발주",
    rows: [
      ["적정 재고 알림", false, true, true],
      ["거래처 발주서 카카오톡 전송", false, true, true],
      ["입고 사진 기록", false, true, true],
    ],
  },
  {
    group: "원가",
    rows: [
      ["메뉴별 원가율", false, true, true],
      ["월별 식재료비 리포트", false, true, true],
    ],
  },
  {
    group: "매장 관리",
    rows: [
      ["직원 계정", "2명", "10명", "무제한"],
      ["여러 매장 한 화면", false, false, true],
      ["매장 간 재고 이동", false, false, true],
      ["POS 매출 연동", false, false, true],
    ],
  },
  {
    group: "지원",
    rows: [
      ["채팅 상담", true, true, true],
      ["첫 품목 등록 대행", false, true, true],
      ["전담 매니저", false, false, true],
    ],
  },
];

/* ---------- 앱 화면 카드 데이터 ---------- */

type CardKind = "count" | "order" | "cost";
/** 기능 소개 카드 크기(px) */
const CW = 210;
const CH = 280;

const STOCK: [string, string, number][] = [
  ["양파", "12kg", 0.8],
  ["대파", "2단", 0.22],
  ["돼지 앞다리", "8kg", 0.64],
  ["두부", "14모", 0.7],
  ["식용유", "3통", 0.45],
];
const COST: [string, number][] = [
  ["김치찌개", 32],
  ["제육볶음", 36],
  ["된장찌개", 27],
  ["계란말이", 21],
];

/* ---------- 날짜 ---------- */

/** 다음 영업일(토, 일 건너뜀) */
function nextBizDay(today: Date) {
  let d = daysAgo(today, -1);
  while (d.getDay() === 0 || d.getDay() === 6) d = daysAgo(d, -1);
  return d;
}

type InquiryType = "도입 문의" | "무료 체험" | "다매장 견적";
type Prefill = { type: InquiryType; plan: PlanId; stores: number; nonce: number };

export function SaasDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [billing, setBilling] = useState<Billing>("month");
  const [prefill, setPrefill] = useState<Prefill>({ type: "도입 문의", plan: "standard", stores: 1, nonce: 0 });

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const ask = (next: Omit<Prefill, "nonce">) => {
    setPrefill((p) => ({ ...next, nonce: p.nonce + 1 }));
    go("ss-contact");
  };


  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster
        reduce={reduce}
        go={go}
        onTrial={() => ask({ type: "무료 체험", plan: "standard", stores: 1 })}
        onContact={() => ask({ type: "도입 문의", plan: "standard", stores: 1 })}
      />

      {/* 기능 구역: 앱 화면 카드 세 장 */}
      <section id="ss-features" aria-labelledby="ss-features-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-8 md:px-6 md:pt-14">
        <h2 id="ss-features-title" className="text-[30px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[44px]" style={{ wordBreak: "keep-all" }}>
          식당 재고 관리 앱
        </h2>
        <p className="mt-3 text-[17px] leading-[1.6]" style={{ color: C.body }}>
          카드 등록 없이 14일 무료로 써 볼 수 있어요.
        </p>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
          {(
            [
              ["count", "재고 세기", "냉장고 앞에서 품목을 누르고 남은 양만 넣어요. kg, 단, 모, 통 단위 그대로 적어요."],
              ["order", "발주 알림", "정해 둔 양보다 줄면 알림이 와요. 거래처마다 발주서가 카카오톡으로 나가요."],
              ["cost", "메뉴 원가", "메뉴마다 들어가는 재료를 넣어 두면 입고 단가가 바뀔 때 원가율도 같이 바뀌어요."],
            ] as [CardKind, string, string][]
          ).map(([kind, title, body]) => (
            <article key={kind} className="flex flex-col">
              <div className="flex justify-center rounded-[8px] py-6" style={{ background: C.soft }}>
                <AppCard kind={kind} />
              </div>
              <h3 className="mt-5 w-full text-[20px] font-bold tracking-[-0.02em]">{title}</h3>
              <p className="mt-2 w-full text-[16px] leading-[1.65]" style={{ color: C.body, wordBreak: "keep-all" }}>
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Plans billing={billing} setBilling={setBilling} onTrial={(plan) => ask({ type: "무료 체험", plan, stores: 1 })} />
      <Compare />
      <Calculator billing={billing} setBilling={setBilling} reduce={reduce} onAsk={(plan, stores) => ask({ type: stores >= MULTI_FROM ? "다매장 견적" : "도입 문의", plan, stores })} />

      <section id="ss-contact" aria-labelledby="ss-contact-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-28 md:px-6">
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12">
          <div>
            <h2 id="ss-contact-title" className="text-[28px] font-bold tracking-[-0.03em] md:text-[36px]">
              도입 문의
            </h2>
            <dl className="mt-6 space-y-4 text-[16px] leading-[1.6]">
              <div>
                <dt className="font-semibold">상담 시간</dt>
                <dd style={{ color: C.muted }}>평일 10:00~18:00, 점심 12:00~13:00</dd>
              </div>
              <div>
                <dt className="font-semibold">전화</dt>
                <dd style={{ color: C.muted }}>{TEL}</dd>
              </div>
              <div>
                <dt className="font-semibold">채팅</dt>
                <dd style={{ color: C.muted }}>{KAKAO}</dd>
              </div>
            </dl>
          </div>
          <ContactForm key={prefill.nonce} prefill={prefill} today={today} reduce={reduce} />
        </div>
      </section>

      <Faq />

      <footer className="mt-20 border-t md:mt-28" style={{ borderColor: C.line, background: C.soft }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 text-[14px] leading-[1.8] md:px-6" style={{ color: C.muted }}>
          <p>
            <SampleLogo size={18} />
          </p>
          <p className="mt-2">주소 {ADDRESS}</p>
          <p>
            고객센터 {TEL} (평일 10:00~18:00), {KAKAO}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 font-semibold" style={{ color: C.ink }}>
            <span>이용약관</span>
            <span>개인정보처리방침</span>
          </p>
          <div style={{ color: C.ink }}>
            <DemoMakerInfo className="mt-6" />
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- 첫 화면 ---------- */

/* 첫 화면 구조(국내 B2B SaaS 사이트 조사, 2026-10): 흰 배경 위 메뉴, 왼쪽 제목, 오른쪽 버튼 두 갈래(무료로 시작하기, 도입 문의),
   그 아래 기능 탭 세 개와 넓은 제품 화면. 탭을 누르면 화면 안 내용만 바뀐다. 사진은 배경이 아니라 화면 오른쪽 아래 칸의
   현장 사진 한 장으로만 쓴다(실제 사이트는 겹쳐 두지만 내용을 가리지 않게 옆 칸으로 뺐다). 휴대폰에서는 메뉴를 햄버거로 접고, 탭은 가로 칩, 제품 화면은 사이드바를 뺀 세로 목록, 현장 사진은 화면 아래로.
   모션: 사진만 1.06배에서 1배로 1.6초 동안 다가오고, 탭 전환은 0.2초 겹쳐 바뀐다. 동작 줄이기면 모두 끈다. */
const HERO_IN_MS = 1600;
const TAB_DUR = 0.2;

const HERO_CSS = `
@keyframes ss-hero-in { from { transform: scale(1.06); } }
.ss-hero-photo { animation: ss-hero-in ${HERO_IN_MS}ms ${EASE_CSS} both; }
@media (prefers-reduced-motion: reduce) { .ss-hero-photo { animation: none; } }
`;

const NAV: [string, string][] = [
  ["ss-features", "기능 소개"],
  ["ss-plans", "요금 안내"],
  ["ss-compare", "기능 비교"],
  ["ss-faq", "자주 묻는 질문"],
];

const TABS: { kind: CardKind; label: string; time: string }[] = [
  { kind: "count", label: "재고 세기", time: "21:40 마감 재고" },
  { kind: "order", label: "발주 알림", time: "09:10 발주" },
  { kind: "cost", label: "메뉴 원가", time: "10월 원가율" },
];

/** 발주 알림 화면 줄: 품목, 남은 양, 적정 재고, 거래처, 상태 */
const ORDERS: [string, string, string, string, "발주 필요" | "발주 완료" | "충분"][] = [
  ["대파", "2단", "8단", "ㅇㅇ청과", "발주 필요"],
  ["식용유", "3통", "6통", "ㅇㅇ식자재", "발주 필요"],
  ["돼지 앞다리", "8kg", "10kg", "ㅇㅇ정육", "발주 완료"],
  ["두부", "14모", "12모", "ㅇㅇ식품", "충분"],
];

function Poster({ reduce, go, onTrial, onContact }: { reduce: boolean; go: (id: string) => void; onTrial: () => void; onContact: () => void }) {
  const [tab, setTab] = useState<CardKind>("count");
  const [menu, setMenu] = useState(false);
  const cur = TABS.find((t) => t.kind === tab) ?? TABS[0];
  const navBtn = `inline-flex h-11 items-center rounded-[4px] px-3 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <section id="ss-poster" aria-labelledby="ss-poster-title" className="relative" style={{ background: C.bg, color: C.ink }}>
      <style>{HERO_CSS}</style>

      {/* 메뉴 */}
      <header className="relative z-20 border-b" style={{ borderColor: C.line, background: C.bg }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
          <p>
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {NAV.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.ink }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="px-2 text-[15px] font-semibold" style={{ color: C.body }}>
              로그인
            </span>
            <button
              type="button"
              onClick={onContact}
              data-gtm-cta={`${SLUG}_header_contact`}
              className={`inline-flex h-11 items-center rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
              style={{ background: C.accent, color: "#fff", outlineColor: C.accent }}
            >
              도입 문의
            </button>
          </div>
          <button
            type="button"
            aria-expanded={menu}
            aria-controls="ss-menu"
            aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMenu((v) => !v)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[6px] border lg:hidden ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.ink }}
          >
            {menu ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
        {menu && (
          <nav id="ss-menu" aria-label="주요 메뉴" className="absolute inset-x-0 top-full border-b px-4 pb-4 pt-2 lg:hidden" style={{ background: C.bg, borderColor: C.line }}>
            <ul>
              {NAV.map(([id, label]) => (
                <li key={id} className="border-b" style={{ borderColor: C.line }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      go(id);
                    }}
                    className={`flex h-12 w-full items-center text-left text-[16px] font-semibold ${focusRing}`}
                    style={{ outlineColor: C.ink }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* 제목과 버튼 두 갈래 */}
      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 pt-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,auto)] lg:items-end lg:gap-10 lg:pt-12">
        <h1 id="ss-poster-title" className="text-[34px] font-bold md:text-[48px] lg:text-[56px]" style={{ letterSpacing: "-0.035em", lineHeight: 1.15, wordBreak: "keep-all" }}>
          식당 재고 관리, 하루 10분
        </h1>
        <div className="lg:pb-2">
          <p className="text-[17px] font-medium" style={{ color: C.body }}>
            14일 무료 체험
          </p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:flex">
            <button
              type="button"
              onClick={onTrial}
              data-gtm-cta={`${SLUG}_poster_trial`}
              className={`inline-flex h-12 items-center justify-center rounded-[6px] px-5 text-[16px] font-semibold ${focusRing}`}
              style={{ background: C.ink, color: "#fff", outlineColor: C.ink }}
            >
              무료로 시작하기
            </button>
            <button
              type="button"
              onClick={onContact}
              data-gtm-cta={`${SLUG}_poster_cta`}
              className={`inline-flex h-12 items-center justify-center rounded-[6px] border px-5 text-[16px] font-semibold ${focusRing}`}
              style={{ borderColor: "#c4c4c4", color: C.ink, outlineColor: C.ink }}
            >
              도입 문의
            </button>
          </div>
        </div>
      </div>

      {/* 기능 탭과 제품 화면 */}
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-8 md:px-6 lg:pb-14 lg:pt-10">
        <div role="tablist" aria-label="기능" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {TABS.map((t) => {
            const on = t.kind === tab;
            return (
              <button
                key={t.kind}
                id={`ss-tab-${t.kind}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="ss-screen"
                onClick={() => setTab(t.kind)}
                className={`inline-flex h-11 flex-none items-center gap-1.5 rounded-full border px-4 text-[15px] font-semibold transition-colors duration-150 ${focusRing}`}
                style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.bg, color: on ? "#fff" : C.ink, outlineColor: C.accent }}
              >
                {on && <Check size={15} aria-hidden />}
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-6">
          {/* 제품 화면 프레임 */}
          <div id="ss-screen" role="tabpanel" aria-labelledby={`ss-tab-${tab}`} className="overflow-hidden rounded-[10px] border" style={{ borderColor: C.line, background: C.soft }}>
            <div className="flex h-9 items-center gap-1.5 border-b px-4" style={{ borderColor: C.line, background: C.bg }} aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.line }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.line }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.line }} />
              <span className="ml-3 text-[12px] font-medium" style={{ color: C.muted }}>
                곰파트너 재고, ㅇㅇ식당 본점
              </span>
            </div>
            <div className="grid md:grid-cols-[160px_minmax(0,1fr)]">
              <ul className="hidden border-r py-4 md:block" style={{ borderColor: C.line, background: C.bg }} aria-hidden>
                {TABS.map((t) => (
                  <li key={t.kind} className="px-4 py-2 text-[13px] font-semibold" style={{ color: t.kind === tab ? C.accent : C.muted, background: t.kind === tab ? C.soft : undefined }}>
                    {t.label}
                  </li>
                ))}
                <li className="px-4 py-2 text-[13px] font-semibold" style={{ color: C.muted }}>
                  거래처
                </li>
                <li className="px-4 py-2 text-[13px] font-semibold" style={{ color: C.muted }}>
                  직원 계정
                </li>
              </ul>
              <div className="p-4 md:min-h-[300px] md:p-6 lg:min-h-[330px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
                    transition={{ duration: reduce ? 0 : TAB_DUR, ease: EASE }}
                  >
                    <p className="flex items-baseline justify-between gap-3">
                      <span className="text-[18px] font-bold tracking-[-0.02em]">{cur.label}</span>
                      <span className="text-[13px] font-medium tabular-nums" style={{ color: C.muted }}>
                        {cur.time}
                      </span>
                    </p>
                    <Screen kind={tab} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 현장 사진 한 장: PC 는 화면 오른쪽 아래 칸, 휴대폰은 화면 아래로 */}
          <figure className="overflow-hidden rounded-[10px] border" style={{ borderColor: C.line, background: C.bg }}>
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-[21/9] lg:aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={`${IMG}/hero-sm.jpg`}
                srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
                sizes="(min-width: 1024px) 300px, 100vw"
                alt="식재료 보관 선반 앞에서 태블릿으로 재고를 세는 손"
                fetchPriority="high"
                className={`absolute inset-0 h-full w-full object-cover ${reduce ? "" : "ss-hero-photo"}`}
                style={{ objectPosition: "70% 50%" }}
              />
            </div>
            <figcaption className="px-4 py-3 text-[14px] leading-[1.5]">
              <span className="font-bold">마감 후 창고 재고 세기</span>
              <span className="block" style={{ color: C.muted }}>
                품목을 누르고 남은 양만 입력
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/** 제품 화면 안 내용. PC 는 표, 휴대폰은 같은 줄을 세로 목록으로 */
function Screen({ kind }: { kind: CardKind }) {
  if (kind === "count")
    return (
      <ul className="mt-4 space-y-3">
        {STOCK.map(([name, qty, v], i) => (
          <li key={name} className="grid grid-cols-[minmax(0,5em)_minmax(0,1fr)_minmax(0,4em)] items-center gap-3 text-[14px] font-medium">
            <span className="truncate">{name}</span>
            <span className="h-[8px] rounded-full" style={{ background: C.line }}>
              <Bar v={v} color={i === 1 ? C.accent : "#9a9a9a"} />
            </span>
            <span className="text-right tabular-nums">{qty}</span>
          </li>
        ))}
        <li className="pt-1 text-[13px]" style={{ color: C.muted }}>
          적정 재고보다 적은 품목 1개
        </li>
      </ul>
    );
  if (kind === "order")
    return (
      <div className="mt-4 overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: C.bg }}>
        <div className="hidden grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))_minmax(0,1fr)] gap-3 border-b px-4 py-2 text-[13px] font-semibold md:grid" style={{ borderColor: C.line, color: C.muted }}>
          <span>품목</span>
          <span>남은 양</span>
          <span>적정 재고</span>
          <span>거래처</span>
          <span className="text-right">상태</span>
        </div>
        <ul>
          {ORDERS.map(([name, left, ok, vendor, state]) => (
            <li key={name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b px-4 py-2.5 text-[14px] last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))_minmax(0,1fr)] md:items-center" style={{ borderColor: C.line }}>
              <span className="font-semibold">{name}</span>
              <span className="tabular-nums md:order-none">
                <span className="md:hidden" style={{ color: C.muted }}>
                  {left} / 적정 {ok}
                </span>
                <span className="hidden md:inline">{left}</span>
              </span>
              <span className="hidden tabular-nums md:inline">{ok}</span>
              <span className="text-[13px] md:text-[14px]" style={{ color: C.muted }}>
                {vendor}
              </span>
              <span className="text-right">
                <span
                  className="inline-flex rounded-[4px] px-2 py-0.5 text-[13px] font-semibold"
                  style={
                    state === "발주 필요"
                      ? { background: C.accent, color: "#fff" }
                      : state === "발주 완료"
                        ? { background: C.soft, color: C.ink, boxShadow: `inset 0 0 0 1px ${C.line}` }
                        : { color: C.muted }
                  }
                >
                  {state}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <ul className="mt-4 space-y-3">
      {COST.map(([name, pct]) => (
        <li key={name} className="grid grid-cols-[minmax(0,5em)_minmax(0,1fr)_minmax(0,3em)] items-center gap-3 text-[14px] font-medium">
          <span className="truncate">{name}</span>
          <span className="relative h-[8px] rounded-full" style={{ background: C.line }}>
            <Bar v={pct / 45} color={pct > 35 ? C.accent : "#9a9a9a"} />
            <span aria-hidden className="absolute -top-1 h-4 w-px" style={{ left: `${(35 / 45) * 100}%`, background: C.ink }} />
          </span>
          <span className="text-right tabular-nums">{pct}%</span>
        </li>
      ))}
      <li className="pt-1 text-[13px]" style={{ color: C.muted }}>
        세로선은 목표 원가율 35%, 넘은 메뉴 1개
      </li>
    </ul>
  );
}

/* ---------- 앱 화면 카드 ---------- */

/** 기능 소개용 앱 화면. 흰 카드에 1px 선, 막대는 고정 */
function AppCard({ kind }: { kind: CardKind }) {
  return (
    <div aria-hidden className="relative overflow-hidden rounded-[8px] bg-white p-4 text-left" style={{ width: CW, height: CH, color: C.ink, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
      <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: C.muted }}>
        <span>{kind === "count" ? "재고 세기" : kind === "order" ? "발주 알림" : "메뉴 원가"}</span>
        <span className="tabular-nums">{kind === "count" ? "21:40" : kind === "order" ? "09:10" : "10월"}</span>
      </div>

      {kind === "count" && (
        <ul className="mt-3 space-y-[9px]">
          {STOCK.map(([name, qty, v], i) => (
            <li key={name}>
              <div className="flex items-baseline justify-between text-[12.5px] font-medium">
                <span>{name}</span>
                <span className="tabular-nums">{qty}</span>
              </div>
              <div className="mt-1 h-[6px] rounded-full" style={{ background: C.soft }}>
                <Bar v={v} color={i === 1 ? C.accent : "#bdbdbd"} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {kind === "order" && (
        <div className="mt-4">
          <p className="text-[20px] font-bold leading-[1.25] tracking-[-0.03em]">
            대파
            <br />2단 남았어요
          </p>
          <div className="mt-4 h-[8px] rounded-full" style={{ background: C.soft }}>
            <Bar v={0.25} color={C.accent} />
          </div>
          <p className="mt-2 text-[11.5px] font-medium" style={{ color: C.muted }}>
            적정 재고 8단
          </p>
          <div className="mt-5 space-y-1.5 text-[11.5px] font-medium">
            <p className="flex justify-between">
              <span style={{ color: C.muted }}>거래처</span>
              <span>ㅇㅇ청과</span>
            </p>
            <p className="flex justify-between">
              <span style={{ color: C.muted }}>발주량</span>
              <span className="tabular-nums">6단</span>
            </p>
          </div>
          <div className="mt-4 rounded-[6px] py-2 text-center text-[12.5px] font-semibold" style={{ background: C.accent, color: "#fff" }}>
            발주서 보내기
          </div>
        </div>
      )}

      {kind === "cost" && (
        <ul className="mt-4 space-y-3">
          {COST.map(([name, pct]) => (
            <li key={name}>
              <div className="flex items-baseline justify-between text-[12.5px] font-medium">
                <span>{name}</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="mt-1 h-[6px] rounded-full" style={{ background: C.soft }}>
                <Bar v={pct / 45} color={pct > 35 ? C.accent : "#bdbdbd"} />
              </div>
            </li>
          ))}
          <li className="pt-2 text-[11.5px] font-medium" style={{ color: C.muted }}>
            목표 원가율 35%
          </li>
        </ul>
      )}
    </div>
  );
}

function Bar({ v, color }: { v: number; color: string }) {
  return <div className="h-full rounded-full" style={{ background: color, transform: `scaleX(${v})`, transformOrigin: "0 50%" }} />;
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={mark} height={mark} className="shrink-0" style={{ width: mark, height: mark }} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">재고 관리 서비스 샘플</span>
      </span>
    </span>
  );
}

/* ---------- 1. 요금제 ---------- */

function BillingToggle({ billing, setBilling, label }: { billing: Billing; setBilling: (b: Billing) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-[8px] p-1" style={{ background: C.soft, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
      {(
        [
          ["month", "월 결제"],
          ["year", "연 결제 20% 할인"],
        ] as [Billing, string][]
      ).map(([id, text]) => {
        const on = billing === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => setBilling(id)}
            className={`rounded-[6px] px-3.5 py-2 text-[15px] font-semibold transition-colors duration-150 ${focusRing}`}
            style={{ background: on ? C.accent : "transparent", color: on ? "#fff" : C.body, outlineColor: C.accent }}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/** 숫자가 바뀌면 아래에서 위로 굴러 바뀐다. 매장 수 계산 합계에만 쓴다 */
function Rolling({ text, reduce, className = "" }: { text: string; reduce: boolean; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden align-bottom ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={reduce ? false : { y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "-70%", opacity: 0 }}
          transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Plans({ billing, setBilling, onTrial }: { billing: Billing; setBilling: (b: Billing) => void; onTrial: (plan: PlanId) => void }) {
  return (
    <section id="ss-plans" aria-labelledby="ss-plans-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-28 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="ss-plans-title" className="text-[28px] font-bold tracking-[-0.03em] md:text-[36px]">
          요금 안내
        </h2>
        <BillingToggle billing={billing} setBilling={setBilling} label="결제 주기" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const pick = plan.id === "standard";
          const m = monthly(plan.price, billing);
          return (
            <article
              key={plan.id}
              className="flex flex-col rounded-[8px] p-6"
              style={{ background: C.bg, boxShadow: `inset 0 0 0 1px ${pick ? C.accent : C.line}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[20px] font-bold">{plan.name}</h3>
                {pick && (
                  <span className="rounded-[4px] px-2 py-0.5 text-[13px] font-semibold" style={{ background: C.accent, color: "#fff" }}>
                    추천
                  </span>
                )}
              </div>
              <p className="mt-1 text-[15px]" style={{ color: C.body }}>
                {plan.who}
              </p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-[15px] font-semibold">매장당 월</span>
                <span className="text-[38px] font-bold tracking-[-0.03em] tabular-nums">{m.toLocaleString("ko-KR")}</span>
                <span className="text-[17px] font-bold">원</span>
              </p>
              <p className="mt-1 h-[22px] text-[14px]" style={{ color: C.muted }}>
                {billing === "year" ? `연 ${won(m * 12)} 한 번에 결제, 부가세 별도` : "부가세 별도"}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-[15px]" style={{ color: C.body }}>
                {plan.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <Check size={17} aria-hidden className="mt-[3px] flex-none" style={{ color: C.accent }} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onTrial(plan.id)}
                data-gtm-cta={`${SLUG}_plan_trial`}
                className={`mt-6 rounded-[6px] py-3 text-[16px] font-semibold transition-transform duration-100 active:translate-y-[1px] ${focusRing}`}
                style={pick ? { background: C.accent, color: "#fff", outlineColor: C.accent } : { background: C.bg, color: C.ink, boxShadow: `inset 0 0 0 1px ${C.ink}`, outlineColor: C.accent }}
              >
                14일 무료 체험
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 2. 기능 비교표 ---------- */

function CellView({ v }: { v: Cell }) {
  if (typeof v === "string") return <span className="text-[14px] font-semibold md:text-[15px]">{v}</span>;
  if (v)
    return (
      <span className="inline-flex justify-center" style={{ color: C.accent }}>
        <Check size={19} aria-hidden strokeWidth={2.6} />
        <span className="sr-only">포함</span>
      </span>
    );
  return (
    <span className="inline-flex justify-center" style={{ color: "#b0b0b0" }}>
      <Minus size={17} aria-hidden />
      <span className="sr-only">없음</span>
    </span>
  );
}

function Compare() {
  const [diffOnly, setDiffOnly] = useState(false);
  const groups = COMPARE.map((g) => ({ ...g, rows: diffOnly ? g.rows.filter(([, a, b, c]) => !(a === b && b === c)) : g.rows })).filter((g) => g.rows.length > 0);

  return (
    <section id="ss-compare" aria-labelledby="ss-compare-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ss-compare-title" className="text-[24px] font-bold tracking-[-0.03em] md:text-[28px]">
          요금제별 기능 비교
        </h2>
        <button
          type="button"
          aria-pressed={diffOnly}
          onClick={() => setDiffOnly((d) => !d)}
          className={`inline-flex items-center gap-2 rounded-[6px] px-3.5 py-2 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.bg, color: C.ink, boxShadow: `inset 0 0 0 1px ${diffOnly ? C.accent : C.line}`, outlineColor: C.accent }}
        >
          <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px]" style={{ background: diffOnly ? C.accent : "#fff", boxShadow: diffOnly ? undefined : `inset 0 0 0 1.5px ${C.muted}` }}>
            {diffOnly && <Check size={13} aria-hidden strokeWidth={3} color="#ffffff" />}
          </span>
          다른 점만 보기
        </button>
      </div>

      <table className="mt-6 w-full table-fixed border-collapse text-left">
        <caption className="sr-only">스타터, 스탠다드, 프로 요금제 기능 비교</caption>
        <colgroup>
          <col />
          <col className="w-[22%] md:w-[18%]" />
          <col className="w-[22%] md:w-[18%]" />
          <col className="w-[18%] md:w-[18%]" />
        </colgroup>
        <thead>
          <tr className="text-[14px] md:text-[16px]">
            <th scope="col" className="py-3 pr-2 font-semibold" style={{ color: C.muted }}>
              기능
            </th>
            {PLANS.map((p) => (
              <th key={p.id} scope="col" className="py-3 text-center font-bold" style={p.id === "standard" ? { background: C.soft } : undefined}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.group}>
            <tr>
              <th colSpan={4} scope="colgroup" className="pb-2 pt-6 text-[13px] font-bold md:text-[14px]" style={{ color: C.muted, borderBottom: `1px solid ${C.ink}` }}>
                {g.group}
              </th>
            </tr>
            {g.rows.map(([name, a, b, c]) => (
              <tr key={name} style={{ borderBottom: `1px solid ${C.line}` }}>
                <th scope="row" className="py-3 pr-2 text-[14px] font-medium leading-[1.4] md:text-[16px]" style={{ wordBreak: "keep-all" }}>
                  {name}
                </th>
                <td className="py-3 text-center">
                  <CellView v={a} />
                </td>
                <td className="py-3 text-center" style={{ background: C.soft }}>
                  <CellView v={b} />
                </td>
                <td className="py-3 text-center">
                  <CellView v={c} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </section>
  );
}

/* ---------- 3. 매장 수 계산 ---------- */

function Calculator({
  billing,
  setBilling,
  reduce,
  onAsk,
}: {
  billing: Billing;
  setBilling: (b: Billing) => void;
  reduce: boolean;
  onAsk: (plan: PlanId, stores: number) => void;
}) {
  const [stores, setStores] = useState(3);
  const [plan, setPlan] = useState<PlanId>("standard");
  const n = Math.max(1, Math.min(STORE_MAX, stores));
  const quote = n >= QUOTE_FROM;
  // 스타터는 매장 1곳 전용. 2곳 이상이면 고를 수 없다
  const choices = PLANS.filter((p) => p.id !== "starter" || n === 1);
  const active = choices.some((p) => p.id === plan) ? plan : "standard";
  const base = monthly(planById(active).price, billing);
  const multi = n >= MULTI_FROM;
  const per = multi ? floor100(base * (1 - MULTI_OFF)) : base;
  const total = per * n;

  const set = (v: number) => setStores(Math.max(1, Math.min(STORE_MAX, Math.round(v) || 1)));
  const stepBtn = `inline-flex h-11 w-11 items-center justify-center rounded-[6px] disabled:opacity-40 ${focusRing}`;

  return (
    <section id="ss-calc" aria-labelledby="ss-calc-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-28 md:px-6">
      <div className="grid overflow-hidden rounded-[8px] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" style={{ boxShadow: `inset 0 0 0 1px ${C.line}` }}>
        <div className="p-5 md:p-8">
          <h2 id="ss-calc-title" className="text-[24px] font-bold tracking-[-0.03em] md:text-[28px]">
            매장 수로 요금 계산
          </h2>

          <div className="mt-6">
            <label htmlFor="ss-calc-stores" className="text-[15px] font-bold">
              매장 수
            </label>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" aria-label="매장 하나 빼기" disabled={n <= 1} onClick={() => set(n - 1)} className={stepBtn} style={{ background: C.bg, boxShadow: `inset 0 0 0 1px ${C.line}`, outlineColor: C.accent }}>
                <Minus size={18} aria-hidden />
              </button>
              <input
                id="ss-calc-stores"
                type="number"
                inputMode="numeric"
                min={1}
                max={STORE_MAX}
                value={n}
                onChange={(ev) => set(Number(ev.target.value))}
                className={`h-11 w-20 rounded-[8px] text-center text-[20px] font-bold tabular-nums ${focusRing}`}
                style={{ boxShadow: `inset 0 0 0 1px ${C.line}`, outlineColor: C.accent }}
              />
              <button type="button" aria-label="매장 하나 더하기" disabled={n >= STORE_MAX} onClick={() => set(n + 1)} className={stepBtn} style={{ background: C.bg, boxShadow: `inset 0 0 0 1px ${C.line}`, outlineColor: C.accent }}>
                <Plus size={18} aria-hidden />
              </button>
              <span className="text-[16px] font-semibold">곳</span>
            </div>
            <input
              type="range"
              aria-label="매장 수 조절"
              min={1}
              max={STORE_MAX}
              value={n}
              onChange={(ev) => set(Number(ev.target.value))}
              className={`mt-4 w-full ${focusRing}`}
              style={{ accentColor: C.accent, outlineColor: C.accent }}
            />
          </div>

          <fieldset className="mt-6">
            <legend className="text-[15px] font-bold">요금제</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLANS.map((p) => {
                const ok = choices.some((c) => c.id === p.id);
                const on = active === p.id;
                return (
                  <label
                    key={p.id}
                    className={`inline-flex items-center gap-2 rounded-[6px] px-3.5 py-2 text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 ${ok ? "cursor-pointer" : "cursor-not-allowed opacity-45"}`}
                    style={{ background: on ? C.accent : C.bg, color: on ? "#fff" : C.ink, boxShadow: on ? undefined : `inset 0 0 0 1px ${C.line}`, outlineColor: C.accent }}
                  >
                    <input type="radio" name="ss-calc-plan" className="sr-only" checked={on} disabled={!ok} onChange={() => setPlan(p.id)} />
                    {p.name}
                  </label>
                );
              })}
            </div>
            {n > 1 && <p className="mt-2 text-[14px]" style={{ color: C.muted }}>스타터는 매장 1곳만 쓸 수 있어요.</p>}
          </fieldset>

          <div className="mt-6">
            <BillingToggle billing={billing} setBilling={setBilling} label="계산할 결제 주기" />
          </div>
        </div>

        <div className="flex flex-col p-5 md:p-8" style={{ background: C.soft, color: C.ink }} aria-live="polite">
          {quote ? (
            <>
              <p className="text-[15px] font-semibold" style={{ color: C.body }}>
                매장 {n}곳
              </p>
              <p className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.03em]" style={{ wordBreak: "keep-all" }}>
                20곳 이상은 따로 견적을 드려요
              </p>
              <p className="mt-3 text-[15px] leading-[1.6]" style={{ color: C.body }}>
                본사 계정, 매장별 권한, POS 연동 범위를 듣고 금액을 맞춰요.
              </p>
            </>
          ) : (
            <>
              <p className="text-[15px] font-semibold" style={{ color: C.body }}>
                {planById(active).name}, 매장 {n}곳, {billing === "year" ? "연 결제" : "월 결제"}
              </p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[16px] font-semibold">월</span>
                <Rolling text={total.toLocaleString("ko-KR")} reduce={reduce} className="text-[44px] font-bold tracking-[-0.03em] tabular-nums md:text-[52px]" />
                <span className="text-[18px] font-bold">원</span>
              </p>
              <dl className="mt-4 space-y-1.5 text-[15px]">
                <div className="flex justify-between gap-3">
                  <dt style={{ color: C.body }}>매장당 월</dt>
                  <dd className="font-bold tabular-nums">{won(per)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: C.body }}>다매장 할인</dt>
                  <dd className="font-bold">{multi ? "10% 적용" : `${MULTI_FROM}곳부터 10%`}</dd>
                </div>
                {billing === "year" && (
                  <div className="flex justify-between gap-3">
                    <dt style={{ color: C.body }}>연 결제 금액</dt>
                    <dd className="font-bold tabular-nums">{won(total * 12)}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-[13px]" style={{ color: C.muted }}>
                부가세 별도
              </p>
            </>
          )}
          <button
            type="button"
            onClick={() => onAsk(active, n)}
            data-gtm-cta={`${SLUG}_calc_contact`}
            className={`mt-6 rounded-[6px] py-3 text-[16px] font-semibold transition-transform duration-100 active:translate-y-[1px] md:mt-auto ${focusRing}`}
            style={{ background: C.accent, color: "#fff", outlineColor: C.accent }}
          >
            이 조건으로 문의하기
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. 도입 문의 ---------- */

type Done = { no: string; store: string; name: string; phone: string; type: InquiryType; reply: Date };

function ContactForm({ prefill, today, reduce }: { prefill: Prefill; today: Date; reduce: boolean }) {
  const [type, setType] = useState<InquiryType>(prefill.type);
  const [store, setStore] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [stores, setStores] = useState(String(prefill.stores));
  const [plan, setPlan] = useState<PlanId>(prefill.plan);
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Done | null>(null);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!store.trim()) e.store = "상호를 적어 주세요.";
    if (name.trim().length < 2) e.name = "담당자 이름을 적어 주세요.";
    const d = phone.replace(/\D/g, "");
    if (!/^01\d{8,9}$/.test(d)) e.phone = "휴대폰 번호를 확인해 주세요.";
    if (!agree) e.agree = "개인정보 수집, 이용에 동의해 주세요.";
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`ss-f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    const tail = String(Date.now() % 10000).padStart(4, "0");
    setDone({
      no: `SS-${today.getFullYear()}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${tail}`,
      store: store.trim(),
      name: maskName(name),
      phone: maskPhone(phone),
      type,
      reply: nextBizDay(today),
    });
  };

  const field = `mt-1.5 w-full rounded-[6px] px-3.5 py-3 text-[16px] ${focusRing}`;
  const fieldStyle = (bad?: string) => ({ boxShadow: `inset 0 0 0 ${bad ? 2 : 1}px ${bad ? C.error : "#cfcfcf"}`, outlineColor: C.accent, background: "#fff" });
  const err = (k: string) =>
    errors[k] ? (
      <p id={`ss-f-${k}-err`} className="mt-1.5 flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: C.error }}>
        <AlertCircle size={15} aria-hidden />
        {errors[k]}
      </p>
    ) : null;

  if (done)
    return (
      <motion.div
        role="status"
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
        className="rounded-[6px] p-6 md:p-8"
        style={{ background: C.soft, boxShadow: `inset 0 0 0 1px ${C.line}` }}
      >
        <p className="inline-flex items-center gap-2 text-[15px] font-semibold" style={{ color: C.accent }}>
          <Check size={18} aria-hidden strokeWidth={2.8} />
          {done.type} 접수 완료
        </p>
        <p className="mt-2 text-[24px] font-bold tracking-[-0.02em] md:text-[28px]">
          {fmtKo(done.reply)}까지 연락드릴게요
        </p>
        <dl className="mt-6 grid gap-x-6 gap-y-3 text-[15px] sm:grid-cols-[auto_1fr]">
          <dt className="font-semibold">접수 번호</dt>
          <dd className="tabular-nums">
            {done.no}
          </dd>
          <dt className="font-semibold">상호</dt>
          <dd>{done.store}</dd>
          <dt className="font-semibold">담당자</dt>
          <dd>
            {done.name}, {done.phone}
          </dd>
          <dt className="font-semibold">담당 창구</dt>
          <dd>
            도입 상담팀, {KAKAO} 또는 전화 {TEL}
          </dd>
          <dt className="font-semibold">회신 예정일</dt>
          <dd>{fmtKo(done.reply)} 오후 6시 전</dd>
        </dl>
        <button
          type="button"
          onClick={() => setDone(null)}
          className={`mt-6 inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-2 text-[15px] font-semibold ${focusRing}`}
          style={{ background: "#fff", boxShadow: `inset 0 0 0 1px ${C.line}`, outlineColor: C.accent }}
        >
          <RotateCcw size={15} aria-hidden />
          다시 쓰기
        </button>
      </motion.div>
    );

  return (
    <form onSubmit={submit} noValidate className="rounded-[6px] p-5 md:p-8" style={{ background: C.soft }}>
      <fieldset>
        <legend className="text-[15px] font-semibold">문의 유형</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["도입 문의", "무료 체험", "다매장 견적"] as InquiryType[]).map((t) => {
            const on = type === t;
            return (
              <label
                key={t}
                className="inline-flex cursor-pointer items-center rounded-[6px] px-3.5 py-2 text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2"
                style={{ background: on ? C.accent : "#fff", color: on ? "#fff" : C.ink, boxShadow: on ? undefined : `inset 0 0 0 1px ${C.line}`, outlineColor: C.accent }}
              >
                <input type="radio" name="ss-type" className="sr-only" checked={on} onChange={() => setType(t)} />
                {t}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ss-f-store" className="text-[15px] font-semibold">
            상호
          </label>
          <input id="ss-f-store" value={store} onChange={(ev) => setStore(ev.target.value)} placeholder="예: ㅇㅇ식당 ㅇㅇ점" aria-invalid={!!errors.store} aria-describedby={errors.store ? "ss-f-store-err" : undefined} className={field} style={fieldStyle(errors.store)} />
          {err("store")}
        </div>
        <div>
          <label htmlFor="ss-f-name" className="text-[15px] font-semibold">
            담당자 이름
          </label>
          <input id="ss-f-name" value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "ss-f-name-err" : undefined} className={field} style={fieldStyle(errors.name)} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="ss-f-phone" className="text-[15px] font-semibold">
            휴대폰
          </label>
          <input id="ss-f-phone" type="tel" inputMode="tel" value={phone} onChange={(ev) => setPhone(ev.target.value)} placeholder="010-0000-0000" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "ss-f-phone-err" : undefined} className={field} style={fieldStyle(errors.phone)} />
          {err("phone")}
        </div>
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
          <div>
            <label htmlFor="ss-f-stores" className="text-[15px] font-semibold">
              매장 수
            </label>
            <input id="ss-f-stores" type="number" inputMode="numeric" min={1} value={stores} onChange={(ev) => setStores(ev.target.value)} className={field} style={fieldStyle()} />
          </div>
          <div>
            <label htmlFor="ss-f-plan" className="text-[15px] font-semibold">
              관심 요금제
            </label>
            <select id="ss-f-plan" value={plan} onChange={(ev) => setPlan(ev.target.value as PlanId)} className={field} style={fieldStyle()}>
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="ss-f-memo" className="text-[15px] font-semibold">
          문의 내용 <span className="font-medium" style={{ color: C.muted }}>(선택)</span>
        </label>
        <textarea id="ss-f-memo" rows={3} value={memo} onChange={(ev) => setMemo(ev.target.value)} placeholder="쓰는 POS, 거래처 수, 궁금한 점" className={`${field} resize-y`} style={fieldStyle()} />
      </div>

      <div className="mt-4">
        <label className="inline-flex cursor-pointer items-start gap-2.5 text-[15px]">
          <input
            id="ss-f-agree"
            type="checkbox"
            checked={agree}
            onChange={(ev) => setAgree(ev.target.checked)}
            aria-invalid={!!errors.agree}
            aria-describedby={errors.agree ? "ss-f-agree-err" : undefined}
            className={`mt-[3px] h-[18px] w-[18px] flex-none ${focusRing}`}
            style={{ accentColor: C.accent, outlineColor: C.accent }}
          />
          <span>
            개인정보 수집, 이용 동의 (필수)
            <span className="mt-0.5 block text-[13.5px]" style={{ color: C.muted }}>
              상호, 이름, 휴대폰 번호를 상담 회신에만 쓰고 상담이 끝나면 1년 뒤 지워요.
            </span>
          </span>
        </label>
        {err("agree")}
      </div>

      <button
        type="submit"
        data-gtm-cta={`${SLUG}_contact_submit`}
        className={`mt-6 w-full rounded-[6px] py-3.5 text-[17px] font-semibold transition-transform duration-100 active:translate-y-[1px] ${focusRing}`}
        style={{ background: C.accent, color: "#fff", outlineColor: C.accent }}
      >
        문의 접수
      </button>
    </form>
  );
}

/* ---------- 5. 자주 묻는 질문 ---------- */

const FAQS: [string, string][] = [
  ["포스기 없이도 쓸 수 있나요?", "네. 휴대폰 앱만으로 재고를 세고 발주해요. POS 매출 연동은 프로 요금제에서 돼요."],
  ["무료 체험이 끝나면 자동으로 결제되나요?", "아니요. 카드 등록 없이 시작해요. 체험이 끝나면 요금제를 고를 때까지 보기만 돼요."],
  ["직원이 세도 되나요?", "직원 계정을 만들어 주시면 돼요. 누가 언제 셌는지 기록이 남아요."],
  ["거래처도 앱을 깔아야 하나요?", "아니요. 발주서는 카카오톡이나 문자로 그대로 가요."],
  ["연 결제 중간에 해지하면요?", "남은 달만큼 돌려드려요. 이미 쓴 달은 할인 전 월 요금으로 계산해요."],
];

function Faq() {
  return (
    <section id="ss-faq" aria-labelledby="ss-faq-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-28 md:px-6">
      <h2 id="ss-faq-title" className="text-[24px] font-bold tracking-[-0.03em] md:text-[28px]">
        자주 묻는 질문
      </h2>
      <div className="mt-5" style={{ borderTop: `1px solid ${C.ink}` }}>
        {FAQS.map(([q, a]) => (
          <details key={q} className="group" style={{ borderBottom: `1px solid ${C.line}` }}>
            <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[16px] font-semibold md:text-[17px] [&::-webkit-details-marker]:hidden ${focusRing}`} style={{ outlineColor: C.accent }}>
              {q}
              <Plus size={18} aria-hidden className="flex-none transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <p className="pb-5 pr-8 text-[16px] leading-[1.7]" style={{ color: C.body }}>
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
