"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 11-08 공지 분류(사용자: 공지가 계속 늘어난다). 전체, 안내, 이벤트 탭으로 거른다.
// 정적 내보내기라 분류는 화면에서 거르고, 주소 ?c=event 로 이벤트 탭을 바로 열 수 있게 한다.
// 한 쪽에 10건씩 넘겨 본다. 검색은 머리글 통합검색이 공지 본문까지 찾으므로 목록에 따로 두지 않는다(11-08 사용자).
export type NoticeRow = { id: string; title: string; date: string; status: "진행 중" | "마감" | null };

const PER = 10;

const TABS = [
  { key: "all", label: "전체" },
  { key: "info", label: "안내" },
  { key: "event", label: "이벤트" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const dot = (d: string) => d.replaceAll("-", ".");

export function NoticeList({ rows }: { rows: NoticeRow[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    // 주소의 ?c= 는 브라우저에서만 읽을 수 있어(정적 내보내기) 화면이 뜬 뒤 한 번 맞춘다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c === "event" || c === "info") setTab(c);
  }, []);

  const pick = (t: Tab) => {
    setTab(t);
    setPage(1);
    const url = t === "all" ? window.location.pathname : `${window.location.pathname}?c=${t}`;
    window.history.replaceState(null, "", url);
  };

  const found = rows.filter((r) => (tab === "all" ? true : tab === "event" ? r.status : !r.status));
  const pages = Math.max(1, Math.ceil(found.length / PER));
  const cur = Math.min(page, pages);
  const shown = found.slice((cur - 1) * PER, cur * PER);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {/* 11-26 판의 필터 버튼과 같은 알약 모양 */}
        <div role="group" aria-label="공지 분류" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={tab === t.key}
              onClick={() => pick(t.key)}
              className={`min-h-11 rounded-full border px-5 text-[15px] font-bold transition-colors ${tab === t.key ? "border-transparent bg-[#256ef4] text-white" : "border-white/30 text-white hover:border-white/90"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-[15px] text-[#aab2bf]">
          <span className="font-[800] tabular-nums text-white">{found.length}</span>건
        </p>
      </div>
      <table className="w-full border-collapse border-t border-white/15">
        <caption className="sr-only">공지사항 목록</caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-white/10 text-[14px] text-[#aab2bf]">
            <th scope="col" className="w-20 py-3 font-bold">
              번호
            </th>
            <th scope="col" className="py-3 text-left font-bold">
              제목
            </th>
            <th scope="col" className="w-32 py-3 font-bold">
              날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((n, i) => (
            <tr key={n.id} className="border-b border-white/10">
              <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#8a94a6] md:table-cell">{found.length - (cur - 1) * PER - i}</td>
              <td className="py-5 pr-4 md:pr-6">
                {/* 이벤트 말머리: 이벤트 글만 제목 위에 "이벤트"와 진행 상태 */}
                {n.status && (
                  <p className="mb-1 flex gap-2 text-[14px] font-bold">
                    <span className="text-[#7aa7ff]">이벤트</span>
                    <span className={n.status === "마감" ? "text-[#8a94a6]" : "text-[#ffd84d]"}>{n.status}</span>
                  </p>
                )}
                <Link href={`/notice/${n.id}`} className="break-keep text-[17px] font-[800] leading-[1.45] tracking-[-0.03em] text-white hover:text-[#7aa7ff] md:text-[19px]">
                  {n.title}
                </Link>
                <time dateTime={n.date} className="mt-1 block text-[14px] tabular-nums text-[#8a94a6] md:hidden">
                  {dot(n.date)}
                </time>
              </td>
              <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#8a94a6] md:table-cell">
                <time dateTime={n.date}>{dot(n.date)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {found.length === 0 && <p className="border-b border-white/10 py-12 text-center text-[16px] text-[#aab2bf]">등록된 공지가 없습니다.</p>}
      {pages > 1 && (
        <nav aria-label="공지 목록 쪽" className="mt-8 flex justify-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === cur ? "page" : undefined}
              onClick={() => {
                setPage(n);
                window.scrollTo({ top: 0 });
              }}
              className={`h-11 min-w-11 rounded-full px-3 text-[15px] font-bold tabular-nums ${n === cur ? "bg-[#256ef4] text-white" : "text-[#aab2bf] hover:text-white"}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
