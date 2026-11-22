import { ArrowUpRight } from "lucide-react";
import type { Example } from "@/data/classic/trendData";

// 실제 사례 칸(11-21): 보관본에서 직접 확인한 문구 + 인터넷 아카이브 링크. 링크가 죽으면 alive=false로 "보관본 확인 불가".
export function ExampleCard({ ex }: { ex: Example }) {
  return (
    <div className="mt-3 rounded-md border border-[#d9dee5] bg-white px-3 py-2.5">
      <p className="text-[12px] font-[800] text-[#1d5fd6]">실제 사례</p>
      <p className="mt-0.5 text-[14px] font-bold">{ex.site}</p>
      <p className="text-[12.5px] tabular-nums text-[#5b6370]">{ex.date} 화면</p>
      <p className="mt-1 text-[13px] leading-[1.55] text-[#3d4450]">{ex.seen}</p>
      {ex.alive ? (
        <a href={ex.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-bold text-[#1d5fd6] hover:underline underline-offset-4">
          보관본 보기(인터넷 아카이브) <ArrowUpRight size={14} aria-hidden />
        </a>
      ) : (
        <p className="mt-1.5 text-[12.5px] text-[#6b7380]">보관본 확인 불가({ex.checked} 확인)</p>
      )}
    </div>
  );
}
