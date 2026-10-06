"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Menu, Moon, Phone, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 치과 홈페이지 데모: 가상의 ○○치과의원.
   병원명, 의료진, 주소, 전화번호, 사업자 정보, 진료비는 모두 가상이다.

   디자인: 흰 바탕에 짙은 청록 잉크(#10302f)와 청록 강조색(#0b6664), 옅은 민트(#e3f1ef).
   첫 화면은 아래 테두리를 웃는 입 모양으로 깎은 진료실 사진과 오늘 진료시간 카드이고,
   바로 아래가 치아 지도다. 위아래 치아 32개 그림을 크게 두고, 불편한 치아를 누르면
   오른쪽에 그 자리의 증상, 필요한 진료, 건강보험 적용, 예상 비용이 나오고 바로 예약 신청으로 이어진다.
   누른 치아에서 같은 종류 치아로 색이 퍼져 나가 어느 치아를 말하는지 보여 준다.
   진료시간은 따로 짙은 표를 두지 않고 예약 신청 옆에 붙였다.

   사진 출처(public/images/demo-dental):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, doctor1, doctor2, ortho, lobby, implant
   Unsplash 무료 라이선스 whitening Ozkan Guner(7Mut2WMWttA),
   caries Katarzyna Zygnerska(rubu_NvklJE), scaling Quilia(y8fWicGsv4g), ct Quang Tri NGUYEN(VckdJzo7ig0) */

const IMG = "/images/demo-dental";
const CLINIC = "○○치과의원";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 45 □□타워 3층";

const C = {
  paper: "#ffffff",
  mist: "#f3f8f7",
  mint: "#e3f1ef",
  ink: "#10302f",
  muted: "#4f6261",
  accent: "#0b6664",
  line: "#d9e5e3",
  tooth: "#ffffff",
  toothLine: "#b9cfcc",
  gum: "#f2d9d6",
  onInk: "#eef6f5",
  onInkMuted: "#a9c3c0",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "map", label: "증상별 안내" },
  { id: "treatments", label: "진료 안내" },
  { id: "doctors", label: "의료진" },
  { id: "fees", label: "비급여 안내" },
  { id: "reserve", label: "진료시간·예약" },
]

type TreatmentId = "implant" | "ortho" | "caries" | "endo" | "scaling" | "whitening" | "wisdom" | "check";

const TREATMENT_NAME: Record<TreatmentId, string> = {
  implant: "임플란트",
  ortho: "치아 교정",
  caries: "충치 치료",
  endo: "신경치료",
  scaling: "스케일링·잇몸 치료",
  whitening: "치아 미백",
  wisdom: "사랑니 발치",
  check: "일반 검진",
};

/* ---------- 치아 지도 데이터 ---------- */

type Kind = "front" | "premolar" | "molar" | "wisdom";
type Selection = number | "gum";

interface Symptom {
  text: string;
  treatment: TreatmentId;
  body: string;
  visits: string;
  insurance: string;
  cost: string;
  /** 빠진 이: 그림에서 고른 치아를 점선으로 비운다 */
  missing?: boolean;
}

const MISSING: Symptom = {
  text: "빠지고 비어 있어요",
  treatment: "implant",
  body: "빈자리가 오래되면 옆 치아가 기울고 잇몸뼈가 줄어듭니다. CT로 뼈 양을 확인하고 임플란트, 브리지, 틀니 중 맞는 방법을 정합니다.",
  visits: "3~6개월, 5~7회",
  insurance: "만 65세 이상 평생 2개까지 적용",
  cost: "임플란트 1개 110만 원, 건강보험 적용 시 본인부담 40만 원 안팎",
  missing: true,
};

const MOLAR_SYMPTOMS: Symptom[] = [
  {
    text: "씹을 때 아파요",
    treatment: "endo",
    body: "충치가 신경 가까이 진행했거나 금이 간 경우가 많습니다. 엑스레이로 깊이를 확인한 뒤 신경치료 여부를 정합니다.",
    visits: "3~4회",
    insurance: "신경치료는 적용, 크라운은 비급여",
    cost: "신경치료 3만~5만 원, 지르코니아 크라운 50만 원",
  },
  {
    text: "찬물에 시려요",
    treatment: "caries",
    body: "충치 초기이거나 잇몸이 내려가 뿌리가 드러난 경우입니다. 충치면 메우고, 시린 이는 약제를 바르거나 홈을 막습니다.",
    visits: "1~2회",
    insurance: "대부분 적용",
    cost: "1만~3만 원",
  },
  {
    text: "까맣게 보여요",
    treatment: "caries",
    body: "겉에서 보이는 크기보다 안쪽으로 넓게 퍼진 충치일 수 있습니다. 크기에 따라 레진이나 인레이로 치료합니다.",
    visits: "1~2회",
    insurance: "레진, 인레이는 비급여 (만 12세 이하 영구치 레진은 적용)",
    cost: "레진 10만 원, 금 인레이 40만 원",
  },
  MISSING,
];

