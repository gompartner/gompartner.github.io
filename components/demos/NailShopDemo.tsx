"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Car, Check, CircleAlert, Clock, MapPin, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 네일샵 홈페이지 샘플: 가상의 곰파트너 네일샵. 젤네일, 패디, 케어, 아트.
   상호, 주소, 직원 이름은 모두 가상이다.
   첫 화면 사진과 이달의 아트 사진은 AI 생성(Z-Image-Turbo)

   국내 네일샵 홈페이지와 네이버 예약의 공통 구성을 따랐다.
   메뉴는 이달의 아트, 시술 가격, 예약하기, 오시는 길 네 개.
   첫 화면에는 이달의 아트 사진과 가격표, 예약 버튼이 같이 있고, 시술 메뉴는 젤 제거, 케어, 원컬러, 아트(손톱당), 패디로 나뉜다.
   예약은 날짜, 시간, 담당 디자이너, 시술을 고르고 이름과 휴대폰을 남긴다. 변경과 취소는 하루 전까지가 관용 문구다.

   모션
   - 이달의 아트 칸을 누르면 사진을 크게 보는 창이 짧게 나타난다. 동작 줄이기가 켜져 있으면 바로 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 이달의 아트 크게 보기, 이 아트로 예약(요청 사항에 아트 이름이 들어간다).
   2. 예약: 날짜(오늘부터 7일), 시간, 담당, 시술, 이름, 휴대폰. 접수 완료 화면.
   3. 샵 안내와 오시는 길: 영업시간(오늘 요일 진하게), 주차, 예약제. */

const IMG = "/images/demo-nail-shop";

const BRAND = "네일샵";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const KAKAO = "카카오톡 채널 네일샵";

/** 320ms, 부드럽게 멈추는 곡선 */
const DUR = 0.32;
const EASE = [0.22, 1, 0.36, 1] as const;

/** plum 은 글자색(먹색), accent 는 버튼과 선택 표시에만 쓰는 차분한 로즈 */
const C = {
  bg: "#f7f7f5",
  paper: "#ffffff",
  plum: "#111111",
  plumSoft: "#767676",
  accent: "#9a5b6a",
  roseSoft: "#f4eef0",
  line: "#e5e5e5",
  error: "#b42318",
};
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");


/* 메뉴 */

type ArtId = "none" | "french" | "glitter" | "pearl" | "flower" | "check" | "marble" | "chrome" | "magnet";
const ARTS: { id: ArtId; label: string; price: number }[] = [
  { id: "none", label: "없음", price: 0 },
  { id: "french", label: "프렌치", price: 3000 },
  { id: "glitter", label: "글리터", price: 4000 },
  { id: "pearl", label: "진주 펄", price: 5000 },
  { id: "flower", label: "꽃", price: 5000 },
  { id: "check", label: "체크", price: 6000 },
  { id: "marble", label: "마블", price: 6000 },
  { id: "chrome", label: "크롬", price: 7000 },
  { id: "magnet", label: "마그네틱", price: 8000 },
];
const artOf = (id: ArtId) => ARTS.find((a) => a.id === id)!;

/** 이달의 아트 9개. 사진(art-*.jpg)마다 아트 종류 */
type Monthly = { img: string; name: string; art: ArtId; alt: string };
const MONTHLY: Monthly[] = [
  { img: "art-french", name: "누드 프렌치", art: "french", alt: "연한 분홍 바탕에 흰 끝선을 넣은 프렌치 네일" },
  { img: "art-glitter", name: "핑크 글리터", art: "glitter", alt: "분홍 바탕에 잔 글리터를 올린 네일" },
  { img: "art-magnet", name: "버건디 마그네틱", art: "magnet", alt: "버건디 바탕에 빛줄기가 도는 마그네틱 네일" },
  { img: "art-nude", name: "누드 원컬러", art: "none", alt: "맑은 누드 톤 원컬러 네일" },
  { img: "art-marble", name: "화이트 마블", art: "marble", alt: "흰 바탕에 회색 결을 그린 마블 네일" },
  { img: "art-flower", name: "데이지 포인트", art: "flower", alt: "분홍 바탕 두 손톱에 흰 꽃을 그린 네일" },
  { img: "art-check", name: "브라운 체크", art: "check", alt: "누드 바탕에 갈색 체크를 넣은 네일" },
  { img: "art-chrome", name: "실버 크롬", art: "chrome", alt: "은색으로 빛나는 크롬 네일" },
  { img: "art-pearl", name: "진주 펄 프렌치", art: "pearl", alt: "누드 바탕에 진주빛 펄을 올린 네일" },
];

