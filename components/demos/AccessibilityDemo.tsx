"use client";

import { IBM_Plex_Sans_KR } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Pause,
  Play,
  ScanSearch,
  XCircle,
} from "lucide-react";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";

// 웹접근성 개선 전후 비교 데모.
// 같은 샘플 페이지(샘플시 문화재단)를 개선 전/개선 후로 바꿔 보여주고,
// 한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.2 검사 항목별로 문제와 조치 내용을 짚어 준다.
// 개선 전 화면은 일부러 대비·대체 텍스트·레이블 등을 어긴 상태다.

const plex = IBM_Plex_Sans_KR({ weight: ["400", "700"], subsets: ["latin"], display: "swap", preload: false });

type Mode = "before" | "after";
type RegionId = "header" | "banner" | "notice" | "schedule" | "form";

interface Issue {
  id: number;
  item: string;
  region: RegionId;
  /** 개선 전에도 이미 지켜진 항목 */
  alreadyOk?: boolean;
  problem: string;
  fix: string;
}

const ISSUES: Issue[] = [
  { id: 1, item: "적절한 대체 텍스트 제공", region: "banner", problem: "로고와 배너 이미지에 대체 텍스트가 없어 화면낭독기가 파일명을 읽습니다.", fix: "이미지별로 의미를 전달하는 대체 텍스트를 제공했습니다." },
  { id: 2, item: "정지 기능 제공", region: "banner", problem: "배너가 3초마다 자동으로 넘어가고 멈출 방법이 없습니다.", fix: "정지·재생, 이전·다음 버튼을 제공하고, 동작 줄이기 설정 시 자동 전환을 중지했습니다." },
  { id: 3, item: "반복 영역 건너뛰기", region: "header", problem: "키보드 사용 시 페이지마다 메뉴 전체를 거쳐야 본문으로 이동할 수 있습니다.", fix: "페이지 첫 부분에 본문 바로가기 링크를 제공했습니다." },
  { id: 4, item: "초점 이동과 표시", region: "header", problem: "키보드 초점 표시가 제거되어 현재 초점 위치를 알 수 없습니다.", fix: "링크·버튼·입력란에 초점 테두리를 표시했습니다." },
  { id: 5, item: "텍스트 콘텐츠의 명도 대비", region: "notice", problem: "공지 제목과 날짜가 연한 회색으로 명도 대비가 2:1 수준입니다.", fix: "글자와 배경의 명도 대비를 4.5:1 이상으로 높였습니다." },
  { id: 6, item: "적절한 링크 텍스트", region: "notice", problem: "링크 문구가 '여기를 클릭'이라 어디로 가는지 알 수 없습니다.", fix: "링크 목적을 알 수 있는 문구('공지사항 전체 보기')로 수정했습니다." },
  { id: 7, item: "표의 구성", region: "schedule", problem: "행사 일정 표에 표 제목과 제목 셀이 없습니다.", fix: "표 제목과 행·열 제목 셀을 지정했습니다." },
  { id: 8, item: "색에 무관한 콘텐츠 인식", region: "schedule", problem: "접수 상태를 초록·빨강 점으로만 구분합니다.", fix: "상태를 글자와 아이콘으로 함께 표시했습니다." },
  { id: 9, item: "레이블 제공", region: "form", problem: "입력란에 레이블 없이 placeholder만 있어 입력 시 항목명이 사라집니다.", fix: "모든 입력란에 레이블을 연결했습니다." },
  { id: 10, item: "오류 정정", region: "form", problem: "필수 항목 누락 시 오류 안내 없이 신청이 처리되지 않습니다.", fix: "누락 항목을 입력란 아래와 오류 요약에 표시하고, 첫 번째 오류 항목으로 초점을 옮겼습니다." },
  { id: 11, item: "제목 제공", region: "header", alreadyOk: true, problem: "페이지와 영역마다 제목이 있습니다.", fix: "기존 구조를 유지했습니다." },
  { id: 12, item: "기본 언어 표시", region: "header", alreadyOk: true, problem: "문서의 기본 언어가 한국어로 지정되어 있습니다.", fix: "기존 설정을 유지했습니다." },
];

