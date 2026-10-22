"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { AlertCircle, Bell, Check, ChevronDown, Clock, Coffee, Flame, MapPin, MessageCircle, Minus, Plus, ShoppingBag, Store, Truck, X } from "lucide-react";
import { Gowun_Batang, JetBrains_Mono } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 커피 로스터리 홈페이지 샘플: 가상의 곰파트너로스터리. 원두 판매와 정기 구독, 카페 납품(도매)을 한다.
   상호, 주소, 손님 이름은 모두 가상이다.

   국내 로스터리 사이트 공통 구성(참고): 메뉴는 원두(싱글오리진, 블렌드), 로스팅 포인트(라이트~다크), 정기 구독,
   도매 문의(카페 납품), 오시는 길, 공지. 첫 화면은 이번 주 로스팅 원두와 구독 안내. 원두 카드에는 가공 방식(워시드, 내추럴),
   컵 노트, 로스팅 포인트, 200g 가격. 주문 뒤에는 "로스팅 후 발송", "주문 후 2~3일 내 발송" 문구를 쓴다.
   가격은 200g 14,000~18,000원 선, 구독은 10% 할인과 무료 배송이 흔하다.

   핵심 모션: 첫 화면이 스크롤에 묶인 고정 장면이다. 스크롤을 내리면 큰 원두 그림이 생두 연두색에서 라이트, 미디엄, 다크까지
   색이 변하고, 옆에 로스팅 온도 곡선이 그려지며 단계 이름과 온도가 바뀐다. useScroll + useTransform 으로 색과 패스 길이를 묶는다.
   동작 줄이기면 다크까지 완성된 상태로 고정한다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 로스팅 단계 고르기: 라이트, 미디엄, 미디엄다크, 다크 칩을 누르면 맛 노트 막대(산미, 바디, 단맛)와 추천 원두가 바뀐다.
   2. 분쇄도 고르기: 홀빈, 핸드드립, 에스프레소, 모카포트, 콜드브루. 원두 알 그림이 그 굵기 입자로 바뀐다.
   3. 구독 계산: 주기, 용량, 봉수를 고르면 회당 금액과 월 환산 금액이 바뀐다.
   4. 원두 담기: 카드에서 담으면 하단 바에 봉수와 합계가 뜨고, 주문하기에서 이름과 휴대폰을 받아 접수 완료 화면을 보여 준다.
   5. 오시는 길과 영업시간: 오늘 요일을 진하게 표시한다.

   포스터 첫 화면(rs-poster): 진한 에스프레소 갈색 바탕에 큰 문장 "오늘 볶아서 내일 보내요" 하나만 둔다. 메뉴, 카드, 가격은 없다.
   오른쪽(휴대폰은 아래)에서 원두가 줄기처럼 쏟아지며 떨어지는 동안 생두 연두색에서 볶은 갈색으로 변하고, 바닥에 더미로 쌓인다.
   쌓인 원두 위로 김 두 줄이 천천히 오른다(반복 움직임은 이것 하나). 스크롤하면 원두 더미는 아래로 가라앉고 문장은 위로 빠진다.
   동작 줄이기면 쏟아지는 원두 없이 다 쌓인 더미와 멈춘 김으로 고정하고, 스크롤 퇴장도 없다. */

const serifF = { fontFamily: `${Gowun_Batang.style.fontFamily}, serif` } as const;
const monoF = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

const BRAND = "곰파트너로스터리";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  paper: "#f6efe3",
  paperDeep: "#ece1cf",
  ink: "#3b2314",
  brown: "#8b5a2b",
  light: "#c08a4e",
  dark: "#2e1a0e",
  muted: "#7a6552",
  line: "#d8c9b2",
  green: "#9fb37c",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 칩, 막대, 숫자 전환 */
const DUR = 0.4;
/** 바, 시트 등장 */
const DUR_FAST = 0.22;
/** 분쇄 입자 한 알씩 떨어지는 간격 */
const STAGGER = 0.004;
/** 고정 장면이 차지하는 스크롤 길이(화면 높이 배수) */
const SCENE_VH = 300;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 로스팅 장면 데이터 ---------- */

/** 스크롤 진행도(0~1)별 원두 색. 생두, 옐로우, 시나몬, 라이트, 미디엄, 미디엄다크, 다크 */
const BEAN_STOPS = [0, 0.25, 0.42, 0.5, 0.65, 0.8, 1];
const BEAN_COLORS = [C.green, "#d6bf7a", "#c9995a", "#b07a44", C.brown, "#5a331a", C.dark];

/** 진행도별 원두 온도(도). 생두 25도에서 시작해 1차 크랙 196도, 2차 크랙 224도를 지난다 */
const TEMP_STOPS = [0, 0.5, 0.65, 0.8, 0.92, 1];
const TEMPS = [25, 196, 210, 224, 230, 236];

/** 단계 이름과 시작 진행도 */
const STAGES = [
  { from: 0, name: "생두", note: "수분이 빠지며 색이 노랗게 변해요" },
  { from: 0.5, name: "1차 크랙", note: "탁 소리와 함께 알이 부풀어요" },
  { from: 0.65, name: "미디엄", note: "단맛과 산미가 균형을 잡아요" },
  { from: 0.8, name: "2차 크랙", note: "표면에 기름이 돌기 시작해요" },
  { from: 0.92, name: "다크", note: "쓴맛과 바디가 올라와요" },
];
const stageOf = (v: number) => {
  let i = 0;
  for (let k = 0; k < STAGES.length; k++) if (v >= STAGES[k].from) i = k;
  return i;
};

