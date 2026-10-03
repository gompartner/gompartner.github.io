import type { Metadata } from "next";
import Link from "next/link";
import { WorksSearch } from "@/components/landing/WorksSearch";
import { industries } from "@/data/industries";
import { projects } from "@/data/projects";
import { fieldsById } from "@/data/workFilters";

export const metadata: Metadata = {
  title: "제작 사례",
  description: `병원, 약국, 카페, 공공기관 홈페이지와 업무 프로그램 제작 사례 ${projects.length}건입니다. 모든 사례를 데모로 직접 눌러 볼 수 있습니다.`,
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">제작 사례</h1>
      <p className="mt-2 text-[17px] leading-[1.6] text-foreground-secondary">고객 정보 보호를 위해 기관명과 데이터는 가상으로 재구성했습니다.</p>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label="업종별 제작 사례">
        {industries.map((ind) => (
          <li key={ind.slug}>
            <Link
              href={`/works/${ind.slug}`}
              className="inline-flex h-10 items-center rounded-full border border-border px-4 text-[15px] font-bold transition-colors hover:border-accent hover:bg-accent-surface"
            >
              {ind.label} 홈페이지 ({projects.filter((p) => (fieldsById[p.id] ?? []).includes(ind.field)).length})
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <WorksSearch projects={projects} />
      </div>
    </div>
  );
}
