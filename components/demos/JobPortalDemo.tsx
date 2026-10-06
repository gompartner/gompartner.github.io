"use client";

import { Black_Han_Sans } from "next/font/google";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 채용 정보 포털 데모. 가상 서비스 "○○일자리".
   첫 화면은 큰 검색창과 많이 찾은 검색어 순위, 결과는 공공 채용 포털처럼 3열 표.
   공고 등록일과 마감일은 오늘 기준 상대값으로 두고, 화면이 뜬 뒤에만 계산한다. */

const display = Black_Han_Sans({ weight: "400", preload: false, display: "swap" });

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "세종"] as const;
const CATEGORIES = ["사무·행정", "IT·개발", "디자인", "영업·상담", "생산·기술", "보건·의료", "교육", "서비스"] as const;
const TYPES = ["정규직", "계약직", "시간제"] as const;
const EDUS = ["학력무관", "고졸", "대졸(2~3년)", "대졸(4년)"] as const;
const SORTS = ["최근등록일순", "마감일순", "임금높은순"] as const;
const SCOPES = ["전체", "제목", "회사명", "직무내용"] as const;
const POSTED = [
  { label: "전체", days: 99 },
  { label: "오늘", days: 0 },
  { label: "3일 이내", days: 3 },
  { label: "1주 이내", days: 7 },
  { label: "2주 이내", days: 14 },
] as const;
const PAY_UNITS = ["연봉", "월급", "시급"] as const;

type Region = (typeof REGIONS)[number];
type Category = (typeof CATEGORIES)[number];
type Career = "신입" | "경력" | "무관";
type JobType = (typeof TYPES)[number];
type Edu = (typeof EDUS)[number];
type Sort = (typeof SORTS)[number];
type Scope = (typeof SCOPES)[number];
type PayUnit = (typeof PAY_UNITS)[number];

interface Job {
  id: string;
  company: string;
  title: string;
  region: Region;
  district: string;
  category: Category;
  career: Career;
  type: JobType;
  edu: Edu;
  pay: { unit: PayUnit; amount: number };
  postedAgo: number;
  closeIn: number;
  headcount: number;
  tags: string[];
  isPublic: boolean;
}