const BANNERS = [
  { src: "/images/demo-a11y/banner-1.svg", alt: "가을 시민 음악회, 10월 18일 토요일 오후 6시, ㄴㅇ시민회관 대공연장" },
  { src: "/images/demo-a11y/banner-2.svg", alt: "생활문화 동아리 모집, 9월 1일부터 10월 31일까지, 선정 동아리에 연습 공간 지원" },
  { src: "/images/demo-a11y/banner-3.svg", alt: "시민 사진 공모전, 주제는 우리 동네의 계절, 11월 15일까지 접수" },
];

// ago: 오늘 기준 며칠 전 게시
const NOTICES = [
  { ago: 11, title: "ㄴㅇ시민회관 대공연장 좌석 교체 공사 안내" },
  { ago: 15, title: "문화예술교육 강사 모집 결과" },
  { ago: 19, title: "명절 연휴 문화시설 운영 시간 변경" },
  { ago: 27, title: "생활문화 동아리 지원사업 설명회 개최" },
];

type Status = "open" | "closed" | "soon";
const SCHEDULE: { name: string; date: string; place: string; status: Status }[] = [
  { name: "가을 시민 음악회", date: "10.18(토)", place: "ㄴㅇ시민회관 대공연장", status: "open" },
  { name: "어린이 인형극 한마당", date: "10.25(토)", place: "ㄴㅇ아트홀", status: "open" },
  { name: "전통 공예 체험 교실", date: "10.04(토)", place: "문화재단 교육실", status: "closed" },
  { name: "시민 사진 공모전 전시", date: "11.22(토)", place: "ㄴㅇ시립미술관", status: "soon" },
];

