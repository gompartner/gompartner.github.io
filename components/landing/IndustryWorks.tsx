import Image from "next/image";
import Link from "next/link";
import { industries } from "@/data/industries";
import { projects } from "@/data/projects";
import { fieldsById } from "@/data/workFilters";

// 첫 화면 샘플은 업종 카드 6장으로 보여 주고, 누르면 업종 페이지(/works/[slug])로 간다.
// 카드 그림은 업종 대표 샘플의 PC 화면(브라우저 틀)과 휴대폰 화면을 겹친 것. public/images/industry/preview/{slug}.jpg 960x600.
// 대표 샘플: 치과, 베이커리, 법률사무소, 정밀가공 회사, 수학·영어학원, 구청 누리집. 다시 만들 땐 휴대폰 390x844(2배)로 찍고 하단 샘플 바를 피해 위쪽 700px만 쓴다.
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
            className="wt-card group block h-full overflow-hidden rounded-[10px] border border-border bg-white transition-colors hover:border-accent"
          >
            <Image
              src={`/images/industry/preview/${ind.slug}.jpg`}
              alt={`${ind.label} 샘플 PC·휴대폰 화면`}
              width={960}
              height={600}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-5">
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-[19px] font-bold leading-[1.4] group-hover:text-accent">{ind.label}</span>
                <span className="shrink-0 text-[15px] tabular-nums text-foreground-secondary">샘플 {total}개</span>
              </p>
              <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary md:text-[16px]">{ind.needs.slice(0, 3).join(" · ")}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
