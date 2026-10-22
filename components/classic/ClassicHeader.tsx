"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { LookLink, LookToggle } from "@/components/layout/LookToggle";
import { industries } from "@/data/classic/industries";
import { cn } from "@/lib/utils";

// 클래식 보기(/classic)의 머리글. 회사 홈페이지에서 흔히 쓰는 꼭대기 유틸 줄 + 내림 메뉴 구성.
// 전화·카톡 창구는 없어서 유틸 줄에는 운영 중인 채널만 둔다.

// match는 그 메뉴를 켜는 주소. 한 주소가 두 메뉴를 켜지 않게 겹치지 않게 둔다.
export const classicMenu = [
  {
    label: "서비스",
    href: "/classic/landing",
    match: ["/classic/landing", "/classic/maintenance", "/classic/program"],
    items: [
      { href: "/classic/landing", label: "광고 랜딩페이지" },
      { href: "/classic/pricing#homepage", label: "홈페이지 제작" },
      { href: "/classic/maintenance", label: "유지보수" },
      { href: "/classic/program", label: "업무 프로그램" },
    ],
  },
  {
    label: "샘플",
    href: "/classic/works",
    match: ["/classic/works", "/classic/sample"],
    items: [{ href: "/classic/works", label: "전체 샘플" }, ...industries.map((i) => ({ href: `/classic/works/${i.slug}`, label: i.label }))],
  },
  { label: "가격", href: "/classic/pricing", match: ["/classic/pricing"], items: [] },
  {
    label: "고객지원",
    href: "/classic/faq",
    match: ["/classic/faq", "/classic/guide", "/classic/tools", "/classic/privacy", "/classic/contact"],
    items: [
      { href: "/classic/faq", label: "자주 묻는 질문" },
      { href: "/classic/guide", label: "가이드" },
      { href: "/classic/tools", label: "자료실" },
      { href: "/classic/contact", label: "상담 신청" },
    ],
  },
];

const channels = [
  { href: "https://blog.naver.com/gompartner", label: "네이버 블로그" },
  { href: "https://gompartner.tistory.com", label: "티스토리" },
  { href: "https://www.youtube.com/@gompartner", label: "유튜브" },
  { href: "https://www.instagram.com/gompartner.co.kr", label: "인스타그램" },
];

const toggle = "inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d9dee5] bg-white text-[#15171c] transition-colors hover:bg-[#eef1f5]";

export function ClassicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // 터치 기기는 hover가 없어서, 하위 메뉴가 있는 메뉴는 첫 탭에 내림 메뉴를 열고 두 번째 탭에 이동한다
  const [drop, setDrop] = useState<string | null>(null);
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) {
    setPrev(pathname);
    setOpen(false);
    setDrop(null);
  }
  // 메뉴를 눌러 이동한 뒤 초점이 메뉴에 남아 내림 메뉴가 열려 있지 않게 푼다
  useEffect(() => {
    const el = document.activeElement;
    if (el instanceof HTMLElement && el.closest("header")) el.blur();
  }, [pathname]);
  useEffect(() => {
    if (!drop) return;
    const close = (e: PointerEvent) => {
      if (!(e.target instanceof Element && e.target.closest("[data-drop]"))) setDrop(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [drop]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      <div className="hidden border-b border-[#e6e9ee] bg-[#f6f7f9] md:block">
        <ul className="mx-auto flex h-9 w-full max-w-[1248px] items-center justify-end gap-5 px-6 text-[13px] text-[#5b6370]" role="list">
          {channels.map((c) => (
            <li key={c.href}>
              <a href={c.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#15171c]">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-[#e6e9ee]">
        <nav aria-label="주 메뉴" className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-6 px-4 md:h-[76px] md:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-[21px] font-extrabold tracking-[-0.04em] text-[#15171c]">
            <Image src="/images/bear-avatar.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            곰파트너
          </Link>

          <ul className="hidden h-full items-stretch lg:flex" role="list">
            {classicMenu.map((m) => {
              const active = m.match.some((p) => pathname === p || pathname.startsWith(p + "/"));
              return (
                <li key={m.label} data-drop className="group relative flex">
                  <Link
                    href={m.href}
                    onClick={(e) => {
                      if (m.items.length === 0 || drop === m.label || !window.matchMedia("(hover: none)").matches) return;
                      e.preventDefault();
                      setDrop(m.label);
                    }}
                    aria-expanded={m.items.length > 0 ? drop === m.label : undefined}
                    className={cn(
                      "flex items-center gap-1 px-6 text-[17px] font-bold tracking-[-0.02em] transition-colors hover:text-[#256ef4]",
                      active ? "text-[#256ef4]" : "text-[#15171c]"
                    )}
                  >
                    {m.label}
                    {m.items.length > 0 && <ChevronDown size={15} strokeWidth={2.5} aria-hidden className="text-[#8a929e]" />}
                  </Link>
                  {m.items.length > 0 && (
                    <div
                      className={cn(
                        "absolute left-1/2 top-full -translate-x-1/2 pt-px transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-has-[:focus-visible]:visible group-has-[:focus-visible]:opacity-100",
                        drop === m.label ? "visible opacity-100" : "invisible opacity-0"
                      )}
                    >
                      <ul className="min-w-[200px] border border-[#e6e9ee] border-t-2 border-t-[#256ef4] bg-white py-2 shadow-[0_12px_24px_rgba(21,23,28,.08)]" role="list">
                        {m.items.map((i) => (
                          <li key={i.label}>
                            <Link href={i.href} className="block px-5 py-2.5 text-[15px] text-[#3d4450] hover:bg-[#f2f6fe] hover:text-[#256ef4]">
                              {i.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
            <li className="flex">
              <LookLink to="webtoon" cta="menu_webtoon" className="flex items-center px-6 text-[17px] font-bold tracking-[-0.02em] text-[#15171c] transition-colors hover:text-[#256ef4]">
                곰파트너 이야기
              </LookLink>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <LookToggle className={toggle} />
            <ChannelTalkButton
              cta="classic_header_chat"
              className="hidden h-10 items-center rounded-md bg-[#256ef4] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#0b50d0] md:inline-flex"
            >
              채팅 상담
            </ChannelTalkButton>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="classic-menu"
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              className={cn(toggle, "lg:hidden")}
            >
              {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div id="classic-menu" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-white px-4 pb-10 md:top-[113px] lg:hidden">
          {classicMenu.map((m) => (
            <section key={m.label} className="border-b border-[#e6e9ee] py-4">
              <Link href={m.href} className="text-[18px] font-extrabold tracking-[-0.02em] text-[#15171c]">
                {m.label}
              </Link>
              {m.items.length > 0 && (
                <ul className="mt-2 grid grid-cols-2 gap-x-4" role="list">
                  {m.items.map((i) => (
                    <li key={i.label}>
                      <Link href={i.href} className="block py-2 text-[15px] text-[#3d4450]">
                        {i.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section className="border-b border-[#e6e9ee] py-4">
            <LookLink to="webtoon" cta="menu_webtoon" onClick={() => setOpen(false)} className="text-[18px] font-extrabold tracking-[-0.02em] text-[#15171c]">
              곰파트너 이야기
            </LookLink>
          </section>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[14px] text-[#5b6370]" role="list">
            {channels.map((c) => (
              <li key={c.href}>
                <a href={c.href} target="_blank" rel="noopener noreferrer">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