const STATUS_TEXT: Record<Status, string> = { open: "접수중", closed: "접수마감", soon: "접수예정" };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function AccessibilityDemo() {
  const [mode, setMode] = useState<Mode>("before");
  const [activeId, setActiveId] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const active = ISSUES.find((i) => i.id === activeId) ?? null;
  const passed = mode === "after" ? ISSUES.length : ISSUES.filter((i) => i.alreadyOk).length;

  function selectIssue(issue: Issue) {
    setActiveId(issue.id);
    document
      .getElementById(`region-${issue.region}`)
      ?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div className={`${plex.className} min-h-screen bg-[#e9ebf2] text-[#161a33]`}>
      {/* 점검 도구 상단 막대 */}
      <header className="sticky top-0 z-30 border-b-2 border-[#161a33] bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-[#161a33] text-[#ffd23f]">
              <ScanSearch size={22} aria-hidden />
            </span>
            <div>
              <p className="text-[17px] font-bold leading-tight">웹접근성 점검</p>
              <p className="text-[15px] leading-tight text-[#474c68]">ㄴㅇ시 문화재단 메인 페이지</p>
            </div>
          </div>

          <div role="group" aria-label="비교 화면 선택" className="flex rounded-[4px] border-2 border-[#161a33] p-0.5">
            {(["before", "after"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`h-10 rounded-[2px] px-4 text-[15px] font-bold transition-colors ${
                  mode === m ? "bg-[#161a33] text-white" : "text-[#161a33] hover:bg-[#eef0f7]"
                }`}
              >
                {m === "before" ? "개선 전" : "개선 후"}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3" aria-live="polite">
            <ScoreMeter passed={passed} total={ISSUES.length} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1320px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* 샘플 페이지 */}
        <div className="min-w-0">
          <div className="overflow-hidden rounded-[6px] border-2 border-[#161a33] bg-white shadow-[6px_6px_0_#161a33]">
            <div className="flex items-center gap-2 border-b-2 border-[#161a33] bg-[#f6f7fb] px-3 py-2">
              <span className="h-3 w-3 rounded-full border-2 border-[#161a33]" aria-hidden />
              <span className="h-3 w-3 rounded-full border-2 border-[#161a33]" aria-hidden />
              <span className="truncate rounded-[3px] bg-white px-2 py-0.5 text-[15px] text-[#474c68]">
                www.sample-culture.or.kr
              </span>
              <span
                className={`ml-auto shrink-0 rounded-[3px] px-2 py-0.5 text-[15px] font-bold ${
                  mode === "before" ? "bg-[#fde7e4] text-[#9c1c11]" : "bg-[#dff2e7] text-[#16603b]"
                }`}
              >
                {mode === "before" ? "개선 전 화면" : "개선 후 화면"}
              </span>
            </div>
            <SamplePage key={mode} mode={mode} activeRegion={active?.region ?? null} activeNumber={active?.id ?? null} reduced={reduced} />
          </div>
        </div>

        {/* 점검 항목 */}
        <aside className="lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-110px)] lg:self-start lg:overflow-y-auto">
          <div className="rounded-[6px] border-2 border-[#161a33] bg-white">
            <div className="flex items-center gap-2 border-b-2 border-[#161a33] px-4 py-3">
              <ClipboardCheck size={20} aria-hidden />
              <h2 className="text-[17px] font-bold">검사항목</h2>
              <span className="ml-auto text-[15px] text-[#474c68]">KWCAG 2.2 기준</span>
            </div>
            <ol className="divide-y divide-[#d5d8e3]">
              {ISSUES.map((issue) => {
                const ok = mode === "after" || issue.alreadyOk;
                const selected = issue.id === activeId;
                return (
                  <li key={issue.id}>
                    <button
                      type="button"
                      onClick={() => selectIssue(issue)}
                      aria-expanded={selected}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${
                        selected ? "bg-[#fff6cc]" : "hover:bg-[#f6f7fb]"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
                          selected ? "bg-[#ffd23f] text-[#161a33] ring-2 ring-[#161a33]" : "bg-[#161a33] text-white"
                        }`}
                      >
                        {issue.id}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-[16px] font-bold leading-snug">{issue.item}</span>
                          <Verdict ok={Boolean(ok)} />
                        </span>
                        {selected && (
                          <span className="mt-2 block space-y-2 text-[15px] leading-relaxed">
                            <span className="block">
                              <b className="text-[#9c1c11]">오류 내용</b> {issue.problem}
                            </span>
                            <span className="block">
                              <b className="text-[#16603b]">조치 내용</b> {issue.fix}
                            </span>
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-[#474c68]">
            점검 기준: 한국형 웹 콘텐츠 접근성 지침 2.2
          </p>
        </aside>
      </div>
    </div>
  );
}

function ScoreMeter({ passed, total }: { passed: number; total: number }) {
  const pct = Math.round((passed / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-[15px] leading-tight text-[#474c68]">준수 항목</p>
        <p className="text-[22px] font-bold leading-tight tabular-nums">
          {passed}
          <span className="text-[15px] font-normal text-[#474c68]"> / {total}</span>
        </p>
      </div>
      <div className="h-10 w-28 rounded-[3px] border-2 border-[#161a33] p-0.5" aria-hidden>
        <div
          className="h-full rounded-[1px] bg-[#161a33] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Verdict({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex shrink-0 items-center gap-1 text-[15px] font-bold text-[#16603b]">
      <CheckCircle2 size={16} aria-hidden />
      적합
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 text-[15px] font-bold text-[#9c1c11]">
      <XCircle size={16} aria-hidden />
      부적합
    </span>
  );
}

/** 점검 항목을 누르면 해당 영역을 형광펜 테두리와 번호로 표시한다 */
function Region({
  id,
  active,
  number,
  children,
  className = "",
}: {
  id: RegionId;
  active: boolean;
  number: number | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      id={`region-${id}`}
      className={`relative scroll-mt-28 ${className} ${
        active ? "outline outline-4 outline-offset-[-4px] outline-[#ffd23f]" : ""
      }`}
    >
      {active && number !== null && (
        <span className="pointer-events-none absolute right-2 top-2 z-10 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#ffd23f] px-2 text-[15px] font-bold text-[#161a33] ring-2 ring-[#161a33]">
          {number}
        </span>
      )}
      {children}
    </div>
  );
}

function SamplePage({
  mode,
  activeRegion,
  activeNumber,
  reduced,
}: {
  mode: Mode;
  activeRegion: RegionId | null;
  activeNumber: number | null;
  reduced: boolean;
}) {
  const good = mode === "after";
  const today = useDemoToday();
  const region = (id: RegionId) => ({ id, active: activeRegion === id, number: activeRegion === id ? activeNumber : null });

  return (
    <div
      lang="ko"
      className={`soft-in font-sans text-[#222] ${good ? "" : "[&_*:focus-visible]:outline-none [&_*:focus]:outline-none"}`}
    >
      <Region {...region("header")}>
        {good && (
          <a
            href="#sample-main"
            className="absolute left-2 top-2 z-20 -translate-y-20 rounded bg-[#6b2d8c] px-3 py-2 text-[15px] font-bold text-white focus:translate-y-0"
          >
            본문 바로가기
          </a>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#e3dfe6] px-4 py-3 md:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/demo-a11y/logo.svg" alt={good ? "ㄴㅇ시 문화재단" : undefined} width={200} height={44} className="h-9 w-auto" />
          <nav aria-label={good ? "주 메뉴" : undefined} className="flex flex-wrap gap-x-4 gap-y-1 text-[15px] font-bold text-[#2b1a33]">
            {["재단소개", "공연·전시", "교육", "지원사업", "알림마당"].map((m) => (
              <a key={m} href="#sample-main" onClick={(e) => e.preventDefault()} className="rounded px-1 py-0.5 hover:text-[#6b2d8c]">
                {m}
              </a>
            ))}
          </nav>
        </div>
      </Region>

      <main id="sample-main" tabIndex={-1} className="focus:outline-none">
        <h1 className="sr-only">ㄴㅇ시 문화재단 메인</h1>
        <Region {...region("banner")}>
          <Banner good={good} reduced={reduced} />
        </Region>

        <div className="grid gap-6 px-4 py-6 md:grid-cols-2 md:px-6">
          <Region {...region("notice")} className="rounded-[6px]">
            <section className="h-full rounded-[6px] border border-[#e3dfe6] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[#2b1a33]">공지사항</h2>
                <a href="#sample-main" onClick={(e) => e.preventDefault()} className={`text-[15px] ${good ? "font-bold text-[#6b2d8c] underline" : "text-[#b9b9b9]"}`}>
                  {good ? "공지사항 전체 보기" : "여기를 클릭"}
                </a>
              </div>
              <ul className="mt-3 divide-y divide-[#eee]">
                {NOTICES.map((n) => (
                  <li key={n.title} className="flex gap-3 py-2.5 text-[15px]">
                    <a href="#sample-main" onClick={(e) => e.preventDefault()} className={`flex-1 truncate ${good ? "text-[#222]" : "text-[#aaaaaa]"}`}>
                      {n.title}
                    </a>
                    <span className={`shrink-0 tabular-nums ${good ? "text-[#555]" : "text-[#cccccc]"}`}>{fmtDot(daysAgo(today, n.ago))}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Region>

          <Region {...region("schedule")} className="rounded-[6px]">
            <section className="h-full rounded-[6px] border border-[#e3dfe6] p-4">
              <h2 className="text-[18px] font-bold text-[#2b1a33]">행사 일정</h2>
              <div className="mt-3 overflow-x-auto">
                {good ? (
                  <table className="w-full min-w-[420px] text-[15px]">
                    <caption className="sr-only">10월과 11월 행사 일정과 접수 상태</caption>
                    <thead>
                      <tr className="border-b-2 border-[#2b1a33] text-left">
                        <th scope="col" className="py-2 font-bold">행사명</th>
                        <th scope="col" className="py-2 font-bold">일시</th>
                        <th scope="col" className="py-2 font-bold">장소</th>
                        <th scope="col" className="py-2 font-bold">접수상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCHEDULE.map((s) => (
                        <tr key={s.name} className="border-b border-[#eee]">
                          <th scope="row" className="py-2 text-left font-normal">{s.name}</th>
                          <td className="py-2 tabular-nums">{s.date}</td>
                          <td className="py-2">{s.place}</td>
                          <td className="py-2">
                            <StatusBadge status={s.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full min-w-[420px] text-[15px]">
                    <tbody>
                      <tr className="border-b border-[#eee] bg-[#f4f4f4]">
                        <td className="py-2">행사명</td>
                        <td className="py-2">일시</td>
                        <td className="py-2">장소</td>
                        <td className="py-2">접수상태</td>
                      </tr>
                      {SCHEDULE.map((s) => (
                        <tr key={s.name} className="border-b border-[#eee]">
                          <td className="py-2">{s.name}</td>
                          <td className="py-2">{s.date}</td>
                          <td className="py-2">{s.place}</td>
                          <td className="py-2">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ background: s.status === "open" ? "#4caf50" : s.status === "closed" ? "#e53935" : "#ffb300" }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </Region>
        </div>

        <div className="px-4 pb-6 md:px-6">
          <Region {...region("form")} className="rounded-[6px]">
            <ApplyForm good={good} />
          </Region>
        </div>
      </main>

      <footer className="border-t border-[#e3dfe6] bg-[#2b1a33] px-4 pt-5 pb-24 text-[15px] text-[#e7dcec] md:px-6">
        <p className="font-bold text-white">ㄴㅇ시 문화재단</p>
        <p className="mt-1">ㄴㅇ시 ㄴㅇ로 45, 문화재단 빌딩 3층 | 대표전화 000-000-0000</p>
        <p className="mt-1">© ㄴㅇ시 문화재단</p>
      </footer>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const style =
    status === "open"
      ? "bg-[#e3f3e8] text-[#1b6b3a]"
      : status === "closed"
        ? "bg-[#f3e3e1] text-[#9c1c11]"
        : "bg-[#fbf0d4] text-[#7a5200]";
  const Icon = status === "open" ? CheckCircle2 : status === "closed" ? XCircle : CalendarClock;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[15px] font-bold ${style}`}>
      <Icon size={14} aria-hidden />
      {STATUS_TEXT[status]}
    </span>
  );
}

function Banner({ good, reduced }: { good: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  // 개선 전: 항상 자동 전환. 개선 후: 재생 중이고 움직임 줄이기가 꺼져 있을 때만 전환
  const autoplay = good ? playing && !reduced : true;

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % BANNERS.length), 3000);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const go = (d: number) => setIndex((i) => (i + d + BANNERS.length) % BANNERS.length);
  const b = BANNERS[index];

  return (
    <section aria-label={good ? "주요 사업" : undefined} aria-roledescription={good ? "배너" : undefined} className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={b.src} alt={good ? b.alt : undefined} width={960} height={320} className="block h-auto w-full" />
      {good && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/65 p-1 text-white">
          <button type="button" onClick={() => go(-1)} aria-label="이전 배너" className="flex h-9 w-9 items-center justify-center rounded hover:bg-white/20">
            <ChevronLeft size={18} aria-hidden />
          </button>
          <span className="px-1 text-[15px] tabular-nums" aria-live="polite">
            {index + 1} / {BANNERS.length}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="다음 배너" className="flex h-9 w-9 items-center justify-center rounded hover:bg-white/20">
            <ChevronRight size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing && !reduced ? "배너 자동 전환 정지" : "배너 자동 전환 재생"}
            disabled={reduced}
            className="flex h-9 w-9 items-center justify-center rounded hover:bg-white/20 disabled:opacity-50"
          >
            {playing && !reduced ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
          </button>
        </div>
      )}
    </section>
  );
}

type FormErrors = Partial<Record<"name" | "phone" | "event" | "agree", string>>;

function ApplyForm({ good }: { good: boolean }) {
  const [values, setValues] = useState({ name: "", phone: "", event: "", agree: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [done, setDone] = useState(false);
  const openEvents = useMemo(() => SCHEDULE.filter((s) => s.status === "open"), []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!good) return; // 개선 전: 아무 안내 없이 넘어가지 않는다
    const next: FormErrors = {};
    if (!values.name.trim()) next.name = "성명은 필수 입력 항목입니다.";
    if (!/^01\d-?\d{3,4}-?\d{4}$/.test(values.phone.trim())) next.phone = "연락처 형식이 올바르지 않습니다. (예: 010-0000-0000)";
    if (!values.event) next.event = "행사명은 필수 선택 항목입니다.";
    if (!values.agree) next.agree = "개인정보 수집·이용에 동의해야 신청할 수 있습니다.";
    setErrors(next);
    const first = (Object.keys(next) as (keyof FormErrors)[])[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      setDone(false);
      return;
    }
    setDone(true);
  }

  const inputBase = "h-11 w-full rounded border px-3 text-[15px]";

  return (
    <section className="rounded-[6px] border border-[#e3dfe6] p-4">
      <h2 className="text-[18px] font-bold text-[#2b1a33]">행사 관람 신청</h2>
      {good && Object.keys(errors).length > 0 && (
        <div role="alert" className="mt-3 rounded border border-[#d9453a] bg-[#fdecea] px-3 py-2 text-[15px] text-[#8c1a10]">
          <p className="flex items-center gap-1 font-bold">
            <CircleAlert size={16} aria-hidden />
            입력 내용을 확인하십시오.
          </p>
          <ul className="mt-1 list-disc pl-5">
            {Object.values(errors).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      {done && good && (
        <p role="status" className="mt-3 rounded bg-[#e3f3e8] px-3 py-2 text-[15px] font-bold text-[#1b6b3a]">
          신청이 접수되었습니다.
        </p>
      )}
      <form onSubmit={submit} noValidate className="mt-3 grid gap-3 sm:grid-cols-2">
        {good ? (
          <>
            <Field id="f-name" label="성명" error={errors.name}>
              <input id="f-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "f-name-err" : undefined} className={`${inputBase} border-[#6b6272]`} />
            </Field>
            <Field id="f-phone" label="연락처" error={errors.phone}>
              <input id="f-phone" inputMode="tel" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "f-phone-err" : undefined} className={`${inputBase} border-[#6b6272]`} />
            </Field>
            <Field id="f-event" label="행사명" error={errors.event}>
              <select id="f-event" value={values.event} onChange={(e) => setValues((v) => ({ ...v, event: e.target.value }))} aria-invalid={Boolean(errors.event)} aria-describedby={errors.event ? "f-event-err" : undefined} className={`${inputBase} border-[#6b6272] bg-white`}>
                <option value="">선택</option>
                {openEvents.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-[15px]">
                <input id="f-agree" type="checkbox" checked={values.agree} onChange={(e) => setValues((v) => ({ ...v, agree: e.target.checked }))} aria-invalid={Boolean(errors.agree)} className="h-5 w-5" />
                개인정보 수집·이용에 동의합니다. (필수)
              </label>
              {errors.agree && <p className="mt-1 text-[15px] text-[#8c1a10]">{errors.agree}</p>}
            </div>
          </>
        ) : (
          <>
            <input placeholder="성명" className={`${inputBase} border-[#ddd] placeholder:text-[#c8c8c8]`} />
            <input placeholder="연락처" className={`${inputBase} border-[#ddd] placeholder:text-[#c8c8c8]`} />
            <select className={`${inputBase} border-[#ddd] bg-white text-[#aaa]`} defaultValue="">
              <option value="">행사명</option>
              {openEvents.map((s) => (
                <option key={s.name}>{s.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-[15px] text-[#aaa] sm:col-span-2">
              <input type="checkbox" className="h-5 w-5" />
              동의
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <button type="submit" className={`h-11 rounded px-6 text-[15px] font-bold text-white ${good ? "bg-[#6b2d8c] hover:bg-[#57237a]" : "bg-[#c9a9d9]"}`}>
            신청
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[15px] font-bold">
        {label} <span className="text-[#8c1a10]">(필수)</span>
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[15px] text-[#8c1a10]">
          {error}
        </p>
      )}
    </div>
  );
}
