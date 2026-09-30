import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

const secondaryButton =
  "inline-flex h-12 items-center justify-center rounded-md border border-[#6d7882] bg-white px-6 text-[17px] font-bold text-foreground transition-colors hover:bg-surface";

// 신규 제작과 유지보수를 한 목록에 보여 주고, 구분은 썸네일 왼쪽 위 라벨로 표시한다
export function WorksGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((w) => (
        <li key={w.id} className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-white">
          <Link href={w.demoUrl} aria-label={`${w.title} 데모 보기`} className="relative block border-b border-border">
            <Image src={w.imageUrl} alt={w.imageAlt} width={1440} height={900} className="aspect-[16/10] h-auto w-full object-cover object-top" />
            <span
              className={`absolute top-3 left-3 rounded-[4px] px-2 py-0.5 text-[15px] font-bold leading-[1.5] text-white ${
                w.kind === "유지보수" ? "bg-[#464c53]" : "bg-accent"
              }`}
            >
              {w.kind}
            </span>
          </Link>
          <div className="flex flex-1 flex-col p-6">
            <p className="text-[15px] font-bold leading-[1.5] text-accent">{w.category}</p>
            <h3 className="mt-1 text-[19px] font-bold leading-[1.5]">{w.title}</h3>
            <p className="mt-2 text-[17px] leading-[1.5] text-foreground-secondary">{w.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="주요 기능">
              {w.features.map((f) => (
                <li key={f} className="rounded-[4px] bg-surface px-3 py-1 text-[15px] leading-[1.5] text-foreground-secondary">
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <Link href={w.demoUrl} data-gtm-cta={`demo_open_${w.id}`} className={secondaryButton}>
                데모 보기
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
