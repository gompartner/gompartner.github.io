"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Baby,
  Bus,
  Car,
  ChevronDown,
  ChevronRight,
  HeartPulse,
  Info,
  Lock,
  Menu,
  Minus,
  Phone,
  Plus,
  TrainFront,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 꽃박람회 축제 안내 데모: 가상의 "2027 ○○ 꽃박람회".
   개최지, 주최 기관, 입장료, 프로그램, 공지, 연락처는 모두 가상이다.

   구성은 실제 지역 꽃박람회 누리집의 안내형을 따른다.
   첫 화면은 포스터형 대표 배너와 장소·기간 띠, 그 아래 운영시간 상자와 관람요금 상자,
   사진 바로가기, 공지사항, 포토갤러리, 자주 묻는 질문 순서다.
   하위 화면(행사개요, 오시는 길, 관람안내, 추천 코스, 개화 현황, 일정 안내, 공지사항, 포토갤러리, 자주 묻는 질문)은
   라우트 없이 상태로 바꾸며, 띠 배너, 위치 표시, 가운데 제목, 같은 메뉴 묶음 탭으로 된 공통 틀을 쓴다.

   디자인: 크림 바탕(#fffaf0)에 짙은 초록(#1f4d3a), 꽃잎 분홍(#e8577a), 버터 노랑(#f6d365).
   추천 코스는 누구와, 언제를 고르면 그림 지도 위에 번호 동선이 그려진다.
   개화 현황은 주를 바꾸면 꽃 네 송이가 단계만큼 피거나 오므라든다.

   사진 출처(public/images/demo-flower):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, tulip, rose, night */

const IMG = "/images/demo-flower";
const EXPO = "2027 ○○ 꽃박람회";
const TEL = "000-000-0000";
const PLACE = "□□시 ○○호수공원";
const PERIOD = "2027. 4. 23.(금) ~ 5. 9.(일)";

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

/* ─── 화면과 메뉴 ─────────────────────────────────────────── */

type Page = "home" | "overview" | "way" | "guide" | "course" | "bloom" | "program" | "notice" | "gallery" | "faq";

const MENU: { label: string; items: { id: Page; label: string }[] }[] = [
  {
    label: "행사소개",
    items: [
      { id: "overview", label: "행사개요" },
      { id: "way", label: "오시는 길" },
      { id: "guide", label: "관람안내" },
    ],
  },
  {
    label: "프로그램",
    items: [
      { id: "course", label: "추천 코스" },
      { id: "bloom", label: "개화 현황" },
      { id: "program", label: "일정 안내" },
    ],
  },
  {
    label: "소식·자료",
    items: [
      { id: "notice", label: "공지사항" },
      { id: "gallery", label: "포토갤러리" },
    ],
  },
  {
    label: "시민참여",
    items: [{ id: "faq", label: "자주 묻는 질문" }],
  },
];

function groupOf(page: Page) {
  return MENU.find((g) => g.items.some((i) => i.id === page))!;
}

function labelOf(page: Page) {
  return groupOf(page).items.find((i) => i.id === page)!.label;
}

type Go = (p: Page) => void;

/** 탭 목록에서 왼쪽·오른쪽 화살표로 이동한다. */
function onTabKeys(e: React.KeyboardEvent<HTMLElement>, count: number, cur: number, set: (i: number) => void, prefix: string) {
  let next = -1;
  if (e.key === "ArrowRight") next = (cur + 1) % count;
  else if (e.key === "ArrowLeft") next = (cur - 1 + count) % count;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = count - 1;
  if (next < 0) return;
  e.preventDefault();
  set(next);
  document.getElementById(`${prefix}-${next}`)?.focus();
}

/* ─── 데이터 ─────────────────────────────────────────────── */

type ZoneId = "tulip" | "rose" | "hydrangea" | "hall" | "night" | "play";

interface Zone {
  id: ZoneId;
  name: string;
  x: number;
  y: number;
  color: string;
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
    what: "튤립 52종 120만 송이가 색깔별로 피어 있습니다.",
    best: "오전 10시 이전",
    spot: "풍차 전망대 2층",
    walk: "30분",
  },
  {
    id: "rose",
    name: "장미 터널",
    x: 520,
    y: 110,
    color: "#c23a5e",
    what: "호숫가를 따라 600m 이어진 덩굴장미 아치로, 5월 첫째 주부터 꽃이 핍니다.",
    best: "오후 4시 이후",
    spot: "터널 중간 흰 벤치",
    walk: "15분",
  },
  {
    id: "hydrangea",
    name: "수국 길",
    x: 650,
    y: 300,
    color: "#7b8fd6",
    what: "경사가 없고 중간에 그늘 쉼터가 세 곳 있습니다.",
    best: "한낮",
    spot: "길 끝 연못 나무 다리",
    walk: "20분",
  },
  {
    id: "hall",
    name: "실내 전시관",
    x: 430,
    y: 420,
    color: "#4f8a5b",
    what: "꽃꽂이 작품전과 희귀 식물 온실을 볼 수 있습니다. 수유실과 식당도 이 건물에 있습니다.",
    best: "비 오는 날, 한낮",
    spot: "1층 중앙 꽃 샹들리에",
    walk: "40분",
  },
  {
    id: "night",
    name: "야간 정원",
    x: 640,
    y: 470,
    color: "#3a3f7a",
    what: "금·토·일 저녁에만 문을 엽니다.",
    best: "19:30 분수 공연",
    spot: "호수 쪽 데크 계단",
    walk: "30분",
  },
  {
    id: "play",
    name: "체험 마당",
    x: 160,
    y: 400,
    color: "#d9a520",
    what: "꽃 화분 만들기와 압화 책갈피 체험이 있으며 현장에서 선착순으로 접수합니다.",
    best: "오전 11시 첫 회차",
    spot: "입구 대형 꽃 화분 조형물",
    walk: "체험 1개당 20분",
  },
];

const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z])) as Record<ZoneId, Zone>;

const GATE = { x: 90, y: 260 };

/* 개화 현황: 0 봉오리, 1 개화 시작, 2 부분 개화, 3 만개, 4 낙화 */
const STAGE = ["봉오리", "개화 시작", "부분 개화", "만개", "낙화"];
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

/* 입장권 */
const TICKETS = [
  { id: "general", name: "일반권", note: "만 19세 이상 64세 이하", price: 12000 },
  { id: "special", name: "우대권", note: "만 4세 이상 18세 이하, 군인", price: 8000 },
  { id: "free", name: "무료입장", note: "만 3세 이하, 만 65세 이상, 장애인과 동반 보호자 1명", price: 0 },
] as const;

type TicketId = (typeof TICKETS)[number]["id"];

const GROUP_MIN = 20;
const GROUP_RATE = 0.2;
const RESIDENT_RATE = 0.5;

