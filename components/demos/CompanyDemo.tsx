"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Bus, Car, Check, CircleAlert, Clock, FileUp, Menu, RotateCcw, Trash2, Truck, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 기업 홈페이지 데모: 가상의 (주)○○정밀, CNC 정밀 가공 제조업체.
   회사명, 대표자, 주소, 전화번호, 사업자 정보, 설비 모델명, 거래처, 인증 기관은 모두 가상이다.

   디자인: 철판 같은 짙은 회색(#1e2329)과 옅은 회색(#f2f3f5)에 안전 주황(#f26a1b) 하나만 쓴다.
   도면처럼 가는 격자선을 깔고, 모서리는 4~6px로 각지게, 치수와 사양 숫자는 고정폭 숫자로 맞춘다.

   머리글의 한국어/English 버튼은 사전 객체에서 문구를 바꿔 끼우고, 바깥 div의 lang도 함께 바꾼다.
   가공 범위 확인은 소재, 크기, 공차, 수량을 넣으면 설비 가공 범위(5축 600×500×400, 선반 Ø300 등)와 비교해
   가공 가능 또는 상담 필요를 이유와 함께 보여 주고, 쓸 설비와 대략적인 납기, 축척대로 그린 부품 그림을 낸다.
   보유 설비는 종류별로 거르는 사양표, 생산 품목은 산업별로 거르는 카드로 보여 준다.
   연혁은 넓은 화면에서 가로, 좁은 화면에서 세로로 놓이고 스크롤하면 차례로 나타난다.
   견적 문의는 도면 파일을 골라도 이름과 크기만 보여 주고 어디에도 올리지 않으며, 접수번호와 가린 담당자 정보로 끝난다.

   사진 출처(public/images/demo-company):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, parts */

const IMG = "/images/demo-company";
const TEL = "031-000-0000";
const FAX = "031-000-0001";
const EMAIL = "sales@example.com";

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
  orangeSoft: "#fdeee4",
  ok: "#1d6f45",
  okSoft: "#e4f2ea",
  error: "#b3261e",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const GRID_LIGHT = {
  backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
  backgroundSize: "32px 32px",
};

const GRID_DARK = {
  backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

/* ---------- 언어 ---------- */

type Lang = "ko" | "en";
type L = { ko: string; en: string };

type MachineKey = "vmc" | "large" | "fiveAx" | "lathe" | "turnMill";
type Material = "al" | "sus" | "steel" | "plastic";
type Tol = "0.1" | "0.05" | "0.01";

const KO = {
  company: "(주)○○정밀",
  toTop: "처음으로",
  mainMenu: "주 메뉴",
  menuOpen: "메뉴 열기",
  menuClose: "메뉴 닫기",
  langGroup: "언어 선택",
  call: "전화",
  nav: { about: "회사 소개", check: "가공 범위 확인", equipment: "보유 설비", products: "생산 품목", history: "연혁·인증", quote: "견적 문의" },

  heroTag: "□□산업단지 CNC 정밀 가공",
  heroLead:
    "반도체 장비, 의료기기, 2차전지 설비에 들어가는 금속·플라스틱 부품을 시제품 1개부터 월 수천 개까지 가공합니다. 출하하는 모든 로트는 3차원 측정기로 검사합니다.",
  heroAlt: "CNC 가공기가 줄지어 선 공장 내부",
  heroSpecs: [
    { k: "최소 공차", v: "±0.01", u: "mm" },
    { k: "최대 가공 크기", v: "1,300×650×600", u: "mm" },
    { k: "선반 최대 지름", v: "Ø300", u: "mm" },
    { k: "시제품 납기", v: "5", u: "영업일부터" },
  ],
  btnCheck: "가공 가능 여부 확인",
  btnQuote: "견적 문의",

  aboutTag: "회사 소개",
  aboutTitle: "2009년부터 정밀 부품 가공 한 가지만 해 왔습니다",
  aboutBody: [
    "머시닝센터 두 대로 시작해 지금은 5축 가공기와 항온 가공실, 3차원 측정실을 갖추고 있습니다.",
    "도면 검토와 가공, 표면 처리 협력사 관리, 측정 성적서 발행까지 한 곳에서 맡습니다. 도면에 빠진 치수나 가공이 어려운 형상은 견적 단계에서 먼저 말씀드립니다.",
  ],
  partsAlt: "가공을 마친 알루미늄과 스테인리스 정밀 부품",
  stats: [
    { k: "설립", u: "년" },
    { k: "직원", u: "명" },
    { k: "보유 설비", u: "대" },
    { k: "거래처", u: "곳" },
  ],

  checkTag: "가공 범위 확인",
  checkTitle: "도면 보내기 전에 가공할 수 있는지 먼저 보세요",
  checkDesc: "소재와 크기, 공차, 수량을 넣으면 어느 설비에서 가공할지와 대략적인 납기가 나옵니다. 정확한 판단은 도면을 보고 드립니다.",
  shape: "형태",
  shapeBlock: "각형 부품",
  shapeRound: "원통형 부품",
  material: "소재",
  materials: { al: "알루미늄", sus: "스테인리스", steel: "탄소강", plastic: "엔지니어링 플라스틱" } as Record<Material, string>,
  size: "크기 (mm)",
  sx: "가로 X",
  sy: "세로 Y",
  sz: "높이 Z",
  dia: "지름 Ø",
  len: "길이",
  tol: "공차",
  qty: "수량",
  qtyUnit: "개",
  ok: "가공 가능",
  consult: "상담 필요",
  machine: "가공 설비",
  lead: "예상 납기",
  leadDays: (a: number, b: number) => `${a}~${b}영업일`,
  leadNone: "도면 검토 후 안내",
  noMachine: "보유 설비 밖",
  envLabel: "설비 가공 범위",
  partLabel: "입력한 부품",
  needInput: "크기와 수량을 1 이상 숫자로 넣어 주세요.",
  toQuote: "이 조건으로 견적 문의",
  drawingLabel: (env: string, part: string) => `설비 가공 범위 ${env} 안에 부품 ${part}을 같은 비율로 그린 그림`,
  quoteMemo: (s: string) => `가공 범위 확인에서 넣은 조건입니다.\n${s}\n`,
  rFit: (m: string, env: string) => `${m} 가공 범위(${env}) 안에 들어갑니다.`,
  rTol5ax: "±0.01 공차는 항온 가공실의 5축 가공기에서 가공하고 3차원 측정기로 전수 검사합니다.",
  rTolBig: "±0.01 공차는 600×500×400mm 이내 부품까지 맞출 수 있습니다. 크기나 공차를 함께 검토해야 합니다.",
  rTooBig: "보유 설비의 최대 가공 범위(1,300×650×600mm)를 넘습니다. 나눠서 가공한 뒤 조립하는 방법을 검토합니다.",
  rLatheBig: "선반 최대 가공 범위(Ø300 × 길이 500mm)를 넘습니다.",
  rRound01: "지름 200mm가 넘는 원통 부품의 ±0.01 공차는 연삭 공정을 따로 검토해야 합니다.",
  rPlastic: "엔지니어링 플라스틱은 온도에 따라 치수가 변해 ±0.01 공차를 유지하기 어렵습니다.",
  rSus: "스테인리스는 공구 마모가 커서 납기를 이틀 더 잡습니다.",
  rThin: "가장 얇은 쪽이 3mm보다 얇아 가공 중 휨을 먼저 확인해야 합니다.",
  rQty: "500개가 넘는 수량은 양산 일정과 단가를 따로 협의합니다.",

  eqTag: "보유 설비",
  eqTitle: "공정별 보유 설비",
  eqDesc: "모든 가공기는 해마다 정도 검사를 받고, 측정기는 공인 교정기관에서 교정합니다.",
  eqFilter: "설비 종류",
  eqTypes: { all: "전체", mc: "머시닝센터", fiveAx: "5축", lathe: "CNC 선반", cmm: "측정기" } as Record<EqType | "all", string>,
  eqHead: { name: "설비", type: "종류", spec: "가공·측정 범위", perf: "주축 회전수·정밀도", count: "대수", year: "도입" },
  eqCaption: "보유 설비 사양표",
  eqTotal: (n: number) => `${n}대`,
  eqSum: (n: number) => `선택한 종류 ${n}대`,

  prTag: "생산 품목",
  prTitle: "지금 만들고 있는 부품",
  prDesc: "고객사 도면은 공개하지 않아 품목과 사양만 적었습니다.",
  prFilter: "산업 분류",
  prCats: { all: "전체", semi: "반도체 장비", medical: "의료기기", battery: "2차전지 장비", robot: "로봇·자동화" } as Record<PrCat | "all", string>,
  prRows: { material: "소재", tol: "공차", machine: "설비", qty: "수량" },

  hiTag: "연혁·인증",
  hiTitle: "연혁",
  certTitle: "인증 현황",

  qTag: "견적 문의",
  qTitle: "도면을 보내 주시면 견적을 드립니다",
  qDesc: `영업일 기준 하루 안에 담당 엔지니어가 연락드립니다. 급한 건은 ${TEL}로 전화 주세요.`,
  fCompany: "회사명",
  fPerson: "담당자",
  fPhone: "연락처",
  fEmail: "이메일",
  fFile: "도면 파일",
  fFileBtn: "파일 선택",
  fFileHint: "PDF, DWG, DXF, STEP, IGES, ZIP 파일, 30MB까지",
  fFileRemove: "파일 빼기",
  fFileNote: "데모 화면이라 파일은 어디에도 올리지 않습니다.",
  fDue: "희망 납기",
  fContent: "문의 내용",
  fContentPh: "소재, 수량, 표면 처리, 열처리 여부를 적어 주세요.",
  fAgree: "개인정보 수집·이용에 동의합니다. 수집 항목: 회사명, 담당자, 연락처, 이메일. 보관 기간: 문의 처리 후 1년.",
  required: "필수",
  submit: "견적 문의 보내기",
  errSummary: "입력 내용을 확인해 주세요.",
  err: {
    company: "회사명을 적어 주세요.",
    person: "담당자 이름을 두 글자 이상 적어 주세요.",
    phone: "연락처를 9자리 이상 숫자로 적어 주세요.",
    email: "이메일 형식을 확인해 주세요.",
    due: "희망 납기는 내일 이후 날짜로 골라 주세요.",
    content: "문의 내용을 10자 이상 적어 주세요.",
    agree: "개인정보 수집·이용에 동의해 주세요.",
    fileSize: "30MB가 넘는 파일은 메일로 보내 주세요.",
    fileType: "도면 파일 형식이 아닙니다.",
  },
  doneTitle: "견적 문의가 접수됐습니다",
  doneBody: (name: string) => `${name}님께 영업일 기준 하루 안에 연락드리겠습니다.`,
  receipt: "접수번호",
  noFile: "첨부 없음",
  again: "새 문의 쓰기",

  locTag: "오시는 길",
  locTitle: "□□산업단지 3블록에 있습니다",
  address: "□□시 □□구 □□산단로 00",
  hours: "평일 08:30 ~ 17:30, 토·일·공휴일 휴무",
  routes: [
    { k: "자가용", v: "□□IC에서 나와 산단로를 따라 10분. 공장 정문 옆 방문 주차장을 쓰시면 됩니다." },
    { k: "대중교통", v: "□□역에서 00번 버스를 타고 □□산업단지 3블록 정류장에서 내려 200m" },
    { k: "납품 차량", v: "2번 화물 출입구로 들어오세요. 5톤 화물차까지 하역할 수 있습니다." },
  ],
  map: { name: "(주)○○정밀", ic: "□□IC", stop: "3블록 정류장", road: "□□산단로", gate: "2번 화물 출입구", block: "3블록" },
  mapLabel: "□□IC에서 산단로를 따라 들어와 3블록 정류장 앞에 있는 공장 약도",

  foot: { name: "상호", ceo: "대표", biz: "사업자등록번호", addr: "주소", tel: "전화", fax: "팩스", email: "이메일" },
  ceo: "김○○",
};

type Dict = typeof KO;

const EN: Dict = {
  company: "○○ Precision Co., Ltd.",
  toTop: "home",
  mainMenu: "Main menu",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  langGroup: "Language",
  call: "Call",
  nav: { about: "About", check: "Machinability", equipment: "Equipment", products: "Products", history: "History", quote: "Request a quote" },

  heroTag: "CNC precision machining in □□ Industrial Complex",
  heroLead:
    "We machine metal and plastic parts for semiconductor equipment, medical devices and battery production lines, from a single prototype to several thousand pieces a month. Every lot is inspected on a CMM before shipping.",
  heroAlt: "Rows of CNC machines on a factory floor",
  heroSpecs: [
    { k: "Tightest tolerance", v: "±0.01", u: "mm" },
    { k: "Max. part size", v: "1,300×650×600", u: "mm" },
    { k: "Max. turning dia.", v: "Ø300", u: "mm" },
    { k: "Prototype lead time", v: "5", u: "business days" },
  ],
  btnCheck: "Check machinability",
  btnQuote: "Request a quote",

  aboutTag: "About us",
  aboutTitle: "Precision machining is all we have done since 2009",
  aboutBody: [
    "We started with two machining centers. Today we run 5-axis machines, a temperature-controlled machining room and a CMM room.",
    "Drawing review, machining, surface treatment through partners and inspection reports are all handled in one place. Missing dimensions or hard-to-machine features are raised at the quotation stage.",
  ],
  partsAlt: "Finished aluminum and stainless steel precision parts",
  stats: [
    { k: "Founded", u: "" },
    { k: "Employees", u: "" },
    { k: "Machines", u: "" },
    { k: "Customers", u: "" },
  ],

  checkTag: "Machinability",
  checkTitle: "Check whether we can make it before sending drawings",
  checkDesc: "Enter material, size, tolerance and quantity to see which machine would be used and a rough lead time. Final review is done with your drawing.",
  shape: "Shape",
  shapeBlock: "Prismatic",
  shapeRound: "Cylindrical",
  material: "Material",
  materials: { al: "Aluminum", sus: "Stainless steel", steel: "Carbon steel", plastic: "Engineering plastic" },
  size: "Size (mm)",
  sx: "Width X",
  sy: "Depth Y",
  sz: "Height Z",
  dia: "Dia. Ø",
  len: "Length",
  tol: "Tolerance",
  qty: "Quantity",
  qtyUnit: "pcs",
  ok: "Machinable",
  consult: "Consultation needed",
  machine: "Machine",
  lead: "Est. lead time",
  leadDays: (a: number, b: number) => `${a} to ${b} business days`,
  leadNone: "After drawing review",
  noMachine: "Beyond our machines",
  envLabel: "Machine envelope",
  partLabel: "Your part",
  needInput: "Enter size and quantity as numbers of 1 or more.",
  toQuote: "Request a quote with these conditions",
  drawingLabel: (env: string, part: string) => `Part ${part} drawn to scale inside the machine envelope ${env}`,
  quoteMemo: (s: string) => `Conditions from the machinability check:\n${s}\n`,
  rFit: (m: string, env: string) => `Fits within the ${m} envelope (${env}).`,
  rTol5ax: "±0.01 parts are machined on the 5-axis machine in the temperature-controlled room and 100% inspected on the CMM.",
  rTolBig: "±0.01 tolerance is available for parts up to 600×500×400 mm. Size or tolerance needs to be reviewed.",
  rTooBig: "Exceeds our largest envelope (1,300×650×600 mm). Machining in sections and assembling may be an option.",
  rLatheBig: "Exceeds our lathe capacity (Ø300 × L500 mm).",
  rRound01: "±0.01 on cylindrical parts over Ø200 needs a separate grinding review.",
  rPlastic: "Engineering plastics change size with temperature, so holding ±0.01 is difficult.",
  rSus: "Stainless steel wears tools faster, so two extra days are added.",
  rThin: "The thinnest side is under 3 mm, so distortion during machining must be checked first.",
  rQty: "Quantities over 500 need a separate schedule and price agreement.",

  eqTag: "Equipment",
  eqTitle: "Equipment by process",
  eqDesc: "All machines are checked for accuracy every year, and measuring instruments are calibrated by an accredited lab.",
  eqFilter: "Equipment type",
  eqTypes: { all: "All", mc: "Machining center", fiveAx: "5-axis", lathe: "CNC lathe", cmm: "Measuring" },
  eqHead: { name: "Machine", type: "Type", spec: "Travel / range", perf: "Spindle / accuracy", count: "Units", year: "Since" },
  eqCaption: "Equipment specifications",
  eqTotal: (n: number) => `${n}`,
  eqSum: (n: number) => `${n} units in this type`,

  prTag: "Products",
  prTitle: "Parts we are making now",
  prDesc: "Customer drawings are confidential, so only part names and specifications are listed.",
  prFilter: "Industry",
  prCats: { all: "All", semi: "Semiconductor", medical: "Medical", battery: "Battery equipment", robot: "Robotics" },
  prRows: { material: "Material", tol: "Tolerance", machine: "Machine", qty: "Quantity" },

  hiTag: "History",
  hiTitle: "Company history",
  certTitle: "Certifications",

  qTag: "Request a quote",
  qTitle: "Send us your drawing for a quotation",
  qDesc: `An engineer will contact you within one business day. For urgent requests, call ${TEL}.`,
  fCompany: "Company",
  fPerson: "Contact person",
  fPhone: "Phone",
  fEmail: "Email",
  fFile: "Drawing file",
  fFileBtn: "Choose file",
  fFileHint: "PDF, DWG, DXF, STEP, IGES, ZIP, up to 30 MB",
  fFileRemove: "Remove file",
  fFileNote: "This is a demo, so files are not uploaded anywhere.",
  fDue: "Required delivery date",
  fContent: "Details",
  fContentPh: "Material, quantity, surface finish, heat treatment",
  fAgree: "I agree to the collection and use of personal data (company, name, phone, email), kept for one year after the inquiry.",
  required: "required",
  submit: "Send request",
  errSummary: "Please check the highlighted fields.",
  err: {
    company: "Enter your company name.",
    person: "Enter the contact person's name.",
    phone: "Enter a phone number with at least 9 digits.",
    email: "Check the email format.",
    due: "Choose a date from tomorrow onward.",
    content: "Enter at least 10 characters.",
    agree: "Please agree to the collection of personal data.",
    fileSize: "Files over 30 MB should be sent by email.",
    fileType: "This is not a supported drawing format.",
  },
  doneTitle: "Your request has been received",
  doneBody: (name: string) => `We will contact ${name} within one business day.`,
  receipt: "Reference no.",
  noFile: "No file",
  again: "Write a new request",

  locTag: "Location",
  locTitle: "Block 3, □□ Industrial Complex",
  address: "00 □□sandan-ro, □□-gu, □□-si",
  hours: "Weekdays 08:30 to 17:30, closed on weekends and holidays",
  routes: [
    { k: "By car", v: "10 minutes from □□ IC along Sandan-ro. Visitor parking is next to the main gate." },
    { k: "By bus", v: "Bus 00 from □□ Station, get off at the Block 3 stop and walk 200 m." },
    { k: "Deliveries", v: "Use freight gate 2. Trucks up to 5 tons can unload." },
  ],
  map: { name: "○○ Precision", ic: "□□ IC", stop: "Block 3 stop", road: "Sandan-ro", gate: "Freight gate 2", block: "Block 3" },
  mapLabel: "Map showing the factory in front of the Block 3 bus stop, reached from □□ IC along Sandan-ro",

  foot: { name: "Company", ceo: "CEO", biz: "Business reg. no.", addr: "Address", tel: "Tel", fax: "Fax", email: "Email" },
  ceo: "Kim ○○",
};

const DICT: Record<Lang, Dict> = { ko: KO, en: EN };

const LangCtx = createContext<{ lang: Lang; t: Dict }>({ lang: "ko", t: KO });
const useLang = () => useContext(LangCtx);
const tr = (l: L, lang: Lang) => l[lang];

/* ---------- 도우미 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘 → 김ㅎ늘 */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + hide(chars[1]);
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

/* ---------- 페이지 ---------- */

export function CompanyDemo() {
  const [lang, setLang] = useState<Lang>("ko");
  const [memo, setMemo] = useState("");
  const t = DICT[lang];

  return (
    <LangCtx.Provider value={{ lang, t }}>
      <div lang={lang} className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
        <Header onLang={setLang} />
        <main>
          <Hero />
          <About />
          <Checker onQuote={setMemo} />
          <Equipment />
          <Products />
          <History />
          <Quote memo={memo} setMemo={setMemo} />
          <Location />
        </main>
        <Footer />
      </div>
    </LangCtx.Provider>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  const { t } = useLang();
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2.5">
      <svg className="shrink-0" width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect x="1" y="1" width="28" height="28" rx="4" fill={light ? C.white : C.steel} />
        <circle cx="15" cy="15" r="7.5" fill="none" stroke={C.orange} strokeWidth="2.4" />
        <path d="M15 4.5 V10 M15 20 V25.5 M4.5 15 H10 M20 15 H25.5" stroke={light ? C.steel : C.white} strokeWidth="1.6" />
      </svg>
      <span className="truncate text-[17px] font-bold tracking-[-0.02em] sm:text-[18px]">{t.company}</span>
    </span>
  );
}

const NAV_IDS = ["about", "check", "equipment", "products", "history", "quote"] as const;

function LangSwitch({ onLang }: { onLang: (l: Lang) => void }) {
  const { lang, t } = useLang();
  return (
    <div role="group" aria-label={t.langGroup} className="inline-flex h-10 overflow-hidden rounded-[4px] border text-[14px] font-bold" style={{ borderColor: C.line }}>
      {(
        [
          ["ko", "한국어"],
          ["en", "EN"],
        ] as const
      ).map(([v, label]) => (
        <button
          key={v}
          type="button"
          lang={v}
          aria-pressed={lang === v}
          onClick={() => onLang(v)}
          className="px-3"
          style={lang === v ? { background: C.steel, color: C.white } : { background: C.white, color: C.muted }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Header({ onLang }: { onLang: (l: Lang) => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${t.company} ${t.toTop}`} className="flex min-w-0">
          <Logo />
        </a>
        <nav aria-label={t.mainMenu} className="hidden xl:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="transition-colors hover:text-[#b8480a]" style={{ color: C.muted }}>
                  {t.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LangSwitch onLang={onLang} />
          <a href="#quote" className="hidden h-10 items-center rounded-[4px] px-4 text-[15px] font-bold md:inline-flex" style={{ background: C.orange, color: C.steel }}>
            {t.btnQuote}
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] xl:hidden"
            aria-label={open ? t.menuClose : t.menuOpen}
            aria-expanded={open}
            aria-controls="company-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="company-menu"
            aria-label={t.mainMenu}
            className="overflow-hidden border-t xl:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="mx-auto max-w-[1200px] px-4 py-2 md:px-6">
              {NAV_IDS.map((id) => (
                <li key={id} className="border-b last:border-b-0" style={{ borderColor: C.gray }}>
                  <a href={`#${id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {t.nav[id]}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-bold tabular-nums" style={{ color: C.orangeText }}>
                  {t.call} {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

function CornerMarks() {
  const s = "absolute h-5 w-5 border-[#f26a1b]";
  return (
    <span aria-hidden>
      <span className={`${s} -left-2 -top-2 border-l-2 border-t-2`} />
      <span className={`${s} -right-2 -top-2 border-r-2 border-t-2`} />
      <span className={`${s} -bottom-2 -left-2 border-b-2 border-l-2`} />
      <span className={`${s} -bottom-2 -right-2 border-b-2 border-r-2`} />
    </span>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section id="top" className="px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-16" style={{ background: C.steel, color: C.white, ...GRID_DARK }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.15fr] md:gap-12">
          <div>
            <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.orange }}>
              <span className="h-2 w-2" style={{ background: C.orange }} aria-hidden />
              {t.heroTag}
            </p>
            <h1 className="mt-3 text-[36px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[52px]">{t.company}</h1>
            <p className="mt-5 max-w-[520px] text-[16px] md:text-[18px]" style={{ color: "#c9ced6" }}>
              {t.heroLead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#check" className="inline-flex h-12 items-center rounded-[4px] px-6 font-bold" style={{ background: C.orange, color: C.steel }}>
                {t.btnCheck}
              </a>
              <a href="#quote" className="inline-flex h-12 items-center rounded-[4px] border px-6 font-bold" style={{ borderColor: "#6b737d", color: C.white }}>
                {t.btnQuote}
              </a>
            </div>
          </div>
          <div className="relative mx-2 md:mx-0">
            <CornerMarks />
            <div className="relative aspect-[1344/768] overflow-hidden rounded-[4px]">
              <Image src={`${IMG}/hero.jpg`} alt={t.heroAlt} fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 border-l border-t md:grid-cols-4" style={{ borderColor: C.steelLine }}>
          {t.heroSpecs.map((s) => (
            <div key={s.k} className="border-b border-r px-3 py-4 md:px-5" style={{ borderColor: C.steelLine }}>
              <dt className="text-[14px]" style={{ color: "#a9b0b9" }}>
                {s.k}
              </dt>
              <dd className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-[18px] font-bold tabular-nums sm:text-[22px] md:text-[26px]">{s.v}</span>
                <span className="text-[13px]" style={{ color: "#a9b0b9" }}>
                  {s.u}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SectionHead({ id, tag, title, desc, dark = false }: { id: string; tag: string; title: string; desc?: string; dark?: boolean }) {
  return (
    <div>
      <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: dark ? C.orange : C.orangeText }}>
        <span className="h-2 w-2" style={{ background: C.orange }} aria-hidden />
        {tag}
      </p>
      <h2 id={id} className="mt-2 text-[27px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[36px]">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[680px]" style={{ color: dark ? "#c9ced6" : C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 회사 소개 ---------- */

type EqType = "mc" | "fiveAx" | "lathe" | "cmm";

interface Machine {
  type: EqType;
  name: L;
  spec: L;
  perf: L;
  count: number;
  year: number;
}

const EQUIPMENT: Machine[] = [
  { type: "mc", name: { ko: "수직 머시닝센터 VMC-850", en: "Vertical MC VMC-850" }, spec: { ko: "X850 × Y500 × Z500 mm", en: "X850 × Y500 × Z500 mm" }, perf: { ko: "12,000 rpm", en: "12,000 rpm" }, count: 4, year: 2016 },
  { type: "mc", name: { ko: "대형 수직 머시닝센터 VMC-1300", en: "Large vertical MC VMC-1300" }, spec: { ko: "X1,300 × Y650 × Z600 mm", en: "X1,300 × Y650 × Z600 mm" }, perf: { ko: "8,000 rpm", en: "8,000 rpm" }, count: 2, year: 2019 },
  { type: "mc", name: { ko: "고속 머시닝센터 HSC-500", en: "High-speed MC HSC-500" }, spec: { ko: "X500 × Y400 × Z300 mm", en: "X500 × Y400 × Z300 mm" }, perf: { ko: "24,000 rpm", en: "24,000 rpm" }, count: 1, year: 2021 },
  { type: "fiveAx", name: { ko: "5축 가공기 5AX-600", en: "5-axis MC 5AX-600" }, spec: { ko: "X600 × Y500 × Z400 mm, A ±120°, C 360°", en: "X600 × Y500 × Z400 mm, A ±120°, C 360°" }, perf: { ko: "20,000 rpm", en: "20,000 rpm" }, count: 3, year: 2018 },
  { type: "lathe", name: { ko: "CNC 선반 TL-300", en: "CNC lathe TL-300" }, spec: { ko: "최대 Ø300 × 길이 500 mm", en: "Max. Ø300 × L500 mm" }, perf: { ko: "4,500 rpm", en: "4,500 rpm" }, count: 5, year: 2016 },
  { type: "lathe", name: { ko: "복합 선반 TM-200", en: "Turn-mill center TM-200" }, spec: { ko: "최대 Ø200 × 길이 400 mm, Y축, 부 주축", en: "Max. Ø200 × L400 mm, Y-axis, sub spindle" }, perf: { ko: "6,000 rpm", en: "6,000 rpm" }, count: 2, year: 2022 },
  { type: "cmm", name: { ko: "3차원 측정기 CMM-7106", en: "CMM 7106" }, spec: { ko: "X700 × Y1,000 × Z600 mm", en: "X700 × Y1,000 × Z600 mm" }, perf: { ko: "1.9 + L/300 µm", en: "1.9 + L/300 µm" }, count: 1, year: 2022 },
  { type: "cmm", name: { ko: "윤곽·표면 거칠기 측정기", en: "Contour and roughness tester" }, spec: { ko: "측정 길이 100 mm", en: "Stroke 100 mm" }, perf: { ko: "Ra 0.01 µm까지", en: "Down to Ra 0.01 µm" }, count: 1, year: 2022 },
  { type: "cmm", name: { ko: "비접촉 영상 측정기", en: "Vision measuring system" }, spec: { ko: "X300 × Y200 mm", en: "X300 × Y200 mm" }, perf: { ko: "±2.5 µm", en: "±2.5 µm" }, count: 1, year: 2023 },
];

const MACHINE_TOTAL = EQUIPMENT.reduce((s, m) => s + m.count, 0);
const STAT_VALUES = [2009, 46, MACHINE_TOTAL, 120];

function About() {
  const { t } = useLang();
  const reduce = useReducedMotionSafe();
  return (
    <section aria-labelledby="about-title" id="about" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
        <div>
          <SectionHead id="about-title" tag={t.aboutTag} title={t.aboutTitle} />
          <div className="mt-5 space-y-3" style={{ color: C.muted }}>
            {t.aboutBody.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="mt-8 grid grid-cols-2 border-l border-t sm:grid-cols-4" style={{ borderColor: C.line }}>
            {t.stats.map((s, i) => (
              <motion.div
                key={s.k}
                className="border-b border-r px-4 py-4"
                style={{ borderColor: C.line }}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              >
                <dt className="text-[14px]" style={{ color: C.muted }}>
                  {s.k}
                </dt>
                <dd className="mt-0.5">
                  <span className="text-[28px] font-bold tabular-nums tracking-[-0.02em]">{STAT_VALUES[i].toString()}</span>
                  {s.u && <span className="ml-0.5 text-[15px]">{s.u}</span>}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
        <div className="relative mx-2 md:mx-0 md:mt-10">
          <CornerMarks />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
            <Image src={`${IMG}/parts.jpg`} alt={t.partsAlt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 가공 범위 확인 ---------- */

const MACHINE_NAME: Record<MachineKey, L> = {
  vmc: { ko: "수직 머시닝센터", en: "vertical machining center" },
  large: { ko: "대형 수직 머시닝센터", en: "large vertical machining center" },
  fiveAx: { ko: "5축 가공기", en: "5-axis machining center" },
  lathe: { ko: "CNC 선반", en: "CNC lathe" },
  turnMill: { ko: "복합 선반", en: "turn-mill center" },
};

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
type Reason = (t: Dict, lang: Lang) => string;

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
  reasons: Reason[];
  days: [number, number] | null;
}

function judge(i: CheckInput): Verdict | null {
  const dims = i.shape === "block" ? [i.x, i.y, i.z] : [i.x, i.z];
  if (dims.some((n) => !(n > 0)) || !(i.qty >= 1) || !Number.isInteger(i.qty)) return null;

  const reasons: Reason[] = [];
  let consult = false;
  let machine: MachineKey | null = null;
  let env: MachineKey;
  let part: number[];
  let fits: boolean;
  const fitReason = (k: MachineKey): Reason => (t, lang) => t.rFit(tr(MACHINE_NAME[k], lang), envText(k));

  if (i.shape === "block") {
    part = [...dims].sort((p, q) => q - p);
    const [a, b, c] = part;
    const inside = (k: MachineKey) => a <= ENV[k][0] && b <= ENV[k][1] && c <= ENV[k][2];
    if (i.tol === "0.01") {
      if (inside("fiveAx")) {
        machine = "fiveAx";
        reasons.push(fitReason("fiveAx"), (t) => t.rTol5ax);
      } else if (inside("large")) {
        consult = true;
        machine = inside("vmc") ? "vmc" : "large";
        reasons.push((t) => t.rTolBig);
      } else {
        consult = true;
        reasons.push((t) => t.rTooBig);
      }
    } else {
      machine = inside("vmc") ? "vmc" : inside("large") ? "large" : null;
      if (machine) reasons.push(fitReason(machine));
      else {
        consult = true;
        reasons.push((t) => t.rTooBig);
      }
    }
    env = machine ?? "large";
    fits = inside(env);
    if (c < 3) {
      consult = true;
      reasons.push((t) => t.rThin);
    }
  } else {
    part = dims;
    const [d, l] = dims;
    machine = d <= 200 && l <= 400 ? "turnMill" : d <= 300 && l <= 500 ? "lathe" : null;
    if (machine) reasons.push(fitReason(machine));
    else {
      consult = true;
      reasons.push((t) => t.rLatheBig);
    }
    if (i.tol === "0.01" && machine === "lathe") {
      consult = true;
      reasons.push((t) => t.rRound01);
    }
    env = machine ?? "lathe";
    fits = d <= ENV[env][0] && l <= ENV[env][1];
    if (d < 3) {
      consult = true;
      reasons.push((t) => t.rThin);
    }
  }

  if (i.material === "plastic" && i.tol === "0.01") {
    consult = true;
    reasons.push((t) => t.rPlastic);
  }
  if (i.material === "sus") reasons.push((t) => t.rSus);
  if (i.qty > 500) {
    consult = true;
    reasons.push((t) => t.rQty);
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
    const s = Math.min((VW - 2 * P) / ((W + D) * COS30), (VH - 2 * P) / ((W + D) * SIN30 + H));
    const ox = P + ((VW - 2 * P) - (W + D) * COS30 * s) / 2 + D * COS30 * s;
    const oy = P + ((VH - 2 * P) - ((W + D) * SIN30 + H) * s) / 2 + H * s;
    const pt = (x: number, y: number, z: number) => `${r2(ox + (x - y) * COS30 * s)},${r2(oy + (x + y) * SIN30 * s - z * s)}`;
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
  const s = Math.min((VW - 2 * P - chuck) / Lm, (VH - 2 * P) / Dm);
  const x0 = r2(P + chuck);
  const cy = VH / 2;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" role="img" aria-label={label}>
      <rect x={x0} y={r2(cy - (ed * s) / 2)} width={r2(el * s)} height={r2(ed * s)} fill="#e9ebee" stroke={C.steel} strokeWidth="1.2" strokeDasharray="6 4" />
      <rect x={x0} y={r2(cy - (pd * s) / 2)} width={r2(pl * s)} height={r2(pd * s)} fill={partFill.right} stroke={partFill.stroke} strokeWidth="1" />
      <rect x={x0} y={r2(cy - (pd * s) / 2)} width={r2(pl * s)} height={r2(Math.max(1, (pd * s) / 5))} fill={partFill.top} />
      <rect x={P} y={r2(cy - Math.min(VH / 2 - P, (pd * s) / 2 + 22))} width={chuck - 4} height={r2(Math.min(VH - 2 * P, pd * s + 44))} rx="2" fill={C.steel} />
      <path d={`M${P - 10} ${cy} H${VW - P + 10}`} stroke={C.muted} strokeWidth="1" strokeDasharray="14 4 3 4" />
    </svg>
  );
}

const TOLS: Tol[] = ["0.1", "0.05", "0.01"];
const MATERIALS: Material[] = ["al", "sus", "steel", "plastic"];

function Checker({ onQuote }: { onQuote: (s: string) => void }) {
  const { t, lang } = useLang();
  const reduce = useReducedMotionSafe();
  const [shape, setShape] = useState<Shape>("block");
  const [material, setMaterial] = useState<Material>("al");
  const [x, setX] = useState("180");
  const [y, setY] = useState("120");
  const [z, setZ] = useState("45");
  const [tol, setTol] = useState<Tol>("0.05");
  const [qty, setQty] = useState("30");

  const v = judge({ shape, material, x: Number(x), y: Number(y), z: Number(z), tol, qty: Number(qty) });

  const sizeText = shape === "block" ? `${x} × ${y} × ${z} mm` : `Ø${x} × ${z} mm`;
  const summary = [
    `${t.shape}: ${shape === "block" ? t.shapeBlock : t.shapeRound}`,
    `${t.material}: ${t.materials[material]}`,
    `${t.size.replace(" (mm)", "")}: ${sizeText}`,
    `${t.tol}: ±${tol} mm`,
    `${t.qty}: ${qty}${lang === "ko" ? t.qtyUnit : ` ${t.qtyUnit}`}`,
  ].join("\n");

  const goQuote = () => {
    onQuote(t.quoteMemo(summary));
    document.getElementById("quote")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const seg = (on: boolean) => (on ? { background: C.steel, color: C.white, borderColor: C.steel } : { background: C.white, color: C.ink, borderColor: C.line });

  const numField = (id: string, label: string, value: string, set: (s: string) => void) => (
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
    <section aria-labelledby="check-title" id="check" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.gray, ...GRID_LIGHT }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="check-title" tag={t.checkTag} title={t.checkTitle} desc={t.checkDesc} />

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6 rounded-[6px] border bg-white p-5 md:p-7" style={{ borderColor: C.line }}>
            <fieldset>
              <legend className="text-[15px] font-bold">{t.shape}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["block", "round"] as const).map((s) => (
                  <button key={s} type="button" aria-pressed={shape === s} onClick={() => setShape(s)} className="h-11 rounded-[4px] border text-[15px] font-bold" style={seg(shape === s)}>
                    {s === "block" ? t.shapeBlock : t.shapeRound}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[15px] font-bold">{t.material}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {MATERIALS.map((m) => (
                  <button key={m} type="button" aria-pressed={material === m} onClick={() => setMaterial(m)} className="min-h-11 rounded-[4px] border px-2 py-2 text-[15px] font-bold leading-[1.3]" style={seg(material === m)}>
                    {t.materials[m]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[15px] font-bold">{t.size}</legend>
              <div className={`mt-2 grid gap-2 ${shape === "block" ? "grid-cols-3" : "grid-cols-2"}`}>
                {numField("chk-x", shape === "block" ? t.sx : t.dia, x, setX)}
                {shape === "block" && numField("chk-y", t.sy, y, setY)}
                {numField("chk-z", shape === "block" ? t.sz : t.len, z, setZ)}
              </div>
            </fieldset>

            <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr]">
              <fieldset>
                <legend className="text-[15px] font-bold">{t.tol}</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {TOLS.map((o) => (
                    <button key={o} type="button" aria-pressed={tol === o} onClick={() => setTol(o)} className="h-12 rounded-[4px] border text-[15px] font-bold tabular-nums" style={seg(tol === o)}>
                      ±{o}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <p className="text-[15px] font-bold" aria-hidden>
                  {t.qty}
                </p>
                <label className="relative mt-2 block" htmlFor="chk-qty">
                  <span className="sr-only">{t.qty}</span>
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
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: C.muted }}>
                    {t.qtyUnit}
                  </span>
                </label>
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
                      {v.ok ? t.ok : t.consult}
                    </motion.p>
                  </AnimatePresence>
                  <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                    {t.materials[material]}, ±{tol} mm, {qty}
                    {lang === "ko" ? t.qtyUnit : ` ${t.qtyUnit}`}
                  </span>
                </div>
                <div className="px-3 pt-3 md:px-5">
                  <EnvelopeView v={v} label={t.drawingLabel(envText(v.env), sizeText)} />
                  <ul className="flex flex-wrap gap-x-5 gap-y-1 px-2 text-[13px] tabular-nums" style={{ color: C.muted }}>
                    <li className="inline-flex items-center gap-1.5">
                      <span className="h-0 w-5 border-t-2 border-dashed" style={{ borderColor: C.steel }} aria-hidden />
                      {t.envLabel} {envText(v.env)}
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5" style={{ background: v.fits ? C.orange : "#a3a9b1" }} aria-hidden />
                      {t.partLabel} {sizeText}
                    </li>
                  </ul>
                </div>
                <dl className="mx-5 mt-4 grid grid-cols-2 border-l border-t md:mx-7" style={{ borderColor: C.line }}>
                  <div className="border-b border-r px-3 py-2.5" style={{ borderColor: C.line }}>
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {t.machine}
                    </dt>
                    <dd className="font-bold leading-[1.4]">{v.machine ? tr(MACHINE_NAME[v.machine], lang) : t.noMachine}</dd>
                  </div>
                  <div className="border-b border-r px-3 py-2.5" style={{ borderColor: C.line }}>
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {t.lead}
                    </dt>
                    <dd className="font-bold tabular-nums leading-[1.4]">{v.days ? t.leadDays(v.days[0], v.days[1]) : t.leadNone}</dd>
                  </div>
                </dl>
                <ul className="space-y-1.5 px-5 pt-4 text-[15px] md:px-7">
                  {v.reasons.map((r) => {
                    const text = r(t, lang);
                    return (
                      <li key={text} className="flex gap-2">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0" style={{ background: C.steel }} aria-hidden />
                        {text}
                      </li>
                    );
                  })}
                </ul>
                <div className="px-5 pb-6 pt-5 md:px-7">
                  <button type="button" onClick={goQuote} className="inline-flex h-12 items-center rounded-[4px] px-5 font-bold" style={{ background: C.orange, color: C.steel }}>
                    {t.toQuote}
                  </button>
                </div>
              </>
            ) : (
              <p className="px-5 py-16 text-center md:px-7" style={{ color: C.muted }}>
                {t.needInput}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 보유 설비 ---------- */

function Equipment() {
  const { t, lang } = useLang();
  const [type, setType] = useState<EqType | "all">("all");
  const list = EQUIPMENT.filter((m) => type === "all" || m.type === type);
  const sum = list.reduce((s, m) => s + m.count, 0);

  return (
    <section aria-labelledby="equipment-title" id="equipment" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="equipment-title" tag={t.eqTag} title={t.eqTitle} desc={t.eqDesc} />
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label={t.eqFilter} className="flex flex-wrap gap-2">
            {(["all", "mc", "fiveAx", "lathe", "cmm"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={type === k}
                onClick={() => setType(k)}
                className="h-10 rounded-[4px] border px-4 text-[15px] font-bold"
                style={type === k ? { background: C.steel, color: C.white, borderColor: C.steel } : { borderColor: C.line, color: C.ink }}
              >
                {t.eqTypes[k]}
              </button>
            ))}
          </div>
          <p className="text-[15px] font-bold tabular-nums" aria-live="polite">
            {t.eqSum(sum)}
          </p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[4px] border" style={{ borderColor: C.line }}>
          <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
            <caption className="sr-only">{t.eqCaption}</caption>
            <thead>
              <tr style={{ background: C.steel, color: C.white }}>
                {(["name", "type", "spec", "perf", "count", "year"] as const).map((h) => (
                  <th key={h} scope="col" className={`px-4 py-3 text-[14px] font-bold ${h === "count" || h === "year" ? "text-right" : ""}`}>
                    {t.eqHead[h]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.name.ko} className="border-t" style={{ borderColor: C.line }}>
                  <th scope="row" className="px-4 py-3.5 font-bold">
                    {tr(m.name, lang)}
                  </th>
                  <td className="px-4 py-3.5" style={{ color: C.muted }}>
                    {t.eqTypes[m.type]}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums">{tr(m.spec, lang)}</td>
                  <td className="px-4 py-3.5 tabular-nums">{tr(m.perf, lang)}</td>
                  <td className="px-4 py-3.5 text-right font-bold tabular-nums">{t.eqTotal(m.count)}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums" style={{ color: C.muted }}>
                    {m.year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------- 생산 품목 ---------- */

type PrCat = "semi" | "medical" | "battery" | "robot";

const PRODUCTS: { cat: PrCat; name: L; material: L; tol: string; machine: L; qty: L }[] = [
  { cat: "semi", name: { ko: "웨이퍼 이송 로봇 암 블록", en: "Wafer transfer robot arm block" }, material: { ko: "알루미늄 6061, 경질 아노다이징", en: "Al 6061, hard anodized" }, tol: "±0.02", machine: MACHINE_NAME.fiveAx, qty: { ko: "월 120개", en: "120 / month" } },
  { cat: "semi", name: { ko: "진공 챔버 포트 플랜지", en: "Vacuum chamber port flange" }, material: { ko: "스테인리스 316L, Ra 0.8", en: "SUS 316L, Ra 0.8" }, tol: "±0.03", machine: MACHINE_NAME.lathe, qty: { ko: "월 300개", en: "300 / month" } },
  { cat: "medical", name: { ko: "수술 기구 연결 커넥터", en: "Surgical instrument connector" }, material: { ko: "스테인리스 630", en: "SUS 630" }, tol: "±0.01", machine: MACHINE_NAME.turnMill, qty: { ko: "로트당 500개", en: "500 / lot" } },
  { cat: "medical", name: { ko: "진단 장비 시료 트레이", en: "Diagnostic analyzer sample tray" }, material: { ko: "PEEK", en: "PEEK" }, tol: "±0.05", machine: MACHINE_NAME.vmc, qty: { ko: "월 200개", en: "200 / month" } },
  { cat: "battery", name: { ko: "전극 노칭 금형 베이스", en: "Electrode notching die base" }, material: { ko: "공구강 SKD11, 열처리 후 가공", en: "Tool steel SKD11, machined after hardening" }, tol: "±0.01", machine: MACHINE_NAME.fiveAx, qty: { ko: "주문 생산", en: "Made to order" } },
  { cat: "battery", name: { ko: "롤 프레스 베어링 하우징", en: "Roll press bearing housing" }, material: { ko: "탄소강 S45C", en: "Carbon steel S45C" }, tol: "±0.02", machine: MACHINE_NAME.large, qty: { ko: "월 40개", en: "40 / month" } },
  { cat: "robot", name: { ko: "협동 로봇 감속기 하우징", en: "Cobot reducer housing" }, material: { ko: "알루미늄 7075", en: "Al 7075" }, tol: "±0.02", machine: MACHINE_NAME.fiveAx, qty: { ko: "월 250개", en: "250 / month" } },
  { cat: "robot", name: { ko: "비전 검사기 카메라 브래킷", en: "Vision inspection camera bracket" }, material: { ko: "알루미늄 6061, 흑색 아노다이징", en: "Al 6061, black anodized" }, tol: "±0.05", machine: MACHINE_NAME.vmc, qty: { ko: "월 600개", en: "600 / month" } },
];

function Products() {
  const { t, lang } = useLang();
  const reduce = useReducedMotionSafe();
  const [cat, setCat] = useState<PrCat | "all">("all");
  const list = PRODUCTS.filter((p) => cat === "all" || p.cat === cat);

  return (
    <section aria-labelledby="products-title" id="products" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.gray, ...GRID_LIGHT }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="products-title" tag={t.prTag} title={t.prTitle} desc={t.prDesc} />
        <div role="group" aria-label={t.prFilter} className="mt-8 flex flex-wrap gap-2">
          {(["all", "semi", "medical", "battery", "robot"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={cat === k}
              onClick={() => setCat(k)}
              className="h-10 rounded-[4px] border px-4 text-[15px] font-bold"
              style={cat === k ? { background: C.steel, color: C.white, borderColor: C.steel } : { background: C.white, borderColor: C.line, color: C.ink }}
            >
              {t.prCats[k]}
            </button>
          ))}
        </div>
        <motion.ul layout={!reduce} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {list.map((p) => (
              <motion.li
                key={p.name.ko}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="flex flex-col rounded-[6px] border border-t-[3px] bg-white p-5"
                style={{ borderColor: C.line, borderTopColor: C.steel }}
              >
                <p className="text-[13px] font-bold" style={{ color: C.orangeText }}>
                  {t.prCats[p.cat]}
                </p>
                <h3 className="mt-1 text-[18px] font-bold leading-[1.4] tracking-[-0.02em]">{tr(p.name, lang)}</h3>
                <dl className="mt-4 space-y-1.5 border-t pt-3 text-[14px]" style={{ borderColor: C.line }}>
                  {(
                    [
                      ["material", tr(p.material, lang)],
                      ["tol", `${p.tol} mm`],
                      ["machine", tr(p.machine, lang)],
                      ["qty", tr(p.qty, lang)],
                    ] as const
                  ).map(([k, val]) => (
                    <div key={k} className="grid grid-cols-[72px_1fr] gap-2">
                      <dt style={{ color: C.muted }}>{t.prRows[k]}</dt>
                      <dd className="tabular-nums first-letter:uppercase">{val}</dd>
                    </div>
                  ))}
                </dl>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

/* ---------- 연혁, 인증 ---------- */

const HISTORY: { year: number; text: L }[] = [
  { year: 2009, text: { ko: "□□시에서 머시닝센터 2대로 창업", en: "Founded in □□ with two machining centers" } },
  { year: 2012, text: { ko: "법인 전환, (주)○○정밀로 이름 변경", en: "Incorporated as ○○ Precision Co., Ltd." } },
  { year: 2014, text: { ko: "ISO 9001 인증", en: "ISO 9001 certified" } },
  { year: 2016, text: { ko: "□□산업단지 지금 공장으로 이전", en: "Moved to the current plant in □□ Industrial Complex" } },
  { year: 2018, text: { ko: "5축 가공기 도입, 반도체 장비 부품 납품 시작", en: "Added 5-axis machines, began supplying semiconductor equipment parts" } },
  { year: 2020, text: { ko: "기업부설연구소 설립", en: "Opened the in-house R&D center" } },
  { year: 2022, text: { ko: "항온 가공실과 3차원 측정실 구축", en: "Built the temperature-controlled machining room and CMM room" } },
  { year: 2024, text: { ko: "ISO 13485 인증, 의료기기 부품 가공 시작", en: "ISO 13485 certified, began machining medical device parts" } },
];

const CERTS: { name: L; desc: L; year: number }[] = [
  { name: { ko: "ISO 9001", en: "ISO 9001" }, desc: { ko: "품질경영시스템, △△인증원", en: "Quality management system, △△ Certification" }, year: 2014 },
  { name: { ko: "ISO 14001", en: "ISO 14001" }, desc: { ko: "환경경영시스템, △△인증원", en: "Environmental management system, △△ Certification" }, year: 2023 },
  { name: { ko: "ISO 13485", en: "ISO 13485" }, desc: { ko: "의료기기 품질경영시스템, △△인증원", en: "Medical device quality management, △△ Certification" }, year: 2024 },
  { name: { ko: "기업부설연구소", en: "In-house R&D center" }, desc: { ko: "△△협회 인정", en: "Recognized by △△ Association" }, year: 2020 },
  { name: { ko: "뿌리기업", en: "Root industry company" }, desc: { ko: "정밀가공 분야 확인, △△진흥원", en: "Precision machining, confirmed by △△ Agency" }, year: 2021 },
];

function History() {
  const { t, lang } = useLang();
  const reduce = useReducedMotionSafe();

  return (
    <section aria-labelledby="history-title" id="history" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.steel, color: C.white, ...GRID_DARK }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="history-title" tag={t.hiTag} title={t.hiTitle} dark />

        <ol className="mt-10 lg:mt-14 lg:grid lg:grid-cols-8">
          {HISTORY.map((h, i) => (
            <motion.li
              key={h.year}
              className="relative border-l pb-8 pl-6 last:pb-0 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pr-4 lg:pt-6"
              style={{ borderColor: C.steelLine }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: reduce ? 0 : (i % 4) * 0.08, ease: EASE }}
            >
              <span className="absolute -left-[5px] top-[9px] h-[9px] w-[9px] lg:-top-[5px] lg:left-0" style={{ background: C.orange }} aria-hidden />
              <p className="text-[22px] font-bold tabular-nums leading-none" style={{ color: C.orange }}>
                {h.year}
              </p>
              <p className="mt-2 text-[15px] leading-[1.6]" style={{ color: "#d4d8de" }}>
                {tr(h.text, lang)}
              </p>
            </motion.li>
          ))}
        </ol>

        <h3 className="mt-16 text-[21px] font-bold tracking-[-0.02em]">{t.certTitle}</h3>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-[4px] border sm:grid-cols-2 lg:grid-cols-5" style={{ borderColor: C.steelLine, background: C.steelLine }}>
          {CERTS.map((c) => (
            <li key={c.name.ko} className="flex gap-3 p-5" style={{ background: C.steel2 }}>
              <BadgeCheck size={22} className="mt-0.5 shrink-0" style={{ color: C.orange }} aria-hidden />
              <span className="min-w-0">
                <span className="block font-bold">{tr(c.name, lang)}</span>
                <span className="block text-[14px] leading-[1.5]" style={{ color: "#a9b0b9" }}>
                  {tr(c.desc, lang)}
                </span>
                <span className="mt-1 block text-[13px] tabular-nums" style={{ color: "#a9b0b9" }}>
                  {c.year}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 견적 문의 ---------- */

type Field = "company" | "person" | "phone" | "email" | "file" | "due" | "content" | "agree";
type Errors = Partial<Record<Field, string>>;

const FILE_EXT = ["pdf", "dwg", "dxf", "step", "stp", "igs", "iges", "zip"];
const FILE_MAX = 30 * 1024 * 1024;

interface Receipt {
  no: string;
  company: string;
  person: string;
  phone: string;
  file: string | null;
  due: string;
}

function Quote({ memo, setMemo }: { memo: string; setMemo: (s: string) => void }) {
  const { t } = useLang();
  const reduce = useReducedMotionSafe();
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [due, setDue] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<Receipt | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const err = !FILE_EXT.includes(ext) ? t.err.fileType : f.size > FILE_MAX ? t.err.fileSize : undefined;
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (!company.trim()) next.company = t.err.company;
    if (person.trim().length < 2) next.person = t.err.person;
    if (phone.replace(/\D/g, "").length < 9) next.phone = t.err.phone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = t.err.email;
    if (!due || new Date(`${due}T00:00:00`) < tomorrow) next.due = t.err.due;
    if (memo.trim().length < 10) next.content = t.err.content;
    if (!agree) next.agree = t.err.agree;
    if (errors.file) next.file = errors.file;
    setErrors(next);
    const first = (Object.keys(next) as Field[])[0];
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
      file: file ? `${file.name} (${fileSize(file.size)})` : null,
      due,
    });
  };

  const reset = () => {
    setDone(null);
    setCompany("");
    setPerson("");
    setPhone("");
    setEmail("");
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
  const label = (f: Field, text: string, req = true) => (
    <label htmlFor={`q-${f}`} className="text-[15px] font-bold">
      {text}
      {req && (
        <span className="ml-1" style={{ color: C.orangeText }}>
          <span aria-hidden>*</span>
          <span className="sr-only">({t.required})</span>
        </span>
      )}
    </label>
  );

  return (
    <section aria-labelledby="quote-title" id="quote" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHead id="quote-title" tag={t.qTag} title={t.qTitle} desc={t.qDesc} />
          <dl className="mt-8 border-l border-t text-[15px]" style={{ borderColor: C.line }}>
            {(
              [
                [t.foot.tel, TEL],
                [t.foot.fax, FAX],
                [t.foot.email, EMAIL],
              ] as const
            ).map(([k, val]) => (
              <div key={k} className="grid grid-cols-[88px_1fr] border-b border-r" style={{ borderColor: C.line }}>
                <dt className="px-4 py-3" style={{ background: C.gray, color: C.muted }}>
                  {k}
                </dt>
                <dd className="px-4 py-3 font-bold tabular-nums">{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div
                key="done"
                className="rounded-[6px] border bg-white"
                style={{ borderColor: C.line }}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <div className="flex items-center gap-3 px-6 py-5" style={{ background: C.steel, color: C.white }}>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]" style={{ background: C.orange, color: C.steel }}>
                    <Check size={22} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[20px] font-bold tracking-[-0.02em]">{t.doneTitle}</p>
                    <p className="text-[15px]" style={{ color: "#c9ced6" }}>
                      {t.doneBody(done.person)}
                    </p>
                  </div>
                </div>
                <dl className="px-6 py-5 text-[15px]">
                  {(
                    [
                      [t.receipt, done.no],
                      [t.fCompany, done.company],
                      [t.fPerson, done.person],
                      [t.fPhone, done.phone],
                      [t.fDue, done.due],
                      [t.fFile, done.file ?? t.noFile],
                    ] as const
                  ).map(([k, val], i) => (
                    <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: C.line }}>
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
                    {t.again}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.white }}>
                {Object.values(errors).some(Boolean) && (
                  <p role="alert" className="mb-5 flex items-center gap-2 rounded-[4px] px-3 py-2.5 text-[15px] font-semibold" style={{ background: "#fbeaea", color: C.error }}>
                    <CircleAlert size={18} aria-hidden />
                    {t.errSummary}
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    {label("company", t.fCompany)}
                    <input id="q-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" placeholder="(주)△△테크" className={inputCls} style={border("company")} {...aria("company")} />
                    {errText("company")}
                  </div>
                  <div>
                    {label("person", t.fPerson)}
                    <input id="q-person" value={person} onChange={(e) => setPerson(e.target.value)} autoComplete="name" placeholder="김하늘" className={inputCls} style={border("person")} {...aria("person")} />
                    {errText("person")}
                  </div>
                  <div>
                    {label("phone", t.fPhone)}
                    <input id="q-phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className={`${inputCls} tabular-nums`} style={border("phone")} {...aria("phone")} />
                    {errText("phone")}
                  </div>
                  <div>
                    {label("email", t.fEmail)}
                    <input id="q-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="buyer@example.com" className={inputCls} style={border("email")} {...aria("email")} />
                    {errText("email")}
                  </div>

                  <div className="sm:col-span-2">
                    {label("file", t.fFile, false)}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 rounded-[4px] border border-dashed p-3" style={{ borderColor: errors.file ? C.error : "#b9bec5", background: C.gray }}>
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[4px] px-4 text-[15px] font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ background: C.steel, color: C.white }}>
                        <FileUp size={18} aria-hidden />
                        {t.fFileBtn}
                        <input
                          ref={fileRef}
                          id="q-file"
                          type="file"
                          accept={FILE_EXT.map((x) => `.${x}`).join(",")}
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
                          <button type="button" onClick={removeFile} aria-label={t.fFileRemove} className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]" style={{ color: C.muted }}>
                            <Trash2 size={18} aria-hidden />
                          </button>
                        </span>
                      ) : (
                        <span id="q-file-hint" className="text-[14px]" style={{ color: C.muted }}>
                          {t.fFileHint}
                        </span>
                      )}
                    </div>
                    {file && (
                      <p id="q-file-hint" className="mt-1 text-[14px]" style={{ color: C.muted }}>
                        {t.fFileHint}
                      </p>
                    )}
                    {errText("file")}
                    <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
                      {t.fFileNote}
                    </p>
                  </div>

                  <div>
                    {label("due", t.fDue)}
                    <input id="q-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputCls} tabular-nums`} style={border("due")} {...aria("due")} />
                    {errText("due")}
                  </div>

                  <div className="sm:col-span-2">
                    {label("content", t.fContent)}
                    <textarea
                      id="q-content"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      rows={5}
                      placeholder={t.fContentPh}
                      className="mt-1.5 w-full rounded-[4px] border bg-white px-3 py-2.5 outline-none focus:border-[#1e2329]"
                      style={border("content")}
                      {...aria("content")}
                    />
                    {errText("content")}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
                      <input id="q-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#1e2329]" {...aria("agree")} />
                      <span>{t.fAgree}</span>
                    </label>
                    {errText("agree")}
                  </div>
                </div>
                <button type="submit" className="mt-7 h-13 w-full rounded-[4px] py-3.5 text-[17px] font-bold" style={{ background: C.orange, color: C.steel }}>
                  {t.submit}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function MiniMap() {
  const { t } = useLang();
  const blocks = [
    [40, 40, 120, 90],
    [180, 40, 120, 90],
    [40, 230, 120, 90],
    [180, 230, 120, 90],
    [480, 230, 120, 90],
    [480, 40, 120, 90],
  ];
  return (
    <svg viewBox="0 0 640 360" className="h-auto w-full" role="img" aria-label={t.mapLabel}>
      <rect width="640" height="360" fill={C.gray} />
      <g stroke={C.grid} strokeWidth="1">
        {Array.from({ length: 21 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 32} 0 V360`} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 32} H640`} />
        ))}
      </g>
      <path d="M0 180 H640" stroke={C.white} strokeWidth="34" />
      <path d="M0 180 H640" stroke={C.line} strokeWidth="1" strokeDasharray="12 10" />
      <path d="M320 0 V360" stroke={C.white} strokeWidth="24" />
      <text x="20" y="171" fontSize="14" fill={C.muted}>
        {t.map.road}
      </text>
      {blocks.map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="3" fill="#dfe2e6" stroke={C.line} />
      ))}
      <rect x="350" y="40" width="110" height="90" rx="3" fill={C.steel} />
      <rect x="350" y="40" width="110" height="6" fill={C.orange} />
      <text x="405" y="92" fontSize="14" fill={C.white} textAnchor="middle" fontWeight={700}>
        {t.map.name}
      </text>
      <rect x="440" y="128" width="20" height="12" fill={C.orange} />
      <text x="470" y="140" fontSize="12" fill={C.ink}>
        {t.map.gate}
      </text>
      <rect x="360" y="206" width="78" height="22" rx="3" fill={C.white} stroke={C.steel} />
      <text x="399" y="221" fontSize="12" fill={C.ink} textAnchor="middle">
        {t.map.stop}
      </text>
      <path d="M600 180 L620 180" stroke={C.orange} strokeWidth="3" />
      <rect x="566" y="322" width="62" height="26" rx="3" fill={C.steel} />
      <text x="597" y="340" fontSize="13" fill={C.white} textAnchor="middle" fontWeight={700}>
        {t.map.ic}
      </text>
      <path d="M597 322 V196 H460" stroke={C.orange} strokeWidth="3" strokeDasharray="7 6" fill="none" />
      <text x="190" y="290" fontSize="13" fill={C.muted}>
        {t.map.block}
      </text>
    </svg>
  );
}

function Location() {
  const { t } = useLang();
  const icons = [Car, Bus, Truck];
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.gray }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" tag={t.locTag} title={t.locTitle} />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden rounded-[4px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[21px] font-bold tracking-[-0.02em]">{t.address}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[15px]" style={{ color: C.muted }}>
              <Clock size={16} aria-hidden />
              {t.hours}
            </p>
            <ul className="mt-6 space-y-4">
              {t.routes.map((r, i) => {
                const Icon = icons[i];
                return (
                  <li key={r.k} className="flex gap-3">
                    <Icon size={20} className="mt-1 shrink-0" style={{ color: C.orangeText }} aria-hidden />
                    <span>
                      <span className="font-bold">{r.k}</span>
                      <span className="block text-[15px]" style={{ color: C.muted }}>
                        {r.v}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <a href={`tel:${TEL}`} className="mt-7 inline-flex h-12 items-center rounded-[4px] px-6 font-bold tabular-nums" style={{ background: C.steel, color: C.white }}>
              {t.call} {TEL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  const { t } = useLang();
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.steel, color: "#c9ced6" }}>
      <div className="mx-auto max-w-[1200px]">
        <span className="text-white">
          <Logo light />
        </span>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#a9b0b9" }}>
          {(
            [
              [t.foot.name, t.company],
              [t.foot.ceo, t.ceo],
              [t.foot.biz, "000-00-00000"],
              [t.foot.addr, t.address],
              [t.foot.tel, TEL],
              [t.foot.fax, FAX],
              [t.foot.email, EMAIL],
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
