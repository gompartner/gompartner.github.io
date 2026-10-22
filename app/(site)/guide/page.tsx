import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { guides } from "@/data/guides";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "홈페이지 제작 가이드",
    description: "홈페이지 제작 업체 고르는 법, 제작 비용이 업체마다 다른 이유, 계약 전에 물어볼 것, 유지보수비 시세를 적었어요.",
    path: "/guide",
  }),
};

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-10 md:px-6 md:pt-14">
      <h1 className="text-[32px] leading-[1.25] md:text-[44px]">홈페이지 제작 가이드</h1>
      <ul className="mt-10 grid gap-5 md:grid-cols-2" role="list">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guide/${g.slug}`}
              className="group flex h-full flex-col border-[3px] border-[#1d1d1f] bg-white p-5 shadow-[5px_5px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fff3b0] hover:shadow-[7px_7px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none md:p-7"
            >
              <h2 className="text-[20px] font-bold leading-[1.45] md:text-[22px]">{g.title}</h2>
              <p className="mt-2 flex-1 text-[16px] leading-[1.65] text-foreground-secondary">{g.description}</p>
              <span aria-hidden className="mt-4 grid h-9 w-9 place-items-center self-end rounded-full border-[2.5px] border-[#1d1d1f] bg-accent text-white">
                <ArrowRight size={18} strokeWidth={3} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