const BASES = [
  { label: "젤 원컬러", price: 40000 },
  { label: "젤 그라데이션", price: 50000 },
];
const CARE = { price: 15000 };
const REMOVE = { price: 10000 };

const MENU: { group: string; rows: [string, string][] }[] = [
  { group: "손", rows: [["젤 제거", "10,000원"], ["손 케어", "15,000원"], ["젤 원컬러", "40,000원"], ["젤 그라데이션", "50,000원"], ["아트 (손톱당)", "3,000원~8,000원"]] },
  { group: "패디", rows: [["패디 케어", "25,000원"], ["패디 젤 원컬러", "50,000원"], ["패디 아트 (발톱당)", "3,000원~8,000원"]] },
];

/** 회원권. 충전 금액에 따라 추가 적립 */
const PASSES: [string, string][] = [
  ["20만원 충전", "2만원 추가 적립"],
  ["30만원 충전", "4만원 추가 적립"],
  ["50만원 충전", "8만원 추가 적립"],
];

/** 예약할 때 고르는 시술 */
const SERVICES = ["젤 원컬러", "젤 그라데이션", "이달의 아트", "손 케어만", "패디 젤 원컬러", "패디 케어만"];

const STAFF = [
  { role: "원장", name: "박ㅅ연" },
  { role: "디자이너", name: "이ㅈ아" },
  { role: "디자이너", name: "최ㅁ지" },
];

/** 요일별 영업시간. 월요일은 정기 휴무. [열림, 마지막 시작 시간+1] */
const HOURS: ([number, number] | null)[] = [[11, 19], null, [10, 20], [10, 20], [10, 20], [10, 20], [10, 20]];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 날짜, 시간, 담당별로 이미 찬 자리. 실제로는 예약 장부에서 읽는다. */
function booked(dayIdx: number, hour: number, staff: number) {
  let h = (dayIdx + 5) * 2654435761 + (hour + 3) * 40503 + (staff + 1) * 9176;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 100;
  const busy = hour >= 17 ? 22 : hour >= 13 ? 10 : 0;
  return h < 28 + busy;
}

export function NailShopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [artNote, setArtNote] = useState<string | null>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.plum }}>
      <Poster
        reduce={reduce}
        month={today.getMonth() + 1}
        go={go}
        onBook={(m) => {
          setArtNote(m.name);
          go("ns-reserve");
        }}
      />

      {/* 시술 메뉴 전체 */}
      <section id="ns-price" aria-labelledby="ns-price-title" className="mx-auto mt-6 max-w-[1200px] scroll-mt-4 px-4 md:mt-10 md:px-6">
        <h2 id="ns-price-title" className="font-bold tracking-[-0.02em] text-[30px] md:text-[38px]">
          시술 메뉴와 가격
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {MENU.map((m) => (
            <div key={m.group} className="rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
              <h3 className="font-bold tracking-[-0.02em] text-[20px]">
                {m.group}
              </h3>
              <dl className="mt-2 text-[16px] leading-[2]">
                {m.rows.map(([k, v]) => (
                  <Row key={k} k={k} v={v} />
                ))}
              </dl>
            </div>
          ))}
          <div className="rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
            <h3 className="font-bold tracking-[-0.02em] text-[20px]">
              아트 (손톱당)
            </h3>
            <dl className="mt-2 text-[16px] leading-[2]">
              {ARTS.filter((a) => a.price > 0).map((a) => (
                <Row key={a.id} k={a.label} v={won(a.price)} />
              ))}
            </dl>
          </div>
        </div>
        <p className="mt-3 text-[14px]" style={{ color: C.plumSoft }}>
          부가세 포함. 연장과 보수는 상담 후 안내해요.
        </p>

        <div className="mt-6 rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
          <h3 className="font-bold tracking-[-0.02em] text-[20px]">
            회원권
          </h3>
          <dl className="mt-2 grid gap-x-8 text-[16px] leading-[2] md:grid-cols-3">
            {PASSES.map(([k, v]) => (
              <Row key={k} k={k} v={v} />
            ))}
          </dl>
          <p className="mt-2 text-[14px]" style={{ color: C.plumSoft }}>
            회원권은 손과 패디 시술 모두에 쓸 수 있어요. 유효기간 1년.
          </p>
        </div>
      </section>

      {/* 예약 */}
      <section id="ns-reserve" aria-labelledby="ns-reserve-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <h2 id="ns-reserve-title" className="font-bold tracking-[-0.02em] text-[30px] md:text-[38px]">
          예약하기
        </h2>
        <ReserveForm today={today} reduce={reduce} artNote={artNote} />
      </section>


      {/* 샵 안내와 오시는 길 */}
      <section id="ns-info" aria-labelledby="ns-info-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <h2 id="ns-info-title" className="font-bold tracking-[-0.02em] text-[30px] md:text-[38px]">
          오시는 길
        </h2>
        <ShopInfo today={today} />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-28 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.plumSoft }}>
        <p>
          <SampleLogo />
        </p>
        <p>{ADDRESS}</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* 첫 화면 */

