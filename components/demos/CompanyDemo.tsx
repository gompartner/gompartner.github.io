"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronRight, CircleAlert, FileUp, House, Menu, RotateCcw, Trash2, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 기업 홈페이지 데모: 가상의 (주)곰파트너정밀, CNC 정밀 가공 제조업체.
   회사명, 대표자, 주소, 전화번호, 사업자 정보, 설비 모델명, 제조사, 거래처, 인증 기관은 모두 가상이다.

   구성: 실제 중소 제조업 홈페이지처럼 서브페이지 구조로 만들었다. 메뉴는 회사소개, 사업분야, 설비현황, 생산제품, 고객지원.
   넓은 화면에서는 메뉴에 마우스를 올리거나 키보드로 들어가면 2단 메뉴판이 한꺼번에 펼쳐진다.
   하위 화면은 라우트를 따로 두지 않고 상태로 바꾸며, 위치 표시(HOME > 설비현황 > 기계설비)와 상단 하위 메뉴 탭, 표 중심 본문을 쓴다.
   메인은 사진 배너, 바로가기 4개, 주요 생산제품, 인증현황 띠, 공지사항·고객센터·오시는 길 3칸으로 짧게 둔다.

   디자인: 철판 같은 짙은 회색(#1e2329)과 옅은 회색(#f2f3f5)에 안전 주황(#f26a1b) 하나만 쓴다.
   모서리는 4~6px로 각지게, 치수와 사양 숫자는 고정폭 숫자로 맞춘다.

   맨 위 띠의 KOR/ENG는 같은 화면의 문구를 바꾸고, 바깥 div의 lang도 함께 바꾼다.
   설비현황은 기계설비, 측정설비 표와 가공 방식별 최대 크기, 공차, 소재를 적은 가공 사양 표로 둔다.
   견적문의는 도면 파일을 골라도 이름과 크기만 보여 주고 어디에도 올리지 않으며, 접수번호와 가린 담당자 정보로 끝난다.
   오시는 길은 주소, 연락처 표와 방문 안내 한 단락이다.

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

/* ---------- 언어, 화면 상태 ---------- */

type Lang = "ko" | "en";
type L = { ko: string; en: string };
const l = (ko: string, en: string): L => ({ ko, en });

type MenuId = "about" | "business" | "equipment" | "products" | "support";
type Route = { m: MenuId | "home"; s: string };

type MachineKey = "vmc" | "large" | "fiveAx" | "lathe" | "turnMill";
type PrCat = "semi" | "medical" | "battery" | "robot";

interface Ctx {
  lang: Lang;
  x: (ko: string, en: string) => string;
  s: (v: L) => string;
  route: Route;
  go: (m: MenuId | "home", s?: string) => void;
}

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
      { id: "spec", label: l("가공 사양", "Machining Specs") },
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
      { id: "robot", label: l("로봇, 자동화", "Robotics") },
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

const COMPANY = l("정밀가공 제조", "Precision Machining");
const ADDRESS = l("ㅎㄷ시 ㅁㄹ구 ㅅㄴ산단로 00", "00 SN-sandan-ro, MR-gu, HD-si");
const HOURS = l("평일 08:30 ~ 17:30, 토, 일, 공휴일 휴무", "Weekdays 08:30 to 17:30, closed on weekends and holidays");

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
  { type: "mc", mk: "vmc", name: "VMC-850", maker: l("ㄷㅅ공작기계 (국내)", "DS Machine Tools (Korea)"), spec: l("X850 x Y500 x Z500 mm", "X850 x Y500 x Z500 mm"), spindle: "12,000 rpm", count: 4, year: 2016 },
  { type: "mc", mk: "large", name: "VMC-1300", maker: l("ㄷㅅ공작기계 (국내)", "DS Machine Tools (Korea)"), spec: l("X1,300 x Y650 x Z600 mm", "X1,300 x Y650 x Z600 mm"), spindle: "8,000 rpm", count: 2, year: 2019 },
  { type: "mc", mk: "vmc", name: "HSC-500", maker: l("ㅂㄹ (일본)", "BR (Japan)"), spec: l("X500 x Y400 x Z300 mm", "X500 x Y400 x Z300 mm"), spindle: "24,000 rpm", count: 1, year: 2021 },
  { type: "fiveAx", mk: "fiveAx", name: "5AX-600", maker: l("ㅎㅅ (독일)", "HS (Germany)"), spec: l("X600 x Y500 x Z400 mm, A +-120도, C 360도", "X600 x Y500 x Z400 mm, A +-120 deg, C 360 deg"), spindle: "20,000 rpm", count: 3, year: 2018 },
  { type: "lathe", mk: "lathe", name: "TL-300", maker: l("ㅁㅇ기공 (국내)", "MY Machinery (Korea)"), spec: l("최대 D300 x 길이 500 mm", "Max. D300 x L500 mm"), spindle: "4,500 rpm", count: 5, year: 2016 },
  { type: "lathe", mk: "turnMill", name: "TM-200", maker: l("ㅂㄹ (일본)", "BR (Japan)"), spec: l("최대 D200 x 길이 400 mm, Y축, 부 주축", "Max. D200 x L400 mm, Y-axis, sub spindle"), spindle: "6,000 rpm", count: 2, year: 2022 },
];

