"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, CalendarCheck, ChevronDown, ChevronRight, Home, MapPin, Menu, MessageCircle, Moon, Phone, Plus, Receipt, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";

/* 치과 홈페이지 데모: 가상의 곰파트너치과의원.
   병원명, 의료진, 주소, 전화번호, 사업자 정보, 진료비는 모두 가상이다.

   구성: 실제 동네 치과에서 흔한 포털형.
   대메뉴 6개에 마우스를 올리거나 초점을 주면 하위 메뉴 전체가 한 번에 펼쳐지는 펼침 메뉴,
   넓은 화면 오른쪽에 고정 퀵메뉴(네이버 예약, 카카오톡 상담, 전화 상담, 비급여 안내, 오시는 길, TOP),
   좁은 화면에는 아래쪽 빠른 메뉴 막대(예약, 카카오톡, 길찾기, 전화)를 둔다.
   메인은 배너, 진료과목 이름 띠, 공지사항과 진료시간, 상담 전화 줄, 증상 자가체크(치아 지도), 의료진 순서.
   하위 페이지는 라우트를 늘리지 않고 상태로 화면을 바꾼다.

   디자인: 흰 바탕에 짙은 청록 잉크(#10302f)와 청록 강조색(#0b6664), 옅은 민트(#e3f1ef).

   사진 출처(public/images/demo-dental):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, doctor1, doctor2, ortho, lobby, implant
   Unsplash 무료 라이선스 whitening Ozkan Guner(7Mut2WMWttA),
   caries Katarzyna Zygnerska(rubu_NvklJE), scaling Quilia(y8fWicGsv4g), ct Quang Tri NGUYEN(VckdJzo7ig0) */

const IMG = "/images/demo-dental";
const CLINIC = "곰파트너치과의원";
const TEL = "02-000-0000";
const ADDRESS = "ㄷㅅ시 ㅎㄷ로 45 ㅅㅈ타워 3층";

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
  error: "#b3261e",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- 진료 ---------- */

type TreatmentId = "implant" | "ortho" | "caries" | "endo" | "gum" | "wisdom" | "scaling" | "whitening" | "check";

const TREATMENT_NAME: Record<TreatmentId, string> = {
  implant: "임플란트",
  ortho: "치아교정",
  caries: "충치치료",
  endo: "신경치료",
  gum: "잇몸치료",
  wisdom: "사랑니 발치",
  scaling: "스케일링 · 예방",
  whitening: "치아미백",
  check: "검진 · 상담",
};

const TREATMENT_ORDER: TreatmentId[] = ["implant", "ortho", "caries", "endo", "gum", "wisdom", "scaling", "whitening"];

interface TreatmentInfo {
  img: string;
  pos?: string;
  summary: string;
  cases: string[];
  visits: string;
  insurance: string;
  cost: string;
}

const TREATMENT_INFO: Record<Exclude<TreatmentId, "check">, TreatmentInfo> = {
  implant: {
    img: "implant",
    pos: "50% 25%",
    summary: "CT로 잇몸뼈 높이와 신경 위치를 확인한 뒤 식립합니다. 뼈가 부족하면 뼈이식을 함께 진행합니다.",
    cases: ["치아가 빠진 채로 오래 지낸 경우", "브리지나 틀니가 불편한 경우", "치아를 뽑아야 한다는 진단을 받은 경우"],
    visits: "3~6개월, 5~7회",
    insurance: "만 65세 이상 평생 2개, 본인부담 30%",
    cost: "1개 110만 원 (뼈이식 별도)",
  },
  ortho: {
    img: "ortho",
    summary: "치과교정과 전문의가 진료합니다. 투명교정과 장치 교정 모두 가능합니다.",
    cases: ["덧니, 벌어진 앞니", "돌출입, 주걱턱", "임플란트 전 치아 위치를 바로잡아야 하는 경우"],
    visits: "1년 6개월 안팎, 4~6주마다",
    insurance: "비급여",
    cost: "투명교정 480만 원, 장치 교정 350만 원",
  },
  caries: {
    img: "caries",
    summary: "충치 크기에 따라 레진, 인레이, 크라운으로 치료합니다.",
    cases: ["찬물이나 단 음식에 시린 경우", "치아에 까만 점이나 구멍이 보이는 경우", "예전에 때운 재료가 떨어진 경우"],
    visits: "1~2회",
    insurance: "아말감, 글래스아이오노머는 적용 (만 12세 이하 영구치 레진 적용)",
    cost: "레진 10만 원, 금 인레이 40만 원",
  },
  endo: {
    img: "ct",
    summary: "충치가 신경까지 진행된 경우 염증이 생긴 신경을 제거하고 소독합니다. 치료 후에는 크라운을 씌워 치아를 보호합니다.",
    cases: ["씹을 때 아프거나 저절로 욱신거리는 경우", "밤에 통증이 심해지는 경우", "잇몸에 고름이 잡힌 경우"],
    visits: "3~4회",
    insurance: "신경치료는 적용, 크라운은 비급여",
    cost: "신경치료 3만~5만 원, 지르코니아 크라운 50만 원",
  },
  gum: {
    img: "scaling",
    summary: "잇몸 속 깊이 쌓인 치석과 염증 조직을 제거합니다. 상태에 따라 부위를 나누어 여러 번 진행합니다.",
    cases: ["잇몸이 붓고 피가 나는 경우", "잇몸이 내려가 치아가 길어 보이는 경우", "치아가 흔들리는 경우"],
    visits: "2~4회",
    insurance: "적용",
    cost: "회당 1만~3만 원",
  },
  wisdom: {
    img: "ct",
    summary: "파노라마와 CT로 신경과의 거리를 확인한 뒤 발치합니다. 누워 있거나 매복된 사랑니도 발치 가능합니다.",
    cases: ["사랑니 주변 잇몸이 붓고 아픈 경우", "사랑니가 옆으로 누워 난 경우", "사랑니 앞 어금니에 충치가 생긴 경우"],
    visits: "1~2회, 실밥 제거 1회",
    insurance: "발치는 적용, CT는 비급여",
    cost: "3만~6만 원, CT 8만 원",
  },
  scaling: {
    img: "scaling",
    summary: "치석과 착색을 제거합니다. 어린이는 불소 도포와 실란트(홈메우기)도 진행합니다.",
    cases: ["양치할 때 피가 나는 경우", "입 냄새가 심한 경우", "1년 넘게 스케일링을 받지 않은 경우"],
    visits: "1회",
    insurance: "만 19세 이상 1년에 한 번 적용",
    cost: "1만 5천 원 안팎",
  },
  whitening: {
    img: "whitening",
    summary: "전문가 미백과 자가 미백을 함께 하면 효과가 오래 유지됩니다.",
    cases: ["커피, 차, 흡연으로 치아가 누렇게 변한 경우", "결혼, 면접 등을 앞둔 경우"],
    visits: "1~3회",
    insurance: "비급여",
    cost: "전문가 미백 1회 20만 원",
  },
};

/* ---------- 메뉴 ---------- */

type MenuId = "about" | "treat" | "symptom" | "fees" | "community" | "reserve";
interface SubMenu {
  id: string;
  label: string;
}

const MENUS: { id: MenuId; label: string; subs: SubMenu[] }[] = [
  {
    id: "about",
    label: "병원소개",
    subs: [
      { id: "greeting", label: "인사말" },
      { id: "doctors", label: "의료진 소개" },
      { id: "tour", label: "병원 둘러보기" },
      { id: "location", label: "진료시간·오시는 길" },
    ],
  },
  { id: "treat", label: "진료과목", subs: TREATMENT_ORDER.map((id) => ({ id, label: TREATMENT_NAME[id] })) },
  {
    id: "symptom",
    label: "증상별 안내",
    subs: [
      { id: "selfcheck", label: "증상 자가체크" },
      { id: "list", label: "증상별 안내" },
    ],
  },
  {
    id: "fees",
    label: "비급여 안내",
    subs: [
      { id: "fees", label: "비급여 진료비 안내" },
      { id: "insurance", label: "보험 적용 진료" },
    ],
  },
  {
    id: "community",
    label: "커뮤니티",
    subs: [
      { id: "notice", label: "공지사항" },
      { id: "faq", label: "자주 묻는 질문" },
    ],
  },
  { id: "reserve", label: "상담예약", subs: [{ id: "reserve", label: "상담예약" }] },
];

type View = { page: "home" } | { page: "sub"; menu: MenuId; sub: string };
type Go = (menu: MenuId | "home", sub?: string) => void;

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
  text: "치아가 빠졌을 때",
  treatment: "implant",
  body: "치아가 빠진 채로 오래 두면 주변 치아가 기울어지고 잇몸뼈가 줄어듭니다. CT 검사 후 임플란트, 브리지, 틀니 중 알맞은 치료를 권해 드립니다.",
  visits: "3~6개월, 5~7회",
  insurance: "만 65세 이상 평생 2개 적용",
  cost: "1개 110만 원, 보험 적용 시 본인부담 40만 원 안팎",
  missing: true,
};