/* 첫 화면: 상단 메뉴 + 왼쪽 좁은 가격 판(이달 숫자, 기본가, 추가 조건) + 오른쪽 이달의 아트 손 사진 3x3.
   실제 네일샵 사이트의 "이달의 아트"와 가격 카드를 한 화면에 모은 형태. 칸을 누르면 사진을 크게 보고
   "이 아트로 예약"은 예약 요청 사항에 아트 이름을 넣는다.
   휴대폰 메뉴는 가로로 넘기는 탭 줄, 격자는 인스타 프로필처럼 3열 정사각. */
const NS_MENU: [string, string][] = [
  ["ns-art", "이달의 아트"],
  ["ns-price", "시술 가격"],
  ["ns-reserve", "예약"],
  ["ns-info", "오시는 길"],
];

function Poster({ reduce, month, go, onBook }: { reduce: boolean; month: number; go: (id: string) => void; onBook: (m: Monthly) => void }) {
  const navBtn = `min-h-11 flex-none rounded-[6px] px-3 text-[15px] font-semibold hover:underline hover:underline-offset-4 ${focusRing}`;
  return (
    <section id="ns-poster" aria-labelledby="ns-poster-title" style={{ background: C.bg }}>
      <header className="border-b" style={{ background: C.paper, borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <SampleLogo small />
          <nav aria-label="메뉴" className="hidden items-center gap-1 md:flex">
            {NS_MENU.filter(([id]) => id !== "ns-reserve").map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.plum }}>
                {label}
              </button>
            ))}
          </nav>
          <button type="button" onClick={() => go("ns-reserve")} data-gtm-cta="nail-shop_poster_cta" className={`inline-flex min-h-11 flex-none items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.plum }}>
            <CalendarCheck size={17} aria-hidden />
            예약하기
          </button>
        </div>
        {/* 휴대폰: 가로로 넘기는 탭 줄 */}
        <nav aria-label="메뉴" className="flex gap-1 overflow-x-auto border-t px-2 md:hidden" style={{ borderColor: C.line }}>
          {NS_MENU.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.plum }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-10 pt-4 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:gap-6 md:px-6 md:pb-12 md:pt-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* 가격 판 */}
        <div className="flex flex-col rounded-[8px] border p-4 md:p-6" style={{ background: C.paper, borderColor: C.line }}>
          <div className="flex items-center gap-4 md:block">
            <p className="flex flex-none items-baseline gap-1 md:gap-2">
              <span className="text-[44px] font-bold leading-none tracking-[-0.04em] tabular-nums md:text-[88px]" style={{ color: C.accent }}>
                {month}
              </span>
              <span className="text-[16px] font-bold md:text-[20px]">월 아트</span>
            </p>
            <h1 id="ns-poster-title" className="text-[20px] font-bold leading-[1.3] tracking-[-0.03em] [word-break:keep-all] md:mt-6 md:text-[28px]">
              손과 발 젤네일,
              <br />
              아트 개수별 가격
            </h1>
          </div>
          <p className="mt-3 border-t pt-3 text-[15px] md:hidden" style={{ borderColor: C.line }}>
            젤 원컬러 <b className="tabular-nums">{won(BASES[0].price)}</b>, 아트 손톱당 <b className="tabular-nums">3,000원부터</b>
          </p>
          <div className="hidden flex-1 flex-col md:flex">
          <dl className="mt-5 border-t pt-3 text-[15px] leading-[1.9]" style={{ borderColor: C.line }}>
            {[
              ["젤 원컬러", won(BASES[0].price)],
              ["젤 그라데이션", won(BASES[1].price)],
              ["아트 (손톱당)", "3,000원~8,000원"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt>{k}</dt>
                <dd className="font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-3 grid gap-0.5 text-[14px]" style={{ color: C.plumSoft }}>
            <li>젤 제거 {won(REMOVE.price)} 추가</li>
            <li>손 케어 {won(CARE.price)} 추가</li>
            <li>패디 젤 원컬러 50,000원</li>
          </ul>
          <p className="mt-auto pt-4 text-[14px] font-semibold">{BRAND}, 100% 예약제</p>
          </div>
        </div>

        {/* 이달의 아트 3x3. 칸을 누르면 크게 본다 */}
        <ArtGrid reduce={reduce} month={month} onBook={onBook} />
      </div>
    </section>
  );
}

function ArtGrid({ reduce, month, onBook }: { reduce: boolean; month: number; onBook: (m: Monthly) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const m = open === null ? null : MONTHLY[open];
  const art = m ? artOf(m.art) : null;
  const close = () => {
    const i = open;
    setOpen(null);
    if (i !== null) requestAnimationFrame(() => cells.current[i]?.focus());
  };
  useEffect(() => {
    if (open !== null) closeBtn.current?.focus();
  }, [open]);
  const t = { duration: reduce ? 0 : 0.18, ease: EASE };
  return (
    <div id="ns-art" className="min-w-0 scroll-mt-4">
      <div
        className="relative mx-auto aspect-square w-full overflow-hidden rounded-[8px] md:mx-0 md:max-w-[min(100%,calc(100svh-140px))]"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open !== null) close();
        }}
      >
        <ul aria-label={`${month}월 아트 9가지`} className="grid h-full grid-cols-3 grid-rows-3 gap-1 md:gap-1.5">
          {MONTHLY.map((x, i) => (
            <li key={x.img} className="min-h-0 min-w-0">
              <button
                ref={(el) => {
                  cells.current[i] = el;
                }}
                type="button"
                onClick={() => setOpen(i)}
                aria-haspopup="dialog"
                aria-label={`${x.name}, ${x.art === "none" ? "아트 없음" : `손톱당 ${won(artOf(x.art).price)}`}`}
                className={`group relative block h-full w-full overflow-hidden ${focusRing}`}
                style={{ background: C.roseSoft, outlineColor: C.plum, outlineOffset: -3 }}
                tabIndex={open === null ? 0 : -1}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img
                  src={`${IMG}/${x.img}.jpg`}
                  alt=""
                  loading={i < 3 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  sizes="(min-width: 768px) 260px, 33vw"
                  className={`h-full w-full object-cover ${reduce ? "" : "transition-transform duration-300 group-hover:scale-[1.03]"}`}
                />
                <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-[4px] px-1.5 py-0.5 text-[12px] font-semibold md:bottom-2 md:left-2 md:text-[13px]" style={{ background: "rgba(255,255,255,0.92)", color: C.plum }}>
                  {x.name}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {m && art && open !== null && (
            <motion.div
              key="open"
              role="dialog"
              aria-label={m.name}
              className="absolute inset-0 flex flex-col"
              style={{ background: C.paper }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={t}
            >
              <div className="relative min-h-0 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/${m.img}.jpg`} alt={m.alt} sizes="(min-width: 768px) 780px, 100vw" className="h-full w-full object-cover" />
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={close}
                  aria-label="닫기"
                  className={`absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full ${focusRing}`}
                  style={{ background: "rgba(255,255,255,0.94)", color: C.plum, outlineColor: C.plum }}
                >
                  <X size={20} aria-hidden />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t p-3 md:p-4" style={{ borderColor: C.line }}>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-bold md:text-[20px]">{m.name}</p>
                  <p className="text-[14px] tabular-nums" style={{ color: C.plumSoft }}>
                    {m.art === "none" ? `${won(BASES[0].price)}, 아트 없음` : `손톱당 ${won(art.price)}, 열 손톱 ${won(BASES[0].price + art.price * 10)}`}
                  </p>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <button type="button" onClick={() => { setOpen(null); onBook(m); }} data-gtm-cta="nail-shop_poster_book" className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white sm:flex-none ${focusRing}`} style={{ background: C.accent, outlineColor: C.plum }}>
                    <CalendarCheck size={17} aria-hidden />
                    이 아트로 예약
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt>{k}</dt>
      <dd className="font-bold tabular-nums">{v}</dd>
    </div>
  );
}

/* 예약 */

function ReserveForm({ today, reduce, artNote }: { today: Date; reduce: boolean; artNote: string | null }) {
  const [day, setDay] = useState(() => (HOURS[today.getDay()] ? 0 : 1));
  const [hour, setHour] = useState<number | null>(null);
  const [staff, setStaff] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  // 첫 화면 이달의 아트에서 "이 아트로 예약"을 누르면 요청 사항 첫 줄에 아트 이름을 넣는다
  const [lastNote, setLastNote] = useState<string | null>(null);
  if (artNote !== lastNote) {
    setLastNote(artNote);
    if (artNote) {
      setService("이달의 아트");
      const rest = memo.startsWith("이달의 아트") ? memo.split("\n").slice(1).join("\n") : memo;
      setMemo(`이달의 아트 ${artNote}${rest ? `\n${rest}` : ""}`);
    }
  }
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ no: string; date: Date; hour: number; staff: number; service: string; name: string; phone: string } | null>(null);
  const [nowH, setNowH] = useState(0);
  useEffect(() => {
    const f = requestAnimationFrame(() => setNowH(new Date().getHours()));
    return () => cancelAnimationFrame(f);
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => daysAgo(today, -i));
  const date = days[day];
  const hours = HOURS[date.getDay()];
  const slots = hours ? Array.from({ length: hours[1] - hours[0] }, (_, i) => hours[0] + i) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hour === null) return setErr("시간을 골라 주세요.");
    if (staff === null) return setErr("담당을 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setErr("휴대폰 번호를 다시 확인해 주세요.");
    setErr(null);
    const no = `N${String(date.getFullYear()).slice(2)}${p2(date.getMonth() + 1)}${p2(date.getDate())}-${hour}${staff}${p2(name.trim().length + phone.length)}`;
    setDone({ no, date, hour, staff, service, name, phone });
  };

  const fade = reduce ? { duration: 0 } : { duration: DUR, ease: EASE };

  return (
    <div className="mt-5 rounded-[8px] border p-4 md:p-6" style={{ background: C.paper, borderColor: C.line }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} aria-live="polite">
            <p className="inline-flex items-center gap-2 text-[26px] font-bold">
              <Check size={26} aria-hidden />
              예약이 접수됐어요
            </p>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-[16px] leading-[1.7] sm:grid-cols-[120px_minmax(0,1fr)]">
              <dt className="font-bold">예약번호</dt>
              <dd className="tabular-nums">{done.no}</dd>
              <dt className="font-bold">일시</dt>
              <dd>
                {fmtKo(done.date)} {p2(done.hour)}:00
              </dd>
              <dt className="font-bold">담당</dt>
              <dd>
                {STAFF[done.staff].role} {STAFF[done.staff].name}
              </dd>
              <dt className="font-bold">시술</dt>
              <dd>
                {done.service}
              </dd>
              <dt className="font-bold">예약자</dt>
              <dd>
                {maskName(done.name)} {maskPhone(done.phone)}
              </dd>
            </dl>
            <div className="mt-5 rounded-[8px] p-4 text-[15px] leading-[1.8]" style={{ background: C.roseSoft }}>
              <p>예약 확정 문자는 오늘 영업시간 안에 보내 드려요.</p>
              <p>변경과 취소는 예약 하루 전까지 {KAKAO} 또는 전화로 알려 주세요.</p>
              <p>디자인 상담은 방문 10분 전에 와 주시면 함께 봐요.</p>
            </div>
            <button type="button" onClick={() => setDone(null)} className={`mt-5 rounded-[6px] border px-5 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum }}>
              다른 예약 넣기
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <fieldset>
                <legend className="text-[16px] font-bold">날짜</legend>
                <div className="mt-2 grid grid-cols-7 gap-1.5">
                  {days.map((d, i) => {
                    const closed = !HOURS[d.getDay()];
                    const on = i === day;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={closed}
                        aria-pressed={on}
                        onClick={() => {
                          setDay(i);
                          setHour(null);
                        }}
                        className={`rounded-[8px] border px-1 py-2 text-center disabled:opacity-40 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum }}
                      >
                        <span className="block text-[12px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                        <span className="block text-[18px] font-bold tabular-nums">{d.getDate()}</span>
                        <span className="block text-[11px]">{closed ? "휴무" : `${HOURS[d.getDay()]![0]}~${HOURS[d.getDay()]![1]}시`}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[16px] font-bold">담당</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {STAFF.map((s, i) => {
                    const on = staff === i;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setStaff(i);
                          setHour(null);
                        }}
                        className={`rounded-[8px] border px-2 py-2.5 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.roseSoft : "transparent", outlineColor: C.plum }}
                      >
                        <span className="block text-[13px]" style={{ color: C.plumSoft }}>
                          {s.role}
                        </span>
                        <span className="block text-[16px] font-bold">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[16px] font-bold">시간</legend>
                <p className="mt-1 text-[13px]" style={{ color: C.plumSoft }}>
                  {staff === null ? "담당을 먼저 고르면 빈 시간이 보여요." : `${STAFF[staff].role} ${STAFF[staff].name}, ${fmtKo(date)}`}
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                  {slots.map((h) => {
                    const past = day === 0 && h <= nowH;
                    const full = staff !== null && booked(day, h, staff);
                    const off = past || full || staff === null;
                    const on = hour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={off}
                        aria-pressed={on}
                        onClick={() => setHour(h)}
                        className={`rounded-[8px] border px-1 py-2 text-[14px] tabular-nums disabled:opacity-40 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum, textDecoration: full ? "line-through" : undefined }}
                      >
                        {p2(h)}:00
                        {full && <span className="block text-[11px]">마감</span>}
                        {past && !full && <span className="block text-[11px]">지남</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div>
              <label className="block text-[16px] font-bold" htmlFor="ns-service">
                시술
              </label>
              <select id="ns-service" value={service} onChange={(e) => setService(e.target.value)} className={`mt-1 w-full rounded-[8px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }}>
                {SERVICES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <label className="mt-4 block text-[16px] font-bold" htmlFor="ns-name">
                이름
              </label>
              <input id="ns-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`mt-1 w-full rounded-[8px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />
              <label className="mt-4 block text-[16px] font-bold" htmlFor="ns-phone">
                휴대폰
              </label>
              <input id="ns-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={`mt-1 w-full rounded-[8px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />
              <label className="mt-4 block text-[16px] font-bold" htmlFor="ns-memo">
                요청사항
              </label>
              <textarea id="ns-memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="손톱 길이, 보수할 손톱 등" className={`mt-1 w-full rounded-[8px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />


              {err && (
                <p role="alert" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: C.error }}>
                  <CircleAlert size={16} aria-hidden />
                  {err}
                </p>
              )}
              <button type="submit" data-gtm-cta="nail-shop_reserve_submit" className={`mt-4 w-full rounded-[6px] px-5 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.plum }}>
                예약 접수
              </button>
              <p className="mt-2 text-[13px]" style={{ color: C.plumSoft }}>
                당일 예약은 전화로 확인해 주세요.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 샵 안내 */

function ShopInfo({ today }: { today: Date }) {
  const dow = today.getDay();
  const rows: [string, string][] = [
    ["월", "정기 휴무"],
    ["화~토", "10:00~20:00"],
    ["일", "11:00~19:00"],
  ];
  const todayRow = dow === 1 ? 0 : dow === 0 ? 2 : 1;
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid gap-4">
        <div className="rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
          <h3 className="font-bold tracking-[-0.02em] inline-flex items-center gap-2 text-[20px]">
            <Clock size={20} aria-hidden />
            영업시간
          </h3>
          <dl className="mt-2 text-[16px] leading-[2]">
            {rows.map(([k, v], i) => {
              const on = i === todayRow;
              return (
                <div key={k} className={`flex items-baseline justify-between gap-4 ${on ? "font-bold" : ""}`}>
                  <dt>
                    {k}
                    {on && <span className="ml-2 rounded-[6px] px-2 py-0.5 text-[12px]" style={{ background: C.accent, color: "#fff" }}>오늘</span>}
                  </dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-2 text-[14px]" style={{ color: C.plumSoft }}>
            마지막 예약은 마감 1시간 전. 공휴일은 휴무.
          </p>
        </div>
        <div className="rounded-[8px] border p-5 text-[16px] leading-[1.8]" style={{ background: C.paper, borderColor: C.line }}>
          <h3 className="font-bold tracking-[-0.02em] inline-flex items-center gap-2 text-[20px]">
            <Car size={20} aria-hidden />
            주차와 예약제
          </h3>
          <p className="mt-2">건물 지하 주차장 2시간 무료. 입구에서 3층 네일이라고 말씀해 주세요.</p>
          <p>100% 예약제로 운영해요. 당일 예약은 전화로 확인해 주세요.</p>
          <p>10분 넘게 늦으면 시술 범위가 줄어들 수 있어요.</p>
        </div>
      </div>
      <div className="rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
        <h3 className="font-bold tracking-[-0.02em] inline-flex items-center gap-2 text-[20px]">
          <MapPin size={20} aria-hidden />
          찾아오기
        </h3>
        <p className="mt-2 text-[16px] leading-[1.8]">
          {ADDRESS}
          <br />
          ㅇㅇ역 2번 출구에서 도보 4분. 1층에 약국이 있는 건물이에요.
        </p>
        <MiniMap />
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 400 220" className="mt-3 w-full rounded-[8px]" role="img" aria-label="약도. ㅇㅇ역 2번 출구에서 큰길을 따라 걸으면 오른쪽 건물 3층" style={{ background: C.bg }}>
      <rect x="0" y="92" width="400" height="36" fill="#fff" stroke={C.line} />
      <rect x="236" y="0" width="30" height="220" fill="#fff" stroke={C.line} />
      <path d="M0 110 H400" stroke={C.line} strokeWidth="2" strokeDasharray="10 8" />
      <circle cx="64" cy="110" r="16" fill={C.plum} />
      <text x="64" y="115" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="Pretendard, sans-serif">
        역
      </text>
      <text x="64" y="150" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.plum} fontFamily="Pretendard, sans-serif">
        ㅇㅇ역 2번 출구
      </text>
      <path d="M84 110 H236 V60 H300" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" />
      <rect x="300" y="24" width="72" height="56" rx="4" fill={C.roseSoft} stroke={C.accent} strokeWidth="1.5" />
      <text x="336" y="48" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.plum} fontFamily="Pretendard, sans-serif">
        네일샵
      </text>
      <text x="336" y="66" textAnchor="middle" fontSize="12" fill={C.plumSoft} fontFamily="Pretendard, sans-serif">
        3층 (1층 약국)
      </text>
      <text x="150" y="192" textAnchor="middle" fontSize="12" fill={C.plumSoft} fontFamily="Pretendard, sans-serif">
        큰길 따라 도보 4분
      </text>
    </svg>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>네일샵</span>
      </span>
    </span>
  );
}
