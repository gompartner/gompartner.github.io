"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { LeadReceivedPanel, type LeadRow } from "@/components/demos/LeadReceivedPanel";
import { fmtKo, useDemoToday } from "@/hooks/useDemoToday";

/* 랜딩페이지 데모(기본 패키지 예시): 가상의 곰파트너 렌탈 정수기·공기청정기 상담 신청.
   상호, 제품 이름, 렌탈료, 혜택은 모두 가상이다.

   광고를 보고 들어온 사람이 상담 신청을 남기게 하는 것이 목적 하나다.
   머리글 메뉴가 없고, 월 렌탈료와 신청 폼까지 한 줄로 내려간다.
   모티프는 물방울과 필터 단면(겹겹의 고리).

   상호작용
   1. 첫 화면 제품 고르기: 고른 제품이 신청 폼에 그대로 들어가고 폼으로 내려간다.
   2. 제품 비교: 의무 사용 기간(3년, 5년)을 바꾸면 월 렌탈료가 바뀐다.
   3. 필터 단면: 고리를 누르면 그 층이 걸러 내는 것을 보여 준다.
   4. 상담 신청 폼과 완료 화면(접수 번호, 전화 예정 시간).
   5. 아래 고정 상담 신청 바: 첫 화면을 지나면 뜨고, 폼이 보이면 숨는다.

   사진(public/images/demo-landing-water-rental): hero (원본 03_Resource/ai-image/output/렌탈-첫화면-21350.png) */

const IMG = "/images/demo-landing-water-rental";

const C = {
  sea: "#005f6b",
  seaDeep: "#00434c",
  mist: "#e6f3f3",
  foam: "#f5f9f9",
  ink: "#10201f",
  muted: "#4c5d5e",
  line: "#cfe1e1",
  sun: "#ffd447",
  white: "#ffffff",
};

type ProductId = "direct" | "hotcold" | "air";
type Term = 3 | 5;

const PRODUCTS: {
  id: ProductId;
  name: string;
  short: string;
  kind: string;
  price: Record<Term, number>;
  visit: string;
  points: string[];
}[] = [
  {
    id: "direct",
    name: "직수 정수기 S",
    short: "정수기",
    kind: "정수·냉수",
    price: { 3: 25900, 5: 21900 },
    visit: "4개월마다 방문",
    points: ["물통 없이 바로 나오는 직수형", "폭 17cm, 싱크대 옆에 들어가는 크기"],
  },
  {
    id: "hotcold",
    name: "냉온정수기 M",
    short: "냉온정수기",
    kind: "정수·냉수·온수",
    price: { 3: 32900, 5: 27900 },
    visit: "4개월마다 방문",
    points: ["온수 잠금 버튼", "40·70·85도 온수 온도 선택"],
  },
  {
    id: "air",
    name: "공기청정기 A",
    short: "공기청정기",
    kind: "거실용 30평형",
    price: { 3: 24900, 5: 19900 },
    visit: "6개월마다 방문",
    points: ["필터 교체를 방문해서 해 드립니다", "미세먼지 농도를 숫자로 표시"],
  },
];

const won = (n: number) => n.toLocaleString("ko-KR");
const MIN_PRICE = Math.min(...PRODUCTS.map((p) => p.price[5]));

const LAYERS = [
  { id: 1, name: "세디먼트 필터", catch: "녹, 모래처럼 눈에 보이는 큰 알갱이", ring: "#9fd3d6" },
  { id: 2, name: "카본 필터", catch: "수돗물 소독 냄새(잔류 염소)와 맛을 흐리는 성분", ring: "#4fa8ae" },
  { id: 3, name: "UF 필터", catch: "머리카락 굵기의 수백분의 일 크기 미세 입자", ring: "#00838f" },
] as const;

const CALL_TIMES = ["오전 9~12시", "오후 12~6시", "저녁 6~8시"] as const;

/* 김하늘 → 김ㅎ늘: 가운데 글자를 초성으로 바꾼다 */
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function maskName(name: string) {
  const s = name.trim();
  if (s.length < 2) return s;
  const ch = s.charCodeAt(1);
  const cho = ch >= 0xac00 && ch <= 0xd7a3 ? CHO[Math.floor((ch - 0xac00) / 588)] : "*";
  return s[0] + cho + s.slice(2);
}

