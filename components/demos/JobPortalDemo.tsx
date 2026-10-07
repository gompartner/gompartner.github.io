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

/* 채용 정보 포털 데모. 가상 서비스 "ㄴㄹ일자리".
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
  ["j01", "ㅎㄱ물류(주)", "물류센터 입출고 관리 사무원", "경기", "이천시", "사무·행정", "무관", "정규직", "고졸", "연봉", 3000, 0, 14, 2, "주 5일,4대보험,통근버스"],
  ["j02", "ㅋㄷㅇ소프트", "웹 서비스 백엔드 개발자 (Java)", "서울", "구로구", "IT·개발", "경력", "정규직", "대졸(4년)", "연봉", 5200, 1, 20, 1, "재택 병행,유연근무"],
  ["j03", "ㅁㄴ디자인랩", "브랜드·편집 디자이너", "서울", "마포구", "디자인", "경력", "정규직", "대졸(2~3년)", "연봉", 3600, 2, 9, 1, "주 5일,포트폴리오 제출"],
  ["j04", "ㅊㅅㄹ내과의원", "외래 접수·수납 담당", "부산", "해운대구", "보건·의료", "무관", "정규직", "고졸", "월급", 250, 0, 3, 1, "주 5일,토요일 격주"],
  ["j05", "구립ㅂㅅ어린이집", "보육교사 (만 3세반)", "대전", "유성구", "교육", "무관", "정규직", "대졸(2~3년)", "월급", 245, 3, 12, 2, "보육교사 자격,식사 제공"],
  ["j06", "ㅊㅇ정밀", "CNC 가공 기술자", "대구", "달서구", "생산·기술", "경력", "정규직", "학력무관", "연봉", 4200, 4, 25, 3, "기숙사,야간수당"],
  ["j07", "ㅇㅁㅌ", "매장 진열·계산 (오후 파트)", "인천", "연수구", "서비스", "무관", "시간제", "학력무관", "시급", 11000, 0, 5, 4, "주 3일,근무시간 협의"],
  ["j08", "ㅎㄴ텔레콤", "고객센터 상담사", "광주", "서구", "영업·상담", "신입", "계약직", "고졸", "월급", 260, 1, 2, 10, "교육 후 배치,정규직 전환"],
  ["j09", "ㅅㅇ세무회계", "세무 회계 사무원", "서울", "강남구", "사무·행정", "경력", "정규직", "대졸(2~3년)", "연봉", 3400, 5, 18, 1, "전산회계 자격 우대"],
  ["j10", "ㅋㄷㄴㅁ에듀", "초등 방과후 코딩 강사", "세종", "보람동", "교육", "무관", "시간제", "대졸(4년)", "시급", 25000, 2, 10, 2, "주 2일,수업 자료 제공"],
  ["j11", "ㅍㄹㄷ식품(주)", "식품 생산라인 품질관리", "경기", "평택시", "생산·기술", "신입", "정규직", "대졸(2~3년)", "연봉", 3200, 6, 22, 2, "주 5일,구내식당"],
  ["j12", "ㄴㅅㅌ시스템즈", "사내 전산 운영·헬프데스크", "대전", "서구", "IT·개발", "신입", "정규직", "대졸(2~3년)", "연봉", 3100, 1, 16, 1, "정보처리 자격 우대"],
  ["j13", "ㄴㅍㅎ요양원", "요양보호사 (주간)", "경기", "고양시", "보건·의료", "무관", "정규직", "학력무관", "월급", 240, 3, 4, 3, "요양보호사 자격"],
  ["j14", "ㄱㄱ인테리어", "3D 공간 디자이너", "부산", "수영구", "디자인", "경력", "정규직", "대졸(2~3년)", "연봉", 3800, 7, 21, 1, "스케치업 가능자"],
  ["j15", "ㅂㄹ렌탈", "B2B 영업 담당", "서울", "영등포구", "영업·상담", "경력", "정규직", "대졸(4년)", "연봉", 4500, 2, 13, 2, "인센티브,차량 지원"],
  ["j16", "카페 ㄷㅈ", "바리스타 (주말)", "대구", "중구", "서비스", "무관", "시간제", "학력무관", "시급", 10500, 0, 6, 2, "주말 근무,음료 제공"],
  ["j17", "ㄴㄹ진흥원", "사업 운영 계약직 연구원", "세종", "어진동", "사무·행정", "경력", "계약직", "대졸(4년)", "연봉", 3900, 4, 7, 1, "1년 계약,연장 가능"],
  ["j18", "ㅍㄹ앱스", "모바일 앱 개발자 (Flutter)", "경기", "성남시", "IT·개발", "경력", "정규직", "대졸(4년)", "연봉", 5600, 3, 28, 1, "스톡옵션,유연근무"],
  ["j19", "ㅅㄹ전자", "전자부품 조립 생산직", "광주", "광산구", "생산·기술", "신입", "계약직", "학력무관", "월급", 280, 1, 1, 8, "주야 2교대,기숙사"],
  ["j20", "밝은미소치과", "치과위생사", "인천", "남동구", "보건·의료", "경력", "정규직", "대졸(2~3년)", "월급", 300, 5, 15, 1, "치과위생사 면허"],
  ["j21", "ㅅㅎ학원", "중등 수학 강사", "서울", "노원구", "교육", "경력", "정규직", "대졸(4년)", "월급", 320, 2, 11, 1, "오후 근무,인센티브"],
  ["j22", "ㅎㅇ호텔", "프런트 데스크 직원", "부산", "중구", "서비스", "무관", "정규직", "고졸", "연봉", 2900, 6, 19, 2, "외국어 가능자 우대,교대 근무"],
  ["j23", "ㄷㄷ보험", "보험 계약 심사 사무원", "대전", "중구", "사무·행정", "신입", "정규직", "대졸(4년)", "연봉", 3500, 0, 24, 3, "주 5일,자격 취득 지원"],
  ["j24", "ㅇㅌㅇ모빌리티", "차량 정비 기사", "경기", "화성시", "생산·기술", "경력", "정규직", "학력무관", "연봉", 4000, 8, 17, 2, "정비 자격,공구 지원"],
  ["j25", "ㄷㅇㄹ쇼핑", "상세페이지 웹디자이너", "인천", "부평구", "디자인", "신입", "계약직", "대졸(2~3년)", "월급", 250, 1, 8, 1, "6개월 계약,정규직 전환"],
  ["j26", "ㄷㅇㅌ", "데이터 라벨링 작업자", "광주", "북구", "IT·개발", "무관", "시간제", "학력무관", "시급", 12000, 2, 3, 15, "재택 가능,교육 제공"],
  ["j27", "ㅎㄱ상사", "무역 사무·수출입 서류", "서울", "중구", "사무·행정", "경력", "정규직", "대졸(4년)", "연봉", 3700, 9, 26, 1, "무역 영어,국제무역사 우대"],
  ["j28", "ㅇㄱ한의원", "간호조무사", "대구", "수성구", "보건·의료", "무관", "정규직", "고졸", "월급", 245, 4, 9, 1, "간호조무사 자격,점심 제공"],
  ["j29", "ㄱㄷㅁ여행사", "여행 상품 상담원", "부산", "부산진구", "영업·상담", "신입", "정규직", "대졸(2~3년)", "연봉", 2800, 3, 14, 2, "주 5일,여행 복지"],
  ["j30", "ㅁㄹ시립도서관", "도서 정리 보조 (오전)", "세종", "한솔동", "서비스", "무관", "시간제", "학력무관", "시급", 10500, 1, 12, 2, "주 5일 오전,공휴일 휴무"],
];

const PUBLIC_IDS = new Set(["j05", "j17", "j30"]);

/** 화면에 싣는 공고는 일부. 건수는 실제 포털 규모로 보여 준다 */
const TOTAL_JOBS = 12847;
const TODAY_NEW = 316;
const PER_PAGE = 10;