/* 추천 코스 */
const WHO = [
  { id: "kids", label: "아이와 함께" },
  { id: "couple", label: "연인·친구" },
  { id: "parents", label: "부모님과" },
  { id: "solo", label: "혼자" },
] as const;
const WHEN = [
  { id: "weekday-day", label: "평일 낮" },
  { id: "weekend-day", label: "주말 낮" },
  { id: "weekday-night", label: "평일 저녁" },
  { id: "weekend-night", label: "주말 저녁" },
] as const;

type WhoId = (typeof WHO)[number]["id"];
type WhenId = (typeof WHEN)[number]["id"];

const DAY_COURSE: Record<WhoId, { zones: ZoneId[]; tip: string }> = {
  kids: { zones: ["play", "tulip", "hall"], tip: "유모차는 정문 종합안내소에서 무료 대여합니다. 수유실은 실내 전시관 1층에 있습니다." },
  couple: { zones: ["tulip", "rose", "hydrangea"], tip: "풍차 전망대는 오전에 가면 덜 기다립니다." },
  parents: { zones: ["hall", "hydrangea", "tulip"], tip: "정문에서 실내 전시관까지 순환 전동차가 15분 간격으로 운행합니다." },
  solo: { zones: ["hydrangea", "rose", "hall"], tip: "수국 길 끝 나무 다리는 비교적 한산합니다." },
};

function makeCourse(when: WhenId, who: WhoId) {
  const base = DAY_COURSE[who];
  const notes: string[] = [];
  let zones = [...base.zones];
  let hours = who === "kids" ? "약 2시간" : "약 2시간 30분";
  const weekend = when.startsWith("weekend");

  if (when === "weekday-night") {
    zones = zones.slice(0, 2);
    hours = "약 1시간 30분";
    notes.push("야간 정원은 금·토·일에만 운영합니다. 평일은 17:00에 입장을 마감합니다.");
  } else if (when === "weekend-night") {
    zones = [...zones.filter((z) => z !== "hall").slice(0, 2), "night"];
    hours = "약 2시간";
    notes.push("야간 정원은 18:00 ~ 21:30 운영하며, 19:30에 미디어 분수 공연이 있습니다.");
  }
  notes.push(
    weekend
      ? "주말 11:00 ~ 15:00가 가장 혼잡합니다. 주차장이 붐비니 무료 셔틀버스를 이용해 주세요."
      : "화·수요일 오전 10시대는 단체 관람객이 많습니다.",
  );
  notes.push(base.tip);
  return { zones, hours, notes };
}

/* 프로그램 일정 */
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
    { time: "14:00", title: "정원 해설 투어", place: "튤립 정원 풍차 앞", kind: "체험" },
  ];
  if (i === 0) list.unshift({ time: "10:00", title: "개막식", place: "호숫가 중앙 무대", kind: "공연" });
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

const NOTICES = [
  {
    title: "2027 ○○ 꽃박람회 사전예매권 판매 안내",
    date: "2026.10.05",
    isNew: true,
    body: "사전예매권은 2026년 12월 1일부터 2027년 4월 22일까지 온라인으로 판매하며, 일반권 기준 2,000원 할인됩니다. 수량이 정해져 있어 조기 마감될 수 있습니다.",
  },
  {
    title: "꽃박람회 자원봉사자 모집",
    date: "2026.10.02",
    isNew: true,
    body: "관람 안내, 체험 보조, 편의시설 운영을 맡을 자원봉사자 120명을 모집합니다. 신청은 10월 31일까지 시민참여 메뉴에서 받습니다.",
  },
  {
    title: "참여 정원 조성 작가 공모 결과 발표",
    date: "2026.09.24",
    isNew: false,
    body: "참여 정원 조성 작가 공모에서 12개 팀을 선정했습니다. 선정된 팀에는 개별 연락드립니다.",
  },
  {
    title: "무료 셔틀버스 운행 안내",
    date: "2026.09.15",
    isNew: false,
    body: "행사 기간 중 □□역 2번 출구에서 박람회 정문까지 무료 셔틀버스를 10분 간격으로 운행합니다. 야간 개장일 막차는 21:50입니다.",
  },
  {
    title: "2027 ○○ 꽃박람회 개최 일정 확정",
    date: "2026.08.20",
    isNew: false,
    body: `2027 ○○ 꽃박람회는 ${PERIOD} 17일간 ${PLACE} 일대에서 열립니다.`,
  },
];

const PHOTOS = [
  { src: `${IMG}/hero.jpg`, alt: "호숫가를 따라 튤립이 활짝 핀 꽃밭", caption: "호숫가 튤립 정원" },
  { src: `${IMG}/tulip.jpg`, alt: "색깔별 띠로 심은 튤립", caption: "튤립 정원 색깔 띠" },
  { src: `${IMG}/rose.jpg`, alt: "덩굴장미가 덮인 아치 터널", caption: "장미 터널" },
  { src: `${IMG}/night.jpg`, alt: "조명을 밝힌 야간 정원과 호수", caption: "야간 정원" },
];

const FAQ = [
  { q: "재입장이 가능한가요?", a: "당일에 한해 출구에서 재입장 확인 도장을 받으면 다시 입장할 수 있습니다." },
  { q: "반려동물 동반 입장이 가능한가요?", a: "목줄을 착용하면 야외 구역은 동반 관람할 수 있습니다. 실내 전시관과 체험 마당 천막 안은 입장할 수 없습니다." },
  { q: "비가 오면 어떻게 운영하나요?", a: "박람회는 정상 운영하며 야외 공연만 실내 전시관 2층으로 옮깁니다. 변경 일정은 정문 안내판과 공지사항에 게시합니다." },
  { q: "유모차나 휠체어를 대여할 수 있나요?", a: "정문 종합안내소에서 신분증을 맡기면 무료 대여합니다. 수량이 한정되어 주말 오전에는 조기 소진될 수 있습니다." },
  { q: "음식물 반입이 가능한가요?", a: "도시락과 음료는 반입할 수 있습니다. 돗자리는 잔디 광장에서만 사용할 수 있으며 꽃밭 안에서는 취식할 수 없습니다." },
  { q: "할인을 받으려면 무엇이 필요한가요?", a: "할인 및 무료 입장 대상은 증빙서류를 지참해 현장매표소에서 제시해 주세요. □□시민은 주소가 표시된 신분증, 경로와 장애인은 신분증이나 복지카드가 필요합니다." },
];

/* ─── 공통 조각 ─────────────────────────────────────────── */

/** 꽃잎 다섯 장짜리 꽃. open 0~1 */
function Flower({ size = 40, color = C.pink, open = 1 }: { size?: number; color?: string; open?: number }) {
  const reduce = useReducedMotionSafe();
  const petals = [0, 72, 144, 216, 288];
  const s = 0.25 + 0.75 * open;
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden>
      {petals.map((r) => (
        <motion.ellipse
          key={r}
          cx={0}
          cy={-9}
          rx={6}
          ry={9}
          fill={color}
          style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}
          initial={false}
          animate={{ rotate: Math.round(r + (1 - open) * -30), scale: s, opacity: open === 0 ? 0.55 : 0.92 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
        />
      ))}
      <circle r={open === 0 ? 4 : 4.5} fill={C.yellow} />
    </svg>
  );
}

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1200px] px-4 md:px-6 ${className}`}>{children}</div>;
}

function MoreButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${label} 더보기`} className="inline-flex h-10 items-center gap-0.5 text-[14px] font-semibold" style={{ color: C.muted }}>
      더보기
      <Plus size={15} aria-hidden />
    </button>
  );
}

