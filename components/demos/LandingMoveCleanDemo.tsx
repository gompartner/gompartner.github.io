"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Clock, Phone, Users } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 입주·이사 청소 견적 랜딩 데모: 가상의 곰파트너 클린.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 후기는 모두 가상이다.

   크몽 랜딩페이지 고급 패키지("맞춤 기능 랜딩") 범위로 만든다.
   한 쪽짜리 페이지이고 상단 메뉴가 없다. 목적은 하나, 견적을 보고 예약 신청하는 것.
   맞춤 기능 1개: 평수, 집 종류, 옵션을 고르면 금액, 인원, 시간이 바로 나오는 견적 계산기.
   계산기 아래에 평형별 가격표와 옵션 가격을 함께 둔다.
   예약 신청은 실제로 보내지 않고 완료 화면만 보여 준다.

   금액은 수도권 입주청소 업체들이 공개한 평당 단가(1.2만~1.8만 원)와 옵션가를 참고한 가상값이다.

   사진(public/images/demo-landing-move-clean): before·after(같은 거실 청소 전후), kitchen. AI 생성. */

const IMG = "/images/demo-landing-move-clean";
const SHOP = "입주청소";
const TEL = "1600-0000";

const C = {
  ink: "#13161c",
  cobalt: "#1d47d1",
  cobaltDeep: "#12309a",
  cobaltSoft: "#e8edfc",
  lemon: "#ffdf3d",
  lemonSoft: "#fff6c7",
  paper: "#f6f5f0",
  white: "#ffffff",
  muted: "#5a606b",
  line: "#dcdcd4",
  error: "#b42318",
};

const EASE = [0.22, 1, 0.36, 1] as const;

type HomeType = "apt" | "villa" | "officetel";
type OptId = "veranda" | "air" | "mold" | "grout" | "builtin";
type Slot = "am" | "pm";

const TYPES: { id: HomeType; label: string; perPy: number }[] = [
  { id: "apt", label: "아파트", perPy: 13_000 },
  { id: "villa", label: "빌라", perPy: 14_000 },
  { id: "officetel", label: "오피스텔", perPy: 16_000 },
];

const OPTIONS: { id: OptId; label: string; price: (py: number) => number; note: string }[] = [
  { id: "veranda", label: "베란다, 발코니", price: () => 30_000, note: "3만 원" },
  { id: "air", label: "새집증후군 케어", price: (py) => py * 3_000, note: "평당 3천 원" },
  { id: "mold", label: "욕실 곰팡이 제거", price: () => 50_000, note: "5만 원" },
  { id: "grout", label: "줄눈 오염 제거", price: () => 40_000, note: "4만 원" },
  { id: "builtin", label: "붙박이장, 냉장고장 안쪽", price: () => 30_000, note: "3만 원" },
];

const MIN_PRICE = 200_000;

