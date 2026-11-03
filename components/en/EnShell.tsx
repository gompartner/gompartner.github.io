import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import { profile } from "@/data/classic/profile";
import { enNav } from "@/data/en/site";

// 11-04 영문 페이지 공용 머리글과 바닥글. /en 아래 모든 페이지가 쓴다(app/en/layout.tsx).
export const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
export const h2 = "text-[28px] font-[800] leading-[1.3] tracking-[-0.02em] md:text-[36px]";

export function EnShell({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" className="min-h-screen bg-white text-[#15171c]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#256ef4] focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-[#e6e9ee] bg-white">
        <div className={`${wrap} flex h-16 items-center justify-between gap-4`}>
          <Link href="/en" className="flex shrink-0 items-center gap-2.5 text-[19px] font-[800] tracking-[-0.02em]">
            <Image src="/images/bear-avatar.webp" alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-full object-cover" />
            {profile.nameEn}
          </Link>
          <nav aria-label="Main" className="flex min-w-0 items-center text-[15px] font-bold">
            <ul className="hidden items-center lg:flex" role="list">
              {enNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-flex min-h-11 items-center px-3 hover:text-[#256ef4]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/en#contact" className="ml-2 hidden min-h-11 items-center rounded-md bg-[#256ef4] px-4 text-white hover:bg-[#1a5ad4] sm:inline-flex">
              Contact
            </Link>
            <Link href="/" lang="ko" hrefLang="ko" className="inline-flex min-h-11 items-center gap-1.5 px-3 text-[#5b6370] hover:text-[#15171c]">
              <Globe size={16} strokeWidth={2} aria-hidden />
              한국어
            </Link>
          </nav>
        </div>
        {/* 휴대폰과 태블릿: 메뉴를 가로로 밀어 본다 */}
        <nav aria-label="Main (mobile)" className="border-t border-[#e6e9ee] lg:hidden">
          <ul className={`${wrap} flex gap-5 overflow-x-auto text-[15px] font-bold [scrollbar-width:none]`} role="list">
            {enNav.map((n) => (
              <li key={n.href} className="shrink-0">
                <Link href={n.href} className="block py-3 hover:text-[#256ef4]">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main">{children}</main>

      <footer className="bg-[#15171c] text-[14px] text-[#a3abb8]">
        <div className={`${wrap} grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]`}>
          <div>
            <p className="text-[17px] font-[800] text-white">{profile.nameEn}</p>
            <p className="mt-2">Web development for companies launching in Korea.</p>
            <p className="mt-2">
              <a href={`mailto:${profile.email}`} className="hover:text-white hover:underline">
                {profile.email}
              </a>
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="font-bold text-white">Services</p>
            <ul className="mt-3 space-y-2" role="list">
              {enNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-white hover:underline">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="font-bold text-white">Company</p>
            <p className="mt-3">{profile.nameEn} ({profile.name})</p>
            <p className="mt-1">Business registration no. {profile.bizNo}</p>
            <p className="mt-1">Seoul, Korea</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className={`${wrap} py-5`}>Copyright {new Date().getFullYear()} {profile.nameEn}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
