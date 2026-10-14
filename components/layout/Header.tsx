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

// 자료실은 바닥글에만 둔다
const navItems = [
  { href: "/works", label: "샘플" },
  { href: "/pricing", label: "가격" },
  { href: "/maintenance", label: "유지보수" },
  { href: "/faq", label: "자주 묻는 질문" },
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
        "fixed top-0 left-0 right-0 z-50 border-b-[3px] border-[#1d1d1f] bg-[#f3ece0] transition-shadow duration-200",
        (isScrolled || menuOpen) && "shadow-[0_3px_0_rgba(29,29,31,.12)]"
      )}
    >
      <nav
        className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-4 px-4 md:px-6"
        aria-label="주 메뉴"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-[family-name:var(--font-sfx)] text-[22px] text-foreground"
          aria-label="맨 위로 이동"
        >
          <Image src="/images/bear-avatar.webp" alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-full border-2 border-[#1d1d1f] bg-[#fffdf8] object-cover" preload />
          {profile.name}
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden items-center gap-1 md:flex" role="list">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn("inline-flex h-10 items-center rounded-[6px] px-3 text-[17px] font-bold transition-colors hover:bg-[#fff3b0]", (pathname.startsWith(href) || (href === "/works" && pathname.startsWith("/sample/"))) ? "text-foreground underline decoration-accent decoration-[3px] underline-offset-8" : "text-foreground-secondary")}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ChannelTalkButton
            cta="header_chat"
            className="hidden h-10 items-center rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-accent px-4 md:inline-flex text-[15px] font-bold text-accent-foreground shadow-[3px_3px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-accent-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            채팅 상담
          </ChannelTalkButton>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-white text-foreground transition-colors hover:bg-[#fff3b0] md:hidden"
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
            className="overflow-hidden border-t-[3px] border-[#1d1d1f] bg-[#fffdf8] md:hidden"
            initial={reduce ? { opacity: 0 } : { height: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <ul className="mx-auto w-full max-w-[1248px] px-4 py-2" role="list">
              {navItems.map(({ href, label }) => (
                <li key={href} className="border-b border-border last:border-b-0">
                  <Link href={href} onClick={() => setMenuOpen(false)} className="flex h-12 items-center text-[17px] font-bold text-foreground">
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