const MOLAR_SYMPTOMS: Symptom[] = [
  {
    text: "씹으면 아플 때",
    treatment: "endo",
    body: "충치가 신경 가까이 진행되었거나 치아에 금이 간 경우가 많습니다. 엑스레이로 확인한 뒤 신경치료 여부를 결정합니다.",
    visits: "3~4회",
    insurance: "신경치료는 적용, 크라운은 비급여",
    cost: "신경치료 3만~5만 원, 지르코니아 크라운 50만 원",
  },
  {
    text: "이가 시릴 때",
    treatment: "caries",
    body: "초기 충치이거나 잇몸이 내려가 치아 뿌리가 드러난 경우입니다. 충치는 치료하고, 시린 부위는 약제를 바르거나 레진으로 덮어 줍니다.",
    visits: "1~2회",
    insurance: "대부분 적용",
    cost: "1만~3만 원",
  },
  {
    text: "치아가 까맣게 변했을 때",
    treatment: "caries",
    body: "겉보다 안쪽으로 넓게 퍼진 충치일 수 있습니다. 충치 크기에 따라 레진이나 인레이로 치료합니다.",
    visits: "1~2회",
    insurance: "레진, 인레이는 비급여 (만 12세 이하 영구치 레진은 적용)",
    cost: "레진 10만 원, 금 인레이 40만 원",
  },
  MISSING,
];

