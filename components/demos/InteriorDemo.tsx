"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bath,
  Bus,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Eye,
  Hammer,
  ImagePlus,
  Inbox,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  PaintRoller,
  Pencil,
  Phone,
  Pin,
  RotateCcw,
  Search,
  Trash2,
  TrainFront,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 인테리어 시공 업체 홈페이지 데모: 곰파트너 인테리어 샘플(아파트 리모델링).
   상호, 대표자, 주소, 전화번호, 사업자 정보, 시공 사례, 공지는 모두 가상이다.

   49만 원 표준 패키지("문의·예약 홈페이지") 범위로만 만든다.
   들어간 것: 10쪽 이내 하위 화면, 전화·지도·영업시간, 견적문의 폼(사진 첨부), 사장님이 관리자에서 올리는 시공사례·공지 게시판.
   뺀 것: 견적 자동 계산, 3D·평면도, 실시간 일정, 회원, 결제.

   메뉴 명칭과 문의 항목은 실제 지역 업체 홈페이지에서 가져왔다.
   드림인테리어(분당): 회사소개 / 포트폴리오(주거공간·상업공간) / 견적문의 / 오시는길, 문의 항목 주택구분·분양면적·예산·시공예정일·공사 종류 체크.
   솔디자인(김포): 업체소개 / 시공사례 / 견적문의 / 커뮤니티(공지사항) / 오시는길, 통화가능시간·건물유형·의뢰내용 체크, 바닥글 관리자 링크.
   장인들(대전): 시공 실적 / 시공가이드, 공사 현장 상태(빈집·거주중).

   하위 화면은 주소를 바꾸지 않고 컴포넌트 상태로 바꾼다.
   게시일과 공사 기간은 useDemoToday 기준 며칠 전으로 계산해 서버 렌더와 어긋나지 않는다.

   사진(public/images/demo-interior): hero, case1(거실), case2(주방), case3(욕실), before·after(같은 집 거실 전후). AI 생성 예정. */

const IMG = "/images/demo-interior";
const SHOP = "곰파트너";
const TEL = "02-000-0000";
const MOBILE = "010-0000-0000";
const OWNER = "박ㅈ훈";
const ADDRESS = "서울특별시 ㅅㅍ구 ㄱㄷ로 00, ㅎㅇ아파트 상가동 1층 102호";
const BIZ_NO = "000-00-00000";
const LICENSE = "실내건축공사업 제0000-000호";
const MAIL = "help@example.com";

const C = {
  ink: "#1c2320",
  forest: "#24433b",
  forestDeep: "#17302a",
  forestSoft: "#e6eeea",
  wood: "#8a5a2b",
  woodSoft: "#f3e9dc",
  paper: "#f7f4ef",
  white: "#ffffff",
  muted: "#59615c",
  line: "#e2ddd4",
  lineDark: "#c9c2b5",
  error: "#b42318",
  errorSoft: "#fdecea",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const HOURS: [string, string][] = [
  ["평일", "09:00~18:00"],
  ["토요일", "09:00~13:00"],
  ["일요일, 공휴일", "휴무"],
];

/* ---------- 메뉴 ---------- */

type Page = "home" | "about" | "cases" | "process" | "quote" | "notice" | "location" | "admin";

const MENUS: { page: Page; label: string }[] = [
  { page: "about", label: "회사소개" },
  { page: "cases", label: "시공사례" },
  { page: "process", label: "시공과정" },
  { page: "quote", label: "견적문의" },
  { page: "notice", label: "공지사항" },
  { page: "location", label: "오시는 길" },
];

/* ---------- 시공사례 ---------- */

type Size = "s" | "m" | "l";
type Work = "full" | "part" | "paper";

const SIZES: { id: Size | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "s", label: "20평대 이하" },
  { id: "m", label: "30평대" },
  { id: "l", label: "40평대 이상" },
];

const WORKS: { id: Work | "all"; label: string }[] = [
  { id: "all", label: "전체 공사" },
  { id: "full", label: "전체 리모델링" },
  { id: "part", label: "욕실, 주방" },
  { id: "paper", label: "도배, 바닥" },
];

const workLabel = (w: Work) => WORKS.find((v) => v.id === w)!.label;
const sizeOf = (p: number): Size => (p < 30 ? "s" : p < 40 ? "m" : "l");

type Case = {
  id: number;
  town: string;
  apt: string;
  pyeong: number;
  work: Work;
  title: string;
  img: string;
  pos?: string;
  before?: string;
  days: number;
  scope: string[];
  body: string;
  ago: number;
  views: number;
  fresh?: boolean;
};

const CASES: Case[] = [
  {
    id: 109,
    town: "ㅅㅍ구 ㄱㄷ동",
    apt: "ㅎㅇ아파트",
    pyeong: 32,
    work: "full",
    title: "32평 전체 리모델링",
    img: `${IMG}/after.jpg`,
    before: `${IMG}/before.jpg`,
    days: 31,
    scope: ["전체 철거", "샷시 교체", "거실 확장", "무몰딩 천장", "실크 도배", "강마루", "욕실 2곳", "주방 싱크대", "조명 교체"],
    body: "1999년 입주 후 처음 하는 공사였습니다. 거실 확장 부분 단열을 다시 넣고 샷시를 전부 바꿨습니다. 몰딩을 없애고 걸레받이를 얇은 것으로 바꿔 천장이 높아 보입니다.",
    ago: 3,
    views: 87,
  },
  {
    id: 108,
    town: "ㅅㅍ구 ㅂㅇ동",
    apt: "ㄷㅅ아파트",
    pyeong: 24,
    work: "part",
    title: "24평 욕실 리모델링",
    img: `${IMG}/case3.jpg`,
    days: 5,
    scope: ["욕실 철거", "방수 2회", "벽, 바닥 타일", "젠다이", "도기, 수전 교체", "천장재"],
    body: "욕조를 빼고 샤워 공간으로 바꿨습니다. 방수는 두 번 바르고 하루 담수 시험을 한 뒤 타일을 붙였습니다.",
    ago: 9,
    views: 64,
  },
  {
    id: 107,
    town: "ㄱㄴ구 ㅇㄱ동",
    apt: "ㅅㅇ아파트",
    pyeong: 43,
    work: "full",
    title: "43평 전체 리모델링",
    img: `${IMG}/case1.jpg`,
    days: 38,
    scope: ["전체 철거", "중문 설치", "아트월", "실크 도배", "원목마루", "욕실 2곳", "주방 아일랜드", "붙박이장"],
    body: "거실 벽 한 면을 수납장으로 짰습니다. 아이 방 두 개는 붙박이장 깊이를 줄여 책상 자리를 만들었습니다.",
    ago: 16,
    views: 132,
  },
  {
    id: 106,
    town: "ㅅㅍ구 ㄱㄷ동",
    apt: "ㅎㅇ아파트",
    pyeong: 25,
    work: "part",
    title: "25평 주방 교체",
    img: `${IMG}/case2.jpg`,
    days: 4,
    scope: ["싱크대 철거", "상판 세라믹", "주방 벽 타일", "후드 교체", "간접 조명"],
    body: "같은 단지 다른 동 공사입니다. 상부장을 천장까지 올려 수납을 늘렸고 후드는 매립형으로 바꿨습니다.",
    ago: 23,
    views: 58,
  },
  {
    id: 105,
    town: "ㅅㅍ구 ㅁㅈ동",
    apt: "ㅍㄹ빌라",
    pyeong: 18,
    work: "paper",
    title: "18평 도배, 장판",
    img: `${IMG}/case1.jpg`,
    pos: "20% 50%",
    days: 2,
    scope: ["합지 도배", "장판 2.2T", "걸레받이"],
    body: "세입자 들어오기 전 이틀 동안 했습니다. 벽지는 밝은 미색 합지, 장판은 두께 2.2mm로 깔았습니다.",
    ago: 31,
    views: 41,
  },
  {
    id: 104,
    town: "ㄱㄷ구 ㅅㅇ동",
    apt: "ㅎㄷ아파트",
    pyeong: 34,
    work: "full",
    title: "34평 전체 리모델링",
    img: `${IMG}/case2.jpg`,
    pos: "80% 50%",
    days: 33,
    scope: ["전체 철거", "샷시 교체", "주방 대면형", "실크 도배", "포세린 타일 바닥", "욕실 2곳", "조명 교체"],
    body: "벽을 돌려 주방을 거실 쪽으로 열었습니다. 바닥은 거실과 주방을 같은 타일로 이어 붙였습니다.",
    ago: 40,
    views: 119,
  },
  {
    id: 103,
    town: "ㅅㅍ구 ㅈㅅ동",
    apt: "ㄹㄷ아파트",
    pyeong: 33,
    work: "paper",
    title: "33평 도배, 강마루",
    img: `${IMG}/hero.jpg`,
    pos: "30% 60%",
    days: 4,
    scope: ["실크 도배", "강마루", "걸레받이"],
    body: "거주 중인 집이라 짐을 방 하나씩 옮기며 했습니다. 마루는 밝은 오크색입니다.",
    ago: 47,
    views: 73,
  },
  {
    id: 102,
    town: "ㅅㅍ구 ㄱㄷ동",
    apt: "ㅇㅅ아파트",
    pyeong: 46,
    work: "part",
    title: "46평 욕실 2곳",
    img: `${IMG}/case3.jpg`,
    pos: "70% 40%",
    days: 7,
    scope: ["욕실 2곳 철거", "방수 2회", "대형 타일", "샤워부스", "비데 일체형 도기"],
    body: "안방 욕실은 샤워부스, 공용 욕실은 욕조를 남겼습니다. 두 곳을 차례로 해서 한쪽은 계속 쓸 수 있었습니다.",
    ago: 55,
    views: 66,
  },
  {
    id: 101,
    town: "ㄱㄴ구 ㄷㅊ동",
    apt: "ㅁㅅ아파트",
    pyeong: 29,
    work: "full",
    title: "29평 전체 리모델링",
    img: `${IMG}/hero.jpg`,
    days: 27,
    scope: ["전체 철거", "발코니 확장", "실크 도배", "강마루", "욕실 1곳", "주방 싱크대", "중문"],
    body: "작은 방 발코니를 확장해 서재로 썼습니다. 현관에 슬림 중문을 달았습니다.",
    ago: 64,
    views: 97,
  },
];

/* ---------- 공지사항 ---------- */

type NoticeCat = "공지" | "이벤트";
type Notice = { id: number; cat: NoticeCat; title: string; body: string; ago: number; views: number; pinned?: boolean; fresh?: boolean };

