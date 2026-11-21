import Link from "next/link";
import { designDocs, techDocs } from "@/data/classic/archive";

// 같은 분류의 다른 문서(11-21). 번호, 이전, 다음 없이 독립 문서끼리 나란히 잇는다(사용자: 시리즈 금지)
export function TrendNav({ current }: { current: string }) {
  const isDesign = designDocs.some((d) => d.href === current);
  const list = (isDesign ? designDocs : techDocs).filter((d) => d.href !== current);
  const other = isDesign ? { href: "/archive/tech", label: "기술 트렌드 보기" } : { href: "/archive/design", label: "디자인 트렌드 보기" };
  return (
    <nav aria-label="같은 분류의 다른 문서" className="mt-12 border-t border-[#e6e9ee] pt-6">
      <p className="text-[14px] font-[800] text-[#5b6370]">{isDesign ? "디자인 트렌드" : "기술 트렌드"}의 다른 문서</p>
      <ul role="list" className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {list.map((d) => (
          <li key={d.href}>
            <Link href={d.href} className="block rounded-lg border border-[#d9dee5] px-4 py-3 text-[15px] font-bold leading-[1.45] hover:border-[#256ef4] hover:text-[#256ef4]">
              {d.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[14px]">
        <Link href={other.href} className="font-bold text-[#256ef4] hover:underline underline-offset-4">{other.label}</Link>
      </p>
    </nav>
  );
}