const SYMPTOMS: Record<Kind | "gum", Symptom[]> = {
  front: [
    {
      text: "누렇게 변했어요",
      treatment: "whitening",
      body: "커피, 차, 흡연으로 생긴 착색은 전문가 미백으로 밝게 할 수 있습니다. 시술 전 충치와 잇몸 상태를 먼저 봅니다.",
      visits: "1~3회",
      insurance: "비급여",
      cost: "전문가 미백 1회 20만 원",
    },
    {
      text: "고르지 않아요",
      treatment: "ortho",
      body: "덧니, 벌어진 앞니, 돌출 입은 교정으로 바로잡습니다. 정밀 검사 후 투명교정과 장치 교정 중에서 고르실 수 있습니다.",
      visits: "1년 6개월 안팎, 4~6주마다",
      insurance: "비급여",
      cost: "투명교정 480만 원, 장치 교정 350만 원",
    },
    {
      text: "조금 깨졌어요",
      treatment: "caries",
      body: "작게 깨진 부분은 치아 색 레진으로 당일 복구합니다. 많이 깨졌다면 신경 상태를 확인한 뒤 크라운을 씌웁니다.",
      visits: "1회",
      insurance: "비급여",
      cost: "레진 10만 원",
    },
    MISSING,
  ],
  premolar: MOLAR_SYMPTOMS,
  molar: MOLAR_SYMPTOMS,
  wisdom: [
    {
      text: "나면서 붓고 아파요",
      treatment: "wisdom",
      body: "사랑니 주변 잇몸에 염증이 생긴 상태입니다. 염증을 가라앉힌 뒤 파노라마 사진을 보고 발치 여부를 정합니다.",
      visits: "1~2회, 실밥 제거 1회",
      insurance: "적용",
      cost: "2만~5만 원",
    },
    {
      text: "옆으로 누워 났어요",
      treatment: "wisdom",
      body: "누운 사랑니는 앞 어금니에 충치를 만들기 쉽습니다. CT로 신경과의 거리를 확인하고 안전하게 뽑습니다.",
      visits: "1회, 실밥 제거 1회",
      insurance: "발치는 적용, CT는 비급여",
      cost: "3만~6만 원, CT 8만 원",
    },
  ],
  gum: [
    {
      text: "양치할 때 피가 나요",
      treatment: "scaling",
      body: "치석 때문에 잇몸에 염증이 생긴 경우가 대부분입니다. 스케일링으로 치석을 없애면 대개 좋아집니다.",
      visits: "1회",
      insurance: "만 19세 이상 1년에 한 번 적용",
      cost: "1만 5천 원 안팎",
    },
    {
      text: "붓고 내려앉았어요",
      treatment: "scaling",
      body: "잇몸 속 깊은 곳까지 치석이 쌓인 치주염일 수 있습니다. 잇몸 아래 치석 제거와 소독을 나눠서 진행합니다.",
      visits: "2~4회",
      insurance: "적용",
      cost: "회당 1만~3만 원",
    },
  ],
};

const kindOf = (fdi: number): Kind => {
  const d = fdi % 10;
  if (d <= 3) return "front";
  if (d <= 5) return "premolar";
  if (d <= 7) return "molar";
  return "wisdom";
};

const QUADRANT_NAME: Record<number, string> = { 1: "위 오른쪽", 2: "위 왼쪽", 3: "아래 왼쪽", 4: "아래 오른쪽" };
const TOOTH_NAME: Record<number, string> = {
  1: "가운데 앞니",
  2: "옆 앞니",
  3: "송곳니",
  4: "첫째 작은어금니",
  5: "둘째 작은어금니",
  6: "첫째 큰어금니",
  7: "둘째 큰어금니",
  8: "사랑니",
};
const toothLabel = (fdi: number) => `${QUADRANT_NAME[Math.floor(fdi / 10)]} ${TOOTH_NAME[fdi % 10]}`;

const QUICK: { label: string; select: Selection }[] = [
  { label: "앞니", select: 11 },
  { label: "어금니", select: 36 },
  { label: "사랑니", select: 38 },
  { label: "잇몸", select: "gum" },
];

/* ---------- 치아 배열 ---------- */

interface Tooth {
  fdi: number;
  upper: boolean;
  /** 배열 안 왼쪽부터의 순서(0~15), 퍼져 나가는 순서를 계산할 때 쓴다 */
  col: number;
  x: number;
  y: number;
  angle: number;
  w: number;
  h: number;
}

const TOOTH_SIZE: Record<number, [number, number]> = {
  1: [17, 22],
  2: [15, 20],
  3: [16, 22],
  4: [18, 19],
  5: [18, 19],
  6: [24, 22],
  7: [23, 21],
  8: [21, 19],
};

function buildArch(): Tooth[] {
  const teeth: Tooth[] = [];
  const cx = 180;
  // 서버와 브라우저의 소수점 차이로 하이드레이션이 어긋나지 않게 반올림한다
  const r = (n: number) => Math.round(n * 100) / 100;
  for (const upper of [true, false]) {
    const cy = upper ? 168 : 206;
    for (let i = 0; i < 16; i++) {
      const theta = (Math.PI * (i + 0.5)) / 16;
      const x = cx - Math.cos(theta) * 116;
      const y = upper ? cy - Math.sin(theta) * 140 : cy + Math.sin(theta) * 132;
      const digit = i < 8 ? 8 - i : i - 7;
      const quadrant = upper ? (i < 8 ? 1 : 2) : i < 8 ? 4 : 3;
      const [w, h] = TOOTH_SIZE[digit];
      const angle = ((theta * 180) / Math.PI - 90) * (upper ? 1 : -1);
      teeth.push({ fdi: quadrant * 10 + digit, upper, col: i, x: r(x), y: r(y), angle: r(angle), w, h });
    }
  }
  return teeth;
}

const ARCH = buildArch();

/* ---------- 진료 안내 ---------- */

const TREATMENTS: { id: TreatmentId; img: string; title: string; body: string; pos?: string }[] = [
  { id: "implant", img: "implant", title: "임플란트", body: "CT로 잇몸뼈 높이와 신경 위치를 확인한 뒤 심습니다. 만 65세 이상은 2개까지 건강보험이 적용됩니다.", pos: "50% 25%" },
  { id: "ortho", img: "ortho", title: "치아 교정", body: "투명교정과 장치 교정을 함께 진료합니다. 교정과 전문의가 진단부터 마무리까지 맡습니다." },
  { id: "caries", img: "caries", title: "충치·신경치료", body: "충치 크기에 맞춰 레진, 인레이, 크라운으로 치료하고 필요한 경우 신경치료를 합니다." },
  { id: "scaling", img: "scaling", title: "스케일링·잇몸 치료", body: "치석 제거와 잇몸 염증 치료를 합니다. 스케일링은 만 19세 이상 1년에 한 번 건강보험이 적용됩니다." },
  { id: "whitening", img: "whitening", title: "치아 미백", body: "착색 정도를 사진으로 기록하고 전문가 미백과 자가 미백을 함께 진행합니다." },
  { id: "check", img: "ct", title: "정밀 검진", body: "파노라마 엑스레이와 CT로 눈에 보이지 않는 충치, 잇몸뼈 상태, 사랑니 위치를 확인합니다." },
];

