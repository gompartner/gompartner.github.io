"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { cases } from "@/data/classic/cases";
import { industries } from "@/data/classic/industries";
import { cn } from "@/lib/utils";

// 클래식 보기(/classic)의 머리글. 로고와 내림 메뉴만 둔다(10-30 채널 줄과 웹툰 전환 버튼 뺌).

// match는 그 메뉴를 켜는 주소. 한 주소가 두 메뉴를 켜지 않게 겹치지 않게 둔다.
export const classicMenu = [
  {
    label: "회사소개",
    href: "/classic/story",
    match: ["/classic/story"],
    items: [],
  },
  {
    label: "제작",
    href: "/classic/homepage",
    match: ["/classic/homepage", "/classic/landing", "/classic/program", "/classic/app", "/classic/kiosk"],
    // 11-01 랜딩, 업무 프로그램은 제작 안에 둔다(10-29 사용자 결정)
    items: [
      { href: "/classic/homepage", label: "홈페이지 제작" },
      { href: "/classic/landing", label: "랜딩페이지 제작" },
      { href: "/classic/program", label: "업무 프로그램 제작" },
      { href: "/classic/app", label: "앱 제작" },
      { href: "/classic/kiosk", label: "키오스크 화면 제작" },
    ],
  },
  {
    label: "유지보수",
    href: "/classic/maintenance",
    match: ["/classic/maintenance"],
    items: [
      { href: "/classic/maintenance/fix", label: "오류 수정" },
      { href: "/classic/maintenance/takeover", label: "업체 이관" },
      { href: "/classic/maintenance/update", label: "보안 업데이트" },
      { href: "/classic/maintenance/monthly", label: "월 관리" },
    ],
  },
  // 업종(병원, 카페 등)은 카탈로그 화면 안의 탭에서 고른다. 카탈로그는 업종 홈페이지와 랜딩(11-01 되살림)
  {
    label: "카탈로그",
    href: "/classic/works",
    match: ["/classic/works", "/classic/sample"],
    // 11-01 카탈로그 탭과 같은 하위 메뉴(업종 5개, 랜딩, 앱, 키오스크)
    items: [
      { href: "/classic/works", label: "전체" },
      ...industries.map((i) => ({ href: `/classic/works/${i.slug}`, label: i.label })),
      { href: "/classic/works/landing", label: "랜딩페이지" },
      { href: "/classic/works/app", label: "앱" },
      { href: "/classic/works/kiosk", label: "키오스크" },
    ],
  },
  // 고객 사례는 실제 사례가 생기면 data/classic/cases.ts에 넣는 순간 메뉴에 나온다
  ...(cases.length > 0 ? [{ label: "고객 사례", href: "/classic/cases", match: ["/classic/cases"], items: [] }] : []),
  {
    label: "고객지원",
    href: "/classic/faq",
    match: ["/classic/notice", "/classic/faq", "/classic/contact", "/classic/privacy"],
    items: [
      { href: "/classic/notice", label: "공지사항" },
      { href: "/classic/faq", label: "자주 묻는 질문" },
      { href: "/classic/contact", label: "상담 신청" },
    ],
  },
];


const maxItems = Math.max(...classicMenu.map((m) => m.items.length));

const toggle = "inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#d9dee5] bg-white text-[#15171c] transition-colors hover:bg-[#eef1f5]";

