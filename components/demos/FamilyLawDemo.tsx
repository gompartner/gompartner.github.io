"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import {
  CalendarCheck,
  Car,
  Check,
  ChevronDown,
  Clock,
  DoorClosed,
  MapPin,
  MessageCircle,
  Phone,
  PhoneOff,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Noto_Serif_KR } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 이혼, 가사 사건 법률사무소 홈페이지 샘플: 곰파트너 법률사무소.
   사무소 이름, 변호사 이름, 주소, 전화번호, 예약 현황은 모두 가상이다.
   변호사 광고 규정에 맞춰 승소율, 성공 사례 숫자, 결과 보장, 최고 같은 표현은 쓰지 않는다.
   "전문"은 대한변협 등록 전문분야 표기에만 쓴다.

   국내 이혼 전문 사무소 사이트의 흔한 구성: 메뉴는 업무분야(협의이혼, 이혼소송, 양육권, 재산분할, 위자료),
   변호사 소개, 상담신청(방문, 전화, 화상), 자주 묻는 질문, 오시는 길. 첫 화면에 비밀 보장, 변호사 직접 상담,
   야간 상담 가능 같은 약속과 상담 예약 버튼을 둔다. 양육비 계산기는 서울가정법원 양육비 산정기준표를 쓴다.

   상호작용(브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 상담 분야 고르기: 협의이혼, 재판이혼, 양육권, 재산분할을 누르면 절차 단계, 걸리는 기간, 준비 서류가 바뀐다.
   2. 양육비 개략: 두 부모 월 소득과 자녀 나이로 산정기준표 구간을 찾고, 소득 비율로 나눈 월 금액을 보여 준다.
   3. 비공개 상담 예약: 방문 상담은 앞뒤 상담과 30분씩 비워 다른 손님과 마주치지 않는 시간만 열린다.
      전화, 화상은 겹치지만 않으면 된다. 연락을 전화로만 받기(문자 안 받기)를 고를 수 있다.
   4. 자주 묻는 질문.

   사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0). 직원 사진은 AI 생성(Z-Image-Turbo).

   첫 화면(fl-poster): 조용한 상담실 사진 한 장이 화면을 채운다. 둥근 원목 탁자에 물 한 잔과 서류철, 뒤로 밝은 창과 법률 서가.
   아래쪽 어두운 막 위에 문장 "상담은 다른 분과 마주치지 않게 잡아요"를 왼쪽 정렬로 둔다.
   핵심 모션: 들어올 때 사진이 1.06배에서 1배로 1.6초 동안 천천히 다가오고, 문장은 0.3초 뒤 아래에서 올라온다.
   스크롤하면 사진만 조금 느리게 움직인다. 동작 줄이기 설정이면 모두 멈춘다. */

const serif = Noto_Serif_KR;
/** h1, h2 에만 쓰는 명조 */
const serifF = { fontFamily: `${serif.style.fontFamily}, serif` } as const;

const SLUG = "family-law";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 7층";
const IMG = "/images/demo-family-law";

const C = {
  bg: "#ffffff",
  alt: "#f7f7f5",
  accent: "#5e2a35",
  accentSoft: "#f4eeef",
  booked: "#ececea",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  error: "#b3261e",
};

/* 모션 값 */
const EASE = [0.22, 1, 0.36, 1] as const;
const PHOTO_IN = 1.6; // 사진이 다가오는 시간, 초
const NUM_DUR = 0.6; // 양육비 숫자 굴림, 초

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (m: number) => `${p2(Math.floor(m / 60))}:${p2(m % 60)}`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="fl-poster" ref={ref} aria-labelledby="fl-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#ffffff" }}>
      <style>{`@keyframes fl-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.fl-rise{animation:fl-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.fl-rise{animation:none}}`}</style>
      <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
        <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="밝은 창과 법률 서가 앞, 물 한 잔과 서류철이 놓인 둥근 원목 탁자가 있는 상담실"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 55%" }}
          />
        </motion.div>
      </motion.div>
      {/* 글자 대비를 위한 막. 위는 상호, 아래는 문장 */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.42))" }} />

      <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none">
          <SampleLogo light size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta={`${SLUG}_poster_cta`}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.accent, color: "#ffffff", outlineColor: "#ffffff" }}
        >
          <CalendarCheck size={17} aria-hidden />
          상담 예약
        </button>
      </div>

      <div className={`relative z-[1] mt-auto px-4 pb-14 md:px-12 md:pb-20 ${reduce ? "" : "fl-rise"}`}>
        <h1
          id="fl-poster-title"
          className="max-w-[12em] text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ ...serifF, letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}
        >
          상담은 다른 분과 마주치지 않게 잡아요
        </h1>
        <p className="mt-4 text-[16px] md:mt-6 md:text-[18px]" style={{ color: "rgba(255,255,255,0.86)" }}>
          이혼, 가사 사건 상담 평일 밤 9시까지
        </p>
      </div>
    </section>
  );
}