const MEASURES: { name: L; maker: L; range: L; acc: L; count: number; year: number }[] = [
  { name: l("3차원 측정기 CMM-7106", "CMM 7106"), maker: l("ㄴㄹ (독일)", "NR (Germany)"), range: l("X700 x Y1,000 x Z600 mm", "X700 x Y1,000 x Z600 mm"), acc: l("1.9 + L/300 um", "1.9 + L/300 um"), count: 1, year: 2022 },
  { name: l("윤곽, 표면 거칠기 측정기", "Contour and roughness tester"), maker: l("ㅈㅇ (일본)", "JY (Japan)"), range: l("측정 길이 100 mm", "Stroke 100 mm"), acc: l("Ra 0.01 um까지", "Down to Ra 0.01 um"), count: 1, year: 2022 },
  { name: l("비접촉 영상 측정기", "Vision measuring system"), maker: l("ㄷㄹ (국내)", "DR (Korea)"), range: l("X300 x Y200 mm", "X300 x Y200 mm"), acc: l("+-2.5 um", "+-2.5 um"), count: 1, year: 2023 },
  { name: l("하이트 게이지", "Height gauge"), maker: l("ㅈㅇ (일본)", "JY (Japan)"), range: l("높이 600 mm", "Height 600 mm"), acc: l("+-1.1 um", "+-1.1 um"), count: 2, year: 2017 },
];

const MACHINE_TOTAL = MACHINES.reduce((n, m) => n + m.count, 0);

const PRODUCTS: { cat: PrCat; name: L; material: L; tol: string; mk: MachineKey; qty: L }[] = [
  { cat: "semi", name: l("웨이퍼 이송 로봇 암 블록", "Wafer transfer robot arm block"), material: l("알루미늄 6061, 경질 아노다이징", "Al 6061, hard anodized"), tol: "+-0.02", mk: "fiveAx", qty: l("월 120개", "120 / month") },
  { cat: "medical", name: l("수술 기구 연결 커넥터", "Surgical instrument connector"), material: l("스테인리스 630", "SUS 630"), tol: "+-0.01", mk: "turnMill", qty: l("로트당 500개", "500 / lot") },
  { cat: "battery", name: l("전극 노칭 금형 베이스", "Electrode notching die base"), material: l("공구강 SKD11, 열처리 후 가공", "Tool steel SKD11, machined after hardening"), tol: "+-0.01", mk: "fiveAx", qty: l("주문 생산", "Made to order") },
  { cat: "robot", name: l("협동 로봇 감속기 하우징", "Cobot reducer housing"), material: l("알루미늄 7075", "Al 7075"), tol: "+-0.02", mk: "fiveAx", qty: l("월 250개", "250 / month") },
  { cat: "semi", name: l("진공 챔버 포트 플랜지", "Vacuum chamber port flange"), material: l("스테인리스 316L, Ra 0.8", "SUS 316L, Ra 0.8"), tol: "+-0.03", mk: "lathe", qty: l("월 300개", "300 / month") },
  { cat: "medical", name: l("진단 장비 시료 트레이", "Diagnostic analyzer sample tray"), material: l("PEEK", "PEEK"), tol: "+-0.05", mk: "vmc", qty: l("월 200개", "200 / month") },
  { cat: "battery", name: l("롤 프레스 베어링 하우징", "Roll press bearing housing"), material: l("탄소강 S45C", "Carbon steel S45C"), tol: "+-0.02", mk: "large", qty: l("월 40개", "40 / month") },
  { cat: "robot", name: l("비전 검사기 카메라 브래킷", "Vision inspection camera bracket"), material: l("알루미늄 6061, 흑색 아노다이징", "Al 6061, black anodized"), tol: "+-0.05", mk: "vmc", qty: l("월 600개", "600 / month") },
];

const PR_CATS: Record<PrCat, L> = {
  semi: l("반도체 장비", "Semiconductor"),
  medical: l("의료기기", "Medical"),
  battery: l("2차전지 장비", "Battery equipment"),
  robot: l("로봇, 자동화", "Robotics"),
};