const NOTICES: Notice[] = [
  {
    id: 12,
    cat: "공지",
    pinned: true,
    title: "공사 전 관리사무소 신고와 이웃 동의서",
    body: "아파트 공사는 착공 전에 관리사무소에 공사 신고를 해야 합니다. 단지마다 같은 라인 세대 동의서를 받는 곳도 있습니다. 신고서와 동의서는 저희가 준비해 함께 돌고, 엘리베이터 보양도 저희가 합니다.",
    ago: 30,
    views: 214,
  },
  {
    id: 15,
    cat: "공지",
    title: "욕실 방수 A/S 기간을 2년으로 늘렸습니다",
    body: "이번 달 계약부터 욕실 방수와 설비 배관은 준공일로부터 2년 동안 무상으로 고쳐 드립니다. 도배, 마루 같은 마감 공사는 지금처럼 1년입니다.",
    ago: 2,
    views: 38,
  },
  {
    id: 14,
    cat: "이벤트",
    title: "시공 후기를 남겨 주시면 입주청소를 할인해 드립니다",
    body: "공사를 마친 고객님이 블로그나 지역 카페에 후기를 올려 주시면 입주청소 비용을 10만 원 빼 드립니다. 링크를 문자로 보내 주세요.",
    ago: 8,
    views: 52,
  },
  {
    id: 13,
    cat: "공지",
    title: "토요일 상담 시간 안내",
    body: "토요일은 오전 9시부터 오후 1시까지 사무실 상담만 합니다. 현장 실측은 평일 저녁 7시까지 잡을 수 있습니다.",
    ago: 19,
    views: 47,
  },
  {
    id: 11,
    cat: "공지",
    title: "겨울철 샷시 공사 일정",
    body: "영하로 내려가는 날은 실리콘과 우레탄폼이 잘 굳지 않아 샷시 공사를 미룰 수 있습니다. 12월~2월 착공은 상담 때 날짜를 넉넉히 잡아 주세요.",
    ago: 44,
    views: 89,
  },
  {
    id: 10,
    cat: "공지",
    title: "견적서 항목 보는 법",
    body: "견적서는 철거, 설비, 목공, 전기, 타일, 도장, 도배, 바닥, 가구, 기타로 나눠 드립니다. 공정마다 자재비와 인건비를 따로 적습니다.",
    ago: 70,
    views: 156,
  },
];

/* ---------- 견적문의 선택지 ---------- */

const HOUSE_TYPES = ["아파트", "빌라", "단독주택", "상가, 기타"];
const PYEONGS = ["20평 미만", "20평대", "30평대", "40평대", "50평 이상"];
const LIVING = ["빈집", "거주 중"];
const WORK_ITEMS = ["전체 리모델링", "철거", "샷시, 발코니 확장", "목공(몰딩, 중문)", "도배", "바닥(마루, 장판, 타일)", "욕실", "주방(싱크대)", "전기, 조명", "붙박이장, 수납"];
const WHEN = ["1개월 안", "1~3개월 안", "3~6개월 안", "날짜 미정"];
const BUDGETS = ["1천만 원 미만", "1천~3천만 원", "3천~5천만 원", "5천~7천만 원", "7천만 원 이상", "상담 후 정하겠습니다"];
const CALL_TIMES = ["언제든", "오전", "오후", "저녁 6시 이후"];
const MAX_PHOTOS = 5;
const MAX_MB = 10;

type Inquiry = {
  no: string;
  name: string;
  phone: string;
  house: string;
  town: string;
  pyeong: string;
  living: string;
  works: string[];
  when: string;
  budget: string;
  photos: number;
  ago: number;
};

const SAMPLE_INQUIRIES: Inquiry[] = [
  { no: "Q-0412", name: "이ㅅ영", phone: "010-****-2381", house: "아파트", town: "ㅅㅍ구 ㄱㄷ동", pyeong: "30평대", living: "빈집", works: ["전체 리모델링"], when: "1~3개월 안", budget: "5천~7천만 원", photos: 3, ago: 1 },
  { no: "Q-0411", name: "정ㅁ수", phone: "010-****-0937", house: "아파트", town: "ㅅㅍ구 ㅂㅇ동", pyeong: "20평대", living: "거주 중", works: ["욕실"], when: "1개월 안", budget: "1천만 원 미만", photos: 2, ago: 2 },
];

/* ---------- 도움 함수 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const choOf = (ch: string) => {
  const code = ch.charCodeAt(0) - 0xac00;
  return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
};

/** 병원식 이름 가림: 김하늘 > 김ㅎ늘, 이준 > 이ㅈ */
function maskName(raw: string) {
  const n = raw.trim();
  if (n.length < 2) return n;
  if (n.length === 2) return n[0] + choOf(n[1]);
  return n[0] + [...n.slice(1, -1)].map(choOf).join("") + n[n.length - 1];
}

function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length < 9) return raw;
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
}

const fileSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(b / 1024))}KB`);

function blurActive() {
  const el = document.activeElement;
  if (el instanceof HTMLElement) el.blur();
}

type Go = (p: Page, opt?: { work?: Work | "all"; size?: Size | "all"; anchor?: string }) => void;

/* ---------- 데모 ---------- */

export function InteriorDemo() {
  const today = useDemoToday();
  const [page, setPage] = useState<Page>("home");
  const [nav, setNav] = useState<{ n: number; anchor?: string }>({ n: 0 });
  const [cases, setCases] = useState<Case[]>(CASES);
  const [notices, setNotices] = useState<Notice[]>(NOTICES);
  const [inquiries, setInquiries] = useState<Inquiry[]>(SAMPLE_INQUIRIES);
  const [sizeF, setSizeF] = useState<Size | "all">("all");
  const [workF, setWorkF] = useState<Work | "all">("all");
  const [openCase, setOpenCase] = useState<number | null>(null);

  const go: Go = useCallback((p, opt = {}) => {
    setPage(p);
    if (opt.work) setWorkF(opt.work);
    if (opt.size) setSizeF(opt.size);
    setNav((v) => ({ n: v.n + 1, anchor: opt.anchor }));
  }, []);

  // 사용법 가이드를 하위 화면에서 열면 첫 화면으로 돌아간다
  useEffect(() => {
    const f = () => {
      setOpenCase(null);
      setPage("home");
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  // 화면을 바꾸면 맨 위(또는 지정한 구간)로 옮기고 제목에 초점을 둔다
  useEffect(() => {
    if (nav.n === 0) return;
    const target = nav.anchor ? document.getElementById(nav.anchor) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
    document.getElementById("it-title")?.focus({ preventScroll: true });
  }, [nav]);

  const showCase = (id: number) => {
    setCases((list) => list.map((c) => (c.id === id ? { ...c, views: c.views + 1 } : c)));
    setOpenCase(id);
  };

  const ctx: Ctx = { today, go, cases, notices, showCase };
  const current = cases.find((c) => c.id === openCase) ?? null;
  const closeCase = useCallback(() => setOpenCase(null), []);

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
      <Header page={page} go={go} />
      <main>
        <div key={page} className="soft-in">
          {page === "home" && <Home ctx={ctx} />}
          {page === "about" && <AboutPage go={go} />}
          {page === "cases" && <CasesPage ctx={ctx} sizeF={sizeF} setSizeF={setSizeF} workF={workF} setWorkF={setWorkF} />}
          {page === "process" && <ProcessPage go={go} />}
          {page === "quote" && <QuotePage today={today} onSubmit={(q) => setInquiries((l) => [q, ...l])} count={inquiries.length} />}
          {page === "notice" && <NoticePage ctx={ctx} anchor={nav.anchor} />}
          {page === "location" && <LocationPage go={go} />}
          {page === "admin" && (
            <AdminPage
              go={go}
              inquiries={inquiries}
              onCase={(c) => {
                setCases((l) => [c, ...l]);
                setSizeF("all");
                setWorkF("all");
                go("cases");
              }}
              onNotice={(n) => {
                setNotices((l) => [n, ...l]);
                go("notice");
              }}
              nextCaseId={Math.max(...cases.map((c) => c.id)) + 1}
              nextNoticeId={Math.max(...notices.map((n) => n.id)) + 1}
            />
          )}
        </div>
      </main>
      <Footer go={go} />
      <CaseModal item={current} today={today} onClose={closeCase} />
    </div>
  );
}

type Ctx = {
  today: Date;
  go: Go;
  cases: Case[];
  notices: Notice[];
  showCase: (id: number) => void;
};

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="sr-only">{SHOP} 카탈로그</span>
      <span aria-hidden className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[19px] font-bold tracking-[-0.02em] md:text-[20px]">곰파트너</span>
        <span className="text-[12px] font-semibold" style={{ color: light ? "#c8d6d0" : C.wood }}>
          카탈로그
        </span>
      </span>
    </span>
  );
}

function Header({ page, go }: { page: Page; go: Go }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const goFrom = (p: Page) => {
    setOpen(false);
    blurActive();
    go(p);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white" style={{ borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-6">
        <button type="button" onClick={() => goFrom("home")} className="shrink-0 rounded-[4px]" aria-label={`${SHOP} 첫 화면`}>
          <Logo />
        </button>

        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center">
            {MENUS.map((m) => (
              <li key={m.page}>
                <button
                  type="button"
                  onClick={() => goFrom(m.page)}
                  aria-current={page === m.page ? "page" : undefined}
                  className="relative inline-flex h-[72px] items-center px-4 text-[17px] font-semibold"
                  style={{ color: page === m.page ? C.forest : C.ink }}
                >
                  {m.label}
                  {page === m.page && <span aria-hidden className="absolute inset-x-4 bottom-0 h-[3px]" style={{ background: C.forest }} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href={`tel:${TEL}`} className="hidden items-center gap-2 text-[18px] font-bold tabular-nums md:inline-flex" style={{ color: C.forest }}>
            <Phone size={18} aria-hidden />
            {TEL}
          </a>
          <a href={`tel:${TEL}`} aria-label={`전화 ${TEL}`} className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border md:hidden" style={{ borderColor: C.line, color: C.forest }}>
            <Phone size={20} aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="it-mobile-menu"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border lg:hidden"
            style={{ borderColor: C.line }}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="it-mobile-menu"
            aria-label="전체 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line, background: C.white }}
            initial={reduce ? { opacity: 0 } : { height: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px px-4 py-3 md:px-6">
              {MENUS.map((m) => (
                <li key={m.page}>
                  <button
                    type="button"
                    onClick={() => goFrom(m.page)}
                    aria-current={page === m.page ? "page" : undefined}
                    className="flex h-12 w-full items-center rounded-[4px] px-3 text-left text-[17px] font-semibold"
                    style={page === m.page ? { background: C.forestSoft, color: C.forest } : undefined}
                  >
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 공통 조각 ---------- */

function Photo({ src, alt, pos, sizes, priority }: { src: string; alt: string; pos?: string; sizes: string; priority?: boolean }) {
  if (src.startsWith("blob:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: pos }} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: pos, background: C.woodSoft }} />;
}

function PageHead({ title, desc, crumb }: { title: string; desc?: string; crumb: string }) {
  return (
    <div className="border-b px-4 pb-8 pt-10 md:px-6 md:pb-10 md:pt-14" style={{ background: C.paper, borderColor: C.line }}>
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[14px]" style={{ color: C.muted }}>
          홈 <span aria-hidden>&gt;</span> {crumb}
        </p>
        <h1 id="it-title" tabIndex={-1} className="mt-2 text-[30px] font-bold tracking-[-0.03em] outline-none md:text-[38px]">
          {title}
        </h1>
        {desc && <p className="mt-2 max-w-[640px]" style={{ color: C.muted }}>{desc}</p>}
      </div>
    </div>
  );
}

function H2({ id, children, more }: { id: string; children: React.ReactNode; more?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b-2 pb-3" style={{ borderColor: C.ink }}>
      <h2 id={id} className="text-[24px] font-bold tracking-[-0.02em] md:text-[28px]">
        {children}
      </h2>
      {more}
    </div>
  );
}

function MoreBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-10 shrink-0 items-center gap-1 text-[15px] font-semibold" style={{ color: C.forest }}>
      {label}
      <ChevronRight size={16} aria-hidden />
    </button>
  );
}

/* ---------- 첫 화면 ---------- */

function Home({ ctx }: { ctx: Ctx }) {
  const { go, cases, notices, today, showCase } = ctx;
  const latest = cases.slice(0, 4);
  const countOf = (w: Work) => cases.filter((c) => c.work === w).length;
  const noticeList = [...notices.filter((n) => n.pinned), ...notices.filter((n) => !n.pinned).sort((a, b) => a.ago - b.ago)].slice(0, 5);

  return (
    <>
      <section aria-labelledby="it-title" id="it-hero" className="lg:grid lg:min-h-[520px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:order-2 lg:aspect-auto">
          <Photo src={`${IMG}/hero.jpg`} alt="붙박이장을 짜 넣은 밝은 아파트 거실" sizes="(min-width:1024px) 58vw, 100vw" priority />
        </div>
        <div className="flex items-center px-4 py-10 md:px-10 lg:order-1 lg:py-14" style={{ background: C.paper }}>
          <div className="max-w-[460px] lg:ml-auto lg:mr-4">
            <p className="text-[15px] font-semibold" style={{ color: C.wood }}>
              ㅅㅍ구 아파트, 빌라 리모델링
            </p>
            <h1 id="it-title" tabIndex={-1} className="mt-3 text-[32px] font-bold leading-[1.3] tracking-[-0.03em] outline-none md:text-[42px]">
              도배 한 칸부터
              <br />
              전체 리모델링까지
            </h1>
            <p className="mt-4" style={{ color: C.muted }}>
              대표가 실측하고 견적서를 직접 씁니다. 방문 실측과 견적은 비용을 받지 않습니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <button
                id="it-quote-cta"
                type="button"
                onClick={() => go("quote")}
                className="inline-flex h-12 items-center rounded-[4px] px-6 text-[17px] font-bold"
                style={{ background: C.forest, color: C.white }}
              >
                견적문의
              </button>
              <button type="button" onClick={() => go("cases")} className="inline-flex h-12 items-center rounded-[4px] border px-6 text-[17px] font-bold" style={{ borderColor: C.lineDark, background: C.white }}>
                시공사례
              </button>
            </div>
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t pt-5 text-[15px]" style={{ borderColor: C.line }}>
              <dt style={{ color: C.muted }}>상담전화</dt>
              <dd>
                <a href={`tel:${TEL}`} className="font-bold tabular-nums" style={{ color: C.forest }}>
                  {TEL}
                </a>
              </dd>
              <dt style={{ color: C.muted }}>상담시간</dt>
              <dd className="tabular-nums">평일 09:00~18:00, 토 09:00~13:00</dd>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="it-latest-title" id="it-latest" className="scroll-mt-20 px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <H2 id="it-latest-title" more={<MoreBtn onClick={() => go("cases", { work: "all", size: "all" })} label="전체 보기" />}>
            최근 시공사례
          </H2>
          <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((c) => (
              <li key={c.id}>
                <CaseCard c={c} today={today} onOpen={() => showCase(c.id)} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="it-works-title" className="px-4 pb-14 md:px-6 md:pb-20">
        <div className="mx-auto max-w-[1200px]">
          <H2 id="it-works-title">공사 종류</H2>
          <ul className="divide-y border-y" style={{ borderColor: C.line }}>
            {(
              [
                { w: "full", icon: Hammer, name: "전체 리모델링", what: "철거, 샷시, 목공, 전기, 욕실, 주방, 도배, 바닥", term: "30평대 4~5주" },
                { w: "part", icon: Bath, name: "욕실, 주방", what: "욕실 방수, 타일, 도기, 싱크대, 상판, 주방 타일", term: "욕실 1곳 4~5일, 주방 3~4일" },
                { w: "paper", icon: PaintRoller, name: "도배, 바닥", what: "실크, 합지 도배, 강마루, 장판, 포세린 타일", term: "30평대 2~4일" },
              ] as const
            ).map(({ w, icon: Icon, name, what, term }) => (
              <li key={w} style={{ borderColor: C.line }}>
                <button
                  type="button"
                  onClick={() => go("cases", { work: w, size: "all" })}
                  className="grid w-full grid-cols-[44px_1fr_auto] items-center gap-x-4 gap-y-1 py-5 text-left md:grid-cols-[52px_200px_1fr_200px_auto] md:py-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] md:h-12 md:w-12" style={{ background: C.forestSoft, color: C.forest }}>
                    <Icon size={22} aria-hidden />
                  </span>
                  <span className="text-[19px] font-bold">{name}</span>
                  <span className="col-start-2 row-start-2 text-[15px] md:col-start-3 md:row-start-1 md:text-[16px]" style={{ color: C.muted }}>
                    {what}
                  </span>
                  <span className="col-start-2 row-start-3 text-[15px] font-semibold md:col-start-4 md:row-start-1" style={{ color: C.wood }}>
                    {term}
                  </span>
                  <span className="col-start-3 row-span-3 row-start-1 inline-flex items-center gap-1 text-[15px] font-semibold md:col-start-5 md:row-span-1" style={{ color: C.forest }}>
                    사례 {countOf(w)}건
                    <ChevronRight size={16} aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="공지사항과 상담 안내" id="it-notice" className="scroll-mt-20 px-4 py-14 md:px-6 md:py-20" style={{ background: C.paper }}>
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <H2 id="it-home-notice" more={<MoreBtn onClick={() => go("notice")} label="더보기" />}>
              공지사항
            </H2>
            <ul>
              {noticeList.map((n) => (
                <li key={n.id} className="border-b" style={{ borderColor: C.line }}>
                  <button type="button" onClick={() => go("notice", { anchor: `it-n-${n.id}` })} className="flex w-full items-center gap-3 py-3.5 text-left">
                    <CatTag n={n} />
                    <span className="min-w-0 flex-1 truncate font-medium">{n.title}</span>
                    <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                      {fmtDot(daysAgo(today, n.ago))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <ContactBox go={go} />
        </div>
      </section>
    </>
  );
}

function CatTag({ n }: { n: Notice }) {
  if (n.pinned)
    return (
      <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-[2px] px-1.5 text-[13px] font-bold" style={{ background: C.forest, color: C.white }}>
        <Pin size={12} aria-hidden />
        필독
      </span>
    );
  return (
    <span
      className="inline-flex h-6 shrink-0 items-center rounded-[2px] border px-1.5 text-[13px] font-bold"
      style={n.cat === "이벤트" ? { borderColor: C.wood, color: C.wood } : { borderColor: C.lineDark, color: C.muted }}
    >
      {n.cat}
    </span>
  );
}

function ContactBox({ go }: { go: Go }) {
  return (
    <aside aria-labelledby="it-contact" className="rounded-[6px] border bg-white p-6" style={{ borderColor: C.line }}>
      <h2 id="it-contact" className="text-[20px] font-bold">
        상담 안내
      </h2>
      <a href={`tel:${TEL}`} className="mt-3 block text-[30px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: C.forest }}>
        {TEL}
      </a>
      <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
        현장에 나가 있을 때는 {MOBILE}
      </p>
      <dl className="mt-5 border-t text-[15px]" style={{ borderColor: C.line }}>
        {HOURS.map(([d, h]) => (
          <div key={d} className="flex justify-between border-b py-2.5" style={{ borderColor: C.line }}>
            <dt>{d}</dt>
            <dd className="font-semibold tabular-nums">{h}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 flex gap-2 text-[15px]">
        <MapPin size={18} aria-hidden className="mt-1 shrink-0" style={{ color: C.wood }} />
        <span className="break-keep">ㅅㅍ구 ㄱㄷ로 00, ㅎㅇ아파트 상가동 1층</span>
      </p>
      <button type="button" onClick={() => go("location")} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[4px] border text-[15px] font-bold" style={{ borderColor: C.lineDark }}>
        오시는 길
      </button>
    </aside>
  );
}

/* ---------- 시공사례 ---------- */

function CaseCard({ c, today, onOpen }: { c: Case; today: Date; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group block w-full text-left" aria-haspopup="dialog">
      <span className="relative block aspect-[4/3] overflow-hidden rounded-[4px]" style={{ background: C.woodSoft }}>
        <span className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <Photo src={c.img} alt="" pos={c.pos} sizes="(min-width:1024px) 280px, (min-width:640px) 45vw, 100vw" />
        </span>
        {c.before && (
          <span className="absolute left-2 top-2 rounded-[2px] px-1.5 py-0.5 text-[13px] font-bold" style={{ background: C.white, color: C.forest }}>
            전후 사진
          </span>
        )}
      </span>
      <span className="mt-3 flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: C.wood }}>
        {workLabel(c.work)}
        {c.fresh && (
          <span className="rounded-[2px] px-1 text-[12px] font-bold" style={{ background: C.wood, color: C.white }}>
            새 글
          </span>
        )}
      </span>
      <span className="mt-0.5 block text-[17px] font-bold leading-[1.45] group-hover:underline">
        {c.apt} {c.title}
      </span>
      <span className="mt-0.5 block text-[15px]" style={{ color: C.muted }}>
        {c.town}
      </span>
      <span className="mt-2 flex items-center gap-3 text-[14px] tabular-nums" style={{ color: C.muted }}>
        <span>{fmtDot(daysAgo(today, c.ago))}</span>
        <span className="inline-flex items-center gap-1">
          <Eye size={14} aria-hidden />
          <span className="sr-only">조회</span>
          {c.views}
        </span>
      </span>
    </button>
  );
}

const PER_PAGE = 6;

function CasesPage({
  ctx,
  sizeF,
  setSizeF,
  workF,
  setWorkF,
}: {
  ctx: Ctx;
  sizeF: Size | "all";
  setSizeF: (v: Size | "all") => void;
  workF: Work | "all";
  setWorkF: (v: Work | "all") => void;
}) {
  const { cases, today, showCase } = ctx;
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [pg, setPg] = useState(1);

  const list = cases.filter(
    (c) => (sizeF === "all" || sizeOf(c.pyeong) === sizeF) && (workF === "all" || c.work === workF) && (!applied || `${c.town} ${c.apt} ${c.title}`.includes(applied)),
  );
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(pg, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  return (
    <>
      <PageHead crumb="시공사례" title="시공사례" desc="공사를 마친 집을 대표가 직접 찍어 올립니다." />
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6 md:py-14">
        <div id="it-case-filter" className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between" style={{ borderColor: C.line }}>
          <div className="min-w-0">
            <div role="group" aria-label="평형" className="-mx-1 flex flex-wrap">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sizeF === s.id}
                  onClick={() => {
                    setSizeF(s.id);
                    setPg(1);
                  }}
                  className="mx-1 mb-2 inline-flex h-10 items-center rounded-[4px] border px-3.5 text-[15px] font-semibold"
                  style={sizeF === s.id ? { background: C.ink, borderColor: C.ink, color: C.white } : { borderColor: C.line }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <label htmlFor="it-work" className="text-[15px] font-semibold">
                공사 종류
              </label>
              <select
                id="it-work"
                value={workF}
                onChange={(e) => {
                  setWorkF(e.target.value as Work | "all");
                  setPg(1);
                }}
                className="h-10 rounded-[4px] border bg-white px-2.5 text-[15px]"
                style={{ borderColor: C.lineDark }}
              >
                {WORKS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(q.trim());
              setPg(1);
            }}
            className="flex w-full md:w-[300px]"
          >
            <label htmlFor="it-case-q" className="sr-only">
              단지명, 동 이름 검색
            </label>
            <input
              id="it-case-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="단지명, 동 이름"
              className="h-11 min-w-0 flex-1 rounded-l-[4px] border border-r-0 bg-white px-3 outline-none focus:border-[#24433b]"
              style={{ borderColor: C.lineDark }}
            />
            <button type="submit" aria-label="검색" className="inline-flex h-11 w-12 items-center justify-center rounded-r-[4px]" style={{ background: C.ink, color: C.white }}>
              <Search size={18} aria-hidden />
            </button>
          </form>
        </div>

        <p className="mt-5 text-[15px]" style={{ color: C.muted }} aria-live="polite">
          {applied && <>&lsquo;{applied}&rsquo; 검색, </>}총 <b style={{ color: C.ink }}>{list.length}</b>건
        </p>

        {shown.length ? (
          <ul className="mt-5 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
              <li key={c.id}>
                <CaseCard c={c} today={today} onOpen={() => showCase(c.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-[4px] border py-14 text-center" style={{ borderColor: C.line }}>
            <p>조건에 맞는 사례가 없습니다.</p>
            <button
              type="button"
              onClick={() => {
                setSizeF("all");
                setWorkF("all");
                setQ("");
                setApplied("");
              }}
              className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-[4px] border px-4 text-[15px] font-semibold"
              style={{ borderColor: C.lineDark }}
            >
              <RotateCcw size={16} aria-hidden />
              조건 지우기
            </button>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="쪽 이동" className="mt-12 flex items-center justify-center gap-1">
            <button type="button" disabled={cur === 1} onClick={() => setPg(cur - 1)} aria-label="이전 쪽" className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] disabled:opacity-30">
              <ChevronLeft size={18} aria-hidden />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            // 휴대폰은 지금 쪽 앞뒤 다섯 개만

              <button
                key={n}
                type="button"
                onClick={() => setPg(n)}
                aria-current={cur === n ? "page" : undefined}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-[4px] px-2 text-[15px] font-semibold tabular-nums ${n >= Math.max(1, Math.min(cur - 2, pages - 4)) && n < Math.max(1, Math.min(cur - 2, pages - 4)) + 5 ? "" : "max-md:hidden"}`}
                style={cur === n ? { background: C.ink, color: C.white } : undefined}
              >
                {n}
              </button>
            ))}
            <button type="button" disabled={cur === pages} onClick={() => setPg(cur + 1)} aria-label="다음 쪽" className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] disabled:opacity-30">
              <ChevronRight size={18} aria-hidden />
            </button>
          </nav>
        )}
      </div>
    </>
  );
}

