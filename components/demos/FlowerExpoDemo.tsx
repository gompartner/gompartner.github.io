"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Do_Hyeon, Gowun_Dodum } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Baby,
  Bus,
  Car,
  ChevronDown,
  Clock,
  MapPin,
  Menu,
  Minus,
  Moon,
  Phone,
  Plus,
  RotateCcw,
  TrainFront,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";


/* 꽃박람회 축제 랜딩 데모: 가상의 "2027 ○○ 꽃박람회".
   개최지, 주최 기관, 입장료, 프로그램, 연락처는 모두 가상이다.

   디자인: 크림 바탕(#fffaf0)에 짙은 초록(#1f4d3a), 꽃잎 분홍(#e8577a), 버터 노랑(#f6d365).
   제목은 고운돋움, 큰 숫자는 도현체로 둥글고 가볍게 잡았다.
   섹션 제목 옆 작은 꽃이 화면에 들어올 때 꽃잎을 펼친다.
   전시 구역은 호수를 둘러싼 그림 지도이고, 구역을 누르면 볼거리와 사진 찍기 좋은 곳이 나온다.
   "언제 가면 좋을까" 문장의 빈칸을 바꾸면 지도 위에 추천 동선이 선으로 그려진다.
   개화 예상은 주를 바꾸면 꽃 다섯 송이가 단계만큼 피거나 오므라든다.

   사진 출처(public/images/demo-flower):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, tulip, rose, night */

const display = Gowun_Dodum({ weight: "400", preload: false, display: "swap" });
const numFont = Do_Hyeon({ weight: "400", preload: false, display: "swap" });

const IMG = "/images/demo-flower";
const EXPO = "2027 ○○ 꽃박람회";
const TEL = "000-000-0000";

const C = {
  cream: "#fffaf0",
  paper: "#ffffff",
  green: "#1f4d3a",
  greenSoft: "#e4efe6",
  pink: "#e8577a",
  pinkText: "#b8355a",
  pinkSoft: "#fde6ec",
  yellow: "#f6d365",
  yellowSoft: "#fdf3d3",
  lake: "#bfe1ec",
  ink: "#1d2a24",
  muted: "#55625b",
  line: "#e9e0cd",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "bloom", label: "개화 예상" },
  { id: "info", label: "관람 안내" },
  { id: "map", label: "전시 구역" },
  { id: "program", label: "프로그램" },
  { id: "way", label: "오시는 길" },
  { id: "faq", label: "자주 묻는 질문" },
];

/* 개최 기간: 2027년 4월 23일(금)부터 5월 9일(일)까지 17일 */
const START = { y: 2027, m: 4, d: 23 };
const DAYS = 17;

function dayNumber(y: number, m: number, d: number) {
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

const START_DAY = dayNumber(START.y, START.m, START.d);

function subscribeMinute(cb: () => void) {
  const id = window.setInterval(cb, 60000);
  return () => window.clearInterval(id);
}

/** 오늘 날짜 번호. 서버와 첫 렌더에서는 -1 */
function useTodayNumber() {
  return useSyncExternalStore(
    subscribeMinute,
    () => {
      const n = new Date();
      return dayNumber(n.getFullYear(), n.getMonth() + 1, n.getDate());
    },
    () => -1,
  );
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

/** 행사 n일째(0부터)의 날짜 정보 */
function festDate(i: number) {
  const dt = new Date(Date.UTC(START.y, START.m - 1, START.d + i));
  const dow = dt.getUTCDay();
  return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), dow, weekend: dow === 0 || dow === 6, night: dow === 5 || dow === 6 || dow === 0 };
}

/* ─── 데이터 ─────────────────────────────────────────────── */

type ZoneId = "tulip" | "rose" | "hydrangea" | "hall" | "night" | "play";

interface Zone {
  id: ZoneId;
  name: string;
  x: number;
  y: number;
  color: string;
  image?: string;
  what: string;
  best: string;
  spot: string;
  walk: string;
}

const ZONES: Zone[] = [
  {
    id: "tulip",
    name: "튤립 정원",
    x: 190,
    y: 150,
    color: "#e8577a",
    image: `${IMG}/tulip.jpg`,
    what: "튤립 52종 120만 송이를 색깔별 띠로 심었습니다. 정원 가운데 풍차 전망대에 오르면 꽃밭 전체가 내려다보입니다.",
    best: "오전 10시 전, 빛이 비스듬할 때",
    spot: "풍차 전망대 2층 난간",
    walk: "한 바퀴 30분",
  },
  {
    id: "rose",
    name: "장미 터널",
    x: 520,
    y: 110,
    color: "#c23a5e",
    image: `${IMG}/rose.jpg`,
    what: "덩굴장미 아치 600m가 호숫가를 따라 이어집니다. 5월 첫째 주부터 꽃이 차오릅니다.",
    best: "오후 4시 이후, 터널 안이 붉게 물들 때",
    spot: "터널 중간의 흰 벤치",
    walk: "걸어서 15분",
  },
  {
    id: "hydrangea",
    name: "수국 길",
    x: 650,
    y: 300,
    color: "#7b8fd6",
    what: "온실에서 미리 피운 수국 화분 3천 개로 꾸민 산책길입니다. 경사가 없고 그늘 쉼터가 세 곳 있습니다.",
    best: "한낮, 그늘이 필요할 때",
    spot: "길 끝 연못 위 나무 다리",
    walk: "걸어서 20분",
  },
  {
    id: "hall",
    name: "실내 전시관",
    x: 430,
    y: 420,
    color: "#4f8a5b",
    what: "꽃꽂이 작품전, 희귀 식물 온실, 꽃 디자인 공모전 수상작을 전시합니다. 수유실과 휴게 식당이 함께 있습니다.",
    best: "비 오는 날이나 한낮 더위를 피할 때",
    spot: "1층 중앙 꽃 샹들리에 아래",
    walk: "둘러보는 데 40분",
  },
  {
    id: "night",
    name: "야간 정원",
    x: 640,
    y: 470,
    color: "#3a3f7a",
    image: `${IMG}/night.jpg`,
    what: "금, 토, 일요일 저녁에만 여는 조명 정원입니다. 호수 위 꽃등 500개와 미디어 분수 공연을 봅니다.",
    best: "해가 진 뒤 19시 30분 분수 공연 때",
    spot: "호수 쪽 데크 계단",
    walk: "둘러보는 데 30분",
  },
  {
    id: "play",
    name: "체험 마당",
    x: 160,
    y: 400,
    color: "#d9a520",
    what: "꽃 화분 만들기, 압화 책갈피, 어린이 꽃 그림 그리기를 하는 천막 마당입니다. 체험은 현장에서 선착순으로 받습니다.",
    best: "오전 11시 첫 회차, 줄이 짧을 때",
    spot: "입구의 커다란 꽃 화분 조형물",
    walk: "체험 한 가지에 20분",
  },
];

