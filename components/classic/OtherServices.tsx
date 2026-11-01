import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { h3, wrap } from "@/components/classic/ui";

// 같은 묶음의 다른 서비스 링크. 유지보수 세부 페이지의 "다른 유지보수 서비스"와 같은 모양(11-01 제작 쪽도 맞춤)
export const makeServices = [
  { href: "/classic/homepage", label: "홈페이지 제작" },
  { href: "/classic/landing", label: "랜딩페이지 제작" },
  { href: "/classic/program", label: "업무 프로그램 제작" },
];

export function OtherServices({ current, items = makeServices, title = "다른 제작 서비스", id = "other-services" }: { current: string; items?: { href: string; label: string }[]; title?: string; id?: string }) {
  const others = items.filter((i) => i.href !== current);
  return (
    <section aria-labelledby={id} className="border-t border-[#e6e9ee]">
      <div className={`${wrap} py-12 md:py-16`}>
        <h2 id={id} className={h3}>
          {title}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3" role="list">
          {others.map((o) => (
            <li key={o.href}>
              <Link href={o.href} className="group flex min-h-14 items-center justify-between gap-3 rounded-md border border-[#d9dee5] bg-white px-5 py-3 text-[17px] font-bold transition-colors hover:border-[#256ef4] hover:text-[#256ef4]">
                {o.label}
                <ArrowUpRight size={20} aria-hidden className="shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
