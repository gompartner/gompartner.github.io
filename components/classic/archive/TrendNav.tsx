import Link from "next/link";
import { relatedOf, topicOf } from "@/data/classic/archive";

// 관련 문서(11-21 컨플루언스식): 같은 주제의 다른 문서. 번호, 이전, 다음 없이 독립 문서끼리 잇는다
export function TrendNav({ current }: { current: string }) {
  const topic = topicOf(current);
  const list = relatedOf(current);
  if (!topic || !list.length) return null;
  return (
    <nav id="rel" aria-label="관련 문서" className="mt-12 anchor-24">
      <h2 className="border-b border-[#e6e9ee] pb-2 text-[22px] font-[800] tracking-[-0.035em] md:text-[24px]">관련 문서</h2>
      <ul role="list" className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {list.map((d) => (
          <li key={d.href}>
            <Link href={d.href!} className="block rounded-lg border border-[#d9dee5] px-4 py-3 hover:border-[#256ef4]">
              <span className="block text-[15px] font-bold leading-[1.45] text-[#15171c]">{d.label}</span>
              <span className="mt-0.5 block text-[12.5px] text-[#5b6370]">{topic.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