/** 온도 곡선 꼭지점. x는 시간(0~12분), y는 온도를 viewBox 320x200 좌표로 바꾼 값 */
const CURVE_PTS: [number, number][] = [
  [10, 176],
  [47.5, 122],
  [110, 85.5],
  [210, 52],
  [247.5, 41.8],
  [285, 31.6],
  [310, 22.9],
];
const CURVE_D = CURVE_PTS.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
/** 각 꼭지점까지의 누적 길이 비율 */
const CURVE_FRACS = (() => {
  const seg: number[] = [0];
  for (let i = 1; i < CURVE_PTS.length; i++) {
    const [ax, ay] = CURVE_PTS[i - 1];
    const [bx, by] = CURVE_PTS[i];
    seg.push(seg[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = seg[seg.length - 1];
  return seg.map((s) => s / total);
})();
/** 진행도별로 그려야 할 곡선 길이. 1차 크랙(0.5)은 네 번째 점, 미디엄은 다섯 번째, 2차 크랙은 여섯 번째 점에 맞춘다 */
const LEN_STOPS = [0, 0.5, 0.65, 0.8, 1];
const LEN_OUT = [0, CURVE_FRACS[3], CURVE_FRACS[4], CURVE_FRACS[5], 1];

/** 곡선 위 길이 비율 f 지점의 좌표 */
function pointAt(f: number): [number, number] {
  const t = Math.min(1, Math.max(0, f));
  for (let i = 1; i < CURVE_PTS.length; i++) {
    if (t <= CURVE_FRACS[i]) {
      const a = CURVE_FRACS[i - 1];
      const r = (t - a) / (CURVE_FRACS[i] - a || 1);
      const [ax, ay] = CURVE_PTS[i - 1];
      const [bx, by] = CURVE_PTS[i];
      return [ax + (bx - ax) * r, ay + (by - ay) * r];
    }
  }
  return CURVE_PTS[CURVE_PTS.length - 1];
}

/** 첫 화면 원두 7알의 자리와 기울기 */
const HERO_BEANS: [number, number, number][] = [
  [160, 92, -18],
  [92, 150, 22],
  [228, 148, -30],
  [120, 236, 8],
  [206, 240, 34],
  [56, 72, -40],
  [262, 70, 14],
];

/* ---------- 원두와 로스팅 포인트 ---------- */

type Roast = "라이트" | "미디엄" | "미디엄다크" | "다크";
const ROASTS: Roast[] = ["라이트", "미디엄", "미디엄다크", "다크"];
const ROAST_TONE: Record<Roast, string> = { 라이트: C.light, 미디엄: C.brown, 미디엄다크: "#5a331a", 다크: C.dark };
/** 산미, 바디, 단맛 (5점 만점) */
const ROAST_NOTES: Record<Roast, [number, number, number]> = {
  라이트: [5, 2, 3],
  미디엄: [3, 3, 4],
  미디엄다크: [2, 4, 4],
  다크: [1, 5, 3],
};
const ROAST_DESC: Record<Roast, string> = {
  라이트: "꽃향과 과일 산미가 또렷해요. 핸드드립에 맞아요.",
  미디엄: "단맛과 산미가 고르게 나와요. 처음 고르는 분께 권해요.",
  미디엄다크: "초콜릿과 견과 맛이 진해요. 라떼에도 잘 어울려요.",
  다크: "묵직한 바디와 긴 여운. 에스프레소와 모카포트용이에요.",
};
const NOTE_LABELS = ["산미", "바디", "단맛"];

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
  { id: "yirg", name: "에티오피아 예가체프 G1", origin: "싱글오리진", process: "워시드", roast: "라이트", cup: "자스민, 레몬, 홍차", price: 18000 },
  { id: "kenya", name: "케냐 AA", origin: "싱글오리진", process: "워시드", roast: "라이트", cup: "블랙커런트, 자몽, 흑설탕", price: 18000 },
  { id: "huila", name: "콜롬비아 우일라 수프리모", origin: "싱글오리진", process: "워시드", roast: "미디엄", cup: "캐러멜, 오렌지, 아몬드", price: 15000 },
  { id: "morning", name: "아침 블렌드", origin: "블렌드", process: "브라질, 콜롬비아", roast: "미디엄", cup: "밀크초콜릿, 살구, 고소함", price: 14000 },
  { id: "guate", name: "과테말라 안티구아 SHB", origin: "싱글오리진", process: "워시드", roast: "미디엄다크", cup: "다크초콜릿, 견과, 스모키", price: 16000 },
  { id: "brazil", name: "브라질 세하도 NY2", origin: "싱글오리진", process: "내추럴", roast: "미디엄다크", cup: "땅콩, 코코아, 진한 바디", price: 14000 },
  { id: "mandheling", name: "인도네시아 만델링 G1", origin: "싱글오리진", process: "세미워시드", roast: "다크", cup: "허브, 흙내, 묵직한 바디", price: 16000 },
  { id: "night", name: "저녁 블렌드", origin: "블렌드", process: "브라질, 만델링", roast: "다크", cup: "비터초콜릿, 캐러멜, 긴 여운", price: 14000 },
];
const beanById = (id: string) => BEANS.find((b) => b.id === id) ?? BEANS[0];

/* ---------- 분쇄도 ---------- */

type Grind = "홀빈" | "핸드드립" | "에스프레소" | "모카포트" | "콜드브루";
const GRINDS: { name: Grind; size: string; r: number; count: number; tip: string }[] = [
  { name: "홀빈", size: "통원두", r: 0, count: 0, tip: "집에 그라인더가 있으면 통원두가 가장 오래 향이 남아요" },
  { name: "핸드드립", size: "중간", r: 4.5, count: 48, tip: "드리퍼, 커피메이커용. 설탕 알 정도 굵기" },
  { name: "에스프레소", size: "아주 가늘게", r: 2.2, count: 150, tip: "가정용 에스프레소 머신용. 밀가루보다 조금 굵게" },
  { name: "모카포트", size: "가늘게", r: 3, count: 90, tip: "모카포트, 에어로프레스용" },
  { name: "콜드브루", size: "굵게", r: 7, count: 22, tip: "콜드브루, 프렌치프레스용. 굵은 소금 정도" },
];

/** 입자 자리. 그릇 모양 안에 고르게 흩어 놓는다. 같은 분쇄도면 항상 같은 그림 */
function particles(count: number, r: number) {
  const out: [number, number][] = [];
  let seed = count * 7919 + Math.round(r * 100);
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  let guard = 0;
  while (out.length < count && guard < count * 40) {
    guard++;
    const x = 20 + rnd() * 200;
    const y = 70 + rnd() * 72;
    // 바닥이 둥근 그릇 안쪽만
    const nx = (x - 120) / 100;
    const ny = (y - 70) / 78;
    if (nx * nx + ny * ny > 1) continue;
    if (out.some(([ox, oy]) => Math.hypot(ox - x, oy - y) < r * 1.9)) continue;
    out.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
  }
  return out;
}

/* ---------- 구독 ---------- */

type Size = 200 | 500 | 1000;
const SIZES: Size[] = [200, 500, 1000];
const sizeLabel = (s: Size) => (s === 1000 ? "1kg" : `${s}g`);
/** 200g 가격 기준 500g은 2.2배, 1kg은 4배(천 원 단위) */
const priceFor = (bean: Bean, size: Size) => (size === 200 ? bean.price : Math.round((bean.price * (size === 500 ? 2.2 : 4)) / 1000) * 1000);
const SUB_DISCOUNT = 0.1;

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

  const [roast, setRoast] = useState<Roast>("미디엄");
  const [grind, setGrind] = useState<Grind>("홀빈");
  const [cart, setCart] = useState<Cart>({});
  const [sheet, setSheet] = useState<"closed" | "form" | "done">("closed");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

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

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] hover:underline underline-offset-4 ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("rs-beans")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <h2 className="inline-flex items-center gap-2 text-[22px] leading-none" style={serifF}>
          <BeanMark size={26} color={C.ink} />
          {BRAND}
        </h2>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center" style={{ outlineColor: C.ink }}>
          {[
            ["rs-beans", "원두"],
            ["rs-notes", "로스팅 포인트"],
            ["rs-subscribe", "정기 구독"],
            ["rs-wholesale", "도매 문의"],
            ["rs-visit", "오시는 길"],
            ["rs-notice", "공지"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.ink }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <RoastScene reduce={reduce} />

      {/* 로스팅 포인트 */}
      <section id="rs-notes" aria-labelledby="rs-notes-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-notes-title" icon={<Flame size={22} aria-hidden />} title="로스팅 포인트" />
        <RoastPicker reduce={reduce} roast={roast} setRoast={setRoast} onJump={(id) => go(`bean-${id}`)} />
      </section>

      {/* 원두 */}
      <section id="rs-beans" aria-labelledby="rs-beans-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-beans-title" icon={<Coffee size={22} aria-hidden />} title="이번 주 로스팅 원두" />
        <div id="rs-grind" className="scroll-mt-4">
          <GrindPicker reduce={reduce} grind={grind} setGrind={setGrind} />
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEANS.map((b) => (
            <BeanCard key={b.id} bean={b} count={cart[b.id] ?? 0} onAdd={(d) => add(b.id, d)} />
          ))}
        </ul>
        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          200g 기준, 화요일과 금요일에 로스팅해서 다음 날 발송해요. 3만 원 이상 무료 배송.
        </p>
      </section>

      {/* 정기 구독 */}
      <section id="rs-subscribe" aria-labelledby="rs-sub-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-sub-title" icon={<Truck size={22} aria-hidden />} title="정기 구독" />
        <Subscription reduce={reduce} />
      </section>

      {/* 도매 문의 */}
      <section id="rs-wholesale" aria-labelledby="rs-ws-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="rs-ws-title" icon={<Store size={22} aria-hidden />} title="도매 문의" />
        <div className="mt-5 grid gap-5 rounded-[10px] border p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6" style={{ borderColor: C.line, background: C.paperDeep }}>
          <dl className="grid gap-x-6 gap-y-2 text-[16px] sm:grid-cols-[auto_1fr]">
            <dt className="font-bold">납품 대상</dt>
            <dd>카페, 식당, 사무실</dd>
            <dt className="font-bold">최소 수량</dt>
            <dd>
              주 <span style={monoF}>3kg</span> 부터, 1kg 단위
            </dd>
            <dt className="font-bold">로스팅</dt>
            <dd>주문 뒤 가장 가까운 로스팅 날(화, 금)에 볶아 다음 날 발송</dd>
            <dt className="font-bold">샘플</dt>
            <dd>
              원하는 원두 2종 <span style={monoF}>100g</span> 씩 무료
            </dd>
          </dl>
          <p className="inline-flex items-center gap-2 rounded-[6px] px-4 py-3 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            <MessageCircle size={18} aria-hidden />
            {KAKAO}에 &quot;도매&quot;라고 남겨 주세요
          </p>
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
        <p className="text-[16px]" style={{ ...serifF, color: C.ink }}>
          {BRAND}
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
            <div className="mx-auto flex max-w-[640px] items-center justify-between gap-3 rounded-[10px] px-4 py-3 text-white shadow-[0_8px_24px_rgba(59,35,20,0.25)]" style={{ background: C.ink }}>
              <p className="inline-flex items-center gap-2 text-[15px]">
                <ShoppingBag size={18} aria-hidden />
                <span>
                  <span style={monoF}>{bags}</span>봉
                </span>
                <span className="text-[17px] font-bold" style={monoF}>
                  {won(total)}
                </span>
              </p>
              <button
                type="button"
                data-gtm-cta="roastery_order"
                onClick={() => setSheet("form")}
                className={`rounded-[6px] px-4 py-2 text-[15px] font-bold ${focusRing}`}
                style={{ background: C.paper, color: C.ink, outlineColor: C.paper }}
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
            grind={grind}
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
    <h2 id={id} className="inline-flex items-center gap-2 text-[26px] leading-tight md:text-[30px]" style={serifF}>
      {icon}
      {title}
    </h2>
  );
}