export function LandingWaterRentalDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [picked, setPicked] = useState<ProductId[]>(["direct"]);
  const [term, setTerm] = useState<Term>(5);

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const h = heroRef.current;
    const f = formRef.current;
    if (!h || !f) return;
    const io1 = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0 });
    const io2 = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.15 });
    io1.observe(h);
    io2.observe(f);
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const goForm = () => formRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen" style={{ background: C.foam, color: C.ink }}>
      <Hero heroRef={heroRef} picked={picked} setPicked={setPicked} onApply={goForm} />
      <Compare term={term} setTerm={setTerm} onPick={(id) => { setPicked([id]); goForm(); }} />
      <Benefits today={today} />
      <Care />
      <ApplyForm formRef={formRef} today={today} picked={picked} setPicked={setPicked} term={term} />
      <Footer />
      <StickyBar show={!heroVisible && !formVisible} onApply={goForm} reduce={reduce} />
    </div>
  );
}

/* ---------- 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? C.white : C.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="" aria-hidden width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
      <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[22px] font-extrabold tracking-[-0.03em]">곰파트너</span>
        <span className="text-[14px] font-semibold opacity-80">렌탈</span>
      </span>
    </span>
  );
}

/* ---------- 첫 화면 ---------- */

function Hero({
  heroRef,
  picked,
  setPicked,
  onApply,
}: {
  heroRef: React.RefObject<HTMLDivElement | null>;
  picked: ProductId[];
  setPicked: (v: ProductId[]) => void;
  onApply: () => void;
}) {
  return (
    <section ref={heroRef} aria-labelledby="wr-hero-title" className="relative overflow-hidden" style={{ background: C.sea, color: C.white }}>
      <Rings className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] opacity-[0.18]" />
      <div className="relative mx-auto max-w-[1120px] px-5 pb-14 pt-5 md:px-8 md:pb-20">
        <Logo light />
        <div className="mt-8 grid items-center gap-10 md:mt-12 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.sun, color: C.ink }}>
              설치비 0원 · 이번 달 신청
            </p>
            <h1 id="wr-hero-title" className="mt-5 text-[40px] font-black leading-[1.12] tracking-[-0.04em] md:text-[64px]">
              정수기 렌탈
              <br />
              월 <span className="tabular-nums">{won(MIN_PRICE)}</span>원부터
            </h1>
            <p className="mt-5 max-w-[30em] text-[17px] leading-[1.7] opacity-90">
              4개월마다 방문해서 필터를 갈아 드립니다. 상담 신청을 남기시면 오늘 안에 전화로 제품과 설치 날짜를 안내해 드려요.
            </p>

            <div className="mt-8 rounded-[14px] p-4 md:p-5" style={{ background: C.white, color: C.ink }}>
              <p className="text-[15px] font-bold">어떤 제품이 궁금하세요?</p>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="관심 제품">
                {PRODUCTS.map((p) => {
                  const on = picked.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPicked(on ? picked.filter((x) => x !== p.id) : [...picked, p.id])}
                      className="inline-flex h-11 items-center gap-1.5 rounded-full border-2 px-4 text-[15px] font-bold transition-colors"
                      style={on ? { background: C.sea, borderColor: C.sea, color: C.white } : { borderColor: C.line, color: C.ink }}
                    >
                      {on && <Check size={16} strokeWidth={3} aria-hidden />}
                      {p.short}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={onApply}
                className="mt-4 flex h-14 w-full items-center justify-center rounded-[10px] text-[18px] font-extrabold"
                style={{ background: C.sun, color: C.ink }}
              >
                무료 상담 신청하기
              </button>
            </div>
          </div>

          <Drop src={`${IMG}/hero.jpg`} alt="싱크대 옆에 놓인 흰색 직수 정수기" />
        </div>
      </div>
    </section>
  );
}

/* 물방울 모양 사진. 꼭지가 위를 향한다. */
function Drop({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mx-auto w-full max-w-[400px] px-6 md:px-0">
      <div className="relative aspect-square w-full rotate-45 overflow-hidden" style={{ borderRadius: "0 50% 50% 50%", boxShadow: `0 0 0 10px ${C.seaDeep}` }}>
        <div className="absolute inset-[-21%] -rotate-45">
          <Image src={src} alt={alt} fill sizes="(min-width: 768px) 520px, 90vw" className="object-cover" priority />
        </div>
      </div>
    </div>
  );
}

/* 필터 단면을 닮은 겹 고리 */
function Rings({ className, active }: { className?: string; active?: number }) {
  const rs = [96, 72, 48];
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      {rs.map((r, i) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill={active === undefined ? "none" : LAYERS[i].ring}
          stroke={active === undefined ? "#ffffff" : C.white}
          strokeWidth={active === undefined ? 10 : 3}
          opacity={active === undefined || active === i + 1 ? 1 : 0.28}
        />
      ))}
      <circle cx="100" cy="100" r="22" fill={active === undefined ? "none" : C.white} stroke={active === undefined ? "#ffffff" : C.sea} strokeWidth="4" />
    </svg>
  );
}

