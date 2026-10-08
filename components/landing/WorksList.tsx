"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { SMALL_IMAGE_HEIGHT, SMALL_IMAGE_WIDTH, smallImage } from "@/lib/images";
import { estimateFor, manwon } from "@/data/pricing";

/** 포트폴리오 목록 보기: 작은 썸네일과 분류·제목·예상 금액을 한 줄씩 */
export function WorksList({ projects }: { projects: Project[] }) {
  return (
    <ul className="soft-in border-t-2 border-foreground">
      {projects.map((w) => {
        const est = estimateFor(w.id);
        return (
          <li key={w.id} className="border-b border-border">
            <Link href={w.demoUrl} prefetch={false} data-gtm-cta={`demo_open_${w.id}`} className="group flex items-center gap-4 py-3 md:gap-6">
              <Image
                src={smallImage(w.imageUrl)}
                alt=""
                width={SMALL_IMAGE_WIDTH}
                height={SMALL_IMAGE_HEIGHT}
                className="aspect-[16/10] h-auto w-24 shrink-0 rounded-[4px] border border-border object-cover object-top md:w-36"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-accent md:text-[15px]">
                  {w.category}·{w.layout}
                  <span className="ml-2 font-normal text-foreground-secondary">{w.kind}</span>
                </p>
                <p className="mt-0.5 truncate text-[17px] font-bold group-hover:text-accent group-hover:underline group-hover:underline-offset-4">{w.title}</p>
              </div>
              <p className="hidden shrink-0 text-right tabular-nums sm:block">
                <span className="block text-[14px] text-foreground-secondary">{est ? "예상 금액" : "업무 프로그램"}</span>
                <span className="text-[17px] font-bold">{est ? manwon(est.total) : "별도 견적"}</span>
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