function estimate(type: HomeType, py: number, opts: OptId[], lived: boolean) {
  const base = Math.max(MIN_PRICE, py * TYPES.find((t) => t.id === type)!.perPy);
  const extra = opts.reduce((s, id) => s + OPTIONS.find((o) => o.id === id)!.price(py), 0);
  const raw = (base + extra) * (lived ? 1.2 : 1);
  const total = Math.round(raw / 1000) * 1000;
  const staff = py <= 20 ? 2 : py <= 34 ? 3 : py <= 50 ? 4 : 5;
  const hours = Math.max(3, Math.ceil(((py * 0.55 + opts.length * 0.6) / staff) * (lived ? 1.2 : 1) * 2) / 2);
  return { total, staff, hours };
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const ZONES: Record<string, string[]> = {
  "거실, 방": ["바닥 먼지 흡입 후 물걸레 두 번", "걸레받이, 문틀, 문짝 닦기", "스위치, 콘센트 커버 닦기", "붙박이장 겉면과 선반", "천장 등 커버 먼지 털기"],
  주방: ["싱크볼, 수전 물때 제거", "상부장, 하부장 안쪽 닦기", "후드 필터 기름때 제거", "인덕션, 가스레인지 상판", "타일 벽 실리콘 주변"],
  욕실: ["변기 안쪽, 밑동 닦기", "세면대, 수전 물때 제거", "샤워부스 유리 물자국", "배수구 머리카락, 이물질", "환풍기 커버 먼지"],
  "베란다, 창": ["창틀 레일 먼지와 모래", "창문 유리 안팎 닦기", "방충망 먼지 털기", "베란다 바닥 물청소", "보호 필름, 테이프 자국 제거"],
};

const STEPS = [
  { t: "08:30", h: "도착과 사진 기록", d: "들어가자마자 집 상태를 사진으로 남깁니다. 끝난 뒤 같은 자리에서 다시 찍어 보내 드립니다." },
  { t: "09:00", h: "위에서 아래로", d: "천장 등과 상부장부터 닦고 바닥은 마지막에 합니다. 떨어진 먼지가 다시 쌓이지 않습니다." },
  { t: "점심 전", h: "욕실, 주방 집중", d: "물때와 기름때는 약품을 바르고 기다려야 해서 오전에 먼저 발라 둡니다." },
  { t: "마무리", h: "같이 둘러보기", d: "고객님과 함께 방마다 확인합니다. 바로 그 자리에서 다시 닦습니다." },
];

const REVIEWS = [
  { name: "김ㅎ늘", where: "ㅇㅇ동 신축 아파트 32평", body: "입주 전날이라 시간이 빠듯했는데 창틀 레일 모래까지 다 빼 주셨어요. 견적 화면에서 본 금액 그대로 냈습니다.", ago: 6 },
  { name: "박ㅅ연", where: "빌라 18평, 짐 있는 상태", body: "짐이 있어서 추가 요금 걱정했는데 처음 계산할 때 '짐 있음'을 고르니 미리 반영돼 있었어요.", ago: 13 },
  { name: "이ㅈ민", where: "오피스텔 11평", body: "욕실 줄눈이 누렇게 돼 있었는데 하얗게 돌아왔어요. 끝나고 보내 주신 전후 사진이 제일 좋았습니다.", ago: 21 },
];

const FAQ = [
  { q: "견적 화면에 나온 금액에서 더 받나요?", a: "고르신 조건과 실제 집 상태가 같으면 그 금액 그대로입니다. 평수가 다르거나 고르지 않은 작업을 현장에서 요청하시면 그 부분만 미리 말씀드리고 더합니다." },
  { q: "청소 끝나고 빠진 곳이 보이면요?", a: "48시간 안에 사진과 함께 알려 주시면 다시 방문해 그 부분을 닦습니다. 재방문 비용은 받지 않습니다." },
  { q: "주말이나 공휴일도 되나요?", a: "됩니다. 이사가 몰리는 월말 주말은 일찍 마감되니 날짜가 정해지면 먼저 신청해 주세요." },
  { q: "약품이 아이나 반려동물에게 괜찮나요?", a: "주방, 욕실은 중성 세제 위주로 쓰고, 곰팡이 제거제를 쓴 곳은 환기 시간을 따로 잡습니다. 사용 약품 목록은 신청 후 보내 드립니다." },
  { q: "예약금이 있나요?", a: "날짜를 확정할 때 예약금 5만 원을 받고, 남은 금액은 청소가 끝나고 확인하신 뒤 받습니다. 3일 전까지 취소하면 예약금은 돌려드립니다." },
];

export function LandingMoveCleanDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  // 견적 조건. 계산기와 신청 폼이 같은 값을 쓴다.
  const [type, setType] = useState<HomeType>("apt");
  const [py, setPy] = useState(32);
  const [opts, setOpts] = useState<OptId[]>(["veranda"]);
  const [lived, setLived] = useState(false);
  const est = useMemo(() => estimate(type, py, opts, lived), [type, py, opts, lived]);

  const heroRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const toggleOpt = (id: OptId) => setOpts((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const goApply = () => document.getElementById("mc-apply")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen pb-28" style={{ background: C.paper, color: C.ink }}>
      {/* 로고만 있는 머리. 메뉴를 두지 않는다. */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6">
          <span className="inline-flex items-center gap-2 text-white">
            <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[22px] font-extrabold tracking-[-0.03em]">입주청소</span>
            </span>
          </span>
          <a href={`tel:${TEL}`} className="inline-flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-[15px] font-bold" style={{ background: C.lemon, color: C.ink }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
        </div>
      </header>

      {/* 1. 첫 화면: 바로 계산기 */}
      <section ref={heroRef} className="relative overflow-hidden pb-14 pt-24 md:pb-20 md:pt-28" style={{ background: C.cobalt, color: C.white }}>
        <div className="relative mx-auto grid max-w-[1200px] gap-10 px-4 md:grid-cols-[1fr_520px] md:px-6">
          <div className="md:pt-6">
            <p className="inline-block rounded-[4px] px-2 py-1 text-[15px] font-bold" style={{ background: C.lemon, color: C.ink }}>
              입주청소, 이사청소
            </p>
            <h1 className="mt-5 text-[40px] font-extrabold leading-[1.15] tracking-[-0.04em] md:text-[64px]">
              평수만 넣으면
              <br />
              금액이 나옵니다
            </h1>
            <p className="mt-5 max-w-[440px] text-[17px] leading-[1.7] opacity-90">
              전화로 물어보지 않아도 됩니다. 집 종류와 평수, 필요한 작업을 고르면 그 자리에서 금액과 작업 인원, 걸리는 시간이 나옵니다.
            </p>
            <ul className="mt-8 grid gap-3 text-[17px] font-semibold">
              {["계산한 금액 그대로 받습니다", "48시간 안에 다시 와서 닦습니다", "끝나면 전후 사진을 보내 드립니다"].map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-[4px]" style={{ background: C.lemon, color: C.ink }}>
                    <Check size={18} strokeWidth={3} aria-hidden />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <Calculator
            type={type}
            setType={setType}
            py={py}
            setPy={setPy}
            opts={opts}
            toggleOpt={toggleOpt}
            lived={lived}
            setLived={setLived}
            est={est}
            onApply={goApply}
          />
        </div>
      </section>

      {/* 2. 청소 전후 */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionHead title="같은 거실, 청소 전과 후" desc="공사 먼지와 보호 필름이 남은 신축 거실입니다." />
          <BeforeAfter />
        </div>
      </section>

      {/* 평형별 가격표 */}
      <section className="px-4 pb-16 md:px-6 md:pb-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionHead title="평형별 가격" desc="빈집 기준 금액입니다. 짐이 있으면 20%가 더해집니다." />
          <PriceTable />
        </div>
      </section>

      {/* 3. 구역별 체크리스트 */}
      <section className="px-4 py-16 md:px-6 md:py-24" style={{ background: C.white }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <SectionHead title="구역마다 닦는 곳을 정해 두었습니다" desc="작업자가 바뀌어도 빠지는 곳이 없도록 같은 표를 들고 들어갑니다." />
            <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-[10px]">
              <Image src={`${IMG}/kitchen.jpg`} alt="청소를 마친 주방 싱크대와 상판" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" style={{ background: C.cobaltSoft }} />
            </div>
          </div>
          <Checklist reduce={reduce} />
        </div>
      </section>

      {/* 4. 작업 순서 */}
      <section className="px-4 py-16 md:px-6 md:py-24" style={{ background: C.ink, color: C.white }}>
        <div className="mx-auto max-w-[1200px]">
          <SectionHead title="청소 당일은 이렇게 진행합니다" dark />
          <ol className="grid gap-px overflow-hidden rounded-[10px] md:grid-cols-4" style={{ background: "rgba(255,255,255,0.15)" }}>
            {STEPS.map((s, i) => (
              <li key={s.h} className="p-6" style={{ background: C.ink }}>
                <p className="text-[15px] font-bold" style={{ color: C.lemon }}>
                  {i + 1}. {s.t}
                </p>
                <h3 className="mt-3 text-[22px] font-extrabold">{s.h}</h3>
                <p className="mt-3 text-[16px] leading-[1.7] opacity-80">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. 후기 */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionHead title="맡겨 보신 분들 이야기" />
          <div className="grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="rounded-[10px] border p-6" style={{ background: C.white, borderColor: C.line }}>
                <blockquote className="text-[17px] leading-[1.7]">{r.body}</blockquote>
                <figcaption className="mt-5 border-t pt-4 text-[15px]" style={{ borderColor: C.line, color: C.muted }}>
                  <strong style={{ color: C.ink }}>{r.name}</strong> 님, {r.where}, {fmtKo(daysAgo(today, r.ago))}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 보증 */}
      <section className="px-4 pb-16 md:px-6 md:pb-24">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[10px] p-8" style={{ background: C.lemon }}>
            <p className="text-[56px] font-extrabold leading-none tracking-[-0.04em] md:text-[72px]">48시간</p>
            <p className="mt-4 text-[20px] font-bold">안에 알려 주시면 다시 갑니다</p>
            <p className="mt-2 text-[16px] leading-[1.7]">빠진 곳을 사진으로 보내 주시면 날짜를 잡아 그 부분을 다시 닦습니다. 재방문 비용은 없습니다.</p>
          </div>
          <div className="rounded-[10px] p-8" style={{ background: C.cobalt, color: C.white }}>
            <p className="text-[56px] font-extrabold leading-none tracking-[-0.04em] md:text-[72px]">0원</p>
            <p className="mt-4 text-[20px] font-bold">현장에서 붙는 추가 요금</p>
            <p className="mt-2 text-[16px] leading-[1.7] opacity-90">계산기에서 고른 조건과 집 상태가 같으면 계산한 금액 그대로 받습니다. 달라지는 부분은 작업 전에 먼저 말씀드립니다.</p>
          </div>
        </div>
      </section>

      {/* 7. 자주 묻는 질문 */}
      <section className="px-4 py-16 md:px-6 md:py-24" style={{ background: C.white }}>
        <div className="mx-auto max-w-[820px]">
          <SectionHead title="자주 묻는 질문" />
          <div className="divide-y border-y" style={{ borderColor: C.line }}>
            {FAQ.map((f) => (
              <details key={f.q} className="group py-1" style={{ borderColor: C.line }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[18px] font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown size={20} className="flex-none transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="pb-5 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 예약 신청 */}
      <section id="mc-apply" className="scroll-mt-4 px-4 py-16 md:px-6 md:py-24" style={{ background: C.cobaltSoft }}>
        <div className="mx-auto max-w-[820px]">
          <SectionHead title="이 조건으로 예약 신청" desc="날짜와 연락처만 더 적어 주세요. 확인 전화를 드린 뒤 예약이 확정됩니다." />
          <ApplyForm today={today} type={type} py={py} opts={opts} lived={lived} est={est} reduce={reduce} />
        </div>
      </section>

      <footer className="px-4 py-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.ink, color: "rgba(255,255,255,0.7)" }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[16px] font-bold text-white">{SHOP}</p>
          <DemoMakerInfo className="mt-1" />
        </div>
      </footer>

      {/* 첫 화면을 지나면 아래에 현재 견적과 신청 버튼을 띄운다. 왼쪽 아래 데모 안내 버튼과 겹치지 않게 위로 올린다. */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-x-0 z-40 px-4 print:hidden"
            style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div
              className="mx-auto flex max-w-[560px] items-center justify-between gap-3 rounded-[12px] px-4 py-3 shadow-[0_10px_30px_rgba(19,22,28,0.25)]"
              style={{ background: C.ink, color: C.white }}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] opacity-70">
                  {TYPES.find((t) => t.id === type)!.label} {py}평{opts.length > 0 ? `, 옵션 ${opts.length}개` : ""}
                </p>
                <p className="text-[20px] font-extrabold tabular-nums">{won(est.total)}</p>
              </div>
              <button type="button" onClick={goApply} className="flex-none rounded-[6px] px-5 py-3 text-[16px] font-extrabold" style={{ background: C.lemon, color: C.ink }}>
                신청하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHead({ title, desc, dark }: { title: string; desc?: string; dark?: boolean }) {
  return (
    <div className="mb-8 md:mb-10">
      <h2 className="text-[30px] font-extrabold leading-[1.25] tracking-[-0.03em] md:text-[40px]">{title}</h2>
      {desc && (
        <p className="mt-3 max-w-[560px] text-[17px] leading-[1.7]" style={{ color: dark ? "rgba(255,255,255,0.8)" : C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

type Est = ReturnType<typeof estimate>;

function Calculator(p: {
  type: HomeType;
  setType: (t: HomeType) => void;
  py: number;
  setPy: (n: number) => void;
  opts: OptId[];
  toggleOpt: (id: OptId) => void;
  lived: boolean;
  setLived: (b: boolean) => void;
  est: Est;
  onApply: () => void;
}) {
  return (
    <div className="rounded-[12px] p-5 shadow-[0_20px_50px_rgba(10,20,60,0.35)] md:p-7" style={{ background: C.white, color: C.ink }}>
      <p className="text-[20px] font-extrabold">견적 계산</p>

      <fieldset className="mt-5">
        <legend className="text-[15px] font-bold">집 종류</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TYPES.map((t) => {
            const sel = p.type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={sel}
                onClick={() => p.setType(t.id)}
                className="rounded-[6px] border-2 py-2.5 text-[16px] font-bold"
                style={{ borderColor: sel ? C.cobalt : C.line, background: sel ? C.cobalt : C.white, color: sel ? C.white : C.ink }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label htmlFor="mc-py" className="text-[15px] font-bold">
            평수 (분양 평형)
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={8}
              max={70}
              value={p.py}
              onChange={(e) => p.setPy(Math.min(70, Math.max(8, Number(e.target.value) || 8)))}
              className="w-16 rounded-[6px] border px-2 py-1 text-right text-[17px] font-extrabold tabular-nums"
              style={{ borderColor: C.line }}
              aria-label="평수 직접 입력"
            />
            <span className="text-[15px] font-bold">평</span>
          </div>
        </div>
        <input id="mc-py" type="range" min={8} max={70} value={p.py} onChange={(e) => p.setPy(Number(e.target.value))} className="mt-3 w-full accent-[#1d47d1]" />
      </div>

      <fieldset className="mt-5">
        <legend className="text-[15px] font-bold">더할 작업</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {OPTIONS.map((o) => {
            const sel = p.opts.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={sel}
                onClick={() => p.toggleOpt(o.id)}
                className="inline-flex items-center gap-1.5 rounded-[6px] border-2 px-3 py-2 text-[15px] font-semibold"
                style={{ borderColor: sel ? C.ink : C.line, background: sel ? C.lemon : C.white }}
              >
                {sel && <Check size={15} strokeWidth={3} aria-hidden />}
                {o.label}
                <span className="text-[13px] font-normal" style={{ color: C.muted }}>
                  {o.note}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-[15px] font-semibold">
        <input type="checkbox" checked={p.lived} onChange={(e) => p.setLived(e.target.checked)} className="h-5 w-5 accent-[#1d47d1]" />
        짐이 있는 상태 (이사 청소, 20% 추가)
      </label>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t-2 pt-4" style={{ borderColor: C.ink }}>
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            예상 금액
          </p>
          <p className="text-[36px] font-extrabold leading-tight tracking-[-0.03em] tabular-nums" aria-live="polite">
            {won(p.est.total)}
          </p>
        </div>
        <div className="flex gap-4 text-[15px] font-bold">
          <span className="inline-flex items-center gap-1">
            <Users size={17} aria-hidden /> {p.est.staff}명
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={17} aria-hidden /> 약 {p.est.hours}시간
          </span>
        </div>
      </div>
      <button type="button" onClick={p.onApply} className="mt-4 w-full rounded-[8px] py-4 text-[18px] font-extrabold" style={{ background: C.cobalt, color: C.white }}>
        이 조건으로 예약 신청
      </button>
    </div>
  );
}

function BeforeAfter() {
  const shots = [
    { src: "before", label: "청소 전", alt: "청소 전 거실: 공사 먼지와 보호 필름", tag: { background: C.ink, color: C.white } },
    { src: "after", label: "청소 후", alt: "청소 후 거실: 먼지 없는 바닥과 맑은 창", tag: { background: C.lemon, color: C.ink } },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {shots.map((x) => (
        <figure key={x.src} className="relative aspect-[4/3] overflow-hidden rounded-[12px] border-2" style={{ borderColor: C.ink, background: C.line }}>
          <Image src={`${IMG}/${x.src}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover" />
          <figcaption className="absolute left-3 top-3 rounded-[4px] px-2 py-1 text-[14px] font-bold" style={x.tag}>
            {x.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

const PRICE_ROWS = [10, 18, 24, 32, 40, 50];

function PriceTable() {
  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-start">
      <div className="overflow-x-auto rounded-[12px] border-2" style={{ borderColor: C.ink, background: C.white }}>
        <ul className="md:hidden" aria-label="평형별 아파트 금액">
          {PRICE_ROWS.map((py) => {
            const e = estimate("apt", py, [], false);
            return (
              <li key={`m${py}`} className="border-t px-4 py-3 first:border-t-0" style={{ borderColor: C.line }}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold">{py}평</span>
                  <span className="whitespace-nowrap">
                    <span className="mr-1.5 text-[14px]" style={{ color: C.muted }}>
                      아파트
                    </span>
                    <span className="font-extrabold tabular-nums">{won(e.total)}</span>
                  </span>
                </div>
                <p className="mt-0.5 text-[14px]" style={{ color: C.muted }}>
                  {e.staff}명, 약 {e.hours}시간
                </p>
              </li>
            );
          })}
        </ul>
        <table className="hidden w-full min-w-[340px] text-left text-[16px] md:table">
          <thead style={{ background: C.ink, color: C.white }}>
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">평형</th>
              <th scope="col" className="px-4 py-3 font-bold">인원</th>
              <th scope="col" className="px-4 py-3 font-bold">시간</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">아파트</th>
            </tr>
          </thead>
          <tbody>
            {PRICE_ROWS.map((py) => {
              const e = estimate("apt", py, [], false);
              return (
                <tr key={py} className="border-t" style={{ borderColor: C.line }}>
                  <th scope="row" className="px-4 py-3 font-bold">{py}평</th>
                  <td className="px-4 py-3">{e.staff}명</td>
                  <td className="px-4 py-3">약 {e.hours}시간</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-extrabold tabular-nums">{won(e.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="border-t px-4 py-3 text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
          빌라는 평당 14,000원, 오피스텔은 평당 16,000원, 최소 {won(MIN_PRICE)}
        </p>
      </div>
      <div className="rounded-[12px] border-2 p-5" style={{ borderColor: C.ink, background: C.white }}>
        <p className="text-[17px] font-extrabold">추가 작업</p>
        <ul className="mt-3">
          {OPTIONS.map((o) => (
            <li key={o.id} className="flex justify-between gap-4 border-b py-3 text-[16px] last:border-b-0" style={{ borderColor: C.line }}>
              <span>{o.label}</span>
              <span className="shrink-0 font-bold">{o.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Checklist({ reduce }: { reduce: boolean }) {
  const names = Object.keys(ZONES);
  const [zone, setZone] = useState(names[0]);
  return (
    <div className="rounded-[12px] border-2 p-5 md:p-7" style={{ borderColor: C.ink, background: C.paper }}>
      <div role="tablist" aria-label="구역" className="flex flex-wrap gap-2">
        {names.map((n) => {
          const sel = n === zone;
          return (
            <button
              key={n}
              role="tab"
              aria-selected={sel}
              type="button"
              onClick={() => setZone(n)}
              className="rounded-[6px] px-4 py-2 text-[16px] font-bold"
              style={{ background: sel ? C.ink : C.white, color: sel ? C.white : C.ink, border: `2px solid ${C.ink}` }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={zone}
          role="tabpanel"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="mt-6 grid gap-1"
        >
          {ZONES[zone].map((item, i) => (
            <li key={item} className="flex items-center gap-4 border-b py-3.5 text-[18px] font-semibold last:border-b-0" style={{ borderColor: C.line }}>
              <span className="w-7 text-[15px] font-extrabold tabular-nums" style={{ color: C.cobalt }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">{item}</span>
              <span className="grid h-6 w-6 place-items-center rounded-[4px]" style={{ background: C.cobalt, color: C.white }}>
                <Check size={16} strokeWidth={3} aria-hidden />
              </span>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

function ApplyForm(p: { today: Date; type: HomeType; py: number; opts: OptId[]; lived: boolean; est: Est; reduce: boolean }) {
  const [date, setDate] = useState<number | null>(null);
  const [slot, setSlot] = useState<Slot>("am");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ no: string; date: Date } | null>(null);

  // 오늘부터 3일 뒤 ~ 16일 뒤. 월말 주말은 마감으로 보여 준다.
  const days = Array.from({ length: 14 }, (_, i) => daysAgo(p.today, -(i + 3)));
  const full = (d: Date) => (d.getDay() === 6 || d.getDay() === 0) && d.getDate() >= 24;

  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    date: date === null ? "날짜를 골라 주세요" : "",
    name: name.trim() ? "" : "이름을 적어 주세요",
    phone: phoneOk ? "" : "휴대폰 번호를 확인해 주세요",
    addr: addr.trim() ? "" : "아파트 이름이나 동까지 적어 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || date === null) return;
    const d = days[date];
    const ymd = `${String(p.today.getFullYear()).slice(2)}${String(p.today.getMonth() + 1).padStart(2, "0")}${String(p.today.getDate()).padStart(2, "0")}`;
    setDone({ no: `MC-${ymd}-0${(p.py * 7 + p.opts.length * 13) % 90 + 10}`, date: d });
  };

  const typeLabel = TYPES.find((t) => t.id === p.type)!.label;
  const optLabels = p.opts.map((id) => OPTIONS.find((o) => o.id === id)!.label);

  if (done) {
    return (
      <motion.div
        initial={p.reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="rounded-[12px] border-2 p-6 md:p-8"
        style={{ background: C.white, borderColor: C.ink }}
        role="status"
      >
        <p className="inline-block rounded-[4px] px-2 py-1 text-[15px] font-bold" style={{ background: C.lemon }}>
          신청이 접수되었습니다
        </p>
        <p className="mt-4 text-[28px] font-extrabold tabular-nums">{done.no}</p>
        <dl className="mt-5 grid gap-2 text-[16px] md:grid-cols-[120px_1fr]">
          <dt className="font-bold" style={{ color: C.muted }}>
            희망 날짜
          </dt>
          <dd>
            {fmtKo(done.date)} {slot === "am" ? "오전 8시 30분" : "오후 1시"} 시작
          </dd>
          <dt className="font-bold" style={{ color: C.muted }}>
            견적
          </dt>
          <dd>
            {typeLabel} {p.py}평, {won(p.est.total)}
          </dd>
          <dt className="font-bold" style={{ color: C.muted }}>
            확인 전화
          </dt>
          <dd>{fmtKo(daysAgo(p.today, -1))} 오후 6시 전까지 {TEL}로 전화드립니다</dd>
          <dt className="font-bold" style={{ color: C.muted }}>
            담당
          </dt>
          <dd>예약 담당 정ㅁ석 실장</dd>
        </dl>
      </motion.div>
    );
  }

  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-semibold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;
  const inputCls = "mt-2 w-full rounded-[6px] border-2 px-3 py-3 text-[17px]";

  return (
    <form onSubmit={submit} noValidate className="rounded-[12px] border-2 p-5 md:p-8" style={{ background: C.white, borderColor: C.ink }}>
      <div className="rounded-[8px] p-4" style={{ background: C.lemonSoft }}>
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          계산한 조건
        </p>
        <p className="mt-1 text-[18px] font-extrabold">
          {typeLabel} {p.py}평{p.lived ? ", 짐 있음" : ""}, {won(p.est.total)}
        </p>
        <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
          {optLabels.length ? optLabels.join(", ") : "더할 작업 없음"}, {p.est.staff}명, 약 {p.est.hours}시간
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="text-[16px] font-bold">희망 날짜</legend>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {days.map((d, i) => {
            const closed = full(d);
            const sel = date === i;
            return (
              <button
                key={i}
                type="button"
                disabled={closed}
                aria-pressed={sel}
                onClick={() => setDate(i)}
                className="rounded-[6px] border-2 py-2 text-center text-[15px] font-bold disabled:cursor-not-allowed"
                style={{
                  borderColor: sel ? C.cobalt : C.line,
                  background: sel ? C.cobalt : closed ? C.paper : C.white,
                  color: sel ? C.white : closed ? "#9aa0a8" : d.getDay() === 0 ? C.error : C.ink,
                }}
              >
                <span className="block">
                  {d.getMonth() + 1}.{d.getDate()}
                </span>
                <span className="block text-[13px] font-semibold">{closed ? "마감" : ["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}</span>
              </button>
            );
          })}
        </div>
        {err("date")}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-[16px] font-bold">시작 시간</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              ["am", "오전 8시 30분"],
              ["pm", "오후 1시"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={slot === v}
              onClick={() => setSlot(v)}
              className="rounded-[6px] border-2 py-3 text-[16px] font-bold"
              style={{ borderColor: slot === v ? C.cobalt : C.line, background: slot === v ? C.cobaltSoft : C.white }}
            >
              {l}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block text-[16px] font-bold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={{ borderColor: C.line }} autoComplete="name" />
          {err("name")}
        </label>
        <label className="block text-[16px] font-bold">
          휴대폰 번호
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-0000-0000" className={inputCls} style={{ borderColor: C.line }} autoComplete="tel" />
          {err("phone")}
        </label>
      </div>
      <label className="mt-5 block text-[16px] font-bold">
        청소할 곳
        <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="예: ㅇㅇ동 ㅎㅇ아파트 103동" className={inputCls} style={{ borderColor: C.line }} />
        {err("addr")}
      </label>

      <label className="mt-6 flex cursor-pointer items-start gap-2 text-[15px]">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[#1d47d1]" />
        <span>
          예약 확인 전화를 위해 이름, 휴대폰 번호, 주소를 받고 청소가 끝나면 3개월 뒤 지웁니다. 동의합니다.
        </span>
      </label>
      {err("agree")}

      <button type="submit" className="mt-6 w-full rounded-[8px] py-4 text-[18px] font-extrabold" style={{ background: C.cobalt, color: C.white }}>
        {won(p.est.total)}으로 예약 신청
      </button>
      <p className="mt-3 text-center text-[14px]" style={{ color: C.muted }}>
        신청 후 확인 전화를 드리고, 예약금 5만 원을 받으면 날짜가 확정됩니다.
      </p>
    </form>
  );
}
