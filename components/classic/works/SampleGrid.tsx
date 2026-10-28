import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { priceLine, slugOf, thumbOf } from "./samples";

// 샘플 카드 격자. 홈 화면 샘플 목록과 같은 모양(썸네일 선 하나, 그림자 없음).
export function SampleGrid({ items, cols = 4 }: { items: Project[]; cols?: 3 | 4 }) {
  return (
    <ul className={`grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 ${cols === 4 ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3"}`} role="list">
      {items.map((p) => (
        <li key={p.id} className="min-w-0">
          <Link href={`/classic/sample/${slugOf(p.demoUrl)}`} className="group block">
            <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-white">
              <Image
                src={thumbOf(p)}
                alt={p.imageAlt}
                width={720}
                height={450}
                sizes="(min-width: 1024px) 290px, (min-width: 768px) 33vw, 45vw"
                className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
              />
            </span>
            <span className="mt-3 block text-[13px] font-bold text-[#1d5fd6] md:text-[14px]">{p.category}</span>
            <span className="mt-1 block break-keep text-[16px] font-bold leading-[1.4] tracking-[-0.02em] group-hover:underline md:text-[18px]">{p.title}</span>
            <span className="mt-1 block text-[14px] tabular-nums text-[#5b6370] md:text-[15px]">{priceLine(p)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