/* ---------- 1. 상담 분야와 절차 ---------- */

type Area = "협의이혼" | "재판이혼" | "양육권" | "재산분할";
const AREA_LIST: Area[] = ["협의이혼", "재판이혼", "양육권", "재산분할"];

const AREAS: Record<Area, { sub: string; period: string; steps: [string, string][]; docs: string[] }> = {
  협의이혼: {
    sub: "둘 다 이혼에 동의할 때",
    period: "숙려기간 포함 1~3개월",
    steps: [
      ["협의이혼의사확인 신청", "부부가 함께 주소지 관할 가정법원에 신청서를 내요."],
      ["이혼 안내 받기", "법원에서 이혼 안내를 듣고, 미성년 자녀가 있으면 부모 교육도 받아요."],
      ["숙려기간", "미성년 자녀가 있으면 3개월, 없으면 1개월을 기다려요."],
      ["양육 협의서 제출", "자녀가 있으면 친권자, 양육자, 양육비, 면접교섭을 정해 내요."],
      ["확인기일 출석", "둘이 함께 법원에 나가 이혼 의사를 확인받아요."],
      ["이혼 신고", "확인서 등본을 받은 날부터 3개월 안에 시청, 구청에 신고해요."],
    ],
    docs: ["협의이혼의사확인신청서", "부부 각자 혼인관계증명서, 가족관계증명서", "자녀가 있으면 양육 협의서"],
  },
  재판이혼: {
    sub: "한쪽이 동의하지 않거나 조건이 안 맞을 때",
    period: "보통 6개월~1년 이상",
    steps: [
      ["소장 접수", "이혼 사유와 위자료, 재산분할, 양육 청구를 함께 적어 내요."],
      ["송달과 답변서", "상대방이 소장을 받고 답변서를 내요."],
      ["가사조사, 조정", "조사관 면담과 조정 기일에서 합의를 먼저 시도해요."],
      ["변론", "합의가 안 되면 변론 기일에 증거와 주장을 정리해요."],
      ["판결과 확정", "판결문을 받고 2주 안에 항소가 없으면 확정돼요."],
      ["이혼 신고", "확정된 날부터 1개월 안에 신고해요."],
    ],
    docs: ["혼인관계증명서, 가족관계증명서, 주민등록등본", "이혼 사유 자료(대화 기록, 사진, 진단서)", "재산, 소득 자료"],
  },
  양육권: {
    sub: "친권자, 양육자를 정해야 할 때",
    period: "이혼 소송과 함께 진행",
    steps: [
      ["친권자, 양육자 지정 청구", "이혼 소송과 같이 내거나 따로 청구해요."],
      ["사전처분 신청", "소송 중 아이를 누가 돌볼지 임시로 정해 달라고 해요."],
      ["가사조사", "조사관이 부모 면담, 가정 방문으로 양육 환경을 봐요."],
      ["자녀 의견 듣기", "자녀가 13세 이상이면 법원이 의견을 들어요."],
      ["양육비, 면접교섭 정하기", "매달 양육비와 아이를 만나는 날을 함께 정해요."],
      ["심판", "자녀의 복리를 기준으로 정해져요."],
    ],
    docs: ["돌봄 일정과 주거 환경 자료", "어린이집, 학교 관련 자료", "부모 소득 자료"],
  },
  재산분할: {
    sub: "부부가 모은 재산을 나눌 때",
    period: "이혼한 날부터 2년 안에 청구",
    steps: [
      ["재산 목록 정리", "부동산, 예금, 주식, 퇴직금, 대출까지 부부 재산을 모아요."],
      ["재산명시, 재산조회", "상대 재산을 모르면 법원에 명시와 조회를 신청해요."],
      ["가압류, 가처분", "소송 중 재산을 처분하지 못하게 미리 묶어 둬요."],
      ["기여도 정리", "맞벌이 소득뿐 아니라 육아와 가사도 기여로 따져요."],
      ["조정 또는 판결", "나눌 비율과 방법이 정해져요."],
    ],
    docs: ["부동산 등기사항증명서", "예금, 보험, 주식 내역", "대출 내역과 급여 자료"],
  },
};