function BoxHead({ id, title, more }: { id: string; title: string; more?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 pb-2" style={{ borderColor: C.green }}>
      <h2 id={id} className="text-[21px] font-bold tracking-[-0.02em] md:text-[23px]" style={{ color: C.green }}>
        {title}
      </h2>
      {more && <MoreButton onClick={more} label={title} />}
    </div>
  );
}

/* ─── 머리글 ─────────────────────────────────────────────── */

function Header({ page, go }: { page: Page; go: Go }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();
  const current = page === "home" ? null : groupOf(page).label;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (p: Page) => {
    setOpen(false);
    go(p);
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.cream, borderColor: C.line }}>
      <div className="hidden text-[13px] md:block" style={{ background: C.green, color: "#cfe3d5" }}>
        <Container className="flex h-8 items-center justify-between">
          <span>주최 □□시 · 주관 ○○꽃박람회 조직위원회</span>
          <span className="flex items-center gap-1">
            <Phone size={12} aria-hidden />
            관람 문의 {TEL}
          </span>
        </Container>
      </div>
      <Container className="flex h-16 items-center justify-between gap-3">
        <button type="button" onClick={() => pick("home")} className="flex min-w-0 items-center gap-2" aria-label={`${EXPO} 메인으로`}>
          <Flower size={30} />
          <span className="truncate text-[18px] font-bold leading-none tracking-[-0.03em] md:text-[20px]" style={{ color: C.green }}>
            {EXPO}
          </span>
        </button>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {MENU.map((g) => (
              <li key={g.label}>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls="expo-allmenu"
                  aria-current={current === g.label ? "page" : undefined}
                  className="h-11 rounded-[6px] px-4 text-[17px] font-semibold"
                  style={{ color: current === g.label ? C.pinkText : C.ink }}
                >
                  {g.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => pick("guide")}
            className="hidden h-10 items-center rounded-[6px] px-4 text-[15px] font-bold text-white sm:inline-flex"
            style={{ background: C.pinkText }}
          >
            입장권 예매
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px]"
            style={{ color: C.green }}
            aria-expanded={open}
            aria-controls="expo-allmenu"
            aria-label={open ? "전체메뉴 닫기" : "전체메뉴 열기"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
      </Container>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="expo-allmenu"
            aria-label="전체메뉴"
            className="overflow-hidden border-t"
            style={{ borderColor: C.line, background: C.paper }}
            initial={reduce ? { opacity: 0 } : { height: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <Container className="grid grid-cols-2 gap-x-4 gap-y-5 py-6 md:grid-cols-4">
              {MENU.map((g) => (
                <div key={g.label}>
                  <p className="border-b-2 pb-1.5 text-[16px] font-bold" style={{ borderColor: C.green, color: C.green }}>
                    {g.label}
                  </p>
                  <ul className="mt-1">
                    {g.items.map((it) => (
                      <li key={it.id}>
                        <button
                          type="button"
                          onClick={() => pick(it.id)}
                          aria-current={page === it.id ? "page" : undefined}
                          className="flex h-10 w-full items-center text-left text-[15px]"
                          style={{ color: page === it.id ? C.pinkText : C.ink, fontWeight: page === it.id ? 700 : 400 }}
                        >
                          {it.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                type="button"
                onClick={() => pick("guide")}
                className="col-span-2 h-11 rounded-[6px] text-[15px] font-bold text-white sm:hidden"
                style={{ background: C.pinkText }}
              >
                입장권 예매
              </button>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── 메인 ─────────────────────────────────────────────── */

function PosterBanner() {
  return (
    <section aria-labelledby="poster-title" className="relative">
      <div className="relative h-[460px] sm:h-[520px] md:h-[600px]">
        <Image src={`${IMG}/hero.jpg`} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "60% 50%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(31,77,58,0.1) 0%, rgba(31,77,58,0.2) 45%, rgba(20,40,30,0.72) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-10 text-center text-white md:pb-14">
          <h1 id="poster-title" className="font-bold leading-[1.05] tracking-[-0.04em]" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.25)" }}>
            <span className="block text-[30px] md:text-[44px]">2027</span>
            <span className="mt-1 block text-[40px] sm:text-[52px] md:text-[80px]">○○ 꽃박람회</span>
          </h1>
          <p className="mt-4 text-[17px] font-semibold md:text-[20px]">{PERIOD}</p>
          <p className="text-[16px] md:text-[18px]">{PLACE} 일대</p>
        </div>
      </div>
    </section>
  );
}

function HoursBox() {
  const rows: [string, string][] = [
    ["낮 정원", "매일 09:00 ~ 18:00"],
    ["입장 마감", "17:00"],
    ["야간 정원", "금·토·일 18:00 ~ 21:30"],
    ["고객센터", "09:00 ~ 18:00"],
  ];
  return (
    <section id="hours" aria-labelledby="hours-title" className="rounded-[10px] border-2 p-5 md:p-6" style={{ borderColor: C.green, background: C.paper }}>
      <h2 id="hours-title" className="text-[21px] font-bold tracking-[-0.02em]" style={{ color: C.green }}>
        운영시간
      </h2>
      <table className="mt-3 w-full text-[16px]">
        <caption className="sr-only">운영시간</caption>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b first:border-t" style={{ borderColor: C.line }}>
              <th scope="row" className="w-[112px] py-2.5 pr-3 text-left font-bold" style={{ color: C.ink }}>
                {k}
              </th>
              <td className="py-2.5 font-semibold tabular-nums" style={{ color: C.ink }}>
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href={`tel:${TEL}`} className="mt-5 flex items-center gap-2 border-t pt-4" style={{ borderColor: C.line }}>
        <Phone size={26} style={{ color: C.pinkText }} aria-hidden />
        <span className="text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums md:text-[34px]" style={{ color: C.pinkText }}>
          {TEL}
        </span>
      </a>
      <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
        매표 마감 17:00, 야간 정원은 낮 입장권으로 함께 이용합니다.
      </p>
    </section>
  );
}

function FeeTable() {
  return (
    <table className="w-full text-[15px]">
      <caption className="sr-only">권종별 관람요금</caption>
      <thead>
        <tr className="border-y text-[14px]" style={{ borderColor: C.green, background: C.greenSoft }}>
          <th scope="col" className="px-2 py-2 text-left font-semibold">
            구분
          </th>
          <th scope="col" className="px-2 py-2 text-right font-semibold">
            입장요금
          </th>
          <th scope="col" className="hidden px-2 py-2 text-left font-semibold sm:table-cell">
            대상
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          ["일반권", "12,000원", TICKETS[0].note],
          ["우대권", "8,000원", TICKETS[1].note],
          ["단체권", "9,600원", `${GROUP_MIN}인 이상 단체 (일반권 기준 20% 할인)`],
          ["무료입장", "무료", TICKETS[2].note],
        ].map(([k, v, note]) => (
          <tr key={k} className="border-b align-top" style={{ borderColor: C.line }}>
            <th scope="row" className="px-2 py-2.5 text-left font-semibold">
              {k}
              <span className="block text-[13px] font-normal leading-[1.45] sm:hidden" style={{ color: C.muted }}>
                {note}
              </span>
            </th>
            <td className="whitespace-nowrap px-2 py-2.5 text-right font-bold tabular-nums" style={{ color: C.pinkText }}>
              {v}
            </td>
            <td className="hidden px-2 py-2.5 text-[14px] sm:table-cell" style={{ color: C.muted }}>
              {note}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FeeCalculator({ idPrefix }: { idPrefix: string }) {
  const [count, setCount] = useState<Record<TicketId, number>>({ general: 2, special: 1, free: 0 });
  const [resident, setResident] = useState(false);

  const paying = count.general + count.special;
  const people = paying + count.free;
  const subtotal = TICKETS.reduce((sum, t) => sum + t.price * count[t.id], 0);
  const group = paying >= GROUP_MIN;
  const rate = resident ? RESIDENT_RATE : group ? GROUP_RATE : 0;
  const total = Math.round((subtotal * (1 - rate)) / 100) * 100;

  const change = (id: TicketId, d: number) => setCount((c) => ({ ...c, [id]: Math.max(0, Math.min(99, c[id] + d)) }));

  return (
    <div className="rounded-[10px] p-4 md:p-5" style={{ background: C.yellowSoft }}>
      <ul className="divide-y" style={{ borderColor: C.line }}>
        {TICKETS.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2.5" style={{ borderColor: "#efe2b8" }}>
            <p className="min-w-0 flex-1 text-[16px] font-semibold" id={`${idPrefix}-${t.id}`}>
              {t.name}
              <span className="ml-2 text-[14px] font-normal tabular-nums" style={{ color: C.muted }}>
                {t.price ? `${t.price.toLocaleString("ko-KR")}원` : "무료"}
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-1" role="group" aria-labelledby={`${idPrefix}-${t.id}`}>
              <button
                type="button"
                onClick={() => change(t.id, -1)}
                disabled={count[t.id] === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border bg-white disabled:opacity-35"
                style={{ borderColor: C.line, color: C.green }}
                aria-label={`${t.name} 1명 빼기`}
              >
                <Minus size={16} aria-hidden />
              </button>
              <span className="w-8 text-center text-[20px] font-bold tabular-nums" aria-live="polite">
                {count[t.id]}
              </span>
              <button
                type="button"
                onClick={() => change(t.id, 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border bg-white"
                style={{ borderColor: C.line, color: C.green }}
                aria-label={`${t.name} 1명 더하기`}
              >
                <Plus size={16} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-[16px]">
        <input type="checkbox" checked={resident} onChange={(e) => setResident(e.target.checked)} className="h-5 w-5" style={{ accentColor: C.green }} />
        □□시민 (50% 할인)
      </label>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2 border-t pt-3" style={{ borderColor: "#efe2b8" }}>
        <p className="text-[15px]" style={{ color: C.muted }}>
          총 {people}명
          {rate > 0 && (
            <span className="ml-2 font-semibold" style={{ color: C.green }}>
              {resident ? "시민 할인" : "단체권"} 적용
            </span>
          )}
        </p>
        <p className="text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums" style={{ color: C.green }} aria-live="polite">
          {total.toLocaleString("ko-KR")}원
        </p>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        할인 및 무료 입장 대상은 증빙서류를 지참해 현장매표소에서 제시해 주세요. 시민 할인과 단체 할인은 중복 적용되지 않습니다.
      </p>
    </div>
  );
}

function FeeBox({ go }: { go: Go }) {
  const [calc, setCalc] = useState(false);
  const reduce = useReducedMotionSafe();
  return (
    <section id="fee" aria-labelledby="fee-title" className="rounded-[10px] border-2 p-5 md:p-6" style={{ borderColor: C.green, background: C.paper }}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="fee-title" className="text-[21px] font-bold tracking-[-0.02em]" style={{ color: C.green }}>
          관람요금
        </h2>
        <button type="button" onClick={() => go("guide")} className="inline-flex h-10 items-center gap-0.5 text-[14px] font-semibold" style={{ color: C.muted }}>
          관람안내
          <ChevronRight size={15} aria-hidden />
        </button>
      </div>
      <div className="mt-3">
        <FeeTable />
      </div>
      <button
        type="button"
        onClick={() => setCalc((v) => !v)}
        aria-expanded={calc}
        aria-controls="fee-calc"
        className="mt-4 flex h-11 w-full items-center justify-center gap-1.5 rounded-[6px] text-[15px] font-bold"
        style={{ background: C.green, color: "#fff" }}
      >
        요금 계산
        <ChevronDown size={18} aria-hidden className={`transition-transform duration-200 motion-reduce:transition-none ${calc ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {calc && (
          <motion.div
            id="fee-calc"
            className="overflow-hidden"
            initial={reduce ? { opacity: 0 } : { height: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <div className="pt-3">
              <FeeCalculator idPrefix="home-fee" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function QuickTiles({ go }: { go: Go }) {
  const tiles: { page: Page; label: string; src: string }[] = [
    { page: "course", label: "추천 코스", src: `${IMG}/hero.jpg` },
    { page: "bloom", label: "개화 현황", src: `${IMG}/tulip.jpg` },
    { page: "program", label: "일정 안내", src: `${IMG}/rose.jpg` },
    { page: "way", label: "오시는 길", src: `${IMG}/night.jpg` },
  ];
  return (
    <nav id="quick" aria-label="바로가기" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {tiles.map((t) => (
        <button key={t.page} type="button" onClick={() => go(t.page)} className="group relative aspect-[4/3] overflow-hidden rounded-[10px] text-left md:aspect-[5/4]">
          <Image src={t.src} alt="" fill sizes="(min-width: 768px) 280px, 50vw" className="object-cover" />
          <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)" }} />
          <span className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[17px] font-bold text-white underline-offset-4 group-hover:underline md:text-[19px]">
            {t.label}
            <ChevronRight size={20} aria-hidden />
          </span>
        </button>
      ))}
    </nav>
  );
}

function NoticeList({ limit, onOpen }: { limit?: number; onOpen: (i: number) => void }) {
  return (
    <ul>
      {NOTICES.slice(0, limit).map((n, i) => (
        <li key={n.title} className="border-b" style={{ borderColor: C.line }}>
          <button type="button" onClick={() => onOpen(i)} className="flex min-h-[52px] w-full items-center gap-3 py-2 text-left">
            <span className="min-w-0 flex-1 truncate text-[16px]">
              {n.title}
              {n.isNew && (
                <span className="ml-1.5 inline-flex h-[18px] items-center rounded-[2px] px-1 align-[2px] text-[11px] font-bold text-white" style={{ background: C.pinkText }}>
                  새글
                </span>
              )}
            </span>
            <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
              {n.date}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function FaqList({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotionSafe();
  return (
    <ul className="border-t" style={{ borderColor: C.line }}>
      {FAQ.slice(0, limit).map((f, i) => {
        const on = open === i;
        return (
          <li key={f.q} className="border-b" style={{ borderColor: C.line }}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${limit ?? "all"}-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex min-h-[56px] w-full items-center gap-3 py-3 text-left text-[16px] font-semibold"
              >
                <span className="font-bold" style={{ color: C.pinkText }}>
                  Q
                </span>
                <span className="flex-1">{f.q}</span>
                <ChevronDown size={20} aria-hidden className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${on ? "rotate-180" : ""}`} style={{ color: C.green }} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={`faq-${limit ?? "all"}-${i}`}
                  className="overflow-hidden"
                  initial={reduce ? { opacity: 0 } : { height: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { height: 0 }}
                  transition={{ duration: 0.24, ease: EASE }}
                >
                  <p className="pb-4 pl-6 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

function Home({ go, openNotice }: { go: Go; openNotice: (i: number) => void }) {
  return (
    <>
      <PosterBanner />
      <Container className="py-10 md:py-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <HoursBox />
          <FeeBox go={go} />
        </div>
        <div className="mt-10 md:mt-14">
          <QuickTiles go={go} />
        </div>
        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-2 lg:gap-10">
          <section aria-labelledby="home-notice-title" className="min-w-0">
            <BoxHead id="home-notice-title" title="공지사항" more={() => go("notice")} />
            <NoticeList limit={5} onOpen={openNotice} />
          </section>
          <section aria-labelledby="home-gallery-title" className="min-w-0">
            <BoxHead id="home-gallery-title" title="포토갤러리" more={() => go("gallery")} />
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {PHOTOS.map((p) => (
                <li key={p.src}>
                  <button type="button" onClick={() => go("gallery")} className="relative block aspect-[4/3] w-full overflow-hidden rounded-[6px]" aria-label={`${p.caption} 사진 보기`}>
                    <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 290px, 50vw" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <section aria-labelledby="home-faq-title" className="mt-12 md:mt-16">
          <BoxHead id="home-faq-title" title="자주 묻는 질문" more={() => go("faq")} />
          <FaqList limit={4} />
        </section>
      </Container>
    </>
  );
}

/* ─── 하위 화면 공통 틀 ─────────────────────────────────── */

function SubFrame({ page, go, children }: { page: Page; go: Go; children: React.ReactNode }) {
  const group = groupOf(page);
  const label = labelOf(page);
  return (
    <>
      <div className="relative h-[120px] overflow-hidden md:h-[160px]">
        <Image src={`${IMG}/tulip.jpg`} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(31,77,58,0.72)" }} />
        <p className="absolute inset-0 flex items-center justify-center text-[24px] font-bold tracking-[-0.02em] text-white md:text-[32px]">{group.label}</p>
      </div>
      <nav aria-label={`${group.label} 메뉴`} className="border-b" style={{ borderColor: C.line, background: C.paper }}>
        <ul className="mx-auto flex max-w-[1200px] justify-center overflow-x-auto px-2">
          {group.items.map((it) => (
            <li key={it.id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(it.id)}
                aria-current={it.id === page ? "page" : undefined}
                className="h-12 border-b-[3px] px-4 text-[16px] font-semibold"
                style={it.id === page ? { borderColor: C.pinkText, color: C.pinkText } : { borderColor: "transparent", color: C.ink }}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <Container className="pb-16 md:pb-24">
        <nav aria-label="현재 위치" className="flex justify-end pt-4 text-[13px]" style={{ color: C.muted }}>
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <button type="button" onClick={() => go("home")} className="hover:underline">
                HOME
              </button>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight size={13} aria-hidden />
              {group.label}
            </li>
            <li className="flex items-center gap-1" aria-current="page">
              <ChevronRight size={13} aria-hidden />
              <span style={{ color: C.ink }}>{label}</span>
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 flex items-center justify-center gap-2 text-center text-[28px] font-bold tracking-[-0.03em] md:text-[34px]" style={{ color: C.green }}>
          <span className="h-2 w-2 rounded-full" style={{ background: C.pink }} aria-hidden />
          {label}
          <span className="h-2 w-2 rounded-full" style={{ background: C.pink }} aria-hidden />
        </h1>
        <div className="mt-8 md:mt-10">{children}</div>
      </Container>
    </>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[20px] font-bold tracking-[-0.02em] md:text-[22px]" style={{ color: C.pinkText }}>
      {children}
    </h2>
  );
}

function DefTable({ rows, caption }: { rows: [string, React.ReactNode][]; caption: string }) {
  return (
    <table className="w-full border-t-2 text-[16px]" style={{ borderColor: C.green }}>
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b" style={{ borderColor: C.line }}>
            <th scope="row" className="w-[96px] px-3 py-3 text-left align-top font-semibold md:w-[160px]" style={{ background: C.greenSoft, color: C.green }}>
              {k}
            </th>
            <td className="px-3 py-3 align-top">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ─── 행사소개 ─────────────────────────────────────────── */

function OverviewPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <DefTable
        caption="행사개요"
        rows={[
          ["행사명", EXPO],
          ["기간", `${PERIOD}, 17일간`],
          ["운영시간", "09:00 ~ 18:00 (입장 마감 17:00), 야간 정원 금·토·일 18:00 ~ 21:30"],
          ["장소", `${PLACE} 일대 (야외 전시 6개 구역, 실내 전시관)`],
          ["주제", "호숫가 정원과 봄꽃"],
          ["규모", "튤립 52종 120만 송이, 덩굴장미 아치 600m, 수국 화분 3천 개"],
          ["주최", "□□시"],
          ["주관", "○○꽃박람회 조직위원회"],
          ["주요행사", "개막식, 야간 정원, 미디어 분수 공연, 정원 해설 투어, 체험 프로그램"],
        ]}
      />
    </div>
  );
}

function WayPage() {
  const items = [
    { icon: Bus, title: "무료 셔틀버스", body: "□□역 2번 출구 앞에서 08:40부터 10분 간격으로 출발합니다. 야간 개장일 막차는 21:50입니다." },
    { icon: TrainFront, title: "지하철·시내버스", body: "□□선 ○○공원역 3번 출구에서 도보 12분입니다. 시내버스 21, 37, 104번은 박람회 정문 정류장에 정차합니다." },
    { icon: Car, title: "주차장", body: "제1~3 주차장 2,800면, 승용차 1일 4,000원입니다. 주말 오전 10시 전후 만차가 잦으니 셔틀버스를 이용해 주세요." },
  ];
  return (
    <div className="mx-auto max-w-[900px]">
      <DefTable caption="주소" rows={[["주소", `□□시 □□로 200 ${PLACE.replace("□□시 ", "")} 정문`], ["문의", `관람 문의 ${TEL} (09:00 ~ 18:00)`]]} />
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-[10px] border-t-4 p-5" style={{ borderColor: C.green, background: C.paper }}>
            <Icon size={26} aria-hidden style={{ color: C.green }} />
            <h2 className="mt-3 text-[18px] font-bold">{title}</h2>
            <p className="mt-2 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
              {body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuidePage() {
  const facilities = [
    { icon: Info, title: "종합안내소", body: "정문 매표소 옆, 분실물 접수" },
    { icon: Baby, title: "수유실", body: "실내 전시관 1층, 정문 종합안내소" },
    { icon: Accessibility, title: "유모차 및 휠체어", body: "정문 종합안내소 무료 대여, 신분증 예치" },
    { icon: Lock, title: "물품보관함", body: "정문 광장 120칸, 1회 2,000원" },
    { icon: HeartPulse, title: "의료지원·자동심장충격기", body: "실내 전시관 1층 의무실, 구역별 자동심장충격기(AED)" },
  ];
  return (
    <div className="mx-auto grid max-w-[1000px] gap-12">
      <section>
        <SubHead>관람시간</SubHead>
        <DefTable
          caption="관람시간"
          rows={[
            ["낮 정원", "매일 09:00 ~ 18:00 (입장 마감 17:00)"],
            ["야간 정원", "금·토·일 18:00 ~ 21:30 (낮 입장권으로 이용)"],
            ["실내 전시관", "매일 09:30 ~ 17:30"],
          ]}
        />
      </section>
      <section id="ticket">
        <SubHead>입장권 안내</SubHead>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <FeeTable />
            <ul className="mt-4 space-y-1 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              <li>※ 사전예매권은 일반권 기준 2,000원 할인되며 조기 소진될 수 있습니다.</li>
              <li>※ 현장판매는 정문 매표소에서 09:00 ~ 17:00 운영합니다.</li>
              <li>※ □□시민은 신분증 제시 시 50% 할인됩니다.</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-[17px] font-bold" style={{ color: C.green }}>
              요금 계산
            </h3>
            <FeeCalculator idPrefix="guide-fee" />
          </div>
        </div>
      </section>
      <section>
        <SubHead>편의시설</SubHead>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3 rounded-[10px] border p-4" style={{ borderColor: C.line, background: C.paper }}>
              <Icon size={24} className="mt-0.5 shrink-0" style={{ color: C.green }} aria-hidden />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ─── 추천 코스 ─────────────────────────────────────────── */

function GardenMap({ course }: { course: ZoneId[] }) {
  const reduce = useReducedMotionSafe();
  const pts = [GATE, ...course.map((id) => ZONE_BY_ID[id])];
  const pathD = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx = Math.round((prev.x + p.x) / 2);
      const cy = Math.min(prev.y, p.y) - 40;
      return `Q ${cx} ${cy} ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 800 560" className="h-auto w-full" role="img" aria-label={`추천 코스 그림 지도: 정문에서 ${course.map((id, i) => `${i + 1} ${ZONE_BY_ID[id].name}`).join(", ")} 순서`}>
      <rect x="0" y="0" width="800" height="560" rx="24" fill="#eaf4e4" />
      <path d="M300 230 C 330 170, 470 160, 520 210 C 580 260, 560 340, 480 360 C 400 380, 300 360, 285 300 C 278 270, 285 250, 300 230 Z" fill={C.lake} />
      <text x="420" y="285" textAnchor="middle" fontSize="18" fill="#3d6f80" fontWeight="700">
        ○○호수
      </text>
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
      {[
        [60, 120],
        [740, 90],
        [760, 500],
        [40, 500],
        [300, 40],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="16" fill="#9cc58f" />
          <circle cx={x + 12} cy={y + 6} r="11" fill="#86b47a" />
        </g>
      ))}

      <rect x={GATE.x - 34} y={GATE.y + 14} width="68" height="28" rx="14" fill={C.green} />
      <text x={GATE.x} y={GATE.y + 33} textAnchor="middle" fontSize="15" fill="#fff" fontWeight="700">
        정문
      </text>

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
        transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
      />

      {ZONES.map((z) => {
        const order = course.indexOf(z.id);
        const on = order >= 0;
        return (
          <g key={z.id} opacity={on ? 1 : 0.5}>
            <circle cx={z.x} cy={z.y} r="40" fill="#fff" stroke={on ? C.green : "#fff"} strokeWidth="3" />
            <g transform={`translate(${z.x} ${z.y - 6})`}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx={0} cy={-9} rx={6.5} ry={10} fill={z.color} transform={`rotate(${r})`} opacity={0.9} />
              ))}
              <circle r={5} fill={C.yellow} />
            </g>
            <rect x={z.x - 52} y={z.y + 22} width="104" height="28" rx="14" fill={on ? C.green : "#fff"} stroke={C.green} strokeWidth="1.5" />
            <text x={z.x} y={z.y + 41} textAnchor="middle" fontSize="15" fontWeight="700" fill={on ? "#fff" : C.green}>
              {z.name}
            </text>
            {on && (
              <g>
                <circle cx={z.x + 34} cy={z.y - 34} r="17" fill={C.pinkText} />
                <text x={z.x + 34} y={z.y - 28} textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">
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

function Segments<T extends string>({ legend, name, options, value, onChange }: { legend: string; name: string; options: readonly { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold" style={{ color: C.green }}>
        {legend}
      </legend>
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {options.map((o) => (
          <label
            key={o.id}
            className="flex h-11 cursor-pointer items-center justify-center rounded-[6px] border-2 px-2 text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
            style={value === o.id ? { background: C.green, borderColor: C.green, color: "#fff" } : { background: C.paper, borderColor: C.line, color: C.ink }}
          >
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CoursePage() {
  const [who, setWho] = useState<WhoId>("kids");
  const [when, setWhen] = useState<WhenId>("weekend-day");
  const course = makeCourse(when, who);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid gap-4 rounded-[10px] p-4 md:grid-cols-2 md:gap-6 md:p-6" style={{ background: C.pinkSoft }}>
        <Segments legend="누구와" name="course-who" options={WHO} value={who} onChange={setWho} />
        <Segments legend="언제" name="course-when" options={WHEN} value={when} onChange={setWhen} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <GardenMap course={course.zones} />
        </div>
        <div aria-live="polite">
          <p className="text-[17px] font-bold" style={{ color: C.green }}>
            소요시간 {course.hours}
          </p>
          <ol className="mt-3 space-y-3">
            {course.zones.map((id, i) => {
              const z = ZONE_BY_ID[id];
              return (
                <li key={id} className="flex gap-3 rounded-[10px] border p-4" style={{ borderColor: C.line, background: C.paper }}>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[16px] font-bold text-white" style={{ background: C.pinkText }}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[17px] font-bold">{z.name}</p>
                    <p className="mt-0.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                      {z.what}
                    </p>
                    <dl className="mt-2 grid grid-cols-[96px_1fr] gap-x-2 gap-y-0.5 text-[14px]">
                      <dt style={{ color: C.muted }}>추천 관람 시간</dt>
                      <dd className="font-semibold">{z.best}</dd>
                      <dt style={{ color: C.muted }}>포토존</dt>
                      <dd className="font-semibold">{z.spot}</dd>
                      <dt style={{ color: C.muted }}>소요시간</dt>
                      <dd className="font-semibold">{z.walk}</dd>
                    </dl>
                  </div>
                </li>
              );
            })}
          </ol>
          <ul className="mt-4 space-y-1.5 text-[15px] leading-[1.6]">
            {course.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span aria-hidden style={{ color: C.pinkText }}>
                  ※
                </span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── 개화 현황 ─────────────────────────────────────────── */

function BloomPage() {
  const [week, setWeek] = useState(1);
  return (
    <div className="mx-auto max-w-[900px]">
      <div role="tablist" aria-label="주 선택" className="grid grid-cols-3 gap-1.5" onKeyDown={(e) => onTabKeys(e, BLOOM_WEEKS.length, week, setWeek, "bloom-tab")}>
        {BLOOM_WEEKS.map((w, i) => (
          <button
            key={w.label}
            id={`bloom-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={week === i}
            aria-controls="bloom-panel"
            tabIndex={week === i ? 0 : -1}
            onClick={() => setWeek(i)}
            className="flex min-h-[56px] flex-col items-center justify-center rounded-[6px] border-2 px-2 text-[15px] font-semibold"
            style={week === i ? { background: C.green, borderColor: C.green, color: "#fff" } : { background: C.paper, borderColor: C.line, color: C.ink }}
          >
            {w.label}
            <span className="text-[13px] font-normal tabular-nums opacity-80">{w.date}</span>
          </button>
        ))}
      </div>

      <table id="bloom-panel" role="tabpanel" aria-labelledby={`bloom-tab-${week}`} className="mt-6 w-full border-t-2 text-[16px]" style={{ borderColor: C.green }}>
        <caption className="sr-only">{BLOOM_WEEKS[week].label} 꽃별 개화 현황</caption>
        <thead>
          <tr className="border-b text-[14px]" style={{ borderColor: C.line, background: C.greenSoft }}>
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              꽃
            </th>
            <th scope="col" className="hidden px-3 py-2 text-left font-semibold sm:table-cell">
              개화 정도
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {BLOOMS.map((b) => {
            const stage = b.stages[week];
            return (
              <tr key={b.name} className="border-b" style={{ borderColor: C.line }}>
                <th scope="row" className="px-3 py-3 text-left">
                  <span className="block text-[18px] font-bold">{b.name}</span>
                  <span className="block text-[14px] font-normal" style={{ color: C.muted }}>
                    {b.where}
                  </span>
                  <span className="mt-1 flex items-center gap-0.5 sm:hidden" aria-hidden>
                    <Blooms color={b.color} stage={stage} size={28} />
                  </span>
                </th>
                <td className="hidden px-3 py-3 sm:table-cell" aria-hidden>
                  <span className="flex items-center gap-1">
                    <Blooms color={b.color} stage={stage} size={38} />
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-[16px] font-bold" style={{ color: stage === 3 ? C.pinkText : C.green }}>
                  {STAGE[stage]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
        ※ 개막 전에는 지난해 개화 기록과 올해 기온을 바탕으로 한 예상이며, 개막 후에는 매일 09:00에 갱신합니다.
      </p>
    </div>
  );
}

function Blooms({ color, stage, size }: { color: string; stage: number; size: number }) {
  const fading = stage === 4;
  return (
    <>
      {[0, 1, 2, 3].map((n) => {
        const open = fading ? (n < 3 ? 0.85 : 0.3) : n < stage ? 1 : n === stage ? 0.35 : 0;
        return (
          <span key={n} style={{ opacity: fading && n >= 2 ? 0.45 : 1 }}>
            <Flower size={size} color={color} open={open} />
          </span>
        );
      })}
    </>
  );
}

/* ─── 일정 안내 ─────────────────────────────────────────── */

const KIND_STYLE: Record<ProgramKind, { bg: string; fg: string }> = {
  공연: { bg: C.pinkSoft, fg: C.pinkText },
  체험: { bg: C.yellowSoft, fg: "#7a5a00" },
  야간: { bg: "#e3e4f4", fg: "#3a3f7a" },
};

function ProgramPage({ today }: { today: number }) {
  const running = today >= START_DAY && today < START_DAY + DAYS;
  const [day, setDay] = useState<number | null>(null);
  const [kind, setKind] = useState<ProgramKind | "전체">("전체");

  const current = day ?? (running ? today - START_DAY : 0);
  const info = festDate(current);
  const list = programsFor(current).filter((p) => kind === "전체" || p.kind === kind);

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        <div role="tablist" aria-label="날짜 선택" className="flex gap-1.5" onKeyDown={(e) => onTabKeys(e, DAYS, current, setDay, "prog-day")}>
          {Array.from({ length: DAYS }, (_, i) => {
            const f = festDate(i);
            const on = current === i;
            const isToday = running && today - START_DAY === i;
            return (
              <button
                key={i}
                id={`prog-day-${i}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="prog-panel"
                tabIndex={on ? 0 : -1}
                aria-label={`${f.m}월 ${f.d}일 ${WEEKDAY[f.dow]}요일${f.night ? ", 야간 개장일" : ""}${isToday ? ", 오늘" : ""}`}
                onClick={() => setDay(i)}
                className="relative flex h-[64px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[6px] border-2"
                style={on ? { background: C.green, borderColor: C.green, color: "#fff" } : { background: C.paper, borderColor: C.line, color: C.ink }}
              >
                <span className="text-[13px] tabular-nums" style={{ color: on ? "#fff" : f.dow === 0 ? C.pinkText : f.dow === 6 ? "#3a5fb0" : C.muted }}>
                  {f.m}/{f.d}
                </span>
                <span className="text-[16px] font-bold">{WEEKDAY[f.dow]}</span>
                {isToday && (
                  <span className="absolute -top-2 rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: C.pinkText }}>
                    오늘
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[17px] font-bold" style={{ color: C.green }}>
          {info.m}월 {info.d}일 ({WEEKDAY[info.dow]})
          {info.night && (
            <span className="ml-2 text-[15px] font-semibold" style={{ color: "#3a3f7a" }}>
              야간 개장일
            </span>
          )}
        </p>
        <div className="flex gap-1.5" role="group" aria-label="구분">
          {(["전체", "공연", "체험", "야간"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className="h-9 rounded-[6px] border px-3 text-[15px] font-semibold"
              style={kind === k ? { background: C.ink, borderColor: C.ink, color: "#fff" } : { background: C.paper, borderColor: C.line, color: C.ink }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <table id="prog-panel" role="tabpanel" aria-labelledby={`prog-day-${current}`} className="mt-4 w-full border-t-2 text-[15px] md:text-[16px]" style={{ borderColor: C.green }}>
        <caption className="sr-only">
          {info.m}월 {info.d}일 프로그램 일정
        </caption>
        <thead>
          <tr className="border-b text-[14px]" style={{ borderColor: C.line, background: C.greenSoft }}>
            <th scope="col" className="w-[68px] px-2 py-2 text-left font-semibold md:w-[90px] md:px-3">
              시간
            </th>
            <th scope="col" className="px-2 py-2 text-left font-semibold md:px-3">
              프로그램명
            </th>
            <th scope="col" className="hidden px-3 py-2 text-left font-semibold sm:table-cell">
              장소
            </th>
            <th scope="col" className="w-[64px] px-2 py-2 text-center font-semibold md:px-3">
              구분
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={`${current}-${p.time}-${p.title}`} className="border-b" style={{ borderColor: C.line }}>
              <td className="px-2 py-3 align-top font-bold tabular-nums md:px-3" style={{ color: C.green }}>
                {p.time}
              </td>
              <td className="px-2 py-3 align-top font-semibold md:px-3">
                {p.title}
                <span className="block text-[14px] font-normal sm:hidden" style={{ color: C.muted }}>
                  {p.place}
                </span>
              </td>
              <td className="hidden px-3 py-3 align-top sm:table-cell" style={{ color: C.muted }}>
                {p.place}
              </td>
              <td className="px-2 py-3 text-center align-top md:px-3">
                <span className="inline-block rounded-[4px] px-2 py-0.5 text-[13px] font-bold" style={{ background: KIND_STYLE[p.kind].bg, color: KIND_STYLE[p.kind].fg }}>
                  {p.kind}
                </span>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center" style={{ color: C.muted }}>
                해당 일자에 {kind} 프로그램이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
        ※ 우천 시 야외 공연은 실내 전시관 2층으로 옮겨 진행합니다. 체험 프로그램은 현장 선착순 접수입니다.
      </p>
    </div>
  );
}

/* ─── 소식·자료 ─────────────────────────────────────────── */

function NoticePage({ openIndex, setOpenIndex }: { openIndex: number | null; setOpenIndex: (i: number | null) => void }) {
  if (openIndex !== null) {
    const n = NOTICES[openIndex];
    return (
      <article className="mx-auto max-w-[900px]">
        <header className="border-y-2 py-4" style={{ borderColor: C.green }}>
          <h2 className="text-[20px] font-bold leading-[1.45] md:text-[22px]">{n.title}</h2>
          <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
            작성자 조직위원회 · 등록일 {n.date}
          </p>
        </header>
        <p className="min-h-[160px] border-b py-6 text-[16px] leading-[1.8]" style={{ borderColor: C.line }}>
          {n.body}
        </p>
        <div className="mt-5 flex justify-center">
          <button type="button" onClick={() => setOpenIndex(null)} className="h-11 rounded-[6px] px-8 text-[15px] font-bold text-white" style={{ background: C.green }}>
            목록
          </button>
        </div>
      </article>
    );
  }
  return (
    <div className="mx-auto max-w-[900px]">
      <p className="mb-2 text-[15px]" style={{ color: C.muted }}>
        전체 <strong style={{ color: C.ink }}>{NOTICES.length}</strong>건
      </p>
      <table className="w-full border-t-2 text-[15px] md:text-[16px]" style={{ borderColor: C.green }}>
        <caption className="sr-only">공지사항 목록</caption>
        <thead>
          <tr className="border-b text-[14px]" style={{ borderColor: C.line, background: C.greenSoft }}>
            <th scope="col" className="hidden w-[64px] py-2 text-center font-semibold sm:table-cell">
              번호
            </th>
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              제목
            </th>
            <th scope="col" className="w-[104px] px-2 py-2 text-center font-semibold">
              등록일
            </th>
          </tr>
        </thead>
        <tbody>
          {NOTICES.map((n, i) => (
            <tr key={n.title} className="border-b" style={{ borderColor: C.line }}>
              <td className="hidden py-3 text-center tabular-nums sm:table-cell" style={{ color: C.muted }}>
                {NOTICES.length - i}
              </td>
              <td className="px-3 py-3">
                <button type="button" onClick={() => setOpenIndex(i)} className="text-left hover:underline">
                  {n.title}
                  {n.isNew && (
                    <span className="ml-1.5 inline-flex h-[18px] items-center rounded-[2px] px-1 align-[2px] text-[11px] font-bold text-white" style={{ background: C.pinkText }}>
                      새글
                    </span>
                  )}
                </button>
              </td>
              <td className="px-2 py-3 text-center text-[14px] tabular-nums" style={{ color: C.muted }}>
                {n.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GalleryPage() {
  return (
    <ul className="mx-auto grid max-w-[1000px] gap-4 sm:grid-cols-2">
      {PHOTOS.map((p) => (
        <li key={p.src}>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 500px, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-[16px] font-semibold">{p.caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

/* ─── 바닥글 ─────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{ background: C.green, color: "#e4efe6" }}>
      <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
        <Container className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-5 text-[15px] font-semibold">
          <span>□□시</span>
          <span>○○꽃박람회 조직위원회</span>
          <span>□□시 관광공사</span>
          <span>△△농업기술센터</span>
        </Container>
      </div>
      <Container className="pb-28 pt-8 text-[14px] leading-[1.8]">
        <p className="text-[18px] font-bold tracking-[-0.02em] text-white">{EXPO}</p>
        <p className="mt-2">주최 □□시 | 주관 ○○꽃박람회 조직위원회</p>
        <p>□□시 □□로 200 ○○호수공원 관리사무소 2층</p>
        <p>관람 문의 {TEL} (09:00 ~ 18:00)</p>
      </Container>
    </footer>
  );
}

/* ─── 페이지 ─────────────────────────────────────────────── */

export function FlowerExpoDemo() {
  const today = useTodayNumber();
  const [page, setPage] = useState<Page>("home");
  const [noticeIndex, setNoticeIndex] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const go: Go = (p) => {
    setPage(p);
    setNoticeIndex(null);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0 });
      mainRef.current?.focus({ preventScroll: true });
    });
  };

  const openNotice = (i: number) => {
    go("notice");
    setNoticeIndex(i);
  };

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.cream, color: C.ink }}>
      <Header page={page} go={go} />
      <main ref={mainRef} tabIndex={-1} className="outline-none">
        {page === "home" ? (
          <Home go={go} openNotice={openNotice} />
        ) : (
          <SubFrame page={page} go={go}>
            {page === "overview" && <OverviewPage />}
            {page === "way" && <WayPage />}
            {page === "guide" && <GuidePage />}
            {page === "course" && <CoursePage />}
            {page === "bloom" && <BloomPage />}
            {page === "program" && <ProgramPage today={today} />}
            {page === "notice" && <NoticePage openIndex={noticeIndex} setOpenIndex={setNoticeIndex} />}
            {page === "gallery" && <GalleryPage />}
            {page === "faq" && (
              <div className="mx-auto max-w-[900px]">
                <FaqList />
              </div>
            )}
          </SubFrame>
        )}
      </main>
      <Footer />
    </div>
  );
}