const DOCTORS = [
  {
    name: "김○○",
    role: "대표원장",
    field: "임플란트, 보철, 신경치료",
    career: ["통합치의학과 전문의", "△△대학교 치과대학 졸업", "대한구강악안면임플란트학회 정회원"],
    img: "doctor2",
    pos: "50% 25%",
  },
  {
    name: "이○○",
    role: "원장",
    field: "치아 교정",
    career: ["치과교정과 전문의", "△△대학교치과병원 교정과 수련", "대한치과교정학회 인정의"],
    img: "doctor1",
    pos: "50% 20%",
  },
];

/* ---------- 진료시간 ---------- */

// 0=일요일 ~ 6=토요일, 분 단위 [시작, 끝]
const HOURS = [
  { label: "월요일", day: 1, time: "09:30 ~ 18:30", open: [570, 1110] },
  { label: "화요일", day: 2, time: "09:30 ~ 21:00", open: [570, 1260], night: true },
  { label: "수요일", day: 3, time: "09:30 ~ 18:30", open: [570, 1110] },
  { label: "목요일", day: 4, time: "09:30 ~ 21:00", open: [570, 1260], night: true },
  { label: "금요일", day: 5, time: "09:30 ~ 18:30", open: [570, 1110] },
  { label: "토요일", day: 6, time: "09:30 ~ 14:00", open: [570, 840] },
  { label: "일요일·공휴일", day: 0, time: "휴진", open: null },
] as const;
const LUNCH = [780, 840]; // 평일 13:00 ~ 14:00

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function openStatus(now: Date | null) {
  if (!now) return null;
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const row = HOURS.find((h) => h.day === day);
  if (!row || !row.open) return { text: "오늘은 휴진입니다", open: false };
  const [start, end] = row.open;
  if (minutes < start) return { text: "진료 시작 전입니다", open: false };
  if (minutes >= end) return { text: "오늘 진료가 끝났습니다", open: false };
  if (day >= 1 && day <= 5 && minutes >= LUNCH[0] && minutes < LUNCH[1]) return { text: "점심시간입니다", open: false };
  return { text: `지금 진료 중입니다 (${row.time.split(" ~ ")[1]}까지)`, open: true };
}

/* ---------- 비급여 ---------- */

const FEES = [
  { item: "임플란트 (국산, 지르코니아 보철 포함)", unit: "1개", price: 1100000, note: "뼈이식 별도" },
  { item: "뼈이식", unit: "1부위", price: 300000, note: "" },
  { item: "지르코니아 크라운", unit: "1개", price: 500000, note: "" },
  { item: "레진 충전", unit: "1개", price: 100000, note: "1면 기준" },
  { item: "금 인레이", unit: "1개", price: 400000, note: "금 시세에 따라 변동" },
  { item: "전문가 미백", unit: "1회", price: 200000, note: "자가 미백 키트 포함 시 30만 원" },
  { item: "투명교정", unit: "전체", price: 4800000, note: "정밀 검사비 별도" },
  { item: "메탈 장치 교정", unit: "전체", price: 3500000, note: "정밀 검사비 별도" },
  { item: "교정 정밀 검사", unit: "1회", price: 200000, note: "" },
  { item: "치과 CT 촬영", unit: "1회", price: 80000, note: "" },
  { item: "진단서", unit: "1통", price: 20000, note: "" },
];

const INSURANCE = [
  { title: "스케일링", target: "만 19세 이상", body: "1년에 한 번 (매년 1월 1일에 새로 시작)" },
  { title: "임플란트", target: "만 65세 이상", body: "평생 2개, 본인부담 30%" },
  { title: "틀니", target: "만 65세 이상", body: "7년에 한 번, 본인부담 30%" },
  { title: "어금니 홈메우기", target: "만 18세 이하", body: "충치가 없는 큰 어금니, 본인부담 10%" },
  { title: "레진 충전", target: "만 12세 이하", body: "충치가 생긴 영구치" },
];

/* ---------- 예약 ---------- */

const RESERVE_ITEMS: TreatmentId[] = ["check", "caries", "endo", "scaling", "implant", "ortho", "whitening", "wisdom"];
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function slotsFor(date: Date) {
  const row = HOURS.find((h) => h.day === date.getDay());
  if (!row || !row.open) return [];
  const [start, end] = row.open;
  const list: { label: string; taken: boolean }[] = [];
  for (let m = start; m <= end - 30; m += 30) {
    if (date.getDay() >= 1 && date.getDay() <= 5 && m >= LUNCH[0] && m < LUNCH[1]) continue;
    // 날짜와 시간으로 정해지는 가짜 예약 현황
    const seed = (date.getDate() * 31 + m * 7) % 11;
    list.push({ label: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, taken: seed < 4 });
  }
  return list;
}