const HISTORY: { year: number; items: L[] }[] = [
  { year: 2024, items: [l("ISO 13485 인증, 의료기기 부품 가공 시작", "ISO 13485 certified, began machining medical device parts")] },
  { year: 2023, items: [l("ISO 14001 인증", "ISO 14001 certified"), l("비접촉 영상 측정기 도입", "Added a vision measuring system")] },
  { year: 2022, items: [l("항온 가공실과 3차원 측정실 구축", "Built the temperature-controlled machining room and CMM room"), l("복합 선반 2대 도입", "Added two turn-mill centers")] },
  { year: 2021, items: [l("뿌리기업 확인 (정밀가공 분야)", "Confirmed as a root industry company (precision machining)")] },
  { year: 2020, items: [l("기업부설연구소 설립", "Opened the in-house R&D center")] },
  { year: 2018, items: [l("5축 가공기 도입, 반도체 장비 부품 납품 시작", "Added 5-axis machines, began supplying semiconductor equipment parts")] },
  { year: 2016, items: [l("ㅅㄴ산업단지 지금 공장으로 이전", "Moved to the current plant in SN Industrial Complex")] },
  { year: 2014, items: [l("ISO 9001 인증", "ISO 9001 certified")] },
  { year: 2012, items: [l("법인 전환", "Incorporated")] },
  { year: 2009, items: [l("ㅎㄷ시에서 머시닝센터 2대로 창업", "Founded in HD with two machining centers")] },
];

const CERTS: { name: L; scope: L; org: L; year: number }[] = [
  { name: l("ISO 9001", "ISO 9001"), scope: l("품질경영시스템", "Quality management system"), org: l("ㄱㅎ인증원", "GH Certification"), year: 2014 },
  { name: l("ISO 14001", "ISO 14001"), scope: l("환경경영시스템", "Environmental management system"), org: l("ㄱㅎ인증원", "GH Certification"), year: 2023 },
  { name: l("ISO 13485", "ISO 13485"), scope: l("의료기기 품질경영시스템", "Medical device quality management"), org: l("ㄱㅎ인증원", "GH Certification"), year: 2024 },
  { name: l("기업부설연구소", "In-house R&D center"), scope: l("연구개발전담 조직 인정", "Recognized R&D organization"), org: l("ㅅㄹ협회", "SR Association"), year: 2020 },
  { name: l("뿌리기업", "Root industry company"), scope: l("정밀가공 분야 확인", "Precision machining"), org: l("ㅈㅅ진흥원", "JS Agency"), year: 2021 },
];

// 공지 작성일은 오늘 기준 며칠 전(ago)으로 두고, 본문의 날짜도 오늘에서 계산한다.
const EN_MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const koMD = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const enMD = (d: Date) => `${EN_MONTH[d.getMonth()]} ${d.getDate()}`;

function makeNotices(today: Date): { title: L; date: string; body: L }[] {
  const at = (n: number) => daysAgo(today, n);
  return [
    {
      title: l("명절 연휴 휴무 및 출하 일정 안내", "Holiday closure and shipping schedule"),
      date: fmtDash(at(22)),
      body: l(
        `${fmtKo(at(13))}부터 ${fmtKo(at(9))}까지 휴무합니다. ${koMD(at(14))}까지 출하 예정인 제품은 일정대로 출하하며, 연휴 중 접수된 견적문의는 ${koMD(at(8))}부터 순서대로 회신해 드립니다.`,
        `We are closed from ${enMD(at(13))} to ${enMD(at(9))}. Orders due by ${enMD(at(14))} ship as scheduled, and quote requests received during the holiday are answered from ${enMD(at(8))}.`,
      ),
    },
    {
      title: l("휴가 기간 하역장 운영 안내", "Loading dock hours during vacation"),
      date: fmtDash(at(75)),
      body: l(
        `${koMD(at(65))}부터 ${koMD(at(63))}까지 하역장은 오전 9시부터 12시까지만 운영합니다. 화물 납품은 전날까지 전화로 예약해 주시기 바랍니다.`,
        `From ${enMD(at(65))} to ${enMD(at(63))} the loading dock is open 09:00 to 12:00 only. Please book deliveries by phone the day before.`,
      ),
    },
    {
      title: l("ISO 13485 사후 심사 완료", "ISO 13485 surveillance audit completed"),
      date: fmtDash(at(111)),
      body: l("의료기기 품질경영시스템 사후 심사를 지적 사항 없이 마쳤습니다.", "The surveillance audit for our medical device quality management system was completed with no findings."),
    },
    {
      title: l("견적문의 메일 주소 분리 안내", "Separate email addresses for quotes"),
      date: fmtDash(at(189)),
      body: l(`가공 견적은 ${MAIL_QUOTE}, 그 밖의 문의는 ${MAIL_INFO}로 보내 주시기 바랍니다.`, `Please send machining quote requests to ${MAIL_QUOTE} and other inquiries to ${MAIL_INFO}.`),
    },
    {
      title: l("홈페이지 개편 안내", "Website renewal"),
      date: fmtDash(at(219)),
      body: l("설비현황과 생산제품 정보를 새로 정리하고, 견적문의에 도면 첨부 기능을 더했습니다.", "Facility and product information has been updated, and drawings can now be attached to quote requests."),
    },
  ];
}

