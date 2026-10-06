"use client";

// 바닥글의 관련 사이트(자료실) 목록. 페이지를 옮기거나 바깥을 누르면 닫는다.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { tools } from "@/data/tools";

export function RelatedSites() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <details ref={ref} className="group relative w-full md:w-[220px]">
      <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-md border border-border bg-white px-3 text-foreground-secondary [&::-webkit-details-marker]:hidden">
        관련 사이트
        <ChevronDown size={18} aria-hidden className="transition-transform group-open:rotate-180" />
      </summary>
      <ul className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-[320px] overflow-y-auto rounded-md border border-border bg-white py-1 shadow-lg">
        {tools.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="block px-3 py-2 text-foreground-secondary hover:bg-surface hover:text-foreground">
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
