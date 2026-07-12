"use client";

import { useState } from "react";
import {
  Bell,
  FileText,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  RotateCcw,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEY = "gs-demo:admin:v1";

type OrderStatus = "접수" | "처리중" | "완료";

const seedOrders = [
  { id: "A-1041", customer: "김○○", type: "홈페이지 제작", date: "07-11", status: "접수" as OrderStatus },
  { id: "A-1040", customer: "박○○", type: "랜딩페이지", date: "07-11", status: "접수" as OrderStatus },
  { id: "A-1039", customer: "이○○", type: "유지보수", date: "07-10", status: "처리중" as OrderStatus },
  { id: "A-1038", customer: "최○○", type: "기능 추가", date: "07-10", status: "접수" as OrderStatus },
  { id: "A-1037", customer: "정○○", type: "홈페이지 제작", date: "07-09", status: "처리중" as OrderStatus },
  { id: "A-1036", customer: "한○○", type: "예약 시스템", date: "07-09", status: "완료" as OrderStatus },
  { id: "A-1035", customer: "오○○", type: "랜딩페이지", date: "07-08", status: "완료" as OrderStatus },
  { id: "A-1034", customer: "윤○○", type: "유지보수", date: "07-08", status: "완료" as OrderStatus },
  { id: "A-1033", customer: "임○○", type: "홈페이지 제작", date: "07-07", status: "완료" as OrderStatus },
  { id: "A-1032", customer: "강○○", type: "기능 추가", date: "07-07", status: "완료" as OrderStatus },
];

// 요일별 신청 건수 (고정 샘플 데이터)
const weeklyData = [
  { day: "월", count: 3 },
  { day: "화", count: 5 },
  { day: "수", count: 2 },
  { day: "목", count: 6 },
  { day: "금", count: 4 },
  { day: "토", count: 1 },
  { day: "일", count: 2 },
];

const sidebarMenu = [
  { icon: LayoutDashboard, label: "대시보드", active: true },
  { icon: Inbox, label: "신청 관리", active: false },
  { icon: Users, label: "회원", active: false },
  { icon: FileText, label: "게시판", active: false },
  { icon: FolderOpen, label: "파일", active: false },
  { icon: Settings, label: "설정", active: false },
];

const statusStyle: Record<OrderStatus, string> = {
  접수: "bg-slate-700/60 text-slate-300",
  처리중: "bg-amber-500/15 text-amber-400",
  완료: "bg-emerald-500/15 text-emerald-400",
};

interface AdminState {
  statusById: Record<string, OrderStatus>;
}

export function AdminDemo() {
  const [state, setState] = useLocalStorage<AdminState>(STORAGE_KEY, {
    statusById: {},
  });
  const [query, setQuery] = useState("");

  const orders = seedOrders.map((o) => ({
    ...o,
    status: state.statusById[o.id] ?? o.status,
  }));

  const filtered = orders.filter(
    (o) =>
      o.customer.includes(query.trim()) ||
      o.type.includes(query.trim()) ||
      o.id.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const counts = {
    total: orders.length,
    접수: orders.filter((o) => o.status === "접수").length,
    처리중: orders.filter((o) => o.status === "처리중").length,
    완료: orders.filter((o) => o.status === "완료").length,
  };

  const changedCount = Object.keys(state.statusById).length;
  const maxCount = Math.max(...weeklyData.map((d) => d.count));

  const setStatus = (id: string, status: OrderStatus) => {
    setState((prev) => ({
      statusById: { ...prev.statusById, [id]: status },
    }));
  };

  const resetChanges = () => {
    setState({ statusById: {} });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200">
      {/* 사이드바 */}
      <aside className="hidden w-52 shrink-0 border-r border-slate-800/80 bg-slate-900/50 lg:block">
        <div className="px-5 py-6">
          <p className="text-sm font-bold tracking-tight text-slate-100">
            곰선임<span className="text-indigo-400"> Admin</span>
          </p>
        </div>
        <nav className="space-y-0.5 px-3">
          {sidebarMenu.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-indigo-500/15 font-semibold text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon size={16} aria-hidden />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 메인 */}
      <div className="min-w-0 flex-1">
        {/* 톱바 */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/30 px-5 py-3.5">
          <h1 className="text-sm font-semibold text-slate-100 lg:hidden">곰선임 Admin</h1>
          <div className="relative hidden max-w-xs flex-1 lg:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름, 유형, 접수번호 검색"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <Bell size={17} className="text-slate-400" aria-hidden />
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
              곰
            </span>
          </div>
        </header>

        <main className="space-y-5 p-5">
          {/* 스탯 카드 */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {(
              [
                ["전체 신청", counts.total, "text-slate-100"],
                ["접수 대기", counts.접수, "text-slate-100"],
                ["처리중", counts.처리중, "text-amber-400"],
                ["완료", counts.완료, "text-emerald-400"],
              ] as const
            ).map(([label, value, color]) => (
              <div key={label} className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
                <p className="text-xs text-slate-400">{label}</p>
                <p className={`mt-1.5 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            {/* 요일별 신청 차트 */}
            <section className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5">
              <h2 className="text-sm font-semibold text-slate-100">요일별 신청 건수</h2>
              <p className="mt-0.5 text-xs text-slate-500">이번 주 · 샘플 데이터</p>
              <div className="relative mt-5">
                {/* 눈금선 */}
                <div aria-hidden className="absolute inset-x-0 top-0 h-40">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute inset-x-0 border-t border-slate-800/60"
                      style={{ top: `${(i * 100) / 3}%` }}
                    />
                  ))}
                </div>
                <div className="relative flex h-40 items-end justify-between gap-2 px-1">
                  {weeklyData.map(({ day, count }) => (
                    <div key={day} className="group relative flex flex-1 flex-col items-center">
                      {/* 호버 툴팁 */}
                      <span className="pointer-events-none absolute -top-7 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-200 opacity-0 transition-opacity group-hover:opacity-100">
                        {count}건
                      </span>
                      {/* 최대값은 항상 라벨 표시 */}
                      {count === maxCount && (
                        <span className="mb-1 text-xs font-semibold tabular-nums text-slate-300">
                          {count}
                        </span>
                      )}
                      <div
                        className="w-full max-w-7 rounded-t bg-[#6366f1] transition-colors group-hover:bg-indigo-400"
                        style={{ height: `${(count / maxCount) * (count === maxCount ? 136 : 160)}px` }}
                        role="img"
                        aria-label={`${day}요일 ${count}건`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between gap-2 border-t border-slate-700 px-1 pt-2">
                  {weeklyData.map(({ day }) => (
                    <span key={day} className="flex-1 text-center text-xs text-slate-500">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 신청 내역 테이블 */}
            <section className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">신청 내역</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    상태를 변경하면 브라우저에 저장됩니다
                    {changedCount > 0 && ` · ${changedCount}건 변경됨`}
                  </p>
                </div>
                {changedCount > 0 && (
                  <button
                    type="button"
                    onClick={resetChanges}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                  >
                    <RotateCcw size={12} aria-hidden />
                    초기화
                  </button>
                )}
              </div>

              {/* 모바일용 검색 */}
              <div className="relative mt-3 lg:hidden">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="검색"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[26rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-500">
                      <th className="py-2 pr-3 font-medium">접수번호</th>
                      <th className="py-2 pr-3 font-medium">고객</th>
                      <th className="py-2 pr-3 font-medium">유형</th>
                      <th className="py-2 pr-3 font-medium">날짜</th>
                      <th className="py-2 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id} className="border-b border-slate-800/60 last:border-0">
                        <td className="py-2.5 pr-3 font-mono text-xs text-slate-400">{o.id}</td>
                        <td className="py-2.5 pr-3 text-slate-200">{o.customer}</td>
                        <td className="py-2.5 pr-3 text-slate-400">{o.type}</td>
                        <td className="py-2.5 pr-3 tabular-nums text-slate-500">{o.date}</td>
                        <td className="py-2.5">
                          <select
                            value={o.status}
                            onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                            aria-label={`${o.customer} 신청 상태 변경`}
                            className={`cursor-pointer rounded-md border-0 px-2 py-1 text-xs font-semibold outline-none ${statusStyle[o.status]}`}
                          >
                            <option value="접수">접수</option>
                            <option value="처리중">처리중</option>
                            <option value="완료">완료</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                          검색 결과가 없습니다
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="pt-2 text-center text-xs text-slate-600">
            곰선임 데모 사이트 — 모든 데이터는 샘플이며 상태 변경은 내 브라우저에만 저장됩니다.
          </p>
        </main>
      </div>
    </div>
  );
}