/** 실은 공고 n건을 전체 규모 건수로 환산 (끝자리가 고르지 않게) */
function shownCount(n: number) {
  if (n === 0) return 0;
  if (n === ROWS.length) return TOTAL_JOBS;
  return Math.round((n * TOTAL_JOBS) / ROWS.length) - ((n * 37) % 113);
}

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

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 10.21(수) 형식 */
function shortDate(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}(${DOW[d.getDay()]})`;
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
  const [nav, setNav] = useState<{ page: MenuName; sub: string }>({ page: "채용정보", sub: "" });
  // 검색 버튼·추천어·바로가기로 확정할 때만 늘려 목록이 입력마다 깜빡이지 않게 한다
  const [searchSeq, setSearchSeq] = useState(0);
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

  const sig = `${JSON.stringify(filters)}|${sort}|${onlySaved}`;
  const [pageState, setPageState] = useState({ sig, n: 1 });
  const page = pageState.sig === sig ? pageState.n : 1;
  const total = onlySaved ? results.length : shownCount(results.length);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const realPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const from = ((page - 1) % realPages) * PER_PAGE;
  const pageRows = results.slice(from, from + PER_PAGE);
  const groupStart = Math.floor((page - 1) / 10) * 10 + 1;
  const pageNums = Array.from({ length: Math.min(10, totalPages - groupStart + 1) }, (_, i) => groupStart + i);
  const goPage = (n: number) => {
    setPageState({ sig, n });
    document.getElementById("results")?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  };
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

  // 사용법 가이드: 하위 화면에서 누르면 열린 창을 닫고 첫 화면(채용정보)으로 돌아간다
  useEffect(() => {
    const f = () => {
      setNav({ page: "채용정보", sub: "" });
      setOpenId(null);
      setConfirmId(null);
      setSheetOpen(false);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  // 상단 메뉴: 채용정보는 첫 화면, 나머지는 하위 화면으로 바꾸고 맨 위로 올린다
  const goMenu = (page: MenuName, sub?: string) => {
    setNav({ page, sub: sub ?? SUBMENU[page][0] ?? "" });
    window.scrollTo({ top: 0 });
  };

  const toResults = () => {
    setSearchSeq((n) => n + 1);
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
          <a
            href="#main"
            onClick={(e) => {
              e.preventDefault();
              goMenu("채용정보");
            }}
            className={`${display.className} text-[26px] leading-none tracking-[-0.01em]`}
          >
            ㄴㄹ<span className="rounded-[4px] bg-[#ffd23f] px-1">일자리</span>
          </a>
          <nav className="ml-8 hidden lg:block" aria-label="주메뉴">
            <MenuList current={nav.page} onGo={goMenu} />
          </nav>
          <button
            type="button"
            onClick={() => {
              if (nav.page !== "채용정보") {
                goMenu("채용정보");
                setOnlySaved(true);
              } else setOnlySaved((v) => !v);
              toResults();
            }}
            aria-pressed={onlySaved}
            className={`ml-auto inline-flex h-10 items-center gap-1.5 rounded-[6px] border-2 border-[#1b2a4a] px-3 text-[15px] font-bold ${onlySaved ? "bg-[#1b2a4a] text-white" : "bg-white"}`}
          >
            <Bookmark size={16} aria-hidden />
            관심공고 <span className="tabular-nums">{stored.saved.length}</span>
          </button>
        </div>
        <nav className="border-t border-[#dde2ea] lg:hidden" aria-label="주메뉴">
          <MenuList current={nav.page} onGo={goMenu} mobile />
        </nav>
      </header>

      <main id="main" key={`${nav.page}|${nav.sub}`} className="soft-in">
        {nav.page !== "채용정보" ? (
          <JobSubPage page={nav.page} sub={nav.sub} today={today} onGo={goMenu} />
        ) : (
          <>
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
              채용공고 수 <b className="text-[#1b2a4a] tabular-nums">{TOTAL_JOBS.toLocaleString()}</b>건 · 오늘 등록 <b className="text-[#1b2a4a] tabular-nums">{TODAY_NEW}</b>건
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
                <ol key={period} id="rank-list" role="tabpanel" aria-label={`${period} 순위`} className="soft-in mt-3 grid grid-flow-col grid-cols-2 grid-rows-5 gap-x-4">
                  {ranks.map((w, i) => (
                    <li key={w}>
                      <button type="button" onClick={() => searchWord(w)} className="flex h-9 w-full items-center gap-2 text-left text-[16px] hover:underline">
                        <span className={`w-6 shrink-0 whitespace-nowrap text-right font-bold tabular-nums ${i < 3 ? "text-[#2455d6]" : "text-[#6b7489]"}`}>{i + 1}</span>
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
                <ul key={situation} id="situation-panel" role="tabpanel" aria-labelledby={`situation-tab-${situation}`} className="soft-in mt-3 grid grid-cols-2 gap-2">
                  {SITUATIONS[situation].map((it) => {
                    const n = shownCount(JOBS.filter((j) => matches(j, { ...EMPTY_FILTERS, ...it.preset })).length);
                    return (
                      <li key={it.label}>
                        <button
                          type="button"
                          onClick={() => applyPreset(it.preset)}
                          className="flex h-14 w-full items-center justify-between gap-2 rounded-[6px] bg-[#f4f6fa] px-3 text-left text-[15px] font-bold hover:bg-[#fff4c7]"
                        >
                          <span className="break-keep">{it.label}</span>
                          <span className="shrink-0 text-[14px] font-normal text-[#56607a] tabular-nums">{n.toLocaleString()}건</span>
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
              검색건수 <b className="text-[#c8321f] tabular-nums">{total.toLocaleString()}</b>건
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
              <tbody key={`${JSON.stringify({ ...filters, q: "" })}|${sort}|${onlySaved}|${page}|${searchSeq}`} className="soft-in max-md:block">
                {pageRows.map((j) => (
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
          {results.length > 0 && totalPages > 1 && (
            <nav aria-label="페이지" className="mt-6 flex flex-wrap items-center justify-center gap-1">
              {groupStart > 1 && (
                <button type="button" onClick={() => goPage(groupStart - 1)} className="h-10 rounded-[4px] border border-[#dde2ea] px-3 text-[15px] hover:border-[#1b2a4a]">
                  이전
                </button>
              )}
              {pageNums.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goPage(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`h-10 min-w-10 rounded-[4px] px-2 text-[15px] tabular-nums ${n === page ? "bg-[#1b2a4a] font-bold text-white" : "border border-[#dde2ea] hover:border-[#1b2a4a]"}`}
                >
                  {n}
                </button>
              ))}
              {groupStart + 9 < totalPages && (
                <button type="button" onClick={() => goPage(groupStart + 10)} className="h-10 rounded-[4px] border border-[#dde2ea] px-3 text-[15px] hover:border-[#1b2a4a]">
                  다음
                </button>
              )}
            </nav>
          )}
        </section>
          </>
        )}
      </main>

      <footer className="border-t border-[#dde2ea] bg-[#f4f6fa]">
        <div className="mx-auto max-w-[1200px] px-4 py-8 pb-28 text-[15px] leading-[1.7] text-[#3c4660] md:px-6">
          <p className="font-bold text-[#1b2a4a]">ㄴㄹ일자리</p>
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
                검색 ({total.toLocaleString()}건)
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

function Deadline({ job, today }: { job: Job; today: Date | null }) {
  if (!today) return <span className="inline-block h-6 w-20" aria-hidden />;
  const n = job.closeIn;
  const urgent = n <= 3;
  return (
    <p className="text-[15px] tabular-nums">
      <span className={urgent ? "font-bold text-[#b42a19]" : "text-[#1b2a4a]"}>~ {shortDate(addDays(today, n))}</span>
      {urgent && <span className="ml-1.5 font-bold text-[#b42a19]">{n === 0 ? "오늘 마감" : "마감 임박"}</span>}
    </p>
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
        <Deadline job={job} today={today} />
        {today && <p className="tabular-nums md:mt-1">등록일 : {isoDate(addDays(today, -job.postedAgo))}</p>}
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
        <Deadline job={job} today={today} />
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
            <li>접수방법: ㄴㄹ일자리 온라인 입사지원</li>
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

/* ---------- 하위 화면 ---------- */

const MENUS = ["채용정보", "공공일자리", "취업지원", "기업서비스", "고객센터"] as const;
type MenuName = (typeof MENUS)[number];

const SUBMENU: Record<MenuName, string[]> = {
  채용정보: [],
  공공일자리: ["공공일자리 목록", "채용박람회"],
  취업지원: ["취업지원 프로그램", "직업훈련"],
  기업서비스: ["구인등록 안내", "구인신청"],
  고객센터: ["공지사항", "자주 묻는 질문", "1:1 문의"],
};

function MenuList({ current, onGo, mobile }: { current: MenuName; onGo: (p: MenuName) => void; mobile?: boolean }) {
  return (
    <ul className={mobile ? "flex overflow-x-auto px-2 text-[16px] font-bold" : "flex gap-6 text-[17px] font-bold"}>
      {MENUS.map((m) => {
        const on = m === current;
        return (
          <li key={m} className="shrink-0">
            <button
              type="button"
              onClick={() => onGo(m)}
              aria-current={on ? "page" : undefined}
              className={
                mobile
                  ? `h-11 border-b-[3px] px-3 ${on ? "border-[#ffd23f]" : "border-transparent text-[#3c4660]"}`
                  : on
                    ? "border-b-[3px] border-[#ffd23f] pb-1"
                    : "border-b-[3px] border-transparent pb-1 text-[#3c4660] hover:text-[#1b2a4a]"
              }
            >
              {m}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type PublicKind = "공공기관" | "지자체" | "공공근로";
// [기관, 공고명, 구분, 고용형태, 인원, 접수 시작(N일 전), 마감(N일 후), 근무기간, 근무시간, 임금]
const PUBLIC_ROWS: [string, string, PublicKind, string, number, number, number, string, string, string][] = [
  ["ㅎㄴ구청", "2026년 하반기 기간제 근로자 채용 (행정 보조)", "지자체", "기간제", 5, 2, 7, "2026. 11. 2. ~ 12. 31.", "주 5일 09:00 ~ 18:00", "시급 10,320원"],
  ["ㅎㄴ구 일자리정책과", "2026년 4단계 공공근로사업 참여자 모집", "공공근로", "기간제", 40, 1, 9, "2026. 11. 2. ~ 2027. 1. 29.", "주 5일 09:00 ~ 14:00", "시급 10,320원"],
  ["ㄴㄹ시설관리공단", "체육시설 운영직 채용", "공공기관", "무기계약직", 3, 3, 12, "채용일부터", "주 5일 교대 근무", "월급 245만 원"],
  ["ㄴㄹ진흥원", "사업 운영 계약직 연구원", "공공기관", "계약직", 1, 4, 7, "1년 (연장 가능)", "주 5일 09:00 ~ 18:00", "연봉 3,900만 원"],
  ["ㅁㄹ시 중앙도서관", "도서관 자료정리 보조", "지자체", "기간제", 2, 0, 10, "2026. 11. 2. ~ 2027. 2. 26.", "주 5일 09:00 ~ 13:00", "시급 10,320원"],
  ["ㄴㄹ문화재단", "축제 운영 보조 단기 인력", "공공기관", "기간제", 10, 5, 2, "2026. 10. 30. ~ 11. 8.", "행사일 10:00 ~ 19:00", "일급 95,000원"],
  ["ㅎㄴ구 청소행정과", "환경정비 공공근로 참여자 모집", "공공근로", "기간제", 25, 6, 4, "2026. 11. 2. ~ 12. 31.", "주 5일 08:00 ~ 12:00", "시급 10,320원"],
  ["ㅅㄱ구 보건소", "방문 건강관리 간호사", "지자체", "기간제", 2, 9, -1, "2026. 11. 1. ~ 12. 31.", "주 5일 09:00 ~ 18:00", "월급 290만 원"],
];

const FAIRS = [
  ["2026 ㅎㄴ구 하반기 일자리 박람회", "10. 22.(목) 13:00 ~ 17:00", "ㅎㄴ구청 대강당", "32개사", "사전신청"],
  ["중장년 채용박람회", "10. 28.(수) 10:00 ~ 16:00", "ㄴㄹ시 일자리센터", "25개사", "사전신청"],
  ["청년 IT·디지털 채용박람회", "11. 5.(목) 13:00 ~ 18:00", "ㄴㄹ컨벤션센터 3층", "40개사", "예정"],
  ["경력단절여성 취업박람회", "9. 24.(목) 10:00 ~ 16:00", "ㅎㄴ구 여성회관", "28개사", "종료"],
];

const PROGRAMS = [
  { name: "1:1 취업상담", target: "구직자 누구나", when: "평일 10:00 ~ 17:00", where: "ㄴㄹ일자리센터 상담실" },
  { name: "직업심리검사", target: "구직자 누구나", when: "상시", where: "온라인" },
  { name: "이력서·자기소개서 클리닉", target: "구직자 누구나", when: "매주 화요일 14:00", where: "ㄴㄹ일자리센터 교육실" },
  { name: "모의면접", target: "구직자 누구나", when: "매주 목요일 14:00", where: "ㄴㄹ일자리센터 교육실" },
  { name: "취업특강", target: "청년 구직자", when: "매월 둘째 주 수요일 19:00", where: "ㅎㄴ구청 대강당" },
  { name: "면접정장 무료 대여", target: "만 18 ~ 39세 청년 구직자", when: "평일 10:00 ~ 19:00", where: "협력 대여점 12곳" },
];

const TRAININGS = [
  ["웹 퍼블리셔 양성과정", "2026. 11. 2. ~ 2027. 3. 19.", "주 5일 09:30 ~ 16:30", "국민내일배움카드", "접수중"],
  ["전산회계 1급 취득과정", "2026. 11. 9. ~ 2027. 1. 15.", "주 5일 19:00 ~ 22:00", "국민내일배움카드", "접수중"],
  ["요양보호사 자격과정", "2026. 10. 19. ~ 12. 11.", "주 5일 09:00 ~ 18:00", "국민내일배움카드", "마감"],
  ["물류관리 실무과정", "2026. 11. 16. ~ 12. 24.", "주 5일 09:00 ~ 15:00", "전액 지원", "접수중"],
];

const NOTICES = [
  {
    title: "시스템 점검에 따른 서비스 일시 중단 안내",
    date: "2026.10.06",
    views: 812,
    body: ["시스템 점검으로 아래 시간 동안 서비스 이용이 중단됩니다.", "1. 중단일시: 2026. 10. 10.(토) 00:00 ~ 06:00", "2. 중단내용: 채용정보 검색, 입사지원, 구인신청", "이용에 불편을 드려 죄송합니다."],
  },
  { title: "2026 ㅎㄴ구 하반기 일자리 박람회 개최 안내", date: "2026.10.02", views: 1530, body: ["1. 일시: 2026. 10. 22.(목) 13:00 ~ 17:00", "2. 장소: ㅎㄴ구청 대강당", "3. 참여기업: 32개사", "4. 신청: 공공일자리 > 채용박람회에서 사전신청"] },
  {
    title: "취업사기 피해 예방 안내",
    date: "2026.09.25",
    views: 2204,
    body: ["채용을 이유로 통장, 체크카드, 신분증 사본을 요구하는 경우 취업사기일 수 있습니다.", "피해가 의심되면 경찰청(112) 또는 고객센터(1588-0000)로 신고해 주시기 바랍니다."],
  },
  { title: "추석 연휴 고객센터 운영 안내", date: "2026.09.18", views: 634, body: ["추석 연휴(9. 24. ~ 9. 27.) 기간에는 고객센터 전화 상담을 운영하지 않습니다.", "1:1 문의는 연휴 이후 순서대로 답변드립니다."] },
  { title: "개인정보처리방침 개정 안내", date: "2026.09.01", views: 418, body: ["개인정보처리방침이 2026. 9. 8.부터 다음과 같이 개정됩니다.", "1. 개정내용: 개인정보 보유기간 항목 정비", "2. 시행일: 2026. 9. 8."] },
];

const FAQS: { cat: "구직" | "구인" | "회원"; q: string; a: string }[] = [
  { cat: "구직", q: "이력서는 몇 개까지 등록할 수 있나요?", a: "이력서는 최대 5개까지 등록할 수 있으며, 공고마다 다른 이력서로 지원할 수 있습니다." },
  { cat: "구직", q: "입사지원을 취소할 수 있나요?", a: "마감일 전까지 입사지원 내역에서 지원 취소가 가능합니다." },
  { cat: "구직", q: "관심공고는 어디에서 확인하나요?", a: "화면 위 관심공고 버튼을 누르면 저장한 공고만 모아 볼 수 있습니다." },
  { cat: "구인", q: "구인신청 후 언제 공고가 게시되나요?", a: "담당자 검토 후 근무일 기준 1일 이내에 게시됩니다." },
  { cat: "구인", q: "구인등록 비용이 있나요?", a: "구인등록과 채용공고 게시는 무료입니다." },
  { cat: "회원", q: "비밀번호를 잊어버렸어요.", a: "로그인 화면의 비밀번호 찾기에서 휴대폰 본인인증 후 다시 설정할 수 있습니다." },
];

function JobSubPage({ page, sub, today, onGo }: { page: MenuName; sub: string; today: Date | null; onGo: (p: MenuName, sub?: string) => void }) {
  const items = SUBMENU[page];
  let body: React.ReactNode = null;
  if (sub === "공공일자리 목록") body = <PublicJobs today={today} />;
  else if (sub === "채용박람회") body = <SimpleTable caption="채용박람회 일정" head={["행사명", "일시", "장소", "참여기업", "상태"]} rows={FAIRS} />;
  else if (sub === "취업지원 프로그램") body = <Programs />;
  else if (sub === "직업훈련") body = <SimpleTable caption="직업훈련 과정" head={["훈련과정", "훈련기간", "훈련시간", "훈련비", "상태"]} rows={TRAININGS} />;
  else if (sub === "구인등록 안내") body = <EmployerGuide onApply={() => onGo("기업서비스", "구인신청")} />;
  else if (sub === "구인신청") body = <EmployerForm />;
  else if (sub === "공지사항") body = <NoticeBoard key="notice" />;
  else if (sub === "자주 묻는 질문") body = <Faq />;
  else if (sub === "1:1 문의") body = <Inquiry />;

  return (
    <>
      <div className="border-b border-[#dde2ea] bg-[#f4f6fa]">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-8">
          <ol aria-label="현재 위치" className="flex flex-wrap items-center gap-1.5 text-[14px] text-[#56607a]">
            <li>
              <button type="button" onClick={() => onGo("채용정보")} className="hover:underline">
                홈
              </button>
            </li>
            <li aria-hidden>&gt;</li>
            <li>{page}</li>
            <li aria-hidden>&gt;</li>
            <li aria-current="page" className="font-bold text-[#1b2a4a]">
              {sub}
            </li>
          </ol>
          <h1 className={`${display.className} mt-2 text-[30px] leading-[1.3] md:text-[34px]`}>{sub}</h1>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 pb-14 pt-6 md:px-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8 lg:pt-8">
        <nav aria-label={`${page} 메뉴`} className="min-w-0 lg:self-start">
          <p className="hidden rounded-t-[10px] bg-[#1b2a4a] px-4 py-3 text-[18px] font-bold text-white lg:block">{page}</p>
          <ul className="flex gap-1.5 overflow-x-auto lg:block lg:overflow-visible lg:rounded-b-[10px] lg:border-2 lg:border-t-0 lg:border-[#1b2a4a]">
            {items.map((it) => {
              const on = it === sub;
              return (
                <li key={it} className="shrink-0 lg:border-b lg:border-[#dde2ea] lg:last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onGo(page, it)}
                    aria-current={on ? "page" : undefined}
                    className={`h-10 rounded-[6px] border-2 px-3 text-[15px] font-bold lg:h-12 lg:w-full lg:rounded-none lg:border-0 lg:px-4 lg:text-left lg:text-[16px] ${
                      on ? "border-[#1b2a4a] bg-[#1b2a4a] text-white lg:bg-[#fff4c7] lg:text-[#1b2a4a]" : "border-[#dde2ea] bg-white text-[#3c4660] hover:text-[#1b2a4a] lg:hover:bg-[#f4f6fa]"
                    }`}
                  >
                    {it}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0">{body}</div>
      </div>
    </>
  );
}

function SimpleTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-t-2 border-[#1b2a4a] text-left text-[15px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[#f4f6fa]">
          <tr className="border-b border-[#dde2ea]">
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2.5 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-[#dde2ea] align-top">
              {r.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="px-3 py-3 font-bold">
                    {c}
                  </th>
                ) : (
                  <td key={i} className="px-3 py-3 text-[#3c4660]">
                    {i === r.length - 1 ? <StatusText value={c} /> : c}
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

function StatusText({ value }: { value: string }) {
  const open = value === "접수중" || value === "사전신청";
  const closed = value === "마감" || value === "종료";
  return <span className={`font-bold ${open ? "text-[#2455d6]" : closed ? "text-[#6b7489]" : "text-[#1b2a4a]"}`}>{value}</span>;
}

function PublicJobs({ today }: { today: Date | null }) {
  const [kind, setKind] = useState<"전체" | PublicKind>("전체");
  const [openOnly, setOpenOnly] = useState(false);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const kinds = ["전체", "공공기관", "지자체", "공공근로"] as const;
  const rows = PUBLIC_ROWS.map((r, i) => ({ r, i })).filter(({ r }) => (kind === "전체" || r[2] === kind) && (!openOnly || r[6] >= 0));

  return (
    <div>
      <div role="tablist" aria-label="공공일자리 구분" className="flex border-b-2 border-[#1b2a4a]">
        {kinds.map((k) => {
          const n = PUBLIC_ROWS.filter((r) => k === "전체" || r[2] === k).length;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              onClick={() => {
                setKind(k);
                setOpenRow(null);
              }}
              className={`-mb-0.5 h-11 flex-1 rounded-t-[6px] px-2 text-[15px] font-bold md:flex-none md:px-5 md:text-[16px] ${kind === k ? "bg-[#1b2a4a] text-white" : "text-[#3c4660] hover:text-[#1b2a4a]"}`}
            >
              {k} <span className="font-normal tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[16px] text-[#3c4660]">
          검색건수 <b className="text-[#c8321f] tabular-nums">{rows.length}</b>건
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[15px] font-bold">
          <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="h-5 w-5 accent-[#1b2a4a]" />
          접수중만
        </label>
      </div>

      <ul key={`${kind}-${openOnly}`} className="soft-in mt-3 border-t-2 border-[#1b2a4a]">
        {rows.map(({ r, i }) => {
          const [org, title, k, type, count, startAgo, closeIn, period, hours, pay] = r;
          const closed = closeIn < 0;
          const open = openRow === i;
          const range = today ? `${isoDate(addDays(today, -startAgo))} ~ ${isoDate(addDays(today, closeIn))}` : "";
          return (
            <li key={title} className="border-b border-[#dde2ea]">
              <button
                type="button"
                onClick={() => setOpenRow(open ? null : i)}
                aria-expanded={open}
                className="grid w-full gap-x-4 gap-y-1 px-1 py-3 text-left md:grid-cols-[minmax(0,1fr)_200px_80px] md:items-center"
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold text-[#56607a]">
                    {org} <span className="font-normal">| {k}</span>
                  </span>
                  <span className="block text-[17px] font-bold leading-[1.45] hover:text-[#2455d6]">{title}</span>
                  <span className="block text-[15px] text-[#3c4660]">
                    {type} | {count}명 | {pay}
                  </span>
                </span>
                <span className="text-[14px] text-[#3c4660] tabular-nums">{range}</span>
                <span className="flex items-center gap-2 md:justify-end">
                  <StatusText value={closed ? "마감" : "접수중"} />
                  <ChevronDown size={18} aria-hidden className={open ? "rotate-180" : ""} />
                </span>
              </button>
              {open && (
                <dl className="mb-3 grid gap-px overflow-hidden rounded-[10px] border-2 border-[#1b2a4a] bg-[#dde2ea] text-[15px] sm:grid-cols-2">
                  {[
                    ["모집인원", `${count}명`],
                    ["고용형태", type],
                    ["근무기간", period],
                    ["근무시간", hours],
                    ["임금", pay],
                    ["접수기간", range],
                    ["접수방법", k === "공공근로" ? "주소지 동주민센터 방문 접수" : "기관 누리집 온라인 접수"],
                    ["문의", `${org} 02-000-0000`],
                  ].map(([dk, dv]) => (
                    <div key={dk} className="bg-white px-3 py-2.5">
                      <dt className="font-bold">{dk}</dt>
                      <dd className="text-[#3c4660]">{dv}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Programs() {
  const [applied, setApplied] = useState<string[]>([]);
  return (
    <div>
      <ul className="border-t-2 border-[#1b2a4a]">
        {PROGRAMS.map((p) => {
          const done = applied.includes(p.name);
          return (
            <li key={p.name} className="grid gap-x-4 gap-y-2 border-b border-[#dde2ea] py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <h2 className="text-[18px] font-bold">{p.name}</h2>
                <dl className="mt-1 grid gap-x-4 text-[15px] text-[#3c4660] md:grid-cols-3">
                  {[
                    ["대상", p.target],
                    ["일정", p.when],
                    ["장소", p.where],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-1.5">
                      <dt className="shrink-0 font-bold text-[#1b2a4a]">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {done ? (
                <p className="inline-flex h-11 items-center gap-1.5 justify-self-start text-[15px] font-bold text-[#1f7a3e] sm:justify-self-end">
                  <CheckCircle2 size={18} aria-hidden />
                  신청완료
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setApplied((a) => [...a, p.name])}
                  className="h-11 justify-self-start rounded-[6px] bg-[#2455d6] px-5 text-[15px] font-bold text-white hover:bg-[#1c45b3] sm:justify-self-end"
                >
                  신청하기
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[15px] text-[#3c4660]">문의 ㄴㄹ일자리센터 02-000-1500 (평일 09:00 ~ 18:00)</p>
    </div>
  );
}

function EmployerGuide({ onApply }: { onApply: () => void }) {
  const steps = ["기업회원 가입", "구인신청서 작성", "담당자 검토", "채용공고 게시", "알선·면접"];
  return (
    <div>
      <h2 className="border-b-2 border-[#1b2a4a] pb-1.5 text-[19px] font-bold">구인등록 절차</h2>
      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2 rounded-[6px] bg-[#f4f6fa] px-3 py-3 sm:flex-col sm:text-center">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b2a4a] text-[15px] font-bold text-white tabular-nums">{i + 1}</span>
            <span className="text-[15px] font-bold">{s}</span>
          </li>
        ))}
      </ol>
      <h2 className="mt-8 border-b-2 border-[#1b2a4a] pb-1.5 text-[19px] font-bold">이용 안내</h2>
      <dl className="text-[16px]">
        {[
          ["이용대상", "사업자등록증이 있는 사업장"],
          ["이용요금", "무료"],
          ["공고 게시", "담당자 검토 후 근무일 기준 1일 이내"],
          ["게시기간", "최대 30일 (연장 가능)"],
          ["문의", "기업지원팀 02-000-1520 (평일 09:00 ~ 18:00)"],
        ].map(([k, v]) => (
          <div key={k} className="grid border-b border-[#dde2ea] sm:grid-cols-[140px_minmax(0,1fr)]">
            <dt className="bg-[#f4f6fa] px-3 py-2.5 font-bold">{k}</dt>
            <dd className="px-3 py-2.5 text-[#3c4660]">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 rounded-[6px] bg-[#f4f6fa] px-3 py-2 text-[14px] leading-[1.6] text-[#3c4660]">
        『채용절차의 공정화에 관한 법률』에 따라 구직자에게 직무 수행과 관계없는 신체 조건, 출신 지역, 혼인 여부 등의 정보를 요구할 수 없습니다.
      </p>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onApply} className="h-12 rounded-[6px] bg-[#2455d6] px-6 text-[16px] font-bold text-white hover:bg-[#1c45b3]">
          구인신청
        </button>
      </div>
    </div>
  );
}

function EmployerForm() {
  const [done, setDone] = useState<Record<string, string> | null>(null);
  const [agree, setAgree] = useState(false);
  const inputCls = "mt-1.5 h-11 w-full rounded-[6px] border-2 border-[#dde2ea] bg-white px-3 text-[16px] focus:border-[#1b2a4a] focus:outline-none";

  if (done) {
    return (
      <div className="rounded-[10px] border-2 border-[#1b2a4a] p-6" role="status">
        <p className="inline-flex items-center gap-2 text-[19px] font-bold">
          <CheckCircle2 size={22} className="text-[#1f7a3e]" aria-hidden />
          구인신청이 접수되었습니다.
        </p>
        <dl className="mt-4 text-[16px]">
          {Object.entries(done).map(([k, v]) => (
            <div key={k} className="flex gap-3 border-b border-[#dde2ea] py-2">
              <dt className="w-24 shrink-0 font-bold">{k}</dt>
              <dd className="text-[#3c4660]">{v}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={() => setDone(null)} className="mt-5 h-11 rounded-[6px] border-2 border-[#1b2a4a] px-5 text-[15px] font-bold">
          새로 신청
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setDone({
          접수번호: "2026-10-001284",
          사업장명: String(f.get("company")),
          모집직종: String(f.get("category")),
          모집인원: `${f.get("count")}명`,
          근무지역: String(f.get("region")),
          처리상태: "담당자 검토 중",
        });
      }}
      className="grid gap-x-6 gap-y-4 sm:grid-cols-2"
    >
      <label className="block text-[15px] font-bold">
        사업장명
        <input name="company" required className={inputCls} />
      </label>
      <label className="block text-[15px] font-bold">
        사업자등록번호
        <input name="bizno" required inputMode="numeric" placeholder="000-00-00000" className={inputCls} />
      </label>
      <label className="block text-[15px] font-bold">
        담당자명
        <input name="manager" required className={inputCls} />
      </label>
      <label className="block text-[15px] font-bold">
        연락처
        <input name="phone" required type="tel" placeholder="000-0000-0000" className={inputCls} />
      </label>
      <label className="block text-[15px] font-bold">
        모집직종
        <select name="category" className={inputCls}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block text-[15px] font-bold">
        모집인원
        <input name="count" required type="number" min={1} defaultValue={1} className={inputCls} />
      </label>
      <label className="block text-[15px] font-bold">
        근무지역
        <select name="region" className={inputCls}>
          {REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="block text-[15px] font-bold">
        고용형태
        <select name="type" className={inputCls}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block text-[15px] font-bold sm:col-span-2">
        직무내용
        <textarea name="duty" rows={4} className="mt-1.5 w-full rounded-[6px] border-2 border-[#dde2ea] px-3 py-2 text-[16px] focus:border-[#1b2a4a] focus:outline-none" />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-[15px] font-bold sm:col-span-2">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-5 w-5 accent-[#1b2a4a]" />
        개인정보 수집·이용에 동의합니다. (필수)
      </label>
      <div className="flex justify-end sm:col-span-2">
        <button type="submit" disabled={!agree} className="h-12 rounded-[6px] bg-[#2455d6] px-8 text-[16px] font-bold text-white hover:bg-[#1c45b3] disabled:opacity-50">
          신청
        </button>
      </div>
    </form>
  );
}

function NoticeBoard() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (openIdx !== null) {
    const n = NOTICES[openIdx];
    return (
      <article>
        <div className="border-t-2 border-[#1b2a4a]">
          <h2 className="bg-[#f4f6fa] px-3 py-3 text-[19px] font-bold">{n.title}</h2>
          <p className="flex gap-5 border-y border-[#dde2ea] px-3 py-2 text-[15px] text-[#3c4660]">
            <span>
              <b className="text-[#1b2a4a]">등록일</b> {n.date}
            </span>
            <span>
              <b className="text-[#1b2a4a]">조회</b> {n.views.toLocaleString()}
            </span>
          </p>
        </div>
        <div className="min-h-[140px] space-y-2 px-3 py-6 text-[16px] leading-[1.7]">
          {n.body.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <div className="flex justify-end border-t border-[#dde2ea] pt-4">
          <button type="button" onClick={() => setOpenIdx(null)} className="h-11 rounded-[6px] bg-[#1b2a4a] px-6 text-[16px] font-bold text-white">
            목록
          </button>
        </div>
      </article>
    );
  }
  return (
    <div>
      <p className="text-[16px] text-[#3c4660]">
        전체 <b className="text-[#1b2a4a]">{NOTICES.length}</b>건
      </p>
      <table className="mt-2 w-full border-t-2 border-[#1b2a4a] text-[15px]">
        <caption className="sr-only">공지사항 목록</caption>
        <thead className="bg-[#f4f6fa]">
          <tr className="border-b border-[#dde2ea]">
            <th scope="col" className="hidden w-16 px-2 py-2.5 md:table-cell">
              번호
            </th>
            <th scope="col" className="px-2 py-2.5 text-left">
              제목
            </th>
            <th scope="col" className="w-28 px-2 py-2.5">
              등록일
            </th>
            <th scope="col" className="hidden w-20 px-2 py-2.5 md:table-cell">
              조회
            </th>
          </tr>
        </thead>
        <tbody>
          {NOTICES.map((n, i) => (
            <tr key={n.title} className="border-b border-[#dde2ea]">
              <td className="hidden px-2 py-3 text-center text-[#56607a] tabular-nums md:table-cell">{NOTICES.length - i}</td>
              <td className="px-2 py-3">
                <button type="button" onClick={() => setOpenIdx(i)} className="text-left font-bold underline-offset-4 hover:text-[#2455d6] hover:underline">
                  {n.title}
                </button>
              </td>
              <td className="px-2 py-3 text-center text-[14px] text-[#3c4660] tabular-nums">{n.date}</td>
              <td className="hidden px-2 py-3 text-center text-[14px] text-[#3c4660] tabular-nums md:table-cell">{n.views.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Faq() {
  const [cat, setCat] = useState<"전체" | "구직" | "구인" | "회원">("전체");
  const [open, setOpen] = useState<string | null>(null);
  const list = FAQS.filter((f) => cat === "전체" || f.cat === cat);
  return (
    <div>
      <div role="tablist" aria-label="질문 분류" className="flex flex-wrap gap-1.5">
        {(["전체", "구직", "구인", "회원"] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`h-10 rounded-[6px] border-2 px-4 text-[15px] font-bold ${cat === c ? "border-[#1b2a4a] bg-[#1b2a4a] text-white" : "border-[#dde2ea] hover:border-[#1b2a4a]"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <ul key={cat} className="soft-in mt-4 border-t-2 border-[#1b2a4a]">
        {list.map((f) => {
          const on = open === f.q;
          return (
            <li key={f.q} className="border-b border-[#dde2ea]">
              <button type="button" onClick={() => setOpen(on ? null : f.q)} aria-expanded={on} className="flex w-full items-center gap-3 px-2 py-3.5 text-left">
                <span className="w-6 shrink-0 text-[18px] font-bold text-[#2455d6]">Q</span>
                <span className="w-12 shrink-0 text-[14px] text-[#56607a]">[{f.cat}]</span>
                <span className="min-w-0 flex-1 text-[16px] font-bold">{f.q}</span>
                <ChevronDown size={18} aria-hidden className={`shrink-0 ${on ? "rotate-180" : ""}`} />
              </button>
              {on && (
                <p className="flex gap-3 bg-[#f4f6fa] px-2 py-3.5 text-[16px] leading-[1.7] text-[#3c4660]">
                  <span className="w-6 shrink-0 text-[18px] font-bold text-[#c8321f]">A</span>
                  <span>{f.a}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Inquiry() {
  const [items, setItems] = useState([{ type: "구직", title: "입사지원 내역이 보이지 않습니다", date: "2026.09.30", status: "답변완료" }]);
  const [type, setType] = useState("구직");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);
  const inputCls = "mt-1.5 w-full rounded-[6px] border-2 border-[#dde2ea] bg-white px-3 text-[16px] focus:border-[#1b2a4a] focus:outline-none";
  return (
    <div>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 rounded-[6px] bg-[#f4f6fa] px-4 py-3 text-[15px]">
        <div className="flex gap-1.5">
          <dt className="font-bold">고객센터</dt>
          <dd>1588-0000</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="font-bold">상담시간</dt>
          <dd>평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)</dd>
        </div>
      </dl>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !content.trim()) return;
          const d = new Date();
          const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
          setItems((list) => [{ type, title: title.trim(), date, status: "답변대기" }, ...list]);
          setTitle("");
          setContent("");
          setSent(true);
        }}
        className="mt-5 space-y-4"
      >
        <label className="block text-[15px] font-bold">
          문의유형
          <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputCls} h-11 sm:w-60`}>
            {["구직", "구인", "회원", "기타"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block text-[15px] font-bold">
          제목
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={`${inputCls} h-11`} />
        </label>
        <label className="block text-[15px] font-bold">
          내용
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5} className={`${inputCls} py-2`} />
        </label>
        <div className="flex items-center justify-end gap-3">
          {sent && (
            <p role="status" className="text-[15px] font-bold text-[#1f7a3e]">
              문의가 등록되었습니다.
            </p>
          )}
          <button type="submit" className="h-12 rounded-[6px] bg-[#2455d6] px-8 text-[16px] font-bold text-white hover:bg-[#1c45b3]">
            등록
          </button>
        </div>
      </form>

      <h2 className="mt-10 border-b-2 border-[#1b2a4a] pb-1.5 text-[19px] font-bold">나의 문의 내역</h2>
      <ul>
        {items.map((it, i) => (
          <li key={`${it.title}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#dde2ea] px-1 py-3 text-[15px]">
            <span className="text-[#56607a]">[{it.type}]</span>
            <span className="min-w-0 flex-1 font-bold">{it.title}</span>
            <span className="text-[14px] text-[#3c4660] tabular-nums">{it.date}</span>
            <span className={`font-bold ${it.status === "답변완료" ? "text-[#1f7a3e]" : "text-[#c8321f]"}`}>{it.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