// [id, 회사, 제목, 지역, 구, 직종, 경력, 고용형태, 학력, 임금단위, 금액, 등록 N일 전, 마감 N일 후, 인원, 태그]
type Row = [string, string, string, Region, string, Category, Career, JobType, Edu, PayUnit, number, number, number, number, string];
const ROWS: Row[] = [
  ["j01", "○○물류(주)", "물류센터 입출고 관리 사무원", "경기", "이천시", "사무·행정", "무관", "정규직", "고졸", "연봉", 3000, 0, 14, 2, "주 5일,4대보험,통근버스"],
  ["j02", "△△소프트", "웹 서비스 백엔드 개발자 (Java)", "서울", "구로구", "IT·개발", "경력", "정규직", "대졸(4년)", "연봉", 5200, 1, 20, 1, "재택 병행,유연근무"],
  ["j03", "□□디자인랩", "브랜드·편집 디자이너", "서울", "마포구", "디자인", "경력", "정규직", "대졸(2~3년)", "연봉", 3600, 2, 9, 1, "주 5일,포트폴리오 제출"],
  ["j04", "☆☆내과의원", "외래 접수·수납 담당", "부산", "해운대구", "보건·의료", "무관", "정규직", "고졸", "월급", 250, 0, 3, 1, "주 5일,토요일 격주"],
  ["j05", "○○구립어린이집", "보육교사 (만 3세반)", "대전", "유성구", "교육", "무관", "정규직", "대졸(2~3년)", "월급", 245, 3, 12, 2, "보육교사 자격,식사 제공"],
  ["j06", "△△정밀", "CNC 가공 기술자", "대구", "달서구", "생산·기술", "경력", "정규직", "학력무관", "연봉", 4200, 4, 25, 3, "기숙사,야간수당"],
  ["j07", "□□마트", "매장 진열·계산 (오후 파트)", "인천", "연수구", "서비스", "무관", "시간제", "학력무관", "시급", 11000, 0, 5, 4, "주 3일,근무시간 협의"],
  ["j08", "☆☆텔레콤", "고객센터 상담사", "광주", "서구", "영업·상담", "신입", "계약직", "고졸", "월급", 260, 1, 2, 10, "교육 후 배치,정규직 전환"],
  ["j09", "○○세무회계", "세무 회계 사무원", "서울", "강남구", "사무·행정", "경력", "정규직", "대졸(2~3년)", "연봉", 3400, 5, 18, 1, "전산회계 자격 우대"],
  ["j10", "△△에듀", "초등 방과후 코딩 강사", "세종", "보람동", "교육", "무관", "시간제", "대졸(4년)", "시급", 25000, 2, 10, 2, "주 2일,수업 자료 제공"],
  ["j11", "□□식품(주)", "식품 생산라인 품질관리", "경기", "평택시", "생산·기술", "신입", "정규직", "대졸(2~3년)", "연봉", 3200, 6, 22, 2, "주 5일,구내식당"],
  ["j12", "☆☆시스템즈", "사내 전산 운영·헬프데스크", "대전", "서구", "IT·개발", "신입", "정규직", "대졸(2~3년)", "연봉", 3100, 1, 16, 1, "정보처리 자격 우대"],
  ["j13", "○○요양원", "요양보호사 (주간)", "경기", "고양시", "보건·의료", "무관", "정규직", "학력무관", "월급", 240, 3, 4, 3, "요양보호사 자격"],
  ["j14", "△△인테리어", "3D 공간 디자이너", "부산", "수영구", "디자인", "경력", "정규직", "대졸(2~3년)", "연봉", 3800, 7, 21, 1, "스케치업 가능자"],
  ["j15", "□□렌탈", "B2B 영업 담당", "서울", "영등포구", "영업·상담", "경력", "정규직", "대졸(4년)", "연봉", 4500, 2, 13, 2, "인센티브,차량 지원"],
  ["j16", "☆☆카페", "바리스타 (주말)", "대구", "중구", "서비스", "무관", "시간제", "학력무관", "시급", 10500, 0, 6, 2, "주말 근무,음료 제공"],
  ["j17", "○○진흥원", "사업 운영 계약직 연구원", "세종", "어진동", "사무·행정", "경력", "계약직", "대졸(4년)", "연봉", 3900, 4, 7, 1, "1년 계약,연장 가능"],
  ["j18", "△△앱스", "모바일 앱 개발자 (Flutter)", "경기", "성남시", "IT·개발", "경력", "정규직", "대졸(4년)", "연봉", 5600, 3, 28, 1, "스톡옵션,유연근무"],
  ["j19", "□□전자", "전자부품 조립 생산직", "광주", "광산구", "생산·기술", "신입", "계약직", "학력무관", "월급", 280, 1, 1, 8, "주야 2교대,기숙사"],
  ["j20", "☆☆치과", "치과위생사", "인천", "남동구", "보건·의료", "경력", "정규직", "대졸(2~3년)", "월급", 300, 5, 15, 1, "치과위생사 면허"],
  ["j21", "○○학원", "중등 수학 강사", "서울", "노원구", "교육", "경력", "정규직", "대졸(4년)", "월급", 320, 2, 11, 1, "오후 근무,인센티브"],
  ["j22", "△△호텔", "프런트 데스크 직원", "부산", "중구", "서비스", "무관", "정규직", "고졸", "연봉", 2900, 6, 19, 2, "외국어 가능자 우대,교대 근무"],
  ["j23", "□□보험", "보험 계약 심사 사무원", "대전", "중구", "사무·행정", "신입", "정규직", "대졸(4년)", "연봉", 3500, 0, 24, 3, "주 5일,자격 취득 지원"],
  ["j24", "☆☆모빌리티", "차량 정비 기사", "경기", "화성시", "생산·기술", "경력", "정규직", "학력무관", "연봉", 4000, 8, 17, 2, "정비 자격,공구 지원"],
  ["j25", "○○쇼핑", "상세페이지 웹디자이너", "인천", "부평구", "디자인", "신입", "계약직", "대졸(2~3년)", "월급", 250, 1, 8, 1, "6개월 계약,정규직 전환"],
  ["j26", "△△데이터", "데이터 라벨링 작업자", "광주", "북구", "IT·개발", "무관", "시간제", "학력무관", "시급", 12000, 2, 3, 15, "재택 가능,교육 제공"],
  ["j27", "□□상사", "무역 사무·수출입 서류", "서울", "중구", "사무·행정", "경력", "정규직", "대졸(4년)", "연봉", 3700, 9, 26, 1, "무역 영어,국제무역사 우대"],
  ["j28", "☆☆한의원", "간호조무사", "대구", "수성구", "보건·의료", "무관", "정규직", "고졸", "월급", 245, 4, 9, 1, "간호조무사 자격,점심 제공"],
  ["j29", "○○여행사", "여행 상품 상담원", "부산", "부산진구", "영업·상담", "신입", "정규직", "대졸(2~3년)", "연봉", 2800, 3, 14, 2, "주 5일,여행 복지"],
  ["j30", "△△시립도서관", "도서 정리 보조 (오전)", "세종", "한솔동", "서비스", "무관", "시간제", "학력무관", "시급", 10500, 1, 12, 2, "주 5일 오전,공휴일 휴무"],
];

const PUBLIC_IDS = new Set(["j05", "j17", "j30"]);

const JOBS: Job[] = ROWS.map((r) => ({
  id: r[0],
  company: r[1],
  title: r[2],
  region: r[3],
  district: r[4],
  category: r[5],
  career: r[6],
  type: r[7],
  edu: r[8],
  pay: { unit: r[9], amount: r[10] },
  postedAgo: r[11],
  closeIn: r[12],
  headcount: r[13],
  tags: r[14].split(","),
  isPublic: PUBLIC_IDS.has(r[0]),
}));

const DUTIES: Record<Category, string[]> = {
  "사무·행정": ["문서 작성 및 자료 정리", "전산 입력 및 대장 관리", "전화·방문 응대"],
  "IT·개발": ["서비스 기능 개발 및 유지보수", "코드 리뷰 및 문서 작성", "운영 중 장애 대응"],
  디자인: ["시안 작업 및 결과물 제작", "브랜드 가이드 관리", "협업 부서 요청 대응"],
  "영업·상담": ["고객 상담 및 계약 안내", "상담 이력 관리", "신규 고객 발굴"],
  "생산·기술": ["생산 설비 운영", "품질 점검 및 기록", "작업장 안전 관리"],
  "보건·의료": ["환자 응대 및 진료 보조", "예약·접수 관리", "위생 및 물품 관리"],
  교육: ["수업 준비 및 진행", "학습 상담 및 기록 관리", "학부모 안내"],
  서비스: ["매장 운영 및 고객 응대", "상품 진열 및 재고 확인", "매장 청결 관리"],
};

const RANKS = {
  일간: ["사무원", "요양보호사", "개발자", "디자이너", "시간제", "상담사", "강사", "생산직", "간호조무사", "바리스타"],
  주간: ["요양보호사", "사무원", "보육교사", "개발자", "치과위생사", "품질관리", "상담사", "디자이너", "강사", "물류"],
} as const;
type RankPeriod = keyof typeof RANKS;