/** 원두 한 알. 가운데 금은 반투명 어두운 선 */
function BeanShape({ x, y, rot, scale = 1, crease = "rgba(0,0,0,0.35)" }: { x: number; y: number; rot: number; scale?: number; crease?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d="M0,-45 C25,-45 30,-20 30,0 C30,20 25,45 0,45 C-25,45 -30,20 -30,0 C-30,-20 -25,-45 0,-45 Z" fill="currentColor" />
      <path d="M0,-38 C-8,-20 8,-10 -4,10 C-10,25 2,32 0,38" fill="none" stroke={crease} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function BeanMark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden style={{ color }}>
      <BeanShape x={0} y={0} rot={-30} />
    </svg>
  );
}

/* ---------- 0. 포스터 첫 화면 ---------- */

/** 포스터 색. 에스프레소 갈색 바탕, 주황 주색, 쌀빛 글자 */
const P = {
  bg: "#1e110a",
  bgDeep: "#120a05",
  cream: "#f6efe3",
  orange: "#f08a3a",
  sub: "#cdb79c",
  greenBean: "#a9bb80",
  yellow: "#d8c07a",
  cinnamon: "#b9824a",
  roasted: "#6b3d1f",
};
/** 원두 한 알 모양(가로 60, 세로 90 기준) */
const BEAN_D = "M0,-45 C25,-45 30,-20 30,0 C30,20 25,45 0,45 C-25,45 -30,20 -30,0 C-30,-20 -25,-45 0,-45 Z";
const BEAN_CREASE = "M0,-38 C-8,-20 8,-10 -4,10 C-10,25 2,32 0,38";
const BEAN_SHINE = "M-19,-28 C-25,-12 -25,8 -19,22";

/** 쏟아지는 줄기의 가로 중심(viewBox 600x900 좌표)과 더미 꼭대기 높이 */
const STREAM_X = 310;
const LAND_Y = 500;
/** 등장 연출: 첫 알 출발 0.1초, 알 사이 0.048초, 한 알 낙하 0.75초. 마지막 알이 1.86초에 닿는다 */
const POUR_START = 0.1;
const POUR_GAP = 0.048;
const POUR_FALL = 0.75;
/** 떨어질수록 빨라지는 중력 느낌의 ease-in */
const EASE_FALL = [0.5, 0, 0.9, 0.5] as const;
/** 김 한 바퀴 7.5초, 두 줄은 반 바퀴 어긋나게 */
const STEAM_LOOP = 7.5;
/** 스크롤 퇴장: 포스터 래퍼 진행도 0~0.44 안에서 끝낸다(래퍼 180svh 중 고정이 풀리는 지점) */
const EXIT_END = 0.44;

/** 줄기로 떨어지는 22알: 가로 흔들림, 처음 기울기, 떨어지며 도는 각도 */
const STREAM: [number, number, number][] = Array.from({ length: 22 }, (_, i) => {
  const dx = Math.round(Math.sin(i * 2.4) * 16);
  const rot = Math.round(((i * 53) % 160) - 80);
  const spin = (i % 2 ? 1 : -1) * (90 + ((i * 37) % 90));
  return [dx, rot, spin];
});

/** 쌓인 원두 38알: x, y, 기울기. 아래 줄부터 위로. 앞 20알은 처음부터 있고 나머지는 원두가 떨어지는 동안 쌓인다 */
const PILE: [number, number, number][] = [
  [87, 809, -24], [154, 808, 36], [240, 810, 39], [315, 806, -75], [382, 805, -19], [468, 811, -63], [540, 806, 48],
  [98, 766, -32], [164, 766, -38], [238, 759, 66], [303, 765, -61], [378, 767, 54], [442, 767, -20], [519, 761, -72],
  [116, 709, -10], [198, 718, -12], [266, 712, -2], [345, 710, -57], [422, 717, -19], [503, 718, -55],
  [151, 664, -10], [209, 663, -35], [278, 670, -40], [350, 666, 68], [412, 669, 9], [473, 661, -8],
  [171, 622, -77], [236, 619, -47], [309, 616, -42], [379, 622, 45], [448, 616, 68],
  [196, 574, -70], [273, 568, 47], [353, 565, -37], [418, 570, -29],
  [248, 520, 39], [308, 528, -71], [373, 517, -54],
];
const PILE_STATIC = 20;
const PILE_TONES = ["#5a331a", "#6b3d1f", "#4a2914", "#7a4824"];
/** 더미 바닥 윤곽 */
const MOUND_D = "M80 822 C120 720 214 566 310 506 C406 566 500 720 540 822 C430 842 190 842 80 822 Z";

