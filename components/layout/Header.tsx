"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { profile } from "@/data/profile";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/blog", label: "블로그" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        // backdrop-filter는 고정 헤더 + 배경 애니메이션 조합에서 스크롤 중
        // 깜빡임을 유발해 사용하지 않는다. 거의 불투명한 배경으로 대체.
        "fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 [transform:translateZ(0)]",
        isScrolled
          ? "bg-background/95 border-border shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <nav
        className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between"
        aria-label="메인 네비게이션"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground hover:text-accent transition-colors"
          aria-label="홈으로 이동"
        >
          <Image
            src="/images/logo.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
            preload
          />
          {profile.name}
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navItems.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground bg-surface"
                      : "text-foreground-secondary hover:text-foreground hover:bg-surface"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/contact"
            data-gtm-cta="header_contact"
            className="hidden md:inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all hover:bg-accent-hover active:scale-95"
          >
            상담 문의
          </Link>
          {/* Mobile menu button */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-surface transition-colors"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label={isMobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          role="dialog"
          aria-label="모바일 메뉴"
        >
          <ul className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1" role="list">
            {navItems.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors",
                      isActive
                        ? "text-foreground bg-surface"
                        : "text-foreground-secondary hover:text-foreground hover:bg-surface"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                data-gtm-cta="header_contact_mobile"
                className="flex items-center justify-center rounded-xl bg-accent px-4 py-3 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                상담 문의하기
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
