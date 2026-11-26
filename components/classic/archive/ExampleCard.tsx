import type { Example } from "@/data/classic/trendData";

// 실제 사례 칸(11-21): 보관본에서 직접 확인한 문구. 링크가 죽으면 alive=false로 "보관본 확인 불가".
// 11-26 칸마다 붙던 인터넷 아카이브 링크는 문서 맨 아래 참고 자료로 모았다(이 칸을 쓰는 문서는 sources에 보관본 주소를 넣는다).
export function ExampleCard({ ex }: { ex: Example }) {
  return (
    <div className="mt-3 border-t border-[#d9dee5] pt-2.5">
      <p className="text-[12.5px] font-bold text-[#5b6370]">실제 사례</p>
      <p className="mt-0.5 text-[14.5px] font-bold">{ex.site}</p>
      <p className="text-[13px] tabular-nums text-[#5b6370]">{ex.date} 화면</p>
      <p className="mt-1 text-[13.5px] leading-[1.6] text-[#3d4450]">{ex.seen}</p>
      {ex.alive ? null : <p className="mt-1.5 text-[12.5px] text-[#6b7380]">보관본 확인 불가({ex.checked} 확인)</p>}
    </div>
  );
}