/** 입체 원두 한 알. 바탕색 위에 빛 그라디언트, 금, 하이라이트 한 줄을 겹친다 */
function Bean3D({ fill }: { fill: string }) {
  return (
    <>
      <path d={BEAN_D} fill={fill} />
      <path d={BEAN_D} fill="url(#rs-p-shade)" />
      <path d={BEAN_CREASE} fill="none" stroke="rgba(20,10,4,0.55)" strokeWidth="4.5" strokeLinecap="round" />
      <path d={BEAN_SHINE} fill="none" stroke="rgba(255,240,220,0.55)" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : Math.min(1, v / EXIT_END)));
  // 원두 더미는 아래로 가라앉고 문장은 위로 빠진다
  const pileY = useTransform(p, (v) => `${v * v * 70}svh`);
  const textY = useTransform(p, (v) => `${-v * 45}svh`);
  const textO = useTransform(p, [0.35, 1], [1, 0]);

  // 줄기가 끝나고 더미가 다 쌓이는 시점
  const pileDone = POUR_START + (STREAM.length - 1) * POUR_GAP + POUR_FALL;
  const pileAppear = (j: number) => POUR_START + POUR_FALL * 0.9 + ((j - PILE_STATIC) / (PILE.length - PILE_STATIC)) * (pileDone - POUR_START - POUR_FALL * 0.9);

  return (
    <section id="rs-poster" ref={ref} aria-labelledby="rs-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: P.bg }}>
      <div className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`} style={{ background: `radial-gradient(120% 80% at 78% 100%, #3a2112 0%, ${P.bg} 55%, ${P.bgDeep} 100%)`, color: P.cream }}>
        {/* 원두 그림 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[66svh] justify-center md:inset-y-0 md:left-auto md:right-[3vw] md:h-full md:justify-end">
          <motion.svg
            viewBox="0 0 600 900"
            className="h-full w-auto"
            style={{ y: pileY, maskImage: "linear-gradient(to bottom, transparent 0%, #000 16%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 16%)" }}
            role="img"
            aria-label="위에서 쏟아지며 연두색 생두에서 갈색으로 볶아지는 원두와 바닥에 쌓인 원두 더미"
          >
            <defs>
              <radialGradient id="rs-p-shade" cx="0.34" cy="0.28" r="0.8">
                <stop offset="0" stopColor="#fff6e8" stopOpacity="0.5" />
                <stop offset="0.42" stopColor="#fff6e8" stopOpacity="0" />
                <stop offset="0.78" stopColor="#0d0603" stopOpacity="0.25" />
                <stop offset="1" stopColor="#0d0603" stopOpacity="0.6" />
              </radialGradient>
              <radialGradient id="rs-p-mound" cx="0.5" cy="0.15" r="0.9">
                <stop offset="0" stopColor="#3e2311" />
                <stop offset="1" stopColor="#160b05" />
              </radialGradient>
              <radialGradient id="rs-p-floor" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#000" stopOpacity="0.65" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="rs-p-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor={P.orange} stopOpacity="0.28" />
                <stop offset="1" stopColor={P.orange} stopOpacity="0" />
              </radialGradient>
              <linearGradient id="rs-p-steam" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor={P.cream} stopOpacity="0" />
                <stop offset="0.35" stopColor={P.cream} stopOpacity="0.6" />
                <stop offset="1" stopColor={P.cream} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 볶은 열기와 바닥 그림자 */}
            <ellipse cx="310" cy="640" rx="300" ry="270" fill="url(#rs-p-glow)" />
            <ellipse cx="310" cy="842" rx="300" ry="30" fill="url(#rs-p-floor)" />

            {/* 김 두 줄 */}
            {[
              ["M286 488 C266 438 308 408 286 358 C268 318 300 290 286 250", 0],
              ["M340 492 C322 446 360 418 340 372 C324 334 354 308 340 270", STEAM_LOOP / 2],
            ].map(([d, delay]) => (
              <motion.path
                key={d as string}
                d={d as string}
                fill="none"
                stroke="url(#rs-p-steam)"
                strokeWidth="7"
                strokeLinecap="round"
                initial={reduce ? false : { opacity: 0, y: 0 }}
                animate={reduce ? { opacity: 0.45, y: 0 } : { opacity: [0, 0.75, 0], y: [10, -50, -90] }}
                transition={reduce ? { duration: 0 } : { duration: STEAM_LOOP, delay: pileDone + (delay as number), repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 1] }}
              />
            ))}

            {/* 더미 바탕. 원두 사이 틈이 바탕색으로 비지 않게 */}
            <motion.path
              d={MOUND_D}
              fill="url(#rs-p-mound)"
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
              initial={reduce ? false : { scaleY: 0.45 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: reduce ? 0 : pileDone - 0.5, delay: reduce ? 0 : 0.5, ease: EASE }}
            />

            {/* 쌓인 원두 */}
            {PILE.map(([x, y, r], j) => (
              <g key={j} transform={`translate(${x} ${y})`}>
                <motion.g
                  initial={reduce || j < PILE_STATIC ? false : { opacity: 0, y: -18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.22, delay: reduce ? 0 : pileAppear(j), ease: EASE }}
                >
                  <g transform={`rotate(${r}) scale(0.85)`}>
                    <Bean3D fill={PILE_TONES[j % PILE_TONES.length]} />
                  </g>
                </motion.g>
              </g>
            ))}

            {/* 쏟아지는 원두. 떨어지는 동안 생두 연두색에서 볶은 갈색으로 */}
            {!reduce &&
              STREAM.map(([dx, rot, spin], i) => {
                const t = { duration: POUR_FALL, delay: POUR_START + i * POUR_GAP, ease: EASE_FALL };
                return (
                  <motion.g key={i} initial={{ y: -80, opacity: 1 }} animate={{ y: [-80, LAND_Y - 10, LAND_Y + 4], opacity: [1, 1, 0] }} transition={{ ...t, times: [0, 0.9, 1] }}>
                    <g transform={`translate(${STREAM_X + dx} 0)`}>
                      <motion.g initial={{ rotate: rot, scale: 0.72 }} animate={{ rotate: rot + spin, scale: 0.72 }} transition={t}>
                        <motion.path d={BEAN_D} initial={{ fill: P.greenBean }} animate={{ fill: [P.greenBean, P.greenBean, P.yellow, P.cinnamon, P.roasted] }} transition={{ ...t, ease: "linear", times: [0, 0.5, 0.7, 0.85, 1] }} />
                        <path d={BEAN_D} fill="url(#rs-p-shade)" />
                        <path d={BEAN_CREASE} fill="none" stroke="rgba(20,10,4,0.5)" strokeWidth="4.5" strokeLinecap="round" />
                        <path d={BEAN_SHINE} fill="none" stroke="rgba(255,240,220,0.55)" strokeWidth="3" strokeLinecap="round" />
                      </motion.g>
                    </g>
                  </motion.g>
                );
              })}
          </motion.svg>
        </div>

        {/* 로고와 핵심 행동 하나. 문장과 같이 위로 빠져 겹치지 않는다 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none" style={serifF}>
            <BeanMark size={20} color={P.orange} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="원두 고르기"
            title="원두 고르기"
            data-gtm-cta="roastery_poster_cta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: P.orange, color: P.bg, outlineColor: P.cream }}
          >
            <ShoppingBag size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[1] flex h-full flex-col px-4 pt-[15svh] md:justify-center md:px-12 md:pb-[6svh] md:pt-0" style={{ y: textY, opacity: textO }}>
          <h1 id="rs-poster-title" className="text-[clamp(52px,16vw,72px)] font-bold leading-[1.1] tracking-[-0.03em] md:text-[clamp(96px,11.2vw,196px)] md:leading-[1.04]" style={{ ...serifF, wordBreak: "keep-all" }}>
            <span className="block">오늘 볶아서</span>
            <span className="block" style={{ color: P.orange }}>
              내일 보내요
            </span>
          </h1>
          <p className="mt-5 text-[16px] md:mt-8 md:text-[19px]" style={{ color: P.sub }}>
            로스팅 요일 화, 금
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- 1. 스크롤 고정 로스팅 장면 ---------- */

function RoastScene({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // 동작 줄이기면 다크까지 볶은 상태로 고정
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));

  const beanColor = useTransform(progress, BEAN_STOPS, BEAN_COLORS);
  // 볶으면서 알이 부풀어 1.12배까지
  const beanScale = useTransform(progress, [0, 0.5, 1], [1, 1.04, 1.12]);
  const sheen = useTransform(progress, [0.8, 1], [0, 0.45]);
  const smoke = useTransform(progress, [0.55, 0.75, 1], [0, 0.35, 0.6]);
  const hint = useTransform(progress, [0, 0.06], [1, 0]);

  const temp = useTransform(progress, TEMP_STOPS, TEMPS);
  const tempText = useTransform(temp, (v) => `${Math.round(v)}도`);
  const pathLen = useTransform(progress, LEN_STOPS, LEN_OUT);
  const dotX = useTransform(pathLen, (f) => pointAt(f)[0]);
  const dotY = useTransform(pathLen, (f) => pointAt(f)[1]);
  const crack1 = useTransform(progress, [0.49, 0.52], [0, 1]);
  const crack2 = useTransform(progress, [0.79, 0.82], [0, 1]);

  const [scrolled, setScrolled] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    const s = stageOf(v);
    setScrolled((p) => (p === s ? p : s));
  });
  const stage = reduce ? STAGES.length - 1 : scrolled;

  return (
    <div id="rs-roast" ref={ref} className="relative scroll-mt-4" style={reduce ? undefined : { height: `${SCENE_VH}vh` }}>
      <div className={reduce ? "" : "sticky top-0 h-[100dvh]"}>
        <div className="mx-auto grid h-full max-w-[1200px] grid-rows-[minmax(0,1fr)_auto] gap-4 px-4 pb-6 pt-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:grid-rows-1 md:items-center md:gap-10 md:px-6 md:pb-10">
          {/* 원두 */}
          <div className="relative flex min-h-0 items-center justify-center">
            <motion.svg viewBox="0 0 320 320" className="h-auto max-h-full w-full max-w-[460px]" role="img" aria-label="로스팅 단계에 따라 색이 변하는 원두" style={{ color: beanColor }}>
              {/* 연기 */}
              <motion.g style={{ opacity: smoke }} fill="none" stroke={C.muted} strokeWidth="3" strokeLinecap="round">
                <path d="M120 22 C110 10 130 2 120 -10" />
                <path d="M160 16 C150 4 170 -4 160 -16" />
                <path d="M200 24 C190 12 210 4 200 -8" />
              </motion.g>
              <motion.g style={{ scale: beanScale }}>
                {HERO_BEANS.map(([x, y, r], i) => (
                  <BeanShape key={i} x={x} y={y} rot={r} />
                ))}
                {/* 다크로 가면 표면에 기름기 */}
                <motion.g style={{ opacity: sheen }} fill="#fff">
                  {HERO_BEANS.map(([x, y, r], i) => (
                    <ellipse key={i} cx={x - 8} cy={y - 14} rx="6" ry="12" transform={`rotate(${r} ${x} ${y})`} />
                  ))}
                </motion.g>
              </motion.g>
            </motion.svg>
            {!reduce && (
              <motion.span className="absolute bottom-0 left-1/2 -translate-x-1/2 md:hidden" style={{ opacity: hint, color: C.muted }} aria-hidden>
                <ChevronDown size={26} />
              </motion.span>
            )}
          </div>

          {/* 단계, 온도, 곡선 */}
          <div className="min-h-0">
            <p className="text-[15px] font-bold" style={{ color: C.muted }}>
              이번 주 로스팅
            </p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-[38px] leading-none md:text-[52px]" style={serifF}>
                {STAGES[stage].name}
              </p>
              <p className="text-[34px] leading-none tabular-nums md:text-[44px]" style={monoF}>
                <motion.span>{tempText}</motion.span>
              </p>
            </div>
            <p className="mt-2 min-h-[1.6em] text-[16px]" style={{ color: C.muted }}>
              {STAGES[stage].note}
            </p>

            <svg viewBox="0 0 340 200" className="mt-3 max-h-[30dvh] w-full max-w-[520px] md:max-h-none" role="img" aria-label="12분 동안 25도에서 236도까지 오르는 로스팅 온도 곡선">
              {/* 눈금 */}
              {[196, 224].map((t) => {
                const y = 180 - ((t - 20) / 220) * 160;
                return (
                  <g key={t}>
                    <line x1="10" x2="310" y1={y} y2={y} stroke={C.line} strokeDasharray="3 4" />
                    <text x="312" y={y + 3} fontSize="9" fill={C.muted} style={monoF}>
                      {t}
                    </text>
                  </g>
                );
              })}
              <line x1="10" x2="310" y1="180" y2="180" stroke={C.line} />
              {[0, 4, 8, 12].map((m) => (
                <text key={m} x={10 + (m / 12) * 300} y="194" fontSize="9" textAnchor={m === 12 ? "end" : m === 0 ? "start" : "middle"} fill={C.muted} style={monoF}>
                  {m}분
                </text>
              ))}
              {/* 전체 곡선은 흐리게, 진행한 부분만 진하게 */}
              <path d={CURVE_D} fill="none" stroke={C.line} strokeWidth="2" />
              <motion.path d={CURVE_D} fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" style={{ pathLength: pathLen }} />
              <motion.g style={{ opacity: crack1 }}>
                <circle cx={CURVE_PTS[3][0]} cy={CURVE_PTS[3][1]} r="5" fill={C.paper} stroke={C.ink} strokeWidth="2" />
                <text x={CURVE_PTS[3][0]} y={CURVE_PTS[3][1] + 20} fontSize="10" textAnchor="middle" fill={C.ink}>
                  1차 크랙
                </text>
              </motion.g>
              <motion.g style={{ opacity: crack2 }}>
                <circle cx={CURVE_PTS[5][0]} cy={CURVE_PTS[5][1]} r="5" fill={C.paper} stroke={C.ink} strokeWidth="2" />
                <text x={CURVE_PTS[5][0] - 4} y={CURVE_PTS[5][1] + 20} fontSize="10" textAnchor="middle" fill={C.ink}>
                  2차 크랙
                </text>
              </motion.g>
              <motion.g style={{ x: dotX, y: dotY }}>
                <circle r="6" fill={C.ink} />
              </motion.g>
            </svg>

            {/* 단계 눈금 */}
            <ol className="mt-3 grid grid-cols-5 gap-1 text-[12px] md:text-[13px]" aria-label="로스팅 단계">
              {STAGES.map((s, i) => (
                <li key={s.name} className="min-w-0">
                  <span className="block h-[4px] rounded-[2px]" style={{ background: i <= stage ? C.ink : C.line }} aria-hidden />
                  <span className={`mt-1 block truncate ${i === stage ? "font-bold" : ""}`} style={{ color: i === stage ? C.ink : C.muted }}>
                    {s.name}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. 로스팅 단계 고르기 ---------- */

function RoastPicker({ reduce, roast, setRoast, onJump }: { reduce: boolean; roast: Roast; setRoast: (r: Roast) => void; onJump: (id: string) => void }) {
  const notes = ROAST_NOTES[roast];
  const picks = BEANS.filter((b) => b.roast === roast);
  const tone = ROAST_TONE[roast];

  return (
    <div className="mt-5 grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
      <div>
        <div role="group" aria-label="로스팅 단계" className="flex flex-wrap gap-2">
          {ROASTS.map((r) => {
            const on = r === roast;
            return (
              <button
                key={r}
                type="button"
                aria-pressed={on}
                onClick={() => setRoast(r)}
                className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[15px] font-bold transition-colors duration-150 ${focusRing}`}
                style={{ borderColor: on ? C.ink : C.line, background: on ? C.ink : "transparent", color: on ? C.paper : C.ink, outlineColor: C.ink }}
              >
                <span className="inline-block h-3.5 w-3.5 rounded-full border" style={{ background: ROAST_TONE[r], borderColor: on ? C.paper : C.ink }} aria-hidden />
                {r}
              </button>
            );
          })}
        </div>
        <p className="mt-4 max-w-[420px] text-[17px] leading-[1.6]">{ROAST_DESC[roast]}</p>

        <dl className="mt-5 grid max-w-[420px] gap-3">
          {NOTE_LABELS.map((label, i) => (
            <div key={label} className="grid grid-cols-[48px_1fr_40px] items-center gap-3 text-[15px]">
              <dt className="font-bold">{label}</dt>
              <dd className="h-3 overflow-hidden rounded-[2px]" style={{ background: C.paperDeep }}>
                <motion.span
                  className="block h-full w-full origin-left rounded-[2px]"
                  initial={false}
                  animate={{ scaleX: notes[i] / 5, backgroundColor: tone }}
                  transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                />
              </dd>
              <dd className="text-right tabular-nums" style={monoF}>
                {notes[i]}/5
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-[10px] border p-4 md:p-5" style={{ borderColor: C.line }}>
        <p className="text-[15px] font-bold" style={{ color: C.muted }}>
          {roast} 추천 원두
        </p>
        <ul className="mt-2 divide-y" style={{ borderColor: C.line }}>
          {picks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-3" style={{ borderColor: C.line }}>
              <button type="button" onClick={() => onJump(b.id)} className={`min-w-0 text-left ${focusRing} rounded-[4px]`} style={{ outlineColor: C.ink }}>
                <span className="block text-[17px] font-bold">{b.name}</span>
                <span className="block text-[14px]" style={{ color: C.muted }}>
                  {b.cup}
                </span>
              </button>
              <span className="flex-none text-[15px] tabular-nums" style={monoF}>
                {won(b.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- 3. 분쇄도 고르기 ---------- */

function GrindPicker({ reduce, grind, setGrind }: { reduce: boolean; grind: Grind; setGrind: (g: Grind) => void }) {
  const cur = GRINDS.find((g) => g.name === grind) ?? GRINDS[0];
  const pts = useMemo(() => particles(cur.count, cur.r), [cur.count, cur.r]);

  return (
    <div className="mt-5 grid items-center gap-5 rounded-[10px] border p-4 md:grid-cols-[240px_1fr] md:gap-8 md:p-5" style={{ borderColor: C.line, background: C.paperDeep }}>
      <svg viewBox="0 0 240 160" className="mx-auto w-full max-w-[240px]" role="img" aria-label={`${cur.name} 굵기로 간 원두`} style={{ color: C.brown }}>
        {/* 그릇 */}
        <path d="M18 70 Q120 190 222 70 Z" fill={C.paper} stroke={C.line} strokeWidth="2" />
        {/* 분쇄도가 바뀌면 입자를 새로 떨어뜨린다 */}
        <g key={grind}>
            {cur.count === 0
              ? [
                  [92, 96, -20],
                  [128, 102, 25],
                  [112, 128, 70],
                  [148, 122, -60],
                  [76, 124, 40],
                ].map(([x, y, r], i) => (
                  <motion.g key={i} initial={reduce ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.3, ease: EASE, delay: reduce ? 0 : i * 0.03 }}>
                    <BeanShape x={x} y={y} rot={r} scale={0.34} />
                  </motion.g>
                ))
              : pts.map(([x, y], i) => (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={cur.r}
                    fill="currentColor"
                    initial={reduce ? false : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.3, ease: EASE, delay: reduce ? 0 : Math.min(i, 80) * STAGGER }}
                  />
                ))}
        </g>
      </svg>

      <div>
        <p className="text-[15px] font-bold" style={{ color: C.muted }}>
          분쇄 선택
        </p>
        <div role="group" aria-label="분쇄도" className="mt-2 flex flex-wrap gap-2">
          {GRINDS.map((g) => {
            const on = g.name === grind;
            return (
              <button
                key={g.name}
                type="button"
                aria-pressed={on}
                onClick={() => setGrind(g.name)}
                className={`rounded-[6px] border-2 px-3.5 py-2 text-[15px] font-bold transition-colors duration-150 ${focusRing}`}
                style={{ borderColor: on ? C.ink : C.line, background: on ? C.ink : C.paper, color: on ? C.paper : C.ink, outlineColor: C.ink }}
              >
                {g.name}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[16px] leading-[1.6]">
          <span className="font-bold">{cur.size}</span>
          <span style={{ color: C.muted }}> {cur.tip}</span>
        </p>
        <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
          주문한 원두 전체에 같은 분쇄가 적용돼요. 분쇄 원두는 2주 안에 드시는 걸 권해요.
        </p>
      </div>
    </div>
  );
}

/* ---------- 4. 원두 카드와 담기 ---------- */

function BeanCard({ bean, count, onAdd }: { bean: Bean; count: number; onAdd: (d: number) => void }) {
  const tone = ROAST_TONE[bean.roast];
  const stepBtn = `inline-flex h-9 w-9 items-center justify-center rounded-[6px] border-2 ${focusRing}`;
  return (
    <li id={`bean-${bean.id}`} className="flex scroll-mt-4 flex-col rounded-[10px] border p-4" style={{ borderColor: count > 0 ? C.ink : C.line, background: "#fff" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold" style={{ color: C.muted }}>
            {bean.origin} / {bean.process}
          </p>
          <h3 className="mt-1 text-[19px] leading-[1.3]" style={serifF}>
            {bean.name}
          </h3>
        </div>
        <span className="flex-none" aria-hidden>
          <BeanMark size={34} color={tone} />
        </span>
      </div>
      <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
        {bean.cup}
      </p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-[14px]">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: tone }} aria-hidden />
        {bean.roast}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <p className="text-[17px] font-bold tabular-nums" style={monoF}>
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
            style={{ background: C.ink, color: C.paper, outlineColor: C.ink }}
          >
            <Plus size={16} aria-hidden /> 담기
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5" role="group" aria-label={`${bean.name} 수량`}>
            <button type="button" onClick={() => onAdd(-1)} aria-label="한 봉 빼기" className={stepBtn} style={{ borderColor: C.ink, color: C.ink, outlineColor: C.ink }}>
              <Minus size={16} aria-hidden />
            </button>
            <span className="min-w-[2ch] text-center text-[17px] font-bold tabular-nums" style={monoF} aria-live="polite">
              {count}
            </span>
            <button type="button" onClick={() => onAdd(1)} aria-label="한 봉 더" className={stepBtn} style={{ borderColor: C.ink, background: C.ink, color: C.paper, outlineColor: C.ink }}>
              <Plus size={16} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/** 금액이 바뀌면 숫자가 굴러가며 바뀐다. 동작 줄이기면 바로 바뀐다 */
function RollingWon({ value, reduce, className, style }: { value: number; reduce: boolean; className?: string; style?: React.CSSProperties }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => won(Math.round(v / 10) * 10));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: DUR, ease: EASE });
    return () => c.stop();
  }, [value, reduce, mv]);
  return (
    <motion.span className={className} style={style}>
      {text}
    </motion.span>
  );
}

/* ---------- 5. 구독 계산 ---------- */

function Subscription({ reduce }: { reduce: boolean }) {
  const [period, setPeriod] = useState<2 | 4>(4);
  const [size, setSize] = useState<Size>(200);
  const [bags, setBags] = useState(1);
  const [beanId, setBeanId] = useState("morning");
  const bean = beanById(beanId);

  const unit = priceFor(bean, size);
  const perShip = Math.round((unit * bags * (1 - SUB_DISCOUNT)) / 100) * 100;
  const perMonth = perShip * (period === 2 ? 2 : 1);
  const saved = unit * bags - perShip;

  const chip = (on: boolean) =>
    ({
      borderColor: on ? C.ink : C.line,
      background: on ? C.ink : "#fff",
      color: on ? C.paper : C.ink,
      outlineColor: C.ink,
    }) as const;
  const chipCls = `rounded-[6px] border-2 px-3.5 py-2 text-[15px] font-bold transition-colors duration-150 ${focusRing}`;
  const label = "block text-[14px] font-bold";

  return (
    <div className="mt-5 grid gap-6 rounded-[10px] border p-5 md:grid-cols-[1fr_minmax(260px,320px)] md:gap-10 md:p-6" style={{ borderColor: C.line, background: "#fff" }}>
      <div className="grid gap-5">
        <div>
          <label htmlFor="rs-sub-bean" className={label} style={{ color: C.muted }}>
            원두
          </label>
          <select
            id="rs-sub-bean"
            value={beanId}
            onChange={(e) => setBeanId(e.target.value)}
            className={`mt-1.5 w-full max-w-[420px] rounded-[6px] border-2 px-3 py-2 text-[16px] ${focusRing}`}
            style={{ borderColor: C.line, background: C.paper, color: C.ink, outlineColor: C.ink }}
          >
            {BEANS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.roast})
              </option>
            ))}
          </select>
        </div>
        <div>
          <span id="rs-sub-period" className={label} style={{ color: C.muted }}>
            배송 주기
          </span>
          <div role="group" aria-labelledby="rs-sub-period" className="mt-1.5 flex flex-wrap gap-2">
            {([2, 4] as const).map((p) => (
              <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)} className={chipCls} style={chip(period === p)}>
                {p}주마다
              </button>
            ))}
          </div>
        </div>
        <div>
          <span id="rs-sub-size" className={label} style={{ color: C.muted }}>
            용량
          </span>
          <div role="group" aria-labelledby="rs-sub-size" className="mt-1.5 flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} className={chipCls} style={chip(size === s)}>
                <span style={monoF}>{sizeLabel(s)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <span id="rs-sub-bags" className={label} style={{ color: C.muted }}>
            봉수
          </span>
          <div role="group" aria-labelledby="rs-sub-bags" className="mt-1.5 inline-flex items-center gap-2">
            <button type="button" onClick={() => setBags((b) => Math.max(1, b - 1))} aria-label="한 봉 빼기" className={`inline-flex h-10 w-10 items-center justify-center rounded-[6px] border-2 ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.ink }}>
              <Minus size={18} aria-hidden />
            </button>
            <span className="min-w-[3ch] text-center text-[20px] font-bold tabular-nums" style={monoF} aria-live="polite">
              {bags}봉
            </span>
            <button type="button" onClick={() => setBags((b) => Math.min(6, b + 1))} aria-label="한 봉 더" className={`inline-flex h-10 w-10 items-center justify-center rounded-[6px] border-2 ${focusRing}`} style={{ borderColor: C.ink, background: C.ink, color: C.paper, outlineColor: C.ink }}>
              <Plus size={18} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] p-5" style={{ background: C.paperDeep }}>
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          회당 결제
        </p>
        <RollingWon value={perShip} reduce={reduce} className="mt-1 block text-[34px] leading-none tabular-nums" style={monoF} />
        <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
          정가 <span style={monoF}>{won(unit * bags)}</span> 에서 <span style={monoF}>{won(saved)}</span> 할인
        </p>
        <div className="mt-5 border-t pt-4" style={{ borderColor: C.line }}>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            월 환산
          </p>
          <RollingWon value={perMonth} reduce={reduce} className="mt-1 block text-[24px] leading-none tabular-nums" style={monoF} />
          <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
            {period}주마다 {bean.name} {sizeLabel(size)} {bags}봉
          </p>
        </div>
        <ul className="mt-5 grid gap-1.5 text-[14px]">
          {["구독 10% 할인, 배송비 무료", "로스팅 다음 날 발송", "원두와 분쇄는 회차마다 바꿀 수 있어요", "다음 결제 전까지 언제든 해지"].map((t) => (
            <li key={t} className="flex items-start gap-1.5">
              <Check size={16} className="mt-0.5 flex-none" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 inline-flex items-center gap-2 rounded-[6px] px-4 py-2.5 text-[15px] font-bold" style={{ background: C.ink, color: C.paper }}>
          <MessageCircle size={16} aria-hidden /> {KAKAO}에서 구독 신청
        </p>
      </div>
    </div>
  );
}

/* ---------- 6. 주문 시트 ---------- */

function OrderSheet({
  reduce,
  today,
  cart,
  grind,
  total,
  bags,
  done,
  onDone,
  onClose,
}: {
  reduce: boolean;
  today: Date;
  cart: Cart;
  grind: Grind;
  total: number;
  bags: number;
  done: boolean;
  onDone: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus();
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

  const field = `mt-1.5 w-full rounded-[6px] border-2 px-3 py-2.5 text-[16px] ${focusRing}`;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center print:hidden" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(46,26,14,0.5)" }} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rs-sheet-title"
        className="relative w-full max-w-[560px] rounded-t-[14px] p-5 md:mb-8 md:rounded-[14px] md:p-6"
        style={{ background: C.paper, color: C.ink, maxHeight: "92dvh", overflowY: "auto" }}
        initial={reduce ? false : { y: 40 }}
        animate={{ y: 0 }}
        exit={reduce ? undefined : { y: 40 }}
        transition={{ duration: DUR_FAST, ease: EASE }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="rs-sheet-title" className="text-[24px] leading-tight" style={serifF}>
            {done ? "주문 접수 완료" : "주문하기"}
          </h2>
          <button type="button" onClick={onClose} aria-label="닫기" className={`-mr-1 -mt-1 inline-flex h-9 w-9 items-center justify-center rounded-[6px] ${focusRing}`} style={{ outlineColor: C.ink }}>
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
                <span className="flex-none tabular-nums" style={monoF}>
                  {n}봉 {won(b.price * n)}
                </span>
              </li>
            );
          })}
          <li className="flex items-center justify-between gap-3 px-3 py-2.5" style={{ borderColor: C.line, color: C.muted }}>
            <span>배송비</span>
            <span className="tabular-nums" style={monoF}>
              {shipping === 0 ? "무료" : won(shipping)}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3 px-3 py-3 font-bold" style={{ borderColor: C.line }}>
            <span>합계</span>
            <span className="text-[18px] tabular-nums" style={monoF}>
              {won(total + shipping)}
            </span>
          </li>
        </ul>

        {!done ? (
          <form onSubmit={submit} noValidate className="mt-5 grid gap-4">
            <div>
              <label htmlFor="rs-name" className="block text-[14px] font-bold">
                이름
              </label>
              <input ref={first} id="rs-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.line, background: "#fff", outlineColor: C.ink }} />
            </div>
            <div>
              <label htmlFor="rs-phone" className="block text-[14px] font-bold">
                휴대폰
              </label>
              <input id="rs-phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={field} style={{ ...monoF, borderColor: C.line, background: "#fff", outlineColor: C.ink }} />
            </div>
            {err && (
              <p role="alert" className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: C.error }}>
                <AlertCircle size={16} aria-hidden /> {err}
              </p>
            )}
            <p className="text-[14px]" style={{ color: C.muted }}>
              결제 안내와 배송 조회는 {KAKAO}로 보내 드려요.
            </p>
            <button type="submit" data-gtm-cta="roastery_submit" className={`rounded-[8px] py-3 text-[17px] font-bold ${focusRing}`} style={{ background: C.ink, color: C.paper, outlineColor: C.ink }}>
              주문 접수
            </button>
          </form>
        ) : (
          <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR_FAST, ease: EASE }} className="mt-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 rounded-[8px] border-2 p-4 text-[15px]" style={{ borderColor: C.ink }}>
              <dt className="font-bold">주문번호</dt>
              <dd className="tabular-nums" style={monoF}>
                {orderNo}
              </dd>
              <dt className="font-bold">주문자</dt>
              <dd>
                {maskName(name)} <span style={monoF}>{maskPhone(phone)}</span>
              </dd>
              <dt className="font-bold">확인 연락</dt>
              <dd>{fmtKo(replyDay)} 오전, {KAKAO}</dd>
              <dt className="font-bold">로스팅 예정</dt>
              <dd>{fmtKo(roastDay)}</dd>
              <dt className="font-bold">발송 예정</dt>
              <dd>{fmtKo(shipDay)}</dd>
              <dt className="font-bold">분쇄</dt>
              <dd>{grind}</dd>
            </dl>
            <p className="mt-4 text-[15px] leading-[1.6]">입금 계좌와 배송 조회 번호는 확인 연락 때 함께 보내 드려요. 발송 전까지는 분쇄와 수량을 바꿀 수 있어요.</p>
            <button type="button" onClick={onClose} className={`mt-5 w-full rounded-[8px] border-2 py-3 text-[16px] font-bold ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.ink }}>
              닫기
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------- 7. 오시는 길, 영업시간 ---------- */

function Visit({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-5 grid gap-5">
      <svg viewBox="0 0 400 200" className="w-full rounded-[10px] border" role="img" aria-label="약도: ㅇㅇ역 2번 출구에서 큰길을 따라 걷다 첫 골목에서 왼쪽" style={{ borderColor: C.line, background: C.paperDeep }}>
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
        <path d="M70 150 L70 133 L161 133 L161 60" fill="none" stroke={C.brown} strokeWidth="3" strokeDasharray="6 5" />
        <g transform="translate(176 44)">
          <rect x="0" y="0" width="92" height="40" rx="4" fill="#fff" stroke={C.ink} strokeWidth="2" />
          <text x="46" y="25" fontSize="12" textAnchor="middle" fill={C.ink} fontWeight="700">
            로스터리
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
                <tr key={h.dow} className="border-b" style={{ borderColor: C.line, background: isToday ? C.paperDeep : "transparent" }}>
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

/* ---------- 8. 공지 ---------- */

function Notice({ today }: { today: Date }) {
  const items = [
    { ago: 2, title: "뉴크롭 입고, 에티오피아 예가체프 G1", body: "이번 수확분으로 바뀌었어요. 꽃향이 더 또렷해서 라이트로 볶어요." },
    { ago: 9, title: "로스팅 요일 변경", body: "수요일 로스팅을 화요일과 금요일 두 번으로 나눴어요. 주문 뒤 발송이 하루 빨라져요." },
    { ago: 16, title: "커핑 모임 모집, 토요일 오전", body: "이번 달 토요일 11시, 네 분까지. 매장 또는 카카오톡 채널로 신청해 주세요." },
    { ago: 30, title: "선물 포장 안내", body: "200g 두 봉까지 종이 상자 포장을 무료로 해 드려요. 주문 때 적어 주세요." },
  ];
  return (
    <ul className="mt-5 divide-y border-t" style={{ borderColor: C.line }}>
      {items.map((n) => {
        const d = daysAgo(today, n.ago);
        return (
          <li key={n.title} className="py-4" style={{ borderColor: C.line }}>
            <p className="text-[13px] tabular-nums" style={{ ...monoF, color: C.muted }}>
              {d.getFullYear()}.{p2(d.getMonth() + 1)}.{p2(d.getDate())} ({DOW[d.getDay()]})
            </p>
            <h3 className="mt-1 text-[18px] leading-[1.35]" style={serifF}>
              {n.title}
            </h3>
            <p className="mt-1.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
              {n.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