type Filters = {
  q: string;
  scope: Scope;
  regions: Region[];
  categories: Category[];
  career: "전체" | Career;
  types: JobType[];
  edu: "전체" | Edu;
  payUnit: PayUnit;
  payMin: string;
  posted: number;
  publicOnly: boolean;
};

const EMPTY_FILTERS: Filters = {
  q: "",
  scope: "전체",
  regions: [],
  categories: [],
  career: "전체",
  types: [],
  edu: "전체",
  payUnit: "연봉",
  payMin: "",
  posted: 99,
  publicOnly: false,
};

// 상황별 바로가기: 누르면 해당 조건으로 결과 표를 바꾼다
const SITUATIONS: Record<string, { label: string; preset: Partial<Filters> }[]> = {
  취업준비: [
    { label: "신입 채용", preset: { career: "신입" } },
    { label: "학력무관 일자리", preset: { edu: "학력무관" } },
    { label: "시간제 일자리", preset: { types: ["시간제"] } },
    { label: "자격 우대 공고", preset: { q: "자격" } },
  ],
  "일자리 찾기": [
    { label: "서울 일자리", preset: { regions: ["서울"] } },
    { label: "경기 일자리", preset: { regions: ["경기"] } },
    { label: "IT·개발", preset: { categories: ["IT·개발"] } },
    { label: "보건·의료", preset: { categories: ["보건·의료"] } },
  ],
  공공일자리: [
    { label: "공공기관 채용", preset: { publicOnly: true } },
    { label: "계약직 채용", preset: { types: ["계약직"] } },
    { label: "교육 분야", preset: { categories: ["교육"] } },
    { label: "세종 일자리", preset: { regions: ["세종"] } },
  ],
};
type Situation = keyof typeof SITUATIONS;

type Stored = { saved: string[]; applied: Record<string, string> };

/** 연봉 기준 만 원으로 환산 (월급 × 12, 시급 × 209시간 × 12) */
function annual(pay: { unit: PayUnit; amount: number }) {
  if (pay.unit === "연봉") return pay.amount;
  if (pay.unit === "월급") return pay.amount * 12;
  return Math.round((pay.amount * 209 * 12) / 10000);
}

function payLabel(pay: Job["pay"]) {
  if (pay.unit === "시급") return `시급 ${pay.amount.toLocaleString()}원`;
  return `${pay.unit} ${pay.amount.toLocaleString()}만 원`;
}

const careerLabel = (c: Career) => (c === "무관" ? "경력무관" : c);
const workDays = (j: Job) => (j.type === "시간제" ? "주 15~25시간" : "주 5일");

const EDU_RANK: Record<Edu, number> = { 학력무관: 0, 고졸: 1, "대졸(2~3년)": 2, "대졸(4년)": 3 };

function matches(j: Job, f: Filters) {
  const q = f.q.trim();
  if (q) {
    const hay =
      f.scope === "제목"
        ? j.title
        : f.scope === "회사명"
          ? j.company
          : f.scope === "직무내용"
            ? `${DUTIES[j.category].join(" ")} ${j.tags.join(" ")}`
            : `${j.title} ${j.company} ${j.type} ${DUTIES[j.category].join(" ")} ${j.tags.join(" ")}`;
    if (!hay.includes(q)) return false;
  }
  if (f.regions.length && !f.regions.includes(j.region)) return false;
  if (f.categories.length && !f.categories.includes(j.category)) return false;
  if (f.career !== "전체" && j.career !== f.career) return false;
  if (f.types.length && !f.types.includes(j.type)) return false;
  if (f.edu !== "전체" && EDU_RANK[j.edu] > EDU_RANK[f.edu]) return false;
  const min = Number(f.payMin);
  if (min > 0 && annual(j.pay) < annual({ unit: f.payUnit, amount: min })) return false;
  if (j.postedAgo > f.posted) return false;
  if (f.publicOnly && !j.isPublic) return false;
  return true;
}

// 오늘 날짜를 화면이 뜬 뒤에만 읽는다 (서버 렌더링 결과와 어긋나지 않게)
const noopSubscribe = () => () => {};
function useToday() {
  const iso = useSyncExternalStore(
    noopSubscribe,
    () => new Date().toISOString().slice(0, 10),
    () => null,
  );
  return iso ? new Date(`${iso}T00:00:00`) : null;
}

const DESKTOP_QUERY = "(min-width: 1024px)";
function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP_QUERY).matches, () => false);
}

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