const BUSINESS: Record<string, { desc: L; rows: [L, L][]; machines: MachineKey[] }> = {
  lathe: {
    desc: l(
      "축, 플랜지, 커넥터 같은 원통형 부품을 가공합니다.",
      "Cylindrical parts such as shafts, flanges and connectors.",
    ),
    rows: [
      [l("최대 가공 크기", "Max. size"), l("D300 x 길이 500 mm", "D300 x L500 mm")],
      [l("공차", "Tolerance"), l("+-0.01 mm (D200 이하)", "+-0.01 mm (up to D200)")],
      [l("주요 소재", "Materials"), l("스테인리스, 탄소강, 알루미늄, 황동, PEEK", "Stainless, carbon steel, aluminum, brass, PEEK")],
    ],
    machines: ["lathe", "turnMill"],
  },
  mct: {
    desc: l(
      "블록, 하우징, 베이스 플레이트 같은 각형 부품을 가공합니다.",
      "Prismatic parts such as blocks, housings and base plates.",
    ),
    rows: [
      [l("최대 가공 크기", "Max. size"), l("1,300 x 650 x 600 mm", "1,300 x 650 x 600 mm")],
      [l("공차", "Tolerance"), l("+-0.02 mm", "+-0.02 mm")],
      [l("주요 소재", "Materials"), l("알루미늄, 탄소강, 공구강, 엔지니어링 플라스틱", "Aluminum, carbon steel, tool steel, engineering plastics")],
    ],
    machines: ["vmc", "large"],
  },
  fiveAx: {
    desc: l(
      "여러 면에 경사 구멍이나 곡면이 있는 부품을 가공합니다. +-0.01mm 공차 부품은 항온 가공실에서 가공합니다.",
      "Parts with angled holes or curved faces on several sides. +-0.01 mm parts are machined in the temperature-controlled room.",
    ),
    rows: [
      [l("최대 가공 크기", "Max. size"), l("600 x 500 x 400 mm", "600 x 500 x 400 mm")],
      [l("공차", "Tolerance"), l("+-0.01 mm", "+-0.01 mm")],
      [l("주요 소재", "Materials"), l("알루미늄 7075, 스테인리스, 열처리 공구강", "Al 7075, stainless, hardened tool steel")],
    ],
    machines: ["fiveAx"],
  },
};

/* ---------- 페이지 ---------- */

