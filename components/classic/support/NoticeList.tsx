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
        {/* 인사이트 출처 버튼과 같은 모양(11-08) */}
        <div role="group" aria-label="공지 분류" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={tab === t.key}
              onClick={() => pick(t.key)}
              className={`min-h-10 rounded-md border px-4 text-[15px] font-bold transition-colors ${tab === t.key ? "border-[#15171c] bg-[#15171c] text-white" : "border-[#d9dee5] bg-white text-[#464c53] hover:border-[#15171c]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-[15px] text-[#5b6370]">
          <span className="font-bold tabular-nums text-[#15171c]">{found.length}</span>건
        </p>
      </div>
      <table className="w-full border-collapse border-t-2 border-[#15171c]">
        <caption className="sr-only">공지사항 목록</caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9] text-[15px] text-[#3d4450]">
            <th scope="col" className="w-20 py-4 font-bold">
              번호
            </th>
            <th scope="col" className="py-4 text-left font-bold">
              제목
            </th>
            <th scope="col" className="w-32 py-4 font-bold">
              날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((n, i) => (
            <tr key={n.id} className="border-b border-[#e6e9ee]">
              <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#6b7280] md:table-cell">{found.length - (cur - 1) * PER - i}</td>
              <td className="py-5 pr-4 md:pr-6">
                {/* 이벤트 말머리: 이벤트 글만 제목 위에 "이벤트"와 진행 상태 */}
                {n.status && (
                  <p className="mb-1 flex gap-2 text-[14px] font-bold">
                    <span className="text-[#256ef4]">이벤트</span>
                    <span className={n.status === "마감" ? "text-[#8a94a6]" : "text-[#15171c]"}>{n.status}</span>
                  </p>
                )}
                <Link href={`/notice/${n.id}`} className="text-[17px] font-bold leading-[1.5] tracking-[-0.02em] hover:text-[#256ef4] hover:underline md:text-[18px]">
                  {n.title}
                </Link>
                <time dateTime={n.date} className="mt-1 block text-[14px] tabular-nums text-[#6b7280] md:hidden">
                  {dot(n.date)}
                </time>
              </td>
              <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#6b7280] md:table-cell">
                <time dateTime={n.date}>{dot(n.date)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {found.length === 0 && <p className="border-b border-[#e6e9ee] py-12 text-center text-[16px] text-[#5b6370]">등록된 공지가 없습니다.</p>}
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
              className={`h-10 min-w-10 rounded-md px-3 text-[15px] font-bold tabular-nums ${n === cur ? "bg-[#15171c] text-white" : "text-[#3d4450] hover:bg-[#f1f4f9]"}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
