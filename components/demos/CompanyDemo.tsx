"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronRight, CircleAlert, ClipboardList, Cog, FileUp, House, Menu, Package, Ruler, RotateCcw, Trash2, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 기업 홈페이지 데모: 가상의 (주)○○정밀, CNC 정밀 가공 제조업체.
   회사명, 대표자, 주소, 전화번호, 사업자 정보, 설비 모델명, 제조사, 거래처, 인증 기관은 모두 가상이다.

   구성: 실제 중소 제조업 홈페이지처럼 서브페이지 구조로 만들었다. 메뉴는 회사소개, 사업분야, 설비현황, 생산제품, 고객지원.
   넓은 화면에서는 메뉴에 마우스를 올리거나 키보드로 들어가면 2단 메뉴판이 한꺼번에 펼쳐진다.
   하위 화면은 라우트를 따로 두지 않고 상태로 바꾸며, 위치 표시(HOME > 설비현황 > 기계설비)와 상단 하위 메뉴 탭, 표 중심 본문을 쓴다.
   메인은 사진 배너, 바로가기 4개, 주요 생산제품, 인증현황 띠, 공지사항·고객센터·오시는 길 3칸으로 짧게 둔다.

   디자인: 철판 같은 짙은 회색(#1e2329)과 옅은 회색(#f2f3f5)에 안전 주황(#f26a1b) 하나만 쓴다.
   모서리는 4~6px로 각지게, 치수와 사양 숫자는 고정폭 숫자로 맞춘다.

   맨 위 띠의 KOR/ENG는 같은 화면의 문구를 바꾸고, 바깥 div의 lang도 함께 바꾼다.
   가공 가능 범위(설비현황 아래)는 소재, 크기, 공차, 수량을 넣으면 설비 가공 범위와 비교해 가공 가능 또는 상담 필요를 이유와 함께 보여 주고,
   쓸 설비와 대략적인 납기, 축척대로 그린 부품 그림을 낸다. 결과에서 견적문의로 넘어가면 조건이 문의 내용에 들어간다.
   기계설비 표의 가공품 버튼은 그 설비로 만드는 생산제품만 걸러 보여 준다.
   견적문의는 도면 파일을 골라도 이름과 크기만 보여 주고 어디에도 올리지 않으며, 접수번호와 가린 담당자 정보로 끝난다.
   오시는 길은 승용차 방문과 화물 납품을 탭으로 나누고, 화물 납품에 하역장 운영 시간을 둔다.

   사진 출처(public/images/demo-company):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, parts */

const IMG = "/images/demo-company";
const TEL = "031-000-0000";
const FAX = "031-000-0001";
const MAIL_QUOTE = "sales@example.com";
const MAIL_INFO = "info@example.com";

const C = {
  steel: "#1e2329",
  steel2: "#2a3038",
  steelLine: "#3a424c",
  gray: "#f2f3f5",
  white: "#ffffff",
  ink: "#1e2329",
  muted: "#59616b",
  line: "#d8dbe0",
  grid: "#e4e6ea",
  orange: "#f26a1b",
  orangeText: "#b8480a",
  ok: "#1d6f45",
  error: "#b3261e",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const GRID_DARK = {
  backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

/* ---------- 언어, 화면 상태 ---------- */

type Lang = "ko" | "en";
type L = { ko: string; en: string };
const l = (ko: string, en: string): L => ({ ko, en });

type MenuId = "about" | "business" | "equipment" | "products" | "support";
type Route = { m: MenuId | "home"; s: string };

type MachineKey = "vmc" | "large" | "fiveAx" | "lathe" | "turnMill";
type Material = "al" | "sus" | "steel" | "plastic";
type Tol = "0.1" | "0.05" | "0.01";
type PrCat = "semi" | "medical" | "battery" | "robot";

interface Ctx {
  lang: Lang;
  x: (ko: string, en: string) => string;
  s: (v: L) => string;
  route: Route;
  go: (m: MenuId | "home", s?: string) => void;
  memo: string;
  setMemo: (v: string) => void;
  prMachine: MachineKey | null;
  setPrMachine: (v: MachineKey | null) => void;
  visitTab: VisitTab;
  setVisitTab: (v: VisitTab) => void;
}

type VisitTab = "car" | "truck";

const CoCtx = createContext<Ctx | null>(null);
function useCo() {
  const c = useContext(CoCtx);
  if (!c) throw new Error("CompanyDemo context");
  return c;
}

const MENUS: { id: MenuId; label: L; subs: { id: string; label: L }[] }[] = [
  {
    id: "about",
    label: l("회사소개", "Company"),
    subs: [
      { id: "greeting", label: l("인사말", "CEO Message") },
      { id: "overview", label: l("회사개요", "Overview") },
      { id: "history", label: l("연혁", "History") },
      { id: "certs", label: l("인증현황", "Certifications") },
      { id: "location", label: l("오시는 길", "Location") },
    ],
  },
  {
    id: "business",
    label: l("사업분야", "Business"),
    subs: [
      { id: "lathe", label: l("CNC 선반 가공", "CNC Turning") },
      { id: "mct", label: l("MCT 가공", "MCT Machining") },
      { id: "fiveAx", label: l("5축 가공", "5-Axis Machining") },
    ],
  },
  {
    id: "equipment",
    label: l("설비현황", "Facilities"),
    subs: [
      { id: "machines", label: l("기계설비", "Machining Equipment") },
      { id: "measuring", label: l("측정설비", "Measuring Equipment") },
      { id: "range", label: l("가공 가능 범위", "Machinable Range") },
    ],
  },
  {
    id: "products",
    label: l("생산제품", "Products"),
    subs: [
      { id: "all", label: l("전체", "All") },
      { id: "semi", label: l("반도체 장비", "Semiconductor") },
      { id: "medical", label: l("의료기기", "Medical") },
      { id: "battery", label: l("2차전지 장비", "Battery Equipment") },
      { id: "robot", label: l("로봇·자동화", "Robotics") },
    ],
  },
  {
    id: "support",
    label: l("고객지원", "Support"),
    subs: [
      { id: "notice", label: l("공지사항", "Notice") },
      { id: "quote", label: l("견적문의", "Request a Quote") },
    ],
  },
];

const COMPANY = l("(주)○○정밀", "○○ Precision Co., Ltd.");
const ADDRESS = l("□□시 □□구 □□산단로 00", "00 □□sandan-ro, □□-gu, □□-si");
const HOURS = l("평일 08:30 ~ 17:30, 토·일·공휴일 휴무", "Weekdays 08:30 to 17:30, closed on weekends and holidays");

/* ---------- 도우미 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘은 김ㅎ늘, 두 글자는 김* */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return `${chars[0]}*`;
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (n: number) => n.toLocaleString("en-US");

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ---------- 데이터 ---------- */

const MACHINE_NAME: Record<MachineKey, L> = {
  vmc: l("수직 머시닝센터", "vertical machining center"),
  large: l("대형 수직 머시닝센터", "large vertical machining center"),
  fiveAx: l("5축 가공기", "5-axis machining center"),
  lathe: l("CNC 선반", "CNC lathe"),
  turnMill: l("복합 선반", "turn-mill center"),
};

type EqType = "mc" | "fiveAx" | "lathe";

interface Machine {
  type: EqType;
  mk: MachineKey;
  name: string;
  maker: L;
  spec: L;
  spindle: string;
  count: number;
  year: number;
}

const MACHINES: Machine[] = [
  { type: "mc", mk: "vmc", name: "VMC-850", maker: l("△△공작기계 (국내)", "△△ Machine Tools (Korea)"), spec: l("X850 × Y500 × Z500 mm", "X850 × Y500 × Z500 mm"), spindle: "12,000 rpm", count: 4, year: 2016 },
  { type: "mc", mk: "large", name: "VMC-1300", maker: l("△△공작기계 (국내)", "△△ Machine Tools (Korea)"), spec: l("X1,300 × Y650 × Z600 mm", "X1,300 × Y650 × Z600 mm"), spindle: "8,000 rpm", count: 2, year: 2019 },
  { type: "mc", mk: "vmc", name: "HSC-500", maker: l("△△ (일본)", "△△ (Japan)"), spec: l("X500 × Y400 × Z300 mm", "X500 × Y400 × Z300 mm"), spindle: "24,000 rpm", count: 1, year: 2021 },
  { type: "fiveAx", mk: "fiveAx", name: "5AX-600", maker: l("△△ (독일)", "△△ (Germany)"), spec: l("X600 × Y500 × Z400 mm, A ±120°, C 360°", "X600 × Y500 × Z400 mm, A ±120°, C 360°"), spindle: "20,000 rpm", count: 3, year: 2018 },
  { type: "lathe", mk: "lathe", name: "TL-300", maker: l("△△기공 (국내)", "△△ Machinery (Korea)"), spec: l("최대 Ø300 × 길이 500 mm", "Max. Ø300 × L500 mm"), spindle: "4,500 rpm", count: 5, year: 2016 },
  { type: "lathe", mk: "turnMill", name: "TM-200", maker: l("△△ (일본)", "△△ (Japan)"), spec: l("최대 Ø200 × 길이 400 mm, Y축, 부 주축", "Max. Ø200 × L400 mm, Y-axis, sub spindle"), spindle: "6,000 rpm", count: 2, year: 2022 },
];

const MEASURES: { name: L; maker: L; range: L; acc: L; count: number; year: number }[] = [
  { name: l("3차원 측정기 CMM-7106", "CMM 7106"), maker: l("△△ (독일)", "△△ (Germany)"), range: l("X700 × Y1,000 × Z600 mm", "X700 × Y1,000 × Z600 mm"), acc: l("1.9 + L/300 µm", "1.9 + L/300 µm"), count: 1, year: 2022 },
  { name: l("윤곽·표면 거칠기 측정기", "Contour and roughness tester"), maker: l("△△ (일본)", "△△ (Japan)"), range: l("측정 길이 100 mm", "Stroke 100 mm"), acc: l("Ra 0.01 µm까지", "Down to Ra 0.01 µm"), count: 1, year: 2022 },
  { name: l("비접촉 영상 측정기", "Vision measuring system"), maker: l("△△ (국내)", "△△ (Korea)"), range: l("X300 × Y200 mm", "X300 × Y200 mm"), acc: l("±2.5 µm", "±2.5 µm"), count: 1, year: 2023 },
  { name: l("하이트 게이지", "Height gauge"), maker: l("△△ (일본)", "△△ (Japan)"), range: l("높이 600 mm", "Height 600 mm"), acc: l("±1.1 µm", "±1.1 µm"), count: 2, year: 2017 },
];

const MACHINE_TOTAL = MACHINES.reduce((n, m) => n + m.count, 0);

const PRODUCTS: { cat: PrCat; name: L; material: L; tol: string; mk: MachineKey; qty: L }[] = [
  { cat: "semi", name: l("웨이퍼 이송 로봇 암 블록", "Wafer transfer robot arm block"), material: l("알루미늄 6061, 경질 아노다이징", "Al 6061, hard anodized"), tol: "±0.02", mk: "fiveAx", qty: l("월 120개", "120 / month") },
  { cat: "medical", name: l("수술 기구 연결 커넥터", "Surgical instrument connector"), material: l("스테인리스 630", "SUS 630"), tol: "±0.01", mk: "turnMill", qty: l("로트당 500개", "500 / lot") },
  { cat: "battery", name: l("전극 노칭 금형 베이스", "Electrode notching die base"), material: l("공구강 SKD11, 열처리 후 가공", "Tool steel SKD11, machined after hardening"), tol: "±0.01", mk: "fiveAx", qty: l("주문 생산", "Made to order") },
  { cat: "robot", name: l("협동 로봇 감속기 하우징", "Cobot reducer housing"), material: l("알루미늄 7075", "Al 7075"), tol: "±0.02", mk: "fiveAx", qty: l("월 250개", "250 / month") },
  { cat: "semi", name: l("진공 챔버 포트 플랜지", "Vacuum chamber port flange"), material: l("스테인리스 316L, Ra 0.8", "SUS 316L, Ra 0.8"), tol: "±0.03", mk: "lathe", qty: l("월 300개", "300 / month") },
  { cat: "medical", name: l("진단 장비 시료 트레이", "Diagnostic analyzer sample tray"), material: l("PEEK", "PEEK"), tol: "±0.05", mk: "vmc", qty: l("월 200개", "200 / month") },
  { cat: "battery", name: l("롤 프레스 베어링 하우징", "Roll press bearing housing"), material: l("탄소강 S45C", "Carbon steel S45C"), tol: "±0.02", mk: "large", qty: l("월 40개", "40 / month") },
  { cat: "robot", name: l("비전 검사기 카메라 브래킷", "Vision inspection camera bracket"), material: l("알루미늄 6061, 흑색 아노다이징", "Al 6061, black anodized"), tol: "±0.05", mk: "vmc", qty: l("월 600개", "600 / month") },
];

const PR_CATS: Record<PrCat, L> = {
  semi: l("반도체 장비", "Semiconductor"),
  medical: l("의료기기", "Medical"),
  battery: l("2차전지 장비", "Battery equipment"),
  robot: l("로봇·자동화", "Robotics"),
};

const HISTORY: { year: number; items: L[] }[] = [
  { year: 2024, items: [l("ISO 13485 인증, 의료기기 부품 가공 시작", "ISO 13485 certified, began machining medical device parts")] },
  { year: 2023, items: [l("ISO 14001 인증", "ISO 14001 certified"), l("비접촉 영상 측정기 도입", "Added a vision measuring system")] },
  { year: 2022, items: [l("항온 가공실과 3차원 측정실 구축", "Built the temperature-controlled machining room and CMM room"), l("복합 선반 2대 도입", "Added two turn-mill centers")] },
  { year: 2021, items: [l("뿌리기업 확인 (정밀가공 분야)", "Confirmed as a root industry company (precision machining)")] },
  { year: 2020, items: [l("기업부설연구소 설립", "Opened the in-house R&D center")] },
  { year: 2018, items: [l("5축 가공기 도입, 반도체 장비 부품 납품 시작", "Added 5-axis machines, began supplying semiconductor equipment parts")] },
  { year: 2016, items: [l("□□산업단지 지금 공장으로 이전", "Moved to the current plant in □□ Industrial Complex")] },
  { year: 2014, items: [l("ISO 9001 인증", "ISO 9001 certified")] },
  { year: 2012, items: [l("법인 전환, (주)○○정밀로 상호 변경", "Incorporated as ○○ Precision Co., Ltd.")] },
  { year: 2009, items: [l("□□시에서 머시닝센터 2대로 창업", "Founded in □□ with two machining centers")] },
];

const CERTS: { name: L; scope: L; org: L; year: number }[] = [
  { name: l("ISO 9001", "ISO 9001"), scope: l("품질경영시스템", "Quality management system"), org: l("△△인증원", "△△ Certification"), year: 2014 },
  { name: l("ISO 14001", "ISO 14001"), scope: l("환경경영시스템", "Environmental management system"), org: l("△△인증원", "△△ Certification"), year: 2023 },
  { name: l("ISO 13485", "ISO 13485"), scope: l("의료기기 품질경영시스템", "Medical device quality management"), org: l("△△인증원", "△△ Certification"), year: 2024 },
  { name: l("기업부설연구소", "In-house R&D center"), scope: l("연구개발전담 조직 인정", "Recognized R&D organization"), org: l("△△협회", "△△ Association"), year: 2020 },
  { name: l("뿌리기업", "Root industry company"), scope: l("정밀가공 분야 확인", "Precision machining"), org: l("△△진흥원", "△△ Agency"), year: 2021 },
];

const NOTICES: { title: L; date: string; body: L }[] = [
  {
    title: l("추석 연휴 휴무 및 출하 일정 안내", "Chuseok holiday closure and shipping schedule"),
    date: "2026-09-22",
    body: l(
      "10월 3일부터 10월 9일까지 휴무합니다. 9월 30일까지 출하 예정인 제품은 일정대로 보내 드리고, 연휴 중 들어온 견적문의는 10월 12일부터 차례로 회신합니다.",
      "We are closed from October 3 to 9. Orders due by September 30 ship as scheduled, and quote requests received during the holiday are answered from October 12.",
    ),
  },
  {
    title: l("하계 휴가 기간 하역장 운영 안내", "Loading dock hours during summer vacation"),
    date: "2026-07-24",
    body: l("8월 3일부터 8월 5일까지 하역장은 오전 9시부터 12시까지만 운영합니다. 화물 납품은 전날까지 전화로 예약해 주시기 바랍니다.", "From August 3 to 5 the loading dock is open 09:00 to 12:00 only. Please book deliveries by phone the day before."),
  },
  {
    title: l("ISO 13485 사후 심사 완료", "ISO 13485 surveillance audit completed"),
    date: "2026-06-18",
    body: l("의료기기 품질경영시스템 사후 심사를 지적 사항 없이 마쳤습니다.", "The surveillance audit for our medical device quality management system was completed with no findings."),
  },
  {
    title: l("견적문의 메일 주소 분리 안내", "Separate email addresses for quotes"),
    date: "2026-04-01",
    body: l(`가공 견적은 ${MAIL_QUOTE}, 그 밖의 문의는 ${MAIL_INFO}로 보내 주시기 바랍니다.`, `Please send machining quote requests to ${MAIL_QUOTE} and other inquiries to ${MAIL_INFO}.`),
  },
  {
    title: l("홈페이지 개편 안내", "Website renewal"),
    date: "2026-03-02",
    body: l("설비현황과 생산제품 정보를 새로 정리하고, 견적문의에 도면 첨부 기능을 더했습니다.", "Facility and product information has been updated, and drawings can now be attached to quote requests."),
  },
];

const BUSINESS: Record<string, { desc: L; rows: [L, L][]; machines: MachineKey[] }> = {
  lathe: {
    desc: l(
      "CNC 선반과 Y축·부 주축을 갖춘 복합 선반으로 축, 플랜지, 커넥터 같은 원통형 부품을 가공합니다. 밀링이 필요한 형상도 한 번 물려 가공을 마칩니다.",
      "CNC lathes and turn-mill centers with a Y-axis and sub spindle machine cylindrical parts such as shafts, flanges and connectors. Milled features are finished in the same setup.",
    ),
    rows: [
      [l("최대 가공 크기", "Max. size"), l("Ø300 × 길이 500 mm", "Ø300 × L500 mm")],
      [l("공차", "Tolerance"), l("±0.01 mm (Ø200 이하)", "±0.01 mm (up to Ø200)")],
      [l("주요 소재", "Materials"), l("스테인리스, 탄소강, 알루미늄, 황동, PEEK", "Stainless, carbon steel, aluminum, brass, PEEK")],
    ],
    machines: ["lathe", "turnMill"],
  },
  mct: {
    desc: l(
      "수직 머시닝센터로 블록, 하우징, 베이스 플레이트 같은 각형 부품을 가공합니다. 길이 1,300mm 대형 부품까지 가공합니다.",
      "Vertical machining centers produce prismatic parts such as blocks, housings and base plates, up to 1,300 mm long.",
    ),
    rows: [
      [l("최대 가공 크기", "Max. size"), l("1,300 × 650 × 600 mm", "1,300 × 650 × 600 mm")],
      [l("공차", "Tolerance"), l("±0.02 mm", "±0.02 mm")],
      [l("주요 소재", "Materials"), l("알루미늄, 탄소강, 공구강, 엔지니어링 플라스틱", "Aluminum, carbon steel, tool steel, engineering plastics")],
    ],
    machines: ["vmc", "large"],
  },
  fiveAx: {
    desc: l(
      "5축 가공기로 여러 면에 경사 구멍과 곡면이 있는 부품을 한 번에 가공합니다. ±0.01mm 공차 부품은 항온 가공실에서 가공하고 3차원 측정기로 전수 검사합니다.",
      "5-axis machines finish parts with angled holes and curved faces on several sides in one setup. ±0.01 mm parts are machined in the temperature-controlled room and fully inspected on the CMM.",
    ),
    rows: [
      [l("최대 가공 크기", "Max. size"), l("600 × 500 × 400 mm", "600 × 500 × 400 mm")],
      [l("공차", "Tolerance"), l("±0.01 mm", "±0.01 mm")],
      [l("주요 소재", "Materials"), l("알루미늄 7075, 스테인리스, 열처리 공구강", "Al 7075, stainless, hardened tool steel")],
    ],
    machines: ["fiveAx"],
  },
};

/* ---------- 페이지 ---------- */

export function CompanyDemo() {
  const [lang, setLang] = useState<Lang>("ko");
  const [route, setRoute] = useState<Route>({ m: "home", s: "" });
  const [memo, setMemo] = useState("");
  const [prMachine, setPrMachine] = useState<MachineKey | null>(null);
  const [visitTab, setVisitTab] = useState<VisitTab>("car");
  const moved = useRef(false);

  const go = (m: MenuId | "home", s?: string) => {
    const sub = m === "home" ? "" : (s ?? MENUS.find((n) => n.id === m)!.subs[0].id);
    if (m !== "products") setPrMachine(null);
    moved.current = true;
    setRoute({ m, s: sub });
    window.scrollTo({ top: 0 });
  };

  const key = `${route.m}/${route.s}`;
  useEffect(() => {
    if (!moved.current) return;
    document.getElementById("co-page-title")?.focus({ preventScroll: true });
  }, [key]);

  const ctx: Ctx = {
    lang,
    x: (ko, en) => (lang === "ko" ? ko : en),
    s: (v) => v[lang],
    route,
    go,
    memo,
    setMemo,
    prMachine,
    setPrMachine,
    visitTab,
    setVisitTab,
  };

  return (
    <CoCtx.Provider value={ctx}>
      <div lang={lang} className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
        <TopBar onLang={setLang} />
        <Header />
        <main>{route.m === "home" ? <Home /> : <SubPage key={key} m={route.m} s={route.s} />}</main>
        <Footer />
      </div>
    </CoCtx.Provider>
  );
}

/* ---------- 로고, 맨 위 띠, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  const { s } = useCo();
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2.5">
      <svg className="shrink-0" width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect x="1" y="1" width="28" height="28" rx="4" fill={light ? C.white : C.steel} />
        <circle cx="15" cy="15" r="7.5" fill="none" stroke={C.orange} strokeWidth="2.4" />
        <path d="M15 4.5 V10 M15 20 V25.5 M4.5 15 H10 M20 15 H25.5" stroke={light ? C.steel : C.white} strokeWidth="1.6" />
      </svg>
      <span className="truncate text-[17px] font-bold tracking-[-0.02em] sm:text-[19px]">{s(COMPANY)}</span>
    </span>
  );
}

function TopBar({ onLang }: { onLang: (v: Lang) => void }) {
  const { lang, x } = useCo();
  return (
    <div className="px-4 md:px-6" style={{ background: C.steel, color: "#c9ced6" }}>
      <div className="mx-auto flex h-10 max-w-[1200px] items-center justify-between gap-3 text-[13px]">
        <p className="min-w-0 truncate tabular-nums">
          <span className="sm:hidden">
            {x("전화", "Tel")} {TEL}
          </span>
          <span className="hidden sm:inline">
            {x("대표전화", "Tel")} {TEL}
            <span className="mx-2 opacity-40" aria-hidden>
              |
            </span>
            {x("팩스", "Fax")} {FAX}
          </span>
        </p>
        <div id="co-lang" role="group" aria-label={x("언어 선택", "Language")} className="flex shrink-0 items-center">
          {(
            [
              ["ko", "KOR"],
              ["en", "ENG"],
            ] as const
          ).map(([v, label], i) => (
            <span key={v} className="flex items-center">
              {i > 0 && (
                <span className="opacity-40" aria-hidden>
                  |
                </span>
              )}
              <button
                type="button"
                lang={v}
                aria-pressed={lang === v}
                aria-label={v === "ko" ? "한국어" : "English"}
                onClick={() => onLang(v)}
                className="inline-flex h-10 items-center px-2.5 font-bold tracking-[0.04em]"
                style={{ color: lang === v ? C.orange : "#c9ced6" }}
              >
                {label}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { x, s, go, route } = useCo();
  const [mega, setMega] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!mega && !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMega(false);
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mega, open]);

  const pick = (m: MenuId, sub?: string) => {
    setMega(false);
    setOpen(false);
    go(m, sub);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white" style={{ borderColor: C.line }} onMouseLeave={() => setMega(false)}>
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <button type="button" onClick={() => go("home")} aria-label={`${s(COMPANY)} ${x("처음으로", "home")}`} className="flex min-w-0">
          <Logo />
        </button>

        <nav
          aria-label={x("주 메뉴", "Main menu")}
          className="relative hidden h-full xl:block"
          onMouseEnter={() => setMega(true)}
          onFocus={() => setMega(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMega(false);
          }}
        >
          <ul className="flex h-full">
            {MENUS.map((m) => {
              const on = route.m === m.id;
              return (
                <li key={m.id} className="w-[136px]">
                  <button
                    type="button"
                    onClick={() => pick(m.id)}
                    aria-current={on ? "true" : undefined}
                    className="relative flex h-full w-full items-center justify-center text-[17px] font-bold"
                    style={{ color: on ? C.orangeText : C.ink }}
                  >
                    {s(m.label)}
                    {on && <span className="absolute inset-x-6 bottom-0 h-[3px]" style={{ background: C.orange }} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
          {mega && (
            <div className="absolute left-0 top-full z-10 flex">
              {MENUS.map((m) => (
                <ul key={m.id} className="h-[228px] w-[136px] border-l px-2 py-4 last:border-r" style={{ borderColor: C.line }}>
                  {m.subs.map((sub) => {
                    const on = route.m === m.id && route.s === sub.id;
                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => pick(m.id, sub.id)}
                          aria-current={on ? "page" : undefined}
                          className="w-full rounded-[4px] px-2 py-1.5 text-center text-[15px] leading-[1.4] hover:bg-[#f2f3f5] hover:text-[#b8480a]"
                          style={{ color: on ? C.orangeText : C.muted, fontWeight: on ? 700 : 400 }}
                        >
                          {s(sub.label)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => pick("support", "quote")} className="hidden h-11 items-center rounded-[4px] px-4 text-[15px] font-bold md:inline-flex" style={{ background: C.orange, color: C.steel }}>
            {x("견적문의", "Request a Quote")}
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] xl:hidden"
            aria-label={open ? x("메뉴 닫기", "Close menu") : x("메뉴 열기", "Open menu")}
            aria-expanded={open}
            aria-controls="company-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
      </div>

      {mega && <div className="absolute inset-x-0 top-full hidden h-[228px] border-b bg-white shadow-[0_8px_16px_rgba(30,35,41,0.08)] xl:block" style={{ borderColor: C.line }} aria-hidden />}

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="company-menu"
            aria-label={x("주 메뉴", "Main menu")}
            className="max-h-[calc(100vh-72px)] overflow-y-auto border-t xl:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="mx-auto max-w-[1200px] px-4 pb-4 md:px-6">
              {MENUS.map((m) => (
                <li key={m.id} className="border-b py-3" style={{ borderColor: C.gray }}>
                  <p className="text-[17px] font-bold">{s(m.label)}</p>
                  <ul className="mt-1 grid grid-cols-2 gap-x-3">
                    {m.subs.map((sub) => (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => pick(m.id, sub.id)}
                          aria-current={route.m === m.id && route.s === sub.id ? "page" : undefined}
                          className="flex min-h-11 w-full items-center text-left text-[15px]"
                          style={{ color: route.m === m.id && route.s === sub.id ? C.orangeText : C.muted }}
                        >
                          {s(sub.label)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li className="pt-3">
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-bold tabular-nums" style={{ color: C.orangeText }}>
                  {x("전화", "Call")} {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 메인 ---------- */

function Home() {
  const { x, s, go } = useCo();

  const specs = [
    { k: x("최소 공차", "Tightest tolerance"), v: "±0.01", u: "mm" },
    { k: x("최대 가공 크기", "Max. part size"), v: "1,300×650×600", u: "mm" },
    { k: x("선반 최대 지름", "Max. turning dia."), v: "Ø300", u: "mm" },
    { k: x("보유 가공 설비", "Machines"), v: String(MACHINE_TOTAL), u: x("대", "units") },
  ];

  const quick = [
    { icon: Cog, title: x("기계설비현황", "Equipment"), sub: x(`가공 설비 ${MACHINE_TOTAL}대`, `${MACHINE_TOTAL} machines`), to: () => go("equipment", "machines") },
    { icon: Ruler, title: x("가공 가능 범위", "Machinable Range"), sub: x("소재·크기·공차별 가공 설비", "Machine by material, size, tolerance"), to: () => go("equipment", "range") },
    { icon: Package, title: x("생산제품", "Products"), sub: x("반도체·의료·2차전지·로봇", "Semicon, medical, battery, robotics"), to: () => go("products", "all") },
    { icon: ClipboardList, title: x("견적문의", "Request a Quote"), sub: x("도면 첨부 접수", "Attach your drawing"), to: () => go("support", "quote") },
  ];

  const featured = (["semi", "medical", "battery", "robot"] as const).map((c) => PRODUCTS.find((p) => p.cat === c)!);

  return (
    <>
      <section aria-labelledby="co-page-title" className="relative overflow-hidden" style={{ background: C.steel, color: C.white }}>
        <Image src={`${IMG}/hero.jpg`} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(20,24,29,0.9) 0%, rgba(20,24,29,0.72) 55%, rgba(20,24,29,0.45) 100%)" }} aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-4 pb-24 pt-14 md:px-6 md:pb-32 md:pt-24">
          <h1 id="co-page-title" tabIndex={-1} className="text-[34px] font-bold leading-[1.25] tracking-[-0.03em] outline-none md:text-[52px]">
            {s(COMPANY)}
          </h1>
          <p className="mt-3 text-[18px] font-bold md:text-[22px]" style={{ color: C.orange }}>
            {x("CNC 선반ㆍMCTㆍ5축 정밀부품 가공", "CNC turning, MCT and 5-axis precision parts")}
          </p>
          <p className="mt-4 max-w-[560px] text-[16px] md:text-[18px]" style={{ color: "#d4d8de" }}>
            {x("반도체 장비, 의료기기, 2차전지 설비 부품을 시제품 1개부터 양산까지 가공합니다.", "We machine parts for semiconductor equipment, medical devices and battery lines, from a single prototype to volume production.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => go("equipment", "machines")} className="inline-flex h-12 items-center rounded-[4px] px-6 font-bold" style={{ background: C.orange, color: C.steel }}>
              {x("설비현황 보기", "View Facilities")}
            </button>
            <button type="button" onClick={() => go("support", "quote")} className="inline-flex h-12 items-center rounded-[4px] border px-6 font-bold" style={{ borderColor: "rgba(255,255,255,0.5)", color: C.white }}>
              {x("견적문의", "Request a Quote")}
            </button>
          </div>
          <dl className="mt-12 grid max-w-[880px] grid-cols-2 border-l border-t md:grid-cols-4" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
            {specs.map((sp) => (
              <div key={sp.k} className="border-b border-r px-3 py-3 md:px-4" style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(20,24,29,0.35)" }}>
                <dt className="text-[13px]" style={{ color: "#a9b0b9" }}>
                  {sp.k}
                </dt>
                <dd className="flex flex-wrap items-baseline gap-x-1">
                  <span className="text-[18px] font-bold tabular-nums sm:text-[22px]">{sp.v}</span>
                  <span className="text-[13px]" style={{ color: "#a9b0b9" }}>
                    {sp.u}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="co-quick" aria-label={x("바로가기", "Quick links")} className="relative px-4 md:px-6">
        <ul className="relative mx-auto -mt-12 grid max-w-[1200px] grid-cols-2 gap-px overflow-hidden rounded-[6px] border shadow-[0_6px_20px_rgba(30,35,41,0.1)] md:-mt-14 md:grid-cols-4" style={{ borderColor: C.line, background: C.line }}>
          {quick.map((q) => (
            <li key={q.title} className="bg-white">
              <button type="button" onClick={q.to} className="group flex h-full w-full flex-col items-start gap-3 p-4 text-left hover:bg-[#f2f3f5] md:p-6">
                <q.icon size={28} strokeWidth={1.6} style={{ color: C.orangeText }} aria-hidden />
                <span className="block">
                  <span className="flex items-center gap-1 text-[16px] font-bold md:text-[19px]">
                    {q.title}
                    <ChevronRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[1.45] md:text-[14px]" style={{ color: C.muted }}>
                    {q.sub}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="co-home-products" className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-end justify-between gap-3 border-b-2 pb-3" style={{ borderColor: C.steel }}>
            <h2 id="co-home-products" className="text-[24px] font-bold tracking-[-0.03em] md:text-[30px]">
              {x("주요 생산제품", "Main Products")}
            </h2>
            <button type="button" onClick={() => go("products", "all")} className="inline-flex h-10 shrink-0 items-center gap-1 text-[15px] font-bold" style={{ color: C.muted }}>
              {x("전체보기", "View all")}
              <ChevronRight size={17} aria-hidden />
            </button>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] lg:aspect-auto">
              <Image src={`${IMG}/parts.jpg`} alt={x("가공을 마친 알루미늄과 스테인리스 정밀 부품", "Finished aluminum and stainless steel precision parts")} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {featured.map((p) => (
                <li key={p.name.ko}>
                  <ProductCard p={p} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="co-home-certs" className="px-4 md:px-6" style={{ background: C.gray }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 py-6 md:flex-row md:items-center md:gap-8">
          <h2 id="co-home-certs" className="shrink-0 text-[18px] font-bold">
            {x("인증현황", "Certifications")}
          </h2>
          <ul className="flex flex-1 flex-wrap gap-x-5 gap-y-1.5 text-[15px]">
            {CERTS.map((c) => (
              <li key={c.name.ko} className="inline-flex items-center gap-1.5">
                <Check size={16} style={{ color: C.orangeText }} aria-hidden />
                {s(c.name)}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => go("about", "certs")} className="inline-flex h-10 shrink-0 items-center gap-1 self-start text-[15px] font-bold md:self-auto" style={{ color: C.muted }}>
            {x("자세히 보기", "Details")}
            <ChevronRight size={17} aria-hidden />
          </button>
        </div>
      </section>

      <section aria-label={x("공지사항, 고객센터, 오시는 길", "Notice, customer center, location")} className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: C.steel }}>
              <h2 className="text-[20px] font-bold">{x("공지사항", "Notice")}</h2>
              <button type="button" onClick={() => go("support", "notice")} className="inline-flex h-9 items-center gap-0.5 text-[14px] font-bold" style={{ color: C.muted }}>
                {x("더 보기", "More")}
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
            <ul>
              {NOTICES.slice(0, 4).map((n) => (
                <li key={n.date} className="flex items-baseline justify-between gap-3 border-b py-2.5 text-[15px]" style={{ borderColor: C.line }}>
                  <span className="min-w-0 truncate">{s(n.title)}</span>
                  <span className="shrink-0 text-[13px] tabular-nums" style={{ color: C.muted }}>
                    {n.date.slice(5).replace("-", ".")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="border-b-2 pb-2 text-[20px] font-bold" style={{ borderColor: C.steel }}>
              {x("고객센터", "Customer Center")}
            </h2>
            <a href={`tel:${TEL}`} className="mt-3 block text-[28px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: C.orangeText }}>
              {TEL}
            </a>
            <dl className="mt-2 grid gap-1 text-[15px]">
              {(
                [
                  [x("팩스", "Fax"), FAX],
                  [x("가공견적", "Quotes"), MAIL_QUOTE],
                  [x("일반문의", "General"), MAIL_INFO],
                  [x("업무시간", "Hours"), s(HOURS)],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-2">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="min-w-0 break-words tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div id="co-visit">
            <h2 className="border-b-2 pb-2 text-[20px] font-bold" style={{ borderColor: C.steel }}>
              {x("오시는 길", "Location")}
            </h2>
            <p className="mt-3 font-bold">{s(ADDRESS)}</p>
            <dl className="mt-2 grid gap-1 text-[15px]">
              <div className="grid grid-cols-[96px_1fr] gap-2">
                <dt style={{ color: C.muted }}>{x("하역장", "Loading dock")}</dt>
                <dd className="tabular-nums">{x("평일 08:30 ~ 17:00", "Weekdays 08:30 to 17:00")}</dd>
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-2">
                <dt style={{ color: C.muted }}>{x("화물차", "Trucks")}</dt>
                <dd>{x("2번 게이트, 5톤까지", "Gate 2, up to 5 tons")}</dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <LocationLink tab="car" label={x("승용차 방문", "By car")} />
              <LocationLink tab="truck" label={x("화물 납품", "Deliveries")} primary />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** 메인에서 오시는 길의 탭을 골라 들어간다. */
function LocationLink({ tab, label, primary = false }: { tab: VisitTab; label: string; primary?: boolean }) {
  const { go, setVisitTab } = useCo();
  return (
    <button
      type="button"
      onClick={() => {
        setVisitTab(tab);
        go("about", "location");
      }}
      className="inline-flex h-11 items-center justify-center rounded-[4px] border px-3 text-[15px] font-bold"
      style={primary ? { background: C.steel, color: C.white, borderColor: C.steel } : { borderColor: C.line }}
    >
      {label}
    </button>
  );
}

function ProductCard({ p }: { p: (typeof PRODUCTS)[number] }) {
  const { x, s } = useCo();
  return (
    <div className="flex h-full flex-col rounded-[4px] border border-t-[3px] bg-white p-4 md:p-5" style={{ borderColor: C.line, borderTopColor: C.steel }}>
      <p className="text-[13px] font-bold" style={{ color: C.orangeText }}>
        {s(PR_CATS[p.cat])}
      </p>
      <h3 className="mt-0.5 text-[17px] font-bold leading-[1.4] tracking-[-0.02em]">{s(p.name)}</h3>
      <dl className="mt-3 space-y-1 border-t pt-3 text-[14px]" style={{ borderColor: C.line }}>
        {(
          [
            [x("소재", "Material"), s(p.material)],
            [x("공차", "Tolerance"), `${p.tol} mm`],
            [x("설비", "Machine"), s(MACHINE_NAME[p.mk])],
            [x("수량", "Quantity"), s(p.qty)],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[64px_1fr] gap-2">
            <dt style={{ color: C.muted }}>{k}</dt>
            <dd className="tabular-nums first-letter:uppercase">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- 하위 화면 틀 ---------- */

function SubPage({ m, s: subId }: { m: MenuId; s: string }) {
  const { x, s, go } = useCo();
  const menu = MENUS.find((n) => n.id === m)!;
  const sub = menu.subs.find((n) => n.id === subId) ?? menu.subs[0];

  return (
    <>
      <section className="px-4 md:px-6" style={{ background: C.steel, color: C.white, ...GRID_DARK }}>
        <div className="mx-auto max-w-[1200px] py-9 md:py-14">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] md:text-[38px]">{s(menu.label)}</h1>
        </div>
      </section>

      <div className="border-b px-4 md:px-6" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-col-reverse md:flex-row md:items-center md:justify-between md:gap-6">
          <nav aria-label={x("하위 메뉴", "Submenu")} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex">
              {menu.subs.map((n) => {
                const on = n.id === sub.id;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => go(m, n.id)}
                      aria-current={on ? "page" : undefined}
                      className="flex h-14 items-center whitespace-nowrap border-b-[3px] px-3.5 text-[15px] font-bold md:px-5 md:text-[16px]"
                      style={on ? { borderColor: C.orange, color: C.ink } : { borderColor: "transparent", color: C.muted }}
                    >
                      {s(n.label)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <nav aria-label={x("현재 위치", "Breadcrumb")} className="border-b py-2.5 md:border-b-0 md:py-0" style={{ borderColor: C.gray }}>
            <ol className="flex flex-wrap items-center gap-1 text-[13px] md:text-[14px]" style={{ color: C.muted }}>
              <li>
                <button type="button" onClick={() => go("home")} className="inline-flex h-8 items-center gap-1">
                  <House size={14} aria-hidden />
                  HOME
                </button>
              </li>
              <li className="inline-flex items-center gap-1">
                <ChevronRight size={14} aria-hidden />
                <button type="button" onClick={() => go(m)} className="inline-flex h-8 items-center">
                  {s(menu.label)}
                </button>
              </li>
              <li className="inline-flex items-center gap-1">
                <ChevronRight size={14} aria-hidden />
                <span aria-current="page" className="font-bold" style={{ color: C.ink }}>
                  {s(sub.label)}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-[1200px]">
          <h2 id="co-page-title" tabIndex={-1} className="text-[26px] font-bold tracking-[-0.03em] outline-none md:text-[32px]">
            {s(sub.label)}
          </h2>
          <div className="mt-6 md:mt-8">
            <PageBody m={m} s={sub.id} />
          </div>
        </div>
      </div>
    </>
  );
}

function PageBody({ m, s: sub }: { m: MenuId; s: string }) {
  switch (`${m}/${sub}`) {
    case "about/greeting":
      return <Greeting />;
    case "about/overview":
      return <Overview />;
    case "about/history":
      return <History />;
    case "about/certs":
      return <Certs />;
    case "about/location":
      return <Location />;
    case "equipment/machines":
      return <Machines />;
    case "equipment/measuring":
      return <Measuring />;
    case "equipment/range":
      return <Checker />;
    case "support/notice":
      return <Notice />;
    case "support/quote":
      return <Quote />;
  }
  if (m === "business") return <Business id={sub} />;
  if (m === "products") return <Products cat={sub === "all" ? "all" : (sub as PrCat)} />;
  return null;
}

/* ---------- 공용 표 ---------- */

function DataTable({ caption, head, rows, min = 560, numCols = [] }: { caption: string; head: string[]; rows: React.ReactNode[][]; min?: number; numCols?: number[] }) {
  return (
    <div className="overflow-x-auto border-t-2" style={{ borderColor: C.steel }}>
      <table className="w-full border-collapse text-left text-[15px]" style={{ minWidth: min }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr style={{ background: C.gray }}>
            {head.map((h, i) => (
              <th key={h} scope="col" className={`border-b px-4 py-3 text-[14px] font-bold ${numCols.includes(i) ? "text-right" : ""}`} style={{ borderColor: C.line }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b align-top" style={{ borderColor: C.line }}>
              {r.map((cell, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className="px-4 py-3.5 font-bold">
                    {cell}
                  </th>
                ) : (
                  <td key={ci} className={`px-4 py-3.5 ${numCols.includes(ci) ? "text-right tabular-nums" : ""}`}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 회사소개 ---------- */

function Greeting() {
  const { x } = useCo();
  return (
    <div className="max-w-[860px]">
      <div className="relative aspect-[21/9] overflow-hidden rounded-[4px]">
        <Image src={`${IMG}/parts.jpg`} alt={x("가공을 마친 알루미늄과 스테인리스 정밀 부품", "Finished aluminum and stainless steel precision parts")} fill sizes="(min-width: 900px) 860px, 100vw" className="object-cover" />
      </div>
      <div className="mt-8 space-y-4">
        <p className="text-[19px] font-bold leading-[1.6] md:text-[21px]">{x("(주)○○정밀 홈페이지를 찾아 주셔서 감사합니다.", "Thank you for visiting ○○ Precision.")}</p>
        <p>
          {x(
            "2009년 머시닝센터 두 대로 시작해 지금은 5축 가공기와 항온 가공실, 3차원 측정실을 갖추고 반도체 장비, 의료기기, 2차전지 설비 부품을 가공하고 있습니다.",
            "We started in 2009 with two machining centers. Today we run 5-axis machines, a temperature-controlled machining room and a CMM room, making parts for semiconductor equipment, medical devices and battery lines.",
          )}
        </p>
        <p>
          {x(
            "도면 검토와 가공, 표면 처리 협력사 관리, 측정 성적서 발행까지 한 곳에서 맡습니다. 도면에 빠진 치수나 가공이 어려운 형상은 견적 단계에서 먼저 말씀드립니다.",
            "Drawing review, machining, surface treatment through partners and inspection reports are handled in one place. Missing dimensions or hard-to-machine features are raised at the quotation stage.",
          )}
        </p>
        <p className="pt-4 text-right font-bold">{x("대표이사 김○○", "Kim ○○, CEO")}</p>
      </div>
    </div>
  );
}

function Overview() {
  const { x, s } = useCo();
  const rows: [string, string][] = [
    [x("회사명", "Company"), s(COMPANY)],
    [x("대표이사", "CEO"), x("김○○", "Kim ○○")],
    [x("설립", "Founded"), x("2009년 3월 (2012년 법인 전환)", "March 2009 (incorporated 2012)")],
    [x("직원", "Employees"), x("46명", "46")],
    [x("주요 사업", "Business"), x("CNC 선반, MCT, 5축 정밀부품 가공", "CNC turning, MCT and 5-axis precision machining")],
    [x("주요 고객 산업", "Industries"), x("반도체 장비, 의료기기, 2차전지 장비, 로봇·자동화", "Semiconductor equipment, medical devices, battery equipment, robotics")],
    [x("보유 설비", "Equipment"), x(`가공 설비 ${MACHINE_TOTAL}대, 측정 설비 ${MEASURES.reduce((n, v) => n + v.count, 0)}대`, `${MACHINE_TOTAL} machines, ${MEASURES.reduce((n, v) => n + v.count, 0)} measuring instruments`)],
    [x("사업장", "Plant"), x("대지 3,300㎡, 건물 2,150㎡ (항온 가공실, 3차원 측정실)", "Site 3,300 m², building 2,150 m² (temperature-controlled room, CMM room)")],
    [x("인증", "Certifications"), "ISO 9001, ISO 14001, ISO 13485"],
    [x("주소", "Address"), s(ADDRESS)],
  ];
  return (
    <dl className="border-t-2 text-[15px] md:text-[16px]" style={{ borderColor: C.steel }}>
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[104px_1fr] border-b md:grid-cols-[180px_1fr]" style={{ borderColor: C.line }}>
          <dt className="px-3 py-3.5 font-bold md:px-5" style={{ background: C.gray }}>
            {k}
          </dt>
          <dd className="min-w-0 px-3 py-3.5 md:px-5">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function History() {
  const { s } = useCo();
  return (
    <ol className="border-t-2" style={{ borderColor: C.steel }}>
      {HISTORY.map((h) => (
        <li key={h.year} className="grid grid-cols-[72px_1fr] gap-3 border-b py-4 md:grid-cols-[140px_1fr] md:gap-6" style={{ borderColor: C.line }}>
          <p className="text-[20px] font-bold tabular-nums leading-[1.4] md:text-[24px]" style={{ color: C.orangeText }}>
            {h.year}
          </p>
          <ul className="space-y-1 pt-0.5">
            {h.items.map((it) => (
              <li key={it.ko}>{s(it)}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Certs() {
  const { x, s } = useCo();
  return (
    <DataTable
      caption={x("인증현황", "Certifications")}
      head={[x("인증", "Certificate"), x("내용", "Scope"), x("인증기관", "Issued by"), x("취득", "Since")]}
      rows={CERTS.map((c) => [s(c.name), s(c.scope), s(c.org), c.year])}
      numCols={[3]}
    />
  );
}

function Location() {
  const { x, s, visitTab: tab, setVisitTab: setTab } = useCo();
  const refs = useRef<Record<VisitTab, HTMLButtonElement | null>>({ car: null, truck: null });

  const tabs = [
    { id: "car" as const, label: x("승용차 방문", "By car") },
    { id: "truck" as const, label: x("화물 납품", "Truck deliveries") },
  ];

  const onKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tab === "car" ? "truck" : "car";
    setTab(next);
    refs.current[next]?.focus();
  };

  const dock: [string, string, string][] = [
    [x("평일", "Weekdays"), "08:30 ~ 17:00", x("점심 12:00 ~ 13:00 하역 쉼", "No unloading 12:00 to 13:00")],
    [x("토요일", "Saturday"), "09:00 ~ 12:00", x("전날까지 예약한 차량만", "Booked by the day before only")],
    [x("일요일·공휴일", "Sun, holidays"), x("하역 없음", "Closed"), ""],
  ];

  return (
    <div>
      <dl className="border-t-2 text-[15px] md:text-[16px]" style={{ borderColor: C.steel }}>
        {(
          [
            [x("주소", "Address"), s(ADDRESS)],
            [x("내비게이션", "Navigation"), "○○정밀 □□공장"],
            [x("전화", "Tel"), TEL],
            [x("팩스", "Fax"), FAX],
            [x("업무시간", "Office hours"), s(HOURS)],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[104px_1fr] border-b md:grid-cols-[180px_1fr]" style={{ borderColor: C.line }}>
            <dt className="px-3 py-3 font-bold md:px-5" style={{ background: C.gray }}>
              {k}
            </dt>
            <dd className="min-w-0 px-3 py-3 tabular-nums md:px-5">{v}</dd>
          </div>
        ))}
      </dl>

      <div role="tablist" aria-label={x("방문 방법", "How to visit")} className="mt-10 grid grid-cols-2 border-b md:inline-grid md:min-w-[400px]" style={{ borderColor: C.steel }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`co-visit-tab-${t.id}`}
              aria-selected={on}
              aria-controls="co-visit-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={onKey}
              className="h-12 border border-b-0 px-5 text-[16px] font-bold"
              style={on ? { background: C.steel, color: C.white, borderColor: C.steel } : { background: C.white, color: C.muted, borderColor: C.line }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div id="co-visit-panel" role="tabpanel" aria-labelledby={`co-visit-tab-${tab}`} className="pt-6">
        {tab === "car" ? (
          <div className="max-w-[760px] space-y-2">
            <p>{x("정문으로 들어와 오른쪽 방문 주차장에 주차해 주십시오. 경비실에서 방문증을 받으시면 됩니다.", "Come in through the main gate and use the visitor lot on the right. Pick up a visitor pass at the guard house.")}</p>
            <p style={{ color: C.muted }}>{x("방문 상담은 하루 전까지 전화로 예약해 주시기 바랍니다.", "Please book visits by phone at least one day ahead.")}</p>
          </div>
        ) : (
          <div>
            <p className="max-w-[760px]">
              {x(
                "산단로 쪽 2번 게이트로 들어와 공장 뒤 하역장에 대 주십시오. 5톤 화물차까지 지게차로 내립니다.",
                "Enter through gate 2 on Sandan-ro and park at the loading dock behind the plant. We unload trucks up to 5 tons by forklift.",
              )}
            </p>
            <h3 className="mt-6 text-[18px] font-bold">{x("하역장 운영 시간", "Loading dock hours")}</h3>
            <div className="mt-3 max-w-[760px]">
              <DataTable caption={x("하역장 운영 시간", "Loading dock hours")} head={[x("요일", "Day"), x("시간", "Hours"), x("참고", "Note")]} rows={dock} min={420} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 사업분야 ---------- */

function Business({ id }: { id: string }) {
  const { x, s, go } = useCo();
  const b = BUSINESS[id] ?? BUSINESS.lathe;
  const machines = MACHINES.filter((m) => b.machines.includes(m.mk));
  const products = PRODUCTS.filter((p) => b.machines.includes(p.mk));
  return (
    <div className="grid gap-10">
      <p className="max-w-[860px]">{s(b.desc)}</p>
      <section aria-labelledby="co-biz-range">
        <h3 id="co-biz-range" className="text-[19px] font-bold">
          {x("가공 범위", "Capability")}
        </h3>
        <dl className="mt-3 border-t-2 text-[15px]" style={{ borderColor: C.steel }}>
          {b.rows.map(([k, v]) => (
            <div key={k.ko} className="grid grid-cols-[112px_1fr] border-b md:grid-cols-[180px_1fr]" style={{ borderColor: C.line }}>
              <dt className="px-3 py-3 font-bold md:px-5" style={{ background: C.gray }}>
                {s(k)}
              </dt>
              <dd className="px-3 py-3 tabular-nums md:px-5">{s(v)}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="co-biz-eq">
        <div className="flex items-center justify-between gap-3">
          <h3 id="co-biz-eq" className="text-[19px] font-bold">
            {x("주요 설비", "Main Equipment")}
          </h3>
          <button type="button" onClick={() => go("equipment", "machines")} className="inline-flex h-10 items-center gap-1 text-[15px] font-bold" style={{ color: C.muted }}>
            {x("설비현황 보기", "View Facilities")}
            <ChevronRight size={17} aria-hidden />
          </button>
        </div>
        <div className="mt-3">
          <DataTable
            caption={x("주요 설비", "Main equipment")}
            head={[x("설비명", "Machine"), x("규격", "Spec"), x("대수", "Units")]}
            rows={machines.map((m) => [`${s(MACHINE_NAME[m.mk])} ${m.name}`, s(m.spec), m.count])}
            numCols={[2]}
          />
        </div>
      </section>
      <section aria-labelledby="co-biz-pr">
        <h3 id="co-biz-pr" className="text-[19px] font-bold">
          {x("주요 가공사례", "Typical Parts")}
        </h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.name.ko}>
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
      </section>
      <div>
        <button type="button" onClick={() => go("support", "quote")} className="inline-flex h-12 items-center rounded-[4px] px-6 font-bold" style={{ background: C.orange, color: C.steel }}>
          {x("견적 문의하기", "Request a Quote")}
        </button>
      </div>
    </div>
  );
}

/* ---------- 설비현황 ---------- */

function Machines() {
  const { x, s, go, setPrMachine } = useCo();
  const [type, setType] = useState<EqType | "all">("all");
  const list = MACHINES.filter((m) => type === "all" || m.type === type);
  const sum = list.reduce((n, m) => n + m.count, 0);
  const types: [EqType | "all", string][] = [
    ["all", x("전체", "All")],
    ["mc", x("머시닝센터", "Machining centers")],
    ["fiveAx", x("5축 가공기", "5-axis")],
    ["lathe", x("CNC 선반", "CNC lathes")],
  ];

  const showParts = (mk: MachineKey) => {
    go("products", "all");
    setPrMachine(mk);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={x("설비 종류", "Equipment type")} className="flex flex-wrap gap-1.5">
          {types.map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={type === k}
              onClick={() => setType(k)}
              className="h-10 rounded-[4px] border px-3.5 text-[15px] font-bold"
              style={type === k ? { background: C.steel, color: C.white, borderColor: C.steel } : { borderColor: C.line, color: C.ink }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[15px] tabular-nums" aria-live="polite">
          {x("합계", "Total")} <strong>{x(`${sum}대`, `${sum} units`)}</strong>
        </p>
      </div>
      <div className="mt-4">
        <DataTable
          caption={x("기계설비 현황", "Machining equipment")}
          head={[x("설비명", "Machine"), x("제조사", "Maker"), x("규격", "Spec"), x("대수", "Units"), x("도입", "Since"), x("가공품", "Parts")]}
          min={820}
          numCols={[3, 4]}
          rows={list.map((m) => {
            const n = PRODUCTS.filter((p) => p.mk === m.mk).length;
            return [
              <span key="n" className="block">
                {s(MACHINE_NAME[m.mk])}
                <span className="block text-[14px] font-normal tabular-nums" style={{ color: C.muted }}>
                  {m.name}
                </span>
              </span>,
              <span key="mk" style={{ color: C.muted }}>
                {s(m.maker)}
              </span>,
              <span key="sp" className="block tabular-nums">
                {s(m.spec)}
                <span className="block text-[14px]" style={{ color: C.muted }}>
                  {x("주축", "Spindle")} {m.spindle}
                </span>
              </span>,
              m.count,
              m.year,
              n > 0 ? (
                <button
                  key="p"
                  type="button"
                  onClick={() => showParts(m.mk)}
                  aria-label={x(`${s(MACHINE_NAME[m.mk])} ${m.name} 가공품 ${n}건 보기`, `View ${n} parts made on ${m.name}`)}
                  className="inline-flex h-9 items-center gap-0.5 whitespace-nowrap rounded-[4px] border px-2.5 text-[14px] font-bold"
                  style={{ borderColor: C.line }}
                >
                  {x(`${n}건`, `${n}`)}
                  <ChevronRight size={15} aria-hidden />
                </button>
              ) : (
                <span key="p" style={{ color: C.muted }}>
                  -
                </span>
              ),
            ];
          })}
        />
      </div>
    </div>
  );
}

function Measuring() {
  const { x, s } = useCo();
  return (
    <div>
      <p className="max-w-[860px]">
        {x(
          "모든 가공기는 해마다 정도 검사를 받고, 측정기는 공인 교정기관에서 교정합니다. 출하하는 모든 로트는 3차원 측정기로 검사하고 요청하시면 측정 성적서를 함께 보내 드립니다.",
          "All machines are checked for accuracy every year, and measuring instruments are calibrated by an accredited lab. Every lot is inspected on the CMM, and inspection reports are sent on request.",
        )}
      </p>
      <div className="mt-6">
        <DataTable
          caption={x("측정설비 현황", "Measuring equipment")}
          head={[x("설비명", "Instrument"), x("제조사", "Maker"), x("측정 범위", "Range"), x("정밀도", "Accuracy"), x("대수", "Units"), x("도입", "Since")]}
          min={760}
          numCols={[4, 5]}
          rows={MEASURES.map((m) => [s(m.name), s(m.maker), s(m.range), s(m.acc), m.count, m.year])}
        />
      </div>
    </div>
  );
}

/* ---------- 가공 가능 범위 ---------- */

/** 각형은 X, Y, Z 이송 범위, 원통형은 지름과 길이 */
const ENV: Record<MachineKey, number[]> = {
  vmc: [850, 500, 500],
  large: [1300, 650, 600],
  fiveAx: [600, 500, 400],
  lathe: [300, 500],
  turnMill: [200, 400],
};

const BASE_DAYS: Record<MachineKey, number> = { vmc: 5, large: 7, fiveAx: 7, lathe: 4, turnMill: 5 };
const MAT_DAYS: Record<Material, number> = { al: 0, sus: 2, steel: 1, plastic: 0 };
const TOL_DAYS: Record<Tol, number> = { "0.1": 0, "0.05": 1, "0.01": 3 };

const envText = (k: MachineKey) => (ENV[k].length === 3 ? `${ENV[k].map(fmt).join(" × ")} mm` : `Ø${fmt(ENV[k][0])} × ${fmt(ENV[k][1])} mm`);

type Shape = "block" | "round";

interface CheckInput {
  shape: Shape;
  material: Material;
  x: number;
  y: number;
  z: number;
  tol: Tol;
  qty: number;
}

interface Verdict {
  ok: boolean;
  machine: MachineKey | null;
  /** 그림에 쓸 설비 범위 */
  env: MachineKey;
  /** 그림에 쓸 부품 치수. 각형은 긴 쪽부터 놓는다. */
  part: number[];
  fits: boolean;
  reasons: L[];
  days: [number, number] | null;
}

const R = {
  tol5ax: l("±0.01 공차는 항온 가공실의 5축 가공기에서 가공하고 3차원 측정기로 전수 검사합니다.", "±0.01 parts are machined on the 5-axis machine in the temperature-controlled room and 100% inspected on the CMM."),
  tolBig: l("±0.01 공차는 600×500×400mm 이내 부품까지 맞출 수 있습니다. 크기나 공차를 함께 검토해야 합니다.", "±0.01 tolerance is available for parts up to 600×500×400 mm. Size or tolerance needs to be reviewed."),
  tooBig: l("보유 설비의 최대 가공 범위(1,300×650×600mm)를 넘습니다. 나눠서 가공한 뒤 조립하는 방법을 검토합니다.", "Exceeds our largest envelope (1,300×650×600 mm). Machining in sections and assembling may be an option."),
  latheBig: l("선반 최대 가공 범위(Ø300 × 길이 500mm)를 넘습니다.", "Exceeds our lathe capacity (Ø300 × L500 mm)."),
  round01: l("지름 200mm가 넘는 원통 부품의 ±0.01 공차는 연삭 공정을 따로 검토해야 합니다.", "±0.01 on cylindrical parts over Ø200 needs a separate grinding review."),
  plastic: l("엔지니어링 플라스틱은 온도에 따라 치수가 변해 ±0.01 공차를 유지하기 어렵습니다.", "Engineering plastics change size with temperature, so holding ±0.01 is difficult."),
  sus: l("스테인리스는 공구 마모가 커서 납기를 이틀 더 잡습니다.", "Stainless steel wears tools faster, so two extra days are added."),
  thin: l("가장 얇은 쪽이 3mm보다 얇아 가공 중 휨을 먼저 확인해야 합니다.", "The thinnest side is under 3 mm, so distortion during machining must be checked first."),
  qty: l("500개가 넘는 수량은 양산 일정과 단가를 따로 협의합니다.", "Quantities over 500 need a separate schedule and price agreement."),
};

const fitReason = (k: MachineKey): L => l(`${MACHINE_NAME[k].ko} 가공 범위(${envText(k)}) 안에 들어갑니다.`, `Fits within the ${MACHINE_NAME[k].en} envelope (${envText(k)}).`);

function judge(i: CheckInput): Verdict | null {
  const dims = i.shape === "block" ? [i.x, i.y, i.z] : [i.x, i.z];
  if (dims.some((n) => !(n > 0)) || !(i.qty >= 1) || !Number.isInteger(i.qty)) return null;

  const reasons: L[] = [];
  let consult = false;
  let machine: MachineKey | null = null;
  let env: MachineKey;
  let part: number[];
  let fits: boolean;

  if (i.shape === "block") {
    part = [...dims].sort((p, q) => q - p);
    const [a, b, c] = part;
    const inside = (k: MachineKey) => a <= ENV[k][0] && b <= ENV[k][1] && c <= ENV[k][2];
    if (i.tol === "0.01") {
      if (inside("fiveAx")) {
        machine = "fiveAx";
        reasons.push(fitReason("fiveAx"), R.tol5ax);
      } else if (inside("large")) {
        consult = true;
        machine = inside("vmc") ? "vmc" : "large";
        reasons.push(R.tolBig);
      } else {
        consult = true;
        reasons.push(R.tooBig);
      }
    } else {
      machine = inside("vmc") ? "vmc" : inside("large") ? "large" : null;
      if (machine) reasons.push(fitReason(machine));
      else {
        consult = true;
        reasons.push(R.tooBig);
      }
    }
    env = machine ?? "large";
    fits = inside(env);
    if (c < 3) {
      consult = true;
      reasons.push(R.thin);
    }
  } else {
    part = dims;
    const [d, len] = dims;
    machine = d <= 200 && len <= 400 ? "turnMill" : d <= 300 && len <= 500 ? "lathe" : null;
    if (machine) reasons.push(fitReason(machine));
    else {
      consult = true;
      reasons.push(R.latheBig);
    }
    if (i.tol === "0.01" && machine === "lathe") {
      consult = true;
      reasons.push(R.round01);
    }
    env = machine ?? "lathe";
    fits = d <= ENV[env][0] && len <= ENV[env][1];
    if (d < 3) {
      consult = true;
      reasons.push(R.thin);
    }
  }

  if (i.material === "plastic" && i.tol === "0.01") {
    consult = true;
    reasons.push(R.plastic);
  }
  if (i.material === "sus") reasons.push(R.sus);
  if (i.qty > 500) {
    consult = true;
    reasons.push(R.qty);
  }

  let days: [number, number] | null = null;
  if (machine && !consult) {
    const d = BASE_DAYS[machine] + MAT_DAYS[i.material] + TOL_DAYS[i.tol] + Math.ceil(i.qty / 100) - 1;
    days = [d, d + 3];
  }

  return { ok: !consult, machine, env, part, fits, reasons, days };
}

const COS30 = 0.866;
const SIN30 = 0.5;

/** 설비 가공 범위와 부품을 같은 축척으로 그린다. 각형은 등각 투상, 원통형은 옆에서 본 모습. */
function EnvelopeView({ v, label }: { v: Verdict; label: string }) {
  const VW = 420;
  const VH = 300;
  const P = 30;
  const e = ENV[v.env];
  const partFill = v.fits ? { top: "#f8a26b", right: C.orange, left: "#cf5610", stroke: "#8f3a08" } : { top: "#c8ccd2", right: "#a3a9b1", left: "#868d96", stroke: C.error };

  if (e.length === 3) {
    const [W, D, H] = [Math.max(e[0], v.part[0]), Math.max(e[1], v.part[1]), Math.max(e[2], v.part[2])];
    const sc = Math.min((VW - 2 * P) / ((W + D) * COS30), (VH - 2 * P) / ((W + D) * SIN30 + H));
    const ox = P + (VW - 2 * P - (W + D) * COS30 * sc) / 2 + D * COS30 * sc;
    const oy = P + (VH - 2 * P - ((W + D) * SIN30 + H) * sc) / 2 + H * sc;
    const pt = (x: number, y: number, z: number) => `${r2(ox + (x - y) * COS30 * sc)},${r2(oy + (x + y) * SIN30 * sc - z * sc)}`;
    const box = (w: number, d: number, h: number) => ({
      top: [pt(0, 0, h), pt(w, 0, h), pt(w, d, h), pt(0, d, h)].join(" "),
      right: [pt(w, 0, 0), pt(w, d, 0), pt(w, d, h), pt(w, 0, h)].join(" "),
      left: [pt(0, d, 0), pt(w, d, 0), pt(w, d, h), pt(0, d, h)].join(" "),
    });
    const [ex, ey, ez] = e;
    const visible = [
      [pt(ex, 0, 0), pt(ex, ey, 0)],
      [pt(0, ey, 0), pt(ex, ey, 0)],
      [pt(ex, ey, 0), pt(ex, ey, ez)],
      [pt(ex, 0, 0), pt(ex, 0, ez)],
      [pt(0, ey, 0), pt(0, ey, ez)],
      [pt(0, 0, ez), pt(ex, 0, ez)],
      [pt(ex, 0, ez), pt(ex, ey, ez)],
      [pt(ex, ey, ez), pt(0, ey, ez)],
      [pt(0, ey, ez), pt(0, 0, ez)],
    ];
    const hidden = [
      [pt(0, 0, 0), pt(ex, 0, 0)],
      [pt(0, 0, 0), pt(0, ey, 0)],
      [pt(0, 0, 0), pt(0, 0, ez)],
    ];
    const p = box(v.part[0], v.part[1], v.part[2]);
    const floor = [pt(0, 0, 0), pt(ex, 0, 0), pt(ex, ey, 0), pt(0, ey, 0)].join(" ");
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" role="img" aria-label={label}>
        <polygon points={floor} fill="#e9ebee" />
        {hidden.map(([a, b]) => (
          <path key={a + b} d={`M${a} L${b}`} stroke="#b9bec5" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        <polygon points={p.left} fill={partFill.left} stroke={partFill.stroke} strokeWidth="1" />
        <polygon points={p.right} fill={partFill.right} stroke={partFill.stroke} strokeWidth="1" />
        <polygon points={p.top} fill={partFill.top} stroke={partFill.stroke} strokeWidth="1" />
        {visible.map(([a, b]) => (
          <path key={a + b} d={`M${a} L${b}`} stroke={C.steel} strokeWidth="1.2" strokeDasharray="6 4" fill="none" />
        ))}
      </svg>
    );
  }

  // 원통형: 척에 물린 부품을 옆에서 본 모습
  const [ed, el] = e;
  const [pd, pl] = v.part;
  const Dm = Math.max(ed, pd);
  const Lm = Math.max(el, pl);
  const chuck = 34;
  const sc = Math.min((VW - 2 * P - chuck) / Lm, (VH - 2 * P) / Dm);
  const x0 = r2(P + chuck);
  const cy = VH / 2;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" role="img" aria-label={label}>
      <rect x={x0} y={r2(cy - (ed * sc) / 2)} width={r2(el * sc)} height={r2(ed * sc)} fill="#e9ebee" stroke={C.steel} strokeWidth="1.2" strokeDasharray="6 4" />
      <rect x={x0} y={r2(cy - (pd * sc) / 2)} width={r2(pl * sc)} height={r2(pd * sc)} fill={partFill.right} stroke={partFill.stroke} strokeWidth="1" />
      <rect x={x0} y={r2(cy - (pd * sc) / 2)} width={r2(pl * sc)} height={r2(Math.max(1, (pd * sc) / 5))} fill={partFill.top} />
      <rect x={P} y={r2(cy - Math.min(VH / 2 - P, (pd * sc) / 2 + 22))} width={chuck - 4} height={r2(Math.min(VH - 2 * P, pd * sc + 44))} rx="2" fill={C.steel} />
      <path d={`M${P - 10} ${cy} H${VW - P + 10}`} stroke={C.muted} strokeWidth="1" strokeDasharray="14 4 3 4" />
    </svg>
  );
}

const TOLS: Tol[] = ["0.1", "0.05", "0.01"];
const MATERIALS: Material[] = ["al", "sus", "steel", "plastic"];
const MATERIAL_NAME: Record<Material, L> = {
  al: l("알루미늄", "Aluminum"),
  sus: l("스테인리스", "Stainless steel"),
  steel: l("탄소강", "Carbon steel"),
  plastic: l("엔지니어링 플라스틱", "Engineering plastic"),
};

function Checker() {
  const { x, s, lang, go, setMemo } = useCo();
  const reduce = useReducedMotionSafe();
  const [shape, setShape] = useState<Shape>("block");
  const [material, setMaterial] = useState<Material>("al");
  const [sx, setSx] = useState("180");
  const [sy, setSy] = useState("120");
  const [sz, setSz] = useState("45");
  const [tol, setTol] = useState<Tol>("0.05");
  const [qty, setQty] = useState("30");

  const v = judge({ shape, material, x: Number(sx), y: Number(sy), z: Number(sz), tol, qty: Number(qty) });

  const unit = x("개", "pcs");
  const qtyText = `${qty}${lang === "ko" ? unit : ` ${unit}`}`;
  const sizeText = shape === "block" ? `${sx} × ${sy} × ${sz} mm` : `Ø${sx} × ${sz} mm`;
  const summary = [
    `${x("형태", "Shape")}: ${shape === "block" ? x("각형 부품", "Prismatic") : x("원통형 부품", "Cylindrical")}`,
    `${x("소재", "Material")}: ${s(MATERIAL_NAME[material])}`,
    `${x("크기", "Size")}: ${sizeText}`,
    `${x("공차", "Tolerance")}: ±${tol} mm`,
    `${x("수량", "Quantity")}: ${qtyText}`,
  ].join("\n");

  const toQuote = () => {
    setMemo(x(`가공 가능 범위에서 넣은 조건입니다.\n${summary}\n`, `Conditions from the machinable range check:\n${summary}\n`));
    go("support", "quote");
  };

  const seg = (on: boolean) => (on ? { background: C.steel, color: C.white, borderColor: C.steel } : { background: C.white, color: C.ink, borderColor: C.line });

  const numField = (id: string, label: string, value: string, set: (v: string) => void) => (
    <label className="block min-w-0" htmlFor={id}>
      <span className="text-[14px]" style={{ color: C.muted }}>
        {label}
      </span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 h-12 w-full rounded-[4px] border bg-white px-3 tabular-nums outline-none focus:border-[#1e2329]"
        style={{ borderColor: C.line }}
      />
    </label>
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6 rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.gray }}>
        <fieldset>
          <legend className="text-[15px] font-bold">{x("형태", "Shape")}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["block", "round"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={shape === k} onClick={() => setShape(k)} className="h-11 rounded-[4px] border text-[15px] font-bold" style={seg(shape === k)}>
                {k === "block" ? x("각형 부품", "Prismatic") : x("원통형 부품", "Cylindrical")}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[15px] font-bold">{x("소재", "Material")}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {MATERIALS.map((m) => (
              <button key={m} type="button" aria-pressed={material === m} onClick={() => setMaterial(m)} className="min-h-11 rounded-[4px] border px-2 py-2 text-[15px] font-bold leading-[1.3]" style={seg(material === m)}>
                {s(MATERIAL_NAME[m])}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[15px] font-bold">{x("크기 (mm)", "Size (mm)")}</legend>
          <div className={`mt-2 grid gap-2 ${shape === "block" ? "grid-cols-3" : "grid-cols-2"}`}>
            {numField("chk-x", shape === "block" ? x("가로 X", "Width X") : x("지름 Ø", "Dia. Ø"), sx, setSx)}
            {shape === "block" && numField("chk-y", x("세로 Y", "Depth Y"), sy, setSy)}
            {numField("chk-z", shape === "block" ? x("높이 Z", "Height Z") : x("길이", "Length"), sz, setSz)}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr]">
          <fieldset>
            <legend className="text-[15px] font-bold">{x("공차", "Tolerance")}</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TOLS.map((o) => (
                <button key={o} type="button" aria-pressed={tol === o} onClick={() => setTol(o)} className="h-12 rounded-[4px] border text-[15px] font-bold tabular-nums" style={seg(tol === o)}>
                  ±{o}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="chk-qty" className="text-[15px] font-bold">
              {x("수량", "Quantity")}
            </label>
            <span className="relative mt-2 block">
              <input
                id="chk-qty"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="h-12 w-full rounded-[4px] border bg-white pl-3 pr-12 tabular-nums outline-none focus:border-[#1e2329]"
                style={{ borderColor: C.line }}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: C.muted }} aria-hidden>
                {unit}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-[6px] border bg-white" style={{ borderColor: C.line }} aria-live="polite">
        {v ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 md:px-7" style={{ borderColor: C.line }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={v.ok ? "ok" : "consult"}
                  className="inline-flex items-center gap-2 text-[22px] font-bold tracking-[-0.02em] md:text-[26px]"
                  style={{ color: v.ok ? C.ok : C.orangeText }}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  {v.ok ? <Check size={24} aria-hidden /> : <CircleAlert size={24} aria-hidden />}
                  {v.ok ? x("가공 가능", "Machinable") : x("상담 필요", "Consultation needed")}
                </motion.p>
              </AnimatePresence>
              <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                {s(MATERIAL_NAME[material])}, ±{tol} mm, {qtyText}
              </span>
            </div>
            <div className="px-3 pt-3 md:px-5">
              <EnvelopeView
                v={v}
                label={x(`설비 가공 범위 ${envText(v.env)} 안에 부품 ${sizeText}을 같은 비율로 그린 그림`, `Part ${sizeText} drawn to scale inside the machine envelope ${envText(v.env)}`)}
              />
              <ul className="flex flex-wrap gap-x-5 gap-y-1 px-2 text-[13px] tabular-nums" style={{ color: C.muted }}>
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-0 w-5 border-t-2 border-dashed" style={{ borderColor: C.steel }} aria-hidden />
                  {x("설비 가공 범위", "Machine envelope")} {envText(v.env)}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5" style={{ background: v.fits ? C.orange : "#a3a9b1" }} aria-hidden />
                  {x("입력한 부품", "Your part")} {sizeText}
                </li>
              </ul>
            </div>
            <dl className="mx-5 mt-4 grid grid-cols-2 border-l border-t md:mx-7" style={{ borderColor: C.line }}>
              <div className="border-b border-r px-3 py-2.5" style={{ borderColor: C.line }}>
                <dt className="text-[13px]" style={{ color: C.muted }}>
                  {x("가공 설비", "Machine")}
                </dt>
                <dd className="font-bold leading-[1.4] first-letter:uppercase">{v.machine ? s(MACHINE_NAME[v.machine]) : x("보유 설비 밖", "Beyond our machines")}</dd>
              </div>
              <div className="border-b border-r px-3 py-2.5" style={{ borderColor: C.line }}>
                <dt className="text-[13px]" style={{ color: C.muted }}>
                  {x("예상 납기", "Est. lead time")}
                </dt>
                <dd className="font-bold tabular-nums leading-[1.4]">{v.days ? x(`${v.days[0]}~${v.days[1]}영업일`, `${v.days[0]} to ${v.days[1]} business days`) : x("도면 검토 후 안내", "After drawing review")}</dd>
              </div>
            </dl>
            <ul className="space-y-1.5 px-5 pt-4 text-[15px] md:px-7">
              {v.reasons.map((r) => (
                <li key={r.ko} className="flex gap-2">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0" style={{ background: C.steel }} aria-hidden />
                  {s(r)}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pb-6 pt-5 md:px-7">
              <button type="button" onClick={toQuote} className="inline-flex h-12 items-center rounded-[4px] px-5 font-bold" style={{ background: C.orange, color: C.steel }}>
                {x("이 조건으로 견적문의", "Request a quote with these conditions")}
              </button>
              <p className="text-[14px]" style={{ color: C.muted }}>
                {x("최종 가공 여부는 도면 검토 후 안내합니다.", "Final feasibility is confirmed after drawing review.")}
              </p>
            </div>
          </>
        ) : (
          <p className="px-5 py-16 text-center md:px-7" style={{ color: C.muted }}>
            {x("크기와 수량을 1 이상 숫자로 입력해 주십시오.", "Enter size and quantity as numbers of 1 or more.")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- 생산제품 ---------- */

function Products({ cat }: { cat: PrCat | "all" }) {
  const { x, s, prMachine, setPrMachine } = useCo();
  const list = PRODUCTS.filter((p) => (cat === "all" || p.cat === cat) && (!prMachine || p.mk === prMachine));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px]" style={{ color: C.muted }}>
          {x("고객사 보안을 위해 형상은 공개하지 않습니다.", "Part shapes are not shown to protect customer confidentiality.")}
        </p>
        {prMachine && (
          <p className="inline-flex items-center gap-1 rounded-[4px] border py-1 pl-3 pr-1 text-[14px] font-bold" style={{ borderColor: C.steel }}>
            {x("설비", "Machine")}: <span className="first-letter:uppercase">{s(MACHINE_NAME[prMachine])}</span>
            <button type="button" onClick={() => setPrMachine(null)} aria-label={x("설비 조건 지우기", "Clear machine filter")} className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] hover:bg-[#f2f3f5]">
              <X size={16} aria-hidden />
            </button>
          </p>
        )}
      </div>
      <p className="mt-4 border-b-2 pb-2 text-[15px] tabular-nums" style={{ borderColor: C.steel }} aria-live="polite">
        {x("총", "Total")} <strong>{list.length}</strong>
        {x("건", "")}
      </p>
      {list.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <li key={p.name.ko}>
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-[4px] p-8 text-center" style={{ background: C.gray, color: C.muted }}>
          {x("해당 조건의 제품이 없습니다.", "No products match.")}
        </p>
      )}
    </div>
  );
}

/* ---------- 고객지원 ---------- */

function Notice() {
  const { x, s } = useCo();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
        {x("총", "Total")} <strong style={{ color: C.ink }}>{NOTICES.length}</strong>
        {x("건", "")}
      </p>
      <div className="mt-2 border-t-2" style={{ borderColor: C.steel }}>
        <div className="hidden grid-cols-[72px_1fr_120px] border-b py-3 text-center text-[14px] font-bold md:grid" style={{ background: C.gray, borderColor: C.line }} aria-hidden>
          <span>{x("번호", "No.")}</span>
          <span>{x("제목", "Title")}</span>
          <span>{x("작성일", "Date")}</span>
        </div>
        <ul>
          {NOTICES.map((n, i) => {
            const on = open === i;
            return (
              <li key={n.date} className="border-b" style={{ borderColor: C.line }}>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`co-notice-${i}`}
                  onClick={() => setOpen(on ? null : i)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-1 py-3.5 text-left md:grid-cols-[72px_1fr_120px] md:px-0"
                >
                  <span className="hidden text-center text-[14px] tabular-nums md:block" style={{ color: C.muted }}>
                    {NOTICES.length - i}
                  </span>
                  <span className="flex min-w-0 items-center gap-2 font-semibold">
                    <span className="min-w-0">{s(n.title)}</span>
                    <ChevronDown size={17} className="shrink-0 transition-transform" style={{ transform: on ? "rotate(180deg)" : undefined, color: C.muted }} aria-hidden />
                  </span>
                  <span className="col-start-1 text-[13px] tabular-nums md:col-start-auto md:text-center md:text-[14px]" style={{ color: C.muted }}>
                    {n.date.replaceAll("-", ".")}
                  </span>
                </button>
                {on && (
                  <div id={`co-notice-${i}`} className="px-4 py-5 text-[15px] md:px-[88px]" style={{ background: C.gray }}>
                    {s(n.body)}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

type Field = "company" | "person" | "phone" | "email" | "subject" | "due" | "content" | "file" | "agree";
type Errors = Partial<Record<Field, string>>;

const FILE_EXT = ["pdf", "dwg", "dxf", "step", "stp", "igs", "iges", "zip"];
const FILE_MAX = 30 * 1024 * 1024;
const Q_TYPES = [l("견적문의", "Quote"), l("제품문의", "Product"), l("상담요청", "Consultation"), l("기타문의", "Other")];

interface Receipt {
  no: string;
  company: string;
  person: string;
  phone: string;
  type: string;
  subject: string;
  file: string | null;
}

function Quote() {
  const { x, s, memo, setMemo } = useCo();
  const reduce = useReducedMotionSafe();
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [qType, setQType] = useState(0);
  const [subject, setSubject] = useState(() => (memo ? x("가공 가능 범위 확인 조건 견적", "Quote for checked conditions") : ""));
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [due, setDue] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<Receipt | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const err = !FILE_EXT.includes(ext) ? x("도면 파일 형식이 아닙니다.", "This is not a supported drawing format.") : f.size > FILE_MAX ? x("30MB가 넘는 파일은 메일로 보내 주십시오.", "Files over 30 MB should be sent by email.") : undefined;
    setErrors((p) => ({ ...p, file: err }));
    if (err) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } else setFile({ name: f.name, size: f.size });
  };

  const removeFile = () => {
    setFile(null);
    setErrors((p) => ({ ...p, file: undefined }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (!company.trim()) next.company = x("회사명을 입력해 주십시오.", "Enter your company name.");
    if (person.trim().length < 2) next.person = x("담당자명을 두 글자 이상 입력해 주십시오.", "Enter the contact person's name.");
    if (phone.replace(/\D/g, "").length < 9) next.phone = x("연락처를 9자리 이상 숫자로 입력해 주십시오.", "Enter a phone number with at least 9 digits.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = x("이메일 형식을 확인해 주십시오.", "Check the email format.");
    if (!subject.trim()) next.subject = x("문의제목을 입력해 주십시오.", "Enter a subject.");
    if (due && new Date(`${due}T00:00:00`) < tomorrow) next.due = x("희망 납기는 내일 이후 날짜로 골라 주십시오.", "Choose a date from tomorrow onward.");
    if (memo.trim().length < 10) next.content = x("문의내용을 10자 이상 입력해 주십시오.", "Enter at least 10 characters.");
    if (errors.file) next.file = errors.file;
    if (!agree) next.agree = x("개인정보 수집·이용에 동의해 주십시오.", "Please agree to the collection of personal data.");
    setErrors(next);
    const order: Field[] = ["company", "person", "phone", "email", "subject", "due", "content", "file", "agree"];
    const first = order.find((f) => next[f]);
    if (first) {
      document.getElementById(`q-${first}`)?.focus();
      return;
    }
    const now = new Date();
    const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    setDone({
      no: `Q-${ymd}-${String(now.getHours() * 60 + now.getMinutes()).padStart(4, "0")}`,
      company: company.trim(),
      person: maskName(person),
      phone: maskPhone(phone),
      type: s(Q_TYPES[qType]),
      subject: subject.trim(),
      file: file ? `${file.name} (${fileSize(file.size)})` : null,
    });
  };

  const reset = () => {
    setDone(null);
    setCompany("");
    setPerson("");
    setPhone("");
    setEmail("");
    setQType(0);
    setSubject("");
    setFile(null);
    setDue("");
    setMemo("");
    setAgree(false);
    setErrors({});
  };

  const inputCls = "mt-1.5 h-12 w-full rounded-[4px] border bg-white px-3 outline-none focus:border-[#1e2329]";
  const border = (f: Field) => ({ borderColor: errors[f] ? C.error : C.line });
  const errText = (f: Field) =>
    errors[f] ? (
      <p id={`q-${f}-err`} className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
        {errors[f]}
      </p>
    ) : null;
  const aria = (f: Field) => ({ "aria-invalid": !!errors[f], "aria-describedby": errors[f] ? `q-${f}-err` : undefined });
  const label = (f: Field | "type", text: string, req = true) => (
    <label htmlFor={`q-${f}`} className="text-[15px] font-bold">
      {text}
      {req && (
        <span className="ml-1" style={{ color: C.orangeText }}>
          <span aria-hidden>*</span>
          <span className="sr-only">({x("필수", "required")})</span>
        </span>
      )}
    </label>
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
      <div aria-live="polite" className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              className="rounded-[6px] border bg-white"
              style={{ borderColor: C.line }}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="flex items-center gap-3 px-6 py-5" style={{ background: C.steel, color: C.white }}>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]" style={{ background: C.orange, color: C.steel }}>
                  <Check size={22} aria-hidden />
                </span>
                <div>
                  <p className="text-[20px] font-bold tracking-[-0.02em]">{x("문의가 접수되었습니다", "Your inquiry has been received")}</p>
                  <p className="text-[15px]" style={{ color: "#c9ced6" }}>
                    {x(`${done.person}님께 영업일 기준 1일 이내 연락드리겠습니다.`, `We will contact ${done.person} within one business day.`)}
                  </p>
                </div>
              </div>
              <dl className="px-6 py-5 text-[15px]">
                {(
                  [
                    [x("접수번호", "Reference no."), done.no],
                    [x("회사명", "Company"), done.company],
                    [x("담당자명", "Contact"), done.person],
                    [x("연락처", "Phone"), done.phone],
                    [x("문의유형", "Type"), done.type],
                    [x("문의제목", "Subject"), done.subject],
                    [x("도면 첨부", "Drawing"), done.file ?? x("첨부 없음", "No file")],
                  ] as const
                ).map(([k, val], i) => (
                  <div key={k} className="grid grid-cols-[100px_1fr] gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: C.line }}>
                    <dt style={{ color: C.muted }}>{k}</dt>
                    <dd className={`min-w-0 break-all tabular-nums ${i === 0 ? "text-[19px] font-bold" : "font-semibold"}`} style={i === 0 ? { color: C.orangeText } : undefined}>
                      {val}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="px-6 pb-6">
                <button type="button" onClick={reset} className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border px-4 text-[15px] font-bold" style={{ borderColor: C.line }}>
                  <RotateCcw size={16} aria-hidden />
                  {x("새 문의 작성", "New inquiry")}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }}>
              <p className="mb-4">{x("도면을 첨부해 주시면 담당자가 확인 후 연락드립니다.", "Attach your drawing and our engineer will get back to you.")}</p>
              {Object.values(errors).some(Boolean) && (
                <p role="alert" className="mb-4 flex items-center gap-2 rounded-[4px] px-3 py-2.5 text-[15px] font-semibold" style={{ background: "#fbeaea", color: C.error }}>
                  <CircleAlert size={18} aria-hidden />
                  {x("입력 내용을 확인해 주십시오.", "Please check the highlighted fields.")}
                </p>
              )}
              <div className="grid gap-5 border-t-2 pt-6 sm:grid-cols-2" style={{ borderColor: C.steel }}>
                <div>
                  {label("company", x("회사명", "Company"))}
                  <input id="q-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" placeholder="(주)△△테크" className={inputCls} style={border("company")} {...aria("company")} />
                  {errText("company")}
                </div>
                <div>
                  {label("person", x("담당자명", "Contact person"))}
                  <input id="q-person" value={person} onChange={(e) => setPerson(e.target.value)} autoComplete="name" className={inputCls} style={border("person")} {...aria("person")} />
                  {errText("person")}
                </div>
                <div>
                  {label("phone", x("연락처", "Phone"))}
                  <input id="q-phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${inputCls} tabular-nums`} style={border("phone")} {...aria("phone")} />
                  {errText("phone")}
                </div>
                <div>
                  {label("email", x("이메일", "Email"))}
                  <input id="q-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="buyer@example.com" className={inputCls} style={border("email")} {...aria("email")} />
                  {errText("email")}
                </div>
                <div>
                  {label("type", x("문의유형", "Inquiry type"), false)}
                  <select id="q-type" value={qType} onChange={(e) => setQType(Number(e.target.value))} className={inputCls} style={{ borderColor: C.line }}>
                    {Q_TYPES.map((t, i) => (
                      <option key={t.ko} value={i}>
                        {s(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  {label("due", x("희망 납기", "Required date"), false)}
                  <input id="q-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputCls} tabular-nums`} style={border("due")} {...aria("due")} />
                  {errText("due")}
                </div>
                <div className="sm:col-span-2">
                  {label("subject", x("문의제목", "Subject"))}
                  <input id="q-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} style={border("subject")} {...aria("subject")} />
                  {errText("subject")}
                </div>
                <div className="sm:col-span-2">
                  {label("content", x("문의내용", "Details"))}
                  <textarea
                    id="q-content"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={6}
                    placeholder={x("소재, 수량, 표면 처리, 열처리 여부", "Material, quantity, surface finish, heat treatment")}
                    className="mt-1.5 w-full rounded-[4px] border bg-white px-3 py-2.5 outline-none focus:border-[#1e2329]"
                    style={border("content")}
                    {...aria("content")}
                  />
                  {errText("content")}
                </div>

                <div className="sm:col-span-2">
                  {label("file", x("도면 첨부", "Drawing"), false)}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 rounded-[4px] border border-dashed p-3" style={{ borderColor: errors.file ? C.error : "#b9bec5", background: C.gray }}>
                    <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[4px] px-4 text-[15px] font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ background: C.steel, color: C.white }}>
                      <FileUp size={18} aria-hidden />
                      {x("파일 선택", "Choose file")}
                      <input
                        ref={fileRef}
                        id="q-file"
                        type="file"
                        accept={FILE_EXT.map((v) => `.${v}`).join(",")}
                        className="sr-only"
                        onChange={(e) => pickFile(e.target.files?.[0])}
                        aria-describedby={errors.file ? "q-file-err q-file-hint" : "q-file-hint"}
                      />
                    </label>
                    {file ? (
                      <span className="flex min-w-0 flex-1 items-center gap-2 text-[15px]">
                        <span className="min-w-0 truncate font-semibold">{file.name}</span>
                        <span className="shrink-0 tabular-nums" style={{ color: C.muted }}>
                          {fileSize(file.size)}
                        </span>
                        <button type="button" onClick={removeFile} aria-label={x("파일 삭제", "Remove file")} className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]" style={{ color: C.muted }}>
                          <Trash2 size={18} aria-hidden />
                        </button>
                      </span>
                    ) : (
                      <span className="text-[14px]" style={{ color: C.muted }}>
                        {x("선택된 파일 없음", "No file chosen")}
                      </span>
                    )}
                  </div>
                  <p id="q-file-hint" className="mt-1 text-[13px]" style={{ color: C.muted }}>
                    {x("PDF, DWG, DXF, STEP, IGES, ZIP 파일 (최대 30MB). 데모 화면이라 파일은 어디에도 올리지 않습니다.", "PDF, DWG, DXF, STEP, IGES, ZIP (up to 30 MB). This is a demo, so files are not uploaded anywhere.")}
                  </p>
                  {errText("file")}
                </div>

                <div className="sm:col-span-2 rounded-[4px] border p-4" style={{ borderColor: C.line }}>
                  <p className="text-[14px]" style={{ color: C.muted }}>
                    {x("수집 항목: 회사명, 담당자명, 연락처, 이메일. 보관 기간: 문의 처리 후 1년.", "Collected: company, name, phone, email. Kept for one year after the inquiry.")}
                  </p>
                  <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-[15px]">
                    <input id="q-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#1e2329]" {...aria("agree")} />
                    <span>{x("개인정보 수집·이용에 동의합니다.", "I agree to the collection and use of personal data.")}</span>
                  </label>
                  {errText("agree")}
                </div>
              </div>
              <div className="mt-7 flex justify-center">
                <button type="submit" className="h-13 w-full rounded-[4px] py-3.5 text-[17px] font-bold sm:w-[240px]" style={{ background: C.orange, color: C.steel }}>
                  {x("문의하기", "Submit")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <aside aria-labelledby="co-contact" className="rounded-[6px] border lg:sticky lg:top-[96px]" style={{ borderColor: C.line }}>
        <h3 id="co-contact" className="px-5 py-3.5 text-[17px] font-bold" style={{ background: C.steel, color: C.white }}>
          {x("상담 안내", "Contact")}
        </h3>
        <dl className="text-[15px]">
          {(
            [
              [x("전화 상담", "Phone"), TEL],
              [x("팩스", "Fax"), FAX],
              [x("가공견적 메일", "Quote email"), MAIL_QUOTE],
              [x("일반문의 메일", "General email"), MAIL_INFO],
              [x("업무시간", "Hours"), s(HOURS)],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="border-b px-5 py-3 last:border-b-0" style={{ borderColor: C.line }}>
              <dt className="text-[13px]" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="break-words font-bold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  const { x, s, go } = useCo();
  return (
    <footer className="px-4 pb-24 pt-10 md:px-6" style={{ background: C.steel, color: "#c9ced6" }}>
      <div className="mx-auto max-w-[1200px]">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 border-b pb-5 text-[14px] font-semibold text-white" style={{ borderColor: C.steelLine }}>
          {MENUS.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => go(m.id)} className="inline-flex h-9 items-center hover:underline">
                {s(m.label)}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-white">
          <Logo light />
        </div>
        <dl className="mt-5 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#a9b0b9" }}>
          {(
            [
              [x("상호", "Company"), s(COMPANY)],
              [x("대표", "CEO"), x("김○○", "Kim ○○")],
              [x("사업자등록번호", "Business reg. no."), "000-00-00000"],
              [x("주소", "Address"), s(ADDRESS)],
              [x("전화", "Tel"), TEL],
              [x("팩스", "Fax"), FAX],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0">{k}</dt>
              <dd className="min-w-0 break-words tabular-nums" style={{ color: C.white }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
