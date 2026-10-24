"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  AlertCircle,
  Building2,
  Calculator,
  Check,
  Clock,
  FileText,
  Home,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Scale,
  Train,
  Users,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 법무사사무소 홈페이지 샘플: 가상의 곰파트너 법무사사무소. 부동산 등기, 상속 등기, 법인 등기, 개인회생을 맡는다.
   상호, 주소, 전화번호, 손님 이름은 모두 가상이다. 대표 법무사 이름과 사업자 정보는 쓰지 않는다.

   국내 법무사 사이트 공통 구성(참고): 메뉴는 업무 안내(부동산 등기, 상속 등기, 법인 등기, 개인회생 파산, 공탁),
   등기비용 안내, 상담신청, 오시는 길. 첫 화면에는 전화 상담 번호, 카카오톡 상담, 등기비용 견적 버튼을 둔다.
   잔금일 출장 등기, 전자등기, 평일 야간 상담 같은 문구를 쓰고, 취득세는 주택 수와 매매가 구간 세율로 안내한다.
   법무사 광고 규정에 맞춰 성공 사례 수, 최저가, 100% 같은 표현은 쓰지 않는다.

   사진 출처: Pexels 사진 31424880
   첫 화면(js-poster): 집 모형 앞에 놓인 열쇠 꾸러미 사진 한 장이 한 화면을 채운다. 아래 왼쪽에 문장 "잔금일 출장 등기".
   핵심 모션: 들어올 때 사진이 1.06배에서 1배로 1.6초 동안 천천히 다가오고, 문장과 정보 줄은 0.3초 늦게 12px 아래에서 올라온다(CSS).
   스크롤하면 사진만 조금 느리게 내려간다(0 ~ 8%). 동작 줄이기면 모두 멈춘 상태로 보인다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 소유권 이전 등기 비용 개략 계산: 매매가, 이번 집 포함 주택 수, 조정대상지역, 전용 85제곱미터 초과를 넣으면
      취득세, 지방교육세, 농어촌특별세, 등기신청수수료, 법무사 보수 범위와 합계 범위가 견적서 양식으로 나온다.
   2. 필요 서류 체크리스트: 매수인, 매도인 탭. 챙긴 서류를 누르면 몇 개 남았는지 보인다.
   3. 개인회생 상담 안내: 신청 자격과 5단계 진행 순서. 단계를 누르면 기간과 할 일이 바뀐다.
   4. 상담신청: 분야, 상담 방법, 이름, 휴대폰. 부동산 등기를 고르면 잔금일을 받는다. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

/* 제목은 본문과 같은 Pretendard, 굵게 */
const serifF = { fontWeight: 700 } as const;

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 5층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

const IMG = "/images/demo-scrivener";

