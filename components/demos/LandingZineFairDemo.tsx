"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Gasoek_One } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Minus, Plus, RotateCcw, Search, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { RealQr } from "@/components/demos/eventPrint";
import { daysAgo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 독립출판 북페어 사전 입장 등록 랜딩 샘플: 가상의 "얇은책 장터". 이틀 동안 창고 한 층에서 셀러 24팀이 진과 굿즈를 판다.
   행사명, 장소, 셀러, 책 제목, 담당자 이름은 모두 가상이다.

   크몽 랜딩페이지 고급 패키지("랜딩 고급") 범위. 맞춤 기능은 사전 입장 회차 등록.
   리소그래프 포스터처럼 만든다. 형광 분홍과 파랑 두 색을 살짝 어긋나게 겹쳐 찍고, 망점 결, 둥근 스티커, 아주 큰 글자.
   진(얇은 소책자)은 리소로 많이 찍기 때문에 북페어와 결이 맞는다.

   상호작용(모두 브라우저 안에서만 돈다)
   1. 사전 입장 등록: 날짜, 회차(남은 자리), 인원, 이름·휴대폰. 완료하면 입장권과 QR.
   2. 참가 셀러: 장르 태그를 여러 개 고르고 이름·책 제목으로 찾는다. 걸린 셀러는 부스 지도에도 분홍으로 칠해진다.
   3. 부스 지도: 부스를 누르면 그 셀러가 열린다.
   4. 미리 담기: 사고 싶은 진을 담으면 부스 도는 순서대로 정리하고 합계를 낸다.
   5. 오시는 길, 자주 묻는 질문. */

const display = Gasoek_One({ weight: "400", preload: false, display: "swap" });

const NAME = "곰파트너";
const PLACE = "서울 마포구 ㅇㅇ로 00, ㅇㅇ창고 2층";
const INSTA = "인스타그램 공식 계정";

const C = {
  paper: "#fff8e8",
  pink: "#ff4fa3",
  blue: "#2f6bff",
  yellow: "#ffe14d",
  ink: "#1b2160",
  black: "#111111",
  muted: "#4a4f78",
  error: "#c0182f",
};

const dF = { fontFamily: `${display.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const pill = `inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition-transform duration-100 active:translate-x-[3px] active:translate-y-[3px] ${focusRing}`;

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/** 분홍과 파랑 판이 조금 어긋나게 찍힌 글자 */
function Riso({ children, className = "", as: Tag = "span", id }: { children: React.ReactNode; className?: string; as?: "span" | "h1" | "h2" | "p"; id?: string }) {
  return (
    <Tag id={id} className={`relative inline-block ${className}`} style={dF}>
      <span aria-hidden className="absolute left-0 top-0 select-none" style={{ color: C.pink, transform: "translate(-0.045em, -0.035em)", mixBlendMode: "multiply" }}>
        {children}
      </span>
      <span className="relative" style={{ color: C.blue, mixBlendMode: "multiply" }}>
        {children}
      </span>
    </Tag>
  );
}

/** 둥근 스티커 */
function Sticker({ children, className = "", color = C.yellow, rotate = -12, size = 120 }: { children: React.ReactNode; className?: string; color?: string; rotate?: number; size?: number }) {
  return (
    <span
      className={`grid place-items-center rounded-full text-center font-black leading-[1.15] ${className}`}
      style={{ width: size, height: size, background: color, color: C.black, transform: `rotate(${rotate}deg)`, boxShadow: `0 0 0 3px ${C.black}` }}
    >
      {children}
    </span>
  );
}

/* ── 데이터 ───────────────────────────────────────────── */

const GENRES = ["만화", "에세이", "시", "사진", "일러스트", "여행", "요리", "리소 인쇄", "굿즈"] as const;
type Genre = (typeof GENRES)[number];
type Item = { id: string; title: string; price: number };
type Seller = { booth: string; name: string; tags: Genre[]; items: Item[] };

const RAW: [string, string, Genre[], [string, number][]][] = [
  ["A1", "고양이 세탁소", ["만화", "굿즈"], [["세탁기 속 고양이 1·2권", 6000], ["양말 스티커", 3000]]],
  ["A2", "밤의 영수증", ["에세이"], [["야근 영수증 모음", 8000]]],
  ["A3", "두부 출판", ["요리", "에세이"], [["두부만 먹은 일주일", 9000]]],
  ["A4", "방구석 리소", ["리소 인쇄", "일러스트"], [["리소 포스터 A3", 12000], ["엽서 6종", 7000]]],
  ["A5", "느린 우편", ["시"], [["부치지 못한 시", 7000]]],
  ["A6", "초록 계단", ["사진"], [["옥상 정원 사진집", 15000]]],
  ["A7", "동네 지도 연구회", ["여행", "일러스트"], [["골목 지도 접이책", 6000]]],
  ["A8", "마감 직전", ["만화"], [["마감 직전 4컷", 5000]]],
  ["B1", "소금빵 비평", ["요리", "에세이"], [["소금빵 마흔 개 비평", 8000]]],
  ["B2", "버스 맨 뒷자리", ["여행", "사진"], [["막차 사진집", 13000]]],
  ["B3", "작은 우주선", ["만화", "일러스트"], [["우주선 수리공", 7000]]],
  ["B4", "종이 비행", ["리소 인쇄", "굿즈"], [["리소 메모지", 4000], ["책갈피 세트", 3000]]],
  ["B5", "새벽 세 시", ["시", "에세이"], [["불면 일기", 8000]]],
  ["B6", "털실 클럽", ["굿즈", "일러스트"], [["뜨개 도안 진", 9000]]],
  ["B7", "오래된 극장", ["사진", "에세이"], [["단관 극장 순례", 14000]]],
  ["B8", "반쯤 접힌", ["리소 인쇄", "시"], [["접는 시집", 6000]]],
  ["C1", "화분 일지", ["에세이", "사진"], [["죽인 화분 목록", 7000]]],
  ["C2", "낙서 공작소", ["일러스트", "굿즈"], [["낙서 스티커북", 5000]]],
  ["C3", "연필 깎는 사람", ["에세이"], [["연필 깎기 연습장", 6000]]],
  ["C4", "오리배", ["만화"], [["오리배 탐정", 6000]]],
  ["C5", "기차 창가", ["여행", "시"], [["창가 자리에서 쓴 시", 7000]]],
  ["C6", "사과 반쪽", ["요리", "일러스트"], [["사과 요리 그림책", 10000]]],
  ["C7", "회색 고양이", ["사진"], [["골목 고양이 사진집", 12000]]],
  ["C8", "진 도서관", ["리소 인쇄"], [["진 만드는 법", 5000]]],
];
const SELLERS: Seller[] = RAW.map(([booth, name, tags, items]) => ({ booth, name, tags, items: items.map(([title, price], i) => ({ id: `${booth}-${i}`, title, price })) }));
const ITEM_BY_ID = Object.fromEntries(SELLERS.flatMap((s) => s.items.map((it) => [it.id, { ...it, seller: s }])));

/** 입구에서 들어와 C줄, B줄, A줄 순서로 지그재그로 돈다 */
const ROUTE = ["C", "B", "A"].flatMap((row, r) => Array.from({ length: 8 }, (_, i) => `${row}${r % 2 === 0 ? i + 1 : 8 - i}`));

const ENTRY_CAP = 120;
const ENTRY_SLOTS = ["11:00", "13:00", "15:00", "17:00"];
function entryTaken(d: number, s: number) {
  let h = (d + 2) * 2654435761 + (s + 11) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 101;
  const base = s === 1 ? 92 : s === 2 ? 80 : s === 0 ? 64 : 40;
  return Math.min(ENTRY_CAP, base + (h % 25) + d * 8);
}

/* ── 페이지 ───────────────────────────────────────────── */

export function LandingZineFairDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  // 3주쯤 뒤 토요일과 일요일
  const sat = useMemo(() => {
    const base = daysAgo(today, -18);
    return daysAgo(base, -((6 - base.getDay() + 7) % 7));
  }, [today]);
  const days = [sat, daysAgo(sat, -1)];

  const [wish, setWish] = useState<string[]>([]);
  const toggleWish = (id: string) => setWish((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const wishTotal = wish.reduce((n, id) => n + (ITEM_BY_ID[id]?.price ?? 0), 0);
  const [wishInView, setWishInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById("zf-wish");
    if (!el) return;
    const o = new IntersectionObserver(([e]) => setWishInView(e.isIntersecting), { threshold: 0 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-28" style={{ background: C.paper, color: C.ink }}>
      {/* 망점 결. 글자 위에도 얹혀 종이에 찍힌 느낌을 낸다 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-30" style={{ backgroundImage: "radial-gradient(rgba(27,33,96,0.16) 0.6px, transparent 0.8px)", backgroundSize: "3px 3px", mixBlendMode: "multiply" }} />

      <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <span className="inline-flex min-w-0 items-center gap-2" style={{ color: C.black }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
          <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
          <span className="flex flex-col whitespace-nowrap leading-none">
            <span className="text-[22px]" style={dF}>
              {NAME}
            </span>
            <span className="mt-1 text-[12px] font-bold opacity-70">북페어 샘플</span>
          </span>
        </span>
        <button type="button" onClick={() => go("zf-entry")} className={`${pill} px-4 py-2 text-[15px] text-white`} style={{ background: C.blue, boxShadow: `3px 3px 0 ${C.pink}`, outlineColor: C.black }}>
          사전 등록
        </button>
      </header>

      {/* 첫 화면: 포스터 */}
      <section aria-labelledby="zf-title" className="relative mx-auto grid max-w-[1200px] gap-6 px-4 pb-14 pt-2 md:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:pb-20">
        <div className="relative">
          <Riso as="h1" id="zf-title" className="text-[84px] leading-[0.98] tracking-[-0.01em] md:text-[136px]">
            독립출판
            <br />
            북페어
          </Riso>
          <dl className="mt-8 grid gap-2 text-[16px] font-bold md:text-[18px]">
            {[
              ["날짜", `${days[0].getMonth() + 1}.${days[0].getDate()}(토) ~ ${days[1].getMonth() + 1}.${days[1].getDate()}(일)`],
              ["시간", "11:00 ~ 19:00, 회차마다 120명"],
              ["장소", "망원역 1번 출구 ㅇㅇ창고 2층"],
              ["입장", "사전 등록 무료, 현장 2,000원"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2.5">
                <dt className="flex-none px-1.5 py-0.5 text-[13px]" style={{ background: C.black, color: C.paper }}>
                  {k}
                </dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => go("zf-entry")} className={`${pill} min-w-[220px] px-8 py-4 text-[20px] text-white`} style={{ background: C.blue, boxShadow: `5px 5px 0 ${C.pink}`, outlineColor: C.black }}>
              줄 말고 등록
            </button>
            <button type="button" onClick={() => go("zf-sellers")} className={`${pill} border-[3px] px-6 py-3.5 text-[17px]`} style={{ borderColor: C.black, color: C.black, outlineColor: C.blue }}>
              셀러 24팀 보기
            </button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <ZineArt />
          <Sticker className="absolute -left-2 bottom-4 text-[19px] md:-left-8 md:text-[22px]" size={124}>
            셀러
            <br />
            24팀
          </Sticker>
          <Sticker className="absolute -top-2 right-0 text-[15px] md:right-2" color={C.pink} rotate={10} size={96}>
            <span className="text-white">
              이틀만
              <br />
              엽니다
            </span>
          </Sticker>
        </div>
      </section>

      {/* 1. 사전 입장 등록 */}
      <section id="zf-entry" aria-labelledby="zf-entry-title" className="relative scroll-mt-2 border-y-[3px] py-14 md:py-20" style={{ borderColor: C.black, background: "#ffe7f2" }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 md:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
          <div>
            <Riso as="h2" id="zf-entry-title" className="text-[56px] leading-[0.95] md:text-[84px]">
              사전
              <br />
              입장 등록
            </Riso>
            <p className="mt-5 max-w-[420px] text-[17px] font-medium leading-[1.7]">
              창고 한 층이라 한 번에 120명까지 들어와요. 회차를 고르면 그 시간에 줄 없이 들어오고, 등록하면 입장료가 없어요.
            </p>
            <p className="mt-3 max-w-[420px] text-[15px] leading-[1.7]" style={{ color: C.muted }}>
              회차는 들어오는 시간이에요. 들어온 뒤에는 문 닫을 때까지 있어도 돼요.
            </p>
          </div>
          <EntryForm days={days} reduce={reduce} />
        </div>
      </section>

      {/* 2·3·4. 셀러, 부스 지도, 미리 담기 */}
      <SellerSection reduce={reduce} wish={wish} toggleWish={toggleWish} setWish={setWish} />

      {/* 5. 오시는 길과 자주 묻는 질문 */}
      <section id="zf-info" aria-labelledby="zf-info-title" className="relative border-t-[3px] py-14 md:py-20" style={{ borderColor: C.black }}>
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-14">
          <div>
            <Riso as="h2" id="zf-info-title" className="text-[52px] leading-none md:text-[72px]">
              오시는 길
            </Riso>
            <dl className="mt-6 grid grid-cols-[72px_1fr] gap-x-3 gap-y-3 text-[16px] leading-[1.65]">
              <dt className="font-extrabold">주소</dt>
              <dd>{PLACE}</dd>
              <dt className="font-extrabold">지하철</dt>
              <dd>6호선 망원역 1번 출구에서 시장 쪽으로 5분. 분홍 현수막이 걸린 회색 창고예요.</dd>
              <dt className="font-extrabold">계단</dt>
              <dd>2층까지 화물용 엘리베이터가 있어요. 유모차와 휠체어는 입구 직원에게 말해 주세요.</dd>
              <dt className="font-extrabold">결제</dt>
              <dd>부스마다 달라요. 계좌이체만 받는 셀러도 있어 현금이나 이체를 준비해 오면 편해요.</dd>
              <dt className="font-extrabold">문의</dt>
              <dd>{INSTA} 메시지. 운영팀 한ㅂ름이 저녁 8시 전에 답해요.</dd>
            </dl>
          </div>
          <div>
            <Riso as="h2" className="text-[52px] leading-none md:text-[72px]">
              묻고 답하기
            </Riso>
            <Faq />
          </div>
        </div>
      </section>

      <footer className="relative border-t-[3px] px-4 py-10 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.black, background: C.black, color: "rgba(255,248,232,0.75)" }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[20px]" style={{ ...dF, color: C.paper }}>
            {NAME}
          </p>
          <DemoMakerInfo className="mt-1" />
        </div>
      </footer>

      {/* 담은 게 있고 미리 담기 칸이 안 보일 때만 아래에 띄운다. 사용법 버튼과 겹치지 않게 위로 올린다. */}
      <AnimatePresence>
        {wish.length > 0 && !wishInView && (
          <motion.div
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 z-40 px-4 print:hidden"
            style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
          >
            <button type="button" onClick={() => go("zf-wish")} className={`${pill} mx-auto flex w-full max-w-[420px] justify-between px-5 py-3.5 text-[16px] text-white`} style={{ background: C.blue, boxShadow: `4px 4px 0 ${C.pink}`, outlineColor: C.black }}>
              <span className="inline-flex items-center gap-2">
                <Heart size={18} fill="currentColor" aria-hidden /> 담은 진 {wish.length}권
              </span>
              <span className="tabular-nums">{won(wishTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 스테이플러로 찍은 진 세 권을 분홍·파랑 망점으로 그린 그림 */
function ZineArt() {
  return (
    <svg viewBox="0 0 420 440" className="block h-auto w-full" role="img" aria-label="분홍과 파랑으로 찍은 얇은 책 세 권이 겹쳐 놓인 그림">
      <defs>
        <pattern id="zf-dot-pink" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <circle cx="3.5" cy="3.5" r="2.3" fill={C.pink} />
        </pattern>
        <pattern id="zf-dot-blue" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="3" cy="3" r="1.7" fill={C.blue} />
        </pattern>
        <pattern id="zf-line-blue" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <path d="M0 4H8" stroke={C.blue} strokeWidth="2.2" />
        </pattern>
      </defs>
      <g style={{ mixBlendMode: "multiply" }}>
        {/* 맨 아래 책 */}
        <g transform="translate(40 150) rotate(-14)">
          <rect width="230" height="250" fill="url(#zf-line-blue)" />
          <rect width="230" height="250" fill="none" stroke={C.blue} strokeWidth="4" />
        </g>
        {/* 가운데 책 */}
        <g transform="translate(150 70) rotate(9)">
          <rect width="220" height="290" fill={C.pink} opacity="0.92" />
          <circle cx="110" cy="120" r="64" fill="url(#zf-dot-blue)" />
          {[60, 160].map((y) => (
            <rect key={y} x="-3" y={y} width="10" height="22" fill={C.black} />
          ))}
        </g>
        {/* 맨 위 책 */}
        <g transform="translate(70 110) rotate(-3)">
          <rect width="200" height="270" fill="url(#zf-dot-pink)" />
          <rect x="6" y="-4" width="200" height="270" fill="none" stroke={C.blue} strokeWidth="5" />
          <path d="M40 160 Q100 240 160 160" fill="none" stroke={C.blue} strokeWidth="10" strokeLinecap="round" />
          <circle cx="70" cy="90" r="20" fill={C.blue} />
          <circle cx="140" cy="80" r="14" fill={C.blue} />
          {[70, 180].map((y) => (
            <rect key={y} x="-2" y={y} width="9" height="20" fill={C.black} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/* ── 1. 사전 입장 등록 ────────────────────────────────── */

function EntryForm({ days, reduce }: { days: Date[]; reduce: boolean }) {
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [people, setPeople] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [extra, setExtra] = useState<Record<string, number>>({});
  const [done, setDone] = useState<{ no: string; day: number; slot: number; people: number; name: string; phone: string } | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const left = (d: number, s: number) => ENTRY_CAP - entryTaken(d, s) - (extra[`${d}-${s}`] ?? 0);
  const l = slot === null ? 0 : left(day, slot);
  const maxP = slot === null ? 4 : Math.max(1, Math.min(4, l));
  const p = Math.min(people, maxP);
  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    slot: slot === null ? "회차를 골라 주세요" : "",
    name: name.trim() ? "" : "이름을 적어 주세요",
    phone: phoneOk ? "" : "휴대폰 번호를 확인해 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);
  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || slot === null) return;
    const no = `${["토", "일"][day]}${ENTRY_SLOTS[slot].slice(0, 2)}-${p2(ENTRY_CAP - l + 1).padStart(3, "0")}`;
    setExtra((v) => ({ ...v, [`${day}-${slot}`]: (v[`${day}-${slot}`] ?? 0) + p }));
    setDone({ no, day, slot, people: p, name, phone });
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }));
  };
  const reset = () => {
    setDone(null);
    setTried(false);
    setSlot(null);
    setName("");
    setPhone("");
    setAgree(false);
  };

  const box = "rounded-[18px] border-[3px] p-5 md:p-8";
  const input = `mt-2 w-full rounded-[12px] border-[3px] bg-white px-3.5 py-3 text-[17px] font-normal ${focusRing}`;

  if (done) {
    const d = days[done.day];
    return (
      <motion.div ref={doneRef} initial={reduce ? false : { rotate: -4, scale: 0.92, opacity: 0 }} animate={{ rotate: -1.5, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="relative" role="status">
        <div className={`${box} relative overflow-hidden`} style={{ borderColor: C.black, background: C.paper, boxShadow: `8px 8px 0 ${C.blue}` }}>
          <div className="grid gap-6 sm:grid-cols-[1fr_170px] sm:items-start">
            <div>
              <p className="text-[15px] font-extrabold" style={{ color: C.pink }}>
                등록됐어요
              </p>
              <Riso className="mt-1 text-[46px] leading-none md:text-[56px]">{done.no}</Riso>
              <dl className="mt-5 grid grid-cols-[76px_1fr] gap-x-3 gap-y-2 text-[15px] leading-[1.6]">
                <dt className="font-extrabold">입장</dt>
                <dd>
                  {d.getMonth() + 1}.{d.getDate()}({DOW[d.getDay()]}) {ENTRY_SLOTS[done.slot]}, {done.people}명
                </dd>
                <dt className="font-extrabold">등록자</dt>
                <dd>
                  {maskName(done.name)} · {maskPhone(done.phone)}
                </dd>
                <dt className="font-extrabold">입구</dt>
                <dd>사전 등록 줄에서 QR을 보여 주면 팔찌로 바꿔 드려요. 회차 시작 20분 뒤까지 들어오면 돼요.</dd>
                <dt className="font-extrabold">문자</dt>
                <dd>같은 QR을 문자로도 보냈어요. 전날 저녁 7시에 한 번 더 보내요.</dd>
                <dt className="font-extrabold">취소</dt>
                <dd>문자 속 링크에서 해요. 빈자리는 현장 손님에게 돌아가요.</dd>
                <dt className="font-extrabold">담당 창구</dt>
                <dd>운영팀 한ㅂ름, {INSTA} 메시지. 저녁 8시 전에 답해요.</dd>
              </dl>
            </div>
            <div className="mx-auto w-[150px] rounded-[12px] border-[3px] bg-white p-2 sm:w-full" style={{ borderColor: C.black }}>
              <RealQr value={`GOMPARTNER ${done.no} ${done.people}P`} color={C.blue} label={`입장 QR, 등록 번호 ${done.no}`} />
              <p className="mt-1 text-center text-[13px] font-extrabold">{done.people}명 입장</p>
            </div>
          </div>
        </div>
        <Sticker className="absolute -right-2 -top-6 text-[15px] md:-right-6" size={88} rotate={14}>
          줄 없이
          <br />
          입장
        </Sticker>
        <button type="button" onClick={reset} className={`mt-6 inline-flex items-center gap-1.5 text-[15px] font-extrabold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.blue }}>
          <RotateCcw size={16} aria-hidden /> 다른 회차로 한 번 더 등록하기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={box} style={{ borderColor: C.black, background: C.paper, boxShadow: `8px 8px 0 ${C.pink}` }}>
      <fieldset>
        <legend className="text-[17px] font-extrabold">날짜</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {days.map((d, i) => {
            const on = day === i;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setDay(i);
                  setSlot(null);
                }}
                className={`rounded-[12px] border-[3px] py-3 text-center ${focusRing}`}
                style={{ borderColor: C.black, background: on ? C.blue : "white", color: on ? "white" : C.black, outlineColor: C.pink }}
              >
                <span className="block text-[26px] leading-none" style={dF}>
                  {d.getMonth() + 1}.{d.getDate()}
                </span>
                <span className="mt-1 block text-[14px] font-bold">{DOW[d.getDay()]}요일</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-[17px] font-extrabold">들어오는 시간</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          {ENTRY_SLOTS.map((t, s) => {
            const a = left(day, s);
            const full = a <= 0;
            const on = slot === s;
            const pct = Math.max(0, a) / ENTRY_CAP;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                disabled={full}
                aria-label={`${t} 회차, ${full ? "마감" : `남은 자리 ${a}석`}`}
                onClick={() => setSlot(s)}
                className={`rounded-[12px] border-[3px] px-3 pb-3 pt-2 text-left disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                style={{ borderColor: C.black, background: on ? C.yellow : "white", color: C.black, outlineColor: C.pink }}
              >
                <span className="block text-[24px] leading-tight" style={dF}>
                  {t}
                </span>
                <span className="block text-[14px] font-bold tabular-nums">{full ? "마감" : `${a}석 남음`}</span>
                <span aria-hidden className="mt-2 block h-2 overflow-hidden rounded-full border-2" style={{ borderColor: C.black }}>
                  <span className="block h-full" style={{ width: `${(1 - pct) * 100}%`, background: pct < 0.15 ? C.pink : C.blue }} />
                </span>
              </button>
            );
          })}
        </div>
        {err("slot")}
      </fieldset>

      <div className="mt-6 grid gap-5 md:grid-cols-[170px_1fr_1fr]">
        <div>
          <p className="text-[17px] font-extrabold" id="zf-people">
            인원
          </p>
          <div className="mt-2 flex items-center gap-2" role="group" aria-labelledby="zf-people">
            <button type="button" onClick={() => setPeople(Math.max(1, p - 1))} disabled={p <= 1} aria-label="한 명 빼기" className={`grid h-12 w-12 place-items-center rounded-full border-[3px] bg-white disabled:opacity-40 ${focusRing}`} style={{ borderColor: C.black, outlineColor: C.pink }}>
              <Minus size={18} aria-hidden />
            </button>
            <output className="w-12 text-center text-[24px]" style={dF} aria-live="polite">
              {p}명
            </output>
            <button type="button" onClick={() => setPeople(Math.min(maxP, p + 1))} disabled={p >= maxP} aria-label="한 명 더하기" className={`grid h-12 w-12 place-items-center rounded-full border-[3px] bg-white disabled:opacity-40 ${focusRing}`} style={{ borderColor: C.black, outlineColor: C.pink }}>
              <Plus size={18} aria-hidden />
            </button>
          </div>
        </div>
        <label className="block text-[17px] font-extrabold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김ㅎ늘" autoComplete="name" className={input} style={{ borderColor: C.black, outlineColor: C.pink }} />
          {err("name")}
        </label>
        <label className="block text-[17px] font-extrabold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" className={input} style={{ borderColor: C.black, outlineColor: C.pink }} />
          {err("phone")}
        </label>
      </div>
      <label className="mt-6 flex cursor-pointer items-start gap-2 text-[15px] leading-[1.6]">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[#2f6bff]" />
        <span>입장 문자를 보내려고 이름과 휴대폰 번호를 받아요. 행사가 끝나고 7일 뒤 지워요. 동의합니다.</span>
      </label>
      {err("agree")}
      <button type="submit" className={`${pill} mt-6 w-full py-4 text-[19px] text-white`} style={{ background: C.blue, boxShadow: `5px 5px 0 ${C.pink}`, outlineColor: C.black }}>
        {slot === null ? "등록하기" : `${days[day].getMonth() + 1}.${days[day].getDate()} ${ENTRY_SLOTS[slot]} ${p}명 등록하기`}
      </button>
    </form>
  );
}

/* ── 2·3·4. 셀러 목록, 부스 지도, 미리 담기 ─────────── */

function SellerSection({ reduce, wish, toggleWish, setWish }: { reduce: boolean; wish: string[]; toggleWish: (id: string) => void; setWish: (v: string[]) => void }) {
  const [tags, setTags] = useState<Genre[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>("A4");
  const [all, setAll] = useState(false);

  const match = (s: Seller) => {
    const okTag = tags.length === 0 || s.tags.some((t) => tags.includes(t));
    const k = q.trim();
    const okQ = !k || s.name.includes(k) || s.items.some((it) => it.title.includes(k));
    return okTag && okQ;
  };
  const list = SELLERS.filter(match);
  const filtering = tags.length > 0 || q.trim() !== "";

  const pickBooth = (b: string) => {
    setOpen(b);
    setAll(true);
    requestAnimationFrame(() => document.getElementById(`zf-s-${b}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }));
  };

  return (
    <section id="zf-sellers" aria-labelledby="zf-sellers-title" className="relative scroll-mt-2 py-14 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <Riso as="h2" id="zf-sellers-title" className="text-[56px] leading-[0.95] md:text-[84px]">
          참가 셀러
        </Riso>
        <p className="mt-4 max-w-[560px] text-[17px] font-medium leading-[1.7]">장르를 고르면 그 셀러 부스가 지도에 분홍으로 칠해져요. 사고 싶은 진은 하트로 담아 두세요.</p>

        {/* 장르 태그와 검색 */}
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="장르 고르기">
          {GENRES.map((g) => {
            const on = tags.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => setTags((v) => (v.includes(g) ? v.filter((x) => x !== g) : [...v, g]))}
                className={`rounded-full border-[2.5px] px-3.5 py-1.5 text-[15px] font-extrabold transition-transform ${on ? "-rotate-2" : ""} ${focusRing}`}
                style={{ borderColor: C.black, background: on ? C.pink : "white", color: on ? "white" : C.black, outlineColor: C.blue }}
              >
                {g}
              </button>
            );
          })}
          {filtering && (
            <button type="button" onClick={() => { setTags([]); setQ(""); }} className={`inline-flex items-center gap-1 px-2 text-[14px] font-bold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.blue }}>
              <X size={14} aria-hidden /> 모두 풀기
            </button>
          )}
        </div>
        <label className="mt-4 flex max-w-[420px] items-center gap-2 rounded-full border-[3px] bg-white px-4 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2" style={{ borderColor: C.black, outlineColor: C.blue }}>
          <Search size={18} aria-hidden />
          <span className="sr-only">셀러 이름이나 책 제목으로 찾기</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="셀러 이름이나 책 제목" className="w-full bg-transparent py-3 text-[16px] outline-none" />
        </label>
        <p className="mt-3 text-[15px] font-bold" aria-live="polite">
          {filtering ? `${list.length}팀이 걸렸어요` : `셀러 ${SELLERS.length}팀 전부`}
        </p>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
          {/* 지도 */}
          <div className="lg:order-2">
            <div className="lg:sticky lg:top-6">
              <h3 id="zf-map-title" className="text-[26px]" style={{ ...dF, color: C.black }}>
                부스 지도
              </h3>
              <BoothMap hit={new Set(list.map((s) => s.booth))} filtering={filtering} open={open} wishBooths={new Set(wish.map((id) => id.split("-")[0]))} onPick={pickBooth} />
              <WishList wish={wish} toggleWish={toggleWish} setWish={setWish} onOpen={pickBooth} />
            </div>
          </div>

          {/* 목록 */}
          <div className="lg:order-1">
          <ul className="grid content-start gap-3 md:grid-cols-2 md:items-start">
            {list.length === 0 && (
              <li className="rounded-[18px] border-[3px] border-dashed p-6 text-center text-[16px] font-bold" style={{ borderColor: C.black }}>
                걸린 셀러가 없어요. 태그를 하나 풀어 보세요.
              </li>
            )}
            {(filtering || all ? list : list.slice(0, 10)).map((s) => {
              const isOpen = open === s.booth;
              return (
                <li key={s.booth} id={`zf-s-${s.booth}`} className="scroll-mt-24 rounded-[18px] border-[3px] bg-white" style={{ borderColor: C.black, boxShadow: isOpen ? `5px 5px 0 ${C.blue}` : "none" }}>
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.booth)} className={`flex w-full items-center gap-3 rounded-[15px] px-4 py-3.5 text-left ${focusRing}`} style={{ outlineColor: C.blue }}>
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-full text-[15px] font-black text-white" style={{ background: isOpen ? C.pink : C.blue }}>
                      {s.booth}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[18px] font-extrabold" style={{ color: C.black }}>
                        {s.name}
                      </span>
                      <span className="mt-0.5 flex flex-wrap gap-1">
                        {s.tags.map((t) => (
                          <span key={t} className="rounded-full px-2 py-0.5 text-[12px] font-bold" style={{ background: tags.includes(t) ? C.pink : "#efe7ff", color: tags.includes(t) ? "white" : C.ink }}>
                            {t}
                          </span>
                        ))}
                      </span>
                    </span>
                    <ChevronDown size={20} className={`flex-none transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {isOpen && (
                    <ul className="grid gap-2 border-t-[3px] border-dashed px-4 py-3" style={{ borderColor: C.black }}>
                      {s.items.map((it) => {
                        const on = wish.includes(it.id);
                        return (
                          <li key={it.id} className="flex items-center justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block text-[16px] font-bold">{it.title}</span>
                              <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                                {won(it.price)}
                              </span>
                            </span>
                            <button
                              type="button"
                              aria-pressed={on}
                              onClick={() => toggleWish(it.id)}
                              className={`${pill} flex-none border-[2.5px] px-3.5 py-2 text-[14px]`}
                              style={{ borderColor: C.black, background: on ? C.pink : "white", color: on ? "white" : C.black, outlineColor: C.blue }}
                            >
                              <Heart size={16} fill={on ? "currentColor" : "none"} aria-hidden /> {on ? "담았어요" : "담기"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          {!filtering && !all && (
            <button type="button" onClick={() => setAll(true)} className={`${pill} mt-4 w-full border-[3px] py-3.5 text-[16px]`} style={{ borderColor: C.black, color: C.black, background: C.yellow, outlineColor: C.blue }}>
              나머지 {SELLERS.length - 10}팀 더 보기
            </button>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 창고 2층 평면도. 세 줄에 부스 8개씩, 아래가 입구 */
function BoothMap({ hit, filtering, open, wishBooths, onPick }: { hit: Set<string>; filtering: boolean; open: string | null; wishBooths: Set<string>; onPick: (b: string) => void }) {
  const BW = 58;
  const BH = 42;
  const x0 = 34;
  const rows: [string, number][] = [
    ["A", 40],
    ["B", 140],
    ["C", 240],
  ];
  return (
    <div id="zf-map" className="mt-3 scroll-mt-6 rounded-[18px] border-[3px] bg-white p-2" style={{ borderColor: C.black }}>
      <svg viewBox="0 0 560 360" className="block h-auto w-full" role="group" aria-label="부스 지도. 위에서부터 A, B, C줄, 아래가 입구">
        <rect x="6" y="6" width="548" height="348" rx="10" fill={C.paper} stroke={C.black} strokeWidth="3" />
        {rows.map(([r, y]) =>
          Array.from({ length: 8 }, (_, i) => {
            const b = `${r}${i + 1}`;
            const x = x0 + i * (BW + 4);
            const isHit = hit.has(b);
            const isOpen = open === b;
            const dim = filtering && !isHit;
            return (
              <g
                key={b}
                role="button"
                tabIndex={0}
                aria-label={`${b} ${SELLERS.find((s) => s.booth === b)?.name}${wishBooths.has(b) ? ", 담은 진 있음" : ""}`}
                onClick={() => onPick(b)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPick(b);
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-[#ff4fa3] [&:focus-visible>rect:first-child]:[stroke-width:5]"
              >
                <rect x={x} y={y} width={BW} height={BH} rx="6" fill={isOpen ? C.yellow : filtering && isHit ? C.pink : "white"} stroke={C.black} strokeWidth="2.5" opacity={dim ? 0.35 : 1} />
                <text x={x + BW / 2} y={y + BH / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={filtering && isHit && !isOpen ? "white" : C.black} opacity={dim ? 0.45 : 1}>
                  {b}
                </text>
                {wishBooths.has(b) && <circle cx={x + BW - 6} cy={y + 6} r="7" fill={C.blue} stroke={C.black} strokeWidth="2" />}
              </g>
            );
          }),
        )}
        {/* 통로 표시 */}
        {[107, 207].map((y) => (
          <path key={y} d={`M34 ${y + 4}H526`} stroke={C.blue} strokeWidth="2" strokeDasharray="4 8" opacity="0.6" />
        ))}
        <rect x="34" y="300" width="130" height="36" rx="8" fill={C.blue} opacity="0.9" />
        <text x="99" y="323" textAnchor="middle" fontSize="13" fontWeight="800" fill="white">
          리소 체험 테이블
        </text>
        <rect x="396" y="300" width="130" height="36" rx="8" fill="none" stroke={C.black} strokeWidth="2" strokeDasharray="4 4" />
        <text x="461" y="323" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.black}>
          쉼터 · 물
        </text>
        <rect x="230" y="334" width="100" height="20" fill={C.black} />
        <text x="280" y="349" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.paper}>
          입구
        </text>
      </svg>
      <p className="px-2 pb-1 pt-2 text-[13px] font-bold" style={{ color: C.muted }}>
        노란 칸은 지금 연 셀러, 파란 점은 진을 담아 둔 부스예요.
      </p>
    </div>
  );
}

function WishList({ wish, toggleWish, setWish, onOpen }: { wish: string[]; toggleWish: (id: string) => void; setWish: (v: string[]) => void; onOpen: (b: string) => void }) {
  const items = wish.map((id) => ITEM_BY_ID[id]).filter(Boolean);
  // 입구에서 도는 순서대로
  const ordered = [...items].sort((a, b) => ROUTE.indexOf(a.seller.booth) - ROUTE.indexOf(b.seller.booth));
  const total = items.reduce((n, it) => n + it.price, 0);
  return (
    <div id="zf-wish" className="mt-6 scroll-mt-6 rounded-[18px] border-[3px] p-5" style={{ borderColor: C.black, background: "#e8efff" }}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[24px]" style={{ ...dF, color: C.black }}>
          미리 담기
        </h3>
        <p className="text-[15px] font-extrabold tabular-nums" aria-live="polite">
          {items.length}권 · {won(total)}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
          셀러를 열고 하트를 누르면 여기 모여요. 입구에서부터 도는 순서로 정리해 드려요.
        </p>
      ) : (
        <>
          <p className="mt-2 text-[14px] font-bold" style={{ color: C.muted }}>
            입구에서부터 이 순서로 돌면 돼요.
          </p>
          <ol className="mt-3 grid gap-2">
            {ordered.map((it, i) => (
              <li key={it.id} className="flex items-center gap-3 rounded-[12px] border-[2.5px] bg-white px-3 py-2" style={{ borderColor: C.black }}>
                <span className="w-5 flex-none text-center text-[18px]" style={dF}>
                  {i + 1}
                </span>
                <button type="button" onClick={() => onOpen(it.seller.booth)} className={`min-w-0 flex-1 text-left ${focusRing}`} style={{ outlineColor: C.blue }}>
                  <span className="block truncate text-[15px] font-bold">{it.title}</span>
                  <span className="block text-[13px]" style={{ color: C.muted }}>
                    {it.seller.booth} {it.seller.name} · {won(it.price)}
                  </span>
                </button>
                <button type="button" onClick={() => toggleWish(it.id)} aria-label={`${it.title} 빼기`} className={`grid h-9 w-9 flex-none place-items-center rounded-full ${focusRing}`} style={{ outlineColor: C.blue }}>
                  <X size={18} aria-hidden />
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
            담기만 해 두는 목록이에요. 결제는 부스에서 해요. 계좌이체만 받는 셀러도 있어요.
          </p>
          <button type="button" onClick={() => setWish([])} className={`mt-2 inline-flex items-center gap-1.5 text-[14px] font-bold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.blue }}>
            <RotateCcw size={14} aria-hidden /> 다 비우기
          </button>
        </>
      )}
    </div>
  );
}

/* ── 5. 묻고 답하기 ───────────────────────────────────── */

const FAQ = [
  { q: "등록 안 하고 가도 되나요?", a: "돼요. 현장 입장료 2,000원을 내고 현장 줄에 서요. 오후 1시와 3시는 사전 등록으로 거의 차서 기다릴 수 있어요." },
  { q: "카드 결제가 되나요?", a: "부스마다 달라요. 계좌이체만 받는 셀러가 많아서 현금이나 이체를 준비해 오면 편해요." },
  { q: "셀러로 참가하고 싶어요", a: "이번 셀러 모집은 끝났어요. 다음 장터 모집은 인스타그램에 먼저 올려요." },
  { q: "리소 체험은 따로 신청하나요?", a: "입구 옆 체험 테이블에서 바로 해요. 엽서 한 장을 두 색으로 찍어 가요. 재료비 3,000원이에요." },
  { q: "아이와 같이 가도 되나요?", a: "같이 오셔도 돼요. 초등학생 이하는 등록 인원에서 빼고 와도 돼요." },
];

function Faq() {
  return (
    <div className="mt-6 grid gap-2">
      {FAQ.map((f) => (
        <details key={f.q} className="group rounded-[16px] border-[3px] bg-white" style={{ borderColor: C.black }}>
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-[13px] px-4 py-3.5 text-[17px] font-extrabold [&::-webkit-details-marker]:hidden ${focusRing}`} style={{ outlineColor: C.blue, color: C.black }}>
            {f.q}
            <ChevronDown size={20} className="flex-none transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <p className="px-4 pb-4 text-[16px] leading-[1.7]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
