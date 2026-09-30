"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { profile } from "@/data/profile";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";

// 메뉴는 첫 화면의 섹션과 무료 도구 페이지로 이동한다
const navItems = [
  { href: "/#works", label: "제작 사례" },
  { href: "/#history", label: "작업 이력" },
  { href: "/tools", label: "무료 도구" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

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
        isScrolled ? "border-border" : "border-transparent"
      )}
    >
      <nav
        className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-4 px-4 md:px-6"
        aria-label="메인 네비게이션"
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
        </div>
      </nav>
    </header>
  );
}