const C = {
  navy: "#1f2b47",
  paper: "#ffffff",
  paperDeep: "#f7f7f5",
  line: "#e5e5e5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간과 시작 배율 */
const ZOOM = 1.6;
const ZOOM_FROM = 1.06;
/** 문장이 올라오는 시간과 늦춤 */
const RISE = 0.7;
const RISE_DELAY = 0.3;
/** 스크롤할 때 사진이 내려가는 정도(%) */
const PARALLAX = 8;
/** 칩, 패널 전환 */
const DUR = 0.28;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 1. 등기 비용 ---------- */

type Homes = 1 | 2 | 3 | 4;
const HOMES: { v: Homes; label: string }[] = [
  { v: 1, label: "1주택" },
  { v: 2, label: "2주택" },
  { v: 3, label: "3주택" },
  { v: 4, label: "4주택 이상" },
];

/** 주택 유상 취득세율(%). 1주택은 6억 이하 1%, 6억 초과 9억 이하 (매매가 x 2/3억 - 3)%, 9억 초과 3% */
function acqRate(price: number, homes: Homes, adjusted: boolean) {
  const eok = price / 1e8;
  const base = eok <= 6 ? 1 : eok <= 9 ? Math.round((eok * (2 / 3) - 3) * 100) / 100 : 3;
  if (homes === 1) return base;
  if (homes === 2) return adjusted ? 8 : base;
  if (homes === 3) return adjusted ? 12 : 8;
  return 12;
}
/** 지방교육세: 1~3% 구간은 취득세율의 10분의 1, 중과는 0.4% */
const eduRate = (r: number) => (r <= 3 ? Math.round(r * 10) / 100 : 0.4);
/** 농어촌특별세: 전용 85제곱미터 이하는 비과세. 초과면 0.2%, 8%는 0.6%, 12%는 1% */
const ruralRate = (r: number, over85: boolean) => (!over85 ? 0 : r <= 3 ? 0.2 : r === 8 ? 0.6 : 1);
/** 법무사 보수 범위(만 원, 부가세 별도). 매매가 구간별 */
function feeRange(price: number): [number, number] {
  const eok = price / 1e8;
  if (eok <= 1) return [25, 35];
  if (eok <= 3) return [30, 45];
  if (eok <= 6) return [40, 55];
  if (eok <= 9) return [45, 65];
  return [55, 80];
}
/** 등기신청수수료(방문 신청 기준) */
const REG_FEE = 15000;
const floor10 = (n: number) => Math.floor(n / 10) * 10;

/** 만 원 단위 금액을 읽는 말로. 52000 -> 5억 2,000만 원 */
function readManwon(m: number) {
  if (!m) return "0원";
  const eok = Math.floor(m / 10000);
  const rest = m % 10000;
  return `${eok ? `${eok}억 ` : ""}${rest ? `${rest.toLocaleString("ko-KR")}만 ` : ""}원`;
}
const fmtRate = (r: number) => `${Number.isInteger(r) ? r : r.toFixed(2).replace(/0$/, "")}%`;

/* ---------- 2. 필요 서류 ---------- */

type Side = "buyer" | "seller";
const DOCS: Record<Side, { id: string; name: string; note: string }[]> = {
  buyer: [
    { id: "b-id", name: "신분증", note: "주민등록증, 운전면허증, 여권" },
    { id: "b-stamp", name: "도장", note: "막도장도 괜찮아요" },
    { id: "b-reg", name: "주민등록등본", note: "잔금일 기준 1개월 안에 뗀 것" },
    { id: "b-contract", name: "매매계약서 원본", note: "중개사무소에서 받은 것" },
    { id: "b-report", name: "부동산거래신고필증", note: "중개사무소가 신고한 뒤 받아요" },
    { id: "b-family", name: "가족관계증명서", note: "생애최초 감면을 받을 때만" },
  ],
  seller: [
    { id: "s-title", name: "등기권리증", note: "등기필증 또는 등기필정보" },
    { id: "s-seal", name: "부동산 매도용 인감증명서", note: "매수인 이름, 주소, 주민등록번호를 적어서 뗀 것" },
    { id: "s-sealstamp", name: "인감도장", note: "인감증명서와 같은 도장" },
    { id: "s-abs", name: "주민등록초본", note: "주소 변동 내역이 모두 나오게" },
    { id: "s-id", name: "신분증", note: "본인이 못 오면 위임장과 대리인 신분증" },
    { id: "s-loan", name: "대출 상환 영수증", note: "근저당이 남아 있을 때만" },
  ],
};

/* ---------- 3. 개인회생 ---------- */

const REHAB = [
  { name: "상담", time: "당일", todo: "빚 총액, 월 소득, 부양가족 수를 듣고 신청 자격과 한 달 변제금을 대략 계산해요." },
  { name: "서류 준비", time: "2~3주", todo: "소득 증빙, 재산 목록, 채권자 목록을 모아요. 금융 거래 내역은 저희가 목록을 드려요." },
  { name: "신청서 접수", time: "접수 후 1주 안팎", todo: "관할 회생법원에 신청서를 내고 금지명령을 같이 신청해요. 결정이 나면 독촉 전화가 멈춰요." },
  { name: "개시결정", time: "접수 후 1개월 안팎", todo: "법원이 보정 요청을 하면 서류를 더 내요. 개시결정 뒤부터 변제금을 넣기 시작해요." },
  { name: "변제계획 인가", time: "개시 후 3~6개월", todo: "채권자집회를 거쳐 변제계획이 인가돼요. 이후 3년 동안 정해진 금액을 갚으면 면책돼요." },
];

/* ---------- 4. 상담신청 ---------- */

const FIELDS = ["부동산 등기", "상속 등기", "법인 등기", "개인회생", "기타"] as const;
type Field = (typeof FIELDS)[number];
const WAYS = ["전화", "방문", "카카오톡"] as const;
type Way = (typeof WAYS)[number];

/** 다음 평일 */
const nextBiz = (d: Date) => {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0 || n.getDay() === 6) n = daysAgo(n, -1);
  return n;
};

const HOURS = [
  { dow: [1, 2, 3, 4, 5], label: "평일", open: "09:00 ~ 18:00 (점심 12:00 ~ 13:00)" },
  { dow: [6], label: "토요일", open: "예약 상담만" },
  { dow: [0], label: "일요일, 공휴일", open: "휴무" },
];