export function CompanyDemo() {
  const [lang, setLang] = useState<Lang>("ko");
  const [route, setRoute] = useState<Route>({ m: "home", s: "" });
  const moved = useRef(false);

  const go = (m: MenuId | "home", s?: string) => {
    const sub = m === "home" ? "" : (s ?? MENUS.find((n) => n.id === m)!.subs[0].id);
    moved.current = true;
    setRoute({ m, s: sub });
    window.scrollTo({ top: 0 });
  };

  // 사용법 가이드가 하위 화면에서 열리면 첫 화면으로 돌아온다
  useEffect(() => {
    const f = () => setRoute({ m: "home", s: "" });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

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
  };

  return (
    <CoCtx.Provider value={ctx}>
      <div lang={lang} className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
        <TopBar onLang={setLang} />
        <Header />
        <main key={key} className="soft-in">{route.m === "home" ? <Home /> : <SubPage m={route.m} s={route.s} />}</main>
        <Footer />
      </div>
    </CoCtx.Provider>
  );
}

/* ---------- 로고, 맨 위 띠, 머리글 ---------- */

function Logo() {
  const { lang } = useCo();
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2.5">
      <span className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[18px] font-bold tracking-[-0.02em] sm:text-[20px]">{lang === "ko" ? "정밀가공 제조" : "Precision Machining"}</span>
      </span>
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

  // 사용법 가이드가 하위 화면에서 열리면 첫 화면으로 돌아온다
  useEffect(() => {
    const f = () => {
      setMega(false);
      setOpen(false);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

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
  const notices = makeNotices(useDemoToday());

  const specs = [
    { k: x("최소 공차", "Tightest tolerance"), v: "+-0.01", u: "mm" },
    { k: x("최대 가공 크기", "Max. part size"), v: "1,300x650x600", u: "mm" },
    { k: x("선반 최대 지름", "Max. turning dia."), v: "300", u: "mm" },
  ];

  const links = [
    { t: x("기계설비", "Machining Equipment"), to: () => go("equipment", "machines") },
    { t: x("측정설비", "Measuring Equipment"), to: () => go("equipment", "measuring") },
    { t: x("가공 사양", "Machining Specs"), to: () => go("equipment", "spec") },
    { t: x("인증현황", "Certifications"), to: () => go("about", "certs") },
    { t: x("오시는 길", "Location"), to: () => go("about", "location") },
  ];

  const featured = (["semi", "medical", "battery", "robot"] as const).map((c) => PRODUCTS.find((p) => p.cat === c)!);

  return (
    <>
      <section aria-labelledby="co-page-title" className="relative overflow-hidden" style={{ background: C.steel, color: C.white }}>
        <Image src={`${IMG}/hero.jpg`} alt="정밀가공 공장 내부" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(20,24,29,0.9) 0%, rgba(20,24,29,0.72) 55%, rgba(20,24,29,0.45) 100%)" }} aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-4 pb-14 pt-14 md:px-6 md:pb-20 md:pt-24">
          <h1 id="co-page-title" tabIndex={-1} className="text-[34px] font-bold leading-[1.25] tracking-[-0.03em] outline-none md:text-[52px]">
            {x("반도체, 의료기기 정밀부품 가공", "Precision parts for semiconductor and medical equipment")}
          </h1>
          <p className="mt-3 text-[18px] font-bold md:text-[22px]" style={{ color: C.orange }}>
            {x("CNC 선반, MCT, 5축 정밀부품 가공", "CNC turning, MCT and 5-axis precision parts")}
          </p>
          <p className="mt-4 max-w-[560px] text-[16px] md:text-[18px]" style={{ color: "#d4d8de" }}>
            {x("반도체 장비, 의료기기, 2차전지 설비 부품 정밀가공. 시제품 1개부터 양산까지 가능합니다.", "Parts for semiconductor equipment, medical devices and battery lines. Single prototypes welcome.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => go("equipment", "machines")} className="inline-flex h-12 items-center rounded-[4px] px-6 font-bold" style={{ background: C.orange, color: C.steel }}>
              {x("설비현황 보기", "View Facilities")}
            </button>
            <button type="button" onClick={() => go("support", "quote")} className="inline-flex h-12 items-center rounded-[4px] border px-6 font-bold" style={{ borderColor: "rgba(255,255,255,0.5)", color: C.white }}>
              {x("견적문의", "Request a Quote")}
            </button>
          </div>
          <dl className="mt-12 flex max-w-[880px] flex-wrap gap-x-8 gap-y-3 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
            {specs.map((sp) => (
              <div key={sp.k}>
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

      <section id="co-quick" aria-label={x("바로가기", "Quick links")} className="px-4 pt-10 md:px-6 md:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_0.9fr]">
            <button type="button" onClick={() => go("business", "lathe")} className="group relative block h-[150px] overflow-hidden rounded-[4px] text-left md:h-[190px]" style={{ background: C.steel }}>
              <Image src={`${IMG}/parts.jpg`} alt="선반으로 가공한 금속 부품" fill sizes="(min-width: 768px) 36vw, 100vw" className="object-cover opacity-70 transition-opacity group-hover:opacity-55" />
              <span className="absolute inset-x-0 bottom-0 p-4 md:p-5" style={{ color: C.white, background: "linear-gradient(0deg, rgba(20,24,29,0.85), rgba(20,24,29,0))" }}>
                <span className="block text-[13px]" style={{ color: "#d4d8de" }}>{x("사업분야", "Business")}</span>
                <span className="block text-[20px] font-bold md:text-[23px]">{x("CNC 선반 가공", "CNC Turning")}</span>
                <span className="block text-[14px]" style={{ color: "#d4d8de" }}>{x("최대 D300, 복합 선반 Y축 가공", "Up to D300, turn-mill with Y-axis")}</span>
              </span>
            </button>
            <button type="button" onClick={() => go("business", "fiveAx")} className="group relative block h-[150px] overflow-hidden rounded-[4px] text-left md:h-[190px]" style={{ background: C.steel }}>
              <Image src={`${IMG}/worker.jpg`} alt="5축 가공기를 다루는 작업자" fill sizes="(min-width: 768px) 36vw, 100vw" className="object-cover object-[70%_50%] opacity-70 transition-opacity group-hover:opacity-55" />
              <span className="absolute inset-x-0 bottom-0 p-4 md:p-5" style={{ color: C.white, background: "linear-gradient(0deg, rgba(20,24,29,0.85), rgba(20,24,29,0))" }}>
                <span className="block text-[13px]" style={{ color: "#d4d8de" }}>{x("사업분야", "Business")}</span>
                <span className="block text-[20px] font-bold md:text-[23px]">{x("MCT, 5축 가공", "MCT and 5-Axis")}</span>
                <span className="block text-[14px]" style={{ color: "#d4d8de" }}>{x("X1,300 대형 가공, 동시 5축", "Large parts to X1,300, simultaneous 5-axis")}</span>
              </span>
            </button>
            <button type="button" onClick={() => go("support", "quote")} className="flex h-[150px] flex-col justify-between rounded-[4px] p-4 text-left transition-[filter] hover:brightness-95 md:h-[190px] md:p-5" style={{ background: C.orange, color: C.steel }}>
              <span>
                <span className="block text-[20px] font-bold md:text-[23px]">{x("견적문의", "Request a Quote")}</span>
                <span className="mt-1 block text-[14px] leading-[1.5]">{x("도면 파일 첨부 접수", "Drawing files accepted")}</span>
              </span>
              <span className="text-[22px] font-bold tabular-nums">{TEL}</span>
            </button>
          </div>
          <ul className="mt-4 flex flex-wrap items-center border-b pb-4 text-[15px]" style={{ borderColor: C.line }}>
            {links.map((q, i) => (
              <li key={q.t} className="flex items-center">
                {i > 0 && <span className="mx-3 h-3 w-px" style={{ background: C.line }} aria-hidden />}
                <button type="button" onClick={q.to} className="inline-flex h-10 items-center font-bold hover:underline" style={{ color: C.ink }}>
                  {q.t}
                </button>
              </li>
            ))}
          </ul>
        </div>
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
              {notices.slice(0, 4).map((n) => (
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
                <dt style={{ color: C.muted }}>{x("내비게이션", "Navigation")}</dt>
                <dd>{x("정밀가공 제조 ㅎㄷ공장", "Precision Machining HD Plant")}</dd>
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-2">
                <dt style={{ color: C.muted }}>{x("주차", "Parking")}</dt>
                <dd>{x("정문 오른쪽 방문 주차장", "Visitor lot right of the main gate")}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => go("about", "location")}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-[4px] border px-4 text-[15px] font-bold"
              style={{ background: C.steel, color: C.white, borderColor: C.steel }}
            >
              {x("오시는 길 자세히 보기", "Directions")}
            </button>
          </div>
        </div>
      </section>
    </>
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
      <section className="relative overflow-hidden px-4 md:px-6" style={{ background: C.steel, color: C.white }}>
        <Image src={`${IMG}/worker.jpg`} alt="가공 장비 앞의 작업자" fill sizes="100vw" className="object-cover object-[50%_40%]" />
        <div className="absolute inset-0" style={{ background: "rgba(20,24,29,0.78)" }} aria-hidden />
        <div className="relative mx-auto max-w-[1200px] py-9 md:py-14">
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
    case "equipment/spec":
      return <MachiningSpec />;
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
        <p className="text-[19px] font-bold leading-[1.6] md:text-[21px]">{x("정밀가공 제조 홈페이지를 찾아 주셔서 감사합니다.", "Thank you for visiting our website.")}</p>
        <p>
          {x(
            "2009년 머시닝센터 2대로 창업한 이래 반도체 장비, 의료기기, 2차전지 설비 부품을 가공하고 있습니다.",
            "We started in 2009 with two machining centers. Today we make parts for semiconductor equipment, medical devices and battery lines.",
          )}
        </p>
        <p>
          {x(
            "도면 검토 단계에서 누락된 치수나 가공이 어려운 형상을 미리 확인해 드립니다. 앞으로도 많은 이용과 격려 부탁드립니다.",
            "If a drawing is missing dimensions or has features that are hard to machine, we will tell you when we quote.",
          )}
        </p>
        <p className="pt-4 text-right font-bold">{x("대표이사 김ㅈ우", "Kim J.W., CEO")}</p>
      </div>
    </div>
  );
}

function Overview() {
  const { x, s } = useCo();
  const rows: [string, string][] = [
    [x("회사명", "Company"), s(COMPANY)],
    [x("대표이사", "CEO"), x("김ㅈ우", "Kim J.W.")],
    [x("설립", "Founded"), x("2009년 3월 (2012년 법인 전환)", "March 2009 (incorporated 2012)")],
    [x("직원", "Employees"), x("46명", "46")],
    [x("주요 사업", "Business"), x("CNC 선반, MCT, 5축 정밀부품 가공", "CNC turning, MCT and 5-axis precision machining")],
    [x("주요 고객 산업", "Industries"), x("반도체 장비, 의료기기, 2차전지 장비, 로봇, 자동화", "Semiconductor equipment, medical devices, battery equipment, robotics")],
    [x("보유 설비", "Equipment"), x(`가공 설비 ${MACHINE_TOTAL}대, 측정 설비 ${MEASURES.reduce((n, v) => n + v.count, 0)}대`, `${MACHINE_TOTAL} machines, ${MEASURES.reduce((n, v) => n + v.count, 0)} measuring instruments`)],
    [x("사업장", "Plant"), x("대지 3,300m2, 건물 2,150m2 (항온 가공실, 3차원 측정실)", "Site 3,300 m2, building 2,150 m2 (temperature-controlled room, CMM room)")],
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
  const { x, s } = useCo();

  return (
    <div>
      <dl className="border-t-2 text-[15px] md:text-[16px]" style={{ borderColor: C.steel }}>
        {(
          [
            [x("주소", "Address"), s(ADDRESS)],
            [x("내비게이션", "Navigation"), x("정밀가공 제조 ㅎㄷ공장", "Precision Machining HD Plant")],
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

      <h3 className="mt-10 text-[18px] font-bold">{x("방문 안내", "Visiting")}</h3>
      <div className="mt-3 max-w-[760px] space-y-2">
        <p>{x("정문으로 들어와 오른쪽 방문 주차장에 주차해 주십시오. 경비실에서 방문증을 받으시면 됩니다.", "Come in through the main gate and use the visitor lot on the right. Pick up a visitor pass at the guard house.")}</p>
        <p style={{ color: C.muted }}>{x("방문 상담은 하루 전까지 전화로 예약해 주시기 바랍니다.", "Please book visits by phone at least one day ahead.")}</p>
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
  const { x, s } = useCo();
  const [type, setType] = useState<EqType | "all">("all");
  const list = MACHINES.filter((m) => type === "all" || m.type === type);
  const sum = list.reduce((n, m) => n + m.count, 0);
  const types: [EqType | "all", string][] = [
    ["all", x("전체", "All")],
    ["mc", x("머시닝센터", "Machining centers")],
    ["fiveAx", x("5축 가공기", "5-axis")],
    ["lathe", x("CNC 선반", "CNC lathes")],
  ];

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
      <div key={type} className="soft-in mt-4">
        <DataTable
          caption={x("기계설비 현황", "Machining equipment")}
          head={[x("설비명", "Machine"), x("제조사", "Maker"), x("규격", "Spec"), x("대수", "Units"), x("도입", "Since")]}
          min={720}
          numCols={[3, 4]}
          rows={list.map((m) => [
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
            ])}
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
          "측정기는 매년 공인 교정기관에서 교정합니다. 측정 성적서는 요청 시 제품과 함께 보내 드립니다.",
          "Measuring instruments are calibrated by an accredited lab every year. Inspection reports are shipped with the parts on request.",
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

/* ---------- 가공 사양 ---------- */

const SPEC_ROWS: [L, L, string, L][] = [
  [l("CNC 선반", "CNC turning"), l("최대 D300, 길이 500 mm", "Max. D300, L500 mm"), "+-0.01", l("축, 플랜지, 부싱", "Shafts, flanges, bushings")],
  [l("복합 선반", "Turn-mill"), l("최대 D200, 길이 400 mm", "Max. D200, L400 mm"), "+-0.01", l("측면 구멍, 키홈이 있는 원통 부품", "Round parts with cross holes and keyways")],
  [l("머시닝센터", "Machining center"), l("850 x 500 x 500 mm", "850 x 500 x 500 mm"), "+-0.02", l("블록, 브래킷, 하우징", "Blocks, brackets, housings")],
  [l("대형 머시닝센터", "Large machining center"), l("1,300 x 650 x 600 mm", "1,300 x 650 x 600 mm"), "+-0.05", l("베이스 플레이트, 프레임", "Base plates, frames")],
  [l("5축 가공", "5-axis"), l("600 x 500 x 400 mm", "600 x 500 x 400 mm"), "+-0.01", l("다면 가공, 곡면 부품", "Multi-face and curved parts")],
];

const MATERIAL_ROWS: [L, L][] = [
  [l("알루미늄", "Aluminum"), l("A6061, A7075, A5052", "A6061, A7075, A5052")],
  [l("스테인리스", "Stainless steel"), l("SUS303, SUS304, SUS316L", "SUS303, SUS304, SUS316L")],
  [l("탄소강, 공구강", "Carbon and tool steel"), l("S45C, SCM440, SKD11", "S45C, SCM440, SKD11")],
  [l("엔지니어링 플라스틱", "Engineering plastics"), l("PEEK, POM, MC나일론", "PEEK, POM, MC nylon")],
];

function MachiningSpec() {
  const { x, s, go } = useCo();
  return (
    <div className="space-y-10">
      <section aria-labelledby="co-spec-size">
        <h3 id="co-spec-size" className="text-[19px] font-bold">
          {x("가공 방식별 사양", "Specifications by process")}
        </h3>
        <div className="mt-3">
          <DataTable
            caption={x("가공 방식별 최대 크기와 공차", "Maximum size and tolerance by process")}
            head={[x("가공 방식", "Process"), x("최대 가공 크기", "Max. size"), x("공차(mm)", "Tolerance (mm)"), x("주요 가공품", "Typical parts")]}
            min={720}
            rows={SPEC_ROWS.map(([a, b, c, d]) => [s(a), <span key="b" className="tabular-nums">{s(b)}</span>, <span key="c" className="tabular-nums">{c}</span>, s(d)])}
          />
        </div>
      </section>
      <section aria-labelledby="co-spec-mat">
        <h3 id="co-spec-mat" className="text-[19px] font-bold">
          {x("가공 소재", "Materials")}
        </h3>
        <div className="mt-3 max-w-[760px]">
          <DataTable caption={x("가공 소재", "Materials")} head={[x("구분", "Group"), x("주요 재질", "Grades")]} min={420} rows={MATERIAL_ROWS.map(([a, b]) => [s(a), s(b)])} />
        </div>
      </section>
      <section aria-labelledby="co-spec-qty" className="max-w-[760px]">
        <h3 id="co-spec-qty" className="text-[19px] font-bold">
          {x("수량과 검사", "Quantity and inspection")}
        </h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>{x("시제품 1개부터 월 수천 개 양산까지 대응합니다.", "From a single prototype to several thousand parts a month.")}</li>
          <li>{x("+-0.01 mm 부품은 항온 가공실에서 가공하고 3차원 측정기로 전수 검사합니다.", "+-0.01 mm parts are machined in the temperature-controlled room and fully inspected on the CMM.")}</li>
          <li>{x("요청 시 성적서(치수 측정 결과)를 함께 납품합니다.", "Inspection reports are supplied on request.")}</li>
        </ul>
        <button type="button" onClick={() => go("support", "quote")} className="mt-6 inline-flex h-12 items-center rounded-[4px] px-6 font-bold" style={{ background: C.orange, color: C.steel }}>
          {x("도면 첨부 견적문의", "Request a quote with drawings")}
        </button>
      </section>
    </div>
  );
}

/* ---------- 생산제품 ---------- */

function Products({ cat }: { cat: PrCat | "all" }) {
  const { x } = useCo();
  const list = PRODUCTS.filter((p) => cat === "all" || p.cat === cat);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px]" style={{ color: C.muted }}>
          {x("고객사 보안을 위해 형상은 공개하지 않습니다.", "Part shapes are not shown to protect customer confidentiality.")}
        </p>
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
  const today = useDemoToday();
  const NOTICES = makeNotices(today);
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
  const { x, s } = useCo();
  const reduce = useReducedMotionSafe();
  const [memo, setMemo] = useState("");
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [qType, setQType] = useState(0);
  const [subject, setSubject] = useState("");
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
    if (person.trim().length < 2) next.person = x("담당자명을 입력해 주십시오.", "Enter the contact person's name.");
    if (phone.replace(/\D/g, "").length < 9) next.phone = x("연락처를 확인해 주십시오.", "Enter a phone number with at least 9 digits.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = x("이메일 형식을 확인해 주십시오.", "Check the email format.");
    if (!subject.trim()) next.subject = x("문의제목을 입력해 주십시오.", "Enter a subject.");
    if (due && new Date(`${due}T00:00:00`) < tomorrow) next.due = x("희망 납기는 내일 이후 날짜로 선택해 주십시오.", "Choose a date from tomorrow onward.");
    if (memo.trim().length < 10) next.content = x("문의내용을 입력해 주십시오.", "Enter at least 10 characters.");
    if (errors.file) next.file = errors.file;
    if (!agree) next.agree = x("개인정보 수집, 이용에 동의해 주십시오.", "Please agree to the collection of personal data.");
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
                  <input id="q-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" placeholder={x("(주)ㅎㄴ테크", "HN Tech Co., Ltd.")} className={inputCls} style={border("company")} {...aria("company")} />
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
                    {x("PDF, DWG, DXF, STEP, IGES, ZIP 파일 (최대 30MB)", "PDF, DWG, DXF, STEP, IGES, ZIP (up to 30 MB)")}
                  </p>
                  {errText("file")}
                </div>

                <div className="sm:col-span-2 rounded-[4px] border p-4" style={{ borderColor: C.line }}>
                  <p className="text-[14px]" style={{ color: C.muted }}>
                    {x("수집 항목: 회사명, 담당자명, 연락처, 이메일. 보관 기간: 문의 처리 후 1년.", "Collected: company, name, phone, email. Kept for one year after the inquiry.")}
                  </p>
                  <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-[15px]">
                    <input id="q-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#1e2329]" {...aria("agree")} />
                    <span>{x("개인정보 수집, 이용에 동의합니다.", "I agree to the collection and use of personal data.")}</span>
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
  const { s, go } = useCo();
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
          <Logo />
        </div>
        <DemoMakerInfo className="mt-5" />
      </div>
    </footer>
  );
}
