import { ListScrollMemory } from "@/components/landing/ListScrollMemory";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WorksSearch } from "@/components/landing/WorksSearch";
import { industries } from "@/data/industries";
import { projects } from "@/data/projects";
import { fieldsById } from "@/data/workFilters";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "홈페이지 제작 샘플",
  description: fitDescription(`쇼핑몰, 펜션, 회사, 병원, 학원, 카페, 공공기관 홈페이지와 업무 프로그램 샘플 ${projects.length}개. 샘플을 직접 사용해 보고 비슷하게 만들 때 비용을 확인할 수 있습니다.`),
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">샘플</h1>
      {/* 업종 고르기: 업종마다 컷 하나. 사진 위에 업종 이름 상자, 아래에 샘플 수 */}
      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6" aria-label="업종별 샘플">
        {industries.map((ind, i) => (
          <li key={ind.slug}>
            <Link
              href={`/works/${ind.slug}`}
              className={`group relative block aspect-[4/3] lg:aspect-[4/5] overflow-hidden border-[3px] border-[#1d1d1f] bg-white shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none ${i % 2 ? "rotate-1" : "-rotate-1"}`}
            >
              <Image src={ind.image} alt="" fill sizes="(min-width: 1024px) 200px, (min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute left-2 top-2 border-[2.5px] border-[#1d1d1f] bg-[#fff3b0] px-2 py-0.5 text-[14px] font-bold leading-[1.4] md:text-[15px]">{ind.label}</span>
              <span className="absolute bottom-2 right-2 rounded-full border-[2.5px] border-[#1d1d1f] bg-white px-2.5 py-0.5 text-[13px] font-bold tabular-nums md:text-[14px]">
                샘플 {projects.filter((p) => (fieldsById[p.id] ?? []).includes(ind.field)).length}개
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <WorksSearch projects={projects} />
          <ListScrollMemory />
      </div>
    </div>
  );
}