const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z])) as Record<ZoneId, Zone>;

const GATE = { x: 90, y: 260 };

/* 개화 예상: 0 봉오리, 1 피기 시작, 2 반쯤 핌, 3 활짝, 4 지는 중 */
const STAGE = ["봉오리", "피기 시작", "반쯤 핌", "활짝 핌", "지는 중"];
const BLOOM_WEEKS = [
  { label: "4월 넷째 주", date: "4.23 ~ 4.25" },
  { label: "5월 첫째 주", date: "4.26 ~ 5.2" },
  { label: "5월 둘째 주", date: "5.3 ~ 5.9" },
];
const BLOOMS: { name: string; where: string; color: string; stages: number[] }[] = [
  { name: "튤립", where: "튤립 정원", color: "#e8577a", stages: [3, 3, 4] },
  { name: "장미", where: "장미 터널", color: "#c23a5e", stages: [0, 1, 2] },
  { name: "수국", where: "수국 길", color: "#7b8fd6", stages: [2, 3, 3] },
  { name: "유채", where: "호숫가 둑길", color: "#e2b31c", stages: [3, 2, 4] },
  { name: "철쭉", where: "전망 언덕", color: "#d85aa0", stages: [1, 3, 3] },
];

const TICKETS = [
  { id: "adult", name: "어른", note: "만 19세 이상", price: 12000 },
  { id: "teen", name: "청소년", note: "만 13~18세", price: 8000 },
  { id: "child", name: "어린이", note: "만 4~12세", price: 5000 },
  { id: "free", name: "무료", note: "만 3세 이하, 만 65세 이상, 장애인과 동반 보호자 1명", price: 0 },
] as const;

type TicketId = (typeof TICKETS)[number]["id"];

/* 문장형 동선 고르기 */
const WHEN = ["주말", "평일"] as const;
const TIME = ["낮", "저녁"] as const;
const WHO = ["아이와", "연인과", "부모님과", "혼자"] as const;

type Who = (typeof WHO)[number];

const DAY_COURSE: Record<Who, { zones: ZoneId[]; tip: string }> = {
  아이와: { zones: ["play", "tulip", "hall"], tip: "유모차는 정문 안내소에서 무료로 빌립니다. 수유실은 실내 전시관 1층에 있습니다." },
  연인과: { zones: ["tulip", "rose", "hydrangea"], tip: "풍차 전망대는 오전에 줄이 짧습니다. 장미 터널은 오후 빛이 더 곱습니다." },
  부모님과: { zones: ["hall", "hydrangea", "tulip"], tip: "정문에서 실내 전시관까지 순환 전동차가 15분마다 다닙니다. 수국 길은 경사가 없습니다." },
  혼자: { zones: ["hydrangea", "rose", "hall"], tip: "수국 길 끝 나무 다리는 사람이 적어 오래 머물기 좋습니다." },
};

function makeCourse(when: (typeof WHEN)[number], time: (typeof TIME)[number], who: Who) {
  const base = DAY_COURSE[who];
  const notes: string[] = [];
  let zones = [...base.zones];
  let hours = who === "아이와" ? "약 2시간" : "약 2시간 30분";

  if (time === "저녁") {
    if (when === "평일") {
      zones = zones.slice(0, 2);
      hours = "약 1시간 30분";
      notes.push("야간 정원은 금, 토, 일요일에만 엽니다. 평일에는 17시 입장 마감 전에 들어오세요. 금요일 저녁이면 야간 정원까지 볼 수 있습니다.");
    } else {
      zones = [...zones.filter((z) => z !== "hall").slice(0, 2), "night"];
      hours = "약 2시간";
      notes.push("야간 정원은 18시에 열고 21시 30분에 닫습니다. 19시 30분 분수 공연에 맞춰 오세요.");
    }
  }
  notes.push(
    when === "주말"
      ? "주말은 11시부터 15시까지 가장 붐빕니다. 셔틀버스를 타면 주차 대기 없이 들어옵니다."
      : "평일 오전이 가장 한산합니다. 단체 관람이 많은 화, 수요일 오전 10시대는 피하세요.",
  );
  notes.push(base.tip);
  return { zones, hours, notes };
}

/* 프로그램 일정: 날짜에 따라 규칙으로 만든다 */
type ProgramKind = "공연" | "체험" | "야간";

interface Program {
  time: string;
  title: string;
  place: string;
  kind: ProgramKind;
}