export function ScrivenerDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [field, setField] = useState<Field>("부동산 등기");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("js-cost")} />

      <header className="border-b" style={{ borderColor: C.line, background: C.paper }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
          <p className="inline-flex items-center gap-2 text-[20px] font-bold leading-none" style={{ color: C.ink }}>
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
            {[
              ["js-work", "업무 안내"],
              ["js-cost", "등기 비용"],
              ["js-docs", "준비 서류"],
              ["js-rehab", "개인회생"],
              ["js-apply", "상담신청"],
              ["js-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.navy }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 하는 일 한 줄과 바로 연락 */}
      <section id="js-work" aria-labelledby="js-work-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="js-work-title" className="text-[28px] font-bold leading-[1.3] md:text-[36px]" style={{ ...serifF, color: C.ink, wordBreak: "keep-all" }}>
            부동산 등기, 상속, 법인 등기, 개인회생
          </h2>
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${TEL.replace(/-/g, "")}`}
              data-gtm-cta="scrivener_tel"
              className={`inline-flex items-center gap-2 rounded-[4px] px-4 py-2.5 text-[15px] font-semibold text-white ${focusRing}`}
              style={{ background: C.navy, outlineColor: C.navy }}
            >
              <Phone size={17} aria-hidden />
              {TEL}
            </a>
            <button
              type="button"
              onClick={() => go("js-apply")}
              data-gtm-cta="scrivener_top_apply"
              className={`inline-flex items-center gap-2 rounded-[4px] border px-4 py-2.5 text-[15px] font-semibold ${focusRing}`}
              style={{ borderColor: C.navy, color: C.navy, outlineColor: C.navy }}
            >
              <MessageCircle size={17} aria-hidden />
              상담신청
            </button>
          </div>
        </div>

        <ul className="mt-8 grid border-l border-t sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: C.line }}>
          {[
            { icon: Home, name: "부동산 등기", items: "매매, 증여, 신축 건물 보존, 근저당 말소", go: "js-cost" },
            { icon: Users, name: "상속 등기", items: "상속재산 협의분할, 유증, 상속 포기 신고", go: "js-apply" },
            { icon: Building2, name: "법인 등기", items: "법인 설립, 임원 변경, 본점 이전, 증자", go: "js-apply" },
            { icon: Scale, name: "개인회생, 파산", items: "신청서 작성, 금지명령, 변제계획안", go: "js-rehab" },
            { icon: Landmark, name: "공탁", items: "변제공탁, 집행공탁, 공탁금 회수", go: "js-apply" },
            { icon: FileText, name: "내용증명, 지급명령", items: "보증금 반환 요청, 대여금 지급명령", go: "js-apply" },
          ].map(({ icon: Icon, name, items, go: target }) => (
            <li key={name} className="border-b border-r" style={{ borderColor: C.line }}>
              <button
                type="button"
                onClick={() => go(target)}
                className={`group flex h-full w-full items-start gap-3 px-5 py-5 text-left transition-colors hover:bg-[#f7f7f5] ${focusRing}`}
                style={{ outlineColor: C.navy }}
              >
                <Icon size={22} aria-hidden className="mt-0.5 flex-none" style={{ color: C.navy }} />
                <span>
                  <span className="block text-[17px] font-bold" style={{ color: C.navy }}>
                    {name}
                  </span>
                  <span className="mt-1 block text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                    {items}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
          잔금일에는 은행이나 중개사무소로 직접 가서 서류를 받고, 그날 바로 등기를 접수해요.
        </p>
      </section>

      <section id="js-cost" aria-labelledby="js-cost-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="js-cost-title" icon={<Calculator size={22} aria-hidden />} title="소유권 이전 등기 비용" />
        <CostCalc reduce={reduce} onApply={() => go("js-apply")} />
      </section>

      <section id="js-docs" aria-labelledby="js-docs-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="js-docs-title" icon={<FileText size={22} aria-hidden />} title="잔금일 준비 서류" />
        <DocChecklist reduce={reduce} />
      </section>

      <section id="js-rehab" aria-labelledby="js-rehab-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="js-rehab-title" icon={<Scale size={22} aria-hidden />} title="개인회생 상담 안내" />
        <Rehab
          reduce={reduce}
          onApply={() => {
            setField("개인회생");
            go("js-apply");
          }}
        />
      </section>

      <section id="js-apply" aria-labelledby="js-apply-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="js-apply-title" icon={<MessageCircle size={22} aria-hidden />} title="상담신청" />
        <ApplyForm today={today} reduce={reduce} field={field} setField={setField} />
      </section>

      <section id="js-visit" aria-labelledby="js-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="js-visit-title" icon={<MapPin size={22} aria-hidden />} title="오시는 길" />
        <Visit today={today} />
      </section>

      <footer className="mt-20 border-t" style={{ background: C.paperDeep, color: C.body, borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 text-[14px] leading-[1.8] md:px-6">
          <p className="text-[16px] font-bold" style={{ color: C.ink }}>
            <SampleLogo size={18} />
          </p>
          <p>
            {ADDRESS} | 전화 {TEL} | {KAKAO}
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="mb-6 flex items-center gap-2.5 border-b pb-3 text-[24px] font-bold md:text-[28px]" style={{ ...serifF, color: C.ink, borderColor: C.line }}>
      <span style={{ color: C.navy }}>{icon}</span>
      {title}
    </h2>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * PARALLAX}%`));

  return (
    <section id="js-poster" ref={ref} aria-labelledby="js-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#fff" }}>
      <style>{`
        @keyframes js-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .js-rise { animation: js-rise ${RISE}s cubic-bezier(${EASE.join(",")}) ${RISE_DELAY}s both; }
        @media (prefers-reduced-motion: reduce) { .js-rise { animation: none; } }
      `}</style>
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: ZOOM_FROM }}
          animate={{ scale: 1 }}
          transition={reduce ? { duration: 0 } : { duration: ZOOM, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="짙은 회색 바닥 위 작은 집 모형들 앞에 놓인 현관 열쇠 꾸러미"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "60% 50%" }}
          />
        </motion.div>
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.12))" }}
      />

      {/* 로고와 핵심 행동 하나 */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none">
          <SampleLogo light size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="scrivener_poster_cta"
          className={`inline-flex items-center gap-2 rounded-[6px] px-4 py-2.5 text-[15px] font-semibold ${focusRing}`}
          style={{ background: "#fff", color: C.ink, outlineColor: "#fff" }}
        >
          <Calculator size={18} aria-hidden />
          등기 비용 계산
        </button>
      </div>

      {/* 문장 */}
      <div className="relative z-[1] mt-auto max-w-[1200px] px-4 pb-14 md:px-12 md:pb-20">
        <h1
          id="js-poster-title"
          className={`${reduce ? "" : "js-rise "}text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]`}
          style={{ ...serifF, letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}
        >
          잔금일 출장 등기
        </h1>
        <p className={`${reduce ? "" : "js-rise "}mt-4 text-[16px] md:mt-6 md:text-[18px]`} style={{ color: "rgba(255,255,255,0.86)" }}>
          평일 09:00 ~ 18:00
        </p>
      </div>
    </section>
  );
}

/* ---------- 1. 등기 비용 계산 ---------- */

function CostCalc({ reduce, onApply }: { reduce: boolean; onApply: () => void }) {
  const uid = useId();
  const [manwon, setManwon] = useState(50000);
  const [homes, setHomes] = useState<Homes>(1);
  const [adjusted, setAdjusted] = useState(false);
  const [over85, setOver85] = useState(false);

  const price = manwon * 10000;
  const r = useMemo(() => {
    const rate = acqRate(price, homes, adjusted);
    const acq = floor10((price * rate) / 100);
    const edu = floor10((price * eduRate(rate)) / 100);
    const rural = floor10((price * ruralRate(rate, over85)) / 100);
    const [fl, fh] = feeRange(price);
    const taxes = acq + edu + rural + REG_FEE;
    return { rate, acq, edu, rural, fl, fh, low: taxes + fl * 11000, high: taxes + fh * 11000 };
  }, [price, homes, adjusted, over85]);

  const chip = (on: boolean) =>
    `rounded-[4px] border px-3.5 py-2 text-[15px] font-semibold transition-colors ${focusRing} ${on ? "text-white" : ""}`;

  const rows: [string, string, number | string][] = [
    ["취득세", fmtRate(r.rate), r.acq],
    ["지방교육세", fmtRate(eduRate(r.rate)), r.edu],
    ["농어촌특별세", over85 ? fmtRate(ruralRate(r.rate, over85)) : "비과세", r.rural],
    ["등기신청수수료", "방문 신청", REG_FEE],
    ["법무사 보수", "부가세 별도", `${r.fl}만 ~ ${r.fh}만 원`],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
      <div className="space-y-6">
        <div>
          <label htmlFor={`${uid}-price`} className="block text-[16px] font-bold">
            매매가 (만 원)
          </label>
          <input
            id={`${uid}-price`}
            inputMode="numeric"
            value={manwon ? manwon.toLocaleString("ko-KR") : ""}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[^0-9]/g, ""));
              setManwon(Math.min(n, 999999));
            }}
            className={`mt-2 w-full rounded-[4px] border bg-white px-3.5 py-3 text-right text-[22px] font-semibold tabular-nums ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.navy }}
          />
          <p className="mt-1.5 text-right text-[15px] font-bold" style={{ color: C.navy }} aria-live="polite">
            {readManwon(manwon)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[30000, 50000, 70000, 90000, 120000].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setManwon(m)}
                aria-pressed={manwon === m}
                className={`rounded-[4px] border px-2.5 py-1 text-[14px] ${focusRing}`}
                style={{ borderColor: manwon === m ? C.navy : C.line, background: manwon === m ? C.paperDeep : "#fff", outlineColor: C.navy }}
              >
                {readManwon(m)}
              </button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="text-[16px] font-bold">이번 집을 포함한 주택 수</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {HOMES.map((h) => (
              <button
                key={h.v}
                type="button"
                aria-pressed={homes === h.v}
                onClick={() => setHomes(h.v)}
                className={chip(homes === h.v)}
                style={{ borderColor: C.navy, background: homes === h.v ? C.navy : "#fff", color: homes === h.v ? "#fff" : C.navy, outlineColor: C.navy }}
              >
                {h.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2.5">
          <CheckRow checked={adjusted} onChange={setAdjusted} label="조정대상지역에 있는 집" />
          <CheckRow checked={over85} onChange={setOver85} label="전용면적 85제곱미터 초과" />
        </div>
        <p className="text-[14px] leading-[1.7]" style={{ color: C.muted }}>
          일시적 2주택은 1주택 세율이 적용될 수 있어요. 국민주택채권 할인 비용과 인지세는 따로 알려 드려요.
        </p>
      </div>

      {/* 견적서 양식 */}
      <div className="relative rounded-[6px] border bg-white p-5 md:p-7" style={{ borderColor: C.line }}>
        <div className="flex items-baseline justify-between gap-3 border-b pb-3" style={{ borderColor: C.ink }}>
          <p className="text-[20px] font-bold tracking-[0.2em] md:text-[22px]" style={{ color: C.ink }}>
            등기비용 견적서
          </p>
          <p className="text-[14px]" style={{ color: C.muted }}>
            주택 매매, 개략
          </p>
        </div>
        <table className="mt-2 w-full text-[15px]">
          <caption className="sr-only">항목별 등기 비용</caption>
          <thead>
            <tr className="text-left text-[13px]" style={{ color: C.muted }}>
              <th scope="col" className="py-2 font-normal">
                항목
              </th>
              <th scope="col" className="py-2 font-normal">
                세율, 기준
              </th>
              <th scope="col" className="py-2 text-right font-normal">
                금액
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, basis, amt]) => (
              <tr key={name} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="py-2.5 text-left font-bold">
                  {name}
                </th>
                <td className="py-2.5" style={{ color: C.muted }}>
                  {basis}
                </td>
                <td className="py-2.5 text-right font-bold tabular-nums">
                  <motion.span key={String(amt)} className="inline-block" initial={reduce ? false : { y: -6 }} animate={{ y: 0 }} transition={{ duration: reduce ? 0 : DUR, ease: EASE }}>
                    {typeof amt === "number" ? won(amt) : amt}
                  </motion.span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 border-t pt-4" style={{ borderColor: C.ink }}>
          <p className="text-[14px]" style={{ color: C.muted }}>
            합계 (법무사 보수 부가세 포함)
          </p>
          <p className="mt-1 text-[24px] font-bold tabular-nums md:text-[28px]" style={{ color: C.navy }} aria-live="polite">
            약 {won(Math.round(r.low / 10000) * 10000)} ~ {won(Math.round(r.high / 10000) * 10000)}
          </p>
        </div>
        <button
          type="button"
          onClick={onApply}
          data-gtm-cta="scrivener_cost_apply"
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[4px] px-4 py-3 text-[16px] font-semibold text-white ${focusRing}`}
          style={{ background: C.navy, outlineColor: C.navy }}
        >
          <MessageCircle size={18} aria-hidden />
          정확한 견적 받기
        </button>
      </div>
    </div>
  );
}

function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[16px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="flex h-6 w-6 flex-none items-center justify-center rounded-[3px] border-[1.5px] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
        style={{ borderColor: C.navy, background: checked ? C.navy : "#fff", outlineColor: C.navy }}
      >
        {checked && <Check size={16} color="#fff" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}

/* ---------- 2. 필요 서류 ---------- */

function DocChecklist({ reduce }: { reduce: boolean }) {
  const [side, setSide] = useState<Side>("buyer");
  const [got, setGot] = useState<Record<string, boolean>>({});
  const list = DOCS[side];
  const done = list.filter((d) => got[d.id]).length;
  const all = done === list.length;

  return (
    <div>
      <div role="tablist" aria-label="서류를 챙기는 사람" className="flex border-b" style={{ borderColor: C.line }}>
        {(["buyer", "seller"] as Side[]).map((s) => {
          const on = side === s;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSide(s)}
              className={`-mb-px border-b-[3px] px-5 py-3 text-[17px] font-semibold ${focusRing}`}
              style={{ borderColor: on ? C.navy : "transparent", color: on ? C.navy : C.muted, outlineColor: C.navy }}
            >
              {s === "buyer" ? "매수인 (사는 분)" : "매도인 (파는 분)"}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[16px] font-bold" aria-live="polite">
          {list.length}개 중 {done}개 챙김
          {all && <span style={{ color: C.navy }}> | 잔금일에 그대로 들고 오세요</span>}
        </p>
        <button
          type="button"
          onClick={() => setGot({})}
          className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[14px] underline-offset-4 hover:underline ${focusRing}`}
          style={{ color: C.muted, outlineColor: C.navy }}
        >
          <RotateCcw size={15} aria-hidden />
          처음부터
        </button>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden" style={{ background: C.paperDeep }}>
        <motion.div
          className="h-full origin-left"
          style={{ background: C.navy }}
          initial={false}
          animate={{ scaleX: done / list.length }}
          transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
        />
      </div>

      <ul className="mt-4 grid gap-x-8 md:grid-cols-2">
        {list.map((d) => {
          const on = !!got[d.id];
          return (
            <li key={d.id} className="border-b" style={{ borderColor: C.line }}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => setGot((g) => ({ ...g, [d.id]: !g[d.id] }))}
                className={`flex w-full items-start gap-3 py-4 text-left ${focusRing}`}
                style={{ outlineColor: C.navy }}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border-[1.5px] transition-colors"
                  style={{ borderColor: on ? C.navy : "#c4c4c4", background: on ? C.navy : "#fff" }}
                >
                  {on && <Check size={16} color="#fff" strokeWidth={3} aria-hidden />}
                </span>
                <span>
                  <span className="block text-[17px] font-bold" style={{ color: on ? C.muted : C.ink, textDecoration: on ? "line-through" : undefined }}>
                    {d.name}
                  </span>
                  <span className="mt-0.5 block text-[15px]" style={{ color: C.muted }}>
                    {d.note}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- 3. 개인회생 ---------- */

function Rehab({ reduce, onApply }: { reduce: boolean; onApply: () => void }) {
  const [step, setStep] = useState(0);
  const s = REHAB[step];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
      <div>
        <h3 className="text-[18px] font-bold" style={{ color: C.navy }}>
          신청할 수 있는 분
        </h3>
        <ul className="mt-3 space-y-3 text-[16px] leading-[1.6]">
          {[
            "무담보 빚 10억 원 이하, 담보 빚 15억 원 이하",
            "급여, 사업, 아르바이트처럼 매달 들어오는 소득이 있는 분",
            "생계비를 빼고 남는 돈으로 3년 동안 갚을 수 있는 분",
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check size={18} aria-hidden className="mt-1 flex-none" style={{ color: C.navy }} />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
          상담 내용은 가족에게도 알리지 않아요. 우편물은 사무소로 받을 수 있어요.
        </p>
        <button
          type="button"
          onClick={onApply}
          data-gtm-cta="scrivener_rehab_apply"
          className={`mt-5 inline-flex items-center gap-2 rounded-[4px] border px-4 py-2.5 text-[16px] font-semibold ${focusRing}`}
          style={{ borderColor: C.navy, color: C.navy, outlineColor: C.navy }}
        >
          <MessageCircle size={18} aria-hidden />
          개인회생 상담신청
        </button>
      </div>

      <div>
        <ol className="grid grid-cols-5 gap-1.5" aria-label="개인회생 진행 순서">
          {REHAB.map((r, i) => {
            const on = i === step;
            const past = i < step;
            return (
              <li key={r.name}>
                <button
                  type="button"
                  aria-current={on ? "step" : undefined}
                  onClick={() => setStep(i)}
                  className={`flex h-full w-full flex-col items-start gap-1 border-t-2 px-1 pb-2 pt-2.5 text-left md:px-2 ${focusRing}`}
                  style={{ borderColor: on || past ? C.navy : C.line, outlineColor: C.navy }}
                >
                  <span className="text-[13px] tabular-nums" style={{ color: C.muted }}>
                    {i + 1}단계
                  </span>
                  <span className="text-[14px] font-bold leading-[1.35] md:text-[16px]" style={{ color: on ? C.navy : C.ink, wordBreak: "keep-all" }}>
                    {r.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="relative mt-4 min-h-[140px] overflow-hidden border bg-white" style={{ borderColor: C.line }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              className="p-5 md:p-6"
              initial={reduce ? false : { x: 24, clipPath: "inset(0 0 0 100%)" }}
              animate={{ x: 0, clipPath: "inset(0 0 0 0%)" }}
              exit={reduce ? { opacity: 0 } : { x: -16, clipPath: "inset(0 100% 0 0)" }}
              transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            >
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[20px] font-bold" style={{ color: C.ink }}>
                  {s.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[15px] font-bold" style={{ color: C.navy }}>
                  <Clock size={15} aria-hidden />
                  {s.time}
                </span>
              </p>
              <p className="mt-3 text-[16px] leading-[1.75]">{s.todo}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-3 flex justify-between gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            className={`rounded-[4px] px-3 py-1.5 text-[15px] font-semibold disabled:opacity-40 ${focusRing}`}
            style={{ color: C.navy, outlineColor: C.navy }}
          >
            이전 단계
          </button>
          <button
            type="button"
            disabled={step === REHAB.length - 1}
            onClick={() => setStep((v) => Math.min(REHAB.length - 1, v + 1))}
            className={`rounded-[4px] px-3 py-1.5 text-[15px] font-semibold disabled:opacity-40 ${focusRing}`}
            style={{ color: C.navy, outlineColor: C.navy }}
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. 상담신청 ---------- */

function ApplyForm({ today, reduce, field, setField }: { today: Date; reduce: boolean; field: Field; setField: (f: Field) => void }) {
  const uid = useId();
  const [way, setWay] = useState<Way>("전화");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [closing, setClosing] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ no: string; name: string; phone: string; field: Field; way: Way; closing: string } | null>(null);

  const digits = phone.replace(/[^0-9]/g, "");
  const errs = {
    name: name.trim().length < 2 ? "이름을 2글자 이상 적어 주세요." : "",
    phone: !/^01[0-9]{8,9}$/.test(digits) ? "휴대폰 번호를 확인해 주세요." : "",
    agree: !agree ? "개인정보 수집에 동의해 주세요." : "",
  };
  const ok = !errs.name && !errs.phone && !errs.agree;
  const reply = nextBiz(today);
  const minDate = fmtDash(today);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok) return;
    const yymmdd = `${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}`;
    const tail = String((Number(digits.slice(-4)) % 900) + 100);
    setDone({ no: `JS-${yymmdd}-${tail}`, name: name.trim(), phone: digits, field, way, closing });
  };

  const input = `w-full rounded-[4px] border bg-white px-3.5 py-3 text-[16px] ${focusRing}`;
  const chip = "rounded-[4px] border px-3.5 py-2 text-[15px] font-semibold " + focusRing;
  const chipStyle = (on: boolean) => ({ borderColor: C.navy, background: on ? C.navy : "#fff", color: on ? "#fff" : C.navy, outlineColor: C.navy });

  if (done) {
    const [y, m, d] = done.closing ? done.closing.split("-").map(Number) : [0, 0, 0];
    return (
      <motion.div
        className="rounded-[6px] border bg-white p-6 md:p-8"
        style={{ borderColor: C.line }}
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
        role="status"
      >
        <p className="flex items-center gap-2 text-[22px] font-bold" style={{ color: C.ink }}>
          <Check size={24} aria-hidden style={{ color: C.navy }} />
          상담신청이 접수됐어요
        </p>
        <dl className="mt-5 grid gap-x-6 gap-y-3 text-[16px] sm:grid-cols-[120px_minmax(0,1fr)]">
          <dt style={{ color: C.muted }}>접수 번호</dt>
          <dd className="font-bold tabular-nums">{done.no}</dd>
          <dt style={{ color: C.muted }}>신청인</dt>
          <dd>
            {maskName(done.name)} ({maskPhone(done.phone)})
          </dd>
          <dt style={{ color: C.muted }}>상담 분야</dt>
          <dd>
            {done.field}, {done.way} 상담
          </dd>
          {done.closing && (
            <>
              <dt style={{ color: C.muted }}>잔금일</dt>
              <dd>{fmtKo(new Date(y, m - 1, d))}</dd>
            </>
          )}
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd>
            {KAKAO}, 전화 {TEL}
          </dd>
          <dt style={{ color: C.muted }}>회신 예정</dt>
          <dd className="font-bold">{fmtKo(reply)} 오전 중</dd>
        </dl>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setTried(false);
          }}
          className={`mt-6 inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[15px] underline-offset-4 hover:underline ${focusRing}`}
          style={{ color: C.muted, outlineColor: C.navy }}
        >
          <RotateCcw size={15} aria-hidden />
          다시 신청하기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 border bg-white p-5 md:grid-cols-2 md:gap-x-8 md:p-8" style={{ borderColor: C.line }}>
      <fieldset className="md:col-span-2">
        <legend className="text-[16px] font-bold">상담 분야</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <button key={f} type="button" aria-pressed={field === f} onClick={() => setField(f)} className={chip} style={chipStyle(field === f)}>
              {f}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="md:col-span-2">
        <legend className="text-[16px] font-bold">상담 방법</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {WAYS.map((w) => (
            <button key={w} type="button" aria-pressed={way === w} onClick={() => setWay(w)} className={chip} style={chipStyle(way === w)}>
              {w}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-name`} className="block text-[16px] font-bold">
          이름
        </label>
        <input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`mt-2 ${input}`} style={{ borderColor: tried && errs.name ? C.error : C.line, outlineColor: C.navy }} aria-invalid={tried && !!errs.name} aria-describedby={`${uid}-name-e`} />
        <FieldError id={`${uid}-name-e`} msg={tried ? errs.name : ""} />
      </div>
      <div>
        <label htmlFor={`${uid}-phone`} className="block text-[16px] font-bold">
          휴대폰
        </label>
        <input id={`${uid}-phone`} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`mt-2 ${input}`} style={{ borderColor: tried && errs.phone ? C.error : C.line, outlineColor: C.navy }} aria-invalid={tried && !!errs.phone} aria-describedby={`${uid}-phone-e`} />
        <FieldError id={`${uid}-phone-e`} msg={tried ? errs.phone : ""} />
      </div>

      {field === "부동산 등기" && (
        <div>
          <label htmlFor={`${uid}-closing`} className="block text-[16px] font-bold">
            잔금일 (정해졌으면)
          </label>
          <input id={`${uid}-closing`} type="date" min={minDate} value={closing} onChange={(e) => setClosing(e.target.value)} className={`mt-2 ${input}`} style={{ borderColor: C.line, outlineColor: C.navy }} />
        </div>
      )}
      <div className={field === "부동산 등기" ? "" : "md:col-span-2"}>
        <label htmlFor={`${uid}-memo`} className="block text-[16px] font-bold">
          상담 내용 (선택)
        </label>
        <textarea id={`${uid}-memo`} value={memo} onChange={(e) => setMemo(e.target.value)} rows={field === "부동산 등기" ? 1 : 3} className={`mt-2 ${input}`} style={{ borderColor: C.line, outlineColor: C.navy }} />
      </div>

      <div className="md:col-span-2">
        <CheckRow checked={agree} onChange={setAgree} label="상담을 위한 개인정보(이름, 휴대폰) 수집에 동의해요" />
        <FieldError id={`${uid}-agree-e`} msg={tried ? errs.agree : ""} />
        <button
          type="submit"
          data-gtm-cta="scrivener_apply_submit"
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[4px] px-5 py-3.5 text-[17px] font-semibold text-white md:w-auto ${focusRing}`}
          style={{ background: C.navy, outlineColor: C.navy }}
        >
          상담신청
        </button>
      </div>
    </form>
  );
}

function FieldError({ id, msg }: { id: string; msg: string }) {
  return (
    <p id={id} className="mt-1.5 flex min-h-[22px] items-center gap-1 text-[14px]" style={{ color: C.error }} aria-live="polite">
      {msg && <AlertCircle size={15} aria-hidden />}
      {msg}
    </p>
  );
}

/* ---------- 오시는 길 ---------- */

function Visit({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-10">
      <div className="border" style={{ borderColor: C.line, background: "#f7f7f5" }}>
        <svg viewBox="0 0 560 320" className="block h-auto w-full" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 걸어 등기소 건너편 건물 5층에 있는 사무소 약도">
          <rect width="560" height="320" fill="#f7f7f5" />
          {/* 블록 */}
          {[
            [20, 20, 150, 110],
            [210, 20, 150, 110],
            [400, 20, 140, 110],
            [20, 190, 150, 110],
            [210, 190, 150, 110],
            [400, 190, 140, 110],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="#ececea" stroke="#e0e0dc" />
          ))}
          {/* 큰길과 골목 */}
          <rect x="0" y="140" width="560" height="40" fill="#fff" />
          <rect x="180" y="0" width="20" height="320" fill="#fff" />
          <rect x="370" y="0" width="20" height="320" fill="#fff" />
          <text x="20" y="165" fontSize="14" fill="#4b4b4b">
            ㅇㅇ로
          </text>
          {/* 역 */}
          <g transform="translate(60 196)">
            <rect width="80" height="40" rx="4" fill={C.navy} />
            <text x="40" y="26" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
              ㅇㅇ역
            </text>
          </g>
          <text x="60" y="258" fontSize="13" fill="#4b4b4b">
            2번 출구
          </text>
          {/* 등기소 */}
          <rect x="230" y="210" width="110" height="70" fill="#dcdcd8" stroke="#c8c8c4" />
          <text x="285" y="250" textAnchor="middle" fontSize="14" fill="#4b4b4b">
            ㅇㅇ등기소
          </text>
          {/* 걷는 길 */}
          <path d="M100 190 V160 H285 V130" stroke={C.navy} strokeWidth="3" strokeDasharray="8 8" fill="none" strokeLinecap="round" />
          {/* 사무소 */}
          <rect x="230" y="40" width="110" height="80" fill={C.navy} />
          <text x="285" y="76" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
            곰파트너
          </text>
          <text x="285" y="98" textAnchor="middle" fontSize="13" fill="#fff">
            5층
          </text>
        </svg>
      </div>
      <div className="space-y-5 text-[16px] leading-[1.7]">
        <p className="flex gap-2.5">
          <MapPin size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.navy }} />
          <span>
            <span className="block font-bold">{ADDRESS}</span>
            ㅇㅇ등기소 건너편
          </span>
        </p>
        <p className="flex gap-2.5">
          <Train size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.navy }} />
          ㅇㅇ역 2번 출구에서 걸어서 4분. 건물 지하 주차 1시간 무료.
        </p>
        <div className="flex gap-2.5">
          <Clock size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.navy }} />
          <table className="text-[16px]">
            <caption className="sr-only">업무 시간</caption>
            <tbody>
              {HOURS.map((h) => {
                const on = h.dow.includes(dow);
                return (
                  <tr key={h.label} style={{ fontWeight: on ? 700 : 400, color: on ? C.navy : C.ink }}>
                    <th scope="row" className="py-0.5 pr-4 text-left font-[inherit]">
                      {h.label}
                      {on && <span className="ml-1.5 text-[13px]" style={{ color: C.navy }}>(오늘)</span>}
                    </th>
                    <td className="py-0.5">{h.open}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="flex gap-2.5">
          <Phone size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.navy }} />
          <span>
            전화 {TEL}
            <span className="block">
              {KAKAO} (평일 밤 9시까지 답해요)
            </span>
          </span>
        </p>
      </div>
    </div>
  );
}

function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">법무사 샘플</span>
      </span>
    </span>
  );
}
