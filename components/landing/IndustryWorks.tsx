import Image from "next/image";
import Link from "next/link";
import { industries } from "@/data/industries";
import { projects } from "@/data/projects";
import { fieldsById } from "@/data/workFilters";

// 첫 화면 제작 사례는 업종 카드 6장으로 보여 주고, 누르면 업종 페이지(/works/[slug])로 간다.
// 카드 사진은 public/images/industry/sm/{slug}.jpg (720x450, 16:10으로 잘라 품질 80).
const cards = industries.map((ind) => ({
  ind,
  total: projects.filter((p) => (fieldsById[p.id] ?? []).includes(ind.field)).length,
}));

export function IndustryWorks() {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {cards.map(({ ind, total }) => (
        <li key={ind.slug}>
          <Link
            href={`/works/${ind.slug}`}
            data-gtm-cta={`works_industry_${ind.slug}`}
            className="group block h-full overflow-hidden rounded-[10px] border border-border bg-white transition-colors hover:border-accent"
          >
            <Image
              src={`/images/industry/sm/${ind.slug}.jpg`}
              alt={ind.imageAlt}
              width={720}
              height={450}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-5">
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-[19px] font-bold leading-[1.4] group-hover:text-accent">{ind.label}</span>
                <span className="shrink-0 text-[15px] tabular-nums text-foreground-secondary">사례 {total}건</span>
              </p>
              <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary md:text-[16px]">{ind.needs.slice(0, 3).join(" · ")}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
