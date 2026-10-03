"use client";

import { Black_Han_Sans } from "next/font/google";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/* 채용 정보 포털 데모. 가상 서비스 "○○일자리".
   노란 검색 띠 + 남색 잉크 + 파란 링크의 공공 일자리 포털.
   공고 등록일과 마감일은 오늘 기준 상대값으로 두고, 화면이 뜬 뒤에만 계산한다. */

const display = Black_Han_Sans({ weight: "400", preload: false, display: "swap" });


const REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "세종"] as const;
const CATEGORIES = ["사무·행정", "IT·개발", "디자인", "영업·상담", "생산·기술", "보건·의료", "교육", "서비스"] as const;
const CAREERS = ["신입", "경력", "무관"] as const;
const TYPES = ["정규직", "계약직", "시간제"] as const;
const EDUS = ["학력 무관", "고졸 이상", "전문대졸 이상", "대졸 이상"] as const;
const SALARY_MIN = [
  { label: "전체", value: 0 },
  { label: "2,500만 원 이상", value: 2500 },
  { label: "3,000만 원 이상", value: 3000 },
  { label: "3,500만 원 이상", value: 3500 },
  { label: "4,000만 원 이상", value: 4000 },
  { label: "5,000만 원 이상", value: 5000 },
];
const SORTS = ["최신순", "마감 임박순", "급여 높은순"] as const;

type Region = (typeof REGIONS)[number];
type Category = (typeof CATEGORIES)[number];
type Career = (typeof CAREERS)[number];
type JobType = (typeof TYPES)[number];
type Edu = (typeof EDUS)[number];
type Sort = (typeof SORTS)[number];

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
  pay: { unit: "연봉" | "월급" | "시급"; amount: number };
  postedAgo: number;
  closeIn: number;
  headcount: number;
  tags: string[];
}

