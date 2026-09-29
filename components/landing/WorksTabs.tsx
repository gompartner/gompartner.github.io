"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";

const KINDS = ["신규 제작", "유지보수"] as const;

const secondaryButton =
  "inline-flex h-12 items-center justify-center rounded-md border border-[#6d7882] bg-white px-6 text-[17px] font-bold text-foreground transition-colors hover:bg-surface";

export function WorksTabs({ projects }: { projects: Project[] }) {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("신규 제작");
  const visible = projects.filter((p) => p.kind === kind);

  return (
    <div>
      <div role="tablist" aria-label="제작 사례 구분" className="inline-flex rounded-md border border-border bg-surface p-1">
        {KINDS.map((k) => {
          const count = projects.filter((p) => p.kind === k).length;
          const active = k === kind;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              id={`tab-${k}`}
              aria-selected={active}
              aria-controls="works-panel"
              onClick={() => setKind(k)}
              className={`h-11 rounded-[4px] px-5 text-[17px] font-bold transition-colors ${
                active ? "bg-white text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.12)]" : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              {k} {count}
            </button>
          );
        })}
      </div>

      <ul id="works-panel" role="tabpanel" aria-labelledby={`tab-${kind}`} className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((w) => (
          <li key={w.id} className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-white">
            <Link href={w.demoUrl} aria-label={`${w.title} 데모 보기`} className="block border-b border-border">
              <Image src={w.imageUrl} alt={w.imageAlt} width={1440} height={900} className="aspect-[16/10] h-auto w-full object-cover object-top" />
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
    </div>
  );
}