/** 2026-10-07 형식 */
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt(d: Date) {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function JobPortalDemo() {
  const [stored, setStored] = useLocalStorage<Stored>("gs-demo:jobs:v1", { saved: [], applied: {} });
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<Sort>("최근등록일순");
  const [onlySaved, setOnlySaved] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [period, setPeriod] = useState<RankPeriod>("일간");
  const [situation, setSituation] = useState<Situation>("취업준비");
  const today = useToday();
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotionSafe();

  const results = useMemo(() => {
    const list = JOBS.filter((j) => (!onlySaved || stored.saved.includes(j.id)) && matches(j, filters));
    return [...list].sort((a, b) => {
      if (sort === "마감일순") return a.closeIn - b.closeIn;
      if (sort === "임금높은순") return annual(b.pay) - annual(a.pay);
      return a.postedAgo - b.postedAgo;
    });
  }, [filters, sort, onlySaved, stored.saved]);

  const activeCount =
    filters.regions.length +
    filters.categories.length +
    filters.types.length +
    (filters.career !== "전체" ? 1 : 0) +
    (filters.edu !== "전체" ? 1 : 0) +
    (Number(filters.payMin) > 0 ? 1 : 0) +
    (filters.posted !== 99 ? 1 : 0) +
    (filters.publicOnly ? 1 : 0);

  const newToday = JOBS.filter((j) => j.postedAgo === 0).length;
  const openJob = JOBS.find((j) => j.id === openId) ?? null;
  const confirmJob = JOBS.find((j) => j.id === confirmId) ?? null;

  const toggleSave = (id: string) => setStored((s) => ({ ...s, saved: toggle(s.saved, id) }));

  // Esc로 상세·확인 창 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirmId) setConfirmId(null);
      else if (openId) setOpenId(null);
      else setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmId, openId]);

  const toResults = () => {
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" }), 0);
  };

  const searchWord = (w: string) => {
    setFilters({ ...EMPTY_FILTERS, q: w });
    setOnlySaved(false);
    toResults();
  };

  const applyPreset = (preset: Partial<Filters>) => {
    setFilters({ ...EMPTY_FILTERS, ...preset });
    setOnlySaved(false);
    toResults();
  };

  const openDetailSearch = () => {
    if (isDesktop) setPanelOpen((v) => !v);
    else setSheetOpen(true);
  };

  function apply(id: string) {
    const d = today ?? new Date(0);
    setStored((s) => ({ ...s, applied: { ...s.applied, [id]: fmt(d) } }));
    setConfirmId(null);
  }

  const ranks = RANKS[period];

  return (
    <div className="min-h-screen bg-white text-[17px] leading-[1.5] text-[#1b2a4a]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded-[4px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:outline focus:outline-2 focus:outline-[#1b2a4a]">
        본문 바로가기
      </a>

      {/* 공식 누리집 표시 */}
      <p className="bg-[#f1f3f7] text-[14px] text-[#3c4660]">
        <span className="mx-auto block max-w-[1200px] px-4 py-1 md:px-6">이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
      </p>

      {/* 머리글 */}
      <header className="border-b border-[#dde2ea] bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 md:px-6">
          <span className={`${display.className} text-[26px] leading-none tracking-[-0.01em]`}>
            ○○<span className="rounded-[4px] bg-[#ffd23f] px-1">일자리</span>
          </span>
          <nav className="ml-8 hidden lg:block" aria-label="주메뉴">
            <ul className="flex gap-6 text-[17px] font-bold">
              {["채용정보", "공공일자리", "취업지원", "기업서비스", "고객센터"].map((m, i) => (
                <li key={m}>
                  <a href="#main" aria-current={i === 0 ? "page" : undefined} className={i === 0 ? "border-b-[3px] border-[#ffd23f] pb-1" : "text-[#3c4660] hover:text-[#1b2a4a]"}>
                    {m}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={() => {
              setOnlySaved((v) => !v);
              toResults();
            }}
            aria-pressed={onlySaved}
            className={`ml-auto inline-flex h-10 items-center gap-1.5 rounded-[6px] border-2 border-[#1b2a4a] px-3 text-[15px] font-bold ${onlySaved ? "bg-[#1b2a4a] text-white" : "bg-white"}`}
          >
            <Bookmark size={16} aria-hidden />
            관심공고 <span className="tabular-nums">{stored.saved.length}</span>
          </button>
        </div>
      </header>

      <main id="main">
        {/* 검색 */}
        <section aria-labelledby="search-title" className="border-b border-[#dde2ea] bg-[#f4f6fa]">
          <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-8 md:px-6 md:pt-12">
            <h1 id="search-title" className="sr-only">
              채용정보 검색
            </h1>
            <form
              id="job-search"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                toResults();
              }}
              className="mx-auto flex max-w-[820px] overflow-hidden rounded-[10px] border-[3px] border-[#1b2a4a] bg-white"
            >
              <label htmlFor="job-scope" className="sr-only">
                검색 범위
              </label>
              <select
                id="job-scope"
                value={filters.scope}
                onChange={(e) => setFilters((f) => ({ ...f, scope: e.target.value as Scope }))}
                className="w-[84px] shrink-0 border-r border-[#dde2ea] bg-white px-2 text-[15px] font-bold md:w-[110px] md:px-3 md:text-[16px]"
              >
                {SCOPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <label htmlFor="job-q" className="sr-only">
                검색어
              </label>
              <input
                id="job-q"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="검색어를 입력하세요"
                className="h-14 min-w-0 flex-1 bg-transparent px-3 text-[17px] outline-none placeholder:text-[#6b7489] md:h-16 md:text-[19px]"
              />
              <button type="submit" aria-label="검색" className="flex shrink-0 items-center gap-1.5 bg-[#1b2a4a] px-4 text-[17px] font-bold text-white md:px-8">
                <Search size={20} aria-hidden />
                <span className="hidden md:inline">검색</span>
              </button>
            </form>
            <p className="mx-auto mt-3 max-w-[820px] text-center text-[15px] text-[#3c4660]">
              채용공고 수 <b className="text-[#1b2a4a] tabular-nums">{JOBS.length.toLocaleString()}</b> 건 · 오늘 등록 <b className="text-[#1b2a4a] tabular-nums">{newToday}</b>건
            </p>

            <div className="mx-auto mt-6 grid max-w-[1040px] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              {/* 많이 찾은 검색어 */}
              <section aria-label="많이 찾은 검색어" className="rounded-[10px] border border-[#dde2ea] bg-white p-4 md:p-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-[17px] font-bold">많이 찾은 검색어</h2>
                  <div role="tablist" aria-label="집계 기간" className="ml-auto flex rounded-[6px] bg-[#f1f3f7] p-0.5">
                    {(Object.keys(RANKS) as RankPeriod[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        role="tab"
                        aria-selected={period === p}
                        aria-controls="rank-list"
                        onClick={() => setPeriod(p)}
                        className={`h-8 rounded-[4px] px-3 text-[14px] font-bold ${period === p ? "bg-white shadow-[0_1px_2px_rgba(27,42,74,0.2)]" : "text-[#56607a]"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <ol id="rank-list" role="tabpanel" aria-label={`${period} 순위`} className="mt-3 grid grid-flow-col grid-cols-2 grid-rows-5 gap-x-4">
                  {ranks.map((w, i) => (
                    <li key={w}>
                      <button type="button" onClick={() => searchWord(w)} className="flex h-9 w-full items-center gap-2 text-left text-[16px] hover:underline">
                        <span className={`w-5 shrink-0 text-right font-bold tabular-nums ${i < 3 ? "text-[#2455d6]" : "text-[#6b7489]"}`}>{i + 1}</span>
                        <span className="truncate">{w}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>

              {/* 상황별 바로가기 */}
              <section aria-labelledby="situation-title" className="rounded-[10px] border border-[#dde2ea] bg-white p-4 md:p-5">
                <h2 id="situation-title" className="sr-only">
                  상황별 서비스
                </h2>
                <div role="tablist" aria-label="상황별 서비스" className="flex border-b-2 border-[#1b2a4a]">
                  {(Object.keys(SITUATIONS) as Situation[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="tab"
                      id={`situation-tab-${s}`}
                      aria-selected={situation === s}
                      aria-controls="situation-panel"
                      onClick={() => setSituation(s)}
                      className={`-mb-0.5 h-11 flex-1 rounded-t-[6px] px-2 text-[15px] font-bold md:text-[16px] ${situation === s ? "bg-[#1b2a4a] text-white" : "text-[#3c4660] hover:text-[#1b2a4a]"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <ul id="situation-panel" role="tabpanel" aria-labelledby={`situation-tab-${situation}`} className="mt-3 grid grid-cols-2 gap-2">
                  {SITUATIONS[situation].map((it) => {
                    const n = JOBS.filter((j) => matches(j, { ...EMPTY_FILTERS, ...it.preset })).length;
                    return (
                      <li key={it.label}>
                        <button
                          type="button"
                          onClick={() => applyPreset(it.preset)}
                          className="flex h-14 w-full items-center justify-between gap-2 rounded-[6px] bg-[#f4f6fa] px-3 text-left text-[15px] font-bold hover:bg-[#fff4c7]"
                        >
                          <span className="break-keep">{it.label}</span>
                          <span className="shrink-0 text-[14px] font-normal text-[#56607a] tabular-nums">{n}건</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>
        </section>

        {/* 결과 */}
        <section id="results" aria-labelledby="results-title" className="mx-auto max-w-[1200px] scroll-mt-2 px-4 pb-10 pt-8 md:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h2 id="results-title" className="text-[22px] font-bold">
              {onlySaved ? "관심공고" : "채용정보"}
            </h2>
            <p className="text-[16px] text-[#3c4660]" aria-live="polite">
              검색건수 <b className="text-[#c8321f] tabular-nums">{results.length}</b> 건
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                id="detail-search-toggle"
                onClick={openDetailSearch}
                aria-expanded={isDesktop ? panelOpen : sheetOpen}
                aria-controls={isDesktop ? "detail-search-panel" : "detail-search-sheet"}
                className={`inline-flex h-10 items-center gap-1.5 rounded-[6px] border-2 px-3 text-[15px] font-bold ${activeCount ? "border-[#1b2a4a] bg-[#fff4c7]" : "border-[#1b2a4a]"}`}
              >
                <SlidersHorizontal size={16} aria-hidden />
                상세검색{activeCount ? ` ${activeCount}` : ""}
                <ChevronDown size={16} aria-hidden className={`hidden lg:block ${panelOpen ? "rotate-180" : ""}`} />
              </button>
              <label className="flex items-center">
                <span className="sr-only">정렬</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-10 rounded-[6px] border-2 border-[#dde2ea] bg-white px-2 text-[15px] font-bold"
                >
                  {SORTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {panelOpen && (
            <div id="detail-search-panel" className="mt-4 hidden rounded-[10px] border-2 border-[#1b2a4a] p-5 lg:block">
              <FilterPanel filters={filters} setFilters={setFilters} wide />
              <div className="mt-5 flex justify-end gap-2 border-t border-[#dde2ea] pt-4">
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...EMPTY_FILTERS, q: f.q, scope: f.scope }))}
                  className="inline-flex h-11 items-center gap-1.5 rounded-[6px] border-2 border-[#dde2ea] px-4 text-[15px] font-bold"
                >
                  <RotateCcw size={16} aria-hidden />
                  초기화
                </button>
                <button type="button" onClick={() => setPanelOpen(false)} className="h-11 rounded-[6px] bg-[#1b2a4a] px-6 text-[15px] font-bold text-white">
                  검색
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 rounded-[6px] bg-[#f4f6fa] px-3 py-2 text-[14px] leading-[1.6] text-[#3c4660]">
            『고용상 연령차별금지 및 고령자 고용촉진에 관한 법률』이 시행됨에 따라 채용정보에서 연령이 삭제되었습니다.
          </p>

          {results.length === 0 ? (
            <div className="mt-4 rounded-[10px] bg-[#f4f6fa] px-6 py-14 text-center">
              <p className="text-[19px] font-bold">검색 결과가 없습니다.</p>
              <button
                type="button"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setOnlySaved(false);
                }}
                className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-[6px] bg-[#1b2a4a] px-5 text-[15px] font-bold text-white"
              >
                <RotateCcw size={16} aria-hidden />
                초기화
              </button>
            </div>
          ) : (
            <table className="mt-4 w-full border-t-2 border-[#1b2a4a] text-left text-[15px] max-md:block">
              <caption className="sr-only">채용정보 검색 결과</caption>
              <thead className="bg-[#f4f6fa] max-md:hidden">
                <tr className="border-b border-[#dde2ea]">
                  <th scope="col" className="w-[38%] px-3 py-2.5 font-bold">회사명 / 채용공고명</th>
                  <th scope="col" className="px-3 py-2.5 font-bold">지원자격 / 근무조건</th>
                  <th scope="col" className="w-[190px] px-3 py-2.5 font-bold">마감 / 등록일</th>
                  <th scope="col" className="w-[64px] px-3 py-2.5 text-center font-bold">관심</th>
                </tr>
              </thead>
              <tbody className="max-md:block">
                {results.map((j) => (
                  <JobRow
                    key={j.id}
                    job={j}
                    today={today}
                    saved={stored.saved.includes(j.id)}
                    applied={!!stored.applied[j.id]}
                    onOpen={() => setOpenId(j.id)}
                    onSave={() => toggleSave(j.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      <footer className="border-t border-[#dde2ea] bg-[#f4f6fa]">
        <div className="mx-auto max-w-[1200px] px-4 py-8 pb-28 text-[15px] leading-[1.7] text-[#3c4660] md:px-6">
          <p className="font-bold text-[#1b2a4a]">○○일자리</p>
          <p>구인·구직 문의 고객센터 1588-0000 (평일 09:00~18:00)</p>
        </div>
      </footer>

      {/* 모바일 상세검색 창 */}
      {sheetOpen && (
        <div id="detail-search-sheet" className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
          <button type="button" aria-label="닫기" className="absolute inset-0 bg-[#1b2a4a]/50" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[12px] bg-white motion-safe:animate-[jobsheet_220ms_ease-out]">
            <div className="flex items-center justify-between border-b border-[#dde2ea] px-5 py-3">
              <p id="sheet-title" className="text-[19px] font-bold">
                상세검색
              </p>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="닫기" className="flex h-10 w-10 items-center justify-center">
                <X size={22} aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-[#dde2ea] p-4">
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...EMPTY_FILTERS, q: f.q, scope: f.scope }))}
                className="inline-flex h-12 items-center gap-1.5 rounded-[6px] border-2 border-[#dde2ea] px-4 text-[16px] font-bold"
              >
                <RotateCcw size={16} aria-hidden />
                초기화
              </button>
              <button type="button" onClick={() => setSheetOpen(false)} className="h-12 rounded-[6px] bg-[#1b2a4a] text-[17px] font-bold text-white">
                검색 ({results.length}건)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공고 상세 */}
      {openJob && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="job-detail-title">
          <button type="button" aria-label="닫기" className="absolute inset-0 bg-[#1b2a4a]/50" onClick={() => setOpenId(null)} />
          <JobDetail
            job={openJob}
            today={today}
            saved={stored.saved.includes(openJob.id)}
            appliedOn={stored.applied[openJob.id]}
            onClose={() => setOpenId(null)}
            onSave={() => toggleSave(openJob.id)}
            onApply={() => setConfirmId(openJob.id)}
          />
        </div>
      )}

      {/* 지원 확인 */}
      {confirmJob && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="apply-title">
          <button type="button" aria-label="닫기" className="absolute inset-0 bg-[#1b2a4a]/60" onClick={() => setConfirmId(null)} />
          <div className="relative w-full max-w-[400px] rounded-[12px] border-[3px] border-[#1b2a4a] bg-white p-6">
            <p id="apply-title" className="text-[19px] font-bold leading-[1.5]">
              이 공고에 지원하시겠습니까?
            </p>
            <p className="mt-2 text-[16px] leading-[1.6] text-[#3c4660]">
              {confirmJob.company}
              <br />
              {confirmJob.title}
            </p>
            <p className="mt-3 text-[15px] text-[#3c4660]">등록한 이력서로 지원됩니다.</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirmId(null)} className="h-12 rounded-[6px] border-2 border-[#1b2a4a] text-[16px] font-bold">
                취소
              </button>
              <button type="button" onClick={() => apply(confirmJob.id)} className="h-12 rounded-[6px] bg-[#2455d6] text-[16px] font-bold text-white hover:bg-[#1c45b3]">
                지원하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes jobsheet { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes jobdrawer { from { transform: translateX(32px); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  );
}

function DDay({ job, today }: { job: Job; today: Date | null }) {
  if (!today) return <span className="inline-block h-7 w-12" aria-hidden />;
  const n = job.closeIn;
  const urgent = n <= 3;
  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-[4px] px-2 text-[15px] font-bold tabular-nums ${
        urgent ? "bg-[#fde8e4] text-[#b42a19]" : "bg-[#eef2ff] text-[#2455d6]"
      }`}
    >
      {n === 0 ? "오늘 마감" : `D-${n}`}
      {urgent && n > 0 && <span>마감 임박</span>}
    </span>
  );
}

function JobRow({
  job,
  today,
  saved,
  applied,
  onOpen,
  onSave,
}: {
  job: Job;
  today: Date | null;
  saved: boolean;
  applied: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  return (
    <tr className="border-b border-[#dde2ea] align-top max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-x-2 max-md:py-3">
      <td className="px-3 py-3 max-md:px-0 max-md:py-0">
        <p className="text-[14px] font-bold text-[#56607a]">{job.company}</p>
        <button type="button" onClick={onOpen} className="mt-0.5 text-left text-[17px] font-bold leading-[1.45] text-[#1b2a4a] underline-offset-4 hover:text-[#2455d6] hover:underline">
          {job.title}
        </button>
        <p className="mt-1.5 flex flex-wrap gap-1">
          {job.isPublic && <span className="rounded-[4px] border border-[#2455d6] px-1.5 text-[13px] font-bold leading-[1.6] text-[#2455d6]">공공기관</span>}
          {job.postedAgo === 0 && <span className="rounded-[4px] bg-[#ffd23f] px-1.5 text-[13px] font-bold leading-[1.6]">오늘 등록</span>}
          {applied && (
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#1f7a3e]">
              <CheckCircle2 size={14} aria-hidden />
              지원 완료
            </span>
          )}
        </p>
      </td>
      <td className="px-3 py-3 text-[#3c4660] max-md:col-span-2 max-md:row-start-2 max-md:px-0 max-md:pb-0 max-md:pt-2">
        <p className="font-bold text-[#1b2a4a]">{payLabel(job.pay)}</p>
        <p>
          {careerLabel(job.career)} | {job.edu}
        </p>
        <p>
          {job.type} | {workDays(job)}
        </p>
        <p className="inline-flex items-center gap-1">
          <MapPin size={14} aria-hidden />
          {job.region} {job.district}
        </p>
      </td>
      <td className="px-3 py-3 text-[14px] text-[#3c4660] max-md:col-span-2 max-md:row-start-3 max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:px-0 max-md:pb-0 max-md:pt-2">
        <DDay job={job} today={today} />
        {today && (
          <>
            <p className="md:mt-1.5 tabular-nums">마감일 : {isoDate(addDays(today, job.closeIn))}</p>
            <p className="tabular-nums">등록일 : {isoDate(addDays(today, -job.postedAgo))}</p>
          </>
        )}
      </td>
      <td className="px-3 py-3 text-center max-md:col-start-2 max-md:row-start-1 max-md:p-0">
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          aria-label={`${job.title} 관심공고${saved ? " 해제" : " 저장"}`}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-[6px] border-2 transition-colors ${
            saved ? "border-[#1b2a4a] bg-[#ffd23f]" : "border-[#dde2ea] hover:border-[#1b2a4a]"
          }`}
        >
          {saved ? <BookmarkCheck size={18} aria-hidden /> : <Bookmark size={18} aria-hidden />}
        </button>
      </td>
    </tr>
  );
}

function JobDetail({
  job,
  today,
  saved,
  appliedOn,
  onClose,
  onSave,
  onApply,
}: {
  job: Job;
  today: Date | null;
  saved: boolean;
  appliedOn?: string;
  onClose: () => void;
  onSave: () => void;
  onApply: () => void;
}) {
  const posted = today ? isoDate(addDays(today, -job.postedAgo)) : "";
  const deadline = today ? isoDate(addDays(today, job.closeIn)) : "";
  const hours =
    job.type === "시간제" ? "주 15~25시간, 요일·시간 협의" : job.category === "생산·기술" ? "주 5일, 08:30~17:30 (교대 근무 있음)" : "주 5일, 09:00~18:00";

  return (
    <article className="absolute inset-0 flex flex-col bg-white md:inset-y-0 md:left-auto md:right-0 md:w-[560px] md:border-l-4 md:border-[#1b2a4a] motion-safe:md:animate-[jobdrawer_220ms_ease-out]">
      <div className="flex items-center gap-2 border-b border-[#dde2ea] px-5 py-3">
        <DDay job={job} today={today} />
        <button type="button" onClick={onClose} aria-label="닫기" className="ml-auto flex h-10 w-10 items-center justify-center">
          <X size={24} aria-hidden />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-5 md:px-7">
        <p className="text-[16px] font-bold text-[#56607a]">{job.company}</p>
        <h2 id="job-detail-title" className={`${display.className} mt-1 text-[28px] leading-[1.3]`}>
          {job.title}
        </h2>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.map((t) => (
            <span key={t} className="rounded-[4px] bg-[#f4f6fa] px-2.5 py-1 text-[14px] font-bold text-[#3c4660]">
              {t}
            </span>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border-2 border-[#1b2a4a] bg-[#1b2a4a] text-[15px]">
          {[
            { k: "임금", v: payLabel(job.pay), icon: Wallet },
            { k: "근무지", v: `${job.region} ${job.district}`, icon: MapPin },
            { k: "경력", v: `${careerLabel(job.career)}, ${job.type}`, icon: Briefcase },
            { k: "학력", v: job.edu, icon: GraduationCap },
          ].map(({ k, v, icon: Icon }) => (
            <div key={k} className="bg-white p-3">
              <dt className="inline-flex items-center gap-1 text-[#56607a]">
                <Icon size={14} aria-hidden />
                {k}
              </dt>
              <dd className="mt-0.5 font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        <Section title="모집요강">
          <p>
            모집인원 {job.headcount}명, 직종 {job.category}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {DUTIES[job.category].map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Section>
        <Section title="근무조건">
          <ul className="space-y-1">
            <li>근무시간: {hours}</li>
            <li>고용형태: {job.type}</li>
            <li>복리후생: 4대보험, 퇴직금, {job.tags[0]}</li>
          </ul>
        </Section>
        <Section title="전형방법">
          <ol className="flex flex-wrap items-center gap-2">
            {(job.career === "경력" ? ["서류전형", "실무면접", "임원면접", "최종합격"] : ["서류전형", "면접", "최종합격"]).map((s, i) => (
              <li key={s} className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1b2a4a] text-[14px] font-bold text-white">{i + 1}</span>
                <span className="font-bold">{s}</span>
              </li>
            ))}
          </ol>
        </Section>
        <Section title="제출서류">
          <ul className="list-disc space-y-1 pl-5">
            <li>이력서, 자기소개서</li>
            {job.career === "경력" && <li>경력증명서</li>}
            {job.category === "디자인" && <li>포트폴리오</li>}
            {job.tags.some((t) => t.includes("자격") || t.includes("면허")) && <li>자격증 사본</li>}
          </ul>
        </Section>
        <Section title="접수방법">
          <ul className="space-y-1">
            <li>
              접수기간: {posted} ~ {deadline}
            </li>
            <li>접수방법: ○○일자리 온라인 입사지원</li>
            <li>문의: 인사 담당자 02-000-0000</li>
          </ul>
        </Section>
      </div>
      <div className="flex gap-2 border-t-2 border-[#1b2a4a] bg-white p-4">
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          className={`inline-flex h-12 shrink-0 items-center gap-1.5 rounded-[6px] border-2 border-[#1b2a4a] px-4 text-[16px] font-bold ${saved ? "bg-[#ffd23f]" : "bg-white"}`}
        >
          {saved ? <BookmarkCheck size={18} aria-hidden /> : <Bookmark size={18} aria-hidden />}
          관심공고
        </button>
        {appliedOn ? (
          <p className="flex flex-1 items-center justify-center gap-1.5 rounded-[6px] bg-[#e7f5ec] text-[16px] font-bold text-[#1f7a3e]">
            <CheckCircle2 size={18} aria-hidden />
            {appliedOn} 지원 완료
          </p>
        ) : (
          <button type="button" onClick={onApply} className="h-12 flex-1 rounded-[6px] bg-[#2455d6] text-[17px] font-bold text-white hover:bg-[#1c45b3]">
            입사지원
          </button>
        )}
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="border-b-2 border-[#1b2a4a] pb-1.5 text-[17px] font-bold">{title}</h3>
      <div className="mt-2 text-[16px] leading-[1.7] text-[#3c4660]">{children}</div>
    </section>
  );
}

function FilterPanel({ filters, setFilters, wide }: { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>>; wide?: boolean }) {
  const selectCls = "mt-2 h-11 w-full rounded-[6px] border-2 border-[#dde2ea] bg-white px-2 text-[15px]";
  return (
    <div className={wide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "space-y-6"}>
      <ChipGroup label="직종" options={CATEGORIES} value={filters.categories} onToggle={(v) => setFilters((f) => ({ ...f, categories: toggle(f.categories, v) }))} />
      <ChipGroup label="지역" options={REGIONS} value={filters.regions} onToggle={(v) => setFilters((f) => ({ ...f, regions: toggle(f.regions, v) }))} />
      <fieldset>
        <legend className="text-[15px] font-bold">경력</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["전체", "신입", "경력", "무관"] as const).map((o) => (
            <label key={o} className="cursor-pointer">
              <input
                type="radio"
                name={wide ? "career-wide" : "career"}
                checked={filters.career === o}
                onChange={() => setFilters((f) => ({ ...f, career: o }))}
                className="peer sr-only"
              />
              <span className="inline-flex h-9 items-center rounded-[6px] border-2 border-[#dde2ea] px-3 text-[15px] font-bold peer-checked:border-[#1b2a4a] peer-checked:bg-[#1b2a4a] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2455d6]">
                {o === "무관" ? "관계없음" : o}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <ChipGroup label="고용형태" options={TYPES} value={filters.types} onToggle={(v) => setFilters((f) => ({ ...f, types: toggle(f.types, v) }))} />
      <label className="block">
        <span className="text-[15px] font-bold">학력</span>
        <select value={filters.edu} onChange={(e) => setFilters((f) => ({ ...f, edu: e.target.value as Filters["edu"] }))} className={selectCls}>
          <option value="전체">전체</option>
          {EDUS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-[15px] font-bold">희망임금</legend>
        <div className="mt-2 flex items-center gap-2">
          <label className="shrink-0">
            <span className="sr-only">임금 형태</span>
            <select
              value={filters.payUnit}
              onChange={(e) => setFilters((f) => ({ ...f, payUnit: e.target.value as PayUnit, payMin: "" }))}
              className="h-11 rounded-[6px] border-2 border-[#dde2ea] bg-white px-2 text-[15px]"
            >
              {PAY_UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <span className="sr-only">최소 금액</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={filters.payMin}
              onChange={(e) => setFilters((f) => ({ ...f, payMin: e.target.value }))}
              placeholder={filters.payUnit === "연봉" ? "3000" : filters.payUnit === "월급" ? "250" : "10030"}
              className="h-11 min-w-0 flex-1 rounded-[6px] border-2 border-[#dde2ea] px-2 text-[15px] tabular-nums"
            />
            <span className="shrink-0 text-[15px]">{filters.payUnit === "시급" ? "원 이상" : "만원 이상"}</span>
          </label>
        </div>
      </fieldset>
      <label className="block">
        <span className="text-[15px] font-bold">등록일</span>
        <select value={filters.posted} onChange={(e) => setFilters((f) => ({ ...f, posted: Number(e.target.value) }))} className={selectCls}>
          {POSTED.map((p) => (
            <option key={p.label} value={p.days}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex h-11 cursor-pointer items-center gap-2 self-end text-[15px] font-bold">
        <input type="checkbox" checked={filters.publicOnly} onChange={(e) => setFilters((f) => ({ ...f, publicOnly: e.target.checked }))} className="h-5 w-5 accent-[#1b2a4a]" />
        공공기관 채용만
      </label>
    </div>
  );
}

function ChipGroup<T extends string>({ label, options, value, onToggle }: { label: string; options: readonly T[]; value: T[]; onToggle: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o)}
              className={`h-9 rounded-[6px] border-2 px-3 text-[15px] font-bold transition-colors ${
                on ? "border-[#1b2a4a] bg-[#1b2a4a] text-white" : "border-[#dde2ea] bg-white hover:border-[#1b2a4a]"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