// [id, 회사, 제목, 지역, 구, 직종, 경력, 고용형태, 학력, 급여단위, 금액, 등록 N일 전, 마감 N일 후, 인원, 태그]
type Row = [string, string, string, Region, string, Category, Career, JobType, Edu, Job["pay"]["unit"], number, number, number, number, string];
const ROWS: Row[] = [
  ["j01", "○○물류(주)", "물류센터 입출고 관리 사무원", "경기", "이천시", "사무·행정", "무관", "정규직", "고졸 이상", "연봉", 3000, 0, 14, 2, "주 5일,4대보험,통근버스"],
  ["j02", "△△소프트", "웹 서비스 백엔드 개발자 (Java)", "서울", "구로구", "IT·개발", "경력", "정규직", "대졸 이상", "연봉", 5200, 1, 20, 1, "재택 병행,유연근무"],
  ["j03", "□□디자인랩", "브랜드·편집 디자이너", "서울", "마포구", "디자인", "경력", "정규직", "전문대졸 이상", "연봉", 3600, 2, 9, 1, "주 5일,포트폴리오 제출"],
  ["j04", "☆☆내과의원", "외래 접수·수납 담당", "부산", "해운대구", "보건·의료", "무관", "정규직", "고졸 이상", "월급", 250, 0, 3, 1, "주 5일,토요일 격주"],
  ["j05", "○○어린이집", "보육교사 (만 3세반)", "대전", "유성구", "교육", "무관", "정규직", "전문대졸 이상", "월급", 245, 3, 12, 2, "보육교사 자격,식사 제공"],
  ["j06", "△△정밀", "CNC 가공 기술자", "대구", "달서구", "생산·기술", "경력", "정규직", "학력 무관", "연봉", 4200, 4, 25, 3, "기숙사,야간수당"],
  ["j07", "□□마트", "매장 진열·계산 (오후 파트)", "인천", "연수구", "서비스", "무관", "시간제", "학력 무관", "시급", 11000, 0, 5, 4, "주 3일,근무시간 협의"],
  ["j08", "☆☆텔레콤", "고객센터 상담사", "광주", "서구", "영업·상담", "신입", "계약직", "고졸 이상", "월급", 260, 1, 2, 10, "교육 후 배치,정규직 전환"],
  ["j09", "○○세무회계", "세무 회계 사무원", "서울", "강남구", "사무·행정", "경력", "정규직", "전문대졸 이상", "연봉", 3400, 5, 18, 1, "전산회계 자격 우대"],
  ["j10", "△△에듀", "초등 방과후 코딩 강사", "세종", "보람동", "교육", "무관", "시간제", "대졸 이상", "시급", 25000, 2, 10, 2, "주 2일,수업 자료 제공"],
  ["j11", "□□식품(주)", "식품 생산라인 품질관리", "경기", "평택시", "생산·기술", "신입", "정규직", "전문대졸 이상", "연봉", 3200, 6, 22, 2, "주 5일,구내식당"],
  ["j12", "☆☆시스템즈", "사내 전산 운영·헬프데스크", "대전", "서구", "IT·개발", "신입", "정규직", "전문대졸 이상", "연봉", 3100, 1, 16, 1, "정보처리 자격 우대"],
  ["j13", "○○요양원", "요양보호사 (주간)", "경기", "고양시", "보건·의료", "무관", "정규직", "학력 무관", "월급", 240, 3, 4, 3, "요양보호사 자격"],
  ["j14", "△△인테리어", "3D 공간 디자이너", "부산", "수영구", "디자인", "경력", "정규직", "전문대졸 이상", "연봉", 3800, 7, 21, 1, "스케치업 가능자"],
  ["j15", "□□렌탈", "B2B 영업 담당", "서울", "영등포구", "영업·상담", "경력", "정규직", "대졸 이상", "연봉", 4500, 2, 13, 2, "인센티브,차량 지원"],
  ["j16", "☆☆카페", "바리스타 (주말)", "대구", "중구", "서비스", "무관", "시간제", "학력 무관", "시급", 10500, 0, 6, 2, "주말 근무,음료 제공"],
  ["j17", "○○진흥원", "사업 운영 계약직 연구원", "세종", "어진동", "사무·행정", "경력", "계약직", "대졸 이상", "연봉", 3900, 4, 7, 1, "1년 계약,연장 가능"],
  ["j18", "△△앱스", "모바일 앱 개발자 (Flutter)", "경기", "성남시", "IT·개발", "경력", "정규직", "대졸 이상", "연봉", 5600, 3, 28, 1, "스톡옵션,유연근무"],
  ["j19", "□□전자", "전자부품 조립 생산직", "광주", "광산구", "생산·기술", "신입", "계약직", "학력 무관", "월급", 280, 1, 1, 8, "주야 2교대,기숙사"],
  ["j20", "☆☆치과", "치과위생사", "인천", "남동구", "보건·의료", "경력", "정규직", "전문대졸 이상", "월급", 300, 5, 15, 1, "치과위생사 면허"],
  ["j21", "○○학원", "중등 수학 강사", "서울", "노원구", "교육", "경력", "정규직", "대졸 이상", "월급", 320, 2, 11, 1, "오후 근무,인센티브"],
  ["j22", "△△호텔", "프런트 데스크 직원", "부산", "중구", "서비스", "무관", "정규직", "고졸 이상", "연봉", 2900, 6, 19, 2, "외국어 가능자 우대,교대 근무"],
  ["j23", "□□보험", "보험 계약 심사 사무원", "대전", "중구", "사무·행정", "신입", "정규직", "대졸 이상", "연봉", 3500, 0, 24, 3, "주 5일,자격 취득 지원"],
  ["j24", "☆☆모빌리티", "차량 정비 기사", "경기", "화성시", "생산·기술", "경력", "정규직", "학력 무관", "연봉", 4000, 8, 17, 2, "정비 자격,공구 지원"],
  ["j25", "○○쇼핑", "상세페이지 웹디자이너", "인천", "부평구", "디자인", "신입", "계약직", "전문대졸 이상", "월급", 250, 1, 8, 1, "6개월 계약,정규직 전환"],
  ["j26", "△△데이터", "데이터 라벨링 작업자", "광주", "북구", "IT·개발", "무관", "시간제", "학력 무관", "시급", 12000, 2, 3, 15, "재택 가능,교육 제공"],
  ["j27", "□□상사", "무역 사무·수출입 서류", "서울", "중구", "사무·행정", "경력", "정규직", "대졸 이상", "연봉", 3700, 9, 26, 1, "무역 영어,국제무역사 우대"],
  ["j28", "☆☆한의원", "간호조무사", "대구", "수성구", "보건·의료", "무관", "정규직", "고졸 이상", "월급", 245, 4, 9, 1, "간호조무사 자격,점심 제공"],
  ["j29", "○○여행사", "여행 상품 상담원", "부산", "부산진구", "영업·상담", "신입", "정규직", "전문대졸 이상", "연봉", 2800, 3, 14, 2, "주 5일,여행 복지"],
  ["j30", "△△도서관", "도서 정리 보조 (오전)", "세종", "한솔동", "서비스", "무관", "시간제", "학력 무관", "시급", 10500, 1, 12, 2, "주 5일 오전,공휴일 휴무"],
];

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