function AreaPicker({ area, setArea, onBook }: { area: Area; setArea: (a: Area) => void; onBook: () => void }) {
  const a = AREAS[area];
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
      <div role="group" aria-label="상담 분야" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {AREA_LIST.map((k) => {
          const on = k === area;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setArea(k)}
              className={`group flex items-center justify-between gap-2 rounded-[6px] border px-4 py-3 text-left transition-colors duration-150 ${focusRing}`}
              style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.bg, color: on ? "#ffffff" : C.ink, outlineColor: C.accent }}
            >
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold">
                  {k}
                </span>
                <span className="mt-0.5 block text-[13px] leading-[1.4]" style={{ color: on ? "#eadde0" : C.muted }}>
                  {AREAS[k].sub}
                </span>
              </span>
              <DoorClosed size={20} aria-hidden className="hidden flex-none sm:block" style={{ opacity: on ? 1 : 0.35 }} />
            </button>
          );
        })}
      </div>

      <div className="min-w-0 rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.alt }}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-[21px] font-bold" style={{ color: C.ink }}>
            {area} 절차
          </h3>
          <p className="inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.ink }}>
            <Clock size={16} aria-hidden />
            {a.period}
          </p>
        </div>

        <ol key={area} className="relative mt-5 grid gap-0">
          <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-px" style={{ background: C.line }} />
          {a.steps.map(([title, desc], i) => (
            <li key={title} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 py-2.5">
              <span className="relative z-[1] inline-flex h-7 w-7 items-center justify-center rounded-full border text-[14px] font-semibold tabular-nums" style={{ borderColor: C.accent, background: C.bg, color: C.accent }}>
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-bold">{title}</span>
                <span className="mt-0.5 block text-[15px] leading-[1.55]" style={{ color: C.body }}>
                  {desc}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 border-t pt-4" style={{ borderColor: C.line }}>
          <h4 className="text-[15px] font-bold">준비 서류</h4>
          <ul className="mt-2 grid gap-1.5 text-[15px]">
            {a.docs.map((d) => (
              <li key={d} className="flex gap-2">
                <Check size={16} aria-hidden className="mt-[3px] flex-none" style={{ color: C.accent }} />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onBook}
          data-gtm-cta={`${SLUG}_area_book`}
          className={`mt-6 inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[16px] font-semibold ${focusRing}`}
          style={{ background: C.accent, color: "#ffffff", outlineColor: C.accent }}
        >
          <CalendarCheck size={18} aria-hidden />
          {area} 상담 예약
        </button>
      </div>
    </div>
  );
}

/* ---------- 2. 양육비 개략 ----------
   서울가정법원 양육비 산정기준표(2021)의 부모 합산 소득 구간, 자녀 나이별 표준양육비(평균값)를 천 원 단위로 옮겼다.
   양육하지 않는 부모는 표준양육비에 자기 소득 비율을 곱한 금액을 보낸다. 자녀 한 명 기준. */

const AGE_BANDS = ["0~2세", "3~5세", "6~8세", "9~11세", "12~14세", "15~18세"];
const SUPPORT: { upto: number; label: string; v: number[] }[] = [
  { upto: 200, label: "0~199만 원", v: [621, 631, 648, 667, 679, 703] },
  { upto: 300, label: "200~299만 원", v: [752, 759, 767, 782, 790, 957] },
  { upto: 400, label: "300~399만 원", v: [945, 949, 959, 988, 998, 1227] },
  { upto: 500, label: "400~499만 원", v: [1098, 1113, 1140, 1163, 1280, 1402] },
  { upto: 600, label: "500~599만 원", v: [1245, 1266, 1292, 1318, 1423, 1604] },
  { upto: 700, label: "600~699만 원", v: [1401, 1422, 1479, 1494, 1598, 1794] },
  { upto: 800, label: "700~799만 원", v: [1582, 1598, 1614, 1630, 1711, 1964] },
  { upto: 900, label: "800~899만 원", v: [1789, 1807, 1850, 1887, 1984, 2163] },
  { upto: 1000, label: "900~999만 원", v: [1997, 2017, 2065, 2137, 2159, 2246] },
  { upto: 1200, label: "1,000~1,199만 원", v: [2095, 2116, 2137, 2180, 2223, 2540] },
  { upto: Infinity, label: "1,200만 원 이상", v: [2207, 2245, 2312, 2405, 2476, 2883] },
];

function RollingWon({ value, reduce }: { value: number; reduce: boolean }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => won(Math.round(v / 1000) * 1000));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: NUM_DUR, ease: EASE });
    return () => c.stop();
  }, [value, reduce, mv]);
  return <motion.span>{text}</motion.span>;
}

function IncomeSlider({ id, label, value, setValue }: { id: string; label: string; value: number; setValue: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-bold">
          {label}
        </label>
        <span className="text-[17px] font-bold tabular-nums" style={{ color: C.accent }}>
          월 {value.toLocaleString("ko-KR")}만 원
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={1500}
        step={10}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className={`mt-2 w-full ${focusRing}`}
        style={{ accentColor: C.accent, outlineColor: C.accent }}
      />
    </div>
  );
}