export function ClassicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // 손가락이나 펜으로 누르면 hover가 없으니, 하위 메뉴가 있는 메뉴는 첫 탭에 전체 메뉴를 열고 두 번째 탭에 이동한다.
  // 아이패드는 데스크톱 모드나 트랙패드에서 (hover: none)이 거짓으로 나와서, 미디어 쿼리 대신 실제로 누른 입력 종류를 본다
  const [all, setAll] = useState(false);
  const pointer = useRef("mouse");
  // 키보드로 메뉴 안에 들어오면 하위 항목을 연다(초점이 메뉴 밖으로 나가거나 Esc를 누르면 닫는다)
  const [kb, setKb] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const escaped = useRef(false);
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) {
    setPrev(pathname);
    setOpen(false);
    setAll(false);
    setKb(false);
  }
  // 메뉴를 눌러 이동한 뒤 초점이 메뉴에 남아 내림 메뉴가 열려 있지 않게 푼다
  useEffect(() => {
    const el = document.activeElement;
    if (el instanceof HTMLElement && el.closest("header")) el.blur();
  }, [pathname]);
  useEffect(() => {
    if (!all) return;
    const close = (e: PointerEvent) => {
      if (!(e.target instanceof Element && e.target.closest("[data-drop]"))) setAll(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAll(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [all]);
  // 휴대폰 메뉴: 열면 첫 항목으로 초점, Tab은 메뉴 버튼과 메뉴 안에서만 돌고, Esc는 닫고 메뉴 버튼으로 돌아간다
  useEffect(() => {
    if (!open) return;
    const links = () => [menuBtn.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href]") ?? [])].filter((el): el is HTMLElement => !!el);
    links()[1]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        menuBtn.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const list = links();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : i < 0 || i === list.length - 1 ? 0 : i + 1;
      e.preventDefault();
      list[next]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      <div className="border-b border-[#e6e9ee]">
        <nav aria-label="주 메뉴" className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-6 px-4 md:h-[76px] md:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-[21px] font-[800] tracking-[-0.04em] text-[#15171c]">
            곰파트너
          </Link>

          {/* 메뉴 하나에 올리거나(터치는 한 번 누르면) 모든 메뉴의 하위 항목을 한 판에 펼친다. 항목은 한 줄 고정이라 판 높이를 줄 수로 계산한다 */}
          <div
            data-drop
            className="group/nav hidden h-full lg:block"
            onFocus={(e) => {
              if (escaped.current) escaped.current = false;
              else if (e.target.matches(":focus-visible")) setKb(true);
            }}
            onBlur={(e) => {
              if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) setKb(false);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Escape" || !(kb || all)) return;
              setKb(false);
              setAll(false);
              // 하위 항목에서 닫으면 그 메뉴 이름으로 초점을 옮긴다
              const top = (e.target as HTMLElement).closest("li[data-top]")?.querySelector<HTMLElement>("a");
              if (top && top !== e.target) {
                escaped.current = true;
                top.focus();
              }
            }}
          >
            <ul className="flex h-full items-stretch" role="list">
              {classicMenu.map((m) => {
                const active = m.match.some((p) => pathname === p || pathname.startsWith(p + "/"));
                return (
                  <li key={m.label} data-top className="relative flex w-[128px] justify-center xl:w-[150px]">
                    <Link
                      href={m.href}
                      onPointerDown={(e) => {
                        pointer.current = e.pointerType;
                      }}
                      onClick={(e) => {
                        if (m.items.length === 0 || all || pointer.current === "mouse") return;
                        e.preventDefault();
                        setAll(true);
                      }}
                      aria-expanded={m.items.length > 0 ? all || kb : undefined}
                      aria-current={pathname === m.href ? "page" : active ? "true" : undefined}
                      className={cn("flex items-center gap-1 text-[17px] font-bold tracking-[-0.02em] transition-colors hover:text-[#256ef4]", active ? "text-[#256ef4]" : "text-[#15171c]")}
                    >
                      {m.label}
                      {m.items.length > 0 && <ChevronDown size={15} strokeWidth={2.5} aria-hidden className="text-[#6b7280]" />}
                    </Link>
                    {m.items.length > 0 && (
                      <ul
                        role="list"
                        className={cn(
                          "absolute left-0 top-full z-10 w-full py-5 text-center transition-opacity duration-150 group-hover/nav:visible group-hover/nav:opacity-100",
                          all || kb ? "visible opacity-100" : "invisible opacity-0"
                        )}
                      >
                        {m.items.map((i) => (
                          <li key={i.label}>
                            <Link href={i.href} aria-current={pathname === i.href ? "page" : undefined} className="flex h-11 items-center justify-center whitespace-nowrap text-[15px] text-[#3d4450] hover:text-[#256ef4] hover:underline underline-offset-4">
                              {i.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <div
              aria-hidden
              style={{ height: maxItems * 44 + 40 }}
              className={cn(
                "fixed inset-x-0 top-[77px] border-y border-[#e6e9ee] bg-white shadow-[0_12px_24px_rgba(21,23,28,.08)] transition-opacity duration-150 group-hover/nav:visible group-hover/nav:opacity-100",
                all || kb ? "visible opacity-100" : "invisible opacity-0"
              )}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* 11-01 통합검색 */}
            <Link
              href="/classic/search"
              aria-label="통합검색"
              aria-current={pathname === "/classic/search" ? "page" : undefined}
              className="grid h-11 w-11 place-items-center rounded-md text-[#15171c] transition-colors hover:bg-[#f1f3f6]"
            >
              <Search size={21} aria-hidden />
            </Link>
            {/* 휴대폰과 태블릿은 작게, PC는 크게. 같은 버튼 하나를 폭에 따라 줄인다 */}
            <Link
              href="/classic/contact"
              data-gtm-cta="classic_header_contact"
              aria-current={pathname === "/classic/contact" ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center whitespace-nowrap rounded-md px-3.5 text-[15px] font-bold transition-colors lg:px-5 lg:text-[16px]",
                pathname === "/classic/contact" ? "bg-[#0b50d0] text-white" : "bg-[#256ef4] text-white hover:bg-[#0b50d0]"
              )}
            >
              상담 신청
            </Link>
            <button
              ref={menuBtn}
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
        <div id="classic-menu" ref={panel} className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-white px-4 pb-10 md:top-[77px] lg:hidden">
          {classicMenu.map((m) => (
            <section key={m.label} className="border-b border-[#e6e9ee] py-4">
              <Link href={m.href} aria-current={pathname === m.href ? "page" : undefined} className="text-[18px] font-[800] tracking-[-0.02em] text-[#15171c]">
                {m.label}
              </Link>
              {m.items.length > 0 && (
                <ul className="mt-2 grid grid-cols-2 gap-x-4" role="list">
                  {m.items.map((i) => (
                    <li key={i.label}>
                      <Link href={i.href} aria-current={pathname === i.href ? "page" : undefined} className="block py-2 text-[15px] text-[#3d4450]">
                        {i.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <Link href="/classic/contact" className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#256ef4] text-[16px] font-bold text-white">
            상담 신청
          </Link>
        </div>
      )}
    </header>
  );
}
