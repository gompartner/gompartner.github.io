"use client";

// 11-04 인사이트 목록: 곰파트너 글과 채널 글(네이버 블로그, 티스토리, 유튜브)을 한 목록에 섞는다.
// 채널 글은 출처 이름표와 새 창 아이콘을 달고 새 창으로 연다. 위 칸에서 출처별로 골라 본다.
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { ChannelIcon, type ChannelIconName } from "@/components/layout/Footer";

export type InsightRow =
  | { kind: "own"; key: string; href: string; title: string; summary: string; badge: string; minutes: number; image: string; date: string }
  | { kind: "naver" | "tistory" | "youtube"; key: string; href: string; title: string; summary: string; badge: string; image?: string; date: string };

const FILTERS: { id: "all" | InsightRow["kind"]; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "own", label: "곰파트너" },
  { id: "naver", label: "네이버 블로그" },
  { id: "tistory", label: "티스토리" },
  { id: "youtube", label: "유튜브" },
];
const ICON: Record<"naver" | "tistory" | "youtube", ChannelIconName> = { naver: "naverBlog", tistory: "tistory", youtube: "youtube" };

export function InsightList({ rows }: { rows: InsightRow[] }) {
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("all");
  const list = f === "all" ? rows : rows.filter((r) => r.kind === f);
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="출처">
        {FILTERS.filter((x) => x.id === "all" || rows.some((r) => r.kind === x.id)).map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={f === x.id}
            onClick={() => setF(x.id)}
            className={`min-h-10 rounded-md border px-4 text-[15px] font-bold transition-colors ${f === x.id ? "border-[#15171c] bg-[#15171c] text-white" : "border-[#d9dee5] bg-white text-[#464c53] hover:border-[#15171c]"}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-[15px] text-[#5b6370]">
        전체 <span className="font-bold tabular-nums text-[#15171c]">{list.length}</span>건
      </p>
      <ul className="border-t-2 border-[#15171c]" role="list">
        {list.map((n) => {
          const ext = n.kind !== "own";
          const body = (
            <>
              <div className="min-w-0 flex-1">
                {ext ? (
                  <span className="inline-flex h-7 items-center gap-1.5 rounded bg-[#f1f3f6] px-2.5 text-[13px] font-bold text-[#464c53]">
                    <span className="[&_svg]:h-4 [&_svg]:w-4"><ChannelIcon name={ICON[n.kind]} /></span>
                    {n.badge}
                  </span>
                ) : (
                  <span className="inline-flex h-7 items-center rounded bg-[#eef4ff] px-2.5 text-[13px] font-bold text-[#1d5fd6]">{n.badge}</span>
                )}
                <span className="mt-2.5 block text-[18px] font-[800] leading-[1.45] tracking-[-0.02em] group-hover:text-[#256ef4] group-hover:underline md:text-[22px]">
                  {ext ? (
                    <>
                      {/* 새 창 아이콘이 혼자 다음 줄로 넘어가지 않게 마지막 낱말과 붙인다 */}
                      {n.title.slice(0, n.title.lastIndexOf(" ") + 1)}
                      <span className="whitespace-nowrap">
                        {n.title.slice(n.title.lastIndexOf(" ") + 1)}
                        <ExternalLink size={18} aria-hidden className="ml-1.5 inline-block align-[-2px] text-[#6b7280] group-hover:text-[#256ef4]" />
                      </span>
                      <span className="sr-only">(새 창 열림)</span>
                    </>
                  ) : (
                    n.title
                  )}
                </span>
                {n.summary ? <span className="mt-2 hidden text-[16px] leading-[1.6] text-[#5b6370] md:line-clamp-2">{n.summary}</span> : null}
                {n.kind === "own" ? <span className="mt-2 block text-[14px] tabular-nums text-[#6b7280]">읽는 시간 {n.minutes}분</span> : null}
              </div>
              {n.kind === "own" ? (
                <Image src={n.image} alt={n.title} width={1200} height={675} sizes="(min-width: 768px) 280px, 120px" className="mt-1 w-[120px] shrink-0 rounded-md border border-[#e6e9ee] md:w-[280px]" />
              ) : n.image ? (
                // 바깥 채널 사진은 그 채널 주소 그대로 쓴다(정적 내보내기라 이미지 최적화를 거치지 않음)
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.image} alt="" loading="lazy" referrerPolicy="no-referrer" className={`mt-1 aspect-[16/9] w-[120px] shrink-0 rounded-md border border-[#e6e9ee] md:w-[280px] ${n.kind === "youtube" ? "bg-[#15171c] object-contain" : "object-cover"}`} />
              ) : null}
            </>
          );
          return (
            <li key={n.key} className="border-b border-[#e6e9ee]">
              {ext ? (
                <a href={n.href} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 py-6 md:gap-10 md:py-8">{body}</a>
              ) : (
                <Link href={n.href} className="group flex items-start gap-4 py-6 md:gap-10 md:py-8">{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