type Filters = {
  q: string;
  regions: Region[];
  categories: Category[];
  careers: Career[];
  types: JobType[];
  edu: Edu | "전체";
  salaryMin: number;
};

const EMPTY_FILTERS: Filters = { q: "", regions: [], categories: [], careers: [], types: [], edu: "전체", salaryMin: 0 };

type Stored = { saved: string[]; applied: Record<string, string> };

/** 연봉 기준 만 원으로 환산 (월급 × 12, 시급 × 209시간 × 12) */
function annual(pay: Job["pay"]) {
  if (pay.unit === "연봉") return pay.amount;
  if (pay.unit === "월급") return pay.amount * 12;
  return Math.round((pay.amount * 209 * 12) / 10000);
}

function payLabel(pay: Job["pay"]) {
  if (pay.unit === "시급") return `시급 ${pay.amount.toLocaleString()}원`;
  return `${pay.unit} ${pay.amount.toLocaleString()}만 원`;
}

const EDU_RANK: Record<Edu, number> = { "학력 무관": 0, "고졸 이상": 1, "전문대졸 이상": 2, "대졸 이상": 3 };

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

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
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
  const [sort, setSort] = useState<Sort>("최신순");
  const [onlySaved, setOnlySaved] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const today = useToday();

  const results = useMemo(() => {
    const q = filters.q.trim();
    const list = JOBS.filter((j) => {
      if (onlySaved && !stored.saved.includes(j.id)) return false;
      if (q && !`${j.title} ${j.company}`.includes(q)) return false;
      if (filters.regions.length && !filters.regions.includes(j.region)) return false;
      if (filters.categories.length && !filters.categories.includes(j.category)) return false;
      if (filters.careers.length && !filters.careers.includes(j.career)) return false;
      if (filters.types.length && !filters.types.includes(j.type)) return false;
      if (filters.edu !== "전체" && EDU_RANK[j.edu] > EDU_RANK[filters.edu]) return false;
      if (filters.salaryMin && annual(j.pay) < filters.salaryMin) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "마감 임박순") return a.closeIn - b.closeIn;
      if (sort === "급여 높은순") return annual(b.pay) - annual(a.pay);
      return a.postedAgo - b.postedAgo;
    });
  }, [filters, sort, onlySaved, stored.saved]);

  const activeCount =
    filters.regions.length +
    filters.categories.length +
    filters.careers.length +
    filters.types.length +
    (filters.edu !== "전체" ? 1 : 0) +
    (filters.salaryMin ? 1 : 0);

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

  function apply(id: string) {
    const d = today ?? new Date(0);
    setStored((s) => ({ ...s, applied: { ...s.applied, [id]: fmt(d) } }));
    setConfirmId(null);
  }

  return (
    <div className="min-h-screen bg-white text-[#1b2a4a]">
      {/* 머리글 */}
      <header className="border-b-4 border-[#1b2a4a] bg-white">
        <div className="mx-auto flex h-16 max-w-[1248px] items-center gap-3 px-4 md:px-6">
          <span className={`${display.className} text-[26px] leading-none tracking-[-0.01em]`}>
            ○○<span className="rounded-[4px] bg-[#ffd23f] px-1">일자리</span>
          </span>
          <nav className="ml-auto hidden gap-5 text-[16px] font-bold sm:flex" aria-label="주 메뉴">
            <span className="border-b-2 border-[#1b2a4a] pb-0.5">채용정보</span>
            <span className="text-[#56607a]">기업정보</span>
            <span className="text-[#56607a]">취업지원</span>
          </nav>
          <button
            type="button"
            onClick={() => setOnlySaved((v) => !v)}
            aria-pressed={onlySaved}
            className={`ml-auto inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-[#1b2a4a] px-4 text-[15px] font-bold sm:ml-4 ${
              onlySaved ? "bg-[#1b2a4a] text-white" : "bg-white"
            }`}
          >
            <Bookmark size={16} aria-hidden />
            관심 공고 {stored.saved.length}
          </button>
        </div>
      </header>

      {/* 노란 검색 띠 */}
      <section className="bg-[#ffd23f]">
        <div className="mx-auto max-w-[1248px] px-4 pb-8 pt-8 md:px-6 md:pb-10 md:pt-12">
          <h1 className={`${display.className} text-[34px] leading-[1.2] md:text-[52px]`}>
            오늘 올라온 공고 <span className="tabular-nums">{newToday}</span>건
          </h1>
          <p className="mt-2 text-[17px] font-bold text-[#1b2a4a]/80">
            전체 {JOBS.length}건, 이번 주 마감 {JOBS.filter((j) => j.closeIn <= 7).length}건
          </p>
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex overflow-hidden rounded-[14px] border-[3px] border-[#1b2a4a] bg-white shadow-[6px_6px_0_#1b2a4a]"
          >
            <label htmlFor="job-q" className="sr-only">
              직무 또는 회사명
            </label>
            <Search size={22} className="ml-4 shrink-0 self-center text-[#56607a]" aria-hidden />
            <input
              id="job-q"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="직무, 회사명으로 검색"
              className="h-14 min-w-0 flex-1 bg-transparent px-3 text-[18px] outline-none placeholder:text-[#8a93a8] md:h-16"
            />
            <button type="submit" className="shrink-0 bg-[#1b2a4a] px-5 text-[17px] font-bold text-white md:px-8">
              검색
            </button>
          </form>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="직종 바로가기">
            {CATEGORIES.map((c) => {
              const on = filters.categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilters((f) => ({ ...f, categories: toggle(f.categories, c) }))}
                  className={`h-10 shrink-0 rounded-full border-2 border-[#1b2a4a] px-4 text-[15px] font-bold transition-colors ${
                    on ? "bg-[#1b2a4a] text-white" : "bg-[#ffe68a] hover:bg-white"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1248px] gap-8 px-4 py-8 md:px-6 lg:grid-cols-[280px_1fr]">
        {/* 데스크톱 상세 조건 */}
        <aside className="hidden lg:block" aria-label="상세 조건">
          <div className="sticky top-4 rounded-[14px] border-2 border-[#1b2a4a] p-5">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        </aside>

        <section aria-label="채용공고 목록" className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b-2 border-[#1b2a4a] pb-3">
            <p className="text-[17px]">
              {onlySaved ? "관심 공고 " : "검색 결과 "}
              <b className="tabular-nums">{results.length}</b>건
            </p>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-[#1b2a4a] px-4 text-[15px] font-bold lg:hidden"
            >
              <SlidersHorizontal size={16} aria-hidden />
              상세 조건{activeCount ? ` ${activeCount}` : ""}
            </button>
            <label className="ml-auto flex items-center gap-2 text-[15px]">
              <span className="sr-only">정렬</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-10 rounded-[8px] border-2 border-[#dde2ea] bg-white px-2 text-[15px] font-bold"
              >
                {SORTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="mt-8 rounded-[14px] bg-[#f4f6fa] px-6 py-14 text-center">
              <p className="text-[19px] font-bold">조건에 맞는 공고가 없습니다.</p>
              <button
                type="button"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setOnlySaved(false);
                }}
                className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-full bg-[#1b2a4a] px-5 text-[15px] font-bold text-white"
              >
                <RotateCcw size={16} aria-hidden />
                조건 초기화
              </button>
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-[#dde2ea]">
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
            </ul>
          )}
        </section>
      </div>

      <footer className="mt-10 border-t border-[#dde2ea] bg-[#f4f6fa]">
        <div className="mx-auto max-w-[1248px] px-4 py-8 pb-24 text-[15px] leading-[1.7] text-[#56607a] md:px-6">
          <p className="font-bold text-[#1b2a4a]">○○일자리</p>
          <p>채용 문의 1588-0000 (평일 09:00~18:00)</p>
        </div>
      </footer>

      {/* 모바일 상세 조건 시트 */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="상세 조건">
          <button type="button" aria-label="닫기" className="absolute inset-0 bg-[#1b2a4a]/50" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[20px] bg-white motion-safe:animate-[jobsheet_220ms_ease-out]">
            <div className="flex items-center justify-between border-b border-[#dde2ea] px-5 py-4">
              <p className="text-[19px] font-bold">상세 조건</p>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="닫기" className="p-1">
                <X size={22} aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </div>
            <div className="border-t border-[#dde2ea] p-4">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-13 w-full rounded-full bg-[#1b2a4a] py-3.5 text-[17px] font-bold text-white"
              >
                결과 {results.length}건 보기
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
          <div className="relative w-full max-w-[400px] rounded-[16px] border-[3px] border-[#1b2a4a] bg-white p-6 shadow-[6px_6px_0_#1b2a4a]">
            <p id="apply-title" className="text-[19px] font-bold leading-[1.5]">
              이 공고에 지원하시겠습니까?
            </p>
            <p className="mt-2 text-[16px] leading-[1.6] text-[#56607a]">
              {confirmJob.company}
              <br />
              {confirmJob.title}
            </p>
            <p className="mt-3 text-[15px] text-[#56607a]">등록한 이력서로 지원됩니다.</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="h-12 rounded-full border-2 border-[#1b2a4a] text-[16px] font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => apply(confirmJob.id)}
                className="h-12 rounded-full bg-[#2455d6] text-[16px] font-bold text-white hover:bg-[#1c45b3]"
              >
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
  if (!today) return <span className="inline-block h-6 w-12" aria-hidden />;
  const n = job.closeIn;
  const urgent = n <= 3;
  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-[6px] px-2 text-[15px] font-bold tabular-nums ${
        urgent ? "bg-[#fde8e4] text-[#c8321f]" : "bg-[#eef2ff] text-[#2455d6]"
      }`}
    >
      {n === 0 ? "오늘 마감" : `D-${n}`}
      {urgent && n > 0 && <span className="font-bold">마감 임박</span>}
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
    <li className="group relative flex gap-3 py-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-bold text-[#56607a]">{job.company}</p>
          {job.postedAgo === 0 && (
            <span className="rounded-[4px] bg-[#ffd23f] px-1.5 text-[14px] font-bold leading-[1.6]">오늘 등록</span>
          )}
          {applied && (
            <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1f7a3e]">
              <CheckCircle2 size={14} aria-hidden />
              지원 완료
            </span>
          )}
        </div>
        <h2 className="mt-1 text-[19px] font-bold leading-[1.45]">
          <button
            type="button"
            onClick={onOpen}
            className="text-left underline-offset-4 after:absolute after:inset-0 group-hover:underline"
          >
            {job.title}
          </button>
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-[#56607a]">
          <li className="inline-flex items-center gap-1">
            <MapPin size={15} aria-hidden />
            {job.region} {job.district}
          </li>
          <li className="inline-flex items-center gap-1">
            <Briefcase size={15} aria-hidden />
            {job.career}, {job.type}
          </li>
          <li className="inline-flex items-center gap-1">
            <Wallet size={15} aria-hidden />
            <b className="text-[#1b2a4a]">{payLabel(job.pay)}</b>
          </li>
        </ul>
      </div>
      <div className="relative z-10 flex shrink-0 flex-col items-end justify-between gap-3">
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          aria-label={saved ? "관심 공고에서 빼기" : "관심 공고에 담기"}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
            saved ? "border-[#1b2a4a] bg-[#ffd23f]" : "border-[#dde2ea] hover:border-[#1b2a4a]"
          }`}
        >
          {saved ? <BookmarkCheck size={18} aria-hidden /> : <Bookmark size={18} aria-hidden />}
        </button>
        <DDay job={job} today={today} />
      </div>
    </li>
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
  const posted = today ? fmt(addDays(today, -job.postedAgo)) : "";
  const deadline = today ? fmt(addDays(today, job.closeIn)) : "";
  const hours =
    job.type === "시간제" ? "주 15~25시간, 요일·시간 협의" : job.category === "생산·기술" ? "주 5일, 08:30~17:30 (교대 근무 있음)" : "주 5일, 09:00~18:00";

  return (
    <article className="absolute inset-0 flex flex-col bg-white md:inset-y-0 md:left-auto md:right-0 md:w-[560px] md:border-l-4 md:border-[#1b2a4a] motion-safe:md:animate-[jobdrawer_220ms_ease-out]">
      <div className="flex items-center gap-2 border-b border-[#dde2ea] px-5 py-3">
        <DDay job={job} today={today} />
        <button type="button" onClick={onClose} aria-label="닫기" className="ml-auto p-1">
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
            <span key={t} className="rounded-full bg-[#f4f6fa] px-3 py-1 text-[14px] font-bold text-[#3c4660]">
              {t}
            </span>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border-2 border-[#1b2a4a] bg-[#1b2a4a] text-[15px]">
          {[
            { k: "급여", v: payLabel(job.pay), icon: Wallet },
            { k: "근무지", v: `${job.region} ${job.district}`, icon: MapPin },
            { k: "경력", v: `${job.career}, ${job.type}`, icon: Briefcase },
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

        <Section title="모집 요강">
          <p>
            모집 인원 {job.headcount}명, 직종 {job.category}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {DUTIES[job.category].map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Section>
        <Section title="근무 조건">
          <ul className="space-y-1">
            <li>근무 시간: {hours}</li>
            <li>고용 형태: {job.type}</li>
            <li>복리후생: 4대보험, 퇴직금, {job.tags[0]}</li>
          </ul>
        </Section>
        <Section title="전형 절차">
          <ol className="flex flex-wrap items-center gap-2">
            {(job.career === "경력" ? ["서류 전형", "실무 면접", "임원 면접", "최종 합격"] : ["서류 전형", "면접", "최종 합격"]).map(
              (s, i) => (
                <li key={s} className="inline-flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1b2a4a] text-[14px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-bold">{s}</span>
                </li>
              ),
            )}
          </ol>
        </Section>
        <Section title="제출 서류">
          <ul className="list-disc space-y-1 pl-5">
            <li>이력서, 자기소개서</li>
            {job.career === "경력" && <li>경력증명서</li>}
            {job.category === "디자인" && <li>포트폴리오</li>}
            {job.tags.some((t) => t.includes("자격") || t.includes("면허")) && <li>자격증 사본</li>}
          </ul>
        </Section>
        <Section title="지원 방법">
          <ul className="space-y-1">
            <li>접수 기간: {posted} ~ {deadline}</li>
            <li>접수 방법: ○○일자리 온라인 지원</li>
            <li>문의: 인사 담당자 02-000-0000</li>
          </ul>
        </Section>
      </div>
      <div className="flex gap-2 border-t-2 border-[#1b2a4a] bg-white p-4">
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          className={`inline-flex h-13 shrink-0 items-center gap-1.5 rounded-full border-2 border-[#1b2a4a] px-5 py-3 text-[16px] font-bold ${
            saved ? "bg-[#ffd23f]" : "bg-white"
          }`}
        >
          {saved ? <BookmarkCheck size={18} aria-hidden /> : <Bookmark size={18} aria-hidden />}
          관심
        </button>
        {appliedOn ? (
          <p className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#e7f5ec] text-[16px] font-bold text-[#1f7a3e]">
            <CheckCircle2 size={18} aria-hidden />
            {appliedOn} 지원 완료
          </p>
        ) : (
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-full bg-[#2455d6] py-3 text-[17px] font-bold text-white hover:bg-[#1c45b3]"
          >
            지원하기
          </button>
        )}
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="flex items-center gap-2 text-[17px] font-bold">
        <span className="h-4 w-1.5 rounded-full bg-[#ffd23f] ring-1 ring-[#1b2a4a]" aria-hidden />
        {title}
      </h3>
      <div className="mt-2 text-[16px] leading-[1.7] text-[#3c4660]">{children}</div>
    </section>
  );
}

function FilterPanel({ filters, setFilters }: { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>> }) {
  return (
    <div className="space-y-6">
      <ChipGroup
        label="지역"
        options={REGIONS}
        value={filters.regions}
        onToggle={(v) => setFilters((f) => ({ ...f, regions: toggle(f.regions, v) }))}
      />
      <ChipGroup
        label="직종"
        options={CATEGORIES}
        value={filters.categories}
        onToggle={(v) => setFilters((f) => ({ ...f, categories: toggle(f.categories, v) }))}
      />
      <ChipGroup
        label="경력"
        options={CAREERS}
        value={filters.careers}
        onToggle={(v) => setFilters((f) => ({ ...f, careers: toggle(f.careers, v) }))}
      />
      <ChipGroup
        label="고용 형태"
        options={TYPES}
        value={filters.types}
        onToggle={(v) => setFilters((f) => ({ ...f, types: toggle(f.types, v) }))}
      />
      <label className="block">
        <span className="text-[15px] font-bold">최종 학력</span>
        <select
          value={filters.edu}
          onChange={(e) => setFilters((f) => ({ ...f, edu: e.target.value as Filters["edu"] }))}
          className="mt-2 h-11 w-full rounded-[8px] border-2 border-[#dde2ea] bg-white px-2 text-[15px]"
        >
          <option value="전체">전체</option>
          {EDUS.filter((e) => e !== "학력 무관").map((e) => (
            <option key={e} value={e}>
              {e.replace(" 이상", "")}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[15px] font-bold">희망 급여 (연봉 환산)</span>
        <select
          value={filters.salaryMin}
          onChange={(e) => setFilters((f) => ({ ...f, salaryMin: Number(e.target.value) }))}
          className="mt-2 h-11 w-full rounded-[8px] border-2 border-[#dde2ea] bg-white px-2 text-[15px]"
        >
          {SALARY_MIN.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => setFilters((f) => ({ ...EMPTY_FILTERS, q: f.q }))}
        className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#2455d6] underline underline-offset-4"
      >
        <RotateCcw size={15} aria-hidden />
        조건 초기화
      </button>
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  value: T[];
  onToggle: (v: T) => void;
}) {
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
              className={`h-9 rounded-full border-2 px-3 text-[15px] font-bold transition-colors ${
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

