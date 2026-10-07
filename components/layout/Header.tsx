"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { profile } from "@/data/profile";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

// 메뉴는 포트폴리오·자료실 페이지와 첫 화면의 섹션으로 이동한다
const navItems = [
  { href: "/works", label: "포트폴리오" },
  { href: "/#pricing", label: "가격" },
  { href: "/#history", label: "작업 이력" },
  { href: "/tools", label: "자료실" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotionSafe();

  // 다른 페이지로 이동하면 모바일 메뉴를 닫는다
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    // 새로고침 시 브라우저가 스크롤 위치를 복원해도 scroll 이벤트는 발생하지
    // 않으므로, 마운트 직후 현재 위치를 한 번 반영한다
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b bg-background transition-colors duration-200",
        isScrolled || menuOpen ? "border-border" : "border-transparent"
      )}
    >
      <nav
        className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-4 px-4 md:px-6"
        aria-label="주 메뉴"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[19px] font-bold text-foreground"
          aria-label="맨 위로 이동"
        >
          <Image src="/images/logo.svg" alt="" width={26} height={26} className="h-[26px] w-[26px]" preload />
          {profile.name}
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden items-center gap-1 md:flex" role="list">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex h-10 items-center rounded-md px-3 text-[17px] text-foreground-secondary transition-colors hover:bg-surface hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ChannelTalkButton
            cta="header_chat"
            className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            채팅 상담
          </ChannelTalkButton>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-surface md:hidden"
          >
            <span className={cn("inline-flex transition-transform duration-200 motion-reduce:transition-none", menuOpen && "rotate-90")}>
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="overflow-hidden border-t border-border bg-background md:hidden"
            initial={reduce ? { opacity: 0 } : { height: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <ul className="mx-auto w-full max-w-[1248px] px-4 py-2" role="list">
              {navItems.map(({ href, label }) => (
                <li key={href} className="border-b border-border last:border-b-0">
                  <Link href={href} onClick={() => setMenuOpen(false)} className="flex h-12 items-center text-[17px] text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