/** 병원식 이름 가리기: 김하늘 → 김ㅎ늘, 2글자는 김* */
function maskName(name: string) {
  const n = name.trim();
  if (n.length <= 1) return n;
  if (n.length === 2) return `${n[0]}*`;
  const mid = n.charCodeAt(1) - 0xac00;
  const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  const masked = mid >= 0 && mid <= 11171 ? CHO[Math.floor(mid / 588)] : "*";
  return n[0] + masked + n.slice(2);
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const heading = "text-[28px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[40px]";

export function DentalHomepageDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const now = useNow();
  const status = openStatus(now);
  const [reserveTreatment, setReserveTreatment] = useState<TreatmentId>("check");

  const goReserve = (id: TreatmentId) => {
    setReserveTreatment(id);
    document.getElementById("reserve")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen text-[17px] leading-[1.5]" style={{ backgroundColor: C.paper, color: C.ink }}>
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: C.line, backgroundColor: "rgba(255,255,255,0.94)" }}>
        <div className={`${container} flex h-16 items-center justify-between gap-4`}>
          <a href="#top" className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.03em]">
            <ToothMark />
            {CLINIC}
          </a>
          <nav className="hidden xl:block" aria-label="주 메뉴">
            <ul className="flex gap-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className="inline-flex h-10 items-center px-3 text-[16px] transition-colors hover:text-[#0b6664]" style={{ color: C.muted }}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${TEL}`}
              aria-label={`전화 ${TEL}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border transition-colors hover:bg-[#f3f8f7] sm:w-auto sm:gap-1.5 sm:px-3"
              style={{ borderColor: C.line }}
            >
              <Phone size={16} aria-hidden />
              <span className="hidden text-[15px] font-bold tabular-nums sm:inline">{TEL}</span>
            </a>
            <a
              href="#reserve"
              className="inline-flex h-10 items-center rounded-[6px] px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: C.accent }}
            >
              예약 신청
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border xl:hidden"
              style={{ borderColor: C.line }}
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-menu" className="border-t xl:hidden" style={{ borderColor: C.line, backgroundColor: C.paper }} aria-label="모바일 메뉴">
            <ul className={`${container} py-2`}>
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex h-12 items-center justify-between border-b text-[17px] last:border-b-0"
                    style={{ borderColor: C.line }}
                  >
                    {n.label}
                    <ChevronRight size={18} style={{ color: C.muted }} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="top">
        <Hero now={now} status={status} />
        <ToothMap onReserve={goReserve} />

        {/* 진료 안내 */}
        <section id="treatments" className="scroll-mt-16">
          <div className={`${container} py-16 md:py-24`}>
            <h2 className={heading}>진료 안내</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TREATMENTS.map((t) => (
                <li key={t.title} className="group flex flex-col overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
                  <div className="overflow-hidden" style={{ backgroundColor: C.mint }}>
                    <Image
                      src={`${IMG}/${t.img}.jpg`}
                      alt=""
                      width={900}
                      height={600}
                      sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
                      className="aspect-[3/2] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      style={{ objectPosition: t.pos ?? "50% 50%" }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[22px] font-bold tracking-[-0.03em]">{t.title}</h3>
                    <p className="mt-2 flex-1" style={{ color: C.muted }}>
                      {t.body}
                    </p>
                    <button
                      type="button"
                      onClick={() => goReserve(t.id)}
                      className="mt-4 inline-flex items-center gap-0.5 self-start text-[16px] font-bold"
                      style={{ color: C.accent }}
                    >
                      {t.title} 예약
                      <ChevronRight size={17} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 의료진 */}
        <section id="doctors" className="scroll-mt-16" style={{ backgroundColor: C.mist }}>
          <div className={`${container} py-16 md:py-24`}>
            <h2 className={heading}>의료진</h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-2">
              {DOCTORS.map((d) => (
                <li key={d.name} className="grid grid-cols-[120px_1fr] gap-5 sm:grid-cols-[180px_1fr] sm:gap-7">
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-[10px]" style={{ backgroundColor: C.mint }} aria-hidden>
                    <Image src={`${IMG}/${d.img}.jpg`} alt="" fill sizes="180px" className="object-cover" style={{ objectPosition: d.pos }} />
                  </span>
                  <div className="min-w-0 self-center">
                    <p className="text-[15px] font-bold" style={{ color: C.accent }}>
                      {d.role}
                    </p>
                    <h3 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">{d.name}</h3>
                    <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                      진료 분야 {d.field}
                    </p>
                    <ul className="mt-4 space-y-1 border-t pt-4" style={{ borderColor: C.line }}>
                      {d.career.map((c) => (
                        <li key={c} style={{ color: C.muted }}>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 비급여 진료비와 건강보험 */}
        <section id="fees" className="scroll-mt-16">
          <div className={`${container} grid gap-12 py-16 md:py-24 lg:grid-cols-12`}>
            <div className="min-w-0 lg:col-span-7">
              <h2 className={heading}>비급여 진료비 안내</h2>
              <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                부가세 포함, 2026년 10월 1일 기준
              </p>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-t-2 text-left" style={{ borderColor: C.ink }}>
                  <caption className="sr-only">비급여 진료비</caption>
                  <thead>
                    <tr className="border-b text-[15px]" style={{ borderColor: C.line, color: C.muted }}>
                      <th scope="col" className="py-3 pr-3 font-normal">항목</th>
                      <th scope="col" className="py-3 pr-3 font-normal">단위</th>
                      <th scope="col" className="py-3 pr-3 text-right font-normal">금액</th>
                      <th scope="col" className="hidden py-3 font-normal sm:table-cell">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEES.map((f) => (
                      <tr key={f.item} className="border-b" style={{ borderColor: C.line }}>
                        <th scope="row" className="py-3 pr-3 font-normal">
                          {f.item}
                          {f.note && (
                            <span className="mt-0.5 block text-[15px] sm:hidden" style={{ color: C.muted }}>
                              {f.note}
                            </span>
                          )}
                        </th>
                        <td className="whitespace-nowrap py-3 pr-3" style={{ color: C.muted }}>{f.unit}</td>
                        <td className="whitespace-nowrap py-3 pr-3 text-right font-bold tabular-nums">{won(f.price)}</td>
                        <td className="hidden py-3 text-[15px] sm:table-cell" style={{ color: C.muted }}>{f.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="lg:col-span-5">
              <h2 className={heading}>건강보험 적용</h2>
              <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                나이와 횟수 조건이 맞으면 아래 진료는 건강보험으로 받으실 수 있습니다.
              </p>
              <ul className="mt-6 border-t-2" style={{ borderColor: C.ink }}>
                {INSURANCE.map((i) => (
                  <li key={i.title} className="grid grid-cols-[1fr_auto] gap-x-4 border-b py-4" style={{ borderColor: C.line }}>
                    <b>{i.title}</b>
                    <span className="rounded-[4px] px-2 py-0.5 text-[15px] font-bold" style={{ backgroundColor: C.mint, color: C.accent }}>
                      {i.target}
                    </span>
                    <span className="col-span-2 mt-1" style={{ color: C.muted }}>
                      {i.body}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Reservation treatment={reserveTreatment} onTreatment={setReserveTreatment} />
      </main>

      <footer style={{ backgroundColor: C.ink, color: C.onInkMuted }}>
        <div className={`${container} py-10 pb-24`}>
          <p className="text-[20px] font-bold tracking-[-0.03em]" style={{ color: C.onInk }}>
            {CLINIC}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
            {[
              ["상호", CLINIC],
              ["대표자", "김○○"],
              ["주소", ADDRESS],
              ["전화", TEL],
              ["사업자등록번호", "000-00-00000"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt>{k}</dt>
                <dd style={{ color: C.onInk }}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[15px]">© {CLINIC}</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- 첫 화면: 치아 지도 ---------- */

/* ---------- 첫 화면 ---------- */

// 사진 아래 테두리를 웃는 입 모양 호로 깎았다. 처음 열릴 때 사진이 위에서 아래로 펼쳐지고
// 병원명 밑에 미소 곡선이 그어진 뒤 오늘 진료시간 카드가 올라온다.
function Hero({ now, status }: { now: Date | null; status: ReturnType<typeof openStatus> }) {
  const reduce = useReducedMotionSafe();
  const today = now ? HOURS.find((h) => h.day === now.getDay()) : null;
  const facts = [
    { label: "야간 진료", value: "화, 목 21:00까지" },
    { label: "토요일", value: "14:00까지 진료" },
    { label: "주차", value: "2시간 무료" },
  ];

  return (
    <section id="intro" className="overflow-hidden" style={{ backgroundColor: C.paper }}>
      <div className={`${container} grid items-center gap-10 pb-14 pt-10 md:pb-20 md:pt-14 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-5">
          <p className="text-[17px] font-bold" style={{ color: C.accent }}>
            통합치의학과, 치과교정과 전문의 진료
          </p>
          <h1 className="mt-3 text-[48px] font-bold leading-[1.1] tracking-[-0.055em] sm:text-[60px] lg:text-[72px]">
            ○○
            <br />
            <span className="relative inline-block">
              치과의원
              <svg viewBox="0 0 200 28" className="absolute -bottom-4 left-0 h-5 w-full overflow-visible" preserveAspectRatio="none" aria-hidden>
                <motion.path
                  d="M6 6 Q100 30 194 6"
                  fill="none"
                  stroke={C.accent}
                  strokeWidth={6}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                />
              </svg>
            </span>
          </h1>
          <p className="mt-9 max-w-[28rem] text-[19px]" style={{ color: C.muted }}>
            충치와 신경치료, 임플란트, 교정, 잇몸 치료를 봅니다. 평일 저녁에 오시기 어려우면 화요일과 목요일 야간 진료를 이용하세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#reserve"
              className="inline-flex h-12 items-center rounded-[6px] px-6 text-[17px] font-bold text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: C.accent }}
            >
              예약 신청
            </a>
            <a
              href="#map"
              className="inline-flex h-12 items-center gap-2 rounded-[6px] border bg-white px-5 text-[17px] font-bold transition-[transform,background-color] duration-150 hover:bg-[#f3f8f7] active:scale-[0.97]"
              style={{ borderColor: C.toothLine }}
            >
              <ToothMark />
              증상별 진료 안내
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-3 border-t" style={{ borderColor: C.line }}>
            {facts.map((f, i) => (
              <div key={f.label} className={`pt-4 ${i > 0 ? "border-l pl-4" : ""}`} style={{ borderColor: C.line }}>
                <dt className="text-[15px]" style={{ color: C.muted }}>
                  {f.label}
                </dt>
                <dd className="mt-0.5 text-[16px] font-bold sm:text-[17px]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-7">
          <motion.div
            className="relative aspect-[4/3] overflow-hidden lg:aspect-[6/5]"
            style={{ borderRadius: "24px 24px 50% 50% / 24px 24px 16% 16%", backgroundColor: C.mint }}
            initial={reduce ? false : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <Image src={`${IMG}/hero.jpg`} alt="" fill priority sizes="(min-width: 1024px) 700px, 100vw" className="object-cover object-[72%_50%]" />
          </motion.div>

          <motion.aside
            className="absolute bottom-3 left-3 w-[15rem] rounded-[10px] bg-white p-4 shadow-[0_12px_32px_rgba(16,48,47,0.16)] sm:bottom-8 sm:left-6 lg:-left-6 lg:bottom-12 lg:w-[17rem] lg:p-5"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6, ease: EASE }}
            aria-label="오늘 진료시간"
          >
            <p className="flex items-center justify-between gap-2 text-[15px]" style={{ color: C.muted }}>
              {today ? `오늘 ${today.label}` : "진료시간"}
              {today && "night" in today && (
                <span className="inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[13px] font-bold" style={{ backgroundColor: C.mint, color: C.accent }}>
                  <Moon size={13} aria-hidden />
                  야간 진료
                </span>
              )}
            </p>
            <p className="mt-1 text-[24px] font-bold tracking-[-0.02em] tabular-nums lg:text-[26px]">{today ? today.time : "09:30 ~ 18:30"}</p>
            {status && (
              <p className="mt-2 flex items-center gap-2 text-[15px] font-bold" style={{ color: status.open ? C.accent : C.muted }}>
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: status.open ? C.accent : C.toothLine }} aria-hidden />
                {status.text}
              </p>
            )}
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function ToothMap({ onReserve }: { onReserve: (id: TreatmentId) => void }) {
  const reduce = useReducedMotionSafe();
  const [selected, setSelected] = useState<Selection>(36);
  const [symptomIndex, setSymptomIndex] = useState(0);

  const list = selected === "gum" ? SYMPTOMS.gum : SYMPTOMS[kindOf(selected)];
  const symptom = list[symptomIndex] ?? list[0];
  const title = selected === "gum" ? "잇몸" : toothLabel(selected);

  const select = (next: Selection) => {
    setSelected(next);
    setSymptomIndex(0);
  };

  return (
    <section id="map" className="scroll-mt-16" style={{ backgroundColor: C.mist }}>
      <div className={`${container} grid gap-8 py-10 md:py-14 lg:grid-cols-12 lg:gap-12`}>
        <div className="lg:col-span-6">
          <h2 className="text-[32px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[44px]">어디가 불편하세요?</h2>
          <p className="mt-3 text-[19px]" style={{ color: C.muted }}>
            불편한 치아를 누르면 필요한 진료와 비용을 알려 드립니다.
          </p>

          <ArchMap selected={selected} missing={!!symptom.missing} onSelect={select} reduce={reduce} />

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="부위 바로 고르기">
            {QUICK.map((q) => {
              const on =
                q.select === "gum" ? selected === "gum" : selected !== "gum" && kindOf(selected) === kindOf(q.select as number);
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => select(q.select)}
                  aria-pressed={on}
                  className="inline-flex h-10 items-center rounded-[6px] border px-4 text-[16px] font-bold transition-colors"
                  style={{ borderColor: on ? C.ink : C.toothLine, backgroundColor: on ? C.ink : "#fff", color: on ? "#fff" : C.ink }}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 lg:pt-6">
          <div className="rounded-[12px] border bg-white p-5 md:p-8" style={{ borderColor: C.line }} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={String(selected)}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
              >
                <p className="text-[15px]" style={{ color: C.muted }}>
                  {selected === "gum" ? "잇몸 전체" : `치아 번호 ${selected}`}
                </p>
                <h3 className="mt-0.5 text-[28px] font-bold tracking-[-0.035em] md:text-[32px]">{title}</h3>

                <fieldset className="mt-5">
                  <legend className="text-[17px] font-bold">어떤 증상인가요?</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {list.map((s, i) => {
                      const on = i === symptomIndex;
                      return (
                        <button
                          key={s.text}
                          type="button"
                          onClick={() => setSymptomIndex(i)}
                          aria-pressed={on}
                          className="relative inline-flex h-11 items-center rounded-[6px] border px-4 text-[16px] transition-colors"
                          style={{ borderColor: on ? C.accent : C.line, color: on ? "#fff" : C.ink }}
                        >
                          {on && (
                            <motion.span
                              layoutId="symptom-chip"
                              className="absolute inset-[-1px] rounded-[6px]"
                              style={{ backgroundColor: C.accent }}
                              transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
                              aria-hidden
                            />
                          )}
                          <span className="relative">{s.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${String(selected)}-${symptomIndex}`}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2, ease: EASE, delay: reduce ? 0 : 0.04 }}
                className="mt-6 border-t pt-6"
                style={{ borderColor: C.line }}
              >
                <p className="text-[15px] font-bold" style={{ color: C.accent }}>
                  이런 진료가 필요할 수 있습니다
                </p>
                <p className="mt-1 text-[24px] font-bold tracking-[-0.03em]">{TREATMENT_NAME[symptom.treatment]}</p>
                <p className="mt-2" style={{ color: C.muted }}>
                  {symptom.body}
                </p>
                <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-[10px] p-4 sm:grid-cols-[auto_1fr]" style={{ backgroundColor: C.mist }}>
                  {[
                    ["치료 기간", symptom.visits],
                    ["건강보험", symptom.insurance],
                    ["예상 비용", symptom.cost],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-[15px] sm:pt-0.5" style={{ color: C.muted }}>
                        {k}
                      </dt>
                      <dd className="-mt-2 font-bold sm:mt-0">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button
                    type="button"
                    onClick={() => onReserve(symptom.treatment)}
                    className="inline-flex h-12 items-center rounded-[6px] px-6 text-[17px] font-bold text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
                    style={{ backgroundColor: C.accent }}
                  >
                    {TREATMENT_NAME[symptom.treatment]} 예약 신청
                  </button>
                  <span className="text-[15px]" style={{ color: C.muted }}>
                    정확한 진단과 비용은 검진 후 알려 드립니다.
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 위아래 치아 32개. 누른 치아는 진하게, 같은 종류 치아는 누른 자리에서 퍼져 나가듯 옅게 칠한다 */
function ArchMap({
  selected,
  missing,
  onSelect,
  reduce,
}: {
  selected: Selection;
  missing: boolean;
  onSelect: (s: Selection) => void;
  reduce: boolean;
}) {
  const gum = selected === "gum";
  const sel = gum ? null : ARCH.find((t) => t.fdi === selected)!;
  const ease = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <figure className="mx-auto mt-4 max-w-[280px] sm:max-w-[360px] lg:max-w-[380px]">
      <svg viewBox="0 0 360 370" className="h-auto w-full touch-manipulation" role="group" aria-label="치아 배열 그림, 치아를 눌러 고르세요">
        {[true, false].map((upper) => (
          <path
            key={String(upper)}
            d={upper ? "M64 168 A116 140 0 0 1 296 168" : "M64 206 A116 132 0 0 0 296 206"}
            fill="none"
            stroke={gum ? "#e39a92" : C.gum}
            strokeWidth="36"
            strokeLinecap="round"
            className="cursor-pointer"
            onClick={() => onSelect("gum")}
            style={{ transition: reduce ? "none" : `stroke 320ms ${ease}` }}
          />
        ))}
        {ARCH.map((t) => {
          const isSel = sel?.fdi === t.fdi;
          const sameKind = !!sel && !isSel && kindOf(t.fdi) === kindOf(sel.fdi);
          // 누른 치아에서 배열을 따라 멀어질수록 늦게 칠한다
          const distance = sel ? Math.abs(t.col - sel.col) + (t.upper === sel.upper ? 0 : 2) : 0;
          const empty = isSel && missing;
          const fill = empty ? "transparent" : isSel ? C.accent : sameKind ? "#bfe0db" : C.tooth;
          return (
            <g
              key={t.fdi}
              transform={`translate(${t.x} ${t.y}) rotate(${t.angle})`}
              role="button"
              tabIndex={0}
              aria-label={`${toothLabel(t.fdi)}, ${t.fdi}번`}
              aria-pressed={isSel}
              onClick={() => onSelect(t.fdi)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(t.fdi);
                }
              }}
              className="group cursor-pointer outline-none"
            >
              {/* 손가락으로 누르기 쉽게 넓힌 영역 */}
              <circle r="16" fill="transparent" />
              <rect
                x={-t.w / 2}
                y={-t.h / 2}
                width={t.w}
                height={t.h}
                rx={t.w / 2.6}
                fill={fill}
                stroke={isSel || empty ? C.accent : C.toothLine}
                strokeWidth={empty ? 2 : isSel ? 2 : 1.2}
                strokeDasharray={empty ? "4 3" : undefined}
                className="group-hover:stroke-[#0b6664] group-focus-visible:stroke-[#10302f] group-focus-visible:[stroke-width:3]"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: isSel && !empty ? "scale(1.18)" : "scale(1)",
                  transition: reduce
                    ? "none"
                    : `fill 240ms ${ease} ${sameKind ? 60 + distance * 28 : 0}ms, transform 220ms ${ease}, stroke 160ms`,
                }}
              />
            </g>
          );
        })}
        <text x="180" y="150" textAnchor="middle" fontSize="13" fill={C.muted}>
          위턱
        </text>
        <text x="180" y="236" textAnchor="middle" fontSize="13" fill={C.muted}>
          아래턱
        </text>
        <text x="10" y="192" fontSize="12" fill={C.muted}>
          오른쪽
        </text>
        <text x="350" y="192" fontSize="12" fill={C.muted} textAnchor="end">
          왼쪽
        </text>
      </svg>
      <figcaption className="sr-only">환자 기준 좌우입니다. 그림의 왼쪽이 환자의 오른쪽입니다.</figcaption>
    </figure>
  );
}

/* ---------- 예약 신청 ---------- */

const noopSubscribe = () => () => {};

// 날짜가 고정된 공휴일 (월-일)
const HOLIDAYS = ["1-1", "3-1", "5-5", "6-6", "8-15", "10-3", "10-9", "12-25"];

/** 내일부터 일요일과 공휴일을 뺀 7일 */
function nextOpenDays(todayKey: string) {
  const list: Date[] = [];
  const d = new Date(todayKey);
  while (list.length < 7) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && !HOLIDAYS.includes(`${d.getMonth() + 1}-${d.getDate()}`)) list.push(new Date(d));
  }
  return list;
}

function Reservation({ treatment, onTreatment }: { treatment: TreatmentId; onTreatment: (id: TreatmentId) => void }) {
  const reduce = useReducedMotionSafe();
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState<{ name: string; when: string; treatment: string } | null>(null);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  const todayKey = useSyncExternalStore(
    noopSubscribe,
    () => new Date().toDateString(),
    () => "",
  );
  const days = useMemo(() => (todayKey ? nextOpenDays(todayKey) : []), [todayKey]);

  const day = days[dayIndex];
  const slots = day ? slotsFor(day) : [];
  const dayLabel = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일(${DAY_NAMES[d.getDay()]})`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let msg = "";
    if (!time) msg = "예약 시간을 골라 주세요.";
    else if (name.trim().length < 2) msg = "이름을 입력해 주세요.";
    else if (phone.replace(/\D/g, "").length < 10) msg = "연락처를 정확히 입력해 주세요.";
    else if (!agree) msg = "개인정보 수집 및 이용에 동의해 주세요.";
    setError(msg);
    if (msg) {
      errorRef.current?.focus();
      return;
    }
    setDone({ name: maskName(name), when: `${dayLabel(day)} ${time}`, treatment: TREATMENT_NAME[treatment] });
  };

  const reset = () => {
    setDone(null);
    setTime(null);
    setName("");
    setPhone("");
    setAgree(false);
  };

  const chip = "relative inline-flex h-11 items-center justify-center rounded-[6px] border px-3 text-[16px] transition-colors";

  return (
    <section id="reserve" className="scroll-mt-16" style={{ backgroundColor: C.mist }}>
      <div className={`${container} grid gap-10 py-16 md:py-24 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <h2 className={heading}>진료시간과 예약</h2>
          <p className="mt-4" style={{ color: C.muted }}>
            신청하시면 진료 시간 안에 확인 전화를 드리고, 통화 후 예약이 확정됩니다. 당일 예약은 전화로 문의해 주세요.
          </p>
          <ReserveHours />
        </div>

        <div className="rounded-[12px] border bg-white p-5 md:p-8 lg:col-span-8" style={{ borderColor: C.line }}>
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div
                key="done"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.24, ease: EASE }}
                className="py-6 text-center"
                role="status"
              >
                <svg viewBox="0 0 52 52" className="mx-auto h-14 w-14" aria-hidden>
                  <circle cx="26" cy="26" r="24" fill={C.mint} />
                  <motion.path
                    d="M15 27 L23 35 L38 19"
                    fill="none"
                    stroke={C.accent}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: EASE, delay: reduce ? 0 : 0.12 }}
                  />
                </svg>
                <p className="mt-5 text-[24px] font-bold tracking-[-0.03em]">예약 신청이 접수되었습니다</p>
                <p className="mt-3" style={{ color: C.muted }}>
                  {done.name} 님, {done.when} {done.treatment} 예약 신청을 받았습니다.
                  <br />
                  확인 전화를 드린 뒤 예약이 확정됩니다.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-8 inline-flex h-11 items-center rounded-[6px] border px-5 font-bold"
                  style={{ borderColor: C.line }}
                >
                  다른 예약 신청
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.15 }}>
                <fieldset>
                  <legend className="text-[17px] font-bold">진료 항목</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {RESERVE_ITEMS.map((id) => {
                      const on = id === treatment;
                      return (
                        <label
                          key={id}
                          className={`${chip} cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2`}
                          style={{ borderColor: on ? C.accent : C.line, color: on ? "#fff" : C.ink }}
                        >
                          {on && (
                            <motion.span
                              layoutId="reserve-treatment"
                              className="absolute inset-[-1px] rounded-[6px]"
                              style={{ backgroundColor: C.accent }}
                              transition={{ duration: reduce ? 0 : 0.24, ease: EASE }}
                              aria-hidden
                            />
                          )}
                          <input type="radio" name="treatment" value={id} checked={on} onChange={() => onTreatment(id)} className="sr-only" />
                          <span className="relative">{TREATMENT_NAME[id]}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="text-[17px] font-bold">날짜</legend>
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {days.map((d, i) => {
                      const on = i === dayIndex;
                      return (
                        <label
                          key={d.toDateString()}
                          className={`${chip} h-16 cursor-pointer flex-col gap-0 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2`}
                          style={{ borderColor: on ? C.ink : C.line, backgroundColor: on ? C.ink : "#fff", color: on ? "#fff" : C.ink }}
                        >
                          <input
                            type="radio"
                            name="day"
                            checked={on}
                            onChange={() => {
                              setDayIndex(i);
                              setTime(null);
                            }}
                            className="sr-only"
                          />
                          <span className="text-[14px]" style={{ color: on ? C.onInkMuted : d.getDay() === 6 ? "#1d5fa8" : C.muted }}>
                            {DAY_NAMES[d.getDay()]}
                          </span>
                          <span className="font-bold tabular-nums">
                            {d.getMonth() + 1}.{d.getDate()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="text-[17px] font-bold">
                    시간
                    {day && "night" in (HOURS.find((h) => h.day === day.getDay()) ?? {}) && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[15px] font-normal" style={{ color: C.accent }}>
                        <Moon size={14} aria-hidden />
                        저녁 9시까지 진료
                      </span>
                    )}
                  </legend>
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {slots.map((s) => {
                      const on = s.label === time;
                      return (
                        <label
                          key={s.label}
                          className={`${chip} tabular-nums ${s.taken ? "cursor-not-allowed" : "cursor-pointer"} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2`}
                          style={{
                            borderColor: on ? C.accent : C.line,
                            backgroundColor: s.taken ? C.mist : on ? C.accent : "#fff",
                            color: s.taken ? "#8a9a99" : on ? "#fff" : C.ink,
                          }}
                        >
                          <input type="radio" name="time" disabled={s.taken} checked={on} onChange={() => setTime(s.label)} className="sr-only" />
                          {s.taken ? (
                            <span>
                              <span className="line-through">{s.label}</span>
                              <span className="sr-only"> 마감</span>
                            </span>
                          ) : (
                            s.label
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[17px] font-bold">이름</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="mt-2 h-12 w-full rounded-[6px] border px-3 outline-none focus:border-[#0b6664] focus:ring-2 focus:ring-[#0b6664]/20"
                      style={{ borderColor: C.toothLine }}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[17px] font-bold">연락처</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="010-0000-0000"
                      className="mt-2 h-12 w-full rounded-[6px] border px-3 outline-none focus:border-[#0b6664] focus:ring-2 focus:ring-[#0b6664]/20"
                      style={{ borderColor: C.toothLine }}
                    />
                  </label>
                </div>

                <label className="mt-5 flex items-start gap-2">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 accent-[#0b6664]" />
                  <span>
                    개인정보 수집 및 이용에 동의합니다. <span className="text-[15px]" style={{ color: C.muted }}>(이름, 연락처 / 예약 확인 후 6개월 보관)</span>
                  </span>
                </label>

                <p ref={errorRef} tabIndex={-1} className="mt-4 min-h-[1.5em] text-[16px] font-bold outline-none" style={{ color: "#b3261e" }} aria-live="polite">
                  {error}
                </p>

                <button
                  type="submit"
                  className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-[6px] text-[17px] font-bold text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] sm:w-auto sm:px-10"
                  style={{ backgroundColor: C.accent }}
                >
                  {day && time ? `${dayLabel(day)} ${time} 예약 신청` : "예약 신청"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/** 예약 칸 왼쪽의 진료시간 */
function ReserveHours() {
  const now = useNow();
  const status = openStatus(now);
  return (
    <div className="mt-8 border-t-2 pt-2" style={{ borderColor: C.ink }} id="hours">
      <table className="w-full">
        <caption className="sr-only">요일별 진료시간</caption>
        <tbody>
          {HOURS.map((h) => {
            const isToday = now?.getDay() === h.day;
            return (
              <tr key={h.label} className="border-b" style={{ borderColor: C.line }}>
                <th scope="row" className={`py-2.5 pr-3 text-left ${isToday ? "font-bold" : "font-normal"}`}>
                  {h.label}
                  {isToday && (
                    <span className="ml-2 rounded-[4px] px-1.5 py-0.5 text-[14px] font-bold text-white" style={{ backgroundColor: C.ink }}>
                      오늘
                    </span>
                  )}
                </th>
                <td className={`py-2.5 text-right tabular-nums ${isToday ? "font-bold" : ""}`} style={{ color: h.open ? C.ink : "#b3261e" }}>
                  {"night" in h && h.night && <Moon size={14} className="mr-1 inline align-[-1px]" style={{ color: C.accent }} aria-label="야간 진료" />}
                  {h.time}
                </td>
              </tr>
            );
          })}
          <tr>
            <th scope="row" className="py-2.5 pr-3 text-left font-normal" style={{ color: C.muted }}>
              점심시간 (평일)
            </th>
            <td className="py-2.5 text-right tabular-nums" style={{ color: C.muted }}>
              13:00 ~ 14:00
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
        접수는 진료 마감 30분 전까지 받습니다. 화요일, 목요일은 저녁시간 없이 9시까지 진료합니다.
      </p>
      {status && (
        <p className="mt-3 font-bold" style={{ color: status.open ? C.accent : C.muted }}>
          {status.text}
        </p>
      )}
      <dl className="mt-8 border-t pt-4 text-[16px]" style={{ borderColor: C.line }}>
        <div className="flex gap-3">
          <dt className="w-10 shrink-0 font-bold">주소</dt>
          <dd>{ADDRESS} (□□역 4번 출구에서 걸어서 3분)</dd>
        </div>
        <div className="mt-2 flex gap-3">
          <dt className="w-10 shrink-0 font-bold">주차</dt>
          <dd>건물 지하 2~4층, 진료 시 2시간 무료</dd>
        </div>
      </dl>
    </div>
  );
}

function ToothMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        d="M7 3.5c-2.6 0-4 2-4 4.6 0 2.4 1 4 1.6 6.2.6 2.3.8 6.2 2.6 6.2 1.7 0 1.8-3.4 2.6-5 .5-1 1.9-1 2.4 0 .8 1.6.9 5 2.6 5 1.8 0 2-3.9 2.6-6.2.6-2.2 1.6-3.8 1.6-6.2 0-2.6-1.4-4.6-4-4.6-2 0-3 1.2-5 1.2s-3-1.2-5-1.2Z"
        fill={C.accent}
      />
    </svg>
  );
}