const SYMPTOMS: Record<Kind | "gum", Symptom[]> = {
  front: [
    {
      text: "치아 색이 누렇게 변했을 때",
      treatment: "whitening",
      body: "커피, 차, 흡연 등으로 생긴 착색은 미백으로 개선할 수 있습니다. 충치나 잇몸 염증이 있으면 먼저 치료한 뒤 진행합니다.",
      visits: "1~3회",
      insurance: "비급여",
      cost: "전문가 미백 1회 20만 원",
    },
    {
      text: "치열이 고르지 않을 때",
      treatment: "ortho",
      body: "덧니, 벌어진 앞니, 돌출입은 교정 치료로 개선할 수 있습니다. 정밀 검사 후 투명교정과 장치 교정 중 알맞은 방법을 권해 드립니다.",
      visits: "1년 6개월 안팎, 4~6주마다",
      insurance: "비급여",
      cost: "투명교정 480만 원, 장치 교정 350만 원",
    },
    {
      text: "치아가 깨졌을 때",
      treatment: "caries",
      body: "조금 깨졌으면 치아와 비슷한 레진을 추천하여 치료합니다. 많이 깨진 경우에는 신경 상태를 확인한 뒤 크라운으로 치료합니다.",
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
      text: "사랑니 주변이 붓고 아플 때",
      treatment: "wisdom",
      body: "사랑니 주변 잇몸에 염증이 생긴 경우입니다. 염증을 가라앉힌 뒤 파노라마 사진으로 발치 여부를 결정합니다.",
      visits: "1~2회, 실밥 제거 1회",
      insurance: "적용",
      cost: "2만~5만 원",
    },
    {
      text: "사랑니가 누워 났을 때",
      treatment: "wisdom",
      body: "누워 있는 사랑니는 앞 어금니에 충치를 만들기 쉽습니다. CT로 신경과의 거리를 확인한 뒤 발치합니다.",
      visits: "1회, 실밥 제거 1회",
      insurance: "발치는 적용, CT는 비급여",
      cost: "3만~6만 원, CT 8만 원",
    },
  ],
  gum: [
    {
      text: "잇몸에서 피가 날 때",
      treatment: "scaling",
      body: "대부분 치석으로 인한 잇몸 염증입니다. 스케일링으로 좋아지는 경우가 많습니다.",
      visits: "1회",
      insurance: "만 19세 이상 1년에 한 번 적용",
      cost: "1만 5천 원 안팎",
    },
    {
      text: "잇몸이 붓고 내려앉았을 때",
      treatment: "gum",
      body: "잇몸 속 깊이 치석이 쌓인 치주염일 수 있습니다. 잇몸 치료를 부위별로 나누어 진행합니다.",
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

interface Preset {
  select: Selection;
  index: number;
}

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

/* ---------- 의료진 ---------- */

const DOCTORS = [
  {
    name: "김ㅈ우",
    role: "대표원장",
    field: "임플란트, 보철, 신경치료",
    career: ["통합치의학과 전문의", "ㄴㄹ대학교 치과대학 졸업", "대한구강악안면임플란트학회 정회원"],
    img: "doctor2",
    pos: "50% 25%",
  },
  {
    name: "이ㅅ연",
    role: "원장",
    field: "치아교정",
    career: ["치과교정과 전문의", "ㄴㄹ대학교치과병원 교정과 수련", "대한치과교정학회 인정의"],
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

/** 메인 진료시간 상자: 실제 의원처럼 요일을 묶어 적는다 */
const HOURS_GROUPED = [
  { label: "월 · 수 · 금", days: [1, 3, 5], time: "09:30 ~ 18:30" },
  { label: "화 · 목", days: [2, 4], time: "09:30 ~ 21:00", night: true },
  { label: "토요일", days: [6], time: "09:30 ~ 14:00" },
  { label: "일요일 · 공휴일", days: [0], time: "휴진" },
];

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
  if (!row || !row.open) return { text: "오늘 휴진", open: false };
  const [start, end] = row.open;
  if (minutes < start) return { text: "진료 시작 전", open: false };
  if (minutes >= end) return { text: "오늘 진료 종료", open: false };
  if (day >= 1 && day <= 5 && minutes >= LUNCH[0] && minutes < LUNCH[1]) return { text: "점심시간", open: false };
  return { text: "진료 중", open: true };
}

/* ---------- 비급여 ---------- */

const FEE_GROUPS: { title: string; rows: { item: string; price: number; note?: string }[] }[] = [
  {
    title: "임플란트",
    rows: [
      { item: "임플란트 (국산, 지르코니아 보철 포함)", price: 1100000, note: "1개, 뼈이식 별도" },
      { item: "뼈이식", price: 300000, note: "1부위" },
      { item: "치과 CT 촬영", price: 80000 },
    ],
  },
  {
    title: "보철",
    rows: [
      { item: "지르코니아 크라운", price: 500000, note: "1개" },
      { item: "금 인레이", price: 400000, note: "금 시세에 따라 변동" },
      { item: "레진 충전", price: 100000, note: "1면 기준" },
    ],
  },
  {
    title: "교정",
    rows: [
      { item: "투명교정", price: 4800000, note: "정밀 검사비 별도" },
      { item: "메탈 장치 교정", price: 3500000, note: "정밀 검사비 별도" },
      { item: "교정 정밀 검사", price: 200000 },
    ],
  },
  {
    title: "기타",
    rows: [
      { item: "전문가 미백", price: 200000, note: "1회, 자가 미백 키트 포함 시 30만 원" },
      { item: "진단서", price: 20000, note: "1통" },
    ],
  },
];

const INSURANCE = [
  { title: "스케일링", target: "만 19세 이상", body: "1년에 한 번 (매년 1월 1일에 새로 시작)" },
  { title: "보험임플란트", target: "만 65세 이상", body: "평생 2개, 본인부담 30%" },
  { title: "보험틀니", target: "만 65세 이상", body: "7년에 한 번, 본인부담 30%" },
  { title: "어금니 홈메우기", target: "만 18세 이하", body: "충치가 없는 큰 어금니, 본인부담 10%" },
  { title: "레진 충전", target: "만 12세 이하", body: "충치가 생긴 영구치" },
];

const FEE_FAQ = [
  { q: "표에 없는 진료비는 어떻게 알 수 있나요?", a: "검진 후 치료 계획과 항목별 비용을 안내해 드립니다. 전화 상담으로도 대략적인 비용을 확인하실 수 있습니다." },
  { q: "카드 결제나 분할 결제가 가능한가요?", a: "모든 카드 결제가 가능합니다. 임플란트와 교정은 치료 단계에 따라 나누어 결제하실 수 있습니다." },
  { q: "표시된 금액에 부가세가 포함되어 있나요?", a: "표시된 비용은 부가세 포함 금액입니다. 부가세는 치아미백 등 미용 목적 진료에만 부과됩니다." },
  { q: "실비보험 청구가 가능한가요?", a: "건강보험 적용 진료는 대부분 청구 가능합니다. 비급여 항목은 보험 약관에 따라 다르니 가입하신 보험사에 문의해 주세요. 진료비 세부내역서는 접수처에서 발급해 드립니다." },
];

const FAQ = [
  { q: "야간진료 시간에도 모든 진료가 가능한가요?", a: "화·목 야간진료 시간에도 모든 진료가 가능합니다. 단, 임플란트 수술은 19:00 이전 예약을 권해 드립니다." },
  { q: "주차가 가능한가요?", a: "건물 지하 2~4층 주차장을 이용하실 수 있으며, 진료 시 2시간 무료입니다. 접수 시 차량 번호를 말씀해 주세요." },
  { q: "첫 방문 시 준비물이 있나요?", a: "신분증을 지참해 주세요. 다른 치과에서 촬영한 사진이나 복용 중인 약이 있으면 함께 알려 주세요." },
  { q: "어린이 진료도 하나요?", a: "충치 치료, 불소 도포, 실란트(홈메우기)를 진료합니다. 만 12세 이하 영구치 레진 치료는 건강보험이 적용됩니다." },
  ...FEE_FAQ,
];

/* ---------- 공지사항 ---------- */

const NOTICE_TOTAL = 137;
/** 작성일은 오늘 기준 며칠 전(ago)으로 두고, 본문 속 날짜도 작성일에서 계산한다 */
const mdKo = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const after = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** d 이후(같은 날 포함) 첫 목요일 */
const nextThu = (d: Date) => after(d, (4 - d.getDay() + 7) % 7);

const makeNotices = (today: Date) => {
  const at = (ago: number) => daysAgo(today, ago);
  const thu = nextThu(after(at(13), 21));
  const goldFrom = after(at(39), 64);
  const paintFrom = after(at(56), 6);
  return [
    { no: 137, ago: 5, title: "공휴일 휴진 안내", body: "공휴일은 휴진합니다. 토요일은 09:30~14:00 정상 진료합니다. 예약 변경은 전화로 문의해 주세요." },
    { no: 136, ago: 13, title: `${mdKo(thu)}(목) 야간진료 18:30 단축 (원장 학회 참석)`, body: `대표원장 학회 참석으로 ${mdKo(thu)}(목)은 18:30까지 진료합니다. 해당일 저녁 예약 환자분께는 개별 연락드렸습니다.` },
    { no: 135, ago: 16, title: `${at(16).getFullYear()}년 건강보험 구강검진 12월 31일 마감`, body: "국민건강보험 구강검진은 12월 31일까지 받으실 수 있습니다. 12월에는 예약이 많으니 미리 예약해 주세요. 검진 비용은 무료입니다." },
    { no: 134, ago: 29, title: "구강스캐너 도입, 크라운 본뜨기 방식 변경", body: "크라운과 인레이 치료에 구강스캐너를 도입했습니다. 본뜨기 과정 없이 진행되며 비용은 동일합니다." },
    { no: 133, ago: 39, title: "금 인레이 비용 변경 안내", body: `금 시세 상승으로 ${mdKo(goldFrom)}부터 금 인레이 비용이 40만 원에서 45만 원으로 변경됩니다. ${mdKo(after(goldFrom, -1))}까지 치료를 시작하신 분은 기존 금액으로 진행합니다.` },
    { no: 132, ago: 56, title: "지하 주차장 도색 공사 기간 주차 안내", body: `지하 주차장 도색 공사로 ${mdKo(paintFrom)}~${mdKo(after(paintFrom, 2))}에는 지하 3층만 이용 가능합니다. 공영주차장 이용 시 영수증을 가져오시면 1시간 주차비를 지원해 드립니다.` },
    { no: 131, ago: 71, title: "휴가 기간 없이 정상 진료", body: "올해는 별도 휴가 기간 없이 정상 진료합니다. 방학 기간 학생 교정 상담은 오전 예약을 권해 드립니다." },
    { no: 130, ago: 96, title: "만 65세 이상 보험임플란트 상담 일정 안내", body: "만 65세 이상은 평생 2개까지 건강보험 임플란트를 받으실 수 있습니다. 화·목 오전에 별도 상담 시간을 운영합니다." },
  ].map((n) => ({ ...n, date: fmtDot(at(n.ago)) }));
};

/** 공지 목록, 화면마다 오늘 날짜로 다시 계산한다 */
const useNotices = () => {
  const today = useDemoToday();
  return useMemo(() => makeNotices(today), [today]);
};

/* ---------- 예약 ---------- */

const RESERVE_ITEMS: TreatmentId[] = ["check", ...TREATMENT_ORDER];
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function timeOptions(date: Date | undefined) {
  if (!date) return [];
  const d = date.getDay();
  if (d === 6) return ["오전 (09:30 ~ 12:00)", "오후 (12:00 ~ 14:00)"];
  const list = ["오전 (09:30 ~ 13:00)", "오후 (14:00 ~ 18:30)"];
  if (d === 2 || d === 4) list.push("저녁 (18:30 ~ 21:00)");
  return list;
}

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

/** 병원식 이름 가리기: 김하늘은 김ㅎ늘, 2글자는 김* */
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
const noopSubscribe = () => () => {};
const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2 = "text-[26px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[32px]";
const btnPrimary =
  "inline-flex h-12 items-center justify-center rounded-[6px] px-6 text-[17px] font-bold text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]";
const btnLine =
  "inline-flex h-12 items-center justify-center gap-1.5 rounded-[6px] border bg-white px-5 text-[16px] font-bold transition-colors hover:bg-[#f3f8f7]";

/* ================================================================ */

export function DentalHomepageDemo() {
  const [view, setView] = useState<View>({ page: "home" });
  const [reserveTreatment, setReserveTreatment] = useState<TreatmentId>("check");
  const [preset, setPreset] = useState<Preset>({ select: 36, index: 0 });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  // 사용법 가이드가 하위 화면에서 열리면 첫 화면으로 돌아온다
  useEffect(() => {
    const f = () => {
      setView({ page: "home" });
      setToast(null);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go: Go = (menu, sub) => {
    if (menu === "home") setView({ page: "home" });
    else setView({ page: "sub", menu, sub: sub ?? MENUS.find((m) => m.id === menu)!.subs[0].id });
    window.scrollTo({ top: 0 });
  };

  const reserve = (id: TreatmentId) => {
    setReserveTreatment(id);
    go("reserve", "reserve");
  };

  const openSelfcheck = (p: Preset) => {
    setPreset(p);
    go("symptom", "selfcheck");
  };

  const linkOut = (what: "naver" | "kakao" | "map") =>
    setToast(
      what === "naver"
        ? "네이버 예약은 병원 네이버 플레이스와 연결됩니다."
        : what === "kakao"
          ? `카카오톡 채널 ${CLINIC}과 연결됩니다.`
          : "지도 앱에서 병원 위치를 엽니다.",
    );

  return (
    <div className="min-h-screen text-[17px] leading-[1.5]" style={{ backgroundColor: C.paper, color: C.ink }}>
      <SiteHeader view={view} go={go} />

      <main id="top" key={view.page === "home" ? "home" : `${view.menu}-${view.sub}`} className="soft-in">
        {view.page === "home" ? (
          <HomePage go={go} reserve={reserve} linkOut={linkOut} />
        ) : (
          <SubPage
            key={`${view.menu}-${view.sub}`}
            menu={view.menu}
            sub={view.sub}
            go={go}
            reserve={reserve}
            preset={preset}
            openSelfcheck={openSelfcheck}
            reserveTreatment={reserveTreatment}
            setReserveTreatment={setReserveTreatment}
            linkOut={linkOut}
          />
        )}
      </main>

      <SiteFooter go={go} />
      <QuickMenu go={go} linkOut={linkOut} />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-28 z-50 flex justify-center px-4">
        {toast && (
          <p className="rounded-[6px] px-4 py-3 text-[15px] font-bold shadow-lg" style={{ backgroundColor: C.ink, color: C.onInk }}>
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- 머리글과 펼침 메뉴 ---------- */

function SiteHeader({ view, go }: { view: View; go: Go }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<MenuId | null>(null);
  const [hover, setHover] = useState<MenuId | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const current = view.page === "sub" ? view.menu : null;

  // 사용법 가이드가 하위 화면에서 열리면 첫 화면으로 돌아온다
  useEffect(() => {
    const f = () => {
      setMegaOpen(false);
      setMobileOpen(false);
      setHover(null);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const navigate: Go = (menu, sub) => {
    setMegaOpen(false);
    setMobileOpen(false);
    setHover(null);
    go(menu, sub);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b bg-white"
      style={{ borderColor: C.line }}
      onMouseLeave={() => {
        setMegaOpen(false);
        setHover(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && megaOpen) {
          triggerRef.current?.focus();
          setMegaOpen(false);
        }
      }}
      onBlur={(e) => {
        if (!headerRef.current?.contains(e.relatedTarget as Node | null)) setMegaOpen(false);
      }}
    >
      <div className="hidden border-b md:block" style={{ borderColor: C.line, backgroundColor: C.mist }}>
        <div className={`${container} flex h-9 items-center justify-between text-[14px]`} style={{ color: C.muted }}>
          <p className="flex items-center gap-1.5">
            <Moon size={14} aria-hidden style={{ color: C.accent }} />
            화 · 목 야간진료 21:00까지, 토요일 14:00까지 진료
          </p>
          <a href={`tel:${TEL}`} className="font-bold tabular-nums hover:underline">
            대표전화 {TEL}
          </a>
        </div>
      </div>

      <div className={`${container} flex h-16 items-center gap-4 lg:h-[72px]`}>
        <button type="button" onClick={() => navigate("home")} aria-label={CLINIC} className="flex shrink-0 items-center lg:w-[170px]">
          <BrandLogo />
        </button>

        <nav className="hidden h-full flex-1 lg:block" aria-label="주 메뉴" onMouseEnter={() => setMegaOpen(true)}>
          <ul className="grid h-full grid-cols-6">
            {MENUS.map((m) => {
              const on = current === m.id || hover === m.id;
              return (
                <li key={m.id} className="h-full">
                  <button
                    type="button"
                    aria-current={current === m.id ? "page" : undefined}
                    onMouseEnter={() => setHover(m.id)}
                    onFocus={(e) => {
                      // 키보드로 들어오면 펼침 메뉴를 열어 하위 메뉴까지 갈 수 있게 한다
                      triggerRef.current = e.currentTarget;
                      setHover(m.id);
                      setMegaOpen(true);
                    }}
                    onClick={() => navigate(m.id)}
                    className="relative flex h-full w-full items-center justify-center text-[16px] font-bold xl:text-[17px]"
                    style={{ color: on ? C.accent : C.ink }}
                  >
                    {m.label}
                    <span
                      className="absolute inset-x-3 bottom-0 h-[3px] transition-opacity duration-150"
                      style={{ backgroundColor: C.accent, opacity: on ? 1 : 0 }}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:w-[170px] lg:justify-end">
          <button type="button" onClick={() => navigate("reserve", "reserve")} className={`${btnPrimary} h-10 px-4 text-[15px]`} style={{ backgroundColor: C.accent }}>
            상담예약
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "전체 메뉴 닫기" : "전체 메뉴 열기"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border lg:hidden"
            style={{ borderColor: C.line }}
          >
            {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {/* 펼침 메뉴: 대메뉴 아래로 모든 하위 메뉴를 한 번에 보여 준다 */}
      <div
        id="mega-menu"
        className={`absolute inset-x-0 top-full hidden border-b bg-white shadow-[0_16px_24px_rgba(16,48,47,0.08)] ${megaOpen ? "lg:block" : ""}`}
        style={{ borderColor: C.line }}
      >
        <div className={`${container} flex gap-4 py-6`}>
          <div className="w-[170px] shrink-0 border-r pr-4" style={{ borderColor: C.line }}>
            <p className="text-[15px]" style={{ color: C.muted }}>
              대표전화
            </p>
            <p className="text-[22px] font-bold tabular-nums">{TEL}</p>
            <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
              평일 09:30 ~ 18:30
              <br />
              화 · 목 09:30 ~ 21:00
            </p>
          </div>
          <div className="grid flex-1 grid-cols-6">
            {MENUS.map((m) => (
              <ul
                key={m.id}
                className="space-y-1 px-2 text-center"
                aria-label={m.label}
                onMouseEnter={() => setHover(m.id)}
                style={{ backgroundColor: hover === m.id ? C.mist : undefined }}
              >
                {m.subs.map((s) => {
                  const on = view.page === "sub" && view.menu === m.id && view.sub === s.id;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => navigate(m.id, s.id)}
                        aria-current={on ? "page" : undefined}
                        className="w-full rounded-[4px] px-1 py-1.5 text-[15px] transition-colors hover:text-[#0b6664] hover:underline"
                        style={{ color: on ? C.accent : C.muted, fontWeight: on ? 700 : 400 }}
                      >
                        {s.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
          <div className="w-[170px] shrink-0" aria-hidden />
        </div>
      </div>

      {/* 좁은 화면 전체 메뉴: 대메뉴를 누르면 하위 메뉴가 열린다 */}
      {mobileOpen && (
        <nav id="mobile-menu" className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t lg:hidden" style={{ borderColor: C.line }} aria-label="전체 메뉴">
          <ul className={container}>
            {MENUS.map((m) => {
              const open = mobileMenu === m.id;
              return (
                <li key={m.id} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                  <button
                    type="button"
                    onClick={() => setMobileMenu(open ? null : m.id)}
                    aria-expanded={open}
                    className="flex h-14 w-full items-center justify-between text-[17px] font-bold"
                  >
                    {m.label}
                    <ChevronDown size={18} className={open ? "rotate-180" : ""} style={{ color: C.muted }} aria-hidden />
                  </button>
                  {open && (
                    <ul className="grid grid-cols-2 gap-1 pb-4">
                      {m.subs.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => navigate(m.id, s.id)}
                            className="flex h-11 w-full items-center rounded-[4px] px-3 text-left text-[16px]"
                            style={{ backgroundColor: C.mist }}
                          >
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

/* ---------- 퀵메뉴 ---------- */

function NaverMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[15px] font-black text-white" style={{ backgroundColor: "#03a94d" }} aria-hidden>
      N
    </span>
  );
}

function KakaoMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: "#fee500", color: "#3c1e1e" }} aria-hidden>
      <MessageCircle size={16} fill="currentColor" />
    </span>
  );
}

function QuickMenu({ go, linkOut }: { go: Go; linkOut: (w: "naver" | "kakao" | "map") => void }) {
  const item = "flex w-full flex-col items-center gap-1 px-1 py-3 text-[13px] font-bold leading-tight transition-colors hover:bg-[#f3f8f7]";
  return (
    <>
      {/* 넓은 화면: 오른쪽 가운데 고정 */}
      <nav
        id="quick-menu"
        aria-label="퀵메뉴"
        className="fixed right-4 top-1/2 z-30 hidden w-[84px] -translate-y-1/2 overflow-hidden rounded-[10px] border bg-white shadow-[0_8px_24px_rgba(16,48,47,0.12)] min-[1440px]:block"
        style={{ borderColor: C.line }}
      >
        <p className="py-2 text-center text-[13px] font-bold text-white" style={{ backgroundColor: C.accent }}>
          퀵메뉴
        </p>
        <ul className="divide-y divide-[#d9e5e3]">
          <li>
            <button type="button" className={item} onClick={() => linkOut("naver")}>
              <NaverMark />
              네이버 예약
            </button>
          </li>
          <li>
            <button type="button" className={item} onClick={() => linkOut("kakao")}>
              <KakaoMark />
              카카오톡 상담
            </button>
          </li>
          <li>
            <a href={`tel:${TEL}`} className={item}>
              <Phone size={22} aria-hidden style={{ color: C.accent }} />
              전화 상담
            </a>
          </li>
          <li>
            <button type="button" className={item} onClick={() => go("fees", "fees")}>
              <Receipt size={22} aria-hidden style={{ color: C.accent }} />
              비급여 안내
            </button>
          </li>
          <li>
            <button type="button" className={item} onClick={() => go("about", "location")}>
              <MapPin size={22} aria-hidden style={{ color: C.accent }} />
              오시는 길
            </button>
          </li>
          <li>
            <button type="button" className={item} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <ArrowUp size={20} aria-hidden />
              TOP
            </button>
          </li>
        </ul>
      </nav>

      {/* 좁은 화면: 아래쪽 막대. 사이트 공용 버튼과 겹치지 않게 그 위에 띄운다 */}
      <nav
        id="quick-bar"
        aria-label="빠른 메뉴"
        className="fixed bottom-[76px] left-1/2 z-30 w-[min(320px,calc(100%-32px))] -translate-x-1/2 overflow-hidden rounded-[12px] border bg-white shadow-[0_8px_24px_rgba(16,48,47,0.18)] min-[1440px]:hidden"
        style={{ borderColor: C.line }}
      >
        <ul className="grid grid-cols-4 divide-x divide-[#d9e5e3]">
          <li>
            <button type="button" className={`${item} py-2`} onClick={() => go("reserve", "reserve")}>
              <CalendarCheck size={20} aria-hidden style={{ color: C.accent }} />
              예약
            </button>
          </li>
          <li>
            <button type="button" className={`${item} py-2`} onClick={() => linkOut("kakao")}>
              <MessageCircle size={20} aria-hidden style={{ color: "#3c1e1e" }} />
              카카오톡
            </button>
          </li>
          <li>
            <button type="button" className={`${item} py-2`} onClick={() => go("about", "location")}>
              <MapPin size={20} aria-hidden style={{ color: C.accent }} />
              길찾기
            </button>
          </li>
          <li>
            <a href={`tel:${TEL}`} className={`${item} py-2 text-white hover:bg-[#0b6664]`} style={{ backgroundColor: C.accent }}>
              <Phone size={20} aria-hidden />
              전화
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

/* ---------- 메인 ---------- */

/** 배너 아래 진료과목 띠: 이름만 나열한다 */
const SHORTCUTS = TREATMENT_ORDER as Exclude<TreatmentId, "check">[];

function HomePage({ go, reserve, linkOut }: { go: Go; reserve: (id: TreatmentId) => void; linkOut: (w: "naver" | "kakao" | "map") => void }) {
  const NOTICES = useNotices();
  const now = useNow();
  const status = openStatus(now);

  return (
    <>
      {/* 메인 배너 */}
      <section className="relative isolate overflow-hidden" style={{ backgroundColor: C.ink }} aria-labelledby="main-title">
        <Image src={`${IMG}/hero.jpg`} alt="" fill priority sizes="100vw" className="-z-10 object-cover object-[72%_50%]" />
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(90deg, rgba(16,48,47,0.86) 0%, rgba(16,48,47,0.6) 50%, rgba(16,48,47,0.15) 100%)" }} aria-hidden />
        <div className={`${container} pb-14 pt-14 text-white md:pb-20 md:pt-20`}>
          <p className="text-[17px] font-bold" style={{ color: C.onInkMuted }}>
            통합치의학과 · 치과교정과 전문의 진료
          </p>
          <h1 id="main-title" className="mt-2 text-[40px] font-bold leading-[1.15] tracking-[-0.045em] md:text-[56px]">
            {CLINIC}
          </h1>
          <p className="mt-4 text-[18px] md:text-[20px]" style={{ color: C.onInk }}>
            화 · 목 야간진료 21:00까지
            <br className="sm:hidden" />
            <span className="hidden sm:inline">, </span>
            토요일 14:00까지 진료합니다.
          </p>
        </div>
      </section>

      {/* 진료과목 바로가기 */}
      <section id="shortcut" aria-labelledby="shortcut-title" className="border-b" style={{ borderColor: C.line }}>
        <div className={`${container} flex items-stretch`}>
          <h2 id="shortcut-title" className="flex shrink-0 items-center pr-4 text-[16px] font-bold md:pr-6 md:text-[17px]" style={{ color: C.accent }}>
            진료과목
          </h2>
          <ul className="flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
            {SHORTCUTS.map((id) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go("treat", id)}
                  className="flex h-14 items-center border-b-2 border-transparent px-3 text-[16px] font-bold transition-colors hover:border-[#0b6664] hover:text-[#0b6664] md:h-16 md:px-4 md:text-[17px]"
                >
                  {TREATMENT_NAME[id]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 공지사항 · 진료시간 */}
      <section className={`${container} grid gap-x-10 gap-y-8 pb-4 pt-10 md:pt-14 lg:grid-cols-12`} aria-label="병원 소식과 진료시간">
        <div className="min-w-0 lg:col-span-7">
          <div className="flex items-center justify-between border-b-2 pb-3" style={{ borderColor: C.ink }}>
            <h2 className="text-[20px] font-bold tracking-[-0.03em]">공지사항</h2>
            <button type="button" onClick={() => go("community", "notice")} aria-label="공지사항 더보기" className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border" style={{ borderColor: C.line }}>
              <Plus size={16} aria-hidden />
            </button>
          </div>
          <ul>
            {NOTICES.slice(0, 5).map((n) => (
              <li key={n.no} className="border-b" style={{ borderColor: C.line }}>
                <button type="button" onClick={() => go("community", `notice-${n.no}`)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:text-[#0b6664]">
                  <span className="min-w-0 truncate">{n.title}</span>
                  <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                    {n.date}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div id="hours-box" className="rounded-[6px] p-5 md:p-6 lg:col-span-5" style={{ backgroundColor: C.ink, color: C.onInk }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "rgba(238,246,245,0.2)" }}>
            <h2 className="text-[20px] font-bold tracking-[-0.03em]">진료시간</h2>
            {status && (
              <span className="text-[15px] font-bold" style={{ color: status.open ? "#bfe0db" : C.onInkMuted }}>
                {status.text}
              </span>
            )}
          </div>
          <table className="mt-2 w-full">
            <caption className="sr-only">요일별 진료시간</caption>
            <tbody>
              {HOURS_GROUPED.map((h) => (
                <tr key={h.label}>
                  <th scope="row" className="py-2 pr-2 text-left font-normal" style={{ color: C.onInkMuted }}>
                    {h.label}
                  </th>
                  <td className="py-2 text-right tabular-nums">
                    {h.night && <Moon size={14} className="mr-1 inline align-[-1px]" aria-label="야간진료" />}
                    {h.time}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-2 pr-2 text-left font-normal" style={{ color: C.onInkMuted }}>
                  점심시간
                </th>
                <td className="py-2 text-right tabular-nums" style={{ color: C.onInkMuted }}>
                  13:00 ~ 14:00
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[14px]" style={{ color: C.onInkMuted }}>
            토요일은 점심시간 없이 진료합니다. 접수 마감은 진료 종료 30분 전입니다.
          </p>
        </div>
      </section>

      {/* 상담 및 예약 */}
      <section className={`${container} pb-12 md:pb-16`} aria-labelledby="contact-title">
        <div className="flex flex-col gap-x-8 gap-y-4 border-y py-6 md:flex-row md:items-center" style={{ borderColor: C.line }}>
          <div className="shrink-0">
            <h2 id="contact-title" className="text-[16px] font-bold" style={{ color: C.muted }}>
              상담 및 예약
            </h2>
            <a href={`tel:${TEL}`} className="mt-1 inline-flex items-center gap-2 text-[28px] font-bold tracking-[-0.02em] tabular-nums md:text-[30px]">
              <Phone size={22} aria-hidden style={{ color: C.accent }} />
              {TEL}
            </a>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => linkOut("naver")} className={`${btnLine} h-11 px-3 text-[15px]`} style={{ borderColor: C.line }}>
              <NaverMark />
              네이버 예약
            </button>
            <button type="button" onClick={() => linkOut("kakao")} className={`${btnLine} h-11 px-3 text-[15px]`} style={{ borderColor: C.line }}>
              <KakaoMark />
              카카오톡 상담
            </button>
          </div>
          <p className="text-[15px] md:ml-auto md:text-right" style={{ color: C.muted }}>
            {ADDRESS}
            <br />
            ㅁㄹ역 4번 출구 도보 3분, 건물 주차 2시간 무료{" "}
            <button type="button" onClick={() => go("about", "location")} className="font-bold underline underline-offset-2" style={{ color: C.accent }}>
              오시는 길
            </button>
          </p>
        </div>
      </section>

      {/* 증상 자가체크 */}
      <section id="selfcheck" aria-labelledby="selfcheck-title" style={{ backgroundColor: C.mist }}>
        <div className={`${container} py-12 md:py-16`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="selfcheck-title" className={h2}>
              증상 자가체크
            </h2>
            <button type="button" onClick={() => go("symptom", "list")} className="inline-flex items-center text-[15px] font-bold" style={{ color: C.muted }}>
              증상별 안내
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>
          <ToothMap preset={{ select: 36, index: 0 }} onReserve={reserve} />
        </div>
      </section>

      {/* 의료진 */}
      <section className={`${container} py-12 md:py-16`} aria-labelledby="doctors-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="doctors-title" className={h2}>
            의료진 소개
          </h2>
          <button type="button" onClick={() => go("about", "doctors")} className="inline-flex items-center text-[15px] font-bold" style={{ color: C.muted }}>
            의료진 전체 보기
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
        <DoctorList />
      </section>
    </>
  );
}

function DoctorList() {
  return (
    <ul className="mt-8 grid gap-8 md:grid-cols-2">
      {DOCTORS.map((d) => (
        <li key={d.name} className="grid grid-cols-[112px_1fr] gap-5 sm:grid-cols-[160px_1fr] sm:gap-7">
          <span className="relative block aspect-[4/5] overflow-hidden rounded-[10px]" style={{ backgroundColor: C.mint }} aria-hidden>
            <Image src={`${IMG}/${d.img}.jpg`} alt="" fill sizes="160px" className="object-cover" style={{ objectPosition: d.pos }} />
          </span>
          <div className="min-w-0 self-center">
            <p className="text-[15px] font-bold" style={{ color: C.accent }}>
              {d.role}
            </p>
            <h3 className="text-[26px] font-bold leading-[1.3] tracking-[-0.03em]">{d.name}</h3>
            <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
              진료 분야 {d.field}
            </p>
            <ul className="mt-3 space-y-0.5 border-t pt-3 text-[16px]" style={{ borderColor: C.line, color: C.muted }}>
              {d.career.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- 하위 페이지 ---------- */

function SubPage({
  menu,
  sub,
  go,
  reserve,
  preset,
  openSelfcheck,
  reserveTreatment,
  setReserveTreatment,
  linkOut,
}: {
  menu: MenuId;
  sub: string;
  go: Go;
  reserve: (id: TreatmentId) => void;
  preset: Preset;
  openSelfcheck: (p: Preset) => void;
  reserveTreatment: TreatmentId;
  setReserveTreatment: (id: TreatmentId) => void;
  linkOut: (w: "naver" | "kakao" | "map") => void;
}) {
  const m = MENUS.find((x) => x.id === menu)!;
  // 공지 상세는 notice-24 처럼 들어온다
  const noticeNo = sub.startsWith("notice-") ? Number(sub.slice(7)) : null;
  const tabId = noticeNo ? "notice" : sub;
  const s = m.subs.find((x) => x.id === tabId) ?? m.subs[0];
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <div style={{ backgroundColor: C.mint }}>
        <div className={`${container} py-8 md:py-12`}>
          <nav aria-label="현재 위치">
            <ol className="flex flex-wrap items-center gap-1 text-[14px]" style={{ color: C.muted }}>
              <li>
                <button type="button" onClick={() => go("home")} className="inline-flex items-center gap-1 hover:underline">
                  <Home size={14} aria-hidden />홈
                </button>
              </li>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li>{m.label}</li>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="font-bold" style={{ color: C.ink }}>
                {s.label}
              </li>
            </ol>
          </nav>
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-[32px] font-bold leading-[1.25] tracking-[-0.04em] outline-none md:text-[44px]">
            {s.label}
          </h1>
        </div>
      </div>

      {m.subs.length > 1 && (
        <nav aria-label={`${m.label} 하위 메뉴`} className="border-b bg-white" style={{ borderColor: C.line }}>
          <ul className={`${container} flex gap-1 overflow-x-auto`}>
            {m.subs.map((x) => {
              const on = x.id === s.id;
              return (
                <li key={x.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => go(menu, x.id)}
                    aria-current={on ? "page" : undefined}
                    className="relative h-14 px-3 text-[16px] md:px-4"
                    style={{ color: on ? C.accent : C.muted, fontWeight: on ? 700 : 400 }}
                  >
                    {x.label}
                    {on && <span className="absolute inset-x-2 bottom-0 h-[3px]" style={{ backgroundColor: C.accent }} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className={`${container} py-10 md:py-14`}>
        {menu === "about" && s.id === "greeting" && <Greeting />}
        {menu === "about" && s.id === "doctors" && <DoctorList />}
        {menu === "about" && s.id === "tour" && <Tour />}
        {menu === "about" && s.id === "location" && <Location linkOut={linkOut} />}
        {menu === "treat" && <TreatmentDetail id={s.id as Exclude<TreatmentId, "check">} reserve={reserve} />}
        {menu === "symptom" && s.id === "selfcheck" && <ToothMap preset={preset} onReserve={reserve} />}
        {menu === "symptom" && s.id === "list" && <SymptomList openSelfcheck={openSelfcheck} />}
        {menu === "fees" && s.id === "fees" && <Fees />}
        {menu === "fees" && s.id === "insurance" && <Insurance />}
        {menu === "community" && s.id === "notice" && <Notice no={noticeNo} go={go} />}
        {menu === "community" && s.id === "faq" && <FaqList items={FAQ} />}
        {menu === "reserve" && <Reservation treatment={reserveTreatment} onTreatment={setReserveTreatment} />}
      </div>
    </>
  );
}

function Greeting() {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        <div className="space-y-4 text-[18px]" style={{ color: C.muted }}>
          <p>{CLINIC}을 찾아 주셔서 감사합니다.</p>
          <p>치료를 정하기 전에 엑스레이와 구강 사진을 같이 보면서 설명해 드립니다.</p>
          <p>화요일과 목요일은 21:00까지 진료합니다.</p>
        </div>
        <p className="mt-8 font-bold">대표원장 김ㅈ우</p>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] lg:col-span-5" style={{ backgroundColor: C.mint }}>
        <Image src={`${IMG}/doctor2.jpg`} alt="대표원장 김ㅈ우" fill sizes="(min-width:1024px) 480px, 100vw" className="object-cover" style={{ objectPosition: "50% 25%" }} />
      </div>
    </div>
  );
}

function Tour() {
  const photos = [
    { img: "lobby", label: "접수 · 대기 공간" },
    { img: "hero", label: "진료실" },
    { img: "ct", label: "파노라마 · CT 촬영실" },
  ];
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((p) => (
        <li key={p.img}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]" style={{ backgroundColor: C.mint }}>
            <Image src={`${IMG}/${p.img}.jpg`} alt={`${CLINIC} ${p.label}`} fill sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" className="object-cover" />
          </div>
          <p className="mt-3 font-bold">{p.label}</p>
        </li>
      ))}
    </ul>
  );
}

function HoursTable() {
  return (
    <table className="w-full border-t-2" style={{ borderColor: C.ink }}>
      <caption className="sr-only">요일별 진료시간</caption>
      <tbody>
        {HOURS.map((h) => (
          <tr key={h.label} className="border-b" style={{ borderColor: C.line }}>
            <th scope="row" className="py-3 pl-2 pr-3 text-left font-normal">
              {h.label}
            </th>
            <td className="py-3 pr-2 text-right tabular-nums" style={{ color: h.open ? C.ink : C.error }}>
              {"night" in h && h.night && <Moon size={14} className="mr-1 inline align-[-1px]" style={{ color: C.accent }} aria-label="야간진료" />}
              {h.time}
            </td>
          </tr>
        ))}
        <tr className="border-b" style={{ borderColor: C.line }}>
          <th scope="row" className="py-3 pl-2 pr-3 text-left font-normal" style={{ color: C.muted }}>
            점심시간 (평일)
          </th>
          <td className="py-3 pr-2 text-right tabular-nums" style={{ color: C.muted }}>
            13:00 ~ 14:00
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Location({ linkOut }: { linkOut: (w: "naver" | "kakao" | "map") => void }) {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className={h2}>진료시간</h2>
        <div className="mt-5">
          <HoursTable />
        </div>
        <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
          토요일은 점심시간 없이 진료합니다. 접수 마감은 진료 종료 30분 전입니다.
        </p>
      </div>
      <div>
        <h2 className={h2}>오시는 길</h2>
        <p className="mt-5 text-[20px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
        <dl className="mt-4 border-t" style={{ borderColor: C.line }}>
          {[
            ["지하철", "ㅁㄹ역 4번 출구에서 도보 3분"],
            ["버스", "ㅅㅈ타워 정류장 하차"],
            ["주차", "건물 지하 2~4층, 진료 시 2시간 무료"],
            ["전화", TEL],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[72px_1fr] gap-3 border-b py-3" style={{ borderColor: C.line }}>
              <dt className="font-bold">{k}</dt>
              <dd style={{ color: C.muted }}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => linkOut("map")} className={btnLine} style={{ borderColor: C.line }}>
            네이버 지도
          </button>
          <button type="button" onClick={() => linkOut("map")} className={btnLine} style={{ borderColor: C.line }}>
            카카오맵
          </button>
        </div>
      </div>
    </div>
  );
}

function TreatmentDetail({ id, reserve }: { id: Exclude<TreatmentId, "check">; reserve: (id: TreatmentId) => void }) {
  const t = TREATMENT_INFO[id] ?? TREATMENT_INFO.implant;
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[10px] lg:col-span-5" style={{ backgroundColor: C.mint }}>
        <Image src={`${IMG}/${t.img}.jpg`} alt="" fill sizes="(min-width:1024px) 480px, 100vw" className="object-cover" style={{ objectPosition: t.pos ?? "50% 50%" }} />
      </div>
      <div className="min-w-0 lg:col-span-7">
        <p className="text-[19px]">{t.summary}</p>
        <h2 className="mt-8 text-[20px] font-bold">이런 경우 진료합니다</h2>
        <ul className="mt-3 space-y-2">
          {t.cases.map((c) => (
            <li key={c} className="flex gap-2" style={{ color: C.muted }}>
              <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: C.accent }} aria-hidden />
              {c}
            </li>
          ))}
        </ul>
        <InfoGrid visits={t.visits} insurance={t.insurance} cost={t.cost} />
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => reserve(id)} className={btnPrimary} style={{ backgroundColor: C.accent }}>
            {TREATMENT_NAME[id]} 상담 예약
          </button>
          <a href={`tel:${TEL}`} className={btnLine} style={{ borderColor: C.line }}>
            <Phone size={17} aria-hidden />
            전화 상담
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoGrid({ visits, insurance, cost }: { visits: string; insurance: string; cost: string }) {
  return (
    <dl className="mt-5 border-t" style={{ borderColor: C.line }}>
      {[
        ["치료 기간", visits],
        ["보험 적용", insurance],
        ["예상 비용", cost],
      ].map(([k, v]) => (
        <div key={k} className="flex gap-4 border-b py-2.5" style={{ borderColor: C.line }}>
          <dt className="w-20 shrink-0 text-[15px]" style={{ color: C.muted }}>
            {k}
          </dt>
          <dd className="text-[16px] font-bold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function SymptomList({ openSelfcheck }: { openSelfcheck: (p: Preset) => void }) {
  const groups: { label: string; select: Selection; list: Symptom[] }[] = [
    { label: "앞니", select: 11, list: SYMPTOMS.front },
    { label: "어금니", select: 36, list: SYMPTOMS.molar },
    { label: "사랑니", select: 38, list: SYMPTOMS.wisdom },
    { label: "잇몸", select: "gum", list: SYMPTOMS.gum },
  ];
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {groups.map((g) => (
        <section key={g.label} aria-labelledby={`sym-${g.label}`}>
          <h2 id={`sym-${g.label}`} className="border-b-2 pb-2 text-[20px] font-bold" style={{ borderColor: C.ink }}>
            {g.label}
          </h2>
          <ul>
            {g.list.map((s, i) => (
              <li key={s.text} className="border-b" style={{ borderColor: C.line }}>
                <button type="button" onClick={() => openSelfcheck({ select: g.select, index: i })} className="flex w-full items-center justify-between gap-3 py-3.5 text-left hover:text-[#0b6664]">
                  <span className="font-bold">{s.text}</span>
                  <span className="inline-flex shrink-0 items-center text-[14px]" style={{ color: C.muted }}>
                    {TREATMENT_NAME[s.treatment]}
                    <ChevronRight size={15} aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Fees() {
  const today = useDemoToday();
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8">
        <p className="text-[15px]" style={{ color: C.muted }}>
          부가세 포함, {today.getFullYear()}년 {today.getMonth() + 1}월 1일 기준
        </p>
        <div className="mt-4 space-y-8">
          {FEE_GROUPS.map((g) => (
            <section key={g.title} aria-labelledby={`fee-${g.title}`}>
              <h2 id={`fee-${g.title}`} className="text-[20px] font-bold">
                {g.title}
              </h2>
              <table className="mt-3 w-full border-t-2 text-left" style={{ borderColor: C.ink }}>
                <caption className="sr-only">{g.title} 비급여 진료비</caption>
                <thead>
                  <tr className="border-b text-[15px]" style={{ borderColor: C.line, color: C.muted }}>
                    <th scope="col" className="py-2.5 pr-3 font-normal">
                      항목
                    </th>
                    <th scope="col" className="py-2.5 pr-3 text-right font-normal">
                      금액
                    </th>
                    <th scope="col" className="hidden py-2.5 font-normal sm:table-cell">
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((f) => (
                    <tr key={f.item} className="border-b" style={{ borderColor: C.line }}>
                      <th scope="row" className="py-3 pr-3 font-normal">
                        {f.item}
                        {f.note && (
                          <span className="mt-0.5 block text-[14px] sm:hidden" style={{ color: C.muted }}>
                            {f.note}
                          </span>
                        )}
                      </th>
                      <td className="whitespace-nowrap py-3 pr-3 text-right font-bold tabular-nums">{won(f.price)}</td>
                      <td className="hidden py-3 text-[15px] sm:table-cell" style={{ color: C.muted }}>
                        {f.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
        <p className="mt-6 text-[15px]" style={{ color: C.muted }}>
          건강보험 적용 진료비는 위 금액과 따로 계산합니다.
        </p>
      </div>
      <div className="lg:col-span-4">
        <h2 className="text-[20px] font-bold">비용 문의</h2>
        <div className="mt-3">
          <FaqList items={FEE_FAQ} />
        </div>
      </div>
    </div>
  );
}

function Insurance() {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {INSURANCE.map((i) => (
        <li key={i.title} className="rounded-[10px] border p-5" style={{ borderColor: C.line }}>
          <p className="inline-block rounded-[4px] px-2 py-0.5 text-[14px] font-bold" style={{ backgroundColor: C.mint, color: C.accent }}>
            {i.target}
          </p>
          <h2 className="mt-2 text-[20px] font-bold">{i.title}</h2>
          <p className="mt-1" style={{ color: C.muted }}>
            {i.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <ul className="border-t-2" style={{ borderColor: C.ink }}>
      {items.map((f) => (
        <li key={f.q} className="border-b" style={{ borderColor: C.line }}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-4 font-bold [&::-webkit-details-marker]:hidden">
              <span>
                <span className="mr-1.5" style={{ color: C.accent }} aria-hidden>
                  Q.
                </span>
                {f.q}
              </span>
              <ChevronDown size={18} className="mt-1 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" style={{ color: C.muted }} aria-hidden />
            </summary>
            <p className="pb-4 pr-6" style={{ color: C.muted }}>
              {f.a}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}

function Notice({ no, go }: { no: number | null; go: Go }) {
  const NOTICES = useNotices();
  const n = no ? NOTICES.find((x) => x.no === no) : null;
  if (n) {
    return (
      <article>
        <header className="border-b border-t-2 py-4" style={{ borderColor: C.ink }}>
          <h2 className="text-[22px] font-bold">{n.title}</h2>
          <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
            등록일 {n.date}
          </p>
        </header>
        <p className="border-b py-8" style={{ borderColor: C.line }}>
          {n.body}
        </p>
        <button type="button" onClick={() => go("community", "notice")} className={`${btnLine} mt-6`} style={{ borderColor: C.line }}>
          목록
        </button>
      </article>
    );
  }
  return (
    <>
    <p className="mb-2 text-[15px]" style={{ color: C.muted }}>
      총 <b style={{ color: C.ink }}>{NOTICE_TOTAL}</b>건, 1/{Math.ceil(NOTICE_TOTAL / 10)}쪽
    </p>
    <table className="w-full border-t-2" style={{ borderColor: C.ink }}>
      <caption className="sr-only">공지사항 목록</caption>
      <thead>
        <tr className="border-b text-[15px]" style={{ borderColor: C.line, color: C.muted }}>
          <th scope="col" className="hidden w-16 py-3 font-normal sm:table-cell">
            번호
          </th>
          <th scope="col" className="py-3 text-left font-normal">
            제목
          </th>
          <th scope="col" className="w-24 py-3 font-normal sm:w-28">
            등록일
          </th>
        </tr>
      </thead>
      <tbody>
        {NOTICES.map((x) => (
          <tr key={x.no} className="border-b" style={{ borderColor: C.line }}>
            <td className="hidden py-3 text-center tabular-nums sm:table-cell" style={{ color: C.muted }}>
              {x.no}
            </td>
            <td className="py-3">
              <button type="button" onClick={() => go("community", `notice-${x.no}`)} className="text-left hover:text-[#0b6664] hover:underline">
                {x.title}
              </button>
            </td>
            <td className="py-3 text-center text-[14px] tabular-nums" style={{ color: C.muted }}>
              {x.date}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="mt-6 flex justify-center gap-1 text-[15px] tabular-nums" aria-label="쪽 번호">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] px-2" style={n === 1 ? { backgroundColor: C.ink, color: "#fff", fontWeight: 700 } : { color: C.muted }}>
          {n}
        </span>
      ))}
      <span className="inline-flex h-9 items-center px-2" style={{ color: C.muted }}>
        … {Math.ceil(NOTICE_TOTAL / 10)}
      </span>
    </p>
    </>
  );
}

/* ---------- 증상 자가체크 ---------- */

function ToothMap({ preset, onReserve }: { preset: Preset; onReserve: (id: TreatmentId) => void }) {
  const reduce = useReducedMotionSafe();
  const [selected, setSelected] = useState<Selection>(preset.select);
  const [symptomIndex, setSymptomIndex] = useState(preset.index);

  const list = selected === "gum" ? SYMPTOMS.gum : SYMPTOMS[kindOf(selected)];
  const symptom = list[symptomIndex] ?? list[0];
  const title = selected === "gum" ? "잇몸" : toothLabel(selected);

  const select = (next: Selection) => {
    setSelected(next);
    setSymptomIndex(0);
  };

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-6">
        <p className="text-center text-[15px] font-bold" style={{ color: C.muted }}>
          부위 선택
        </p>
        <ArchMap selected={selected} missing={!!symptom.missing} onSelect={select} reduce={reduce} />

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="부위 바로 선택">
          {QUICK.map((q) => {
            const on = q.select === "gum" ? selected === "gum" : selected !== "gum" && kindOf(selected) === kindOf(q.select as number);
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

      <div className="lg:col-span-6">
        <div className="border-t-2 pt-5 lg:pt-6" style={{ borderColor: C.ink }} aria-live="polite">
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
              <h3 className="mt-0.5 text-[26px] font-bold tracking-[-0.035em] md:text-[30px]">{title}</h3>

              <fieldset className="mt-5">
                <legend className="text-[17px] font-bold">증상 선택</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {list.map((s, i) => {
                    const on = i === symptomIndex;
                    return (
                      <button
                        key={s.text}
                        type="button"
                        onClick={() => setSymptomIndex(i)}
                        aria-pressed={on}
                        className="relative inline-flex min-h-11 items-center rounded-[6px] border px-4 py-2 text-left text-[16px] transition-colors"
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
              <p className="text-[24px] font-bold tracking-[-0.03em]">{TREATMENT_NAME[symptom.treatment]}</p>
              <p className="mt-2" style={{ color: C.muted }}>
                {symptom.body}
              </p>
              <InfoGrid visits={symptom.visits} insurance={symptom.insurance} cost={symptom.cost} />
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button type="button" onClick={() => onReserve(symptom.treatment)} className={btnPrimary} style={{ backgroundColor: C.accent }}>
                  {TREATMENT_NAME[symptom.treatment]} 상담 예약
                </button>
                <span className="text-[15px]" style={{ color: C.muted }}>
                  정확한 진단과 비용은 검진 후 안내합니다.
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** 위아래 치아 32개. 고른 치아는 진하게, 같은 종류 치아는 고른 자리에서 퍼져 나가듯 옅게 칠한다 */
function ArchMap({ selected, missing, onSelect, reduce }: { selected: Selection; missing: boolean; onSelect: (s: Selection) => void; reduce: boolean }) {
  const gum = selected === "gum";
  const sel = gum ? null : ARCH.find((t) => t.fdi === selected)!;
  const ease = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <figure id="tooth-map" className="mx-auto mt-2 max-w-[280px] sm:max-w-[360px] lg:max-w-[380px]">
      <svg viewBox="0 0 360 370" className="h-auto w-full touch-manipulation" role="group" aria-label="치아 배열 그림">
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
          // 고른 치아에서 배열을 따라 멀어질수록 늦게 칠한다
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
                rx={Math.round((t.w / 2.6) * 100) / 100}
                fill={fill}
                stroke={isSel || empty ? C.accent : C.toothLine}
                strokeWidth={empty ? 2 : isSel ? 2 : 1.2}
                strokeDasharray={empty ? "4 3" : undefined}
                className="group-hover:stroke-[#0b6664] group-focus-visible:stroke-[#10302f] group-focus-visible:[stroke-width:3]"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: isSel && !empty ? "scale(1.18)" : "scale(1)",
                  transition: reduce ? "none" : `fill 240ms ${ease} ${sameKind ? 60 + distance * 28 : 0}ms, transform 220ms ${ease}, stroke 160ms`,
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

/* ---------- 상담예약 ---------- */

function Reservation({ treatment, onTreatment }: { treatment: TreatmentId; onTreatment: (id: TreatmentId) => void }) {
  const reduce = useReducedMotionSafe();
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
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
  const times = timeOptions(day);
  const dayLabel = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일(${DAY_NAMES[d.getDay()]})`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let msg = "";
    if (name.trim().length < 2) msg = "성함을 입력해 주세요.";
    else if (phone.replace(/\D/g, "").length < 10) msg = "연락처를 정확히 입력해 주세요.";
    else if (!time) msg = "희망 시간을 선택해 주세요.";
    else if (!agree) msg = "개인정보 수집 및 이용에 동의해 주세요.";
    setError(msg);
    if (msg) {
      errorRef.current?.focus();
      return;
    }
    setDone({ name: maskName(name), when: `${dayLabel(day)} ${time.split(" ")[0]}`, treatment: TREATMENT_NAME[treatment] });
  };

  const reset = () => {
    setDone(null);
    setTime("");
    setName("");
    setPhone("");
    setMemo("");
    setAgree(false);
  };

  const field = "mt-2 h-12 w-full rounded-[6px] border bg-white px-3 outline-none focus:border-[#0b6664] focus:ring-2 focus:ring-[#0b6664]/20";

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h2 className="text-[20px] font-bold">진료시간</h2>
        <div className="mt-3">
          <HoursTable />
        </div>
        <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
          진료 시간 중에 확인 전화를 드리고, 통화가 되면 예약이 확정됩니다. 당일 예약은 전화로 문의해 주십시오.
        </p>
        <a href={`tel:${TEL}`} className="mt-4 inline-flex items-center gap-2 text-[24px] font-bold tabular-nums">
          <Phone size={20} aria-hidden style={{ color: C.accent }} />
          {TEL}
        </a>
      </div>

      <div className="rounded-[12px] border p-5 md:p-8 lg:col-span-8" style={{ borderColor: C.line, backgroundColor: C.mist }}>
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
                <path d="M15 27 L23 35 L38 19" fill="none" stroke={C.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-5 text-[24px] font-bold tracking-[-0.03em]">상담 접수가 완료되었습니다</p>
              <p className="mt-3" style={{ color: C.muted }}>
                {done.name} 님, {done.when} {done.treatment} 상담을 접수했습니다.
                <br />
                확인 전화를 드린 뒤 예약이 확정됩니다.
              </p>
              <button type="button" onClick={reset} className={`${btnLine} mt-8`} style={{ borderColor: C.line }}>
                새로 접수
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="font-bold">성함</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.toothLine }} />
                </label>
                <label className="block">
                  <span className="font-bold">연락처</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                    className={field}
                    style={{ borderColor: C.toothLine }}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-bold">희망 진료</span>
                  <select value={treatment} onChange={(e) => onTreatment(e.target.value as TreatmentId)} className={field} style={{ borderColor: C.toothLine }}>
                    {RESERVE_ITEMS.map((id) => (
                      <option key={id} value={id}>
                        {TREATMENT_NAME[id]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="mt-6">
                <legend className="font-bold">희망 날짜</legend>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {days.map((d, i) => {
                    const on = i === dayIndex;
                    return (
                      <label
                        key={d.toDateString()}
                        className="relative flex h-16 cursor-pointer flex-col items-center justify-center rounded-[6px] border has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
                        style={{ borderColor: on ? C.ink : C.line, backgroundColor: on ? C.ink : "#fff", color: on ? "#fff" : C.ink }}
                      >
                        <input
                          type="radio"
                          name="day"
                          checked={on}
                          onChange={() => {
                            setDayIndex(i);
                            setTime("");
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

              <label className="mt-6 block">
                <span className="font-bold">희망 시간</span>
                <select value={time} onChange={(e) => setTime(e.target.value)} className={field} style={{ borderColor: C.toothLine }}>
                  <option value="">선택</option>
                  {times.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-6 block">
                <span className="font-bold">상담 내용</span>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={4}
                  placeholder="불편한 부위와 증상"
                  className="mt-2 w-full rounded-[6px] border bg-white px-3 py-2.5 outline-none focus:border-[#0b6664] focus:ring-2 focus:ring-[#0b6664]/20"
                  style={{ borderColor: C.toothLine }}
                />
              </label>

              <label className="mt-5 flex items-start gap-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#0b6664]" />
                <span>
                  개인정보 수집 및 이용에 동의합니다.{" "}
                  <span className="text-[15px]" style={{ color: C.muted }}>
                    (성함, 연락처 / 상담 후 6개월 보관)
                  </span>
                </span>
              </label>

              <p ref={errorRef} tabIndex={-1} className="mt-4 min-h-[1.5em] text-[16px] font-bold outline-none" style={{ color: C.error }} aria-live="polite">
                {error}
              </p>

              <button type="submit" className={`${btnPrimary} mt-2 w-full sm:w-auto sm:px-12`} style={{ backgroundColor: C.accent }}>
                상담 접수
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 바닥글 ---------- */

function SiteFooter({ go }: { go: Go }) {
  return (
    <footer style={{ backgroundColor: C.ink, color: C.onInkMuted }}>
      <div className="border-b" style={{ borderColor: "rgba(238,246,245,0.14)" }}>
        <ul className={`${container} flex flex-wrap gap-x-5 gap-y-1 py-4 text-[15px]`}>
          <li>
            <button type="button" className="font-bold hover:underline" style={{ color: C.onInk }}>
              개인정보처리방침
            </button>
          </li>
          <li>
            <button type="button" className="hover:underline">
              이용약관
            </button>
          </li>
          <li>
            <button type="button" onClick={() => go("fees", "fees")} className="hover:underline">
              비급여진료수가표
            </button>
          </li>
          <li>
            <button type="button" onClick={() => go("about", "location")} className="hover:underline">
              오시는 길
            </button>
          </li>
        </ul>
      </div>
      <div className={`${container} py-8 pb-48 min-[1440px]:pb-24`}>
        <p style={{ color: C.onInk }}>
          <BrandLogo />
        </p>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
          {[
            ["상호", "ㅁㅇ치과의원"],
            ["대표자", "김ㅈ우"],
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
        <p className="mt-6 text-[15px]">© ㅁㅇ치과의원</p>
      </div>
    </footer>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function BrandLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="text-[20px] font-bold tracking-[-0.03em]">곰파트너</span>
        <span className="text-[12px] font-semibold opacity-75">치과의원</span>
      </span>
    </span>
  );
}