function CaseModal({ item, today, onClose }: { item: Case | null; today: Date; onClose: () => void }) {
  const reduce = useReducedMotionSafe();
  const boxRef = useRef<HTMLDivElement>(null);
  const backTo = useRef<HTMLElement | null>(null);
  const open = !!item;

  useEffect(() => {
    if (!open) return;
    backTo.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => boxRef.current?.querySelector<HTMLElement>("[data-close]")?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !boxRef.current) return;
      const els = [...boxRef.current.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])")];
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      backTo.current?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  const end = item ? daysAgo(today, item.ago + 6) : today;
  const start = item ? daysAgo(today, item.ago + 6 + item.days - 1) : today;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="case-modal"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div aria-hidden className="absolute inset-0" style={{ background: "rgba(16,22,20,0.6)" }} onClick={onClose} />
          <motion.div
            ref={boxRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="it-case-title"
            className="relative max-h-[92vh] w-full max-w-[880px] overflow-y-auto rounded-t-[10px] bg-white sm:rounded-[6px]"
            initial={reduce ? false : { y: 24 }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: 16 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-white px-5 py-4 md:px-7" style={{ borderColor: C.line }}>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: C.wood }}>
                  {workLabel(item.work)}, {item.town}
                </p>
                <h2 id="it-case-title" className="text-[20px] font-bold leading-[1.4] md:text-[24px]">
                  {item.apt} {item.title}
                </h2>
              </div>
              <button data-close type="button" onClick={onClose} aria-label="닫기" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border" style={{ borderColor: C.line }}>
                <X size={20} aria-hidden />
              </button>
            </div>

            <div className="px-5 pb-7 pt-5 md:px-7">
              {item.before ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["공사 전", item.before],
                      ["공사 후", item.img],
                    ] as const
                  ).map(([cap, src]) => (
                    <figure key={cap}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]" style={{ background: C.woodSoft }}>
                        <Photo src={src} alt={`${item.apt} 거실 ${cap}`} sizes="(min-width:640px) 420px, 100vw" />
                      </div>
                      <figcaption className="mt-1.5 text-[15px] font-bold" style={{ color: cap === "공사 후" ? C.forest : C.muted }}>
                        {cap}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="relative aspect-[16/10] overflow-hidden rounded-[4px]" style={{ background: C.woodSoft }}>
                  <Photo src={item.img} alt={`${item.apt} ${item.title} 완료 사진`} pos={item.pos} sizes="(min-width:880px) 820px, 100vw" />
                </div>
              )}

              <dl className="mt-6 grid border-t text-[15px] sm:grid-cols-2" style={{ borderColor: C.ink }}>
                {(
                  [
                    ["위치", `${item.town} ${item.apt}`],
                    ["평형", `${item.pyeong}평`],
                    ["공사 기간", `${fmtDot(start)} ~ ${fmtDot(end)} (${item.days}일)`],
                    ["등록일", fmtDot(daysAgo(today, item.ago))],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[84px_1fr] gap-2 border-b py-3" style={{ borderColor: C.line }}>
                    <dt style={{ color: C.muted }}>{k}</dt>
                    <dd className="min-w-0 font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-6 text-[17px] font-bold">공사 범위</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {item.scope.map((s) => (
                  <li key={s} className="rounded-[2px] px-2 py-1 text-[14px] font-semibold" style={{ background: C.forestSoft, color: C.forest }}>
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-5 break-keep">{item.body}</p>
              <p className="mt-4 flex items-center gap-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
                <Eye size={14} aria-hidden />
                조회 {item.views}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- 회사소개 ---------- */

function AboutPage({ go }: { go: Go }) {
  return (
    <>
      <PageHead crumb="회사소개" title="회사소개" />
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <h2 className="text-[24px] font-bold leading-[1.45] tracking-[-0.02em] md:text-[28px]">
            ㅅㅍ구에서 아파트 공사만 해 온 작은 회사입니다
          </h2>
          <div className="mt-5 space-y-4 break-keep">
            <p>목수로 일을 시작했고, 2014년부터 이 동네 아파트 공사를 맡아 왔습니다. 같은 단지를 여러 번 하다 보니 배관이 어디로 지나는지, 어느 벽을 헐 수 있는지 미리 압니다.</p>
            <p>현장은 한 번에 두 곳까지만 받습니다. 대표가 매일 현장에 들르고, 공정이 끝날 때마다 사진을 문자로 보내 드립니다.</p>
            <p>견적서는 공정별로 자재비와 인건비를 나눠 드립니다. 계약 뒤에 생기는 추가 비용은 공사 전에 먼저 말씀드리고 동의를 받은 뒤 진행합니다.</p>
          </div>
          <p className="mt-6 text-[15px]" style={{ color: C.muted }}>
            대표 {OWNER}
          </p>

          <h2 className="mt-14 text-[22px] font-bold">직접 하는 공정</h2>
          <table className="mt-4 w-full border-t-2 text-left text-[15px] md:text-[16px]" style={{ borderColor: C.ink }}>
            <caption className="sr-only">공정별 시공 방식</caption>
            <thead>
              <tr className="border-b" style={{ borderColor: C.line, background: C.paper }}>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  공정
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  시공
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["철거, 목공, 도장", "대표와 소속 목수팀"],
                  ["설비, 방수, 욕실 타일", "10년 넘게 함께한 전문팀"],
                  ["전기, 조명", "전기공사업 등록 업체"],
                  ["샷시", "제조사 대리점 시공"],
                  ["도배, 마루, 장판", "전문 도배, 바닥팀"],
                  ["싱크대, 붙박이장", "제작 공장 직접 발주"],
                ] as const
              ).map(([a, b]) => (
                <tr key={a} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="px-3 py-3 font-semibold">
                    {a}
                  </th>
                  <td className="px-3 py-3">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside aria-labelledby="it-co-info" className="lg:pt-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]" style={{ background: C.woodSoft }}>
            <Photo src={`${IMG}/case2.jpg`} alt="시공을 마친 주방" sizes="(min-width:1024px) 400px, 100vw" />
          </div>
          <h2 id="it-co-info" className="mt-6 text-[20px] font-bold">
            회사 정보
          </h2>
          <dl className="mt-3 border-t text-[15px]" style={{ borderColor: C.ink }}>
            {(
              [
                ["상호", SHOP],
                ["대표", OWNER],
                ["면허", LICENSE],
                ["보증", "하자보수보증 가입(전문건설공제조합)"],
                ["사업자등록번호", BIZ_NO],
                ["주소", ADDRESS],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[112px_1fr] gap-2 border-b py-2.5" style={{ borderColor: C.line }}>
                <dt style={{ color: C.muted }}>{k}</dt>
                <dd className="min-w-0 break-keep tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={() => go("quote")} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[4px] text-[17px] font-bold" style={{ background: C.forest, color: C.white }}>
            견적문의
          </button>
        </aside>
      </div>
    </>
  );
}

/* ---------- 시공과정, A/S ---------- */

const STEPS: { name: string; when: string; what: string }[] = [
  { name: "상담 문의", when: "전화, 견적문의", what: "평형과 원하는 공사를 여쭙고 실측 날짜를 잡습니다." },
  { name: "현장 실측", when: "문의 후 2~3일 안", what: "대표가 방문해 치수를 재고 배관, 전기, 샷시 상태를 봅니다." },
  { name: "견적, 계약", when: "실측 후 3일 안", what: "공정별 견적서를 드리고, 조정이 끝나면 계약서를 씁니다." },
  { name: "자재 선정", when: "착공 2주 전", what: "쇼룸에서 타일, 마루, 벽지, 도기 샘플을 같이 고릅니다." },
  { name: "공사 진행", when: "착공일부터", what: "관리사무소 신고와 보양을 하고, 공정마다 사진을 보내 드립니다." },
  { name: "준공, A/S", when: "공사 마지막 날", what: "같이 둘러보며 손볼 곳을 적고, A/S 보증서를 드립니다." },
];

const WEEKS = ["1주", "2주", "3주", "4주", "5주"];
const GANTT: { work: string; from: number; to: number }[] = [
  { work: "철거, 폐기물", from: 0, to: 0.4 },
  { work: "설비, 방수", from: 0.3, to: 1.2 },
  { work: "샷시", from: 0.6, to: 1.0 },
  { work: "목공, 전기", from: 1.0, to: 2.2 },
  { work: "욕실 타일", from: 1.6, to: 2.6 },
  { work: "도장, 필름", from: 2.2, to: 3.0 },
  { work: "도배", from: 3.0, to: 3.5 },
  { work: "바닥", from: 3.4, to: 3.9 },
  { work: "가구, 조명", from: 3.8, to: 4.4 },
  { work: "입주청소", from: 4.4, to: 4.6 },
];

function ProcessPage({ go }: { go: Go }) {
  return (
    <>
      <PageHead crumb="시공과정" title="시공과정" />
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6 md:py-14">
        <section aria-labelledby="it-steps">
          <H2 id="it-steps">상담부터 준공까지</H2>
          <ol className="grid gap-px overflow-hidden rounded-[4px] border sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
            {STEPS.map((s) => (
              <li key={s.name} className="bg-white p-5 md:p-6">
                <p className="text-[14px] font-semibold" style={{ color: C.wood }}>
                  {s.when}
                </p>
                <h3 className="mt-1 text-[19px] font-bold">{s.name}</h3>
                <p className="mt-2 break-keep text-[15px] md:text-[16px]" style={{ color: C.muted }}>
                  {s.what}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="it-gantt" className="mt-16">
          <H2 id="it-gantt">32평 전체 리모델링 공정표</H2>
          <p className="mb-5 text-[15px] md:text-[16px]" style={{ color: C.muted }}>
            빈집 기준입니다. 확장이나 욕실 개수에 따라 3~5일 달라집니다.
          </p>
          <div className="rounded-[4px] border" style={{ borderColor: C.line }}>
            <div className="grid grid-cols-[96px_1fr] border-b text-[13px] font-semibold md:grid-cols-[140px_1fr] md:text-[14px]" style={{ borderColor: C.line, background: C.paper }}>
              <span className="px-3 py-2">공정</span>
              <span className="grid grid-cols-5">
                {WEEKS.map((w) => (
                  <span key={w} className="border-l px-1.5 py-2" style={{ borderColor: C.line }}>
                    {w}
                  </span>
                ))}
              </span>
            </div>
            <ul>
              {GANTT.map((g) => (
                <li key={g.work} className="grid grid-cols-[96px_1fr] border-b last:border-b-0 md:grid-cols-[140px_1fr]" style={{ borderColor: C.line }}>
                  <span className="px-3 py-2.5 text-[14px] font-semibold md:text-[15px]">{g.work}</span>
                  <span className="relative" aria-label={`${(g.from * 7 + 1).toFixed(0)}일째부터 ${Math.round(g.to * 7)}일째까지`} role="img">
                    <span className="absolute inset-0 grid grid-cols-5" aria-hidden>
                      {WEEKS.map((w) => (
                        <span key={w} className="border-l" style={{ borderColor: C.line }} />
                      ))}
                    </span>
                    <span
                      aria-hidden
                      className="absolute top-1/2 h-3 -translate-y-1/2 rounded-[2px]"
                      style={{ left: `${(g.from / 5) * 100}%`, width: `${((g.to - g.from) / 5) * 100}%`, background: C.forest }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="it-as" id="it-as" className="mt-16 scroll-mt-20">
          <H2 id="it-as">A/S 안내</H2>
          <div className="grid gap-10 lg:grid-cols-2">
            <table className="w-full border-t-2 text-left text-[15px] md:text-[16px]" style={{ borderColor: C.ink }}>
              <caption className="sr-only">공사별 무상 A/S 기간</caption>
              <thead>
                <tr className="border-b" style={{ borderColor: C.line, background: C.paper }}>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    공사
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    무상 기간
                  </th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["욕실 방수, 설비 배관", "준공 후 2년"],
                    ["목공, 전기, 타일", "준공 후 1년"],
                    ["도배, 마루, 장판", "준공 후 1년"],
                    ["싱크대, 붙박이장", "제조사 보증 기간"],
                  ] as const
                ).map(([a, b]) => (
                  <tr key={a} className="border-b" style={{ borderColor: C.line }}>
                    <th scope="row" className="px-3 py-3 font-semibold">
                      {a}
                    </th>
                    <td className="px-3 py-3 tabular-nums">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="break-keep">
              <h3 className="text-[19px] font-bold">접수 방법</h3>
              <p className="mt-2">
                하자가 생긴 곳 사진을{" "}
                <a href={`sms:${MOBILE}`} className="font-bold tabular-nums underline" style={{ color: C.forest }}>
                  {MOBILE}
                </a>
                로 보내 주시거나{" "}
                <a href={`tel:${TEL}`} className="font-bold tabular-nums underline" style={{ color: C.forest }}>
                  {TEL}
                </a>
                로 전화 주세요. 사흘 안에 방문 날짜를 잡아 드립니다.
              </p>
              <p className="mt-3" style={{ color: C.muted }}>
                사용하다 생긴 파손, 고객님이 따로 맡긴 공사는 무상 A/S에서 빠집니다.
              </p>
              <button type="button" onClick={() => go("quote")} className="mt-6 inline-flex h-12 items-center rounded-[4px] px-6 text-[17px] font-bold" style={{ background: C.forest, color: C.white }}>
                견적문의
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ---------- 견적문의 ---------- */

type Form = {
  name: string;
  phone: string;
  callTime: string;
  house: string;
  town: string;
  pyeong: string;
  living: string;
  works: string[];
  when: string;
  moveIn: string;
  budget: string;
  memo: string;
  agree: boolean;
};

const EMPTY: Form = {
  name: "",
  phone: "",
  callTime: CALL_TIMES[0],
  house: HOUSE_TYPES[0],
  town: "",
  pyeong: "",
  living: LIVING[0],
  works: [],
  when: "",
  moveIn: "",
  budget: "",
  memo: "",
  agree: false,
};

type Field = "name" | "phone" | "town" | "pyeong" | "works" | "when" | "agree" | "photos";
type Pic = { id: number; url: string; name: string; size: number };

function Req() {
  return (
    <span className="ml-0.5" style={{ color: C.error }}>
      <span aria-hidden>*</span>
      <span className="sr-only">(필수)</span>
    </span>
  );
}

const FIELD_ORDER: Field[] = ["name", "phone", "town", "pyeong", "works", "when", "photos", "agree"];

function QuotePage({ today, onSubmit, count }: { today: Date; onSubmit: (q: Inquiry) => void; count: number }) {
  const reduce = useReducedMotionSafe();
  const [f, setF] = useState<Form>(EMPTY);
  const [pics, setPics] = useState<Pic[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [done, setDone] = useState<(Inquiry & { works: string[] }) | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const picId = useRef(0);
  const picsRef = useRef<Pic[]>([]);

  useEffect(() => {
    picsRef.current = pics;
  }, [pics]);
  useEffect(() => () => picsRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((o) => ({ ...o, [k]: v }));
    if (errors[k as Field]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const toggleWork = (w: string) => {
    const has = f.works.includes(w);
    set("works", has ? f.works.filter((v) => v !== w) : [...f.works, w]);
  };

  const addPics = (files: FileList | null) => {
    if (!files) return;
    const list = [...files];
    const room = MAX_PHOTOS - pics.length;
    const bad = list.find((x) => !x.type.startsWith("image/") || x.size > MAX_MB * 1024 * 1024);
    const ok = list.filter((x) => x.type.startsWith("image/") && x.size <= MAX_MB * 1024 * 1024).slice(0, Math.max(0, room));
    setPics((p) => [...p, ...ok.map((x) => ({ id: ++picId.current, url: URL.createObjectURL(x), name: x.name, size: x.size }))]);
    const msg = bad ? `사진 파일만, 한 장에 ${MAX_MB}MB까지 올릴 수 있습니다.` : list.length > room ? `사진은 ${MAX_PHOTOS}장까지 올릴 수 있습니다.` : undefined;
    setErrors((e) => ({ ...e, photos: msg }));
  };

  const removePic = (id: number) => {
    setPics((p) => {
      const t = p.find((x) => x.id === id);
      if (t) URL.revokeObjectURL(t.url);
      return p.filter((x) => x.id !== id);
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Partial<Record<Field, string>> = {};
    if (!f.name.trim()) er.name = "성명을 입력해 주세요.";
    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(f.phone.replace(/\s/g, ""))) er.phone = "연락처를 010-0000-0000 형식으로 입력해 주세요.";
    if (!f.town.trim()) er.town = "공사할 곳의 구와 동을 입력해 주세요.";
    if (!f.pyeong) er.pyeong = "평형을 골라 주세요.";
    if (!f.works.length) er.works = "공사 종류를 하나 이상 골라 주세요.";
    if (!f.when) er.when = "희망 시기를 골라 주세요.";
    if (!f.agree) er.agree = "개인정보 수집, 이용에 동의해 주세요.";
    setErrors(er);
    const first = FIELD_ORDER.find((k) => er[k]);
    if (first) {
      const id = first === "works" ? "q-works-0" : first === "photos" ? "q-photos" : `q-${first}`;
      window.setTimeout(() => document.getElementById(id)?.focus(), 0);
      return;
    }
    const d = today;
    const no = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(413 + count - SAMPLE_INQUIRIES.length).padStart(4, "0")}`;
    const q: Inquiry = {
      no,
      name: maskName(f.name),
      phone: maskPhone(f.phone),
      house: f.house,
      town: f.town.trim(),
      pyeong: f.pyeong,
      living: f.living,
      works: f.works,
      when: f.when,
      budget: f.budget || "적지 않음",
      photos: pics.length,
      ago: 0,
    };
    onSubmit(q);
    setDone(q);
    window.scrollTo(0, 0);
    window.setTimeout(() => document.getElementById("it-done")?.focus(), 0);
  };

  const reset = () => {
    pics.forEach((p) => URL.revokeObjectURL(p.url));
    setPics([]);
    setF(EMPTY);
    setErrors({});
    setDone(null);
  };

  const inputCls = "mt-1.5 h-12 w-full rounded-[4px] border bg-white px-3 outline-none focus:border-[#24433b] focus:ring-2 focus:ring-[#24433b]/20";
  const bc = (k: Field) => ({ borderColor: errors[k] ? C.error : C.lineDark });
  const aria = (k: Field, hint?: string) => {
    const ids = [errors[k] ? `q-${k}-err` : "", hint ?? ""].filter(Boolean).join(" ");
    return { "aria-invalid": !!errors[k], "aria-describedby": ids || undefined };
  };
  const err = (k: Field) =>
    errors[k] ? (
      <p id={`q-${k}-err`} className="mt-1.5 flex items-center gap-1 text-[14px] font-semibold" style={{ color: C.error }}>
        <CircleAlert size={15} aria-hidden />
        {errors[k]}
      </p>
    ) : null;
  const lab = "text-[16px] font-bold";
  const radioCls = "inline-flex h-11 cursor-pointer items-center rounded-[4px] border px-3.5 text-[15px] font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2";
  const radioStyle = (on: boolean) => (on ? { background: C.forestSoft, borderColor: C.forest, color: C.forest } : { borderColor: C.lineDark, background: C.white });

  return (
    <>
      <PageHead crumb="견적문의" title="견적문의" desc="남겨 주신 내용을 보고 대표가 직접 전화드립니다. 정확한 금액은 현장 실측 후 견적서로 드립니다." />
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div key="done" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
                <div id="it-done" tabIndex={-1} className="rounded-[6px] border outline-none" style={{ borderColor: C.line }}>
                  <div className="flex items-start gap-3 rounded-t-[6px] px-5 py-5 md:px-6" style={{ background: C.forest, color: C.white }}>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: C.white, color: C.forest }}>
                      <Check size={22} aria-hidden />
                    </span>
                    <div>
                      <h2 className="text-[21px] font-bold">견적문의가 접수되었습니다</h2>
                      <p className="text-[15px]" style={{ color: "#d3e0da" }}>
                        {done.name}님께 오늘 안에 전화드리겠습니다. 저녁 6시 이후 접수는 다음 날 오전에 연락드립니다.
                      </p>
                    </div>
                  </div>
                  <dl className="px-5 py-3 text-[15px] md:px-6">
                    {(
                      [
                        ["접수번호", done.no],
                        ["성명", done.name],
                        ["연락처", done.phone],
                        ["공사할 곳", `${done.town} (${done.house}, ${done.pyeong}, ${done.living})`],
                        ["공사 종류", done.works.join(", ")],
                        ["희망 시기", done.when],
                        ["예산", done.budget],
                        ["사진", done.photos ? `${done.photos}장` : "없음"],
                      ] as const
                    ).map(([k, v], i) => (
                      <div key={k} className="grid grid-cols-[88px_1fr] gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: C.line }}>
                        <dt style={{ color: C.muted }}>{k}</dt>
                        <dd className={`min-w-0 break-keep tabular-nums ${i === 0 ? "text-[18px] font-bold" : "font-semibold"}`} style={i === 0 ? { color: C.forest } : undefined}>
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <section aria-labelledby="it-alert-title" className="mt-8">
                  <h2 id="it-alert-title" className="text-[19px] font-bold">
                    업체가 받는 알림
                  </h2>
                  <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                    접수되면 사장님 휴대폰 문자와 메일로 같은 내용이 갑니다.
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[10px] border p-4" style={{ borderColor: C.line, background: "#eef0ee" }}>
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: C.muted }}>
                        <MessageSquareText size={15} aria-hidden />
                        문자
                      </p>
                      <p className="mt-2 whitespace-pre-line rounded-[10px] rounded-tl-[2px] bg-white px-3.5 py-3 text-[15px] leading-[1.6]">
                        {`[곰파트너] 새 견적문의
${done.name} ${done.phone}
${done.town} ${done.pyeong} ${done.living}
${done.works.join(", ")}
희망 ${done.when} / 예산 ${done.budget}
사진 ${done.photos}장, 통화 ${f.callTime}`}
                      </p>
                    </div>
                    <div className="rounded-[10px] border p-4" style={{ borderColor: C.line }}>
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: C.muted }}>
                        <Mail size={15} aria-hidden />
                        메일
                      </p>
                      <p className="mt-2 text-[15px] font-bold">[견적문의] {done.town} {done.pyeong} {done.works[0]}{done.works.length > 1 ? ` 외 ${done.works.length - 1}건` : ""}</p>
                      <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                        받는 사람 {MAIL}
                      </p>
                      <p className="mt-3 text-[15px]">첨부 사진과 전체 내용은 관리자 화면의 견적문의 접수 목록에서 볼 수 있습니다.</p>
                    </div>
                  </div>
                </section>

                <button type="button" onClick={reset} className="mt-8 inline-flex h-11 items-center gap-1.5 rounded-[4px] border px-4 text-[15px] font-bold" style={{ borderColor: C.lineDark }}>
                  <RotateCcw size={16} aria-hidden />새 문의 작성
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" id="it-quote-form" onSubmit={submit} noValidate exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.15 }}>
                {Object.values(errors).some(Boolean) && (
                  <p role="alert" className="mb-5 flex items-center gap-2 rounded-[4px] px-3 py-2.5 text-[15px] font-semibold" style={{ background: C.errorSoft, color: C.error }}>
                    <CircleAlert size={18} aria-hidden />
                    빨간색으로 표시한 칸을 확인해 주세요.
                  </p>
                )}

                <fieldset className="border-t-2 pt-6" style={{ borderColor: C.ink }}>
                  <legend className="float-left mb-5 w-full text-[20px] font-bold">고객 정보</legend>
                  <div className="clear-both grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="q-name" className={lab}>
                        성명
                        <Req />
                      </label>
                      <input id="q-name" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" className={inputCls} style={bc("name")} {...aria("name")} />
                      {err("name")}
                    </div>
                    <div>
                      <label htmlFor="q-phone" className={lab}>
                        연락처
                        <Req />
                      </label>
                      <input
                        id="q-phone"
                        value={f.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="010-0000-0000"
                        className={`${inputCls} tabular-nums`}
                        style={bc("phone")}
                        {...aria("phone")}
                      />
                      {err("phone")}
                    </div>
                    <div>
                      <label htmlFor="q-calltime" className={lab}>
                        통화 가능한 시간
                      </label>
                      <select id="q-calltime" value={f.callTime} onChange={(e) => set("callTime", e.target.value)} className={inputCls} style={{ borderColor: C.lineDark }}>
                        {CALL_TIMES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="mt-10 border-t-2 pt-6" style={{ borderColor: C.ink }}>
                  <legend className="float-left mb-5 w-full text-[20px] font-bold">공사할 곳</legend>
                  <div className="clear-both grid gap-5 sm:grid-cols-2">
                    <fieldset className="sm:col-span-2">
                      <legend className={lab}>주택 구분</legend>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {HOUSE_TYPES.map((h) => (
                          <label key={h} className={radioCls} style={radioStyle(f.house === h)}>
                            <input type="radio" name="q-house" value={h} checked={f.house === h} onChange={() => set("house", h)} className="sr-only" />
                            {h}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="sm:col-span-2">
                      <label htmlFor="q-town" className={lab}>
                        시공 주소
                        <Req />
                      </label>
                      <input id="q-town" value={f.town} onChange={(e) => set("town", e.target.value)} placeholder="예) ㅅㅍ구 ㄱㄷ동 ㅎㅇ아파트" className={inputCls} style={bc("town")} {...aria("town", "q-town-hint")} />
                      <p id="q-town-hint" className="mt-1 text-[14px]" style={{ color: C.muted }}>
                        동과 단지명까지만 적어 주세요. 호수는 통화 때 여쭙니다.
                      </p>
                      {err("town")}
                    </div>
                    <div>
                      <label htmlFor="q-pyeong" className={lab}>
                        평형(공급면적)
                        <Req />
                      </label>
                      <select id="q-pyeong" value={f.pyeong} onChange={(e) => set("pyeong", e.target.value)} className={inputCls} style={bc("pyeong")} {...aria("pyeong")}>
                        <option value="">선택</option>
                        {PYEONGS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                      {err("pyeong")}
                    </div>
                    <fieldset>
                      <legend className={lab}>현장 상태</legend>
                      <div className="mt-1.5 flex gap-2">
                        {LIVING.map((h) => (
                          <label key={h} className={`${radioCls} flex-1 justify-center`} style={radioStyle(f.living === h)}>
                            <input type="radio" name="q-living" value={h} checked={f.living === h} onChange={() => set("living", h)} className="sr-only" />
                            {h}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </fieldset>

                <fieldset className="mt-10 border-t-2 pt-6" style={{ borderColor: C.ink }}>
                  <legend className="float-left mb-5 w-full text-[20px] font-bold">공사 내용</legend>
                  <div className="clear-both grid gap-5 sm:grid-cols-2">
                    <fieldset className="sm:col-span-2" aria-describedby={errors.works ? "q-works-err" : undefined}>
                      <legend className={lab}>
                        공사 종류
                        <Req />
                        <span className="ml-1.5 text-[14px] font-normal" style={{ color: C.muted }}>
                          여러 개 고를 수 있습니다
                        </span>
                      </legend>
                      <div className="mt-2 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 md:grid-cols-3">
                        {WORK_ITEMS.map((w, i) => {
                          const on = f.works.includes(w);
                          return (
                            <label
                              key={w}
                              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[4px] border px-3 py-2 text-[15px] font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
                              style={on ? { background: C.forestSoft, borderColor: C.forest, color: C.forest } : { borderColor: errors.works ? C.error : C.lineDark }}
                            >
                              <input id={`q-works-${i}`} type="checkbox" checked={on} onChange={() => toggleWork(w)} className="h-5 w-5 shrink-0 accent-[#24433b]" />
                              {w}
                            </label>
                          );
                        })}
                      </div>
                      {err("works")}
                    </fieldset>
                    <div>
                      <label htmlFor="q-when" className={lab}>
                        희망 공사 시기
                        <Req />
                      </label>
                      <select id="q-when" value={f.when} onChange={(e) => set("when", e.target.value)} className={inputCls} style={bc("when")} {...aria("when")}>
                        <option value="">선택</option>
                        {WHEN.map((w) => (
                          <option key={w}>{w}</option>
                        ))}
                      </select>
                      {err("when")}
                    </div>
                    <div>
                      <label htmlFor="q-movein" className={lab}>
                        입주 예정일
                      </label>
                      <input id="q-movein" type="date" value={f.moveIn} onChange={(e) => set("moveIn", e.target.value)} className={`${inputCls} tabular-nums`} style={{ borderColor: C.lineDark }} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="q-budget" className={lab}>
                        예산 범위
                      </label>
                      <select id="q-budget" value={f.budget} onChange={(e) => set("budget", e.target.value)} className={inputCls} style={{ borderColor: C.lineDark }}>
                        <option value="">선택</option>
                        {BUDGETS.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="q-memo" className={lab}>
                        요청 사항
                      </label>
                      <textarea
                        id="q-memo"
                        value={f.memo}
                        onChange={(e) => set("memo", e.target.value)}
                        rows={5}
                        placeholder="가족 구성, 꼭 바꾸고 싶은 곳, 참고하신 사진이나 시공사례"
                        className="mt-1.5 w-full rounded-[4px] border bg-white px-3 py-2.5 outline-none focus:border-[#24433b] focus:ring-2 focus:ring-[#24433b]/20"
                        style={{ borderColor: C.lineDark }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span id="q-photos-label" className={lab}>
                        현장 사진
                      </span>
                      <div className="mt-1.5 rounded-[4px] border border-dashed p-3" style={{ borderColor: errors.photos ? C.error : C.lineDark, background: C.paper }}>
                        <div className="flex flex-wrap items-center gap-3">
                          <label
                            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[4px] px-4 text-[15px] font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
                            style={pics.length >= MAX_PHOTOS ? { background: C.line, color: C.muted, cursor: "not-allowed" } : { background: C.ink, color: C.white }}
                          >
                            <ImagePlus size={18} aria-hidden />
                            사진 추가
                            <input
                              id="q-photos"
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={pics.length >= MAX_PHOTOS}
                              className="sr-only"
                              aria-labelledby="q-photos-label"
                              aria-describedby={errors.photos ? "q-photos-err q-photos-hint" : "q-photos-hint"}
                              onChange={(e) => {
                                addPics(e.target.files);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          <span id="q-photos-hint" className="text-[14px]" style={{ color: C.muted }}>
                            거실, 주방, 욕실 사진이면 상담이 빨라집니다. {MAX_PHOTOS}장까지, 한 장 {MAX_MB}MB까지.
                          </span>
                        </div>
                        {pics.length > 0 && (
                          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {pics.map((p) => (
                              <li key={p.id} className="relative">
                                <div className="relative aspect-square overflow-hidden rounded-[4px]" style={{ background: C.line }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                                </div>
                                <p className="mt-0.5 truncate text-[12px] tabular-nums" style={{ color: C.muted }}>
                                  {fileSize(p.size)}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => removePic(p.id)}
                                  aria-label={`${p.name} 삭제`}
                                  className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-[4px]"
                                  style={{ background: "rgba(28,35,32,0.75)", color: C.white }}
                                >
                                  <Trash2 size={15} aria-hidden />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {err("photos")}
                    </div>
                  </div>
                </fieldset>

                <div className="mt-10 rounded-[4px] border p-4 md:p-5" style={{ borderColor: errors.agree ? C.error : C.line }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex cursor-pointer items-start gap-2.5 text-[16px] font-semibold">
                      <input id="q-agree" type="checkbox" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#24433b]" {...aria("agree")} />
                      <span>
                        개인정보 수집, 이용에 동의합니다.
                        <Req />
                      </span>
                    </label>
                    <button type="button" onClick={() => setShowTerms((v) => !v)} aria-expanded={showTerms} aria-controls="q-terms" className="inline-flex h-9 items-center text-[14px] font-semibold underline" style={{ color: C.muted }}>
                      {showTerms ? "내용 접기" : "내용 보기"}
                    </button>
                  </div>
                  {showTerms && (
                    <dl id="q-terms" className="mt-3 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 border-t pt-3 text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
                      <dt className="font-semibold">수집 항목</dt>
                      <dd>성명, 연락처, 시공 주소(동, 단지), 현장 사진</dd>
                      <dt className="font-semibold">이용 목적</dt>
                      <dd>견적 상담, 현장 실측 일정 안내</dd>
                      <dt className="font-semibold">보관 기간</dt>
                      <dd>상담 종료 후 1년. 계약하지 않으면 바로 지웁니다.</dd>
                      <dt className="font-semibold">동의 거부</dt>
                      <dd>동의하지 않으셔도 되지만, 이 경우 온라인 견적문의는 받을 수 없습니다. 전화 상담은 가능합니다.</dd>
                    </dl>
                  )}
                  {err("agree")}
                </div>

                <div className="mt-8 flex justify-center">
                  <button type="submit" className="inline-flex h-14 w-full items-center justify-center rounded-[4px] text-[18px] font-bold sm:w-[280px]" style={{ background: C.forest, color: C.white }}>
                    견적문의 접수
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <aside aria-labelledby="it-q-side" className="rounded-[6px] border p-6 lg:sticky lg:top-[96px]" style={{ borderColor: C.line, background: C.paper }}>
          <h2 id="it-q-side" className="text-[19px] font-bold">
            전화 상담
          </h2>
          <a href={`tel:${TEL}`} className="mt-2 block text-[28px] font-bold tabular-nums" style={{ color: C.forest }}>
            {TEL}
          </a>
          <dl className="mt-4 border-t text-[15px]" style={{ borderColor: C.line }}>
            {HOURS.map(([d, h]) => (
              <div key={d} className="flex justify-between border-b py-2" style={{ borderColor: C.line }}>
                <dt>{d}</dt>
                <dd className="font-semibold tabular-nums">{h}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-6 text-[16px] font-bold">문의 후 순서</h3>
          <ol className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 text-[15px]">
            {["전화 상담", "현장 실측(무료)", "공정별 견적서", "계약"].map((s, i) => (
              <li key={s} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight size={14} aria-hidden style={{ color: C.muted }} />}
                {s}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}

/* ---------- 공지사항 ---------- */

function NoticePage({ ctx, anchor }: { ctx: Ctx; anchor?: string }) {
  const { notices, today } = ctx;
  const [cat, setCat] = useState<NoticeCat | "전체">("전체");
  // 첫 화면에서 글을 눌러 들어오면 그 글을 펼쳐 둔다
  const [open, setOpen] = useState<number | null>(() => (anchor?.startsWith("it-n-") ? Number(anchor.slice(5)) : null));
  const [views, setViews] = useState<Record<number, number>>({});

  const list = useMemo(() => {
    const f = notices.filter((n) => cat === "전체" || n.cat === cat);
    return [...f.filter((n) => n.pinned), ...f.filter((n) => !n.pinned).sort((a, b) => a.ago - b.ago || b.id - a.id)];
  }, [notices, cat]);

  const toggle = (id: number) => {
    if (open !== id) setViews((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
    setOpen(open === id ? null : id);
  };

  const plain = list.filter((n) => !n.pinned);

  return (
    <>
      <PageHead crumb="공지사항" title="공지사항" />
      <div className="mx-auto max-w-[1000px] px-4 py-10 md:px-6 md:py-14">
        <div role="group" aria-label="분류" className="mb-5 flex gap-1.5">
          {(["전체", "공지", "이벤트"] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className="inline-flex h-10 items-center rounded-[4px] border px-4 text-[15px] font-semibold"
              style={cat === c ? { background: C.ink, borderColor: C.ink, color: C.white } : { borderColor: C.line }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="border-t-2" style={{ borderColor: C.ink }}>
          <div className="hidden grid-cols-[72px_1fr_120px_72px] border-b px-2 py-2.5 text-center text-[15px] font-semibold md:grid" style={{ borderColor: C.line, background: C.paper }}>
            <span>번호</span>
            <span>제목</span>
            <span>등록일</span>
            <span>조회</span>
          </div>
          <ul>
            {list.map((n) => {
              const isOpen = open === n.id;
              const num = n.pinned ? null : plain.length - plain.indexOf(n);
              return (
                <li key={n.id} id={`it-n-${n.id}`} className="scroll-mt-24 border-b" style={{ borderColor: C.line, background: n.pinned ? C.paper : undefined }}>
                  <h2 className="text-[16px] font-normal md:text-[17px]">
                    <button
                      type="button"
                      onClick={() => toggle(n.id)}
                      aria-expanded={isOpen}
                      aria-controls={`it-nb-${n.id}`}
                      className="grid w-full grid-cols-[1fr] gap-1 px-2 py-3.5 text-left md:grid-cols-[72px_1fr_120px_72px] md:items-center md:gap-0"
                    >
                      <span className="hidden text-center text-[15px] tabular-nums md:block" style={{ color: C.muted }}>
                        {num ?? <Pin size={15} aria-label="필독" className="mx-auto" style={{ color: C.forest }} />}
                      </span>
                      <span className="flex min-w-0 items-center gap-2">
                        <CatTag n={n} />
                        <span className={`min-w-0 break-keep ${isOpen || n.pinned ? "font-bold" : "font-medium"}`}>{n.title}</span>
                        {n.fresh && (
                          <span className="shrink-0 rounded-[2px] px-1 text-[12px] font-bold" style={{ background: C.wood, color: C.white }}>
                            새 글
                          </span>
                        )}
                      </span>
                      <span className="text-[14px] tabular-nums md:text-center" style={{ color: C.muted }}>
                        {fmtDot(daysAgo(today, n.ago))}
                        <span className="md:hidden">, 조회 {n.views + (views[n.id] ?? 0)}</span>
                      </span>
                      <span className="hidden text-center text-[14px] tabular-nums md:block" style={{ color: C.muted }}>
                        {n.views + (views[n.id] ?? 0)}
                      </span>
                    </button>
                  </h2>
                  {isOpen && (
                    <div id={`it-nb-${n.id}`} className="soft-in border-t px-4 py-5 md:px-[80px]" style={{ borderColor: C.line, background: C.white }}>
                      <p className="break-keep">{n.body}</p>
                      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
                        작성자 관리자
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ---------- 오시는 길 ---------- */

function TownMap() {
  // 단지 배치를 단순화한 동네 지도. 회색 약도 대신 단지·공원 면 색으로 구분한다.
  return (
    <svg viewBox="0 0 640 380" role="img" aria-label="ㄱㄷ로와 ㅅㅍ대로가 만나는 사거리, ㅎㅇ아파트 상가동 1층에 곰파트너가 있습니다. ㄱㄷ동 주민센터 버스 정류장은 길 건너편에 있습니다." className="block h-auto w-full">
      <rect width="640" height="380" fill="#efe7da" />
      {/* 단지와 공원 */}
      <rect x="20" y="20" width="300" height="190" rx="6" fill="#dbe6df" />
      <rect x="380" y="20" width="240" height="190" rx="6" fill="#e6dccb" />
      <rect x="20" y="268" width="300" height="96" rx="6" fill="#d3e3cf" />
      <rect x="380" y="268" width="240" height="96" rx="6" fill="#e6dccb" />
      {/* 아파트 동 */}
      {[50, 120, 190].map((x) => (
        <rect key={x} x={x} y="44" width="52" height="96" rx="3" fill="#bfd2c6" />
      ))}
      <rect x="196" y="160" width="104" height="38" rx="3" fill={C.forest} />
      {/* 도로 */}
      <rect x="0" y="222" width="640" height="34" fill="#ffffff" />
      <rect x="334" y="0" width="34" height="380" fill="#ffffff" />
      <line x1="0" y1="239" x2="640" y2="239" stroke="#e2c99e" strokeWidth="2" />
      <line x1="351" y1="0" x2="351" y2="380" stroke="#e2c99e" strokeWidth="2" />
      {/* 글자 */}
      <g fontFamily="inherit" fontWeight="700">
        <text x="40" y="34" dy="12" fontSize="17" fill="#2f4a40">
          ㅎㅇ아파트
        </text>
        <text x="400" y="122" fontSize="17" fill="#6b5536">
          ㄱㄷ초등학교
        </text>
        <text x="96" y="322" fontSize="17" fill="#3d5a3a">
          ㄱㄷ근린공원
        </text>
        <text x="400" y="322" fontSize="17" fill="#6b5536">
          ㄱㄷ동 주민센터
        </text>
        <text x="520" y="250" fontSize="15" fill="#7a6a52">
          ㄱㄷ로
        </text>
        <text x="362" y="372" fontSize="15" fill="#7a6a52" transform="rotate(-90 362 372)">
          ㅅㅍ대로
        </text>
        <text x="248" y="184" textAnchor="middle" fontSize="15" fill="#ffffff">
          상가동
        </text>
      </g>
      {/* 버스 정류장 */}
      <g transform="translate(560 274)">
        <rect width="30" height="22" rx="3" fill="#1f5fa8" />
        <text x="15" y="16" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
          B
        </text>
      </g>
      {/* 가게 표시 */}
      <g transform="translate(248 150)">
        <path d="M0 0c-13 0-22 9-22 21 0 15 22 35 22 35s22-20 22-35C22 9 13 0 0 0z" transform="translate(0 -58)" fill={C.wood} />
        <circle cx="0" cy="-37" r="8" fill="#ffffff" />
      </g>
      <g transform="translate(248 72)">
        <rect x="-56" y="-20" width="112" height="34" rx="4" fill="#ffffff" stroke={C.wood} strokeWidth="2" />
        <text x="0" y="3" textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink}>
          곰파트너
        </text>
      </g>
    </svg>
  );
}

function LocationPage({ go }: { go: Go }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <PageHead crumb="오시는 길" title="오시는 길" />
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="min-w-0 overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
            <TownMap />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold" style={{ color: C.wood }}>
              쇼룸 겸 사무실
            </p>
            <p className="mt-1 break-keep text-[20px] font-bold leading-[1.5]">{ADDRESS}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={copy} className="inline-flex h-11 items-center rounded-[4px] border px-4 text-[15px] font-semibold" style={{ borderColor: C.lineDark }}>
                {copied ? "복사했습니다" : "주소 복사"}
              </button>
              <a href={`tel:${TEL}`} className="inline-flex h-11 items-center gap-1.5 rounded-[4px] px-4 text-[15px] font-bold" style={{ background: C.forest, color: C.white }}>
                <Phone size={16} aria-hidden />
                {TEL}
              </a>
            </div>
            <span aria-live="polite" className="sr-only">
              {copied ? "주소를 복사했습니다" : ""}
            </span>

            <ul className="mt-8 divide-y border-y text-[15px] md:text-[16px]" style={{ borderColor: C.line }}>
              {(
                [
                  [TrainFront, "지하철", "ㅅㅍ역에서 마을버스 03번 환승, ㄱㄷ동 주민센터 하차"],
                  [Bus, "버스", "ㄱㄷ동 주민센터 정류장 하차, 길 건너 상가동 1층"],
                  [Car, "주차", "상가 지하 주차장 1시간 무료. 실측 상담 오시면 2시간까지 넣어 드립니다."],
                  [Clock, "방문 상담", "평일 09:00~18:00, 토 09:00~13:00. 샘플을 보시려면 전화로 시간을 잡아 주세요."],
                ] as const
              ).map(([Icon, k, v]) => (
                <li key={k} className="flex gap-3 py-4" style={{ borderColor: C.line }}>
                  <Icon size={20} aria-hidden className="mt-1 shrink-0" style={{ color: C.forest }} />
                  <div className="min-w-0">
                    <p className="font-bold">{k}</p>
                    <p className="break-keep" style={{ color: C.muted }}>
                      {v}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => go("quote")} className="mt-6 inline-flex h-12 items-center rounded-[4px] border px-5 text-[16px] font-bold" style={{ borderColor: C.lineDark }}>
              방문 전 견적문의 남기기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- 관리자 ---------- */

type AdminTab = "inbox" | "case" | "notice";

function AdminPage({
  go,
  inquiries,
  onCase,
  onNotice,
  nextCaseId,
  nextNoticeId,
}: {
  go: Go;
  inquiries: Inquiry[];
  onCase: (c: Case) => void;
  onNotice: (n: Notice) => void;
  nextCaseId: number;
  nextNoticeId: number;
}) {
  const [tab, setTab] = useState<AdminTab>("inbox");
  const tabs: { id: AdminTab; label: string; icon: typeof Inbox }[] = [
    { id: "inbox", label: "견적문의 접수", icon: Inbox },
    { id: "case", label: "시공사례 글쓰기", icon: Pencil },
    { id: "notice", label: "공지 글쓰기", icon: Pencil },
  ];

  return (
    <>
      <div className="border-b px-4 pb-6 pt-8 md:px-6" style={{ background: C.forestDeep, color: C.white, borderColor: C.forestDeep }}>
        <div className="mx-auto max-w-[1000px]">
          <p className="text-[14px]" style={{ color: "#bcd0c7" }}>
            데모에서는 로그인 없이 열립니다.
          </p>
          <h1 id="it-title" tabIndex={-1} className="mt-1 text-[28px] font-bold outline-none md:text-[34px]">
            관리자
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-6 md:py-10">
        <div role="tablist" aria-label="관리 메뉴" className="flex flex-wrap gap-1.5 border-b pb-3" style={{ borderColor: C.line }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`it-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={tab === id}
              aria-controls={`it-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const i = tabs.findIndex((t) => t.id === tab);
                const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length].id;
                setTab(n);
                document.getElementById(`it-tab-${n}`)?.focus();
              }}
              className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border px-3.5 text-[15px] font-semibold"
              style={tab === id ? { background: C.ink, borderColor: C.ink, color: C.white } : { borderColor: C.line }}
            >
              <Icon size={16} aria-hidden />
              {label}
              {id === "inbox" && <span className="tabular-nums">({inquiries.length})</span>}
            </button>
          ))}
        </div>
        <div id={`it-panel-${tab}`} role="tabpanel" aria-labelledby={`it-tab-${tab}`} className="pt-6">
          {tab === "inbox" && <AdminInbox inquiries={inquiries} />}
          {tab === "case" && <CaseWriter nextId={nextCaseId} onDone={onCase} />}
          {tab === "notice" && <NoticeWriter nextId={nextNoticeId} onDone={onNotice} />}
        </div>
        <button type="button" onClick={() => go("home")} className="mt-10 inline-flex h-11 items-center gap-1 text-[15px] font-semibold" style={{ color: C.forest }}>
          <ChevronLeft size={16} aria-hidden />
          홈페이지로
        </button>
      </div>
    </>
  );
}

function AdminInbox({ inquiries }: { inquiries: Inquiry[] }) {
  return (
    <ul className="space-y-3">
      {inquiries.map((q) => (
        <li key={q.no} className="rounded-[4px] border p-4" style={{ borderColor: q.ago === 0 ? C.forest : C.line }}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-bold">{q.name}</span>
            <span className="tabular-nums" style={{ color: C.muted }}>
              {q.phone}
            </span>
            <span className="ml-auto text-[14px] tabular-nums" style={{ color: q.ago === 0 ? C.forest : C.muted }}>
              {q.ago === 0 ? "방금 접수" : `${q.ago}일 전`}, {q.no}
            </span>
          </div>
          <p className="mt-1.5 break-keep text-[15px]">
            {q.town}, {q.house} {q.pyeong}, {q.living}
          </p>
          <p className="break-keep text-[15px]" style={{ color: C.muted }}>
            {q.works.join(", ")} / 희망 {q.when} / 예산 {q.budget} / 사진 {q.photos}장
          </p>
        </li>
      ))}
    </ul>
  );
}

function CaseWriter({ nextId, onDone }: { nextId: number; onDone: (c: Case) => void }) {
  const [town, setTown] = useState("");
  const [apt, setApt] = useState("");
  const [pyeong, setPyeong] = useState("");
  const [work, setWork] = useState<Work>("full");
  const [days, setDays] = useState("");
  const [body, setBody] = useState("");
  const [pic, setPic] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState("");

  const pick = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("사진 파일을 골라 주세요.");
      return;
    }
    if (pic) URL.revokeObjectURL(pic.url);
    setPic({ url: URL.createObjectURL(file), name: file.name });
    setError("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(pyeong);
    if (!town.trim() || !apt.trim() || !p || !pic) {
      setError("동, 단지명, 평형, 대표 사진은 꼭 넣어 주세요.");
      return;
    }
    onDone({
      id: nextId,
      town: town.trim(),
      apt: apt.trim(),
      pyeong: p,
      work,
      title: `${p}평 ${workLabel(work)}`,
      img: pic.url,
      days: Math.max(1, Number(days) || 1),
      scope: [workLabel(work)],
      body: body.trim() || "공사를 마쳤습니다.",
      ago: 0,
      views: 0,
      fresh: true,
    });
  };

  const inp = "mt-1.5 h-12 w-full rounded-[4px] border bg-white px-3 outline-none focus:border-[#24433b]";

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="a-town" className="font-bold">
          구, 동
        </label>
        <input id="a-town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="ㅅㅍ구 ㄱㄷ동" className={inp} style={{ borderColor: C.lineDark }} />
      </div>
      <div>
        <label htmlFor="a-apt" className="font-bold">
          단지명
        </label>
        <input id="a-apt" value={apt} onChange={(e) => setApt(e.target.value)} placeholder="ㅎㅇ아파트" className={inp} style={{ borderColor: C.lineDark }} />
      </div>
      <div>
        <label htmlFor="a-pyeong" className="font-bold">
          평형
        </label>
        <input id="a-pyeong" value={pyeong} onChange={(e) => setPyeong(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" placeholder="32" className={`${inp} tabular-nums`} style={{ borderColor: C.lineDark }} />
      </div>
      <div>
        <label htmlFor="a-work" className="font-bold">
          공사 종류
        </label>
        <select id="a-work" value={work} onChange={(e) => setWork(e.target.value as Work)} className={inp} style={{ borderColor: C.lineDark }}>
          {WORKS.filter((w) => w.id !== "all").map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="a-days" className="font-bold">
          공사 일수
        </label>
        <input id="a-days" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" placeholder="28" className={`${inp} tabular-nums`} style={{ borderColor: C.lineDark }} />
      </div>
      <div>
        <span id="a-pic-label" className="font-bold">
          대표 사진
        </span>
        <div className="mt-1.5 flex h-12 items-center gap-3">
          <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-[4px] px-4 text-[15px] font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ background: C.ink, color: C.white }}>
            <ImagePlus size={18} aria-hidden />
            사진 선택
            <input id="a-pic" type="file" accept="image/*" className="sr-only" aria-labelledby="a-pic-label" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          <span className="min-w-0 truncate text-[14px]" style={{ color: C.muted }}>
            {pic ? pic.name : "선택된 사진 없음"}
          </span>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="a-body" className="font-bold">
          내용
        </label>
        <textarea id="a-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="mt-1.5 w-full rounded-[4px] border bg-white px-3 py-2.5 outline-none focus:border-[#24433b]" style={{ borderColor: C.lineDark }} />
      </div>
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-[15px] font-semibold sm:col-span-2" style={{ color: C.error }}>
          <CircleAlert size={16} aria-hidden />
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="inline-flex h-12 items-center rounded-[4px] px-6 text-[16px] font-bold" style={{ background: C.forest, color: C.white }}>
          시공사례에 올리기
        </button>
      </div>
    </form>
  );
}

function NoticeWriter({ nextId, onDone }: { nextId: number; onDone: (n: Notice) => void }) {
  const [cat, setCat] = useState<NoticeCat>("공지");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("제목과 내용을 넣어 주세요.");
      return;
    }
    onDone({ id: nextId, cat, title: title.trim(), body: body.trim(), ago: 0, views: 0, fresh: true });
  };

  const inp = "mt-1.5 h-12 w-full rounded-[4px] border bg-white px-3 outline-none focus:border-[#24433b]";

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-[160px_1fr]">
      <div>
        <label htmlFor="n-cat" className="font-bold">
          분류
        </label>
        <select id="n-cat" value={cat} onChange={(e) => setCat(e.target.value as NoticeCat)} className={inp} style={{ borderColor: C.lineDark }}>
          <option>공지</option>
          <option>이벤트</option>
        </select>
      </div>
      <div>
        <label htmlFor="n-title" className="font-bold">
          제목
        </label>
        <input id="n-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inp} style={{ borderColor: C.lineDark }} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="n-body" className="font-bold">
          내용
        </label>
        <textarea id="n-body" value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="mt-1.5 w-full rounded-[4px] border bg-white px-3 py-2.5 outline-none focus:border-[#24433b]" style={{ borderColor: C.lineDark }} />
      </div>
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-[15px] font-semibold sm:col-span-2" style={{ color: C.error }}>
          <CircleAlert size={16} aria-hidden />
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="inline-flex h-12 items-center rounded-[4px] px-6 text-[16px] font-bold" style={{ background: C.forest, color: C.white }}>
          공지사항에 올리기
        </button>
      </div>
    </form>
  );
}

/* ---------- 바닥글 ---------- */

function Footer({ go }: { go: Go }) {
  return (
    <footer className="px-4 pb-24 pt-10 md:px-6" style={{ background: C.forestDeep, color: "#bfcdc6" }}>
      <div className="mx-auto max-w-[1200px]">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 border-b pb-5 text-[14px] font-semibold text-white" style={{ borderColor: "#2e4a42" }}>
          {MENUS.map((m) => (
            <li key={m.page}>
              <button type="button" onClick={() => go(m.page)} className="inline-flex h-9 items-center hover:underline">
                {m.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-white">
          <Logo light />
        </div>
        <DemoMakerInfo className="mt-5" />
        <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4 text-[13px]" style={{ borderColor: "#2e4a42" }}>
          <span />
          <button id="it-admin-link" type="button" onClick={() => go("admin")} className="inline-flex h-9 items-center gap-1 font-semibold text-white underline-offset-2 hover:underline">
            관리자
          </button>
        </div>
      </div>
    </footer>
  );
}