function programsFor(i: number): Program[] {
  const f = festDate(i);
  const list: Program[] = [
    { time: "11:00", title: "꽃 화분 만들기", place: "체험 마당", kind: "체험" },
    { time: "13:00", title: "압화 책갈피 만들기", place: "체험 마당", kind: "체험" },
    { time: "14:00", title: "정원사와 걷는 튤립 정원", place: "튤립 정원 풍차 앞", kind: "체험" },
  ];
  if (i === 0) list.unshift({ time: "10:00", title: "개막식과 꽃길 행진", place: "호숫가 중앙 무대", kind: "공연" });
  if (f.m === 5 && f.d === 5) list.push({ time: "11:30", title: "어린이날 꽃 그림 그리기 대회", place: "체험 마당", kind: "체험" });
  if (f.weekend) {
    list.push({ time: "12:30", title: "버스킹 공연", place: "장미 터널 입구", kind: "공연" });
    list.push({ time: "15:00", title: "시립 관현악단 봄 음악회", place: "호숫가 중앙 무대", kind: "공연" });
  } else {
    list.push({ time: "15:00", title: "꽃꽂이 시연", place: "실내 전시관 2층", kind: "공연" });
  }
  if (f.night) {
    list.push({ time: "18:00", title: "야간 정원 개장", place: "야간 정원", kind: "야간" });
    list.push({ time: "19:30", title: "호수 미디어 분수 공연", place: "야간 정원 호수 데크", kind: "야간" });
  }
  if (i === DAYS - 1) list.push({ time: "17:00", title: "폐막 공연", place: "호숫가 중앙 무대", kind: "공연" });
  return list.sort((a, b) => a.time.localeCompare(b.time));
}

const FAQ = [
  { q: "나갔다가 다시 들어올 수 있나요?", a: "같은 날에는 출구에서 손목에 재입장 도장을 받으면 다시 들어올 수 있습니다." },
  { q: "반려동물과 함께 가도 되나요?", a: "목줄을 하면 야외 구역은 함께 다닐 수 있습니다. 실내 전시관과 체험 마당 천막 안에는 들어갈 수 없습니다." },
  { q: "비가 오면 어떻게 되나요?", a: "박람회는 그대로 열고 야외 공연만 실내 전시관 2층으로 옮깁니다. 바뀐 일정은 정문 안내판과 누리집 공지에 올립니다." },
  { q: "유모차나 휠체어를 빌릴 수 있나요?", a: "정문 안내소에서 신분증을 맡기고 무료로 빌립니다. 수량이 정해져 있어 주말 오전에 일찍 떨어집니다." },
  { q: "음식을 가지고 들어가도 되나요?", a: "도시락과 음료는 가지고 들어올 수 있습니다. 돗자리는 잔디 광장에서만 펼 수 있고 꽃밭 안에서는 먹을 수 없습니다." },
  { q: "할인을 받으려면 무엇이 필요한가요?", a: "□□시민 50% 할인은 주소가 보이는 신분증, 경로와 장애인 무료는 신분증이나 복지카드를 매표소에서 보여 주세요. 20명 이상 단체는 20% 할인됩니다." },
];

/* ─── 공통 조각 ─────────────────────────────────────────── */

/** 꽃잎 다섯 장짜리 꽃. open 0~1 */
function Flower({
  size = 40,
  color = C.pink,
  open = 1,
  animate = true,
  delay = 0,
}: {
  size?: number;
  color?: string;
  open?: number;
  animate?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotionSafe();
  const petals = [0, 72, 144, 216, 288];
  const s = 0.25 + 0.75 * open;
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden>
      {petals.map((r, i) => (
        <motion.ellipse
          key={r}
          cx={0}
          cy={-9}
          rx={6}
          ry={9}
          fill={color}
          style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}
          initial={animate && !reduce ? { rotate: r - 40, scale: 0.2, opacity: 0.4 } : false}
          animate={{ rotate: r + (1 - open) * -30, scale: s, opacity: open === 0 ? 0.55 : 0.92 }}
          transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE, delay: delay + i * 0.05 }}
        />
      ))}
      <circle r={open === 0 ? 4 : 4.5} fill={C.yellow} />
    </svg>
  );
}