/* ---------- 제품 비교 ---------- */

function Compare({ term, setTerm, onPick }: { term: Term; setTerm: (t: Term) => void; onPick: (id: ProductId) => void }) {
  return (
    <section aria-labelledby="wr-compare-title" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="wr-compare-title" className="text-[32px] font-black leading-[1.2] tracking-[-0.03em] md:text-[44px]">
            제품 3가지
          </h2>
          <div className="inline-flex rounded-full p-1" style={{ background: C.mist }} role="radiogroup" aria-label="의무 사용 기간">
            {([3, 5] as Term[]).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={term === t}
                onClick={() => setTerm(t)}
                className="h-10 rounded-full px-5 text-[15px] font-bold transition-colors"
                style={term === t ? { background: C.sea, color: C.white } : { color: C.muted }}
              >
                {t}년 사용
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
          의무 사용 기간이 길수록 월 렌탈료가 내려갑니다. 기간 안에 해지하면 남은 기간에 따라 위약금이 있어요.
        </p>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <li key={p.id} className="flex flex-col rounded-[16px] border-2 bg-white p-6" style={{ borderColor: C.line }}>
              <p className="text-[14px] font-bold" style={{ color: C.sea }}>
                {p.kind}
              </p>
              <h3 className="mt-1 text-[22px] font-extrabold tracking-[-0.02em]">{p.name}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-[15px] font-bold">월</span>
                <span className="text-[40px] font-black leading-none tracking-[-0.03em] tabular-nums">{won(p.price[term])}</span>
                <span className="text-[15px] font-bold">원</span>
              </p>
              <dl className="mt-5 space-y-2 border-t pt-4 text-[15px]" style={{ borderColor: C.line }}>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: C.muted }}>의무 사용</dt>
                  <dd className="font-bold">{term}년</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: C.muted }}>관리</dt>
                  <dd className="font-bold">{p.visit}</dd>
                </div>
              </dl>
              <ul className="mb-auto mt-4 space-y-1.5 text-[15px] leading-[1.6]">
                {p.points.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check size={18} strokeWidth={3} className="mt-[3px] shrink-0" style={{ color: C.sea }} aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onPick(p.id)}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-[10px] border-2 text-[16px] font-bold"
                style={{ borderColor: C.sea, color: C.sea }}
              >
                이 제품으로 상담 신청
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          표시 금액은 제휴 카드 할인을 넣지 않은 금액입니다.
        </p>
      </div>
    </section>
  );
}

/* ---------- 이번 달 혜택 ---------- */

