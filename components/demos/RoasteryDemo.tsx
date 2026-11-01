"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bell, Check, Clock, Coffee, Flame, MapPin, MessageCircle, Minus, Plus, ShoppingBag, Store, Truck, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 커피 로스터리 홈페이지 샘플: 가상의 로스터리 곰파트너. 원두 판매와 정기 구독, 카페 납품(도매)을 한다.
   상호, 주소, 손님 이름은 모두 가상이다.

   국내 로스터리 사이트 공통 구성(참고): 메뉴는 원두(싱글오리진, 블렌드), 로스팅 포인트(라이트~다크), 정기 구독,
   도매 문의(카페 납품), 오시는 길, 공지. 첫 화면은 이번 주 로스팅 원두와 구독 안내. 원두 카드에는 가공 방식(워시드, 내추럴),
   컵 노트, 로스팅 포인트, 200g 가격. 주문 뒤에는 "로스팅 후 발송", "주문 후 2~3일 내 발송" 문구를 쓴다.
   가격은 200g 14,000~18,000원 선, 구독은 10% 할인과 무료 배송이 흔하다.

   사진 출처: Pexels 사진 894695, 7125599, 9899790, 4177917, 36343666, 8987828, 10226668, 4820838

   모션: 첫 화면 사진이 1.06배에서 천천히 제자리로 오고, 표 행에 마우스를 올리면 사진이 그 배전 사진으로 바뀐다.
   동작 줄이기면 바로 바뀐다.

   구성(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 로스팅 포인트 안내: 라이트, 미디엄, 미디엄다크, 다크 사진과 맛 설명, 해당 원두.
   2. 원두 담기: 카드에서 담으면 하단 바에 봉수와 합계가 뜨고, 주문하기에서 분쇄, 이름, 휴대폰을 받아 접수 완료 화면을 보여 준다.
   3. 정기 구독: 구성별 정가와 구독가 표.
   4. 오시는 길과 영업시간: 오늘 요일을 진하게 표시한다.

   포스터 첫 화면(rs-poster): 사진 띠 아래 문장 "볶은 다음 날 발송하는 원두"와 이번 주 로스팅 표.
   글꼴은 Pretendard 한 벌, 바탕은 흰색, 정보 판은 옅은 회색. */

const BRAND = "커피 로스터리";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 커피 로스터리";
const IMG = "/images/demo-roastery";

/** 흰 바탕과 옅은 회색 판, 먹색 글자, 강조색은 차분한 커피 갈색 하나. brown, light, dark 는 로스팅 단계 색(정보용) */
const C = {
  paper: "#ffffff",
  paperDeep: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  accent: "#7a4a2a",
  brown: "#8b5a2b",
  light: "#c08a4e",
  dark: "#2e1a0e",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 사진 전환 */
const DUR = 0.4;
/** 바, 시트 등장 */
const DUR_FAST = 0.22;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 원두와 로스팅 포인트 ---------- */

type Roast = "라이트" | "미디엄" | "미디엄다크" | "다크";
const ROASTS: Roast[] = ["라이트", "미디엄", "미디엄다크", "다크"];
const ROAST_TONE: Record<Roast, string> = {
  라이트: C.light,
  미디엄: C.brown,
  미디엄다크: "#5a331a",
  다크: C.dark,
};
/** 원두 카드 썸네일 사진 */
const ROAST_PHOTO: Record<Roast, string> = {
  라이트: "stage-light.jpg",
  미디엄: "stage-medium.jpg",
  미디엄다크: "stage-medium.jpg",
  다크: "stage-dark.jpg",
};
const ROAST_ALT: Record<Roast, string> = {
  라이트: "밝은 갈색으로 볶은 라이트 로스트 원두",
  미디엄: "고른 갈색의 미디엄 로스트 원두",
  미디엄다크: "진한 갈색으로 볶은 미디엄다크 원두",
  다크: "표면에 기름이 도는 다크 로스트 원두",
};
const ROAST_DESC: Record<Roast, string> = {
  라이트: "꽃향과 과일 산미가 또렷해요. 핸드드립에 맞아요.",
  미디엄: "단맛과 산미가 고르게 나와요. 처음 고르는 분께 권해요.",
  미디엄다크: "초콜릿과 견과 맛이 진해요. 라떼에도 잘 어울려요.",
  다크: "묵직한 바디와 긴 여운. 에스프레소와 모카포트용이에요.",
};

interface Bean {
  id: string;
  name: string;
  origin: string;
  process: string;
  roast: Roast;
  cup: string;
  /** 200g 가격 */
  price: number;
}
const BEANS: Bean[] = [
  {
    id: "yirg",
    name: "에티오피아 예가체프 G1",
    origin: "싱글오리진",
    process: "워시드",
    roast: "라이트",
    cup: "자스민, 레몬, 홍차",
    price: 18000,
  },
  {
    id: "kenya",
    name: "케냐 AA",
    origin: "싱글오리진",
    process: "워시드",
    roast: "라이트",
    cup: "블랙커런트, 자몽, 흑설탕",
    price: 18000,
  },
  {
    id: "huila",
    name: "콜롬비아 우일라 수프리모",
    origin: "싱글오리진",
    process: "워시드",
    roast: "미디엄",
    cup: "캐러멜, 오렌지, 아몬드",
    price: 15000,
  },
  {
    id: "morning",
    name: "아침 블렌드",
    origin: "블렌드",
    process: "브라질, 콜롬비아",
    roast: "미디엄",
    cup: "밀크초콜릿, 살구, 고소함",
    price: 14000,
  },
  {
    id: "guate",
    name: "과테말라 안티구아 SHB",
    origin: "싱글오리진",
    process: "워시드",
    roast: "미디엄다크",
    cup: "다크초콜릿, 견과, 스모키",
    price: 16000,
  },
  {
    id: "brazil",
    name: "브라질 세하도 NY2",
    origin: "싱글오리진",
    process: "내추럴",
    roast: "미디엄다크",
    cup: "땅콩, 코코아, 진한 바디",
    price: 14000,
  },
  {
    id: "mandheling",
    name: "인도네시아 만델링 G1",
    origin: "싱글오리진",
    process: "세미워시드",
    roast: "다크",
    cup: "허브, 흙내, 묵직한 바디",
    price: 16000,
  },
  {
    id: "night",
    name: "저녁 블렌드",
    origin: "블렌드",
    process: "브라질, 만델링",
    roast: "다크",
    cup: "비터초콜릿, 캐러멜, 긴 여운",
    price: 14000,
  },
];
const beanById = (id: string) => BEANS.find((b) => b.id === id) ?? BEANS[0];

/* ---------- 분쇄 ---------- */

type Grind = "홀빈" | "핸드드립" | "에스프레소" | "모카포트" | "콜드브루";
const GRINDS: { name: Grind; use: string }[] = [
  { name: "홀빈", use: "통원두" },
  { name: "핸드드립", use: "드리퍼, 커피메이커" },
  { name: "에스프레소", use: "가정용 에스프레소 머신" },
  { name: "모카포트", use: "모카포트, 에어로프레스" },
  { name: "콜드브루", use: "콜드브루, 프렌치프레스" },
];

/* ---------- 구독 ---------- */

/** 아침 블렌드 기준 구독 구성. 정가는 200g 가격 기준 500g 2.2배, 1kg 4배(천 원 단위), 구독은 10% 할인(백 원 단위) */
const SUB_BEAN = "아침 블렌드";
const SUB_PLANS: { name: string; note: string; price: number }[] = [
  { name: "200g 1봉", note: "혼자 하루 한 잔", price: 14000 },
  { name: "200g 2봉", note: "두 사람이 하루 한 잔씩", price: 28000 },
  { name: "500g 1봉", note: "가족, 작은 사무실", price: 31000 },
  { name: "1kg 1봉", note: "사무실, 매일 여러 잔", price: 56000 },
];
const subPrice = (n: number) => Math.round((n * 0.9) / 100) * 100;

/* ---------- 영업시간 ---------- */
const HOURS: { dow: number; label: string; open: string }[] = [
  { dow: 1, label: "월", open: "10:00 ~ 19:00" },
  { dow: 2, label: "화", open: "10:00 ~ 19:00 (로스팅)" },
  { dow: 3, label: "수", open: "10:00 ~ 19:00" },
  { dow: 4, label: "목", open: "10:00 ~ 19:00" },
  { dow: 5, label: "금", open: "10:00 ~ 19:00 (로스팅)" },
  { dow: 6, label: "토", open: "11:00 ~ 18:00" },
  { dow: 0, label: "일", open: "휴무" },
];

/** 다음 영업일(일요일 제외) */
const nextOpenDay = (d: Date) => {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0) n = daysAgo(n, -1);
  return n;
};

type Cart = Record<string, number>;

export function RoasteryDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [cart, setCart] = useState<Cart>({});
  const [sheet, setSheet] = useState<"closed" | "form" | "done">("closed");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });

  const bags = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((a, [id, n]) => a + beanById(id).price * n, 0);
  const add = (id: string, d: number) =>
    setCart((c) => {
      const n = Math.max(0, Math.min(9, (c[id] ?? 0) + d));
      const next = { ...c };
      if (n === 0) delete next[id];
      else next[id] = n;
      return next;
    });


  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} today={today} cart={cart} bags={bags} onAdd={add} go={go} />

      {/* 로스팅 포인트 */}
      <section id="rs-notes" aria-labelledby="rs-notes-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-notes-title" icon={<Flame size={22} aria-hidden />} title="로스팅 포인트" />
        <RoastGuide onJump={(id) => go(`bean-${id}`)} />
      </section>

      {/* 원두 */}
      <section id="rs-beans" aria-labelledby="rs-beans-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-beans-title" icon={<Coffee size={22} aria-hidden />} title="이번 주 로스팅 원두" />
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEANS.map((b) => (
            <BeanCard key={b.id} bean={b} count={cart[b.id] ?? 0} onAdd={(d) => add(b.id, d)} />
          ))}
        </ul>
        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          200g 기준, 화요일과 금요일에 로스팅해서 다음 날 발송해요. 분쇄는 주문할 때 고를 수 있어요. 3만 원 이상 무료 배송.
        </p>
      </section>

      {/* 정기 구독 */}
      <section id="rs-subscribe" aria-labelledby="rs-sub-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-sub-title" icon={<Truck size={22} aria-hidden />} title="정기 구독" />
        <Subscription />
      </section>

      {/* 도매 문의 */}
      <section id="rs-wholesale" aria-labelledby="rs-ws-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-ws-title" icon={<Store size={22} aria-hidden />} title="도매 문의" />
        <div className="mt-5 grid overflow-hidden rounded-[8px] border md:grid-cols-[minmax(0,360px)_1fr]" style={{ borderColor: C.line, background: C.paperDeep }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/packing.jpg`}
            alt="로스팅을 마친 원두를 봉투에 담아 밀봉하는 작업대"
            loading="lazy"
            width={800}
            height={1200}
            className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full"
            style={{ objectPosition: "50% 70%" }}
          />
          <div className="grid content-center gap-5 p-5 md:p-8">
            <dl className="grid gap-x-6 gap-y-2 text-[16px] sm:grid-cols-[auto_1fr]">
              <dt className="font-bold">납품 대상</dt>
              <dd>카페, 식당, 사무실</dd>
              <dt className="font-bold">최소 수량</dt>
              <dd>주 3kg 부터, 1kg 단위</dd>
              <dt className="font-bold">로스팅</dt>
              <dd>주문 뒤 가장 가까운 로스팅 날(화, 금)에 볶아 다음 날 발송</dd>
              <dt className="font-bold">샘플</dt>
              <dd>원하는 원두 2종 100g 씩 무료</dd>
            </dl>
            <p className="inline-flex items-center gap-2 justify-self-start rounded-[6px] px-4 py-3 text-[15px] font-semibold text-white" style={{ background: C.accent }}>
              <MessageCircle size={18} aria-hidden />
              {KAKAO}에 &quot;도매&quot;라고 남겨 주세요
            </p>
          </div>
        </div>
      </section>

      {/* 오시는 길, 영업시간, 공지 */}
      <div className="mx-auto mt-14 grid max-w-[1200px] gap-10 px-4 md:mt-20 md:grid-cols-[1.2fr_1fr] md:px-6">
        <section id="rs-visit" aria-labelledby="rs-visit-title" className="scroll-mt-4">
          <SectionTitle id="rs-visit-title" icon={<MapPin size={22} aria-hidden />} title="오시는 길" />
          <Visit today={today} />
        </section>
        <section id="rs-notice" aria-labelledby="rs-notice-title" className="scroll-mt-4">
          <SectionTitle id="rs-notice-title" icon={<Bell size={22} aria-hidden />} title="공지" />
          <Notice today={today} />
        </section>
      </div>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p className="leading-none" style={{ color: C.ink }}>
          <BrandLogo />
        </p>
        <p>
          {ADDRESS} / {KAKAO}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>

      {/* 하단 고정 바: 담은 원두가 있을 때만 */}
      <AnimatePresence>
        {bags > 0 && sheet === "closed" && (
          <motion.div
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: DUR_FAST, ease: EASE }}
            className="fixed inset-x-0 bottom-[72px] z-40 px-4 print:hidden"
          >
            <div className="mx-auto flex max-w-[640px] items-center justify-between gap-3 rounded-[8px] px-4 py-3 text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]" style={{ background: C.ink }}>
              <p className="inline-flex items-center gap-2 text-[15px]">
                <ShoppingBag size={18} aria-hidden />
                <span>{bags}봉</span>
                <span className="text-[17px] font-bold">{won(total)}</span>
              </p>
              <button
                type="button"
                data-gtm-cta="roastery_order"
                onClick={() => setSheet("form")}
                className={`rounded-[6px] px-4 py-2 text-[15px] font-bold ${focusRing}`}
                style={{
                  background: C.paper,
                  color: C.ink,
                  outlineColor: C.paper,
                }}
              >
                주문하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheet !== "closed" && (
          <OrderSheet
            key="sheet"
            reduce={reduce}
            today={today}
            cart={cart}
            total={total}
            bags={bags}
            done={sheet === "done"}
            onDone={() => setSheet("done")}
            onClose={() => {
              if (sheet === "done") setCart({});
              setSheet("closed");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 공통 조각 ---------- */

function SectionTitle({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="font-bold inline-flex items-center gap-2 text-[26px] leading-tight md:text-[30px]">
      {icon}
      {title}
    </h2>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function BrandLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="text-[20px] font-bold tracking-[-0.03em]">{BRAND}</span>
      </span>
    </span>
  );
}

/* ---------- 0. 포스터 첫 화면 ---------- */

/** 첫 화면 표에 올리는 이번 주 원두 5종(배전이 고르게 섞이게) */
const POSTER_BEANS = ["yirg", "huila", "morning", "guate", "mandheling"].map(beanById);
const GNB: [string, string][] = [
  ["rs-beans", "원두"],
  ["rs-subscribe", "구독"],
  ["rs-wholesale", "도매"],
  ["rs-visit", "매장"],
];
/** 오늘이나 그 전 가장 가까운 로스팅 날(화, 금) */
const lastRoastDay = (d: Date) => {
  for (let n = 0; n < 7; n++) {
    const x = daysAgo(d, n);
    if (x.getDay() === 2 || x.getDay() === 5) return x;
  }
  return d;
};

function Poster({
  reduce,
  today,
  cart,
  bags,
  onAdd,
  go,
}: {
  reduce: boolean;
  today: Date;
  cart: Cart;
  bags: number;
  onAdd: (id: string, d: number) => void;
  go: (id: string) => void;
}) {
  // 표 행에 마우스를 올리거나 포커스하면 위 사진 띠가 그 원두의 배전 사진으로 바뀐다
  const [hover, setHover] = useState<Roast | null>(null);
  const photo = hover
    ? { src: `${IMG}/${ROAST_PHOTO[hover]}`, alt: `${hover} 로스트 원두`, pos: "50% 50%" }
    : { src: `${IMG}/hero.jpg`, alt: "로스터 냉각판 위에서 식고 있는 갓 볶은 원두", pos: "45% 50%" };
  const roastDay = lastRoastDay(today);
  const navBtn = `inline-flex h-11 shrink-0 items-center rounded-[4px] px-3 text-[16px] font-semibold hover:underline underline-offset-4 ${focusRing}`;

  return (
    <section id="rs-poster" aria-labelledby="rs-poster-title" style={{ background: C.paper, color: C.ink }}>
      {/* GNB */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 px-4 pt-3 md:flex-nowrap md:px-6 md:py-3">
          <p className="leading-none">
            <BrandLogo />
          </p>
          <nav aria-label="주요 메뉴" className="order-3 -mx-3 flex w-full gap-1 overflow-x-auto md:order-2 md:mx-0 md:w-auto md:gap-4">
            {GNB.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.ink }}>
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => go("rs-beans")}
            aria-label={`장바구니 ${bags}봉`}
            className={`relative order-2 inline-flex h-11 w-11 items-center justify-center rounded-[6px] md:order-3 ${focusRing}`}
            style={{ outlineColor: C.ink }}
          >
            <ShoppingBag size={22} aria-hidden />
            {bags > 0 && (
              <span className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[12px] font-bold tabular-nums text-white" style={{ background: C.accent }}>
                {bags}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 로스팅실 사진 띠 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-auto md:h-[40svh] md:min-h-[260px]" style={{ background: "#141414" }}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}>
          <AnimatePresence initial={false}>
            <motion.img
              key={photo.src}
              src={photo.src}
              srcSet={hover ? undefined : `${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
              sizes="100vw"
              alt={photo.alt}
              fetchPriority={hover ? undefined : "high"}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : DUR }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: photo.pos }}
            />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 이번 주 로스팅 표 */}
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-6 md:px-6 md:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 id="rs-poster-title" className="text-[28px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[36px]" style={{ wordBreak: "keep-all" }}>
            볶은 다음 날 발송하는 원두
          </h1>
          <p className="text-[15px]" style={{ color: C.body }}>
            로스팅 요일 화, 금 <span style={{ color: C.muted }}>/</span> 이번 로스팅 {fmtKo(roastDay)}
          </p>
        </div>

        <div className="mt-5 border-t-2" style={{ borderColor: C.ink }}>
          <div
            className="hidden gap-4 border-b py-2.5 text-[14px] font-semibold md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1.1fr)_auto]"
            style={{ borderColor: C.line, color: C.muted }}
            aria-hidden
          >
            <span>원두</span>
            <span>구분</span>
            <span>배전</span>
            <span>맛</span>
            <span>로스팅일</span>
            <span className="w-[92px] text-right">200g</span>
          </div>
          <ul>
            {POSTER_BEANS.map((b, i) => {
              const count = cart[b.id] ?? 0;
              return (
                <li
                  key={b.id}
                  onMouseEnter={() => setHover(b.roast)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(b.roast)}
                  onBlur={() => setHover(null)}
                  className={`${i >= 3 ? "hidden md:grid" : "grid"} grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b py-3 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1.1fr)_auto] md:gap-4`}
                  style={{ borderColor: C.line, background: hover === b.roast ? C.paperDeep : undefined }}
                >
                  <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 md:contents">
                    <span className="text-[17px] font-bold leading-snug">{b.name}</span>
                    <span className="hidden text-[15px] md:block" style={{ color: C.body }}>
                      {b.origin}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold md:text-[15px]">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ background: ROAST_TONE[b.roast] }} aria-hidden />
                      {b.roast}
                    </span>
                  </p>
                  <div className="row-span-2 md:order-last md:row-span-1">
                    <PosterAdd name={b.name} price={b.price} count={count} onAdd={(d) => onAdd(b.id, d)} />
                  </div>
                  <p className="flex min-w-0 flex-wrap gap-x-3 text-[14px] md:contents md:text-[15px]" style={{ color: C.body }}>
                    <span>{b.cup}</span>
                    <span className="tabular-nums" style={{ color: C.muted }}>
                      <span className="md:hidden">로스팅 </span>
                      {fmtKo(roastDay)}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => go("rs-beans")}
            className={`mt-3 inline-flex h-11 items-center gap-1 rounded-[6px] px-1 text-[15px] font-semibold underline underline-offset-4 ${focusRing}`}
            style={{ outlineColor: C.ink }}
          >
            원두 전체 보기 {BEANS.length}종
          </button>
        </div>
      </div>
    </section>
  );
}

/** 표 행 오른쪽 담기. 담은 행은 갈색으로 채워 담지 않은 행과 구분한다 */
function PosterAdd({ name, price, count, onAdd }: { name: string; price: number; count: number; onAdd: (d: number) => void }) {
  if (count === 0)
    return (
      <button
        type="button"
        data-gtm-cta="roastery_poster_add"
        onClick={() => onAdd(1)}
        aria-label={`${name} 담기`}
        className={`inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-[6px] border px-2.5 text-[15px] font-semibold tabular-nums md:w-[92px] ${focusRing}`}
        style={{ borderColor: C.ink, color: C.ink, outlineColor: C.ink }}
      >
        <Plus size={16} aria-hidden />
        <span className="hidden md:inline">{won(price)}</span>
      </button>
    );
  return (
    <div className="inline-flex h-11 items-center overflow-hidden rounded-[6px] text-white md:w-[92px]" style={{ background: C.accent }} role="group" aria-label={`${name} ${count}봉 담음`}>
      <button type="button" onClick={() => onAdd(-1)} aria-label="한 봉 빼기" className={`inline-flex h-11 w-8 items-center justify-center ${focusRing}`} style={{ outlineColor: C.ink }}>
        <Minus size={14} aria-hidden />
      </button>
      <span className="min-w-[2.5ch] flex-1 text-center text-[15px] font-bold tabular-nums">{count}봉</span>
      <button type="button" onClick={() => onAdd(1)} aria-label="한 봉 더" className={`inline-flex h-11 w-8 items-center justify-center ${focusRing}`} style={{ outlineColor: C.ink }}>
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );
}

/* ---------- 1. 로스팅 포인트 안내 ---------- */

function RoastGuide({ onJump }: { onJump: (id: string) => void }) {
  return (
    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {ROASTS.map((r) => (
        <li key={r} className="flex flex-col overflow-hidden rounded-[8px] border" style={{ borderColor: C.line }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img src={`${IMG}/${ROAST_PHOTO[r]}`} alt={ROAST_ALT[r]} loading="lazy" width={600} height={450} className="aspect-[4/3] w-full object-cover" />
          <div className="flex flex-1 flex-col p-4">
            <h3 className="inline-flex items-center gap-2 text-[19px] font-bold">
              <span className="inline-block h-3.5 w-3.5 rounded-full" style={{ background: ROAST_TONE[r] }} aria-hidden />
              {r}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.6]" style={{ color: C.body }}>
              {ROAST_DESC[r]}
            </p>
            <ul className="mt-auto grid gap-0.5 pt-3 text-[15px]">
              {BEANS.filter((b) => b.roast === r).map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => onJump(b.id)} className={`min-h-9 rounded-[4px] text-left font-semibold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.ink }}>
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- 2. 원두 카드와 담기 ---------- */

function BeanCard({ bean, count, onAdd }: { bean: Bean; count: number; onAdd: (d: number) => void }) {
  const tone = ROAST_TONE[bean.roast];
  const stepBtn = `inline-flex h-9 w-9 items-center justify-center rounded-[6px] border ${focusRing}`;
  return (
    <li id={`bean-${bean.id}`} className="flex scroll-mt-4 flex-col rounded-[8px] border p-4" style={{ borderColor: count > 0 ? C.accent : C.line, background: "#fff" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold" style={{ color: C.muted }}>
            {bean.origin} / {bean.process}
          </p>
          <h3 className="font-bold mt-1 text-[19px] leading-[1.3]">{bean.name}</h3>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
        <img src={`${IMG}/${ROAST_PHOTO[bean.roast]}`} alt="" aria-hidden loading="lazy" width={56} height={56} className="h-14 w-14 flex-none rounded-[6px] object-cover" />
      </div>
      <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
        {bean.cup}
      </p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-[14px]">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: tone }} aria-hidden />
        {bean.roast}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <p className="text-[17px] font-bold tabular-nums">
          {won(bean.price)}
          <span className="ml-1 text-[13px] font-normal" style={{ color: C.muted }}>
            200g
          </span>
        </p>
        {count === 0 ? (
          <button
            type="button"
            data-gtm-cta="roastery_add"
            onClick={() => onAdd(1)}
            className={`inline-flex h-9 items-center gap-1 rounded-[6px] px-3 text-[15px] font-bold ${focusRing}`}
            style={{
              background: C.accent,
              color: C.paper,
              outlineColor: C.ink,
            }}
          >
            <Plus size={16} aria-hidden /> 담기
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5" role="group" aria-label={`${bean.name} 수량`}>
            <button type="button" onClick={() => onAdd(-1)} aria-label="한 봉 빼기" className={stepBtn} style={{ borderColor: C.line, color: C.ink, outlineColor: C.ink }}>
              <Minus size={16} aria-hidden />
            </button>
            <span className="min-w-[2ch] text-center text-[17px] font-bold tabular-nums" aria-live="polite">
              {count}
            </span>
            <button
              type="button"
              onClick={() => onAdd(1)}
              aria-label="한 봉 더"
              className={stepBtn}
              style={{
                borderColor: C.ink,
                background: C.accent,
                color: C.paper,
                outlineColor: C.ink,
              }}
            >
              <Plus size={16} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/* ---------- 3. 정기 구독 ---------- */

function Subscription() {
  return (
    <div className="mt-5 grid gap-6 md:grid-cols-[1fr_minmax(260px,320px)] md:gap-10">
      <div>
        <table className="w-full border-collapse text-[15px] md:text-[16px]">
          <caption className="pb-2 text-left text-[14px]" style={{ color: C.muted }}>
            {SUB_BEAN} 기준, 2주마다 또는 4주마다
          </caption>
          <thead>
            <tr className="border-y-2 text-left" style={{ borderColor: C.ink }}>
              <th scope="col" className="py-2.5 pr-3 font-bold">구성</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-bold">정가</th>
              <th scope="col" className="py-2.5 text-right font-bold">회당 구독가</th>
            </tr>
          </thead>
          <tbody>
            {SUB_PLANS.map((p) => (
              <tr key={p.name} className="border-b" style={{ borderColor: C.line }}>
                <th scope="row" className="py-3 pr-3 text-left font-normal">
                  <span className="block font-bold">{p.name}</span>
                  <span className="block text-[14px]" style={{ color: C.muted }}>
                    {p.note}
                  </span>
                </th>
                <td className="py-3 pr-3 text-right tabular-nums" style={{ color: C.muted }}>
                  {won(p.price)}
                </td>
                <td className="py-3 text-right font-bold tabular-nums">{won(subPrice(p.price))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          싱글오리진은 200g 기준 1,000~4,000원이 더해져요.
        </p>
      </div>

      <div className="rounded-[8px] p-5" style={{ background: C.paperDeep }}>
        <p className="text-[17px] font-bold">구독 혜택</p>
        <ul className="mt-3 grid gap-1.5 text-[15px]">
          {["구독 10% 할인, 배송비 무료", "로스팅 다음 날 발송", "원두와 분쇄는 회차마다 바꿀 수 있어요", "다음 결제 전까지 언제든 해지"].map((t) => (
            <li key={t} className="flex items-start gap-1.5">
              <Check size={16} className="mt-1 flex-none" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 inline-flex items-center gap-2 rounded-[6px] px-4 py-2.5 text-[15px] font-bold" style={{ background: C.accent, color: C.paper }}>
          <MessageCircle size={16} aria-hidden /> {KAKAO}에서 구독 신청
        </p>
      </div>
    </div>
  );
}


/* ---------- 4. 주문 시트 ---------- */

function OrderSheet({
  reduce,
  today,
  cart,
  total,
  bags,
  done,
  onDone,
  onClose,
}: {
  reduce: boolean;
  today: Date;
  cart: Cart;
  total: number;
  bags: number;
  done: boolean;
  onDone: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [grind, setGrind] = useState<Grind>("홀빈");
  const [err, setErr] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const shipping = total >= 30000 ? 0 : 3000;
  const digits = phone.replace(/\D/g, "");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요.");
    if (digits.length < 10 || digits.length > 11) return setErr("휴대폰 번호를 확인해 주세요.");
    setErr(null);
    onDone();
  };

  const orderNo = `R${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-0${bags}${digits.slice(-2) || "00"}`;
  const roastDay = daysAgo(today, -2);
  const shipDay = daysAgo(today, -3);
  const replyDay = nextOpenDay(today);

  const field = `mt-1.5 w-full rounded-[6px] border px-3 py-2.5 text-[16px] ${focusRing}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center print:hidden"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR_FAST }}
    >
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rs-sheet-title"
        className="relative w-full max-w-[560px] rounded-t-[8px] p-5 md:mb-8 md:rounded-[8px] md:p-6"
        style={{
          background: C.paper,
          color: C.ink,
          maxHeight: "92dvh",
          overflowY: "auto",
        }}
        initial={reduce ? false : { y: 40 }}
        animate={{ y: 0 }}
        exit={reduce ? undefined : { y: 40 }}
        transition={{ duration: DUR_FAST, ease: EASE }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="rs-sheet-title" className="font-bold text-[24px] leading-tight">
            {done ? "주문 접수 완료" : "주문하기"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={`-mr-1 -mt-1 inline-flex h-9 w-9 items-center justify-center rounded-[6px] ${focusRing}`}
            style={{ outlineColor: C.ink }}
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <ul className="mt-4 divide-y rounded-[8px] border text-[15px]" style={{ borderColor: C.line }}>
          {Object.entries(cart).map(([id, n]) => {
            const b = beanById(id);
            return (
              <li key={id} className="flex items-center justify-between gap-3 px-3 py-2.5" style={{ borderColor: C.line }}>
                <span className="min-w-0">
                  <span className="block font-bold">{b.name}</span>
                  <span className="block text-[13px]" style={{ color: C.muted }}>
                    200g, {grind}
                  </span>
                </span>
                <span className="flex-none tabular-nums">
                  {n}봉 {won(b.price * n)}
                </span>
              </li>
            );
          })}
          <li className="flex items-center justify-between gap-3 px-3 py-2.5" style={{ borderColor: C.line, color: C.muted }}>
            <span>배송비</span>
            <span className="tabular-nums">{shipping === 0 ? "무료" : won(shipping)}</span>
          </li>
          <li className="flex items-center justify-between gap-3 px-3 py-3 font-bold" style={{ borderColor: C.line }}>
            <span>합계</span>
            <span className="text-[18px] tabular-nums">{won(total + shipping)}</span>
          </li>
        </ul>

        {!done ? (
          <form onSubmit={submit} noValidate className="mt-5 grid gap-4">
            <div>
              <label htmlFor="rs-grind" className="block text-[14px] font-bold">
                분쇄
              </label>
              <select
                id="rs-grind"
                value={grind}
                onChange={(e) => setGrind(e.target.value as Grind)}
                className={field}
                style={{
                  borderColor: C.line,
                  background: "#fff",
                  outlineColor: C.ink,
                }}
              >
                {GRINDS.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name} ({g.use})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
                주문한 원두 전체에 같은 분쇄가 적용돼요. 분쇄 원두는 2주 안에 드시는 걸 권해요.
              </p>
            </div>
            <div>
              <label htmlFor="rs-name" className="block text-[14px] font-bold">
                이름
              </label>
              <input
                ref={first}
                id="rs-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={field}
                style={{
                  borderColor: C.line,
                  background: "#fff",
                  outlineColor: C.ink,
                }}
              />
            </div>
            <div>
              <label htmlFor="rs-phone" className="block text-[14px] font-bold">
                휴대폰
              </label>
              <input
                id="rs-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="010-0000-0000"
                className={field}
                style={{
                  borderColor: C.line,
                  background: "#fff",
                  outlineColor: C.ink,
                }}
              />
            </div>
            {err && (
              <p role="alert" className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: C.error }}>
                <AlertCircle size={16} aria-hidden /> {err}
              </p>
            )}
            <p className="text-[14px]" style={{ color: C.muted }}>
              결제 안내와 배송 조회는 {KAKAO}로 보내 드려요.
            </p>
            <button
              type="submit"
              data-gtm-cta="roastery_submit"
              className={`rounded-[8px] py-3 text-[17px] font-semibold ${focusRing}`}
              style={{
                background: C.accent,
                color: C.paper,
                outlineColor: C.ink,
              }}
            >
              주문 접수
            </button>
          </form>
        ) : (
          <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR_FAST, ease: EASE }} className="mt-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 rounded-[8px] border p-4 text-[15px]" style={{ borderColor: C.line }}>
              <dt className="font-bold">주문번호</dt>
              <dd className="tabular-nums">{orderNo}</dd>
              <dt className="font-bold">주문자</dt>
              <dd>
                {maskName(name)} {maskPhone(phone)}
              </dd>
              <dt className="font-bold">확인 연락</dt>
              <dd>
                {fmtKo(replyDay)} 오전, {KAKAO}
              </dd>
              <dt className="font-bold">로스팅 예정</dt>
              <dd>{fmtKo(roastDay)}</dd>
              <dt className="font-bold">발송 예정</dt>
              <dd>{fmtKo(shipDay)}</dd>
              <dt className="font-bold">분쇄</dt>
              <dd>{grind}</dd>
            </dl>
            <p className="mt-4 text-[15px] leading-[1.6]">입금 계좌와 배송 조회 번호는 확인 연락 때 함께 보내 드려요. 발송 전까지는 분쇄와 수량을 바꿀 수 있어요.</p>
            <button type="button" onClick={onClose} className={`mt-5 w-full rounded-[8px] border py-3 text-[16px] font-semibold ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.ink }}>
              닫기
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------- 5. 오시는 길, 영업시간 ---------- */

function Visit({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-5 grid gap-5">
      <svg
        viewBox="0 0 400 200"
        className="w-full rounded-[8px] border"
        role="img"
        aria-label="약도: ㅇㅇ역 2번 출구에서 큰길을 따라 걷다 첫 골목에서 왼쪽"
        style={{ borderColor: C.line, background: C.paperDeep }}
      >
        <rect x="0" y="118" width="400" height="30" fill={C.paper} />
        <rect x="150" y="0" width="22" height="118" fill={C.paper} />
        <line x1="0" x2="400" y1="133" y2="133" stroke={C.line} strokeDasharray="10 8" strokeWidth="2" />
        <text x="320" y="112" fontSize="12" fill={C.muted}>
          ㅇㅇ로
        </text>
        <g>
          <rect x="40" y="150" width="60" height="22" rx="4" fill={C.ink} />
          <text x="70" y="165" fontSize="11" textAnchor="middle" fill={C.paper}>
            ㅇㅇ역 2번
          </text>
        </g>
        <path d="M70 150 L70 133 L161 133 L161 60" fill="none" stroke={C.accent} strokeWidth="3" strokeDasharray="6 5" />
        <g transform="translate(176 44)">
          <rect x="0" y="0" width="92" height="40" rx="4" fill="#fff" stroke={C.ink} strokeWidth="1" />
          <text x="46" y="25" fontSize="12" textAnchor="middle" fill={C.ink} fontWeight="700">
            {BRAND}
          </text>
        </g>
        <circle cx="161" cy="60" r="5" fill={C.ink} />
        <text x="190" y="104" fontSize="11" fill={C.muted}>
          편의점 옆 골목
        </text>
      </svg>

      <dl className="grid gap-x-6 gap-y-2 text-[16px] sm:grid-cols-[auto_1fr]">
        <dt className="font-bold">주소</dt>
        <dd>{ADDRESS}</dd>
        <dt className="font-bold">지하철</dt>
        <dd>ㅇㅇ역 2번 출구에서 걸어서 5분</dd>
        <dt className="font-bold">주차</dt>
        <dd>건물 앞 2대, 만차면 ㅇㅇ공영주차장(걸어서 3분)</dd>
      </dl>

      <div>
        <p className="inline-flex items-center gap-1.5 text-[16px] font-bold">
          <Clock size={18} aria-hidden /> 영업시간
        </p>
        <table className="mt-2 w-full border-collapse text-[15px]">
          <tbody>
            {HOURS.map((h) => {
              const isToday = h.dow === dow;
              return (
                <tr
                  key={h.dow}
                  className="border-b"
                  style={{
                    borderColor: C.line,
                    background: isToday ? C.paperDeep : "transparent",
                  }}
                >
                  <th scope="row" className={`w-[64px] py-2 pl-2 text-left ${isToday ? "font-bold" : "font-normal"}`} style={{ color: isToday ? C.ink : C.muted }}>
                    {h.label}
                    {isToday && (
                      <span className="ml-1.5 rounded-[4px] border px-1 text-[12px]" style={{ borderColor: C.ink }}>
                        오늘
                      </span>
                    )}
                  </th>
                  <td className={`py-2 pr-2 tabular-nums ${isToday ? "font-bold" : ""}`} style={{ color: isToday ? C.ink : C.muted }}>
                    {h.open}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
          로스팅 날은 오전에 매장 손님이 적어 시향하기 좋아요.
        </p>
      </div>
    </div>
  );
}

/* ---------- 6. 공지 ---------- */

function Notice({ today }: { today: Date }) {
  const items = [
    {
      ago: 2,
      title: "뉴크롭 입고, 에티오피아 예가체프 G1",
      body: "이번 수확분으로 바뀌었어요. 꽃향이 더 또렷해서 라이트로 볶어요.",
    },
    {
      ago: 9,
      title: "로스팅 요일 변경",
      body: "수요일 로스팅을 화요일과 금요일 두 번으로 나눴어요. 주문 뒤 발송이 하루 빨라져요.",
    },
    {
      ago: 16,
      title: "커핑 모임 모집, 토요일 오전",
      body: "이번 달 토요일 11시, 네 분까지. 매장 또는 카카오톡 채널로 신청해 주세요.",
    },
    {
      ago: 30,
      title: "선물 포장 안내",
      body: "200g 두 봉까지 종이 상자 포장을 무료로 해 드려요. 주문 때 적어 주세요.",
    },
  ];
  return (
    <ul className="mt-5 divide-y border-t" style={{ borderColor: C.line }}>
      {items.map((n) => {
        const d = daysAgo(today, n.ago);
        return (
          <li key={n.title} className="py-4" style={{ borderColor: C.line }}>
            <p className="text-[13px] tabular-nums" style={{ color: C.muted }}>
              {d.getFullYear()}.{p2(d.getMonth() + 1)}.{p2(d.getDate())} ({DOW[d.getDay()]})
            </p>
            <h3 className="font-bold mt-1 text-[18px] leading-[1.35]">{n.title}</h3>
            <p className="mt-1.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
              {n.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
