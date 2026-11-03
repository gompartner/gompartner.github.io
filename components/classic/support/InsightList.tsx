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

// 11-04 바깥 채널 썸네일. 틀은 곰파트너 글과 같은 16:9로 두고, 사진 비율이 달라도 잘리거나 빈칸이 생기지 않게 한다.
// 가로형, 세로형 사진: 같은 사진을 흐리게 깔아 틀을 채우고 원래 비율 그대로 위에 올린다.
// 유튜브 쇼츠: hqdefault가 양옆 검은 띠가 붙은 4:3이라 높이를 틀에 맞추면 가운데 세로 화면 폭(높이 x 9/16)이 9:16 칸과 딱 맞는다. 그 칸만 보인다.
// 바깥 주소 사진이라 이미지 최적화(next/image)를 거치지 않는다(정적 내보내기).
function Thumb({ src, shorts }: { src: string; shorts: boolean }) {
  return (
    <span aria-hidden className="relative block aspect-[16/9] md:mt-1 w-[120px] shrink-0 overflow-hidden rounded-md border border-[#e6e9ee] bg-[#15171c] md:w-[280px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-md" />
      {shorts ? (
        <span className="absolute inset-y-0 left-1/2 aspect-[9/16] h-full -translate-x-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute left-1/2 top-1/2 h-full max-w-none -translate-x-1/2 -translate-y-1/2" />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-contain" />
      )}
    </span>
  );
}

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
                <Image src={n.image} alt={n.title} width={1200} height={675} sizes="(min-width: 768px) 280px, 120px" className="w-[120px] shrink-0 rounded-md border border-[#e6e9ee] md:mt-1 md:w-[280px]" />
              ) : n.image ? (
                <Thumb src={n.image} shorts={n.kind === "youtube" && n.href.includes("/shorts/")} />
              ) : null}
            </>
          );
          return (
            <li key={n.key} className="border-b border-[#e6e9ee]">
              {ext ? (
                <a href={n.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-6 md:items-start md:gap-10 md:py-8">{body}</a>
              ) : (
                <Link href={n.href} className="group flex items-center gap-4 py-6 md:items-start md:gap-10 md:py-8">{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