function Benefits({ today }: { today: Date }) {
  const month = today.getMonth() + 1;
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const items = [
    { big: "0원", title: "설치비", desc: "원래 3만 원인 설치비를 받지 않습니다." },
    { big: "1달", title: "첫 달 렌탈료 면제", desc: "설치한 달은 렌탈료가 나가지 않아요." },
    { big: "2,000원", title: "2대 함께 쓰면", desc: "정수기와 공기청정기를 같이 쓰면 매달 2,000원씩 빼 드립니다." },
  ];
  return (
    <section aria-labelledby="wr-benefit-title" className="px-5 py-16 md:px-8 md:py-24" style={{ background: C.mist }}>
      <div className="mx-auto max-w-[1120px]">
        <h2 id="wr-benefit-title" className="text-[32px] font-black leading-[1.2] tracking-[-0.03em] md:text-[44px]">
          {month}월에 신청하면
        </h2>
        <p className="mt-3 text-[16px]" style={{ color: C.muted }}>
          {month}월 {last}일까지 상담 신청한 분께 드립니다.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((b) => (
            <li key={b.title} className="relative overflow-hidden rounded-[16px] p-6" style={{ background: C.sea, color: C.white }}>
              <DropMark className="absolute -bottom-6 -right-4 h-32 w-24 opacity-20" />
              <p className="text-[16px] font-bold opacity-90">{b.title}</p>
              <p className="mt-2 text-[44px] font-black leading-none tracking-[-0.03em]" style={{ color: C.sun }}>
                {b.big}
              </p>
              <p className="relative mt-4 text-[15px] leading-[1.6] opacity-90">{b.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DropMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} aria-hidden>
      <path d="M30 2C30 2 4 34 4 52a26 26 0 0 0 52 0C56 34 30 2 30 2Z" fill="#ffffff" />
    </svg>
  );
}

/* ---------- 관리 방식 ---------- */

function Care() {
  const [layer, setLayer] = useState<number>(1);
  const cur = LAYERS[layer - 1];
  return (
    <section aria-labelledby="wr-care-title" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1120px]">
        <h2 id="wr-care-title" className="text-[32px] font-black leading-[1.2] tracking-[-0.03em] md:text-[44px]">
          필터는 3겹,
          <br />
          교체는 방문해서
        </h2>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-[320px_1fr] md:gap-14">
          <div className="mx-auto w-full max-w-[300px]">
            <Rings className="w-full" active={layer} />
          </div>
          <div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="필터 층">
              {LAYERS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={layer === l.id}
                  onClick={() => setLayer(l.id)}
                  className="h-11 rounded-full border-2 px-4 text-[15px] font-bold"
                  style={layer === l.id ? { background: C.sea, borderColor: C.sea, color: C.white } : { borderColor: C.line }}
                >
                  {l.id}겹 {l.name}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-[14px] border-2 bg-white p-6" style={{ borderColor: C.line }} role="tabpanel">
              <p className="text-[14px] font-bold" style={{ color: C.sea }}>
                {cur.id}겹째에서 거르는 것
              </p>
              <p className="mt-2 text-[22px] font-extrabold leading-[1.45] tracking-[-0.02em]">{cur.catch}</p>
            </div>

            <h3 className="mt-10 text-[20px] font-extrabold">1년 동안 방문하는 날</h3>
            <div className="mt-4 space-y-4">
              <VisitRow label="정수기" every={4} />
              <VisitRow label="공기청정기" every={6} />
            </div>
            <p className="mt-4 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
              방문 3일 전에 문자로 날짜를 여쭤봅니다. 필터 교체와 물 나오는 곳 살균까지 30분 안쪽으로 끝나요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisitRow({ label, every }: { label: string; every: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[84px] shrink-0 text-[15px] font-bold">{label}</span>
      <ol className="grid flex-1 grid-cols-12 gap-[3px]" aria-label={`${label} ${every}개월마다 방문`}>
        {Array.from({ length: 12 }, (_, i) => {
          const visit = (i + 1) % every === 0;
          return (
            <li
              key={i}
              className="flex h-8 items-center justify-center rounded-[4px] text-[11px] font-bold"
              style={visit ? { background: C.sea, color: C.white } : { background: C.mist, color: C.muted }}
            >
              {visit ? `${i + 1}월` : ""}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- 상담 신청 ---------- */

/* 신청 완료 뒤 사장님 시트에 미리 쌓여 있는 가상 접수. */
const PAST_LEADS: LeadRow[] = [
  { at: "오늘 13:05", name: "정ㅁ석", digits: "01039184406", summary: "냉온정수기 M · 5년", source: "네이버 검색광고", status: "통화함" },
  { at: "오늘 10:41", name: "박ㅅ연", digits: "01072615503", summary: "직수 정수기 S · 3년", source: "메타 광고", status: "통화 전" },
  { at: "어제 19:22", name: "박ㅅ연", digits: "01072615503", summary: "직수 정수기 S · 5년", source: "메타 광고", status: "보류" },
  { at: "어제 11:58", name: "김ㅎ늘", digits: "01088420917", summary: "공기청정기 A · 5년", source: "블로그", status: "계약" },
];

function ApplyForm({
  formRef,
  today,
  picked,
  setPicked,
  term,
}: {
  formRef: React.RefObject<HTMLElement | null>;
  today: Date;
  picked: ProductId[];
  setPicked: (v: ProductId[]) => void;
  term: Term;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState<(typeof CALL_TIMES)[number]>(CALL_TIMES[1]);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ no: string; name: string; rawName: string; phone: string } | null>(null);

  const phoneOk = /^01[016789]\d{7,8}$/.test(phone);
  const errors = {
    name: name.trim().length < 2 ? "이름을 2글자 이상 적어 주세요." : "",
    phone: phoneOk ? "" : "휴대폰 번호를 숫자만 10~11자리로 적어 주세요.",
    product: picked.length ? "" : "관심 제품을 하나 이상 골라 주세요.",
    agree: agree ? "" : "개인정보 수집에 동의해야 신청할 수 있어요.",
  };
  const ok = !Object.values(errors).some(Boolean);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok) return;
    const ymd = `${String(today.getFullYear()).slice(2)}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const seq = String((Number(phone.slice(-4)) % 900) + 100);
    setDone({ no: `R${ymd}-${seq}`, name: maskName(name), rawName: name, phone });
  };

  return (
    <section ref={formRef} id="wr-apply" aria-labelledby="wr-apply-title" className="scroll-mt-4 px-5 py-16 md:px-8 md:py-24" style={{ background: C.seaDeep, color: C.white }}>
      <div className="mx-auto max-w-[640px]">
        <h2 id="wr-apply-title" className="text-[32px] font-black leading-[1.2] tracking-[-0.03em] md:text-[44px]">
          무료 상담 신청
        </h2>
        <p className="mt-3 text-[16px] leading-[1.7] opacity-85">
          남겨 주신 시간에 전화드립니다. 상담만 받고 신청하지 않으셔도 괜찮아요.
        </p>

        <div className="mt-8 rounded-[16px] bg-white p-6 md:p-8" style={{ color: C.ink }}>
          {done ? (
            <div role="status">
              <p className="inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ background: C.mist, color: C.sea }}>
                <Check size={26} strokeWidth={3} aria-hidden />
              </p>
              <p className="mt-4 text-[26px] font-black tracking-[-0.02em]">신청을 받았습니다</p>
              <p className="mt-2 text-[17px] leading-[1.7]">
                {done.name} 님, 오늘 안에 전화드립니다. 오후 6시 이후 신청은 다음 날 오전에 연락드려요.
              </p>
              <dl className="mt-6 divide-y rounded-[12px] border text-[16px]" style={{ borderColor: C.line }}>
                <Row k="접수 번호" v={done.no} />
                <Row k="접수일" v={fmtKo(today)} />
                <Row k="관심 제품" v={PRODUCTS.filter((p) => picked.includes(p.id)).map((p) => p.name).join(", ")} />
                <Row k="의무 사용" v={`${term}년 기준 안내`} />
                <Row k="통화 시간" v={time} />
              </dl>
              <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
                샘플 화면이라 실제로 접수되지는 않습니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDone(null);
                  setName("");
                  setPhone("");
                  setAgree(false);
                  setTried(false);
                }}
                className="mt-5 h-12 w-full rounded-[10px] border-2 text-[16px] font-bold"
                style={{ borderColor: C.line }}
              >
                다시 신청해 보기
              </button>
              <LeadReceivedPanel
                business="곰파트너 렌탈"
                name={done.rawName}
                phone={done.phone}
                summary={`${PRODUCTS.filter((p) => picked.includes(p.id)).map((p) => p.name).join(", ")} · ${term}년`}
                lines={[
                  ["관심 제품", PRODUCTS.filter((p) => picked.includes(p.id)).map((p) => p.name).join(", ")],
                  ["통화 시간", time],
                ]}
                pastRows={PAST_LEADS}
                theme={{ accent: C.sea, accentSoft: C.mist, ink: C.ink, muted: C.muted, line: C.line, paper: C.foam }}
              />
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-6">
              <Field label="이름" error={tried ? errors.name : ""}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-12 w-full rounded-[8px] border-2 px-4 text-[17px]" style={{ borderColor: C.line }} />
              </Field>
              <Field label="휴대폰 번호" error={tried ? errors.phone : ""}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="숫자만 입력"
                  className="h-12 w-full rounded-[8px] border-2 px-4 text-[17px]"
                  style={{ borderColor: C.line }}
                />
              </Field>
              <Field label="관심 제품" error={tried ? errors.product : ""} group>
                <div className="flex flex-wrap gap-2">
                  {PRODUCTS.map((p) => {
                    const on = picked.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setPicked(on ? picked.filter((x) => x !== p.id) : [...picked, p.id])}
                        className="inline-flex h-11 items-center gap-1.5 rounded-full border-2 px-4 text-[15px] font-bold"
                        style={on ? { background: C.sea, borderColor: C.sea, color: C.white } : { borderColor: C.line }}
                      >
                        {on && <Check size={16} strokeWidth={3} aria-hidden />}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="통화하기 편한 시간" group>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="통화하기 편한 시간">
                  {CALL_TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={time === t}
                      onClick={() => setTime(t)}
                      className="h-12 rounded-[8px] border-2 px-1 text-[14px] font-bold"
                      style={time === t ? { background: C.mist, borderColor: C.sea, color: C.seaDeep } : { borderColor: C.line }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <div>
                <div className="flex items-start gap-3">
                  <input id="wr-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" style={{ accentColor: C.sea }} />
                  <label htmlFor="wr-agree" className="text-[15px] leading-[1.6]">
                    상담 전화를 위해 이름, 휴대폰 번호, 관심 제품을 받고, 상담이 끝나면 3개월 뒤 지우는 데 동의합니다.
                  </label>
                </div>
                <button type="button" onClick={() => setShowTerms((v) => !v)} aria-expanded={showTerms} className="mt-2 inline-flex items-center gap-1 pl-8 text-[14px] font-bold" style={{ color: C.sea }}>
                  자세히 보기
                  <ChevronDown size={16} className={showTerms ? "rotate-180" : ""} aria-hidden />
                </button>
                {showTerms && (
                  <dl className="mt-2 ml-8 space-y-1 rounded-[8px] p-3 text-[14px] leading-[1.6]" style={{ background: C.foam, color: C.muted }}>
                    <div>수집 항목: 이름, 휴대폰 번호, 관심 제품, 통화 시간</div>
                    <div>이용 목적: 렌탈 상담 전화</div>
                    <div>보관 기간: 상담 후 3개월</div>
                    <div>동의하지 않으면 상담 신청을 할 수 없습니다.</div>
                  </dl>
                )}
                {tried && errors.agree && (
                  <p className="mt-2 pl-8 text-[14px] font-bold" style={{ color: "#c0392b" }}>
                    {errors.agree}
                  </p>
                )}
              </div>

              <button type="submit" className="flex h-14 w-full items-center justify-center rounded-[10px] text-[18px] font-extrabold" style={{ background: C.sun, color: C.ink }}>
                상담 신청하기
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, group, children }: { label: string; error?: string; group?: boolean; children: React.ReactNode }) {
  const Tag = group ? "fieldset" : "label";
  return (
    <Tag className="block">
      {group ? <legend className="text-[15px] font-bold">{label}</legend> : <span className="text-[15px] font-bold">{label}</span>}
      <div className="mt-2">{children}</div>
      {error && (
        <p className="mt-1.5 text-[14px] font-bold" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}
    </Tag>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3" style={{ borderColor: C.line }}>
      <dt style={{ color: C.muted }}>{k}</dt>
      <dd className="text-right font-bold">{v}</dd>
    </div>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-5 pb-36 pt-10 md:px-8 md:pb-12" style={{ background: C.ink, color: "#b8c6c6" }}>
      <div className="mx-auto max-w-[1120px] text-[14px] leading-[1.8]">
        <Logo light />
        <p className="mt-3">곰파트너 렌탈 · 대표 박ㅅ연 · 서울 ㅅㄷ구 ㅇㅇ로 00</p>
        <p>사업자등록번호 000-00-00000 · 통신판매업 신고 0000-서울ㅅㄷ-0000</p>
        <p className="mt-2 opacity-70">상호와 제품, 금액은 샘플용 가상 정보입니다.</p>
      </div>
    </footer>
  );
}

/* ---------- 아래 고정 상담 신청 바 ---------- */

function StickyBar({ show, onApply, reduce }: { show: boolean; onApply: () => void; reduce: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-0 z-40 px-4"
          // 공용 떠 있는 버튼(바닥에서 20px, 높이 40px)보다 위에 둔다
          style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
          initial={reduce ? false : { y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="mx-auto flex h-16 max-w-[520px] items-center gap-3 rounded-[14px] pl-5 pr-2 shadow-[0_10px_28px_rgba(0,40,45,0.3)]" style={{ background: C.sea, color: C.white }}>
            <p className="min-w-0 flex-1 text-[15px] leading-[1.3]">
              <span className="block font-bold">설치비 0원</span>
              <span className="opacity-85">월 {won(MIN_PRICE)}원부터</span>
            </p>
            <button type="button" onClick={onApply} className="h-12 shrink-0 rounded-[10px] px-5 text-[16px] font-extrabold" style={{ background: C.sun, color: C.ink }}>
              상담 신청
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