function ChildSupport({ reduce }: { reduce: boolean }) {
  const [mine, setMine] = useState(250);
  const [other, setOther] = useState(400);
  const [age, setAge] = useState(2);
  const sum = mine + other;
  const band = SUPPORT.find((b) => sum < b.upto) ?? SUPPORT[SUPPORT.length - 1];
  const standard = band.v[age] * 1000;
  const ratio = sum === 0 ? 0 : other / sum;
  const pay = Math.round((standard * ratio) / 10000) * 10000;

  return (
    <div className="mt-6 grid gap-6 rounded-[8px] border p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-10 md:p-7" style={{ borderColor: C.line, background: C.alt }}>
      <div className="grid content-start gap-6">
        <IncomeSlider id="fl-inc-mine" label="아이를 키우는 부모 소득(세전)" value={mine} setValue={setMine} />
        <IncomeSlider id="fl-inc-other" label="아이를 키우지 않는 부모 소득(세전)" value={other} setValue={setOther} />
        <fieldset>
          <legend className="text-[15px] font-bold">자녀 나이</legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {AGE_BANDS.map((b, i) => {
              const on = i === age;
              return (
                <button
                  key={b}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAge(i)}
                  className={`rounded-[6px] border px-2 py-2 text-[14px] font-semibold tabular-nums ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#ffffff" : C.ink, outlineColor: C.accent }}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="flex min-w-0 flex-col rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.bg, color: C.ink }} aria-live="polite">
        <p className="text-[15px]" style={{ color: C.body }}>매달 보내는 양육비 개략</p>
        <p className="mt-1 text-[clamp(34px,9vw,48px)] font-bold leading-[1.15] tracking-[-0.02em] tabular-nums">
          <RollingWon value={pay} reduce={reduce} />
        </p>
        <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-t pt-4 text-[15px]" style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>합산 소득</dt>
          <dd className="text-right font-bold tabular-nums">{band.label}</dd>
          <dt style={{ color: C.muted }}>표준양육비</dt>
          <dd className="text-right font-bold tabular-nums">{won(standard)}</dd>
          <dt style={{ color: C.muted }}>분담 비율</dt>
          <dd className="text-right font-bold tabular-nums">{Math.round(ratio * 100)}%</dd>
        </dl>
        {/* 분담 비율 막대: 글자와 함께 보여 색에만 기대지 않는다 */}
        <div className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ background: C.line }} aria-hidden>
          <motion.div
            className="h-full origin-left rounded-full"
            style={{ background: C.accent }}
            initial={false}
            animate={{ scaleX: ratio }}
            transition={{ duration: reduce ? 0 : NUM_DUR, ease: EASE }}
          />
        </div>
        <p className="mt-auto pt-5 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          서울가정법원 양육비 산정기준표(2021) 기준, 자녀 한 명. 재산과 양육 환경에 따라 법원이 더하거나 뺄 수 있어요.
        </p>
      </div>
    </div>
  );
}

/* ---------- 3. 비공개 상담 예약 ---------- */

type Method = "visit" | "phone" | "video";
const METHODS: { id: Method; label: string; mins: number; fee: number; Icon: typeof Phone }[] = [
  { id: "visit", label: "방문 상담", mins: 50, fee: 50000, Icon: DoorClosed },
  { id: "phone", label: "전화 상담", mins: 30, fee: 30000, Icon: Phone },
  { id: "video", label: "화상 상담", mins: 50, fee: 50000, Icon: Video },
];
/** 이미 잡힌 상담은 모두 방문 50분으로 본다 */
const BOOKED_MINS = 50;
/** 방문 상담은 앞뒤 상담과 이만큼 비운다(분) */
const GAP = 30;

/** 평일 09:00~20:00, 토요일 10:00~14:00 시작, 30분 간격 */
function slotsFor(d: Date) {
  const [from, to] = d.getDay() === 6 ? [600, 840] : [540, 1200];
  const out: number[] = [];
  for (let m = from; m <= to; m += 30) out.push(m);
  return out;
}

/** 날짜마다 이미 잡힌 상담. 실제로는 예약 시트에서 읽는다 */
function bookedFor(d: Date) {
  const slots = slotsFor(d);
  let h = (d.getDate() * 73 + d.getMonth() * 151 + 17) >>> 0;
  const want = d.getDay() === 6 ? 1 : 3;
  const out: number[] = [];
  for (let tries = 0; out.length < want && tries < 60; tries++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const s = slots[(h >>> 8) % slots.length];
    if (out.every((b) => Math.abs(b - s) >= 120)) out.push(s);
  }
  return out.sort((a, b) => a - b);
}

type SlotState = "open" | "booked" | "gap";
function slotState(s: number, booked: number[], method: Method): SlotState {
  const mins = METHODS.find((m) => m.id === method)!.mins;
  const gap = method === "visit" ? GAP : 0;
  let st: SlotState = "open";
  for (const b of booked) {
    if (s < b + BOOKED_MINS && b < s + mins) return "booked";
    if (s < b + BOOKED_MINS + gap && b - gap < s + mins) st = "gap";
  }
  return st;
}

/** 예약할 수 있는 날: 내일부터 일요일을 뺀 6일 */
function openDays(today: Date) {
  const out: Date[] = [];
  for (let i = 1; out.length < 6; i++) {
    const d = daysAgo(today, -i);
    if (d.getDay() !== 0) out.push(d);
  }
  return out;
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

type Done = { no: string; name: string; phone: string; when: string; method: string; callOnly: boolean; area: Area; reply: string };

function Booking({ today, reduce, area, setArea }: { today: Date; reduce: boolean; area: Area; setArea: (a: Area) => void }) {
  const days = useMemo(() => openDays(today), [today]);
  const [dayIdx, setDayIdx] = useState(0);
  const [method, setMethod] = useState<Method>("visit");
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [callOnly, setCallOnly] = useState(true);
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const day = days[dayIdx];
  const booked = useMemo(() => bookedFor(day), [day]);
  const slots = slotsFor(day);
  const m = METHODS.find((x) => x.id === method)!;
  // 방식이나 날짜를 바꿔 고른 시간이 막히면 선택을 푼다
  const picked = slot !== null && slots.includes(slot) && slotState(slot, booked, method) === "open" ? slot : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (picked === null) return setErr("상담 시간을 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 적어 주세요.");
    if (digits.length < 10 || digits.length > 11) return setErr("연락처를 확인해 주세요.");
    if (!agree) return setErr("개인정보 수집, 이용에 동의해 주세요.");
    setErr("");
    let reply = today;
    if (reply.getDay() === 0) reply = daysAgo(reply, -1);
    const ymd = `${today.getFullYear()}${p2(today.getMonth() + 1)}${p2(today.getDate())}`;
    setDone({
      no: `FL-${ymd}-${String(((picked + Number(digits.slice(-4))) % 900) + 100)}`,
      name: maskName(name),
      phone: maskPhone(phone),
      when: `${fmtKo(day)} ${hm(picked)}~${hm(picked + m.mins)}`,
      method: m.label,
      callOnly,
      area,
      reply: `${fmtKo(reply)} 오후 6시 전`,
    });
  };

  const reset = () => {
    setDone(null);
    setSlot(null);
    setName("");
    setPhone("");
    setAgree(false);
  };

  return (
    <div className="mt-6 rounded-[8px] border" style={{ borderColor: C.line, background: C.alt }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            className="p-5 md:p-8"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.accent }}>
              <ShieldCheck size={18} aria-hidden />
              상담 예약 접수
            </p>
            <h3 className="mt-2 text-[24px] font-bold">
              접수 번호 <span className="tabular-nums">{done.no}</span>
            </h3>
            <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[120px_minmax(0,1fr)]">
              <dt className="font-bold" style={{ color: C.muted }}>
                상담 일시
              </dt>
              <dd className="tabular-nums">{done.when}</dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                방식, 분야
              </dt>
              <dd>
                {done.method}, {done.area}
              </dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                예약자
              </dt>
              <dd className="tabular-nums">
                {done.name} {done.phone}
              </dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                회신 예정
              </dt>
              <dd>
                {done.reply}, {done.callOnly ? "전화로만 연락드려요(문자 없음)" : "전화나 문자로 연락드려요"}
              </dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                담당 창구
              </dt>
              <dd>
                상담실 전화 {TEL}, {KAKAO}
              </dd>
            </dl>
            {done.method === "방문 상담" && (
              <p className="mt-5 flex gap-2 rounded-[6px] p-3 text-[15px] leading-[1.6]" style={{ background: C.accentSoft }}>
                <Car size={18} aria-hidden className="mt-[3px] flex-none" style={{ color: C.accent }} />
                건물 뒤편 주차장 쪽 엘리베이터로 7층에 오시면 대기실을 거치지 않고 바로 상담실로 들어가요.
              </p>
            )}
            <button type="button" onClick={reset} className={`mt-6 rounded-[6px] border px-4 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.accent, color: C.accent, outlineColor: C.accent }}>
              다른 시간 예약
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="grid gap-7 p-5 md:p-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-10" exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.15 }}>
            <div className="min-w-0">
              <fieldset>
                <legend className="text-[15px] font-bold">상담 방식</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {METHODS.map(({ id, label, mins, fee, Icon }) => {
                    const on = id === method;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setMethod(id)}
                        className={`flex flex-col items-start gap-1 rounded-[6px] border px-3 py-2.5 text-left ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#ffffff" : C.ink, outlineColor: C.accent }}
                      >
                        <Icon size={18} aria-hidden />
                        <span className="text-[15px] font-bold">{label}</span>
                        <span className="text-[13px] tabular-nums" style={{ color: on ? "#eadde0" : C.muted }}>
                          {mins}분 {won(fee)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-[15px] font-bold">날짜</legend>
                <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                  {days.map((d, i) => {
                    const on = i === dayIdx;
                    return (
                      <button
                        key={d.toDateString()}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setDayIdx(i)}
                        className={`flex w-[58px] flex-none flex-col items-center rounded-[6px] border py-2 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#ffffff" : C.ink, outlineColor: C.accent }}
                      >
                        <span className="text-[13px]">{DOW[d.getDay()]}</span>
                        <span className="text-[19px] font-bold tabular-nums">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-6" id="fl-slots">
                <legend className="text-[15px] font-bold">시간</legend>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: C.muted }}>
                  <li className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-[2px] border" style={{ borderColor: C.ink }} aria-hidden />
                    예약 가능
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-[2px]" style={{ background: C.booked }} aria-hidden />
                    예약 있음
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-[2px]" style={{ backgroundImage: `repeating-linear-gradient(135deg, ${C.line} 0 2px, transparent 2px 5px)` }} aria-hidden />
                    비워 둠(앞뒤 방문 상담과 겹침)
                  </li>
                </ul>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {slots.map((s) => {
                    const st = slotState(s, booked, method);
                    const on = picked === s;
                    const blocked = st !== "open";
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={blocked}
                        aria-pressed={on}
                        aria-label={`${hm(s)} ${st === "open" ? "예약 가능" : st === "booked" ? "예약 있음" : "비워 둠"}`}
                        onClick={() => setSlot(s)}
                        className={`relative flex flex-col items-center rounded-[6px] border py-2 tabular-nums transition-colors duration-150 disabled:cursor-not-allowed ${focusRing}`}
                        style={{
                          borderColor: on ? C.accent : blocked ? "transparent" : C.line,
                          backgroundColor: on ? C.accent : st === "booked" ? C.booked : "transparent",
                          backgroundImage: st === "gap" ? `repeating-linear-gradient(135deg, ${C.line} 0 2px, transparent 2px 6px)` : undefined,
                          color: on ? "#ffffff" : blocked ? C.muted : C.ink,
                          outlineColor: C.accent,
                        }}
                      >
                        <span className={`text-[16px] font-bold ${blocked ? "line-through" : ""}`}>{hm(s)}</span>
                        {blocked && <span className="text-[11px]">{st === "booked" ? "예약 있음" : "비워 둠"}</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                  {method === "visit" ? "방문 상담은 앞뒤 상담과 30분씩 띄워 잡아요. 오가는 길에 다른 분을 만나지 않아요." : `${m.label}는 상담 시간만 겹치지 않으면 돼요.`}
                </p>
              </fieldset>
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <div>
                <label htmlFor="fl-area" className="text-[15px] font-bold">
                  상담 분야
                </label>
                <select
                  id="fl-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value as Area)}
                  className={`mt-1.5 w-full rounded-[6px] border bg-transparent px-3 py-2.5 text-[16px] ${focusRing}`}
                  style={{ borderColor: C.line, outlineColor: C.accent }}
                >
                  {AREA_LIST.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fl-name" className="text-[15px] font-bold">
                  이름
                </label>
                <input
                  id="fl-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="가명도 괜찮아요"
                  className={`mt-1.5 w-full rounded-[6px] border bg-transparent px-3 py-2.5 text-[16px] ${focusRing}`}
                  style={{ borderColor: C.line, outlineColor: C.accent }}
                />
              </div>
              <div>
                <label htmlFor="fl-phone" className="text-[15px] font-bold">
                  연락처
                </label>
                <input
                  id="fl-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  className={`mt-1.5 w-full rounded-[6px] border bg-transparent px-3 py-2.5 text-[16px] tabular-nums ${focusRing}`}
                  style={{ borderColor: C.line, outlineColor: C.accent }}
                />
              </div>
              <fieldset>
                <legend className="text-[15px] font-bold">연락 방법</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {[
                    [true, "전화로만", PhoneOff, "문자 받지 않기"],
                    [false, "전화, 문자", MessageCircle, "문자도 괜찮아요"],
                  ].map(([v, label, Icon, sub]) => {
                    const on = callOnly === v;
                    const I = Icon as typeof Phone;
                    return (
                      <button
                        key={String(v)}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setCallOnly(v as boolean)}
                        className={`flex items-start gap-2 rounded-[6px] border px-3 py-2.5 text-left ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accentSoft : "transparent", outlineColor: C.accent }}
                      >
                        <I size={17} aria-hidden className="mt-[2px] flex-none" style={{ color: C.accent }} />
                        <span>
                          <span className="block text-[15px] font-bold">{label as string}</span>
                          <span className="block text-[13px]" style={{ color: C.muted }}>
                            {sub as string}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <label className="flex items-start gap-2 text-[14px] leading-[1.5]">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-[3px] h-4 w-4 flex-none ${focusRing}`} style={{ accentColor: C.accent, outlineColor: C.accent }} />
                <span>개인정보 수집, 이용 동의(이름, 연락처는 상담 일정 안내에만 쓰고 상담이 끝나면 지워요)</span>
              </label>

              <div className="rounded-[6px] border p-3 text-[15px]" style={{ borderColor: C.line }}>
                <p className="flex items-center justify-between gap-3">
                  <span style={{ color: C.muted }}>선택한 시간</span>
                  <span className="font-bold tabular-nums">{picked === null ? "아직 안 고름" : `${fmtKo(day)} ${hm(picked)}`}</span>
                </p>
                <p className="mt-1 flex items-center justify-between gap-3">
                  <span style={{ color: C.muted }}>상담료</span>
                  <span className="font-bold tabular-nums">{won(m.fee)}</span>
                </p>
              </div>

              <p aria-live="assertive" className="min-h-[1.5em] text-[15px] font-bold" style={{ color: C.error }}>
                {err}
              </p>
              <button
                type="submit"
                data-gtm-cta={`${SLUG}_booking_submit`}
                className={`inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3.5 text-[17px] font-semibold ${focusRing}`}
                style={{ background: C.accent, color: "#ffffff", outlineColor: C.accent }}
              >
                <CalendarCheck size={19} aria-hidden />
                상담 예약하기
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 4. 자주 묻는 질문 ---------- */

const FAQ: [string, string][] = [
  ["상담하면 상대방이 알게 되나요?", "변호사는 상담 내용을 지킬 의무가 있어요. 전화로만 연락받기를 고르시면 문자도 보내지 않아요."],
  ["상담만 받고 사건은 안 맡겨도 되나요?", "네. 상담료만 내시면 돼요. 사건을 맡기시면 상담료는 착수금에서 빼 드려요."],
  ["상대방이 이혼을 원하지 않으면요?", "협의이혼은 할 수 없고 재판이혼으로 가야 해요. 민법이 정한 이혼 사유가 있어야 해요."],
  ["소송 중에도 아이와 같이 살 수 있나요?", "사전처분을 신청해 소송이 끝날 때까지 임시 양육자를 정할 수 있어요."],
  ["재산분할과 위자료는 언제까지 청구하나요?", "재산분할은 이혼한 날부터 2년, 위자료는 손해와 상대를 안 날부터 3년 안이에요."],
  ["양육비를 안 보내면 어떻게 하나요?", "이행명령이나 양육비 직접지급명령을 신청할 수 있어요. 양육비이행관리원 도움도 받을 수 있어요."],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="mt-6 border-t" style={{ borderColor: C.ink }}>
      {FAQ.map(([q, a], i) => {
        const on = open === i;
        return (
          <li key={q} className="border-b" style={{ borderColor: C.line }}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`fl-faq-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className={`flex w-full items-center justify-between gap-4 py-4 text-left text-[17px] font-bold ${focusRing}`}
                style={{ outlineColor: C.accent }}
              >
                {q}
                <ChevronDown size={20} aria-hidden className="flex-none transition-transform duration-200" style={{ transform: on ? "rotate(180deg)" : undefined, color: C.accent }} />
              </button>
            </h3>
            <div id={`fl-faq-${i}`} hidden={!on} className="pb-4 text-[16px] leading-[1.65]" style={{ color: C.muted }}>
              {a}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- 페이지 ---------- */

const HOURS = [
  ["평일", "09:00 ~ 21:00", "18시 이후는 예약 상담"],
  ["토요일", "10:00 ~ 15:00", "예약 상담만"],
  ["일요일, 공휴일", "휴무", ""],
];

const LAWYERS = [
  { name: "김ㅎ늘", role: "대표 변호사", note: "대한변협 등록 전문분야 가사법", cases: "이혼소송, 양육권, 재산분할", photo: `${IMG}/staff-1.jpg` },
  { name: "박ㅅ연", role: "변호사", note: "가사, 상속 사건 담당", cases: "협의이혼, 양육비, 면접교섭", photo: `${IMG}/staff-2.jpg` },
];

export function FamilyLawDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [area, setArea] = useState<Area>("협의이혼");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("fl-booking")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <h2 className="inline-flex items-center gap-2 text-[21px] font-bold leading-none">
          <SampleLogo />
        </h2>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["fl-areas", "업무분야"],
            ["fl-support", "양육비 계산"],
            ["fl-booking", "상담 예약"],
            ["fl-lawyers", "변호사 소개"],
            ["fl-faq", "자주 묻는 질문"],
            ["fl-visit", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.accent }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 약속 세 가지 */}
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <ul className="grid gap-px overflow-hidden rounded-[8px] border sm:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
          {[
            [ShieldCheck, "변호사가 직접 상담", "처음부터 끝까지 같은 변호사가 맡아요."],
            [DoorClosed, "따로 쓰는 출입구", "주차장 쪽 엘리베이터로 상담실에 바로 와요."],
            [PhoneOff, "문자 없이 전화로만", "가족이 볼 수 있는 문자는 보내지 않아요."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Phone;
            return (
              <li key={t as string} className="flex gap-3 p-4 md:p-5" style={{ background: C.alt }}>
                <I size={22} aria-hidden className="mt-[2px] flex-none" style={{ color: C.accent }} />
                <span>
                  <span className="block text-[17px] font-bold">{t as string}</span>
                  <span className="mt-0.5 block text-[15px] leading-[1.5]" style={{ color: C.muted }}>
                    {d as string}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <section id="fl-areas" aria-labelledby="fl-areas-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-areas-title" title="업무분야" />
        <AreaPicker area={area} setArea={setArea} onBook={() => go("fl-booking")} />
      </section>

      <section id="fl-support" aria-labelledby="fl-support-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-support-title" title="양육비 계산" />
        <ChildSupport reduce={reduce} />
      </section>

      <section id="fl-booking" aria-labelledby="fl-booking-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-booking-title" title="비공개 상담 예약" />
        <Booking today={today} reduce={reduce} area={area} setArea={setArea} />
      </section>

      <section id="fl-lawyers" aria-labelledby="fl-lawyers-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-lawyers-title" title="변호사 소개" />
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1.1fr]">
          {LAWYERS.map((l) => (
            <article key={l.name} className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.alt }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={l.photo}
                alt={`${l.role} ${l.name}`}
                width={80}
                height={96}
                loading="lazy"
                className="mb-4 h-24 w-20 rounded-[6px] object-cover"
                style={{ objectPosition: "50% 20%", background: C.line }}
              />
              <p className="text-[14px] font-bold" style={{ color: C.accent }}>
                {l.role}
              </p>
              <h3 className="mt-1 text-[22px] font-bold">
                {l.name} 변호사
              </h3>
              <p className="mt-3 text-[15px]">{l.note}</p>
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                주로 맡는 사건: {l.cases}
              </p>
            </article>
          ))}
          <div className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.alt, color: C.ink }}>
            <h3 className="text-[18px] font-bold">
              상담료
            </h3>
            <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-y-2 text-[15px] tabular-nums">
              {METHODS.map((x) => (
                <div key={x.id} className="contents">
                  <dt>
                    {x.label} {x.mins}분
                  </dt>
                  <dd className="text-right font-bold">{won(x.fee)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              사건을 맡기시면 상담료는 착수금에서 빼 드려요.
            </p>
          </div>
        </div>
      </section>

      <section id="fl-faq" aria-labelledby="fl-faq-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-faq-title" title="자주 묻는 질문" />
        <Faq />
      </section>

      <section id="fl-visit" aria-labelledby="fl-visit-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-visit-title" title="오시는 길" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <dl className="grid content-start gap-x-6 gap-y-3 text-[16px] sm:grid-cols-[110px_minmax(0,1fr)]">
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <MapPin size={17} aria-hidden style={{ color: C.accent }} />
              주소
            </dt>
            <dd>{ADDRESS}</dd>
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <Car size={17} aria-hidden style={{ color: C.accent }} />
              주차
            </dt>
            <dd>건물 뒤편 주차장 2시간 무료, 주차장 쪽 엘리베이터가 7층 상담실로 바로 이어져요.</dd>
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <Phone size={17} aria-hidden style={{ color: C.accent }} />
              전화
            </dt>
            <dd>
              <a href={`tel:${TEL.replace(/-/g, "")}`} className={`underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.accent }}>
                {TEL}
              </a>
              , {KAKAO}
            </dd>
          </dl>
          <table className="w-full border-t text-left text-[16px]" style={{ borderColor: C.ink }}>
            <caption className="sr-only">상담 시간</caption>
            <tbody>
              {HOURS.map(([d, t, n]) => (
                <tr key={d} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-3 pr-3 font-bold">
                    {d}
                  </th>
                  <td className="py-3 tabular-nums">{t}</td>
                  <td className="py-3 text-[14px]" style={{ color: C.muted }}>
                    {n}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p className="text-[16px] font-bold" style={{ color: C.ink }}>
          <SampleLogo size={18} />
        </p>
        <p>
          {ADDRESS} / 전화 {TEL} / {KAKAO}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="border-b pb-3 text-[26px] font-bold tracking-[-0.02em] md:text-[32px]" style={{ ...serifF, borderColor: C.line, color: C.ink }}>
      {title}
    </h2>
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
        <span className="text-[12px] font-semibold opacity-75">법률사무소 샘플</span>
      </span>
    </span>
  );
}
