import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClassicShell } from "@/components/classic/ClassicShell";
import { PageHead, wrap } from "@/components/classic/ui";

// 없는 주소로 들어왔을 때(11-01 클래식 틀로 새로). 일반 회사 홈페이지처럼 짧은 안내와 주요 메뉴만 둔다.
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: true },
};

const pages = [
  { href: "/", label: "첫 화면" },
  { href: "/classic/homepage", label: "홈페이지 제작" },
  { href: "/classic/maintenance", label: "유지보수" },
  { href: "/classic/works", label: "카탈로그" },
  { href: "/classic/faq", label: "자주 묻는 질문" },
  { href: "/classic/contact", label: "상담 신청" },
];

export default function NotFound() {
  return (
    <ClassicShell>
      <PageHead title="페이지를 찾을 수 없습니다" />
      <section className={`${wrap} py-14 md:py-20`}>
        <p className="text-[15px] font-bold tabular-nums text-[#256ef4]">404</p>
        <p className="mt-2 text-[17px] text-[#3d4450] md:text-[18px]">주소가 바뀌었거나 삭제된 페이지입니다.</p>
        <ul className="mt-10 grid gap-3 border-t-2 border-[#15171c] pt-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {pages.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="group flex h-14 items-center justify-between rounded-md border border-[#d9dee5] bg-white px-5 text-[17px] font-bold transition-colors hover:border-[#256ef4] hover:text-[#256ef4]">
                {p.label}
                <ArrowUpRight size={20} aria-hidden className="text-[#6b7280] group-hover:text-[#256ef4]" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ClassicShell>
  );
}
