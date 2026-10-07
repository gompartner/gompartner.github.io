"use client";

import { useEffect, useMemo, useState } from "react";
import { IBM_Plex_Sans_KR } from "next/font/google";
import {
  Archive,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Inbox,
  KeyRound,
  ListChecks,
  Plus,
  Printer,
  RotateCcw,
  Server,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { daysAgo, fmtDash, useDemoToday } from "@/hooks/useDemoToday";

const plex = IBM_Plex_Sans_KR({ weight: ["400", "700"], subsets: ["latin"], preload: false, display: "swap" });

const STORAGE_KEY = "gs-demo:maintenance:v3";

/* 기관 홈페이지 유지보수 현황판 데모.
   야간 관제실 느낌의 짙은 청록 작업 화면: 가동 상태 띠, 요청 대기열, 처리 기록.
   인쇄용 월간 점검 보고서만 흰 A4 용지로 둔다. 기관명·부서·요청 내용은 모두 가상 데이터다.

   색 (어두운 화면 기준 대비 확인):
   바탕 #0f1e2e, 패널 #152a3f, 선 #28435e, 본문 #e6eef6(14:1), 보조 #a3b8cc(8:1),
   조작 #6fd3ea(9:1, 버튼은 바탕색 글자), 상태 접수 #a9bdff, 처리중 #f3b847, 처리완료 #66d6a8, 조치 필요 #ff9a84 */

const C = {
  bg: "#0f1e2e",
  panel: "#152a3f",
  panel2: "#1b3450",
  rule: "#28435e",
  text: "#e6eef6",
  muted: "#a3b8cc",
  action: "#6fd3ea",
} as const;

const REQUEST_TYPES = ["콘텐츠 수정", "오류 수정", "보안 조치", "기능 개선"] as const;
const STATUSES = ["접수", "처리중", "처리완료"] as const;
const DEPARTMENTS = ["입학처", "교무처", "학생지원처", "홍보팀", "정보전산원", "도서관", "체육학과", "간호학과"];

type RequestType = (typeof REQUEST_TYPES)[number];
type Status = (typeof STATUSES)[number];

interface Request {
  id: string;
  no: number;
  date: string;
  dept: string;
  requester: string;
  type: RequestType;
  title: string;
  content: string;
  status: Status;
  resolution: string;
  doneDate?: string;
}

type CheckResult = "정상" | "조치 필요";

interface CheckItem {
  id: string;
  label: string;
  result: CheckResult;
  note: string;
}

/** 저장용. 날짜가 숫자면 오늘 기준 며칠 전(예시 데이터), 문자열이면 YYYY-MM-DD(직접 등록·처리한 날) */
type StoredRequest = Omit<Request, "date" | "doneDate"> & { date: string | number; doneDate?: string | number };

interface State {
  requests: StoredRequest[];
  checks: CheckItem[];
}

// 현황·보고서는 오늘까지 최근 30일을 본다.
const PERIOD_DAYS = 30;
// 가동 기록에서 짧은 지연이 있었던 날(오늘 기준 며칠 전)
const DELAY_AGO = 18;
// SSL 인증서 만료까지 남은 날
const SSL_LEFT = 326;

const SEED_REQUESTS: StoredRequest[] = [
  { id: "r16", no: 16, date: 1, dept: "입학처", requester: "박서연", type: "콘텐츠 수정", title: "수시 모집 공지 메인 배너 교체", content: "메인 배너를 수시 모집 안내 이미지로 교체 요청합니다.", status: "접수", resolution: "" },
  { id: "r15", no: 15, date: 3, dept: "정보전산원", requester: "정민호", type: "보안 조치", title: "관리자 페이지 접속 IP 제한 추가", content: "외부망에서 관리자 페이지 접속 차단을 요청합니다.", status: "처리중", resolution: "학내 IP 대역 목록 확인 중입니다." },
  { id: "r14", no: 14, date: 5, dept: "체육학과", requester: "이도윤", type: "콘텐츠 수정", title: "학과 교수진 사진 변경", content: "신임 교수 2명 사진과 연구실 번호 반영을 요청합니다.", status: "처리완료", resolution: "교수진 페이지 사진과 연락처를 변경했습니다.", doneDate: 4 },
  { id: "r13", no: 13, date: 7, dept: "학생지원처", requester: "최지우", type: "오류 수정", title: "장학 공지 게시판 첨부파일 다운로드 오류", content: "한글 파일명 첨부파일이 다운로드되지 않습니다.", status: "처리완료", resolution: "첨부파일 이름 인코딩 처리를 수정했습니다.", doneDate: 6 },
  { id: "r12", no: 12, date: 10, dept: "홍보팀", requester: "한예린", type: "기능 개선", title: "보도자료 게시판 대표 이미지 표시", content: "게시판 목록에 대표 이미지 표시를 요청합니다.", status: "처리중", resolution: "목록 화면 수정 후 검토 요청 예정입니다." },
  { id: "r11", no: 11, date: 12, dept: "정보전산원", requester: "정민호", type: "보안 조치", title: "보안 취약점 점검 결과 조치", content: "게시판 검색어 입력값 검증 취약점 2건 조치 요청입니다.", status: "처리완료", resolution: "입력값 필터를 적용하고 재점검 결과를 전달했습니다.", doneDate: 10 },
  { id: "r10", no: 10, date: 14, dept: "교무처", requester: "김하늘", type: "콘텐츠 수정", title: "2학기 학사 일정 표 수정", content: "중간고사 기간 변경분 반영을 요청합니다.", status: "처리완료", resolution: "학사 일정 페이지 표를 수정했습니다.", doneDate: 14 },
  { id: "r09", no: 9, date: 18, dept: "도서관", requester: "윤서아", type: "오류 수정", title: "모바일에서 운영 시간 표 깨짐", content: "모바일 화면에서 표가 화면 밖으로 넘어갑니다.", status: "처리완료", resolution: "표를 모바일에서 가로 스크롤되도록 수정했습니다.", doneDate: 17 },
  { id: "r08", no: 8, date: 20, dept: "간호학과", requester: "오하준", type: "콘텐츠 수정", title: "실습 안내 자료 파일 교체", content: "실습 안내 PDF 파일 교체를 요청합니다.", status: "처리완료", resolution: "첨부파일을 교체했습니다.", doneDate: 20 },
  { id: "r07", no: 7, date: 24, dept: "입학처", requester: "박서연", type: "기능 개선", title: "입학 상담 신청 항목 추가", content: "상담 신청 양식에 희망 학과 선택 항목 추가를 요청합니다.", status: "처리완료", resolution: "희망 학과 선택 항목과 관리자 목록 열을 추가했습니다.", doneDate: 19 },
  { id: "r06", no: 6, date: 26, dept: "홍보팀", requester: "한예린", type: "콘텐츠 수정", title: "대학 소개 영상 교체", content: "메인 소개 영상을 올해 버전으로 교체 요청합니다.", status: "처리완료", resolution: "영상 링크와 썸네일을 교체했습니다.", doneDate: 25 },
  { id: "r05", no: 5, date: 28, dept: "학생지원처", requester: "최지우", type: "오류 수정", title: "상담 예약 페이지 접속 오류", content: "상담 예약 페이지가 간헐적으로 열리지 않습니다.", status: "처리완료", resolution: "세션 설정을 수정하고 3일간 모니터링했습니다.", doneDate: 25 },
  { id: "r04", no: 4, date: 33, dept: "교무처", requester: "김하늘", type: "콘텐츠 수정", title: "휴·복학 안내 문구 수정", content: "신청 기간 문구 수정을 요청합니다.", status: "처리완료", resolution: "안내 문구를 수정했습니다.", doneDate: 33 },
  { id: "r03", no: 3, date: 40, dept: "정보전산원", requester: "정민호", type: "보안 조치", title: "SSL 인증서 갱신", content: "인증서 만료 전 갱신 요청입니다.", status: "처리완료", resolution: "인증서를 갱신하고 만료일을 확인했습니다.", doneDate: 39 },
];

const SEED_CHECKS: CheckItem[] = [
  { id: "server", label: "서버 가동 상태", result: "정상", note: "가동률 99.97%, 12분 지연 1회" },
  { id: "links", label: "링크 오류 점검", result: "조치 필요", note: "학과 페이지 외부 링크 3건 수정 예정" },
  { id: "patch", label: "보안 패치 적용", result: "정상", note: "웹 서버·CMS 최신 보안 패치 적용" },
  { id: "backup", label: "백업 상태", result: "정상", note: "일일 백업 30회 성공, 복원 테스트 완료" },
  { id: "ssl", label: "SSL 인증서 만료일", result: "정상", note: "1년 인증서 갱신 완료" },
  { id: "a11y", label: "웹 접근성 점검", result: "조치 필요", note: "이미지 대체 텍스트 누락 5건" },
];

const INITIAL_STATE: State = { requests: SEED_REQUESTS, checks: SEED_CHECKS };

// 최근 30일 가동률(%). 맨 끝이 오늘. 하루만 짧은 지연이 있었다.
const UPTIME = Array.from({ length: PERIOD_DAYS }, (_, i) => (i === PERIOD_DAYS - 1 - DELAY_AGO ? 99.2 : 100));

const TABS = [
  { id: "requests", label: "유지보수 요청", icon: ListChecks },
  { id: "checks", label: "정기점검", icon: ClipboardCheck },
  { id: "report", label: "월간 점검 보고서", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 가운데 글자를 초성으로 바꾼다. 김하늘은 김ㅎ늘, 두 글자는 이* */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return name;
  const toChoseong = (c: string) => {
    const code = c.charCodeAt(0) - 0xac00;
    return code >= 0 && code <= 11171 ? CHOSEONG[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + "*";
  return chars[0] + chars.slice(1, -1).map(toChoseong).join("") + chars[chars.length - 1];
}

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return `${y}. ${m}. ${day}.`;
}

function koDate(d: string) {
  const [, m, day] = d.split("-").map(Number);
  return `${m}월 ${day}일`;
}

function shortDate(d: string) {
  const [, m, day] = d.split("-").map(Number);
  return `${m}. ${day}.`;
}

function resolveRequest(r: StoredRequest, t: Date): Request {
  const at = (v: string | number) => (typeof v === "number" ? fmtDash(daysAgo(t, v)) : v);
  return { ...r, date: at(r.date), doneDate: r.doneDate === undefined ? undefined : at(r.doneDate) };
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const statusStyle: Record<Status, { icon: typeof Inbox; color: string }> = {
  접수: { icon: Inbox, color: "#a9bdff" },
  처리중: { icon: Clock, color: "#f3b847" },
  처리완료: { icon: CheckCircle2, color: "#66d6a8" },
};

function StatusMark({ status }: { status: Status }) {
  const { icon: Icon, color } = statusStyle[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-bold" style={{ color }}>
      <Icon size={16} aria-hidden />
      {status}
    </span>
  );
}

const field =
  "h-12 w-full rounded-md border border-[#3a5875] bg-[#0f1e2e] px-3 text-[17px] text-[#e6eef6] placeholder:text-[#8aa2b8] focus:border-[#6fd3ea] focus:outline-none";
const primaryBtn =
  "inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[#6fd3ea] px-5 text-[17px] font-bold text-[#0f1e2e] transition-colors hover:bg-[#9ae2f2] disabled:bg-[#3a5875] disabled:text-[#a3b8cc] motion-reduce:transition-none";
const ghostBtn =
  "inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-[#3a5875] px-5 text-[17px] font-bold text-[#e6eef6] transition-colors hover:border-[#6fd3ea] motion-reduce:transition-none";

export function MaintenanceDemo() {
  const [state, setState, hydrated] = useLocalStorage<State>(STORAGE_KEY, INITIAL_STATE);
  const [tab, setTab] = useState<TabId>("requests");
  const [statusFilter, setStatusFilter] = useState<Status | "전체">("전체");
  const [typeFilter, setTypeFilter] = useState<RequestType | "전체">("전체");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ dept: DEPARTMENTS[0], type: REQUEST_TYPES[0] as RequestType, title: "", content: "" });

  useEffect(() => {
    const f = () => {
      setTab("requests");
      setSelectedId(null);
      setFormOpen(false);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const now = useDemoToday();
  const today = fmtDash(now);
  const requests = useMemo(() => state.requests.map((r) => resolveRequest(r, now)), [state.requests, now]);
  const monthRequests = useMemo(() => requests.filter((r) => r.date <= today && daysBetween(r.date, today) < PERIOD_DAYS), [requests, today]);
  const summary = useMemo(() => {
    const done = monthRequests.filter((r) => r.status === "처리완료" && r.doneDate);
    const avg = done.length ? done.reduce((sum, r) => sum + daysBetween(r.date, r.doneDate!), 0) / done.length : 0;
    return {
      received: monthRequests.length,
      done: done.length,
      inProgress: monthRequests.filter((r) => r.status !== "처리완료").length,
      avgDays: Math.round(avg * 10) / 10,
    };
  }, [monthRequests]);

  const counts = useMemo(
    () => Object.fromEntries(STATUSES.map((s) => [s, requests.filter((r) => r.status === s).length])) as Record<Status, number>,
    [requests],
  );

  const filtered = requests.filter(
    (r) => (statusFilter === "전체" || r.status === statusFilter) && (typeFilter === "전체" || r.type === typeFilter),
  );
  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const recentDone = requests
    .filter((r) => r.status === "처리완료" && r.doneDate)
    .sort((a, b) => (b.doneDate! > a.doneDate! ? 1 : -1))
    .slice(0, 6);
  const checksNeedAction = state.checks.filter((c) => c.result === "조치 필요").length;

  function updateRequest(id: string, patch: Partial<StoredRequest>) {
    setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }

  function changeStatus(r: Request, status: Status) {
    updateRequest(r.id, { status, doneDate: status === "처리완료" ? today : undefined });
  }

  function addRequest() {
    if (!form.title.trim()) return;
    const no = Math.max(0, ...state.requests.map((r) => r.no)) + 1;
    const created: StoredRequest = {
      id: uid(),
      no,
      date: today,
      dept: form.dept,
      requester: "홍길동",
      type: form.type,
      title: form.title.trim(),
      content: form.content.trim(),
      status: "접수",
      resolution: "",
    };
    setState((s) => ({ ...s, requests: [created, ...s.requests] }));
    setForm({ dept: DEPARTMENTS[0], type: REQUEST_TYPES[0], title: "", content: "" });
    setFormOpen(false);
    setSelectedId(created.id);
    setStatusFilter("전체");
    setTypeFilter("전체");
  }

  function updateCheck(id: string, patch: Partial<CheckItem>) {
    setState((s) => ({ ...s, checks: s.checks.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }

  function resetDemo() {
    setState(INITIAL_STATE);
    setSelectedId(null);
    setFormOpen(false);
    setStatusFilter("전체");
    setTypeFilter("전체");
  }

  return (
    <div className={`${plex.className} min-h-screen text-[17px] leading-[1.55]`} style={{ background: C.bg, color: C.text }}>
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          .report-sheet, .report-sheet * { visibility: visible !important; }
          .report-sheet { position: absolute; inset: 0 auto auto 0; width: 210mm; min-height: 297mm; margin: 0; box-shadow: none !important; border: 0 !important; zoom: 1 !important; }
        }
      `}</style>

      <header className="border-b print:hidden" style={{ borderColor: C.rule }}>
        <div className="mx-auto flex max-w-[1248px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border" style={{ borderColor: C.action, color: C.action }}>
              <ShieldCheck size={18} aria-hidden />
            </span>
            <span>
              <span className="block text-[17px] font-bold leading-[1.35]">가람대학교 홈페이지 유지보수</span>
              <span className="block text-[15px] leading-[1.35]" style={{ color: C.muted }}>
                최근 30일 운영 현황
              </span>
            </span>
          </div>
          <nav className="grid w-full grid-cols-3 gap-1 sm:ml-auto sm:flex sm:w-auto" aria-label="메뉴">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className="relative inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap px-2 text-[15px] font-bold sm:px-4"
                  style={{ color: active ? C.text : C.muted }}
                >
                  <Icon size={16} aria-hidden className="hidden sm:block" />
                  {t.label}
                  {active && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full" style={{ background: C.action }} aria-hidden />}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1248px] px-4 py-6 pb-28 md:px-6">
        {!hydrated ? (
          <p className="py-20 text-center" style={{ color: C.muted }}>
            불러오는 중입니다.
          </p>
        ) : (
          <>
            {tab !== "report" && <HealthBand summary={summary} checksNeedAction={checksNeedAction} now={now} />}

            {tab === "requests" && (
              <section className="soft-in mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="mr-2 text-[22px] font-bold">유지보수 요청 목록</h2>
                    <div className="flex flex-wrap gap-1" role="group" aria-label="처리상태 필터">
                      {(["전체", ...STATUSES] as const).map((s) => {
                        const active = statusFilter === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            aria-pressed={active}
                            className="inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-[15px] font-bold"
                            style={{
                              borderColor: active ? C.action : C.rule,
                              background: active ? C.panel2 : "transparent",
                              color: active ? C.text : C.muted,
                            }}
                          >
                            {s}
                            <span className="tabular-nums">{s === "전체" ? state.requests.length : counts[s]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2">
                      <span className="text-[15px] font-bold" style={{ color: C.muted }}>
                        요청 유형
                      </span>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as RequestType | "전체")}
                        className={`${field} w-40`}
                      >
                        {["전체", ...REQUEST_TYPES].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <button type="button" onClick={() => setFormOpen((v) => !v)} className={`${primaryBtn} ml-auto`}>
                      <Plus size={18} aria-hidden />
                      요청 등록
                    </button>
                  </div>

                  {formOpen && (
                    <form
                      className="mt-4 grid gap-3 rounded-[10px] border p-4 md:grid-cols-2 md:p-5"
                      style={{ background: C.panel, borderColor: C.rule }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        addRequest();
                      }}
                    >
                      <label className="block">
                        <span className="block text-[15px] font-bold">요청 부서</span>
                        <select value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))} className={`${field} mt-1`}>
                          {DEPARTMENTS.map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-[15px] font-bold">요청 유형</span>
                        <select
                          value={form.type}
                          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as RequestType }))}
                          className={`${field} mt-1`}
                        >
                          {REQUEST_TYPES.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block md:col-span-2">
                        <span className="block text-[15px] font-bold">제목</span>
                        <input
                          value={form.title}
                          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                          maxLength={60}
                          className={`${field} mt-1`}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="block text-[15px] font-bold">요청 내용</span>
                        <textarea
                          value={form.content}
                          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                          maxLength={300}
                          rows={3}
                          className={`${field} mt-1 h-auto py-2 leading-[1.5]`}
                        />
                      </label>
                      <div className="flex gap-2 md:col-span-2">
                        <button type="submit" disabled={!form.title.trim()} className={primaryBtn}>
                          등록
                        </button>
                        <button type="button" onClick={() => setFormOpen(false)} className={ghostBtn}>
                          취소
                        </button>
                      </div>
                    </form>
                  )}

                  <ol key={`${statusFilter}-${typeFilter}`} className="soft-in mt-4 space-y-2" aria-label="수정 요청 목록">
                    {filtered.map((r) => {
                      const active = r.id === selectedId;
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(r.id)}
                            aria-pressed={active}
                            className="grid w-full grid-cols-[4px_1fr] overflow-hidden rounded-[10px] border text-left transition-colors motion-reduce:transition-none"
                            style={{ background: active ? C.panel2 : C.panel, borderColor: active ? C.action : C.rule }}
                          >
                            <span aria-hidden style={{ background: statusStyle[r.status].color }} />
                            <span className="grid gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
                              <span className="text-[15px] font-bold tabular-nums" style={{ color: C.muted }}>
                                {r.no}번
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[17px] font-bold">{r.title}</span>
                                <span className="block text-[15px]" style={{ color: C.muted }}>
                                  {r.dept} {maskName(r.requester)}, {r.type}, 접수일 {shortDate(r.date)}
                                </span>
                              </span>
                              <StatusMark status={r.status} />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  {filtered.length === 0 && (
                    <p key={`${statusFilter}-${typeFilter}`} className="soft-in mt-4 rounded-[10px] border border-dashed px-4 py-10 text-center" style={{ borderColor: C.rule, color: C.muted }}>
                      검색된 요청이 없습니다.
                    </p>
                  )}
                </div>

                <aside className="h-fit rounded-[10px] border p-5 lg:sticky lg:top-6" style={{ background: C.panel, borderColor: C.rule }}>
                  {selected ? (
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
                            요청번호 {selected.no}, {selected.dept} {maskName(selected.requester)}
                          </p>
                          <h3 className="mt-1 text-[19px] font-bold leading-[1.4]">{selected.title}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          aria-label="상세 닫기"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-[#1b3450]"
                        >
                          <X size={18} aria-hidden />
                        </button>
                      </div>
                      <dl className="mt-4 grid grid-cols-[72px_1fr] gap-x-3 gap-y-2 text-[15px]">
                        <dt style={{ color: C.muted }}>접수일</dt>
                        <dd className="tabular-nums">{formatDate(selected.date)}</dd>
                        <dt style={{ color: C.muted }}>요청 유형</dt>
                        <dd>{selected.type}</dd>
                        <dt style={{ color: C.muted }}>처리상태</dt>
                        <dd>
                          <StatusMark status={selected.status} />
                        </dd>
                        {selected.doneDate && (
                          <>
                            <dt style={{ color: C.muted }}>처리완료일</dt>
                            <dd className="tabular-nums">{formatDate(selected.doneDate)}</dd>
                          </>
                        )}
                      </dl>
                      <p className="mt-4 text-[15px] font-bold">요청 내용</p>
                      <p className="mt-1 rounded-md px-3 py-2" style={{ background: C.bg }}>
                        {selected.content || "내용 없음"}
                      </p>
                      <label className="mt-4 block text-[15px] font-bold" htmlFor="resolution">
                        처리 내용
                      </label>
                      <textarea
                        id="resolution"
                        value={selected.resolution}
                        onChange={(e) => updateRequest(selected.id, { resolution: e.target.value })}
                        maxLength={300}
                        rows={3}
                        className={`${field} mt-1 h-auto py-2 leading-[1.5]`}
                      />
                      <p className="mt-4 text-[15px] font-bold">처리상태 변경</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {STATUSES.map((s) => {
                          const on = selected.status === s;
                          const Icon = statusStyle[s].icon;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => changeStatus(selected, s)}
                              aria-pressed={on}
                              className="inline-flex h-12 items-center justify-center gap-1 rounded-md border text-[15px] font-bold"
                              style={{
                                borderColor: on ? statusStyle[s].color : C.rule,
                                color: on ? statusStyle[s].color : C.muted,
                                background: on ? C.bg : "transparent",
                              }}
                            >
                              <Icon size={15} aria-hidden />
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-[19px] font-bold">최근 처리 내역</h3>
                      <ol className="mt-4">
                        {recentDone.map((r, i) => {
                          const days = daysBetween(r.date, r.doneDate!);
                          return (
                            <li key={r.id} className="grid grid-cols-[52px_1fr] gap-3">
                              <span className="text-[15px] tabular-nums" style={{ color: C.muted }}>
                                {shortDate(r.doneDate!)}
                              </span>
                              <span
                                className="relative border-l pb-4 pl-4"
                                style={{ borderColor: i === recentDone.length - 1 ? "transparent" : C.rule }}
                              >
                                <span
                                  className="absolute -left-[6px] top-[7px] h-[11px] w-[11px] rounded-full border-2"
                                  style={{ borderColor: statusStyle["처리완료"].color, background: C.panel }}
                                  aria-hidden
                                />
                                <span className="block text-[15px] font-bold">{r.title}</span>
                                <span className="block text-[15px]" style={{ color: C.muted }}>
                                  {r.dept}, {days ? `처리기간 ${days}일` : "당일 처리"}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </aside>
              </section>
            )}

            {tab === "checks" && (
              <section className="soft-in mt-8">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-[22px] font-bold">정기점검</h2>
                  <p className="text-[15px]" style={{ color: C.muted }}>
                    점검일 {formatDate(today)}
                  </p>
                </div>
                <ul className="mt-4 overflow-hidden rounded-[10px] border" style={{ borderColor: C.rule }}>
                  {state.checks.map((c, i) => (
                    <li
                      key={c.id}
                      className="grid gap-3 p-4 md:grid-cols-[200px_240px_1fr] md:items-center md:px-5"
                      style={{ background: C.panel, borderTop: i ? `1px solid ${C.rule}` : undefined }}
                    >
                      <p className="font-bold">{c.label}</p>
                      <div className="flex gap-2" role="radiogroup" aria-label={`${c.label} 점검결과`}>
                        {(["정상", "조치 필요"] as CheckResult[]).map((v) => {
                          const active = c.result === v;
                          const Icon = v === "정상" ? CheckCircle2 : TriangleAlert;
                          const color = v === "정상" ? "#66d6a8" : "#ff9a84";
                          return (
                            <button
                              key={v}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => updateCheck(c.id, { result: v })}
                              className="inline-flex h-12 flex-1 items-center justify-center gap-1 rounded-md border text-[15px] font-bold"
                              style={{
                                borderColor: active ? color : C.rule,
                                color: active ? color : C.muted,
                                background: active ? C.bg : "transparent",
                              }}
                            >
                              <Icon size={16} aria-hidden />
                              {v}
                            </button>
                          );
                        })}
                      </div>
                      <label className="block">
                        <span className="sr-only">{c.label} 비고</span>
                        <input
                          value={c.note}
                          onChange={(e) => updateCheck(c.id, { note: e.target.value })}
                          maxLength={60}
                          placeholder="비고"
                          className={field}
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tab === "report" && (
              <section className="soft-in">
                <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
                  <h2 className="text-[22px] font-bold">월간 점검 보고서</h2>
                  <button type="button" onClick={() => window.print()} className={`${primaryBtn} ml-auto`}>
                    <Printer size={18} aria-hidden />
                    인쇄·PDF 저장
                  </button>
                </div>
                <div className="mx-auto w-full max-w-[794px] [container-type:inline-size]">
                  <div className="[zoom:min(1,calc(100cqw/794px))]">
                    <ReportSheet requests={monthRequests} checks={state.checks} summary={summary} now={now} />
                  </div>
                </div>
              </section>
            )}

            <div className="mt-8 flex justify-end print:hidden">
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex h-10 items-center gap-1 text-[15px] font-bold underline underline-offset-4"
                style={{ color: C.action }}
              >
                <RotateCcw size={14} aria-hidden />
                초기화
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/** 상단 운영 상태 띠. 30일 가동 기록과 핵심 지표 */
function HealthBand({
  summary,
  checksNeedAction,
  now,
}: {
  summary: { received: number; done: number; inProgress: number; avgDays: number };
  checksNeedAction: number;
  now: Date;
}) {
  const day = (ago: number) => fmtDash(daysAgo(now, ago));
  const start = day(PERIOD_DAYS - 1);
  const delay = day(DELAY_AGO);
  const todayLabel = shortDate(day(0));
  const avgUptime = (UPTIME.reduce((a, b) => a + b, 0) / UPTIME.length).toFixed(2);
  const indicators = [
    { icon: Server, label: "서버", value: "정상", sub: `가동률 ${avgUptime}%`, warn: false },
    { icon: KeyRound, label: "SSL 인증서", value: `만료 ${SSL_LEFT}일 전`, sub: `${formatDate(day(-SSL_LEFT))} 만료`, warn: false },
    { icon: Archive, label: "백업", value: "30회 성공", sub: `최종 ${todayLabel} 03:00`, warn: false },
    {
      icon: checksNeedAction ? TriangleAlert : CheckCircle2,
      label: "정기점검",
      value: checksNeedAction ? `조치 필요 ${checksNeedAction}건` : "전체 정상",
      sub: `${todayLabel} 점검`,
      warn: checksNeedAction > 0,
    },
  ];

  return (
    <section aria-label="운영 상태" className="rounded-[10px] border p-5 md:p-6" style={{ background: C.panel, borderColor: C.rule }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[15px]" style={{ color: C.muted }}>
            최근 30일 가동률
          </p>
          <p className="mt-1 flex items-center gap-3 text-[30px] font-bold leading-[1.2] tabular-nums md:text-[36px]">
            <span className="relative flex h-3 w-3" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d6a8] opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#66d6a8]" />
            </span>
            {avgUptime}%
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-[15px] tabular-nums sm:flex sm:gap-6">
          <div className="flex gap-2">
            <dt style={{ color: C.muted }}>접수</dt>
            <dd className="font-bold">{summary.received}건</dd>
          </div>
          <div className="flex gap-2">
            <dt style={{ color: C.muted }}>처리완료</dt>
            <dd className="font-bold">{summary.done}건</dd>
          </div>
          <div className="flex gap-2">
            <dt style={{ color: C.muted }}>처리중</dt>
            <dd className="font-bold">{summary.inProgress}건</dd>
          </div>
          <div className="flex gap-2">
            <dt style={{ color: C.muted }}>평균 처리기간</dt>
            <dd className="font-bold">{summary.avgDays}일</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4">
        <div className="flex h-10 gap-[2px]" role="img" aria-label={`${koDate(start)}부터 ${koDate(day(0))}까지 일별 가동 기록. ${koDate(delay)}에 12분 지연, 나머지 정상`}>
          {UPTIME.map((u, i) => (
            <span
              key={i}
              title={`${koDate(day(PERIOD_DAYS - 1 - i))} 가동률 ${u}%`}
              className="flex-1 rounded-[2px]"
              style={{ background: u === 100 ? "#3c9f7d" : "#f3b847" }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-[15px] tabular-nums" style={{ color: C.muted }}>
          <span>{shortDate(start)}</span>
          <span className="inline-flex items-center gap-1" style={{ color: "#f3b847" }}>
            <TriangleAlert size={14} aria-hidden />
            {shortDate(delay)} 12분 지연
          </span>
          <span>{todayLabel}</span>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-md min-[420px]:grid-cols-2 lg:grid-cols-4" style={{ background: C.rule }}>
        {indicators.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex gap-3 px-4 py-3" style={{ background: C.bg }}>
              <Icon size={18} aria-hidden className="mt-1 shrink-0" style={{ color: it.warn ? "#ff9a84" : C.action }} />
              <div className="min-w-0">
                <p className="text-[15px]" style={{ color: C.muted }}>
                  {it.label}
                </p>
                <p className="text-[17px] font-bold" style={{ color: it.warn ? "#ff9a84" : C.text }}>
                  {it.value}
                </p>
                <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
                  {it.sub}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ReportSheet({
  requests,
  checks,
  summary,
  now,
}: {
  requests: Request[];
  checks: CheckItem[];
  summary: { received: number; done: number; inProgress: number; avgDays: number };
  now: Date;
}) {
  const period = `${formatDate(fmtDash(daysAgo(now, PERIOD_DAYS - 1)))} ~ ${formatDate(fmtDash(now))}`;
  const byType = REQUEST_TYPES.map((t) => ({ type: t, count: requests.filter((r) => r.type === t).length }));
  const max = Math.max(1, ...byType.map((b) => b.count));
  const open = requests.filter((r) => r.status !== "처리완료");
  const needAction = checks.filter((c) => c.result === "조치 필요");

  return (
    <article className="report-sheet flex min-h-[1123px] w-[794px] flex-col bg-white px-[56px] py-[52px] text-[#1e2124] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
      <header className="flex items-end justify-between border-b-2 border-[#1e2124] pb-4">
        <div>
          <p className="text-[15px] text-[#464c53]">가람대학교 홈페이지</p>
          <h1 className="text-[28px] font-bold leading-[1.4]">월간 유지보수 점검 보고서</h1>
        </div>
        <p className="text-right text-[15px] leading-[1.5] text-[#464c53]">
          점검 기간
          <br />
          {period}
        </p>
      </header>

      <section className="mt-6">
        <h2 className="text-[17px] font-bold">1. 처리 현황</h2>
        <dl className="mt-3 grid grid-cols-4 gap-3 text-center">
          {[
            ["접수", `${summary.received}건`],
            ["처리완료", `${summary.done}건`],
            ["처리중", `${summary.inProgress}건`],
            ["평균 처리기간", `${summary.avgDays}일`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[10px] bg-[#f4f5f6] py-3">
              <dt className="text-[13px] text-[#58616a]">{label}</dt>
              <dd className="text-[22px] font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="text-[17px] font-bold">2. 유형별 처리 건수</h2>
        <ul className="mt-3 space-y-[2px]">
          {byType.map((b) => (
            <li key={b.type} className="grid grid-cols-[100px_1fr_48px] items-center gap-3 py-1 text-[15px]">
              <span>{b.type}</span>
              <span className="h-4 rounded-r-[4px] bg-[#256ef4]" style={{ width: `${(b.count / max) * 100}%`, minWidth: b.count ? 4 : 0 }} />
              <span className="text-right font-bold tabular-nums">{b.count}건</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-[17px] font-bold">3. 정기점검 결과</h2>
        <table className="mt-3 w-full text-[15px]">
          <thead>
            <tr className="border-b border-[#1e2124] text-left">
              <th scope="col" className="py-2 font-bold">
                점검항목
              </th>
              <th scope="col" className="py-2 font-bold">
                점검결과
              </th>
              <th scope="col" className="py-2 font-bold">
                비고
              </th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.id} className="border-b border-[#e6e8ea]">
                <td className="py-2">{c.label}</td>
                <td className={`py-2 font-bold ${c.result === "정상" ? "text-[#1a6a2c]" : "text-[#bd2c0f]"}`}>{c.result}</td>
                <td className="py-2 text-[#464c53]">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6">
        <h2 className="text-[17px] font-bold">4. 주요 처리 내역</h2>
        <ul className="mt-3 space-y-1 text-[15px]">
          {requests
            .filter((r) => r.status === "처리완료")
            .slice(0, 6)
            .map((r) => (
              <li key={r.id} className="grid grid-cols-[88px_1fr] gap-3">
                <span className="tabular-nums text-[#58616a]">{shortDate(r.doneDate ?? r.date)}</span>
                <span>
                  {r.dept}, {r.title}
                </span>
              </li>
            ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-[17px] font-bold">5. 익월 계획</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px]">
          {open.map((r) => (
            <li key={r.id}>
              {r.title} ({r.status})
            </li>
          ))}
          {needAction.map((c) => (
            <li key={c.id}>
              {c.label}: {c.note}
            </li>
          ))}
          <li>정기 백업 및 보안 패치 점검</li>
        </ul>
      </section>

      <footer className="mt-auto flex justify-between border-t border-[#cdd1d5] pt-3 text-[13px] text-[#58616a]">
        <span>작성: 유지보수 담당</span>
        <span>가람대학교 정보전산원 제출용</span>
      </footer>
    </article>
  );
}