/** 섹션 제목. 화면에 들어오면 옆의 꽃이 핀다 */
function SectionTitle({ id, eyebrow, title, color = C.pink }: { id: string; eyebrow: string; title: string; color?: string }) {
  const reduce = useReducedMotionSafe();
  return (
    <div className="flex items-end gap-3">
      <motion.div
        className="shrink-0"
        initial={reduce ? false : { rotate: -60, scale: 0.3 }}
        whileInView={{ rotate: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <Flower size={44} color={color} />
      </motion.div>
      <div>
        <p className="text-[15px] font-semibold" style={{ color: C.pinkText }}>
          {eyebrow}
        </p>
        <h2 id={`${id}-title`} className={`${display.className} mt-1 text-[28px] leading-tight md:text-[36px]`} style={{ color: C.green }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

/* ─── 머리글 ─────────────────────────────────────────────── */

function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();
  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: "rgba(255,250,240,0.92)", borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <a href="#top" className="flex items-center gap-2" aria-label={`${EXPO} 처음으로`}>
          <Flower size={30} animate={false} />
          <span className={`${display.className} text-[18px] leading-none md:text-[20px]`} style={{ color: C.green }}>
            {EXPO}
          </span>
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[16px] font-medium" style={{ color: C.ink }}>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="underline-offset-8 hover:underline" style={{ textDecorationColor: C.pink }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#ticket"
            className="hidden h-10 items-center rounded-full px-5 text-[15px] font-bold text-white sm:inline-flex"
            style={{ background: C.green }}
          >
            입장권 안내
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            style={{ color: C.green }}
            aria-expanded={open}
            aria-controls="expo-menu"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="expo-menu"
            aria-label="모바일 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? { opacity: 0 } : { height: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <ul className="px-4 py-2">
              {[...NAV, { id: "ticket", label: "입장권 안내" }].map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px] font-medium" style={{ color: C.ink }}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── 첫 화면 ─────────────────────────────────────────────── */

function Hero({ today }: { today: number }) {
  const reduce = useReducedMotionSafe();
  const diff = today < 0 ? null : START_DAY - today;

  let countLabel = "";
  let countValue = "";
  if (diff !== null) {
    if (diff > 0) {
      countLabel = "개막까지";
      countValue = `D-${diff}`;
    } else if (diff > -DAYS) {
      countLabel = "박람회가 열리는 중";
      countValue = `${-diff + 1}일째`;
    } else {
      countLabel = "올해 박람회는 끝났습니다";
      countValue = "다음 봄에";
    }
  }

  return (
    <section id="top" className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="relative h-[300px] sm:h-[380px] md:absolute md:inset-0 md:h-auto">
        <Image src={`${IMG}/hero.jpg`} alt="호숫가를 따라 튤립이 활짝 핀 꽃밭" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "70% 50%" }} />
        <div
          className="absolute inset-0 hidden md:block"
          style={{ background: `linear-gradient(90deg, ${C.cream} 0%, rgba(255,250,240,0.92) 30%, rgba(255,250,240,0.35) 55%, rgba(255,250,240,0) 70%)` }}
        />
      </div>

      {/* 첫 화면 꽃 장식: 화면이 열리면 차례로 핀다 */}
      <div className="pointer-events-none absolute right-4 top-4 hidden gap-1 md:flex" aria-hidden>
        {[C.pink, C.yellow, "#7b8fd6"].map((c, i) => (
          <Flower key={c} size={i === 0 ? 56 : 38} color={c} delay={0.5 + i * 0.15} />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 pb-12 pt-8 md:px-6 md:py-24 lg:py-28">
        <div className="max-w-[540px]">
          <motion.p
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[15px] font-semibold"
            style={{ background: C.yellowSoft, color: C.green }}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <MapPin size={16} aria-hidden />
            □□시 ○○호수공원 일대
          </motion.p>
          <h1 id="hero-title" className={`${display.className} mt-4 text-[40px] leading-[1.15] sm:text-[52px] md:text-[64px]`} style={{ color: C.green }}>
            <motion.span
              className="block"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              2027
            </motion.span>
            <motion.span
              className="block"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            >
              ○○ 꽃박람회
            </motion.span>
          </h1>
          <p className="mt-5 text-[17px] leading-[1.7]" style={{ color: C.ink }}>
            호숫가 산책로를 따라 튤립 정원, 장미 터널, 수국 길이 이어집니다. 금, 토, 일요일 저녁에는 조명을 밝힌 야간 정원도 엽니다.
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-3 sm:max-w-[460px]">
            <div className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: C.line }}>
              <dt className="text-[14px]" style={{ color: C.muted }}>
                기간
              </dt>
              <dd className="mt-1 text-[16px] font-bold leading-snug" style={{ color: C.ink }}>
                4월 23일(금)
                <br />5월 9일(일)까지
              </dd>
            </div>
            <div className="rounded-2xl p-4 text-white" style={{ background: C.green }} aria-live="polite">
              <dt className="text-[14px] text-white/80">{countLabel || "개막까지"}</dt>
              <dd className={`${numFont.className} mt-1 text-[34px] leading-none`}>{countValue || " "}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#course" className="inline-flex h-12 items-center rounded-full px-6 text-[16px] font-bold text-white" style={{ background: C.pinkText }}>
              나에게 맞는 동선 보기
            </a>
            <a
              href="#program"
              className="inline-flex h-12 items-center rounded-full border-2 bg-white/80 px-6 text-[16px] font-bold"
              style={{ borderColor: C.green, color: C.green }}
            >
              오늘의 프로그램
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 개화 예상 ─────────────────────────────────────────── */

function BloomSection() {
  const [week, setWeek] = useState(1);
  return (
    <section id="bloom" className="py-16 md:py-24" aria-labelledby="bloom-title">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle id="bloom" eyebrow="개화 예상" title="이 주에는 어떤 꽃이 피었을까요" />
          <div role="tablist" aria-label="주 선택" className="flex gap-2 overflow-x-auto">
            {BLOOM_WEEKS.map((w, i) => (
              <button
                key={w.label}
                type="button"
                role="tab"
                aria-selected={week === i}
                onClick={() => setWeek(i)}
                className="shrink-0 rounded-full border-2 px-4 py-2 text-left text-[15px] font-semibold transition-colors"
                style={
                  week === i
                    ? { background: C.green, borderColor: C.green, color: "#fff" }
                    : { background: "#fff", borderColor: C.line, color: C.ink }
                }
              >
                {w.label}
                <span className="ml-2 font-normal opacity-80">{w.date}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-10 divide-y rounded-3xl border bg-white" style={{ borderColor: C.line }}>
          {BLOOMS.map((b) => {
            const stage = b.stages[week];
            return (
              <li key={b.name} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 md:px-8" style={{ borderColor: C.line }}>
                <div className="sm:w-[180px]">
                  <p className={`${display.className} text-[22px]`} style={{ color: C.ink }}>
                    {b.name}
                  </p>
                  <p className="text-[15px]" style={{ color: C.muted }}>
                    {b.where}
                  </p>
                </div>
                <div className="flex items-center gap-1" aria-hidden>
                  {[0, 1, 2, 3].map((n) => {
                    const fading = stage === 4;
                    const open = fading ? (n < 3 ? 0.85 : 0.3) : n < stage ? 1 : n === stage ? 0.35 : 0;
                    return (
                      <div key={n} style={{ opacity: fading && n >= 2 ? 0.45 : 1 }}>
                        <Flower size={40} color={b.color} open={open} animate={false} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[16px] font-bold sm:ml-auto" style={{ color: stage === 3 ? C.pinkText : C.green }}>
                  {STAGE[stage]}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
          작년 개화 기록과 올봄 기온으로 내다본 예상입니다. 개막 뒤에는 매일 오전 9시에 실제 상태로 바꿔 올립니다.
        </p>
      </div>
    </section>
  );
}

/* ─── 관람 안내와 입장권 ─────────────────────────────────── */

function InfoSection() {
  const [count, setCount] = useState<Record<TicketId, number>>({ adult: 2, teen: 0, child: 1, free: 0 });
  const [resident, setResident] = useState(false);

  const people = Object.values(count).reduce((a, b) => a + b, 0);
  const subtotal = TICKETS.reduce((sum, t) => sum + t.price * count[t.id], 0);
  const group = people >= 20;
  const rate = resident ? 0.5 : group ? 0.2 : 0;
  const total = Math.round((subtotal * (1 - rate)) / 100) * 100;

  const change = (id: TicketId, d: number) => setCount((c) => ({ ...c, [id]: Math.max(0, Math.min(99, c[id] + d)) }));

  return (
    <section id="info" className="py-16 md:py-24" style={{ background: C.greenSoft }} aria-labelledby="info-title">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <SectionTitle id="info" eyebrow="관람 안내" title="운영시간과 입장료" color={C.yellow} />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl bg-white p-6 md:p-8">
            <h3 className="flex items-center gap-2 text-[20px] font-bold" style={{ color: C.green }}>
              <Clock size={20} aria-hidden />
              운영시간
            </h3>
            <dl className="mt-5 space-y-4 text-[16px]">
              <div className="flex justify-between gap-4 border-b pb-4" style={{ borderColor: C.line }}>
                <dt style={{ color: C.muted }}>낮 정원</dt>
                <dd className="text-right font-semibold" style={{ color: C.ink }}>
                  매일 09:00 ~ 18:00
                  <span className="block text-[15px] font-normal" style={{ color: C.muted }}>
                    입장 마감 17:00
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b pb-4" style={{ borderColor: C.line }}>
                <dt className="flex items-center gap-1" style={{ color: C.muted }}>
                  <Moon size={16} aria-hidden />
                  야간 정원
                </dt>
                <dd className="text-right font-semibold" style={{ color: C.ink }}>
                  금, 토, 일 18:00 ~ 21:30
                  <span className="block text-[15px] font-normal" style={{ color: C.muted }}>
                    낮 입장권으로 함께 이용
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: C.muted }}>실내 전시관</dt>
                <dd className="text-right font-semibold" style={{ color: C.ink }}>
                  매일 09:30 ~ 17:30
                </dd>
              </div>
            </dl>
            <ul className="mt-6 space-y-2 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
              <li className="flex gap-2">
                <Baby size={18} className="mt-0.5 shrink-0" aria-hidden />
                유모차와 휠체어는 정문 안내소에서 무료로 빌립니다.
              </li>
              <li className="flex gap-2">
                <Accessibility size={18} className="mt-0.5 shrink-0" aria-hidden />
                모든 관람로는 계단 없이 이어집니다.
              </li>
            </ul>
          </div>

          <div id="ticket" className="scroll-mt-20 rounded-3xl bg-white p-6 md:p-8">
            <h3 className="text-[20px] font-bold" style={{ color: C.green }}>
              입장료 계산
            </h3>
            <ul className="mt-5 divide-y" style={{ borderColor: C.line }}>
              {TICKETS.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3" style={{ borderColor: C.line }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold" style={{ color: C.ink }}>
                      {t.name}
                      <span className="ml-2 font-bold" style={{ color: C.pinkText }}>
                        {t.price === 0 ? "무료" : `${t.price.toLocaleString("ko-KR")}원`}
                      </span>
                    </p>
                    <p className="text-[14px] leading-snug" style={{ color: C.muted }}>
                      {t.note}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => change(t.id, -1)}
                      disabled={count[t.id] === 0}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border disabled:opacity-35"
                      style={{ borderColor: C.line, color: C.green }}
                      aria-label={`${t.name} 한 명 빼기`}
                    >
                      <Minus size={16} aria-hidden />
                    </button>
                    <span className={`${numFont.className} w-8 text-center text-[22px]`} style={{ color: C.ink }} aria-live="polite">
                      {count[t.id]}
                    </span>
                    <button
                      type="button"
                      onClick={() => change(t.id, 1)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border"
                      style={{ borderColor: C.line, color: C.green }}
                      aria-label={`${t.name} 한 명 더하기`}
                    >
                      <Plus size={16} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <label className="mt-3 flex cursor-pointer items-center gap-3 text-[16px]" style={{ color: C.ink }}>
              <input type="checkbox" checked={resident} onChange={(e) => setResident(e.target.checked)} className="h-5 w-5" style={{ accentColor: C.green }} />
              □□시민이에요 (50% 할인)
            </label>
            <div className="mt-5 flex items-end justify-between rounded-2xl p-4" style={{ background: C.yellowSoft }}>
              <div className="text-[15px]" style={{ color: C.muted }}>
                {people}명
                {rate > 0 && (
                  <span className="ml-2 font-semibold" style={{ color: C.green }}>
                    {resident ? "시민 할인" : "단체 할인"} 적용
                  </span>
                )}
                {!resident && !group && people > 0 && <span className="block">20명 이상이면 단체 20% 할인</span>}
              </div>
              <p className={`${numFont.className} text-[32px] leading-none`} style={{ color: C.green }} aria-live="polite">
                {total.toLocaleString("ko-KR")}원
              </p>
            </div>
            <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
              할인 증빙은 매표소에서 확인합니다. 시민 할인과 단체 할인은 함께 받을 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 전시 구역 지도와 동선 ─────────────────────────────── */

function cycle<T>(list: readonly T[], cur: T): T {
  return list[(list.indexOf(cur) + 1) % list.length];
}

function Blank<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  const reduce = useReducedMotionSafe();
  return (
    <button
      type="button"
      onClick={() => onChange(cycle(options, value))}
      className="relative mx-1 inline-flex h-[1.5em] items-center overflow-hidden rounded-xl px-3 align-baseline"
      style={{ background: C.pinkSoft, color: C.pinkText }}
      aria-label={`${label}: ${value}. 눌러서 바꾸기`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="absolute inset-x-3 bottom-0.5 h-[3px] rounded-full" style={{ background: C.pink }} aria-hidden />
    </button>
  );
}

function GardenMap({
  selected,
  onSelect,
  course,
}: {
  selected: ZoneId | null;
  onSelect: (id: ZoneId) => void;
  course: ZoneId[] | null;
}) {
  const reduce = useReducedMotionSafe();
  const pathD = useMemo(() => {
    if (!course) return "";
    const pts = [GATE, ...course.map((id) => ZONE_BY_ID[id])];
    return pts
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = pts[i - 1];
        const cx = (prev.x + p.x) / 2;
        const cy = Math.min(prev.y, p.y) - 40;
        return `Q ${cx} ${cy} ${p.x} ${p.y}`;
      })
      .join(" ");
  }, [course]);

  return (
    <svg viewBox="0 0 800 560" className="h-auto w-full" role="group" aria-label="전시 구역 그림 지도">
      {/* 잔디와 호수 */}
      <rect x="0" y="0" width="800" height="560" rx="32" fill="#eaf4e4" />
      <path d="M300 230 C 330 170, 470 160, 520 210 C 580 260, 560 340, 480 360 C 400 380, 300 360, 285 300 C 278 270, 285 250, 300 230 Z" fill={C.lake} />
      <text x="420" y="285" textAnchor="middle" fontSize="18" fill="#3d6f80" className={display.className}>
        ○○호수
      </text>
      {/* 산책로 */}
      <path
        d="M90 260 C 140 180, 230 90, 380 90 C 560 90, 720 160, 720 300 C 720 440, 560 520, 400 510 C 240 500, 120 450, 90 260 Z"
        fill="none"
        stroke="#d8c9a5"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M90 260 C 140 180, 230 90, 380 90 C 560 90, 720 160, 720 300 C 720 440, 560 520, 400 510 C 240 500, 120 450, 90 260 Z"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeDasharray="6 10"
      />
      {/* 장식 나무 */}
      {[
        [60, 120],
        [740, 90],
        [760, 500],
        [40, 500],
        [300, 40],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} aria-hidden>
          <circle cx={x} cy={y} r="16" fill="#9cc58f" />
          <circle cx={x + 12} cy={y + 6} r="11" fill="#86b47a" />
        </g>
      ))}

      {/* 정문 */}
      <g aria-hidden>
        <rect x={GATE.x - 34} y={GATE.y + 14} width="68" height="28" rx="14" fill={C.green} />
        <text x={GATE.x} y={GATE.y + 33} textAnchor="middle" fontSize="15" fill="#fff" fontWeight="700">
          정문
        </text>
      </g>

      {/* 추천 동선 */}
      {course && (
        <motion.path
          key={course.join("-")}
          d={pathD}
          fill="none"
          stroke={C.pinkText}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={reduce ? "10 8" : undefined}
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
        />
      )}

      {/* 구역 */}
      {ZONES.map((z) => {
        const active = selected === z.id;
        const order = course ? course.indexOf(z.id) : -1;
        return (
          <g
            key={z.id}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            aria-label={`${z.name}${order >= 0 ? `, 추천 동선 ${order + 1}번째` : ""}`}
            onClick={() => onSelect(z.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(z.id);
              }
            }}
            className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[#1d2a24]"
          >
            <circle cx={z.x} cy={z.y} r={active ? 50 : 42} fill="#fff" stroke={active ? C.green : "#fff"} strokeWidth="4" style={{ transition: "r 200ms ease" }} />
            <g transform={`translate(${z.x} ${z.y - 6})`}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx={0} cy={-9} rx={6.5} ry={10} fill={z.color} transform={`rotate(${r})`} opacity={0.9} />
              ))}
              <circle r={5} fill={C.yellow} />
            </g>
            <rect x={z.x - 52} y={z.y + 22} width="104" height="28" rx="14" fill={active ? C.green : "#fff"} stroke={C.green} strokeWidth="1.5" />
            <text x={z.x} y={z.y + 41} textAnchor="middle" fontSize="15" fontWeight="700" fill={active ? "#fff" : C.green}>
              {z.name}
            </text>
            {order >= 0 && (
              <g>
                <circle cx={z.x + 34} cy={z.y - 34} r="15" fill={C.pinkText} />
                <text x={z.x + 34} y={z.y - 28} textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">
                  {order + 1}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ZoneDetail({ zone }: { zone: Zone }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      key={zone.id}
      initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "circle(0% at 50% 0%)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "circle(150% at 50% 0%)" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="overflow-hidden rounded-3xl border bg-white"
      style={{ borderColor: C.line }}
    >
      <div className="relative aspect-[4/3]" style={{ background: `${zone.color}22` }}>
        {zone.image ? (
          <Image src={zone.image} alt={`${zone.name} 풍경`} fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <Flower size={120} color={zone.color} />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className={`${display.className} text-[26px]`} style={{ color: C.green }}>
          {zone.name}
        </h3>
        <p className="mt-2 text-[16px] leading-[1.7]" style={{ color: C.ink }}>
          {zone.what}
        </p>
        <dl className="mt-4 space-y-2 text-[15px]">
          {[
            ["보기 좋은 때", zone.best],
            ["사진 찍기 좋은 곳", zone.spot],
            ["걸리는 시간", zone.walk],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-[112px] shrink-0" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="font-semibold" style={{ color: C.ink }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.div>
  );
}

function MapSection() {
  const [mode, setMode] = useState<"course" | "all">("course");
  const [when, setWhen] = useState<(typeof WHEN)[number]>("주말");
  const [time, setTime] = useState<(typeof TIME)[number]>("낮");
  const [who, setWho] = useState<Who>("아이와");
  const [picked, setPicked] = useState<ZoneId | null>(null);

  const course = useMemo(() => makeCourse(when, time, who), [when, time, who]);
  const selected: ZoneId = picked ?? course.zones[0];

  const resetSentence = () => {
    setWhen("주말");
    setTime("낮");
    setWho("아이와");
    setPicked(null);
  };

  return (
    <section id="map" className="py-16 md:py-24" aria-labelledby="map-title">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle id="map" eyebrow="전시 구역" title="호수를 한 바퀴 돌며 보는 여섯 구역" color="#7b8fd6" />
          <div role="tablist" aria-label="보기 방식" className="inline-flex self-start rounded-full border bg-white p-1" style={{ borderColor: C.line }}>
            {(
              [
                ["course", "동선 추천"],
                ["all", "전체 구역"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={mode === k}
                onClick={() => setMode(k)}
                className="h-10 rounded-full px-5 text-[15px] font-semibold"
                style={mode === k ? { background: C.green, color: "#fff" } : { color: C.ink }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === "course" && (
          <div id="course" className="mt-10 scroll-mt-24 rounded-3xl p-5 md:p-8" style={{ background: C.pinkSoft + "80" }}>
            <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
              언제 가면 좋을까요? 분홍 글자를 누르면 바뀝니다.
            </p>
            <div className="mt-3 flex items-start gap-3">
              <p className={`${display.className} flex-1 text-[24px] leading-[1.9] md:text-[30px]`} style={{ color: C.ink }}>
                <Blank label="요일" value={when} options={WHEN} onChange={(v) => { setWhen(v); setPicked(null); }} />
                <Blank label="시간대" value={time} options={TIME} onChange={(v) => { setTime(v); setPicked(null); }} />에
                <Blank label="함께 가는 사람" value={who} options={WHO} onChange={(v) => { setWho(v); setPicked(null); }} />
                가요
              </p>
              <motion.button
                type="button"
                onClick={resetSentence}
                whileTap={{ rotate: -360 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
                style={{ color: C.green }}
                aria-label="처음 문장으로 되돌리기"
              >
                <RotateCcw size={18} aria-hidden />
              </motion.button>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <GardenMap selected={selected} onSelect={setPicked} course={mode === "course" ? course.zones : null} />
            {mode === "course" && (
              <div className="mt-5 rounded-3xl border bg-white p-5 md:p-6" style={{ borderColor: C.line }} aria-live="polite">
                <p className="text-[16px] font-bold" style={{ color: C.green }}>
                  추천 동선 {course.zones.map((id) => ZONE_BY_ID[id].name).join(", ")} 순서, {course.hours}
                </p>
                <ul className="mt-3 space-y-2 text-[15px] leading-[1.65]" style={{ color: C.ink }}>
                  {course.notes.map((n) => (
                    <li key={n} className="flex gap-2">
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.pink }} aria-hidden />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mode === "all" && (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {ZONES.map((z) => (
                  <li key={z.id}>
                    <button
                      type="button"
                      onClick={() => setPicked(z.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left"
                      style={{ borderColor: selected === z.id ? C.green : C.line }}
                    >
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: z.color }} aria-hidden />
                      <span className="text-[16px] font-semibold" style={{ color: C.ink }}>
                        {z.name}
                      </span>
                      <span className="ml-auto text-[14px]" style={{ color: C.muted }}>
                        {z.walk}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              <ZoneDetail key={selected} zone={ZONE_BY_ID[selected]} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 프로그램 일정 ─────────────────────────────────────── */

const KIND_STYLE: Record<ProgramKind, { bg: string; fg: string }> = {
  공연: { bg: C.pinkSoft, fg: C.pinkText },
  체험: { bg: C.yellowSoft, fg: "#7a5a00" },
  야간: { bg: "#e3e4f4", fg: "#3a3f7a" },
};

function ProgramSection({ today }: { today: number }) {
  const running = today >= START_DAY && today < START_DAY + DAYS;
  const [day, setDay] = useState<number | null>(null);
  const [kind, setKind] = useState<ProgramKind | "전체">("전체");
  const reduce = useReducedMotionSafe();

  const current = day ?? (running ? today - START_DAY : 0);
  const info = festDate(current);
  const list = programsFor(current).filter((p) => kind === "전체" || p.kind === kind);

  return (
    <section id="program" className="py-16 md:py-24" style={{ background: C.yellowSoft }} aria-labelledby="program-title">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <SectionTitle id="program" eyebrow="프로그램" title="날짜별 공연과 체험" />

        <div className="-mx-4 mt-8 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          <div role="tablist" aria-label="날짜 선택" className="flex gap-2">
            {Array.from({ length: DAYS }, (_, i) => {
              const f = festDate(i);
              const on = current === i;
              const isToday = running && today - START_DAY === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setDay(i)}
                  className="relative flex h-[72px] w-[56px] shrink-0 flex-col items-center justify-center rounded-2xl border-2"
                  style={on ? { background: C.green, borderColor: C.green, color: "#fff" } : { background: "#fff", borderColor: "transparent", color: C.ink }}
                >
                  <span className="text-[13px]" style={{ color: on ? "#fff" : f.dow === 0 ? C.pinkText : f.dow === 6 ? "#3a5fb0" : C.muted }}>
                    {WEEKDAY[f.dow]}
                  </span>
                  <span className={`${numFont.className} text-[22px] leading-none`}>{f.d}</span>
                  {f.night && <Moon size={11} className="mt-0.5" aria-label="야간 개장" />}
                  {isToday && <span className="absolute -top-2 rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: C.pinkText }}>오늘</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[17px] font-bold" style={{ color: C.green }}>
            {info.m}월 {info.d}일 {WEEKDAY[info.dow]}요일
            {info.night && <span className="ml-2 text-[15px] font-semibold" style={{ color: "#3a3f7a" }}>야간 정원 여는 날</span>}
          </p>
          <div className="flex gap-2" role="group" aria-label="종류 거르기">
            {(["전체", "공연", "체험", "야간"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className="h-9 rounded-full border px-4 text-[15px] font-semibold"
                style={kind === k ? { background: C.ink, borderColor: C.ink, color: "#fff" } : { background: "#fff", borderColor: C.line, color: C.ink }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <ol className="mt-5 space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((p, i) => (
              <motion.li
                key={`${current}-${p.time}-${p.title}`}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE, delay: reduce ? 0 : i * 0.04 }}
                className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 md:px-6"
              >
                <span className={`${numFont.className} w-[56px] shrink-0 text-[22px]`} style={{ color: C.green }}>
                  {p.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-bold" style={{ color: C.ink }}>
                    {p.title}
                  </p>
                  <p className="text-[14px]" style={{ color: C.muted }}>
                    {p.place}
                  </p>
                </div>
                <span className="shrink-0 rounded-full px-3 py-1 text-[13px] font-bold" style={{ background: KIND_STYLE[p.kind].bg, color: KIND_STYLE[p.kind].fg }}>
                  {p.kind}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
          {list.length === 0 && (
            <li className="rounded-2xl bg-white px-6 py-8 text-center text-[16px]" style={{ color: C.muted }}>
              이날은 {kind} 프로그램이 없습니다.
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

/* ─── 오시는 길 ─────────────────────────────────────────── */

function WaySection() {
  const items = [
    {
      icon: Bus,
      title: "무료 셔틀버스",
      body: "□□역 2번 출구 앞에서 08:40부터 10분마다 출발합니다. 야간 개장일에는 21:50에 마지막 차가 떠납니다.",
    },
    {
      icon: TrainFront,
      title: "지하철과 시내버스",
      body: "□□선 ○○공원역 3번 출구에서 걸어서 12분입니다. 시내버스 21, 37, 104번은 박람회 정문 정류장에 섭니다.",
    },
    {
      icon: Car,
      title: "주차장",
      body: "제1~3 주차장 2,800면, 승용차 하루 4,000원입니다. 주말 오전 10시 전후로 가득 차니 셔틀버스를 권합니다.",
    },
  ];
  return (
    <section id="way" className="py-16 md:py-24" aria-labelledby="way-title">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <SectionTitle id="way" eyebrow="오시는 길" title="□□시 ○○호수공원" color="#4f8a5b" />
        <p className="mt-4 flex items-center gap-2 text-[17px]" style={{ color: C.ink }}>
          <MapPin size={18} aria-hidden style={{ color: C.pinkText }} />
          □□시 □□로 200 ○○호수공원 정문
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-3xl border-t-4 bg-white p-6" style={{ borderColor: C.green }}>
              <Icon size={26} aria-hidden style={{ color: C.green }} />
              <h3 className="mt-3 text-[19px] font-bold" style={{ color: C.ink }}>
                {title}
              </h3>
              <p className="mt-2 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── 자주 묻는 질문 ─────────────────────────────────────── */

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotionSafe();
  return (
    <section id="faq" className="py-16 md:py-24" style={{ background: C.greenSoft }} aria-labelledby="faq-title">
      <div className="mx-auto max-w-[880px] px-4 md:px-6">
        <SectionTitle id="faq" eyebrow="자주 묻는 질문" title="가기 전에 많이 묻는 것" color={C.pink} />
        <ul className="mt-8 space-y-2">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="overflow-hidden rounded-2xl bg-white">
                <h3>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-[17px] font-semibold"
                    style={{ color: C.ink }}
                  >
                    <span className="flex-1">{f.q}</span>
                    <ChevronDown size={20} aria-hidden className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${on ? "rotate-180" : ""}`} style={{ color: C.green }} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={reduce ? { opacity: 0 } : { height: 0 }}
                      animate={reduce ? { opacity: 1 } : { height: "auto" }}
                      exit={reduce ? { opacity: 0 } : { height: 0 }}
                      transition={{ duration: 0.26, ease: EASE }}
                    >
                      <p className="px-5 pb-5 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ─── 페이지 ─────────────────────────────────────────────── */

export function FlowerExpoDemo() {
  const today = useTodayNumber();
  return (
    <div className="min-h-screen" style={{ background: C.cream, color: C.ink }}>
      <Header />
      <main>
        <Hero today={today} />
        <BloomSection />
        <InfoSection />
        <MapSection />
        <ProgramSection today={today} />
        <WaySection />
        <FaqSection />
      </main>
      <footer className="pb-24 pt-12" style={{ background: C.green, color: "#e4efe6" }}>
        <div className="mx-auto max-w-[1200px] px-4 text-[15px] leading-[1.8] md:px-6">
          <p className={`${display.className} text-[22px] text-white`}>{EXPO}</p>
          <p className="mt-3">주최 □□시 | 주관 ○○꽃박람회 조직위원회</p>
          <p>□□시 □□로 200 ○○호수공원 관리사무소 2층</p>
          <p className="flex items-center gap-1">
            <Phone size={14} aria-hidden />
            관람 문의 {TEL} (09:00 ~ 18:00)
          </p>
        </div>
      </footer>
    </div>
  );
}
